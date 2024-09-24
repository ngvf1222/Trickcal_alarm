//1286668897872908381
import { REST, Routes } from "discord.js";
import { clientId, guildId, token } from "../config.json";

const rest = new REST().setToken(token);

// ...

// for global commands
rest.delete(Routes.applicationCommand(clientId, '1286668897872908381'))
	.then(() => console.log('Successfully deleted application command'))
	.catch(console.error);