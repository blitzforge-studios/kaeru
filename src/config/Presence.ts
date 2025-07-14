import type { ActivityOptions, PresenceData } from "discord.js";
import { ActivityType, PresenceUpdateStatus } from "discord.js";

export const botPresence: PresenceData = {
    status: PresenceUpdateStatus.Idle,
    activities: [
        {
            name: "Pro & A.I. features for free",
            type: ActivityType.Watching,
            state: "Serving free pro features for your community.",
            url: "https://Neodevils.github.io/projects/kaeru",
        } as ActivityOptions,
    ],
};
