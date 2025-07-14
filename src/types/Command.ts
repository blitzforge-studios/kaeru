import {
	SlashCommandBuilder,
	ContextMenuCommandBuilder,
	ChatInputCommandInteraction,
	ContextMenuCommandInteraction,
	AutocompleteInteraction,
} from "discord.js";
import type { ExtendedClient } from "../config/Client.js";

export interface Command {
	data: SlashCommandBuilder | ContextMenuCommandBuilder;

	execute: (opts: {
		interaction:
			| ChatInputCommandInteraction
			| ContextMenuCommandInteraction;
		client: ExtendedClient;
	}) => Promise<void>;

	autocomplete?: (opts: {
		interaction: AutocompleteInteraction;
		client: ExtendedClient;
	}) => Promise<void>;
}
