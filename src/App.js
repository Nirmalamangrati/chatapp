import React, { useState, useEffect } from "react";
import io from "socket.io-client";
import axios from "axios";
import "./App.css";

const socket = io("http://localhost:8000");

function App() {
  const [chat, setChat] = useState([]);
  const [message, setMessage] = useState("");
  const [username, setUsername] = useState("User1"); // logged-in user
  const [receiver, setReceiver] = useState("User2"); // default friend
  const [friends, setFriends] = useState([]);
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    axios
      .get("http://localhost:8000/users")
      .then((res) => setFriends(res.data));
  }, []);

  useEffect(() => {
    if (receiver) {
      axios
        .get(`http://localhost:8000/chats/${username}/${receiver}`)
        .then((res) => setChat(res.data));
    }
  }, [receiver]);

  useEffect(() => {
    socket.on("receive_message", (data) => {
      if (
        (data.sender === username && data.receiver === receiver) ||
        (data.sender === receiver && data.receiver === username)
      ) {
        setChat((prev) => [...prev, data]);
      }
    });

    socket.on("message_edited", (data) => {
      setChat((prev) =>
        prev.map((c) =>
          c._id === data.id ? { ...c, message: data.message } : c
        )
      );
    });

    socket.on("message_deleted", (id) => {
      setChat((prev) => prev.filter((c) => c._id !== id));
    });

    return () => {
      socket.off("receive_message");
      socket.off("message_edited");
      socket.off("message_deleted");
    };
  }, [username, receiver]);

  const sendMessage = () => {
    if (message.trim()) {
      if (editId) {
        socket.emit("edit_message", { id: editId, message });
        setEditId(null);
      } else {
        socket.emit("send_message", { sender: username, receiver, message });
      }
      setMessage("");
    }
  };

  const handleDelete = (id) => socket.emit("delete_message", id);
  const handleCopy = (msg) => navigator.clipboard.writeText(msg);
  const handleForward = (msg) => {
    const fwd = prompt("Forward to (username)?");
    if (fwd)
      socket.emit("send_message", {
        sender: username,
        receiver: fwd,
        message: msg,
      });
  };

  return (
    <div className="chat-container">
      {/* Sidebar */}
      <div className="sidebar">
        <h3>Friends</h3>
        {friends.map((f) => (
          <p key={f._id} onClick={() => setReceiver(f.username)}>
            {f.username}
          </p>
        ))}
      </div>

      {/* Chat window */}
      <div className="chat-box">
        <div className="chat-header">
          Chat with <b>{receiver}</b>
        </div>
        <div className="chat-messages">
          {chat.map((c) => (
            <div
              key={c._id}
              className={c.sender === username ? "my-message" : "their-message"}
            >
              <p>{c.message}</p>
              <span>{new Date(c.timestamp).toLocaleTimeString()}</span>
              <div className="menu">
                <span>⋮</span>
                <div className="dropdown">
                  <button
                    onClick={() => {
                      setEditId(c._id);
                      setMessage(c.message);
                    }}
                  >
                    Edit
                  </button>
                  <button onClick={() => handleDelete(c._id)}>Delete</button>
                  <button onClick={() => handleCopy(c.message)}>Copy</button>
                  <button onClick={() => handleForward(c.message)}>
                    Forward
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="chat-input">
          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type message..."
          />
          <button onClick={sendMessage}>{editId ? "Update" : "Send"}</button>
        </div>
      </div>
    </div>
  );
}

export default App;
