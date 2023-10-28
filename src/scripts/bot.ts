import { Client, GatewayIntentBits } from "discord.js";
import { config } from "../config";
import { commands } from "../commands";
import { deployCommands } from "../deployCommands";
import { supabaseClient } from "../supabase/supabase";

/**
 * LISTEN TO DISCORD EVENTS
 */

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.DirectMessages,
  ],
});

client.once("ready", (client) => {
  console.log(`Bot is ready. Logged in as ${client.user.tag}`);
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) {
    return;
  }
  const command = commands.get(interaction.commandName);
  if (!command) {
    console.error(
      `Guild: ${interaction.guild?.name}. No command with matching ${interaction.commandName} was found`,
    );
    return;
  }

  try {
    await command.execute(interaction);
  } catch (error) {
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({
        content: "There was an error while executing this command!",
        ephemeral: true,
      });
    } else {
      await interaction.reply({
        content: "There was an error while executing this command!",
        ephemeral: true,
      });
    }
  }
});

// client.on("guildCreate", async (guild) => {
//   await deployCommands({ guildId: guild.id });
// });

client.login(config.DISCORD_TOKEN);

/**
 * LISTEN TO DB CHANGES
 */

(async () => {
  const supabase = await supabaseClient;

  supabase
    .channel("schema-db-changes")
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
      },
      async () => {
        await deployCommands({ guildId: config.DISCORD_GUILD_ID });
      },
    )
    .subscribe();
  console.log("Listening to modules changes");
})();
