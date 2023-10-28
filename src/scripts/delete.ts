import { REST, Routes } from "discord.js";
import { config } from "../config";

const rest = new REST({ version: "10" }).setToken(config.DISCORD_TOKEN);

export const deleteCommands = async () => {
  console.log(`Deleting commands`);

  rest
    .put(Routes.applicationCommands(config.DISCORD_APPLICATION_ID), {
      body: [],
    })
    .then(() => console.log("Successfully deleted guild command"))
    .catch(console.error);
};

deleteCommands();
