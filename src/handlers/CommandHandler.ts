import {
	REST,
	Routes,
	SlashCommandBuilder,
	ContextMenuCommandBuilder,
} from "discord.js";
import type { ExtendedClient } from "../config/Client.js";
import type { Command } from "../types/Command.js";
import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import chalk from "chalk";

const isSlashCommandBuilder = (data: unknown): data is SlashCommandBuilder => {
	return data instanceof SlashCommandBuilder;
};

const isContextMenuCommandBuilder = (
	data: unknown,
): data is ContextMenuCommandBuilder => {
	return data instanceof ContextMenuCommandBuilder;
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

type CommandModule = Command;

export const commandHandler = async (client: ExtendedClient): Promise<void> => {
	const commandArray: unknown[] = [];
	const folders = await fs.readdir(path.join(__dirname, "../commands"));
	for (const folder of folders) {
		const files = (
			await fs.readdir(path.join(__dirname, `../commands/${folder}`))
		).filter((f) => f.endsWith(".ts") || f.endsWith(".js"));
		for (const f of files) {
			const { default: command } = (await import(
				path.join(__dirname, `../commands/${folder}/${f}`)
			)) as { default: CommandModule };
			if (!command.data || !command.execute) {
				console.warn(chalk.yellow(`[Commands]: Skipped ${f}`));
				continue;
			}

			client.commands.set(
				isSlashCommandBuilder(command.data) ||
					isContextMenuCommandBuilder(command.data)
					? command.data.name
					: JSON.stringify(command.data),
				command,
			);

			if (
				isSlashCommandBuilder(command.data) ||
				isContextMenuCommandBuilder(command.data)
			) {
				commandArray.push(command.data.toJSON());
			} else {
				commandArray.push(command.data);
			}

			console.log(
				chalk.green(
					`[Commands]: Loaded ${(command.data as any).name} command.`,
				),
			);
		}
	}

	const clientId = process.env.CLIENT_ID;
	const token = process.env.CLIENT_TOKEN;
	if (!clientId || !token) {
		console.error(
			chalk.red("[Commands]: CLIENT_ID or CLIENT_TOKEN missing in .env"),
		);
		return;
	}

	const rest = new REST({ version: "10" }).setToken(token);
	console.log(
		chalk.cyan("[Commands]: Refreshing application (/) commands..."),
	);
	await rest.put(Routes.applicationCommands(clientId), {
		body: commandArray,
	});
	console.log(
		chalk.cyan(
			"[Commands]: Successfully reloaded application (/) commands.",
		),
	);
};
