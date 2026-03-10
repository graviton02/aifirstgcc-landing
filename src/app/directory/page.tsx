import { Suspense } from "react";
import { DirectoryContent } from "@/components/directory/DirectoryContent";

export default function DirectoryPage() {
  return (
    <Suspense>
      <DirectoryContent />
    </Suspense>
  );
}
