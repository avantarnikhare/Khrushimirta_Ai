import { NextResponse } from "next/server";
import { franc } from "franc";
import { fetchWithTimeout } from "@/lib/fetch-with-timeout";
import {
  appendRateLimitHeaders,
  applyRateLimit,
  getClientIp,
} from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 10;

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_TIMEOUT_MS = 8000;
const CHAT_RATE_LIMIT = {
  windowMs: 60_000,
  maxRequests: 20,
};

const BASE_SYSTEM_PROMPT =
  "You are KrushiMitra AI, an intelligent agriculture assistant designed to help farmers in India. Help them with crop advice, pest prevention, fertilizer suggestions, irrigation guidance, and seasonal farming recommendations.";

const SUPPORTED_LANGUAGES = {
  hi: { name: "Hindi", francCode: "hin" },
  en: { name: "English", francCode: "eng" },
  mr: { name: "Marathi", francCode: "mar" },
  ta: { name: "Tamil", francCode: "tam" },
  te: { name: "Telugu", francCode: "tel" },
  gu: { name: "Gujarati", francCode: "guj" },
  pa: { name: "Punjabi", francCode: "pan" },
  kn: { name: "Kannada", francCode: "kan" },
  bn: { name: "Bengali", francCode: "ben" },
} as const;

type SupportedLanguageCode = keyof typeof SUPPORTED_LANGUAGES;

const FRANC_TO_LANGUAGE: Record<string, SupportedLanguageCode> = {
  hin: "hi",
  eng: "en",
  mar: "mr",
  tam: "ta",
  tel: "te",
  guj: "gu",
  pan: "pa",
  kan: "kn",
  ben: "bn",
};

const SUPPORTED_FRANC_CODES = Object.values(SUPPORTED_LANGUAGES).map(
  (language) => language.francCode,
);

const DEFAULT_LANGUAGE: SupportedLanguageCode = "hi";

type ClientMessage = {
  role: "user" | "assistant";
  content: string;
};

type ChatRequestBody = {
  message?: string;
  history?: unknown;
  preferredLanguage?: unknown;
  userName?: unknown;
};

type GroqChatCompletionResponse = {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
};

function sanitizeHistory(input: unknown): ClientMessage[] {
  if (!Array.isArray(input)) {
    return [];
  }

  return input
    .filter((item): item is ClientMessage => {
      if (!item || typeof item !== "object") {
        return false;
      }

      const candidate = item as Partial<ClientMessage>;
      return (
        (candidate.role === "user" || candidate.role === "assistant") &&
        typeof candidate.content === "string"
      );
    })
    .map((item) => ({
      role: item.role,
      content: item.content.trim().slice(0, 1000),
    }))
    .filter((item) => item.content.length > 0)
    .slice(-8);
}

function isSupportedLanguageCode(
  value: unknown,
): value is SupportedLanguageCode {
  return typeof value === "string" && value in SUPPORTED_LANGUAGES;
}

function detectLanguage(
  message: string,
  fallbackLanguage: SupportedLanguageCode,
): SupportedLanguageCode {
  const detectedFrancCode = franc(message, {
    minLength: 3,
    only: SUPPORTED_FRANC_CODES,
  });

  if (detectedFrancCode === "und") {
    return fallbackLanguage;
  }

  return FRANC_TO_LANGUAGE[detectedFrancCode] ?? fallbackLanguage;
}

function buildSystemPrompt(
  languageCode: SupportedLanguageCode,
  userName?: string,
): string {
  const languageName = SUPPORTED_LANGUAGES[languageCode].name;

  const basePromptParts = [
    BASE_SYSTEM_PROMPT,
    `Always respond in ${languageName}.`,
    "Keep responses practical, concise, and farmer-friendly for India.",
    "If users ask follow-up questions, preserve context from previous messages.",
  ];

  if (userName) {
    basePromptParts.push(
      `The user's name is ${userName}. Use their name naturally and respectfully when useful.`,
    );
  }

  return basePromptParts.join(" ");
}

export async function POST(request: Request) {
  const rateLimitResult = applyRateLimit(
    "api-chat",
    getClientIp(request),
    CHAT_RATE_LIMIT,
  );

  const respond = (body: unknown, init: ResponseInit = {}) => {
    const headers = new Headers(init.headers);
    headers.set("Cache-Control", "no-store");
    headers.set("X-Content-Type-Options", "nosniff");
    headers.set("X-Frame-Options", "DENY");
    headers.set("Referrer-Policy", "same-origin");
    appendRateLimitHeaders(headers, rateLimitResult);

    return NextResponse.json(body, {
      ...init,
      headers,
    });
  };

  if (!rateLimitResult.allowed) {
    return respond(
      { error: "Too many chat requests. Please try again shortly." },
      { status: 429 },
    );
  }

  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    return respond(
      { error: "Server is missing GROQ_API_KEY configuration." },
      { status: 500 },
    );
  }

  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.toLowerCase().includes("application/json")) {
    return respond(
      { error: "Content-Type must be application/json." },
      { status: 415 },
    );
  }

  try {
    let body: ChatRequestBody;
    try {
      body = (await request.json()) as ChatRequestBody;
    } catch {
      return respond({ error: "Invalid JSON request body." }, { status: 400 });
    }

    const userMessage =
      typeof body?.message === "string" ? body.message.trim() : "";
    const userName =
      typeof body?.userName === "string"
        ? body.userName.trim().slice(0, 48)
        : "";

    const preferredLanguage = isSupportedLanguageCode(body?.preferredLanguage)
      ? body.preferredLanguage
      : DEFAULT_LANGUAGE;

    if (!userMessage) {
      return respond(
        { error: "Message is required." },
        { status: 400 },
      );
    }

    if (userMessage.length > 1500) {
      return respond(
        { error: "Message is too long." },
        { status: 400 },
      );
    }

    const safeHistory = sanitizeHistory(body?.history);
    const detectedLanguage = detectLanguage(userMessage, preferredLanguage);
    const systemPrompt = buildSystemPrompt(
      detectedLanguage,
      userName.length > 0 ? userName : undefined,
    );

    const upstreamResponse = await fetchWithTimeout(
      GROQ_API_URL,
      {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        temperature: 0.4,
        max_tokens: 500,
        messages: [
          { role: "system", content: systemPrompt },
          ...safeHistory,
          { role: "user", content: userMessage },
        ],
      }),
      cache: "no-store",
      },
      GROQ_TIMEOUT_MS,
    );

    if (!upstreamResponse.ok) {
      const errorBody = await upstreamResponse.text();
      console.error("GROQ upstream request failed", {
        status: upstreamResponse.status,
        errorBodyPreview: errorBody.slice(0, 180),
      });

      return respond(
        { error: "Failed to get response from AI service." },
        { status: 502 },
      );
    }

    const data = (await upstreamResponse.json()) as GroqChatCompletionResponse;
    const reply = data.choices?.[0]?.message?.content?.trim();

    if (!reply) {
      return respond(
        { error: "AI response was empty." },
        { status: 502 },
      );
    }

    return respond({ reply, detectedLanguage });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      return respond(
        { error: "AI service timeout. Please retry." },
        { status: 504 },
      );
    }

    console.error("Chat API error", error);
    return respond(
      { error: "Unexpected server error." },
      { status: 500 },
    );
  }
}