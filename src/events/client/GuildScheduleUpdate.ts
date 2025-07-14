import { Events, GuildScheduledEvent } from "discord.js";
import type { ExtendedClient } from "../../config/index.js";

export default {
	name: Events.GuildScheduledEventUpdate,
	once: false,
	async execute(
		client: ExtendedClient,
		oldEvent: GuildScheduledEvent,
		newEvent: GuildScheduledEvent,
	): Promise<void> {
		if (!newEvent.guild) return;

		if (newEvent.guild.client.user.id === process.env.CLIENT_ID) return;
	},
};
