import mongoose from "mongoose";
import type { ExtendedClient } from "../../config/index.js";

export default {
	name: "mongoConnect",
	once: true,
	async execute(client: ExtendedClient): Promise<void> {
		const mongoURI = process.env.MONGO_URI;
		if (!mongoURI) {
			console.error("❌ MONGO_URI is missing in the .env file!");
			process.exit(1);
		}

		try {
			await mongoose.connect(mongoURI);
			console.log("✅ Connected to MongoDB!");
		} catch (error) {
			console.error("❌ MongoDB Connection Error:", error);
			process.exit(1);
		}

		mongoose.connection.on("connected", () =>
			console.log("🟢 Mongoose is connected."),
		);
		mongoose.connection.on("disconnected", () =>
			console.warn("🟡 Mongoose is disconnected."),
		);
		mongoose.connection.on("error", (err) =>
			console.error("🔴 Mongoose connection error:", err),
		);
		mongoose.connection.on("reconnected", () =>
			console.log("🟢 Mongoose has reconnected."),
		);
		mongoose.connection.on("close", () =>
			console.log("⚪ Mongoose connection closed."),
		);
	},
};
