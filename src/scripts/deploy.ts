import { config } from "../config";
import { deployCommands } from "../deployCommands";

(async () => {
  try {
    await deployCommands({ guildId: config.DISCORD_GUILD_ID });
  } catch (error) {
    console.error(error);
  }
})();
