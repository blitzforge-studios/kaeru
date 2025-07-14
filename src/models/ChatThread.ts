import mongoose, { Document, Schema, Model } from "mongoose";

export interface MessageEntry {
	role: "user" | "model";
	content: string;
	timestamp?: Date;
}

export interface IChatThread extends Document {
	threadId: string;
	messages: MessageEntry[];
	createdAt: Date;
	updatedAt: Date;
}

const messageSchema = new Schema<MessageEntry>(
	{
		role: { type: String, enum: ["user", "model"], required: true },
		content: { type: String, required: true },
		timestamp: { type: Date, default: Date.now },
	},
	{ _id: false },
);

const chatThreadSchema = new Schema<IChatThread>(
	{
		threadId: { type: String, required: true, unique: true },
		messages: { type: [messageSchema], default: [] },
	},
	{
		timestamps: true,
	},
);

chatThreadSchema.index({ updatedAt: 1 }, { expireAfterSeconds: 3600 });

chatThreadSchema.pre<IChatThread>("save", function (next) {
	this.updatedAt = new Date();
	next();
});

const ChatThread: Model<IChatThread> = mongoose.model<IChatThread>(
	"ChatThread",
	chatThreadSchema,
);

export default ChatThread;
