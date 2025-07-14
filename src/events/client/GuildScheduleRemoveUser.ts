// src/events/guild/guildScheduledEventUserAdd.ts
import { Events, GuildScheduledEvent, GuildMember, User } from "discord.js";
import type { ExtendedClient } from "../../config/index.js";

export default {
	name: Events.GuildScheduledEventUserRemove,
	once: false,
	async execute(
		client: ExtendedClient,
		guildScheduledEvent: GuildScheduledEvent,
		user: GuildMember | User,
	): Promise<void> {},
};
