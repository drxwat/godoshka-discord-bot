import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChatInputCommandInteraction,
} from "discord.js";
import { Command } from "./command";
import { supabaseClient } from "../supabase/supabase";
import { Database } from "../supabase/types";
import { wait } from "../wait";

const CORRECT_POINT = 1.0;
const TIME_LEFT_BONUS_MULTIPLIER = 0.3;

const popRandom = <T>(array: T[]): T => {
  const index = (array.length * Math.random()) | 0;
  return array.splice(index, 1)[0];
};

declare type Answer = Database["public"]["Tables"]["answers"]["Row"];
declare type Question = Database["public"]["Tables"]["questions"]["Row"];
declare type QuestionWithAnswers = Question & { answers: Answer[] };

const QUESTION_RESPONCES = ["Хммм...", "Любопытно", "Принято", "Ответ принят"];

async function* askQuestions(
  interaction: ChatInputCommandInteraction,
  questions: QuestionWithAnswers[],
) {
  for (let i = 0; i < questions.length; i++) {
    try {
      const question = questions[i];
      const answerButtons = question.answers.map((answer) => {
        return new ButtonBuilder()
          .setCustomId(`${answer.id}`)
          .setLabel(answer.text)
          .setStyle(ButtonStyle.Primary);
      });

      const buttonRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
        ...answerButtons,
      );

      const startTime = new Date().getTime();
      const response = await interaction.editReply({
        content: question.text,
        components: [buttonRow],
      });
      const timeToAnswer = question.time_to_answer * 1000;
      try {
        const pressedButton = await response.awaitMessageComponent({
          time: timeToAnswer,
        });
        const endDateTime = new Date().getTime();
        await pressedButton.update({
          content: popRandom([...QUESTION_RESPONCES]),
          components: [],
        });
        await wait(500);

        const answer = question.answers.find(
          (answer) => `${answer.id}` === pressedButton.customId,
        );
        const timeBonus =
          ((timeToAnswer - (endDateTime - startTime)) / timeToAnswer) *
          TIME_LEFT_BONUS_MULTIPLIER;

        yield answer?.is_correct ? CORRECT_POINT + timeBonus : 0;
      } catch (error) {
        console.error(error);
        yield 0;
      }
    } catch (error) {
      console.error(error);
    }
  }
}

class QuizCommand extends Command {
  public async execute(interaction: ChatInputCommandInteraction) {
    const supabase = await supabaseClient;
    const moduleId = interaction.options.getString("module");

    if (!moduleId) {
      return interaction.reply({
        content: "Invalid command option",
        ephemeral: true,
      });
    }

    const { data: modules } = await supabase
      .from("modules")
      .select("*,questions(*,answers(*))")
      .filter("id", "eq", moduleId);

    if (!modules || modules.length === 0) {
      return interaction.reply({
        content: "Модуль не найден",
        ephemeral: true,
      });
    }

    const module = modules[0];
    if (!module.is_published) {
      return interaction.reply({
        content: "Модуль недоступен",
        ephemeral: true,
      });
    }

    const { data: scores } = await supabase
      .from("scores")
      .select()
      .filter("module_id", "eq", module.id)
      .filter("user_name", "eq", interaction.user.globalName)
      .filter("guild_id", "eq", interaction.guildId);
    const lastScores = scores && scores[0];
    const topScoreGreeting = lastScores
      ? `\nТвой лучший результат ${lastScores.score}`
      : ``;

    const allQuestions = [...module.questions];
    const questions = Array.from({ length: module.quiz_question_amount }, () =>
      popRandom(allQuestions),
    );

    const buttonRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId(`yes`)
        .setLabel("Начать")
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId(`no`)
        .setLabel("Отмена")
        .setStyle(ButtonStyle.Secondary),
    );
    const response = await interaction.reply({
      content: `${module.name} содержит ${module.quiz_question_amount} вопросов. Время на ответ ограничено. ${topScoreGreeting}`,
      ephemeral: true,
      components: [buttonRow],
    });
    const pressedButton = await response.awaitMessageComponent({
      time: 10000,
    });

    await pressedButton.update({ content: `Так..`, components: [] });

    if (pressedButton.customId === "no") {
      await pressedButton.deleteReply();
      return;
    }

    const result: number[] = [];
    for await (const points of askQuestions(interaction, questions)) {
      result.push(points);
    }

    const correctAnswers = result
      .filter((points) => points > 0)
      .reduce((sum) => sum + 1, 0);
    const total = parseFloat(
      result.reduce((sum, points) => sum + points, 0).toFixed(2),
    );

    console.log("lastScores", lastScores);

    if (lastScores && total > lastScores.score) {
      await supabase
        .from("scores")
        .update({ score: total })
        .eq("id", lastScores.id);
    } else if (
      !lastScores &&
      interaction.user.globalName &&
      interaction.guildId
    ) {
      await supabase.from("scores").insert([
        {
          score: total,
          user_name: interaction.user.globalName,
          guild_id: interaction.guildId,
          module_id: module.id,
        },
      ]);
    }

    await interaction.editReply(
      `Твой счет: ${total}

${correctAnswers} верных ответов из ${
        module.quiz_question_amount
      } + бонус за скорость: ${(total - correctAnswers).toFixed(2)}
${
  total > (lastScores?.score ?? 0)
    ? `Поздравляю! Это твой новый рекорд в ${module.name}`
    : `Твой предыдущий рекорд ${lastScores?.score ?? 0}`
}
`,
    );
  }
}

export const quiz = new QuizCommand(
  "quiz",
  "Начать квиз по Godot/Gdscipt",
  async (data) => {
    const supabase = await supabaseClient;
    const { data: modules } = await supabase.from("modules").select();

    const choises = (modules ?? [])
      .filter((module) => module.is_published)
      .map((module) => ({
        name: module.name,
        value: `${module.id}`,
      }));

    return data.addStringOption((option) => {
      return option
        .setName("module")
        .setDescription("Модуль квиза")
        .setRequired(true)
        .addChoices(...choises);
    });
  },
);
