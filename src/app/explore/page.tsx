import type { Metadata } from "next";
import { BrandShowcase } from "@/components/brand-showcase/BrandShowcase";

export const metadata: Metadata = {
  title: "Explore Orbys360, OpenMesh360 and GCCWorx360",
  description:
    "Three distinct platforms for GCC knowledge, vendor discovery and decision intelligence.",
};

export default function ExplorePage() {
  return <BrandShowcase />;
}
