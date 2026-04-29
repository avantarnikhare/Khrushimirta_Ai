import type { Metadata } from "next";
import { AboutShowcase } from "@/components/about-showcase";

export const metadata: Metadata = {
  title: "About",
};

export default function AboutPage() {
  return <AboutShowcase />;
}
