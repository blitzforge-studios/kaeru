import { ActivityType, PresenceUpdateStatus } from "discord.js";

/**
 * Bot is presence.
 */
export const botPresence = {
    status: PresenceUpdateStatus.Idle,
    activities: [
        {
            name: "Pro & A.I. features for free",
            type: ActivityType.Watching,
            state: "Serving free pro features for your community.",
        },
    ],
};
