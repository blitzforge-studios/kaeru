// src/events/guild/guildScheduledEventUserAdd.ts
import { Events } from "discord.js";
export default {
    name: Events.GuildScheduledEventUserAdd,
    once: false,
    async execute(client, guildScheduledEvent, user) { },
};
