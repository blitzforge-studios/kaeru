import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import chalk from "chalk";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Loads and registers all events for the bot.
 *
 * This function goes through all the event files in the "events" folder and
 * registers them with the client. It supports both one-time and recurring events,
 * making sure each event is properly set up to listen for the correct triggers.
 *
 * Call this function to set up all the event listeners when the bot is ready to go.
 *
 * @param {Client} client - The Discord client to register the events with.
 * @returns {Promise<void>} Resolves when all events are successfully loaded.
 * @author İbrahim Güneş
 */
export const eventHandler = async (client) => {
    try {
        // Get all folders inside the 'events' directory
        const eventFolders = fs.readdirSync(path.join(__dirname, "../events"));

        // Loop through each folder (e.g., message, ready, etc.)
        for (const folder of eventFolders) {
            const folderPath = path.join(__dirname, "../events", folder);
            if (!fs.lstatSync(folderPath).isDirectory()) continue; // Skip non-folder files

            // Get all event files in the folder
            const eventFiles = fs
                .readdirSync(folderPath)
                .filter((file) => file.endsWith(".js"));

            // Import and register each event
            for (const file of eventFiles) {
                const { default: event } = await import(
                    `../events/${folder}/${file}`
                );

                // Skip invalid events
                if (!event || !event.name || !event.execute) {
                    console.warn(
                        chalk.yellow(
                            `[Events]: Skipped ${file} (invalid structure)`
                        )
                    );
                    continue;
                }

                // Register the event (either one-time or recurring)
                if (event.once) {
                    client.once(event.name, (...args) =>
                        event.execute(...args, client)
                    );
                } else {
                    client.on(event.name, (...args) =>
                        event.execute(...args, client)
                    );
                }

                console.log(
                    chalk.green(`[Events]: Loaded ${event.name} event.`)
                );
            }
        }
    } catch (error) {
        // Log any errors encountered during the event loading process
        console.error(chalk.red(`[Events]: Error loading events - ${error}`));
    }
};
