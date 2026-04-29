import type { Metadata } from "next";
import { CropGuideExplorer } from "@/components/crop-guide-explorer";

export const metadata: Metadata = {
  title: "Crop Guide",
};

export default function CropGuidePage() {
  return <CropGuideExplorer />;
}
