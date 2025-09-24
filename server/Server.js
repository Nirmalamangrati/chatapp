import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import mongoose from "mongoose";
import cors from "cors";
import Chat from "./model/Chat.js";
import User from "./model/User.js";

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect("mongodb://127.0.0.1:27017/fbchat");

// Get all chats between 2 users
app.get("/chats/:user1/:user2", async (req, res) => {
  const { user1, user2 } = req.params;
  const chats = await Chat.find({
    $or: [
      { sender: user1, receiver: user2 },
      { sender: user2, receiver: user1 },
    ],
  }).sort({ timestamp: 1 });
  res.json(chats);
});

// Get all users (friend list)
app.get("/users", async (req, res) => {
  const users = await User.find();
  res.json(users);
});

const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("🔗 User connected:", socket.id);

  socket.on("send_message", async (data) => {
    const newChat = new Chat(data);
    await newChat.save();
    io.emit("receive_message", data);
  });

  socket.on("edit_message", async (data) => {
    await Chat.findByIdAndUpdate(data.id, { message: data.message });
    io.emit("message_edited", data);
  });

  socket.on("delete_message", async (id) => {
    await Chat.findByIdAndDelete(id);
    io.emit("message_deleted", id);
  });
});

server.listen(8000, () => console.log("🚀 Server running on 8000"));
