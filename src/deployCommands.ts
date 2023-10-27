import { REST, Routes } from "discord.js";
import { config } from "./config";
import { commands } from "./commands";

interface DeployCommandsProps {
  guildId?: string;
}

const rest = new REST({ version: "10" }).setToken(config.DISCORD_TOKEN);

export async function deployCommands({ guildId }: DeployCommandsProps) {
  try {
    const commandsData = await Promise.all(
      Array.from(commands.values()).map(
        async (command) => await command.getData(),
      ),
    );

    if (guildId) {
      console.log(
        `GuildID ${guildId}: started refreshing application (/) commands. `,
      );
    } else {
      console.log(`All Guilds: started refreshing application (/) commands. `);
    }

    const request = guildId
      ? rest.put(
          Routes.applicationGuildCommands(
            config.DISCORD_APPLICATION_ID,
            guildId,
          ),
          {
            body: commandsData,
          },
        )
      : rest.put(Routes.applicationCommands(config.DISCORD_APPLICATION_ID), {
          body: commandsData,
        });

    const result = await request;
    console.log(result);

    if (guildId) {
      console.log(
        `GuildID ${guildId}: successfully reloaded application (/) commands.`,
      );
    } else {
      console.log(
        `All Guilds: successfully reloaded application (/) commands.`,
      );
    }
  } catch (error) {
    console.error(error);
  }
}
