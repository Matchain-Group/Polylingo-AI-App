import { Router, type IRouter, type Request, type Response } from "express";
import { openai } from "@workspace/integrations-openai-ai-server";

const router: IRouter = Router();

const SUPPORTED_LANGUAGES = [
  { code: "en", name: "English", nativeName: "English" },
  { code: "es", name: "Spanish", nativeName: "Español" },
  { code: "fr", name: "French", nativeName: "Français" },
  { code: "de", name: "German", nativeName: "Deutsch" },
  { code: "it", name: "Italian", nativeName: "Italiano" },
  { code: "pt", name: "Portuguese", nativeName: "Português" },
  { code: "ru", name: "Russian", nativeName: "Русский" },
  { code: "zh", name: "Chinese (Simplified)", nativeName: "中文(简体)" },
  { code: "ja", name: "Japanese", nativeName: "日本語" },
  { code: "ko", name: "Korean", nativeName: "한국어" },
  { code: "ar", name: "Arabic", nativeName: "العربية" },
  { code: "hi", name: "Hindi", nativeName: "हिन्दी" },
  { code: "nl", name: "Dutch", nativeName: "Nederlands" },
  { code: "pl", name: "Polish", nativeName: "Polski" },
  { code: "sv", name: "Swedish", nativeName: "Svenska" },
  { code: "tr", name: "Turkish", nativeName: "Türkçe" },
  { code: "uk", name: "Ukrainian", nativeName: "Українська" },
  { code: "vi", name: "Vietnamese", nativeName: "Tiếng Việt" },
  { code: "th", name: "Thai", nativeName: "ภาษาไทย" },
  { code: "id", name: "Indonesian", nativeName: "Bahasa Indonesia" },
];

function getLanguageName(code: string): string {
  return SUPPORTED_LANGUAGES.find((l) => l.code === code)?.name ?? code;
}

router.get("/translate/languages", (_req: Request, res: Response) => {
  res.json(SUPPORTED_LANGUAGES);
});

router.post("/translate/text", async (req: Request, res: Response) => {
  try {
    const { text, targetLanguage, sourceLanguage } = req.body as {
      text: string; targetLanguage: string; sourceLanguage?: string;
    };
    if (!text || !targetLanguage) { res.status(400).json({ error: "text and targetLanguage are required" }); return; }

    const targetLangName = getLanguageName(targetLanguage);
    const sourcePart = sourceLanguage ? `from ${getLanguageName(sourceLanguage)}` : "(auto-detect source language)";

    const response = await openai.chat.completions.create({
      model: "gpt-5.2",
      max_completion_tokens: 8192,
      messages: [
        {
          role: "system",
          content: `You are a professional translator. Translate the given text ${sourcePart} to ${targetLangName}. Return ONLY a JSON object with: translatedText (string), detectedLanguage (ISO 639-1 code). No markdown.`,
        },
        { role: "user", content: text },
      ],
    });

    const raw = response.choices[0]?.message?.content ?? "{}";
    let parsed: { translatedText?: string; detectedLanguage?: string } = {};
    try { parsed = JSON.parse(raw); } catch { parsed = { translatedText: raw, detectedLanguage: sourceLanguage ?? "unknown" }; }

    res.json({
      translatedText: parsed.translatedText ?? raw,
      detectedLanguage: parsed.detectedLanguage ?? sourceLanguage ?? "unknown",
      sourceLanguage: parsed.detectedLanguage ?? sourceLanguage ?? "unknown",
      targetLanguage,
    });
  } catch (err) {
    console.error("translate/text error:", err);
    res.status(500).json({ error: "Translation failed" });
  }
});

