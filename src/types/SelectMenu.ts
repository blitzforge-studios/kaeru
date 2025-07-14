import { StringSelectMenuInteraction } from "discord.js";
import type { ExtendedClient } from "../config/Client.js";

export interface SelectMenu {
	id: string;

	execute: (opts: {
		interaction: StringSelectMenuInteraction;
		client: ExtendedClient;
	}) => Promise<void>;
}
