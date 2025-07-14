import {
	Client,
	ClientOptions,
	Collection,
	GatewayIntentBits,
	Partials,
} from "discord.js";

import { Command } from "../types/Command.js";
import { Button } from "../types/Button.js";
import { SelectMenu } from "../types/SelectMenu.js";
import { Modal } from "../types/Modal.js";

export interface ExtendedClient extends Client<true> {
	commands: Collection<string, Command>;
	buttons: Collection<string, Button>;
	selectMenus: Collection<string, SelectMenu>;
	modals: Collection<string, Modal>;
	commandArray: Command[];
}

const clientOptions: ClientOptions = {
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMembers,
		GatewayIntentBits.MessageContent,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.GuildScheduledEvents,
	],
	partials: [Partials.GuildMember, Partials.Message, Partials.Channel],
};

export const client: ExtendedClient = new Client(
	clientOptions,
) as ExtendedClient;

client.commands = new Collection<string, Command>();
client.buttons = new Collection<string, Button>();
client.selectMenus = new Collection<string, SelectMenu>();
client.modals = new Collection<string, Modal>();
client.commandArray = [];
