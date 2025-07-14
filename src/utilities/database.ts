import mongoose, { Document, Model } from "mongoose";

interface IGuild extends Document {
	guildId: string;
	staffRoleId: string | null;
	loggingChannelId: string | null;
	warnings: Map<string, number>;
}

const guildSchema = new mongoose.Schema<IGuild>({
	guildId: { type: String, required: true, unique: true },
	staffRoleId: { type: String, default: null },
	loggingChannelId: { type: String, default: null },
	warnings: { type: Map, of: Number, default: {} },
});

const Guild: Model<IGuild> = mongoose.model<IGuild>("Guild", guildSchema);

export async function saveStaffRoleId(
	guildId: string,
	roleId: string,
): Promise<void> {
	await Guild.findOneAndUpdate(
		{ guildId },
		{ staffRoleId: roleId },
		{ upsert: true },
	);
}

export async function getStaffRoleId(guildId: string): Promise<string | null> {
	const guild = await Guild.findOne({ guildId });
	return guild?.staffRoleId ?? null;
}

export async function addWarning(
	guildId: string,
	userId: string,
): Promise<number> {
	const update: Record<string, any> = { $inc: {} };
	update.$inc = { [`warnings.${userId}`]: 1 };
	const guild = await Guild.findOneAndUpdate({ guildId }, update, {
		upsert: true,
		new: true,
	});
	return guild.warnings.get(userId) ?? 0;
}

export async function checkWarnings(
	guildId: string,
	userId: string,
): Promise<number> {
	try {
		const guild = await Guild.findOne({ guildId });
		return guild?.warnings.get(userId) ?? 0;
	} catch {
		return 0;
	}
}

export async function setupLoggingChannel(
	guildId: string,
	channelId: string,
): Promise<void> {
	await Guild.findOneAndUpdate(
		{ guildId },
		{ loggingChannelId: channelId },
		{ upsert: true },
	);
}

export async function checkLoggingChannel(
	guildId: string,
): Promise<string | null> {
	const guild = await Guild.findOne({ guildId });
	return guild?.loggingChannelId ?? null;
}
