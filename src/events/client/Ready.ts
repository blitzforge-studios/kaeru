import { Events } from "discord.js";
import chalk from "chalk";
import { botPresence } from "../../config/index.js";
import type { ExtendedClient } from "../../config/index.js";

export default {
	name: Events.ClientReady,
	once: true,
	async execute(client: ExtendedClient): Promise<void> {
		client.user?.setPresence(botPresence);
		console.log(chalk.green(`[READY] Logged in as ${client.user?.tag}!`));

		client.emit("mongoConnect");
	},
};
