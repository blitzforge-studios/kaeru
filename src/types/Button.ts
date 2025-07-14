import { ButtonInteraction } from "discord.js";
import type { ExtendedClient } from "../config/Client.js";

export interface Button {
	id: string;
	
	execute: (opts: {
		interaction: ButtonInteraction;
		client: ExtendedClient;
	}) => Promise<void>;
}