router.post("/translate/pdf", async (req: Request, res: Response) => {
  try {
    const { pdfBase64, targetLanguage, sourceLanguage } = req.body as {
      pdfBase64: string; targetLanguage: string; sourceLanguage?: string;
    };
    if (!pdfBase64 || !targetLanguage) { res.status(400).json({ error: "pdfBase64 and targetLanguage are required" }); return; }

    const pdfBuffer = Buffer.from(pdfBase64, "base64");
    let extractedText = "";
    let pageCount = 1;

    try {
      const pdfParse = await import("pdf-parse");
      const pdfData = await pdfParse.default(pdfBuffer);
      extractedText = pdfData.text;
      pageCount = pdfData.numpages;
    } catch {
      extractedText = `[PDF text extraction: content length ${pdfBuffer.length} bytes]`;
    }

    const targetLangName = getLanguageName(targetLanguage);
    const sourcePart = sourceLanguage ? `from ${getLanguageName(sourceLanguage)}` : "(auto-detect)";
    const MAX_CHARS = 12000;
    const textToTranslate = extractedText.length > MAX_CHARS
      ? extractedText.slice(0, MAX_CHARS) + "\n\n[Content truncated]"
      : extractedText;

    const response = await openai.chat.completions.create({
      model: "gpt-5.2",
      max_completion_tokens: 8192,
      messages: [
        { role: "system", content: `Translate the following PDF text ${sourcePart} to ${targetLangName}. Preserve structure. Return only the translated text.` },
        { role: "user", content: textToTranslate },
      ],
    });

    res.json({
      translatedText: response.choices[0]?.message?.content ?? "",
      originalText: textToTranslate,
      pageCount,
      targetLanguage,
    });
  } catch (err) {
    console.error("translate/pdf error:", err);
    res.status(500).json({ error: "PDF translation failed" });
  }
});

