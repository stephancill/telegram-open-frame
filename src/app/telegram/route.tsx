import { GetFrameResult } from "@frames.js/render";
import { kv } from "@vercel/kv";
import { createHash } from "crypto";
import { Frame, getFrame } from "frames.js";
import { NextRequest } from "next/server";
import ogs from "open-graph-scraper";
import { Markup, Telegraf } from "telegraf";
import { InlineQueryResult } from "telegraf/types";

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN!);
bot.telegram.setWebhook(`${process.env.APP_URL!}/telegram`);

function generateUniqueId(url: string): string {
  // Create a SHA-256 hash of the URL
  const hash = createHash("sha256");
  hash.update(url);
  return hash.digest("hex").substring(0, 32);
}

function isValidUrl(string: string): boolean {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}

bot.action(/.+/, async (ctx) => {
  const [frameId, buttonIndex] = (
    ctx.callbackQuery as { data: string }
  ).data.split(":");
  const frame = await kv.get<Frame>(frameId);

  if (!frame || !frame.buttons) {
    return ctx.answerCbQuery("Frame not found.");
  }

  const selectedButton = frame.buttons[parseInt(buttonIndex)];

  const postUrl = selectedButton.target || frame.postUrl || "";

  const searchParams = new URLSearchParams({
    postType: selectedButton.action,
    postUrl: postUrl,
    specification: "openframes",
  });

  const res = await fetch(
    `${process.env.APP_URL}/frames?${searchParams.toString()}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        untrustedData: {
          buttonIndex,
          state: frame.state,
        },
        clientProtocol: "*@*",
      }),
    }
  );
  const result = (await res.json()) as GetFrameResult;

  console.log(result);

  if (result.status !== "success") {
    return ctx.answerCbQuery("Failed to fetch the frame.");
  }

  const { frame: newFrame } = result;

  // Store buttons in kv store
  kv.set(
    frameId,
    JSON.stringify({ ...newFrame, postUrl: newFrame.postUrl || postUrl })
  );

  const markupButtons =
    newFrame.buttons?.map((button, i) => {
      if (button.action === "link") {
        return Markup.button.url(button.label, button.target);
      } else {
        return Markup.button.callback(button.label, `${frameId}:${i}`);
      }
    }) || [];

  if (!newFrame.image) {
    return ctx.answerCbQuery("Failed to fetch the image.");
  }

  let imageUrl = newFrame.image;
  if (imageUrl.startsWith("data:")) {
    const searchParams = new URLSearchParams({ data: imageUrl });
    imageUrl = `${process.env.APP_URL}/images?${searchParams.toString()}`;
  }

  await ctx.editMessageText(postUrl || "No URL", {
    link_preview_options: {
      url: imageUrl,
    },
    reply_markup: {
      inline_keyboard: [markupButtons],
    },
  });
});

bot.on("inline_query", async (ctx) => {
  const query = ctx.inlineQuery.query;

  if (!query || !isValidUrl(query)) {
    console.log("Invalid URL");
    return ctx.answerInlineQuery([]);
  }

  const results: InlineQueryResult[] = [];

  try {
    if (query) {
      const urlRes = await fetch(query);
      const htmlString = await urlRes.text();

      const { frame, status, reports } = getFrame({
        htmlString,
        url: query,
        specification: "openframes",
      });

      if (status !== "success") {
        console.log(reports);
        throw new Error("Failed to fetch the frame.");
      }

      const og = await ogs({ html: htmlString });

      console.log(JSON.stringify(og.result, null, 2));

      // Generate unique id for the frame
      const frameId = generateUniqueId(query);

      // Store buttons in kv store
      kv.set(frameId, JSON.stringify(frame));

      const markupButtons =
        frame.buttons?.map((button, i) => {
          if (button.action === "link") {
            return Markup.button.url(button.label, button.target);
          } else {
            return Markup.button.callback(button.label, `${frameId}:${i}`);
          }
        }) || [];

      console.log(markupButtons);

      if (!frame.image) {
        throw new Error("Failed to fetch the image.");
      }

      let imageUrl = frame.image;
      if (imageUrl.startsWith("data:")) {
        // TODO: implement this in image handler
        const searchParams = new URLSearchParams({ data: imageUrl });
        imageUrl = `${process.env.APP_URL}/images?${searchParams.toString()}`;
      }

      results.push({
        type: "article",
        id: "1",
        title: og.result.ogTitle || "No title",
        input_message_content: {
          link_preview_options: {
            url: imageUrl,
          },
          message_text: query,
        },
        description: og.result.ogDescription,
        ...Markup.inlineKeyboard([markupButtons]),
      });
    }
  } catch (error) {
    console.error("Caught error", error);
  }

  ctx.answerInlineQuery(results);
});

export const POST = async (req: NextRequest) => {
  const json = await req.json();
  await bot.handleUpdate(json);

  return new Response(null, { status: 200 });
};
