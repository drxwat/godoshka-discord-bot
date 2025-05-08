import { Message, OmitPartialGroupDMChannel } from "discord.js";
import { supabaseClient } from "../supabase/supabase";
import { isWithinInterval, parseISO } from "date-fns";
import { UTCDate } from "@date-fns/utc";
import { Jam } from "../supabase/entities";

export const handleGameJamMessageCreate = async (
  message: OmitPartialGroupDMChannel<Message<boolean>>,
  jams: Jam[],
) => {
  if (!message.content.includes("#jam")) {
    return;
  }

  const activeJam = jams?.find((jam) =>
    isWithinInterval(new UTCDate(), {
      start: parseISO(jam.start_timestamp),
      end: parseISO(jam.end_timestamp),
    }),
  );

  if (!activeJam) {
    return;
  }

  console.log("activeJam", activeJam);

  const supabase = await supabaseClient;

  const attachment = message.attachments.find((attachment) =>
    attachment.contentType?.includes("image"),
  );

  await supabase.from("jam_devlogs").insert({
    user_name: message.author.globalName ?? message.author.username,
    content: message.content,
    jam_id: activeJam.id,
    attachment_url: attachment?.url,
  });

  console.log("devlog inserted");
  message.react("❤️");
};
