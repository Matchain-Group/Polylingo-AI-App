import { Router, type IRouter, type Request, type Response } from "express";
import { openai } from "@workspace/integrations-openai-ai-server";

const router: IRouter = Router();

let botInstance: {
  on: (event: string, handler: (msg: unknown) => void) => void;
  sendMessage: (chatId: number, text: string) => Promise<void>;
  stopPolling: () => void;
} | null = null;

function getLanguageName(code: string): string {
  const langs: Record<string, string> = {
    en: "English", es: "Spanish", fr: "French", de: "German",
    it: "Italian", pt: "Portuguese", ru: "Russian", zh: "Chinese (Simplified)",
    ja: "Japanese", ko: "Korean", ar: "Arabic", hi: "Hindi",
  };
  return langs[code] ?? code;
}

async function translateWithAI(text: string, targetLang: string): Promise<string> {
  const response = await openai.chat.completions.create({
    model: "gpt-5.2",
    max_completion_tokens: 2048,
    messages: [
      {
        role: "system",
        content: `You are a professional translator. Translate the following text to ${getLanguageName(targetLang)}. Return ONLY the translated text, no explanations.`,
      },
      { role: "user", content: text },
    ],
  });
  return response.choices[0]?.message?.content ?? text;
}

async function startTelegramBot(token: string, targetLanguage: string): Promise<void> {
  if (botInstance) {
    botInstance.stopPolling();
    botInstance = null;
  }

  try {
    const TelegramBot = (await import("node-telegram-bot-api")).default;
    const bot = new TelegramBot(token, { polling: true });
    botInstance = bot as typeof botInstance;

    bot.on("message", async (msg: { chat: { id: number }; text?: string; from?: { first_name?: string } }) => {
      const chatId = msg.chat.id;
      const text = msg.text;

      if (!text || text.startsWith("/")) {
        if (text === "/start") {
          await bot.sendMessage(
            chatId,
            `👋 Hello! I'm a Translation Bot.\n\nI will automatically translate messages to ${getLanguageName(targetLanguage)}.\n\nJust send me any message and I'll translate it!`
          );
        }
        return;
      }

      try {
        const translated = await translateWithAI(text, targetLanguage);
        await bot.sendMessage(chatId, `🌐 *Translation to ${getLanguageName(targetLanguage)}:*\n\n${translated}`, {
          parse_mode: "Markdown",
        });
      } catch (err) {
        console.error("Telegram translation error:", err);
        await bot.sendMessage(chatId, "❌ Sorry, translation failed. Please try again.");
      }
    });

    console.log("Telegram bot started successfully");
  } catch (err) {
    console.error("Failed to start Telegram bot:", err);
    throw err;
  }
}

router.get("/telegram/status", (_req: Request, res: Response) => {
  const token = process.env["TELEGRAM_BOT_TOKEN"];
  res.json({
    active: !!token && token.length > 0,
    botRunning: !!botInstance,
    message: token
      ? botInstance
        ? "Telegram bot is running and translating messages"
        : "Token found but bot not started — call /api/telegram/start"
      : "No TELEGRAM_BOT_TOKEN configured",
  });
});

router.post("/telegram/start", async (req: Request, res: Response) => {
  const { targetLanguage } = req.body as { targetLanguage?: string };
  const token = process.env["TELEGRAM_BOT_TOKEN"];

  if (!token) {
    res.status(400).json({ error: "TELEGRAM_BOT_TOKEN environment variable is not set" });
    return;
  }

  try {
    await startTelegramBot(token, targetLanguage ?? "en");
    res.json({ success: true, message: "Telegram bot started successfully" });
  } catch (err) {
    res.status(500).json({ error: `Failed to start bot: ${err instanceof Error ? err.message : "Unknown error"}` });
  }
});

router.post("/telegram/stop", (_req: Request, res: Response) => {
  if (botInstance) {
    botInstance.stopPolling();
    botInstance = null;
    res.json({ success: true, message: "Telegram bot stopped" });
  } else {
    res.json({ success: false, message: "Bot was not running" });
  }
});

export default router;
