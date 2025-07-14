import { client } from "./Client.js";
import { config } from "dotenv";
import chalk from "chalk";

config();

export const botLogin = async (): Promise<void> => {
	console.log("Logging in...");

	try {
		await client.login(process.env.CLIENT_TOKEN as string);
		console.log(chalk.yellowBright("App logged in successfully."));
	} catch (error) {
		console.error("Failed to log in:", error);
	}
};
