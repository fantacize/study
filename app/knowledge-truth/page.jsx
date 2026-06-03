"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

// Direct entry point for the Knowledge & Truth (Philosophy Ch. 5-6) study set.
// The studio lives in app/page.jsx and reads the active subject from
// localStorage under "study-subject", so we set that here and hand off to "/",
// which then loads the Ch 5-6 data and opens the One-Day Memorize plan.
export default function KnowledgeTruthPage() {
  const router = useRouter();

  useEffect(() => {
    try {
      localStorage.setItem("study-subject", JSON.stringify("philosophy-ch5-ch6"));
    } catch {}
    router.replace("/");
  }, [router]);

  return (
    <main className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-4 text-center">
      <h1 className="text-2xl font-semibold tracking-tight">Knowledge &amp; Truth</h1>
      <p className="mt-2 text-muted-foreground">
        Opening the Chapters 5 &amp; 6 study set&hellip;
      </p>
      <Link
        href="/"
        className="mt-6 font-medium underline-offset-4 hover:underline"
      >
        Continue
      </Link>
    </main>
  );
}
