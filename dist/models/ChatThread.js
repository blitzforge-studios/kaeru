import mongoose, { Schema } from "mongoose";
const messageSchema = new Schema({
    role: { type: String, enum: ["user", "model"], required: true },
    content: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
}, { _id: false });
const chatThreadSchema = new Schema({
    threadId: { type: String, required: true, unique: true },
    messages: { type: [messageSchema], default: [] },
}, {
    timestamps: true,
});
chatThreadSchema.index({ updatedAt: 1 }, { expireAfterSeconds: 3600 });
chatThreadSchema.pre("save", function (next) {
    this.updatedAt = new Date();
    next();
});
const ChatThread = mongoose.model("ChatThread", chatThreadSchema);
export default ChatThread;
