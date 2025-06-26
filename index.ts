import { botLogin } from "./src/config/Configs.js";
import { loadHandlers } from "./src/functions/loadHandlers.js";

await loadHandlers();
await botLogin();
