import { ModalSubmitInteraction } from "discord.js";
import type { ExtendedClient } from "../config/Client.js";

export interface Modal {
	id: string;

	execute: (opts: {
		interaction: ModalSubmitInteraction;
		client: ExtendedClient;
	}) => Promise<void>;
}
