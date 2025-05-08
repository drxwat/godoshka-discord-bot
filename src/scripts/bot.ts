/* eslint-disable @typescript-eslint/no-unused-vars */
import { Client, GatewayIntentBits } from "discord.js";
import { commands } from "../commands";
import { config } from "../config";
import { deployCommands } from "../deployCommands";
import { handleGameJamMessageCreate } from "../handlers/handleGameJamMessageCreate";
import { supabaseClient } from "../supabase/supabase";
import { format } from "date-fns";
import { UTCDate } from "@date-fns/utc";
import { Jam } from "../supabase/entities";
import { handleQuestionMessageCreate } from "../handlers/handleQuestionMessageCreate";

/**
 * LISTEN TO DISCORD EVENTS
 */

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.MessageContent,
  ],
});

let jams: Jam[] = [];

client.once("ready", async (client) => {
  console.log(`Bot is ready. Logged in as ${client.user.tag}`);

  const supabase = await supabaseClient;
  const { data } = await supabase
    .from("jams")
    .select("*")
    .gt("end_timestamp", format(new UTCDate(), "yyyy-MM-dd'T'kk:mm:ss"));

  if (data) {
    jams = data;
  }
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

client.on("messageCreate", (message) => {
  // if (jams) {
  //   handleGameJamMessageCreate(message, jams);
  // }

  handleQuestionMessageCreate(message, client);
});

client.on("guildCreate", async (guild) => {
  await deployCommands({ guildId: guild.id });
});

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
        table: "jams",
      },
      async () => {
        console.log("Jams change event");
        const { data } = await supabase
          .from("jams")
          .select("*")
          .gt("end_timestamp", format(new UTCDate(), "yyyy-MM-dd'T'kk:mm:ss"));

        if (data) {
          console.log("Jams data updated");
          jams = data;
        }
        // await deployCommands({ guildId: config.DISCORD_GUILD_ID });
      },
    )
    .subscribe();
  console.log("Listening to jams change");
})();
