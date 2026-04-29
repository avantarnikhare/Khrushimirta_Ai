import type { Metadata } from "next";
import { AiAdvisorOverview } from "@/components/ai-advisor-overview";

export const metadata: Metadata = {
  title: "AI Chat Advisor",
};

export default function AiAdvisorPage() {
  return <AiAdvisorOverview />;
}
