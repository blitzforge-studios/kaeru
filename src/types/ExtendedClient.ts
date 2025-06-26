import { Client, Collection } from "discord.js";

export interface ExtendedClient extends Client<boolean> {
    commands: Collection<string, any>;
    buttons: Collection<string, any>;
    selectMenus: Collection<string, any>;
    modals: Collection<string, any>;
    commandArray: unknown[];
}
