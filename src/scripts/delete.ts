import { REST, Routes } from "discord.js";
import { config } from "../config";

const rest = new REST({ version: "10" }).setToken(config.DISCORD_TOKEN);

export const deleteCommands = async ({
  guildId,
  commandId,
}: {
  guildId: string;
  commandId: string;
}) => {
  console.log(`Deleting comand ${commandId} from ${guildId}`);

  rest
    .put(
      Routes.applicationGuildCommands(config.DISCORD_APPLICATION_ID, guildId),
      { body: [] },
    )
    .then(() => console.log("Successfully deleted guild command"))
    .catch(console.error);
};
