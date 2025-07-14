import { botLogin } from "./config/index.js";
import { loadHandlers } from "./utilities/loadHandlers.js";

await loadHandlers();
await botLogin();
