import {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  bold,
} from "discord.js";
import { Command } from "./command";
import { supabaseClient } from "../supabase/supabase";

class ScoresCommand extends Command {
  public async getData(): Promise<Partial<SlashCommandBuilder>> {
    const supabase = await supabaseClient;
    const { data: modules } = await supabase.from("modules").select();

    const choises = (modules ?? [])
      .filter((module) => module.is_published)
      .map((module) => ({
        name: module.name,
        value: `${module.id}`,
      }));

    const commandBuilder = new SlashCommandBuilder()
      .setName(this.name)
      .setDescription(this.description)
      .setDMPermission(false);

    return commandBuilder.addStringOption((option) => {
      return option
        .setName("module")
        .setDescription("Модуль квиза")
        .setRequired(true)
        .addChoices(...choises);
    });
  }

  public async execute(interaction: ChatInputCommandInteraction) {
    const supabase = await supabaseClient;
    const moduleId = interaction.options.getString("module");

    if (!moduleId) {
      return interaction.reply({
        content: "Invalid command option",
        ephemeral: true,
      });
    }

    const { data: userScores } = await supabase
      .from("top_scores")
      .select("*, modules!inner(name)")
      .filter("module_id", "eq", moduleId)
      .filter("user_name", "eq", interaction.user.globalName)
      .filter("guild_id", "eq", interaction.guildId)
      .limit(1)
      .single();

    const { data: topScores } = await supabase
      .from("top_scores")
      .select("*, modules!inner(name)")
      .order("rnum", { ascending: true })
      .filter("module_id", "eq", moduleId)
      .filter("guild_id", "eq", interaction.guildId)
      .limit(6);

    if (!topScores || !userScores) {
      return interaction.reply({
        content: "Тут ничего нет",
        ephemeral: true,
      });
    }

    let isInLeaders = false;
    let leaderBoard = `Лучшие результаты модуля ${userScores.modules?.name} \n\n`;
    for (let i = 0; i < topScores.length; i++) {
      const scoreRow = topScores[i];
      if (scoreRow.user_name === interaction.user.globalName) {
        isInLeaders = true;
        leaderBoard += bold(
          `${scoreRow.rnum}. ${scoreRow.user_name} : ${scoreRow.score}\n`,
        );
      } else {
        leaderBoard += `${scoreRow.rnum}. ${scoreRow.user_name} : ${scoreRow.score}\n`;
      }
    }

    if (!isInLeaders) {
      leaderBoard += `...\n`;
      leaderBoard += bold(
        `${userScores.rnum}. ${userScores.user_name} : ${userScores.score}\n`,
      );
    }

    return interaction.reply({
      content: leaderBoard,
      // ephemeral: true,
    });
  }
}

export const scores = new ScoresCommand(
  "scores",
  "Результаты квиза по Godot/Gdscipt",
);
