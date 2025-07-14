import { client } from "../config/index.js";
import { eventHandler, commandHandler, componentHandler } from "../handlers/index.js";

/**
 * Loads all the Kaeru’s handlers to get it up and running.
 *
 * @returns {Promise<void>} Resolves when all handlers are loaded.
 */
export async function loadHandlers(): Promise<void> {
	console.log("Loading event handler...");
	await eventHandler(client);

	console.log("Loading command handler...");
	await commandHandler(client);

	console.log("Loading component handler...");
	await componentHandler(client);

	console.log("All handlers loaded successfully.");
}
