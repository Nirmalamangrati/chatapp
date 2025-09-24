import mongoose from "mongoose";

const chatSchema = new mongoose.Schema({
  sender: String,
  receiver: String,
  message: String,
  timestamp: { type: Date, default: Date.now },
});

export default mongoose.model("Chat", chatSchema);
