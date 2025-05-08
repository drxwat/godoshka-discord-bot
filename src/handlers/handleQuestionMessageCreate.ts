import { Client, Message, OmitPartialGroupDMChannel } from "discord.js";
import { LLM } from "../llm";

export const handleQuestionMessageCreate = async (
  message: OmitPartialGroupDMChannel<Message<boolean>>,
  client: Client<boolean>,
) => {
  const botUserId = client.user?.id;

  if (!botUserId || !message.mentions.has(botUserId)) {
    return;
  }

  message.channel.sendTyping();

  const interval = setInterval(() => {
    message.channel.sendTyping();
  }, 10000);

  const completion = await LLM.chat.completions.create({
    model: "deepseek-chat",
    messages: [
      {
        role: "system",
        content:
          "Ты специалист-помощник в разработке игр на. Если в сообщении не уазана технология или язык программирования, то предполагай, что вопрос относится к Godot/Gdscript. Если тебя спросят про другой игровой движок, мягко и коротко намекни, что Godot лучше и дай ответ. Сообщение не должно превышать 2000 симовлов.",
      },
      { role: "user", content: message.content },
    ],
    stream: false,
  });

  clearInterval(interval);

  message.reply({
    content: completion.choices[0].message.content ?? undefined,
  });
};
