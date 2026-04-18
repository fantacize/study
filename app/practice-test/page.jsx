"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { practiceTests } from "../../practice-tests.js";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";

function padPage(n) {
  return String(n).padStart(2, "0");
}

function formatTime(sec) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export default function PracticeTestPage() {
  const [activeTest, setActiveTest] = useState(null);
  const [mcqAnswers, setMcqAnswers] = useState({});
  const [sourceResponses, setSourceResponses] = useState({});
  const [shortAnswers, setShortAnswers] = useState({});
  const [revealedRubrics, setRevealedRubrics] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [startedAt, setStartedAt] = useState(null);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    if (!activeTest || submitted) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [activeTest, submitted]);

  const elapsed = useMemo(() => (startedAt ? Math.floor((now - startedAt) / 1000) : 0), [startedAt, now]);
  const limitSec = activeTest ? activeTest.minutes * 60 : 0;
  const remaining = Math.max(0, limitSec - elapsed);

  useEffect(() => {
    if (activeTest && !submitted && limitSec > 0 && elapsed >= limitSec) {
      setSubmitted(true);
    }
  }, [elapsed, limitSec, activeTest, submitted]);

  function startTest(t) {
    setActiveTest(t);
    setMcqAnswers({});
    setSourceResponses({});
    setShortAnswers({});
    setRevealedRubrics({});
    setSubmitted(false);
    setStartedAt(Date.now());
    setNow(Date.now());
  }

  function exitTest() {
    setActiveTest(null);
    setSubmitted(false);
  }

  const mcqScore = useMemo(() => {
    if (!activeTest) return { correct: 0, total: 0 };
    let c = 0;
    activeTest.mcq.forEach((q, i) => {
      if (mcqAnswers[i] === q.answerIndex) c += 1;
    });
    return { correct: c, total: activeTest.mcq.length };
  }, [activeTest, mcqAnswers]);

  if (!activeTest) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <header className="border-b border-border">
          <div className="mx-auto max-w-6xl px-4 py-6">
            <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
              ← Back to study app
            </Link>
            <h1 className="mt-2 text-3xl font-bold tracking-tight">Practice Tests</h1>
            <p className="mt-2 max-w-3xl text-muted-foreground">
              Full-format midterm simulations: multiple choice, primary-source / political-cartoon
              analysis, and short answer. Timer runs, score shown at submit, model rubrics revealed
              after you write.
            </p>
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-4 py-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {practiceTests.map((t) => (
              <Card key={t.id} className="flex flex-col">
                <CardHeader>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge>{t.minutes} min</Badge>
                    <Badge variant="secondary">{t.mcq.length} MCQ · {t.sources.length} sources · {t.shortAnswer.length} SA</Badge>
                  </div>
                  <CardTitle className="mt-2 text-lg">{t.title}</CardTitle>
                </CardHeader>
                <CardContent className="flex-1">
                  <p className="text-sm text-muted-foreground">{t.focus}</p>
                </CardContent>
                <div className="p-4 pt-0">
                  <Button className="w-full" onClick={() => startTest(t)}>Start test</Button>
                </div>
              </Card>
            ))}
          </div>

          <div className="mt-8 rounded-lg border border-border bg-card p-4">
            <h2 className="mb-2 text-sm font-semibold">How to use these</h2>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>• Set aside the full time. Don't pause for lookup — simulate exam conditions.</li>
              <li>• MCQ scores automatically. Open response is self-scored against a model rubric.</li>
              <li>• After submit, re-take any section by starting the test again.</li>
              <li>• Primary sources load from the class PDFs — click image to zoom.</li>
            </ul>
          </div>
        </main>
      </div>
    );
  }

  // === TEST RUNNING VIEW ===
  return (
    <div className="min-h-screen bg-background text-foreground pb-24">
      <header className="sticky top-0 z-20 border-b border-border bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
          <div className="min-w-0">
            <Button variant="ghost" size="sm" onClick={exitTest} className="-ml-2">
              ← Exit
            </Button>
            <h1 className="mt-1 truncate text-lg font-semibold">{activeTest.title}</h1>
          </div>
          <div className="flex items-center gap-3">
            {submitted ? (
              <Badge className="text-sm">Submitted — {mcqScore.correct} / {mcqScore.total} MCQ</Badge>
            ) : (
              <div className="text-right">
                <div className={`tabular-nums text-lg font-semibold ${remaining < 300 ? "text-red-500" : ""}`}>
                  {formatTime(remaining)}
                </div>
                <div className="text-[10px] text-muted-foreground">time left</div>
              </div>
            )}
            {!submitted && (
              <Button size="sm" onClick={() => setSubmitted(true)}>Submit</Button>
            )}
          </div>
        </div>
        {!submitted && (
          <div className="mx-auto max-w-5xl px-4 pb-3">
            <Progress value={Math.min(100, (elapsed / limitSec) * 100)} />
          </div>
        )}
      </header>

      <main className="mx-auto max-w-5xl space-y-10 px-4 py-6">
        {/* SECTION A: MCQ */}
        <section>
          <h2 className="mb-1 text-xl font-bold">Section A — Multiple Choice</h2>
          <p className="mb-4 text-sm text-muted-foreground">
            {activeTest.mcq.length} questions. Select the best answer.
          </p>
          <ol className="space-y-6">
            {activeTest.mcq.map((q, i) => {
              const selected = mcqAnswers[i];
              return (
                <li key={i} className="rounded-lg border border-border bg-card p-4">
                  <p className="mb-3 text-sm font-medium">
                    <span className="text-muted-foreground">{i + 1}.</span> {q.question}
                  </p>
                  <div className="space-y-2">
                    {q.options.map((opt, j) => {
                      const isSelected = selected === j;
                      const isAnswer = j === q.answerIndex;
                      const showCorrectness = submitted;
                      return (
                        <button
                          key={j}
                          disabled={submitted}
                          onClick={() => setMcqAnswers((m) => ({ ...m, [i]: j }))}
                          className={`block w-full rounded-md border px-3 py-2 text-left text-sm transition ${
                            showCorrectness && isAnswer
                              ? "border-green-600 bg-green-50 dark:bg-green-950"
                              : showCorrectness && isSelected && !isAnswer
                              ? "border-red-600 bg-red-50 dark:bg-red-950"
                              : isSelected
                              ? "border-foreground bg-accent"
                              : "border-border hover:border-foreground/40"
                          }`}
                        >
                          <span className="mr-2 font-mono text-xs text-muted-foreground">
                            {String.fromCharCode(65 + j)}.
                          </span>
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                  {submitted && (
                    <p className="mt-3 rounded bg-muted/50 p-2 text-xs text-muted-foreground">
                      <strong>Explanation:</strong> {q.explanation}
                    </p>
                  )}
                </li>
              );
            })}
          </ol>
        </section>

        {/* SECTION B: Sources */}
        <section>
          <h2 className="mb-1 text-xl font-bold">Section B — Primary Source / Political Cartoon Analysis</h2>
          <p className="mb-4 text-sm text-muted-foreground">
            Examine each source and respond in paragraph form.
          </p>
          <div className="space-y-8">
            {activeTest.sources.map((s, i) => (
              <div key={i} className="rounded-lg border border-border bg-card p-4">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-sm font-medium">
                    <span className="text-muted-foreground">Source {i + 1}.</span> {s.title}
                  </p>
                  <Link
                    href="/primary-sources"
                    target="_blank"
                    className="text-xs text-muted-foreground underline-offset-4 hover:underline"
                  >
                    open deck ↗
                  </Link>
                </div>
                <div className="grid gap-4 md:grid-cols-[1fr_1fr]">
                  <div className="rounded border border-border bg-muted/30 p-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`/primary-sources/${s.slug}/page-${padPage(s.page)}.jpg`}
                      alt={s.title}
                      className="mx-auto h-auto max-w-full"
                    />
                  </div>
                  <div>
                    <p className="mb-2 text-sm font-medium">Prompt</p>
                    <p className="mb-3 rounded bg-muted/50 p-3 text-sm">{s.prompt}</p>
                    <Textarea
                      rows={10}
                      placeholder="Write your response..."
                      value={sourceResponses[i] || ""}
                      onChange={(e) => setSourceResponses((r) => ({ ...r, [i]: e.target.value }))}
                      disabled={submitted}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION C: Short Answer */}
        <section>
          <h2 className="mb-1 text-xl font-bold">Section C — Short Answer</h2>
          <p className="mb-4 text-sm text-muted-foreground">
            Write concise but substantive paragraphs (4-7 sentences).
          </p>
          <div className="space-y-6">
            {activeTest.shortAnswer.map((sa, i) => (
              <div key={i} className="rounded-lg border border-border bg-card p-4">
                <p className="mb-2 text-sm font-medium">
                  <span className="text-muted-foreground">{i + 1}.</span> {sa.prompt}
                </p>
                <Textarea
                  rows={7}
                  placeholder="Write your response..."
                  value={shortAnswers[i] || ""}
                  onChange={(e) => setShortAnswers((r) => ({ ...r, [i]: e.target.value }))}
                  disabled={submitted}
                />
                <div className="mt-2 flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setRevealedRubrics((r) => ({ ...r, [i]: !r[i] }))}
                  >
                    {revealedRubrics[i] ? "Hide rubric" : "Show model rubric"}
                  </Button>
                </div>
                {revealedRubrics[i] && (
                  <div className="mt-3 rounded bg-muted/50 p-3 text-sm">
                    <p className="mb-1 text-xs font-semibold text-muted-foreground">Model rubric — your answer should hit most of these:</p>
                    <ul className="list-disc space-y-1 pl-5">
                      {sa.rubric.map((pt, k) => (
                        <li key={k}>{pt}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {submitted && (
          <section className="rounded-lg border border-border bg-card p-6">
            <h2 className="mb-2 text-xl font-bold">Results</h2>
            <p className="mb-2 text-lg">
              MCQ: <strong>{mcqScore.correct} / {mcqScore.total}</strong>
              {" "}({Math.round((mcqScore.correct / Math.max(1, mcqScore.total)) * 100)}%)
            </p>
            <p className="text-sm text-muted-foreground">
              Open-response questions are self-scored. Reveal each rubric above and compare against
              your answer honestly. Hit 70% or more of the rubric bullets = solid answer.
            </p>
            <div className="mt-4 flex gap-2">
              <Button onClick={() => startTest(activeTest)}>Retake this test</Button>
              <Button variant="outline" onClick={exitTest}>Pick a different test</Button>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
