"use client";

import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useLanguage } from "@/context/language-context";
import { interpolate, isLanguageCode } from "@/lib/i18n";

type MessageRole = "user" | "assistant";

type ChatMessage = {
  id: string;
  role: MessageRole;
  content: string;
  createdAt: number;
};

type ChatThread = {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messages: ChatMessage[];
};

type ChatApiResponse = {
  reply?: string;
  error?: string;
  detectedLanguage?: string;
};

const STORAGE_KEYS = {
  userName: "krushi_user_name_v2",
  threads: "krushi_chat_threads_v2",
  activeThreadId: "krushi_chat_active_thread_id_v2",
} as const;

function createId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function sanitizeText(value: string, maxLength: number): string {
  return value.trim().replace(/\s+/g, " ").slice(0, maxLength);
}

function toThreadTitle(message: string): string {
  return sanitizeText(message, 42) || "New conversation";
}

function isValidMessage(value: unknown): value is ChatMessage {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<ChatMessage>;
  return (
    typeof candidate.id === "string" &&
    (candidate.role === "user" || candidate.role === "assistant") &&
    typeof candidate.content === "string" &&
    typeof candidate.createdAt === "number"
  );
}

function isValidThread(value: unknown): value is ChatThread {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<ChatThread>;
  return (
    typeof candidate.id === "string" &&
    typeof candidate.title === "string" &&
    typeof candidate.createdAt === "number" &&
    typeof candidate.updatedAt === "number" &&
    Array.isArray(candidate.messages) &&
    candidate.messages.every(isValidMessage)
  );
}

function parseStoredThreads(raw: string | null): ChatThread[] {
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .filter(isValidThread)
      .map((thread) => ({
        ...thread,
        title: sanitizeText(thread.title, 72),
        messages: thread.messages
          .map((message) => ({
            ...message,
            content: message.content.slice(0, 2500),
          }))
          .filter((message) => message.content.trim().length > 0)
          .slice(-80),
      }))
      .slice(-40);
  } catch {
    return [];
  }
}

function formatRelativeTime(timestamp: number, justNow: string, minutesAgo: string, hoursAgo: string): string {
  const diffMs = Date.now() - timestamp;
  const diffMinutes = Math.floor(diffMs / 60000);

  if (diffMinutes <= 0) {
    return justNow;
  }

  if (diffMinutes < 60) {
    return interpolate(minutesAgo, { value: diffMinutes });
  }

  const diffHours = Math.floor(diffMinutes / 60);
  return interpolate(hoursAgo, { value: diffHours });
}

