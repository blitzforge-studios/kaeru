import { ActivityType, PresenceUpdateStatus } from "discord.js";

/**
 * Bot is presence.
 */
export const botPresence = {
    status: PresenceUpdateStatus.Idle,
    activities: [
        {
            name: "Pro-features",
            type: ActivityType.Watching,
            state: "Serving free pro features for your community.",
        },
    ],
};
