import mongoose from "mongoose";

const guildSchema = new mongoose.Schema({
    guildId: { type: String, required: true, unique: true },
    staffRoleId: { type: String, default: null },
    loggingChannelId: { type: String, default: null },
    warnings: { type: Map, of: Number, default: {} },
});

const Guild = mongoose.model("Guild", guildSchema);

// Staff Role
export async function saveStaffRoleId(guildId, roleId) {
    await Guild.findOneAndUpdate(
        { guildId },
        { staffRoleId: roleId },
        { upsert: true }
    );
}

export async function getStaffRoleId(guildId) {
    const guild = await Guild.findOne({ guildId });
    return guild?.staffRoleId || null;
}

// Warning System
export async function addWarning(guildId, userId) {
    const update = { $inc: {} };
    update.$inc[`warnings.${userId}`] = 1;

    const guild = await Guild.findOneAndUpdate({ guildId }, update, {
        upsert: true,
        new: true,
    });

    return guild.warnings[userId] || 0;
}

export async function checkWarnings(guildId, userId) {
    try {
        const guild = await Guild.findOne({ guildId });
        if (!guild || !guild.warnings) return 0;
        return guild.warnings.get(userId) || 0;
    } catch (error) {
        console.error("Error checking warnings:", error);
        return 0;
    }
}

// Logging Channel
export async function setupLoggingChannel(guildId, channelId) {
    await Guild.findOneAndUpdate(
        { guildId },
        { loggingChannelId: channelId },
        { upsert: true }
    );
}

export async function checkLoggingChannel(guildId) {
    const guild = await Guild.findOne({ guildId });
    return guild?.loggingChannelId || null;
}