export function AiChat() {
  const { dictionary, language, options } = useLanguage();

  const [isHydrated, setIsHydrated] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [detectedLanguage, setDetectedLanguage] = useState(language);

  const scrollAnchorRef = useRef<HTMLDivElement | null>(null);

  const createAssistantMessage = (content: string): ChatMessage => ({
    id: createId(),
    role: "assistant",
    content,
    createdAt: Date.now(),
  });

  const createUserMessage = (content: string): ChatMessage => ({
    id: createId(),
    role: "user",
    content,
    createdAt: Date.now(),
  });

  const createStarterThread = useCallback(
    (name: string | null): ChatThread => {
      const firstMessage = name
        ? createAssistantMessage(
            interpolate(dictionary.chat.welcomeTemplate, {
              name,
            }),
          )
        : createAssistantMessage(dictionary.chat.onboardingQuestion);

      const now = Date.now();
      return {
        id: createId(),
        title: dictionary.chat.untitledConversation,
        createdAt: now,
        updatedAt: now,
        messages: [firstMessage],
      };
    },
    [dictionary.chat.onboardingQuestion, dictionary.chat.untitledConversation, dictionary.chat.welcomeTemplate],
  );

  const activeThread = useMemo(() => {
    if (!activeThreadId) {
      return null;
    }

    return threads.find((thread) => thread.id === activeThreadId) ?? null;
  }, [threads, activeThreadId]);

  const canSend = input.trim().length > 0 && !isLoading;

  useEffect(() => {
    scrollAnchorRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [activeThread?.messages.length, isLoading]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const storedName = sanitizeText(
      window.localStorage.getItem(STORAGE_KEYS.userName) ?? "",
      48,
    );
    const storedThreads = parseStoredThreads(
      window.localStorage.getItem(STORAGE_KEYS.threads),
    );
    const storedActiveId = window.localStorage.getItem(STORAGE_KEYS.activeThreadId);

    if (storedName) {
      setUserName(storedName);
    }

    if (storedThreads.length > 0) {
      setThreads(storedThreads);
      const nextActive =
        storedActiveId && storedThreads.some((thread) => thread.id === storedActiveId)
          ? storedActiveId
          : storedThreads[storedThreads.length - 1]?.id ?? null;
      setActiveThreadId(nextActive);
    } else {
      const starter = createStarterThread(storedName || null);
      setThreads([starter]);
      setActiveThreadId(starter.id);
    }

    setIsHydrated(true);
  }, [createStarterThread]);

  useEffect(() => {
    if (!isHydrated || typeof window === "undefined") {
      return;
    }

    if (userName) {
      window.localStorage.setItem(STORAGE_KEYS.userName, userName);
    } else {
      window.localStorage.removeItem(STORAGE_KEYS.userName);
    }
  }, [userName, isHydrated]);

  useEffect(() => {
    if (!isHydrated || typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(STORAGE_KEYS.threads, JSON.stringify(threads));
  }, [threads, isHydrated]);

  useEffect(() => {
    if (!isHydrated || typeof window === "undefined" || !activeThreadId) {
      return;
    }

    window.localStorage.setItem(STORAGE_KEYS.activeThreadId, activeThreadId);
  }, [activeThreadId, isHydrated]);

  useEffect(() => {
    setDetectedLanguage(language);
  }, [language]);

  const handleNewThread = () => {
    const newThread = createStarterThread(userName);
    setThreads((prev) => [...prev, newThread]);
    setActiveThreadId(newThread.id);
    setErrorText(null);
    setInput("");
  };

  const handleDeleteThread = (threadId: string) => {
    setThreads((prev) => {
      const next = prev.filter((thread) => thread.id !== threadId);

      if (next.length === 0) {
        const starter = createStarterThread(userName);
        setActiveThreadId(starter.id);
        return [starter];
      }

      if (activeThreadId === threadId) {
        setActiveThreadId(next[next.length - 1].id);
      }

      return next;
    });
  };

  const handleClearAll = () => {
    const starter = createStarterThread(userName);
    setThreads([starter]);
    setActiveThreadId(starter.id);
    setErrorText(null);
    setInput("");
  };

  const updateThreadMessages = (threadId: string, updater: (messages: ChatMessage[]) => ChatMessage[]) => {
    setThreads((prev) =>
      prev.map((thread) => {
        if (thread.id !== threadId) {
          return thread;
        }

        const nextMessages = updater(thread.messages).slice(-80);
        const firstUserMessage = nextMessages.find((message) => message.role === "user");

        return {
          ...thread,
          messages: nextMessages,
          title: firstUserMessage ? toThreadTitle(firstUserMessage.content) : thread.title,
          updatedAt: Date.now(),
        };
      }),
    );
  };

  const sendMessage = async (rawMessage: string) => {
    if (!activeThread) {
      return;
    }

    const message = sanitizeText(rawMessage, 1500);
    if (!message || isLoading) {
      return;
    }

    setErrorText(null);
    setInput("");

    if (!userName) {
      if (!message) {
        setErrorText(dictionary.chat.invalidNameError);
        return;
      }

      setUserName(message);
      updateThreadMessages(activeThread.id, (messages) => [
        ...messages,
        createUserMessage(message),
        createAssistantMessage(
          interpolate(dictionary.chat.welcomeTemplate, {
            name: message,
          }),
        ),
      ]);
      return;
    }

    const userMessage = createUserMessage(message);
    const previousMessages = activeThread.messages;

    updateThreadMessages(activeThread.id, (messages) => [...messages, userMessage]);

    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message,
          preferredLanguage: language,
          userName,
          history: previousMessages
            .filter((item) => item.role === "user" || item.role === "assistant")
            .map((item) => ({ role: item.role, content: item.content }))
            .slice(-8),
        }),
      });

      const data = (await response.json()) as ChatApiResponse;

      if (isLanguageCode(data.detectedLanguage)) {
        setDetectedLanguage(data.detectedLanguage);
      }

      if (!response.ok || !data.reply) {
        const fallback = data.error ?? dictionary.chat.fallbackError;
        setErrorText(fallback);
        updateThreadMessages(activeThread.id, (messages) => [
          ...messages,
          createAssistantMessage(dictionary.chat.fallbackError),
        ]);
        return;
      }

      updateThreadMessages(activeThread.id, (messages) => [
        ...messages,
        createAssistantMessage(data.reply as string),
      ]);
    } catch {
      setErrorText(dictionary.chat.networkError);
      updateThreadMessages(activeThread.id, (messages) => [
        ...messages,
        createAssistantMessage(dictionary.chat.networkError),
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await sendMessage(input);
  };

  if (!isHydrated || !activeThread) {
    return (
      <section className="rounded-3xl border border-green-100 bg-white/90 p-4 shadow-card sm:p-6">
        <div className="h-8 w-40 animate-pulse rounded-lg bg-green-100" />
        <div className="mt-4 h-[26rem] animate-pulse rounded-2xl bg-green-50" />
      </section>
    );
  }

  const showNameOnboarding = !userName;

  return (
    <section className="overflow-hidden rounded-3xl border border-green-100 bg-white/90 shadow-card">
      <div className="grid min-h-[38rem] lg:grid-cols-[290px_1fr]">
        <aside className="border-b border-green-100 bg-gradient-to-b from-green-950 via-green-900 to-green-800 p-4 text-white lg:border-b-0 lg:border-r">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-sm font-bold uppercase tracking-[0.16em] text-green-100/90">
              {dictionary.chat.sidebarTitle}
            </h2>
            <span className="rounded-full bg-emerald-300/25 px-2 py-1 text-[11px] font-semibold text-emerald-100">
              {threads.length}
            </span>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handleNewThread}
              className="rounded-xl bg-white px-3 py-2 text-xs font-semibold text-green-900 transition hover:bg-green-100"
            >
              {dictionary.chat.newChat}
            </button>
            <button
              type="button"
              onClick={handleClearAll}
              className="rounded-xl border border-white/35 bg-white/10 px-3 py-2 text-xs font-semibold text-white transition hover:bg-white/20"
            >
              {dictionary.chat.clearAll}
            </button>
          </div>

          {threads.length === 0 ? (
            <div className="mt-4 rounded-xl bg-white/10 p-3">
              <p className="text-sm font-semibold">{dictionary.chat.noThreads}</p>
              <p className="mt-1 text-xs text-green-100/90">{dictionary.chat.noThreadsHint}</p>
            </div>
          ) : (
            <div className="mt-4 space-y-2">
              {threads
                .slice()
                .sort((a, b) => b.updatedAt - a.updatedAt)
                .map((thread) => {
                  const active = thread.id === activeThreadId;

                  return (
                    <button
                      key={thread.id}
                      type="button"
                      onClick={() => setActiveThreadId(thread.id)}
                      className={`w-full rounded-xl border px-3 py-2 text-left transition ${
                        active
                          ? "border-emerald-200 bg-white text-green-950"
                          : "border-white/15 bg-white/10 text-white hover:bg-white/20"
                      }`}
                    >
                      <p className="truncate text-sm font-semibold">{thread.title}</p>
                      <div className="mt-1 flex items-center justify-between">
                        <p className={`text-[11px] ${active ? "text-green-700" : "text-green-100/85"}`}>
                          {formatRelativeTime(
                            thread.updatedAt,
                            dictionary.chat.justNow,
                            dictionary.chat.minutesAgo,
                            dictionary.chat.hoursAgo,
                          )}
                        </p>
                        <span
                          role="button"
                          tabIndex={0}
                          onClick={(event) => {
                            event.stopPropagation();
                            handleDeleteThread(thread.id);
                          }}
                          onKeyDown={(event) => {
                            if (event.key === "Enter" || event.key === " ") {
                              event.preventDefault();
                              handleDeleteThread(thread.id);
                            }
                          }}
                          className={`rounded-md px-1.5 py-0.5 text-[11px] font-semibold ${
                            active ? "text-red-600 hover:bg-red-50" : "text-red-100 hover:bg-white/15"
                          }`}
                        >
                          ×
                        </span>
                      </div>
                    </button>
                  );
                })}
            </div>
          )}
        </aside>

        <div className="flex min-h-0 flex-col">
          <header className="flex flex-wrap items-center justify-between gap-3 border-b border-green-100 bg-gradient-to-r from-white to-green-50 px-4 py-3 sm:px-5">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-full bg-primary text-xs font-bold text-white">
                AI
              </div>
              <div>
                <p className="text-sm font-semibold text-green-950">{dictionary.chat.assistantName}</p>
                <p className="text-xs text-green-700">{dictionary.chat.assistantStatusOnline}</p>
              </div>
            </div>

            <p className="text-xs font-semibold text-green-800">
              {dictionary.chat.detectedLanguageLabel}: {options.find((option) => option.code === detectedLanguage)?.label ?? dictionary.languageName}
            </p>
          </header>

          <div className="flex-1 overflow-y-auto bg-gradient-to-b from-white to-green-50 px-4 py-4 sm:px-5">
            {showNameOnboarding ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-medium text-amber-900"
              >
                {dictionary.chat.onboardingQuestion}
              </motion.div>
            ) : null}

            {userName && dictionary.chat.quickPrompts.length > 0 ? (
              <div className="mb-4 flex flex-wrap gap-2">
                <p className="w-full text-xs font-semibold uppercase tracking-[0.14em] text-green-700">
                  {dictionary.chat.quickPromptLabel}
                </p>
                {dictionary.chat.quickPrompts.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => {
                      void sendMessage(prompt);
                    }}
                    disabled={isLoading}
                    className="rounded-full border border-green-200 bg-white px-3 py-1.5 text-xs font-semibold text-green-900 transition hover:border-secondary disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            ) : null}

            <div className="space-y-3">
              {activeThread.messages.map((message) => {
                const isUser = message.role === "user";
                return (
                  <div key={message.id} className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[88%] rounded-[22px] px-4 py-3 text-sm leading-relaxed shadow-sm sm:max-w-[74%] ${
                        isUser
                          ? "bg-gradient-to-br from-primary to-green-700 text-white"
                          : "border border-green-100 bg-white text-green-950"
                      }`}
                    >
                      <p className="mb-1 text-[11px] font-bold uppercase tracking-wide opacity-80">
                        {isUser ? dictionary.chat.youLabel : dictionary.chat.assistantLabel}
                      </p>
                      <p>{message.content}</p>
                    </div>
                  </div>
                );
              })}

              {isLoading ? (
                <div className="flex justify-start">
                  <div className="rounded-2xl border border-green-100 bg-white px-4 py-3 text-sm text-green-900">
                    <p className="text-[11px] font-bold uppercase tracking-wide opacity-80">
                      {dictionary.chat.assistantLabel}
                    </p>
                    <div className="mt-2 flex items-center gap-1">
                      <span className="h-2 w-2 animate-bounce rounded-full bg-secondary [animation-delay:0ms]" />
                      <span className="h-2 w-2 animate-bounce rounded-full bg-secondary [animation-delay:120ms]" />
                      <span className="h-2 w-2 animate-bounce rounded-full bg-secondary [animation-delay:240ms]" />
                      <span className="ml-1 text-xs text-green-800">{dictionary.chat.analyzing}</span>
                    </div>
                  </div>
                </div>
              ) : null}

              <div ref={scrollAnchorRef} />
            </div>
          </div>

          <form onSubmit={handleSubmit} className="border-t border-green-100 bg-white px-4 py-4 sm:px-5">
            <div className="flex gap-2">
              <input
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder={showNameOnboarding ? dictionary.chat.onboardingPlaceholder : dictionary.chat.messagePlaceholder}
                className="w-full rounded-xl border border-green-200 bg-white px-4 py-3 text-sm outline-none ring-primary transition focus:ring-2"
                maxLength={1500}
              />
              <button
                type="submit"
                disabled={!canSend}
                className="rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {showNameOnboarding ? dictionary.chat.saveName : dictionary.chat.send}
              </button>
            </div>

            {errorText ? (
              <p className="mt-2 text-xs font-medium text-red-700">{errorText}</p>
            ) : null}
          </form>
        </div>
      </div>
    </section>
  );
}
