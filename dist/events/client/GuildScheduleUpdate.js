import { Events } from "discord.js";
export default {
    name: Events.GuildScheduledEventUpdate,
    once: false,
    async execute(client, oldEvent, newEvent) {
        if (!newEvent.guild)
            return;
        if (newEvent.guild.client.user.id === process.env.CLIENT_ID)
            return;
    },
};
