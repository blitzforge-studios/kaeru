import mongoose from "mongoose";
const guildSchema = new mongoose.Schema({
    guildId: { type: String, required: true, unique: true },
    staffRoleId: { type: String, default: null },
    loggingChannelId: { type: String, default: null },
    warnings: { type: Map, of: Number, default: {} },
});
const Guild = mongoose.model("Guild", guildSchema);
export async function saveStaffRoleId(guildId, roleId) {
    await Guild.findOneAndUpdate({ guildId }, { staffRoleId: roleId }, { upsert: true });
}
export async function getStaffRoleId(guildId) {
    const guild = await Guild.findOne({ guildId });
    return guild?.staffRoleId ?? null;
}
export async function addWarning(guildId, userId) {
    const update = { $inc: {} };
    update.$inc = { [`warnings.${userId}`]: 1 };
    const guild = await Guild.findOneAndUpdate({ guildId }, update, {
        upsert: true,
        new: true,
    });
    return guild.warnings.get(userId) ?? 0;
}
export async function checkWarnings(guildId, userId) {
    try {
        const guild = await Guild.findOne({ guildId });
        return guild?.warnings.get(userId) ?? 0;
    }
    catch {
        return 0;
    }
}
export async function setupLoggingChannel(guildId, channelId) {
    await Guild.findOneAndUpdate({ guildId }, { loggingChannelId: channelId }, { upsert: true });
}
export async function checkLoggingChannel(guildId) {
    const guild = await Guild.findOne({ guildId });
    return guild?.loggingChannelId ?? null;
}
