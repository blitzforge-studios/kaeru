import {
    REST,
    Routes,
    SlashCommandBuilder,
    ContextMenuCommandBuilder,
} from "discord.js";
import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import chalk from "chalk";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Loads and registers all the slash and context menu commands for the bot.
 *
 * This function reads all the command files in the "commands" folder, imports them,
 * and adds them to the client's command list. It then pushes the commands to the
 * Discord API to update the application (/) commands.
 *
 * Call this function to ensure all commands are properly loaded and registered.
 *
 * @param {Client} client - The Discord client to register the commands with.
 * @returns {Promise<void>} Resolves when all commands are loaded and registered successfully.
 * @author İbrahim Güneş
 */
export const commandHandler = async (client) => {
    try {
        // Get all the command files from the 'commands' directory, including subfolders
        const commandFolders = await fs.readdir(
            path.join(__dirname, "../commands")
        );

        for (const folder of commandFolders) {
            const commandFiles = (
                await fs.readdir(path.join(__dirname, `../commands/${folder}`))
            ).filter((file) => file.endsWith(".js"));

            for (const file of commandFiles) {
                const { default: command } = await import(
                    `../commands/${folder}/${file}`
                );
                client.commands.set(command.data.name, command);

                // Add command data to the array (slash or context menu commands)
                if (
                    command.data instanceof SlashCommandBuilder ||
                    command.data instanceof ContextMenuCommandBuilder
                ) {
                    client.commandArray.push(command.data.toJSON());
                } else {
                    client.commandArray.push(command.data);
                }

                console.log(
                    chalk.green(
                        `[Commands]: Loaded ${command.data.name} command.`
                    )
                );
            }
        }

        // Log the client ID and check if it's loaded correctly
        const clientId = process.env.CLIENT_ID;
        if (!clientId) {
            console.error(
                chalk.red(
                    "Client ID is missing! Please set the CLIENT_ID in your .env file."
                )
            );
            return;
        }

        // Create a REST client and set the bot token
        const rest = new REST({ version: "10" }).setToken(
            process.env.CLIENT_TOKEN
        );

        // Check if the token is set correctly
        if (!process.env.CLIENT_TOKEN) {
            console.error(
                chalk.red(
                    "Token is missing! Please set the CLIENT_TOKEN in your .env file."
                )
            );
            return;
        }

        console.log(
            chalk.cyan(`[Commands] Refreshing application (/) commands...`)
        );

        // Register commands with the Discord API
        await rest.put(Routes.applicationCommands(clientId), {
            body: client.commandArray,
        });

        console.log(
            chalk.cyan(
                `[Commands] Successfully reloaded application (/) commands.`
            )
        );
    } catch (error) {
        // If there's an error, log it
        console.error(chalk.red(`[Commands] Error loading commands: ${error}`));
    }
};
