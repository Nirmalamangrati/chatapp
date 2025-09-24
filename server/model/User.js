import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: String,
  password: String,
  profilePic: String,
});

export default mongoose.model("User", userSchema);