router.post("/translate/chat", async (req: Request, res: Response) => {
  try {
    const { message, targetLanguage, sourceLanguage } = req.body as {
      message: string; targetLanguage: string; sourceLanguage?: string; sessionId?: string;
    };
    if (!message || !targetLanguage) { res.status(400).json({ error: "message and targetLanguage are required" }); return; }

    const targetLangName = getLanguageName(targetLanguage);
    const sourcePart = sourceLanguage ? `from ${getLanguageName(sourceLanguage)}` : "(auto-detect)";

    const response = await openai.chat.completions.create({
      model: "gpt-5.2",
      max_completion_tokens: 2048,
      messages: [
        { role: "system", content: `Translate the message ${sourcePart} to ${targetLangName}. Return ONLY JSON: {translatedMessage, detectedLanguage}` },
        { role: "user", content: message },
      ],
    });

    const raw = response.choices[0]?.message?.content ?? "{}";
    let parsed: { translatedMessage?: string; detectedLanguage?: string } = {};
    try { parsed = JSON.parse(raw); } catch { parsed = { translatedMessage: raw, detectedLanguage: sourceLanguage ?? "unknown" }; }

    res.json({
      id: `msg_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      originalMessage: message,
      translatedMessage: parsed.translatedMessage ?? raw,
      sourceLanguage: parsed.detectedLanguage ?? sourceLanguage ?? "unknown",
      targetLanguage,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error("translate/chat error:", err);
    res.status(500).json({ error: "Chat translation failed" });
  }
});

router.post("/translate/subtitle", async (req: Request, res: Response) => {
  try {
    const { text, targetLanguage, sourceLanguage } = req.body as {
      text: string; targetLanguage: string; sourceLanguage?: string;
    };
    if (!text || !targetLanguage) { res.status(400).json({ error: "text and targetLanguage are required" }); return; }

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    const targetLangName = getLanguageName(targetLanguage);
    const sourcePart = sourceLanguage ? `from ${getLanguageName(sourceLanguage)}` : "(auto-detect)";

    const stream = await openai.chat.completions.create({
      model: "gpt-5.2",
      max_completion_tokens: 8192,
      messages: [
        { role: "system", content: `You are a real-time subtitle translator. Translate the given text ${sourcePart} to ${targetLangName}. Output only the translation, no explanations.` },
        { role: "user", content: text },
      ],
      stream: true,
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) res.write(`data: ${JSON.stringify({ content })}\n\n`);
    }

    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
  } catch (err) {
    console.error("translate/subtitle error:", err);
    res.write(`data: ${JSON.stringify({ error: "Translation failed" })}\n\n`);
    res.end();
  }
});

router.post("/translate/project", async (req: Request, res: Response) => {
  try {
    const { files, targetLanguage, sourceLanguage } = req.body as {
      files: { filename: string; content: string }[];
      targetLanguage: string;
      sourceLanguage?: string;
    };
    if (!files || !files.length || !targetLanguage) {
      res.status(400).json({ error: "files and targetLanguage are required" });
      return;
    }

    const targetLangName = getLanguageName(targetLanguage);
    const sourcePart = sourceLanguage ? `from ${getLanguageName(sourceLanguage)}` : "(auto-detect)";

    const translatedFiles = await Promise.all(
      files.map(async (file) => {
        const MAX = 8000;
        const content = file.content.length > MAX ? file.content.slice(0, MAX) + "\n[truncated]" : file.content;
        const response = await openai.chat.completions.create({
          model: "gpt-5.2",
          max_completion_tokens: 8192,
          messages: [
            { role: "system", content: `You are a professional translator. Translate the following text ${sourcePart} to ${targetLangName}. This is file "${file.filename}". Preserve all formatting, code structure, variables, and special characters. Only translate natural language text. Return only the translated content.` },
            { role: "user", content: content },
          ],
        });
        return {
          filename: file.filename,
          originalContent: content,
          translatedContent: response.choices[0]?.message?.content ?? content,
        };
      })
    );

    res.json({ files: translatedFiles, targetLanguage, totalFiles: translatedFiles.length });
  } catch (err) {
    console.error("translate/project error:", err);
    res.status(500).json({ error: "Project translation failed" });
  }
});

router.post("/translate/voice", async (req: Request, res: Response) => {
  try {
    const { audioBase64, targetLanguage, sourceLanguage } = req.body as {
      audioBase64: string; targetLanguage: string; sourceLanguage?: string;
    };
    if (!audioBase64 || !targetLanguage) {
      res.status(400).json({ error: "audioBase64 and targetLanguage are required" });
      return;
    }

    const audioBuffer = Buffer.from(audioBase64, "base64");
    const { File } = await import("buffer");

    const audioFile = new File([audioBuffer], "audio.webm", { type: "audio/webm" }) as unknown as globalThis.File;

    const transcription = await openai.audio.transcriptions.create({
      model: "gpt-4o-mini-transcribe",
      file: audioFile,
      response_format: "json",
    });

    const transcript = transcription.text ?? "";

    if (!transcript.trim()) {
      res.json({ transcript: "", translatedText: "", detectedLanguage: "unknown", targetLanguage });
      return;
    }

    const targetLangName = getLanguageName(targetLanguage);
    const sourcePart = sourceLanguage ? `from ${getLanguageName(sourceLanguage)}` : "(auto-detect)";

    const translateResponse = await openai.chat.completions.create({
      model: "gpt-5.2",
      max_completion_tokens: 4096,
      messages: [
        { role: "system", content: `Translate the following text ${sourcePart} to ${targetLangName}. Return ONLY JSON: {translatedText, detectedLanguage}` },
        { role: "user", content: transcript },
      ],
    });

    const raw = translateResponse.choices[0]?.message?.content ?? "{}";
    let parsed: { translatedText?: string; detectedLanguage?: string } = {};
    try { parsed = JSON.parse(raw); } catch { parsed = { translatedText: raw }; }

    res.json({
      transcript,
      translatedText: parsed.translatedText ?? raw,
      detectedLanguage: parsed.detectedLanguage ?? sourceLanguage ?? "unknown",
      targetLanguage,
    });
  } catch (err) {
    console.error("translate/voice error:", err);
    res.status(500).json({ error: "Voice translation failed" });
  }
});

router.get("/translate/telegram/status", (_req: Request, res: Response) => {
  const token = process.env["TELEGRAM_BOT_TOKEN"];
  res.json({
    active: !!token && token.length > 0,
    message: token ? "Telegram bot is configured" : "No TELEGRAM_BOT_TOKEN set",
  });
});

export default router;
