"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { studyData } from "../data.js";
import { amstudsData } from "../amstuds-data.js";
import { cn } from "@/lib/utils";
import { useLocalStorage, useStudyTimer } from "@/lib/hooks";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";

function matchesSearch(parts, term) {
  if (!term) return true;
  return parts.join(" ").toLowerCase().includes(term);
}

function shuffle(array) {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

// Deterministic shuffle based on a seed string (question text)
// so the same question always gets the same shuffle per session
function seededShuffle(array, seed) {
  const copy = [...array];
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = ((h << 5) - h + seed.charCodeAt(i)) | 0;
  }
  for (let i = copy.length - 1; i > 0; i--) {
    h = ((h << 5) - h + i) | 0;
    const j = Math.abs(h) % (i + 1);
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function getScoreText(score) {
  if (score === 2) return "Nailed it. Move on or rewrite once more for speed.";
  if (score === 1) return "Almost there. Tighten the missing ideas and retry later.";
  if (score === 0) return "Needs work. Come back after MCQ or matching and retry.";
  return "Write your answer, reveal the checklist, then self-score honestly.";
}

function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function LandingPage({ onSelect, darkMode, setDarkMode }) {
  const subjects = [
    { id: "philosophy", label: "Philosophy", description: "Chapters 1 & 2 — What Philosophy Is, Models of Human Nature", icon: "🏛️", color: "from-violet-500 to-purple-600" },
    { id: "amstuds", label: "AmStuds", description: "Cold War, Affluent Society, Civil Rights, Vietnam, Nixon", icon: "🇺🇸", color: "from-blue-500 to-red-500" },
  ];

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-4xl flex-col items-center justify-center px-4 py-12">
      <div className="absolute right-4 top-4">
        <Button variant="outline" size="sm" onClick={() => setDarkMode((v) => !v)}>
          {darkMode ? "Light" : "Dark"}
        </Button>
      </div>
      <h1 className="mb-2 text-4xl font-bold tracking-tight">Study Studio</h1>
      <p className="mb-10 text-lg text-muted-foreground">Pick a subject</p>
      <div className="grid w-full gap-6 sm:grid-cols-2">
        {subjects.map((s) => (
          <Card
            key={s.id}
            className="group cursor-pointer transition-all hover:shadow-lg hover:-translate-y-1"
            onClick={() => onSelect(s.id)}
          >
            <CardContent className="flex flex-col items-center p-8 text-center">
              <div className={cn("mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br text-3xl", s.color)}>
                {s.icon}
              </div>
              <h2 className="mb-2 text-2xl font-bold">{s.label}</h2>
              <p className="text-sm text-muted-foreground">{s.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default function Page() {
  const [subject, setSubject] = useLocalStorage("study-subject", null);
  const activeData = subject === "amstuds" ? amstudsData : studyData;

  const [chapter, setChapter] = useState("all");
  const [mode, setMode] = useState("overview");
  const [search, setSearch] = useState("");
  const [darkMode, setDarkMode] = useLocalStorage("study-dark-mode", false);
  const [showSummary, setShowSummary] = useState(false);

  // Term IDs state
  const [termIndex, setTermIndex] = useState(0);
  const [termRevealed, setTermRevealed] = useState(false);
  const [termDraft, setTermDraft] = useState("");
  const [termScores, setTermScores] = useLocalStorage("study-term-scores", {});
  const [termShuffled, setTermShuffled] = useState(false);

  // Dark mode effect
  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  // Flashcards
  const [flashcardIndex, setFlashcardIndex] = useState(0);
  const [flashcardFlipped, setFlashcardFlipped] = useState(false);
  const [cardsReviewed, setCardsReviewed] = useLocalStorage("study-cards-reviewed", 0);
  const [toughCards, setToughCards] = useLocalStorage("study-tough-cards", []);
  const [showToughOnly, setShowToughOnly] = useState(false);
  const [confidenceStats, setConfidenceStats] = useLocalStorage("study-confidence", {});

  // Quiz
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizAnswered, setQuizAnswered] = useState(false);
  const [quizSelectedIndex, setQuizSelectedIndex] = useState(null);
  const [quizResults, setQuizResults] = useLocalStorage("study-quiz-results", []);
  const [missedQuestions, setMissedQuestions] = useLocalStorage("study-missed-questions", []);
  const [tagStats, setTagStats] = useLocalStorage("study-tag-stats", {});

  // Free Response
  const [freeResponseIndex, setFreeResponseIndex] = useState(0);
  const [freeResponseChecklistOpen, setFreeResponseChecklistOpen] = useState(false);
  const [freeResponseDrafts, setFreeResponseDrafts] = useLocalStorage("study-fr-drafts", {});
  const [freeResponseScores, setFreeResponseScores] = useLocalStorage("study-fr-scores", {});

  // Matching
  const [matchingSetIndex, setMatchingSetIndex] = useState(0);
  const [matchingDefinitionOrder, setMatchingDefinitionOrder] = useState([]);
  const [matchingSelectedTerm, setMatchingSelectedTerm] = useState(null);
  const [matchingSelectedDefinition, setMatchingSelectedDefinition] = useState(null);
  const [matchingMatchedPairs, setMatchingMatchedPairs] = useState([]);
  const [matchingFeedback, setMatchingFeedback] = useState("");
  const [matchingAttempts, setMatchingAttempts] = useLocalStorage("study-match-attempts", 0);
  const [matchingCorrect, setMatchingCorrect] = useLocalStorage("study-match-correct", 0);

  // Timer
  const [timedMode, setTimedMode] = useState(false);
  const timer = useStudyTimer();

  // Review mistakes quiz state
  const [reviewIndex, setReviewIndex] = useState(0);
  const [reviewAnswered, setReviewAnswered] = useState(false);
  const [reviewSelectedIndex, setReviewSelectedIndex] = useState(null);

  // Political Cartoons
  const [cartoonIndex, setCartoonIndex] = useState(0);
  const [cartoonSection, setCartoonSection] = useState("description"); // description, symbols, context, message, questions
  const [cartoonAnswers, setCartoonAnswers] = useLocalStorage("study-cartoon-answers", {});

  // Mock Test
  const [mockTestActive, setMockTestActive] = useState(false);
  const [mockTestConfig, setMockTestConfig] = useState({ mcqCount: 15, shortAnswerCount: 2, cartoonCount: 1, durationMin: 45 });
  const [mockTestQuestions, setMockTestQuestions] = useState(null); // { mcq: [], short: [], cartoons: [] }
  const [mockTestAnswers, setMockTestAnswers] = useState({ mcq: {}, short: {}, cartoon: {} });
  const [mockTestComplete, setMockTestComplete] = useState(false);
  const [mockTestTimeLeft, setMockTestTimeLeft] = useState(0);
  const [mockTestStartTime, setMockTestStartTime] = useState(null);

  // Spaced repetition — priority queue for flashcards
  const [srSmartMode, setSrSmartMode] = useState(false);

  // Filtered data
  const filteredFlashcards = useMemo(() => {
    let cards = activeData.flashcards.filter((card) => {
      const chapterMatch = chapter === "all" || card.chapter === chapter;
      const searchMatch = matchesSearch([card.tag, card.prompt, card.answer], search);
      return chapterMatch && searchMatch;
    });
    if (showToughOnly) {
      cards = cards.filter((card) => toughCards.includes(card.prompt));
    }
    // Spaced repetition: prioritize cards marked "didnt-know" or tough, then untouched, then known
    if (srSmartMode) {
      const priority = (card) => {
        if (confidenceStats[card.prompt] === "didnt-know") return 0;
        if (toughCards.includes(card.prompt)) return 1;
        if (!confidenceStats[card.prompt]) return 2;
        return 3; // known
      };
      cards = [...cards].sort((a, b) => priority(a) - priority(b));
    }
    return cards;
  }, [chapter, search, showToughOnly, toughCards, srSmartMode, confidenceStats, activeData]);

  // Filtered political cartoons
  const filteredCartoons = useMemo(() => {
    if (!activeData.politicalCartoons) return [];
    return activeData.politicalCartoons.filter((c) => {
      const chapterMatch = chapter === "all" || c.chapter === chapter;
      const searchMatch = matchesSearch(
        [c.title, c.artist, c.description, c.message, (c.symbols || []).join(" ")],
        search
      );
      return chapterMatch && searchMatch;
    });
  }, [activeData, chapter, search]);

  const currentCartoon = filteredCartoons[Math.min(cartoonIndex, Math.max(filteredCartoons.length - 1, 0))];

  const filteredQuiz = useMemo(
    () =>
      activeData.quiz.filter((item) => {
        const chapterMatch = chapter === "all" || item.chapter === chapter;
        const searchMatch = matchesSearch(
          [item.tag, item.question, item.options.join(" "), item.explanation],
          search
        );
        return chapterMatch && searchMatch;
      }),
    [activeData, chapter, search]
  );

  const missedQuizItems = useMemo(
    () => activeData.quiz.filter((item) => missedQuestions.includes(item.question)),
    [activeData, missedQuestions]
  );

  const filteredFreeResponse = useMemo(
    () =>
      activeData.shortAnswers.filter((item) => {
        const chapterMatch = chapter === "all" || item.chapter === chapter;
        const searchMatch = matchesSearch([item.prompt, item.include.join(" ")], search);
        return chapterMatch && searchMatch;
      }),
    [activeData, chapter, search]
  );

  const filteredMatchingSets = useMemo(
    () =>
      activeData.matchingSets.filter((set) => {
        const chapterMatch = chapter === "all" || set.chapter === chapter;
        const searchMatch = matchesSearch(
          [set.title, ...set.pairs.map((p) => p.term), ...set.pairs.map((p) => p.definition)],
          search
        );
        return chapterMatch && searchMatch;
      }),
    [activeData, chapter, search]
  );

  const filteredComparisons = useMemo(
    () =>
      activeData.comparisons.filter((item) => {
        const chapterMatch = chapter === "all" || item.chapter === chapter;
        const searchMatch = matchesSearch([item.title, item.summary, item.whyItMatters], search);
        return chapterMatch && searchMatch;
      }),
    [activeData, chapter, search]
  );

  const overviewData = useMemo(() => {
    const chapterMap = activeData.overview.chapterMap.filter(
      (entry) => chapter === "all" || entry.chapter.toLowerCase().replace(" ", "-") === chapter
    );
    return {
      chapterMap: chapterMap.length ? chapterMap : activeData.overview.chapterMap,
      likelyQuestions: activeData.overview.likelyQuestions.filter((q) => matchesSearch([q], search)),
      cramChecklist: activeData.overview.cramChecklist.filter((item) => matchesSearch([item], search)),
    };
  }, [activeData, chapter, search]);

  // Weak topics — sorted by accuracy ascending
  const weakTopics = useMemo(() => {
    return Object.entries(tagStats)
      .map(([tag, { correct, total }]) => ({
        tag, correct, total,
        pct: total > 0 ? Math.round((correct / total) * 100) : 0,
      }))
      .sort((a, b) => a.pct - b.pct);
  }, [tagStats]);

  // ===== Overall mastery % =====
  const mastery = useMemo(() => {
    const totalFlashcards = activeData.flashcards.length;
    const totalQuiz = activeData.quiz.length;
    const totalFR = activeData.shortAnswers.length;
    const totalMatching = activeData.matchingSets.reduce((s, set) => s + set.pairs.length, 0);
    const totalItems = totalFlashcards + totalQuiz + totalFR + totalMatching;
    if (totalItems === 0) return 0;

    // Flashcard confidence: "knew" counts as mastered
    const knewCount = Object.values(confidenceStats).filter((v) => v === "knew").length;

    // Quiz: correct answers (unique questions)
    const quizCorrectSet = new Set();
    const quizWrongSet = new Set();
    // Use tagStats to estimate unique correct questions
    const totalTagCorrect = Object.values(tagStats).reduce((s, t) => s + t.correct, 0);
    const quizMastered = Math.min(totalTagCorrect, totalQuiz);

    // FR: scored 2 (nailed it)
    const frMastered = Object.values(freeResponseScores).filter((v) => v === 2).length;

    // Matching: use ratio
    const matchRatio = matchingAttempts > 0 ? matchingCorrect / matchingAttempts : 0;
    const matchMastered = Math.round(totalMatching * matchRatio);

    const mastered = knewCount + quizMastered + frMastered + matchMastered;
    return Math.min(100, Math.round((mastered / totalItems) * 100));
  }, [activeData, confidenceStats, tagStats, freeResponseScores, matchingCorrect, matchingAttempts]);

  // Shuffled quiz options — shuffle options per question using seeded shuffle
  const shuffledQuizOptions = useMemo(() => {
    if (!filteredQuiz.length) return null;
    const item = filteredQuiz[Math.min(quizIndex, filteredQuiz.length - 1)];
    if (!item) return null;
    const indices = item.options.map((_, i) => i);
    const shuffled = seededShuffle(indices, item.question + quizIndex);
    return {
      order: shuffled,
      correctShuffledIndex: shuffled.indexOf(item.answerIndex),
    };
  }, [filteredQuiz, quizIndex]);

  const flashcard =
    filteredFlashcards[Math.min(flashcardIndex, Math.max(filteredFlashcards.length - 1, 0))];
  const quizItem = filteredQuiz[Math.min(quizIndex, Math.max(filteredQuiz.length - 1, 0))];
  const freeResponsePrompt =
    filteredFreeResponse[Math.min(freeResponseIndex, Math.max(filteredFreeResponse.length - 1, 0))];
  const matchingSet =
    filteredMatchingSets[Math.min(matchingSetIndex, Math.max(filteredMatchingSets.length - 1, 0))];
  const reviewItem =
    missedQuizItems[Math.min(reviewIndex, Math.max(missedQuizItems.length - 1, 0))];

  // Reset indexes on filter change
  useEffect(() => {
    setFlashcardIndex(0);
    setFlashcardFlipped(false);
    setQuizIndex(0);
    setQuizAnswered(false);
    setQuizSelectedIndex(null);
    setFreeResponseIndex(0);
    setFreeResponseChecklistOpen(false);
    setMatchingSetIndex(0);
    setMatchingDefinitionOrder([]);
    setMatchingSelectedTerm(null);
    setMatchingSelectedDefinition(null);
    setMatchingMatchedPairs([]);
    setMatchingFeedback("");
  }, [chapter, search]);

  // Matching definition order
  useEffect(() => {
    if (!matchingSet) { setMatchingDefinitionOrder([]); return; }
    setMatchingDefinitionOrder((current) => {
      if (current.length === matchingSet.pairs.length) return current;
      return shuffle(matchingSet.pairs.map((_, i) => i));
    });
  }, [matchingSet]);

  // Matching pair check
  useEffect(() => {
    if (matchingSelectedTerm === null || matchingSelectedDefinition === null) return;
    setMatchingAttempts((v) => v + 1);
    if (matchingSelectedTerm === matchingSelectedDefinition) {
      setMatchingCorrect((v) => v + 1);
      setMatchingMatchedPairs((c) => [...c, matchingSelectedTerm]);
      setMatchingFeedback("Correct! Keep going.");
    } else {
      setMatchingFeedback("Not quite. Try another pairing.");
    }
    setMatchingSelectedTerm(null);
    setMatchingSelectedDefinition(null);
  }, [matchingSelectedTerm, matchingSelectedDefinition]);

  // Pause timer when leaving timed modes
  useEffect(() => {
    if (mode !== "quiz" && mode !== "free-response") timer.pause();
  }, [mode]);

  const totalMatchingPairs = filteredMatchingSets.reduce((sum, s) => sum + s.pairs.length, 0);
  const answeredQuiz = quizResults.length;
  const correctQuiz = quizResults.filter(Boolean).length;

  // ===== Actions =====

  function nextFlashcard(step = 1) {
    if (!filteredFlashcards.length) return;
    setFlashcardFlipped(false);
    setFlashcardIndex((c) => (c + step + filteredFlashcards.length) % filteredFlashcards.length);
    setCardsReviewed((v) => v + 1);
  }

  function randomFlashcard() {
    if (!filteredFlashcards.length) return;
    setFlashcardFlipped(false);
    setFlashcardIndex(Math.floor(Math.random() * filteredFlashcards.length));
    setCardsReviewed((v) => v + 1);
  }

  function toggleTough(prompt) {
    setToughCards((c) => c.includes(prompt) ? c.filter((x) => x !== prompt) : [...c, prompt]);
  }

  function rateConfidence(prompt, rating) {
    setConfidenceStats((c) => ({ ...c, [prompt]: rating }));
    // Auto-advance after rating
    setTimeout(() => nextFlashcard(1), 300);
  }

  function answerQuiz(originalIndex) {
    if (!quizItem || quizAnswered) return;
    setQuizSelectedIndex(originalIndex);
    setQuizAnswered(true);
    const isCorrect = originalIndex === quizItem.answerIndex;
    setQuizResults((c) => [...c, isCorrect]);
    setTagStats((prev) => {
      const tag = quizItem.tag;
      const existing = prev[tag] || { correct: 0, total: 0 };
      return { ...prev, [tag]: { correct: existing.correct + (isCorrect ? 1 : 0), total: existing.total + 1 } };
    });
    if (!isCorrect) {
      setMissedQuestions((c) => c.includes(quizItem.question) ? c : [...c, quizItem.question]);
    } else {
      setMissedQuestions((c) => c.filter((q) => q !== quizItem.question));
    }
    if (timedMode) timer.pause();
  }

  function nextQuiz() {
    if (!filteredQuiz.length) return;
    setQuizAnswered(false);
    setQuizSelectedIndex(null);
    setQuizIndex((c) => (c + 1) % filteredQuiz.length);
    if (timedMode) timer.start(45, () => handleQuizTimeout());
  }

  const handleQuizTimeout = useCallback(() => {
    if (!quizAnswered && quizItem) {
      setQuizAnswered(true);
      setQuizSelectedIndex(-1);
      setQuizResults((c) => [...c, false]);
      setTagStats((prev) => {
        const tag = quizItem.tag;
        const existing = prev[tag] || { correct: 0, total: 0 };
        return { ...prev, [tag]: { correct: existing.correct, total: existing.total + 1 } };
      });
      setMissedQuestions((c) => c.includes(quizItem.question) ? c : [...c, quizItem.question]);
    }
  }, [quizAnswered, quizItem]);

  function resetQuiz() {
    setQuizIndex(0);
    setQuizAnswered(false);
    setQuizSelectedIndex(null);
    setQuizResults([]);
    timer.reset();
  }

  function toggleTimedMode() {
    const next = !timedMode;
    setTimedMode(next);
    if (next && mode === "quiz" && !quizAnswered) {
      timer.start(45, () => handleQuizTimeout());
    } else if (next && mode === "free-response") {
      timer.start(300);
    } else {
      timer.reset();
    }
  }

  function answerReview(index) {
    if (!reviewItem || reviewAnswered) return;
    setReviewSelectedIndex(index);
    setReviewAnswered(true);
    if (index === reviewItem.answerIndex) {
      setMissedQuestions((c) => c.filter((q) => q !== reviewItem.question));
    }
  }

  function nextReview() {
    if (!missedQuizItems.length) return;
    setReviewAnswered(false);
    setReviewSelectedIndex(null);
    setReviewIndex((c) => (c + 1) % missedQuizItems.length);
  }

  function updateDraft(value) {
    if (!freeResponsePrompt) return;
    setFreeResponseDrafts((c) => ({ ...c, [freeResponsePrompt.prompt]: value }));
  }

  function scoreResponse(score) {
    if (!freeResponsePrompt) return;
    setFreeResponseScores((c) => ({ ...c, [freeResponsePrompt.prompt]: score }));
  }

  function nextFreeResponse() {
    if (!filteredFreeResponse.length) return;
    setFreeResponseChecklistOpen(false);
    setFreeResponseIndex((c) => (c + 1) % filteredFreeResponse.length);
    if (timedMode) timer.start(300);
  }

  function resetMatchingSet() {
    if (!matchingSet) return;
    setMatchingSelectedTerm(null);
    setMatchingSelectedDefinition(null);
    setMatchingMatchedPairs([]);
    setMatchingFeedback("");
    setMatchingDefinitionOrder(shuffle(matchingSet.pairs.map((_, i) => i)));
  }

  function nextMatchingSet() {
    if (!filteredMatchingSets.length) return;
    const next = (matchingSetIndex + 1) % filteredMatchingSets.length;
    setMatchingSetIndex(next);
    setMatchingSelectedTerm(null);
    setMatchingSelectedDefinition(null);
    setMatchingMatchedPairs([]);
    setMatchingFeedback("");
    const nextSet = filteredMatchingSets[next];
    setMatchingDefinitionOrder(shuffle(nextSet.pairs.map((_, i) => i)));
  }

  // ===== Political Cartoons =====
  function nextCartoon(direction = 1) {
    if (!filteredCartoons.length) return;
    const next = (cartoonIndex + direction + filteredCartoons.length) % filteredCartoons.length;
    setCartoonIndex(next);
    setCartoonSection("description");
  }

  function saveCartoonAnswer(cartoonTitle, questionIdx, value) {
    setCartoonAnswers((c) => ({
      ...c,
      [cartoonTitle]: { ...(c[cartoonTitle] || {}), [questionIdx]: value },
    }));
  }

  // ===== Mock Test =====
  function startMockTest() {
    const pool = activeData.quiz.filter((q) => chapter === "all" || q.chapter === chapter);
    const shortPool = activeData.shortAnswers.filter((s) => chapter === "all" || s.chapter === chapter);
    const cartoonPool = (activeData.politicalCartoons || []).filter((c) => chapter === "all" || c.chapter === chapter);
    const mcq = shuffle(pool).slice(0, mockTestConfig.mcqCount);
    const short = shuffle(shortPool).slice(0, mockTestConfig.shortAnswerCount);
    const cartoons = shuffle(cartoonPool).slice(0, mockTestConfig.cartoonCount);
    setMockTestQuestions({ mcq, short, cartoons });
    setMockTestAnswers({ mcq: {}, short: {}, cartoon: {} });
    setMockTestActive(true);
    setMockTestComplete(false);
    setMockTestTimeLeft(mockTestConfig.durationMin * 60);
    setMockTestStartTime(Date.now());
  }

  function submitMockTest() {
    setMockTestActive(false);
    setMockTestComplete(true);
  }

  function resetMockTest() {
    setMockTestActive(false);
    setMockTestComplete(false);
    setMockTestQuestions(null);
    setMockTestAnswers({ mcq: {}, short: {}, cartoon: {} });
  }

  function mockTestMcqAnswer(idx, optionIdx) {
    setMockTestAnswers((c) => ({ ...c, mcq: { ...c.mcq, [idx]: optionIdx } }));
  }

  function mockTestShortAnswer(idx, text) {
    setMockTestAnswers((c) => ({ ...c, short: { ...c.short, [idx]: text } }));
  }

  function mockTestCartoonAnswer(idx, text) {
    setMockTestAnswers((c) => ({ ...c, cartoon: { ...c.cartoon, [idx]: text } }));
  }

  const mockTestScore = useMemo(() => {
    if (!mockTestQuestions || !mockTestComplete) return null;
    const mcqCorrect = mockTestQuestions.mcq.reduce((count, q, idx) => {
      return count + (mockTestAnswers.mcq[idx] === q.answerIndex ? 1 : 0);
    }, 0);
    return { mcqCorrect, mcqTotal: mockTestQuestions.mcq.length };
  }, [mockTestQuestions, mockTestAnswers, mockTestComplete]);

  // Mock test countdown timer
  useEffect(() => {
    if (!mockTestActive) return;
    if (mockTestTimeLeft <= 0) {
      submitMockTest();
      return;
    }
    const t = setTimeout(() => setMockTestTimeLeft((v) => v - 1), 1000);
    return () => clearTimeout(t);
  }, [mockTestActive, mockTestTimeLeft]);

  function resetAllProgress() {
    setCardsReviewed(0);
    setToughCards([]);
    setConfidenceStats({});
    setQuizResults([]);
    setMissedQuestions([]);
    setTagStats({});
    setFreeResponseDrafts({});
    setFreeResponseScores({});
    setMatchingAttempts(0);
    setMatchingCorrect(0);
    timer.reset();
    setTimedMode(false);
  }

  // ===== Keyboard Shortcuts =====
  useEffect(() => {
    function handleKey(e) {
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;

      if (mode === "flashcards") {
        if (e.code === "Space") { e.preventDefault(); flashcard && setFlashcardFlipped((v) => !v); }
        if (e.key === "ArrowRight" || e.key === "ArrowDown") { e.preventDefault(); nextFlashcard(1); }
        if (e.key === "ArrowLeft" || e.key === "ArrowUp") { e.preventDefault(); nextFlashcard(-1); }
        if (e.key === "s" || e.key === "S") randomFlashcard();
        if (e.key === "t" || e.key === "T") flashcard && toggleTough(flashcard.prompt);
      }

      if (mode === "quiz") {
        if (e.key === "ArrowRight" || e.key === "ArrowDown") { e.preventDefault(); nextQuiz(); }
        if (e.key >= "1" && e.key <= "4" && quizItem && !quizAnswered && shuffledQuizOptions) {
          const pressedIdx = parseInt(e.key) - 1;
          if (pressedIdx < shuffledQuizOptions.order.length) {
            answerQuiz(shuffledQuizOptions.order[pressedIdx]);
          }
        }
      }

      if (mode === "review-mistakes") {
        if (e.key === "ArrowRight" || e.key === "ArrowDown") { e.preventDefault(); nextReview(); }
        if (e.key >= "1" && e.key <= "4" && reviewItem && !reviewAnswered) {
          answerReview(parseInt(e.key) - 1);
        }
      }

      if (mode === "free-response") {
        if (e.key === "r" || e.key === "R") setFreeResponseChecklistOpen((v) => !v);
        if (e.key === "ArrowRight" || e.key === "ArrowDown") { e.preventDefault(); nextFreeResponse(); }
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [mode, flashcard, quizItem, quizAnswered, reviewItem, reviewAnswered, shuffledQuizOptions]);

  // Session summary data
  const summaryData = useMemo(() => {
    const knewCount = Object.values(confidenceStats).filter((v) => v === "knew").length;
    const didntKnowCount = Object.values(confidenceStats).filter((v) => v === "didnt-know").length;
    const topWeakTags = weakTopics.filter((t) => t.pct < 80).slice(0, 5);
    const frNailed = Object.values(freeResponseScores).filter((v) => v === 2).length;
    const frNeedWork = Object.values(freeResponseScores).filter((v) => v === 0).length;
    return { knewCount, didntKnowCount, topWeakTags, frNailed, frNeedWork };
  }, [confidenceStats, weakTopics, freeResponseScores]);

  const stats = [
    { label: "Flashcards", value: filteredFlashcards.length },
    { label: "MCQs", value: filteredQuiz.length },
    { label: "Free Response", value: filteredFreeResponse.length },
    { label: "Matching Pairs", value: totalMatchingPairs },
  ];

  const sessionStats = [
    { label: "Cards reviewed", value: cardsReviewed },
    { label: "MCQ score", value: `${correctQuiz}/${answeredQuiz}` },
    { label: "Responses scored", value: Object.keys(freeResponseScores).length },
    { label: "Matching score", value: `${matchingCorrect}/${matchingAttempts}` },
  ];

  // Filtered term IDs
  const filteredTermIds = useMemo(() => {
    if (!activeData.termIds) return [];
    return activeData.termIds.filter((t) => {
      const chapterMatch = chapter === "all" || t.unit === chapter;
      const searchMatch = matchesSearch([t.term, t.definition, t.tag], search);
      return chapterMatch && searchMatch;
    });
  }, [activeData, chapter, search]);

  const currentTerm = filteredTermIds[Math.min(termIndex, Math.max(filteredTermIds.length - 1, 0))];

  const shuffledTermIds = useMemo(() => {
    if (!termShuffled) return filteredTermIds;
    return shuffle(filteredTermIds);
  }, [filteredTermIds, termShuffled]);

  const displayTerm = termShuffled
    ? shuffledTermIds[Math.min(termIndex, Math.max(shuffledTermIds.length - 1, 0))]
    : currentTerm;

  const termList = termShuffled ? shuffledTermIds : filteredTermIds;

  function nextTerm(step = 1) {
    if (!termList.length) return;
    setTermRevealed(false);
    setTermDraft("");
    setTermIndex((c) => (c + step + termList.length) % termList.length);
  }

  function scoreTerm(term, score) {
    setTermScores((c) => ({ ...c, [term]: score }));
    setTimeout(() => nextTerm(1), 300);
  }

  // Reset state when switching subjects
  function selectSubject(id) {
    setSubject(id);
    setChapter("all");
    setMode("overview");
    setSearch("");
    setFlashcardIndex(0);
    setFlashcardFlipped(false);
    setQuizIndex(0);
    setQuizAnswered(false);
    setQuizSelectedIndex(null);
    setFreeResponseIndex(0);
    setFreeResponseChecklistOpen(false);
    setMatchingSetIndex(0);
    setMatchingSelectedTerm(null);
    setMatchingSelectedDefinition(null);
    setMatchingMatchedPairs([]);
    setMatchingFeedback("");
    setReviewIndex(0);
    setReviewAnswered(false);
    setReviewSelectedIndex(null);
    setCartoonIndex(0);
    setCartoonSection("description");
    setTermIndex(0);
    setTermRevealed(false);
    setTermDraft("");
    resetMockTest();
  }

  if (!subject) {
    return <LandingPage onSelect={selectSubject} darkMode={darkMode} setDarkMode={setDarkMode} />;
  }

  const subjectLabel = subject === "amstuds" ? "AmStuds" : "Philosophy";
  const subjectDesc = subject === "amstuds"
    ? "Cold War, Affluent Society, Civil Rights, Vietnam, Nixon"
    : "Active review for Chapters 1 & 2";

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8 flex items-start justify-between print:hidden">
        <div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={() => setSubject(null)}>
              &larr; Back
            </Button>
            <h1 className="text-3xl font-bold tracking-tight">{subjectLabel} Study Studio</h1>
          </div>
          <p className="mt-1 text-muted-foreground">
            {subjectDesc}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Mastery % */}
          <div className="flex items-center gap-2">
            <div className="text-right">
              <p className="text-2xl font-bold">{mastery}%</p>
              <p className="text-[10px] text-muted-foreground">mastery</p>
            </div>
            <div className="h-10 w-10">
              <svg viewBox="0 0 36 36" className="h-10 w-10 -rotate-90">
                <circle cx="18" cy="18" r="15.5" fill="none" stroke="currentColor" strokeWidth="3" className="text-muted" />
                <circle
                  cx="18" cy="18" r="15.5" fill="none" strokeWidth="3"
                  strokeDasharray={`${mastery * 0.974} 100`}
                  strokeLinecap="round"
                  className={cn(
                    mastery < 40 && "text-red-500",
                    mastery >= 40 && mastery < 70 && "text-yellow-500",
                    mastery >= 70 && "text-green-500"
                  )}
                  stroke="currentColor"
                />
              </svg>
            </div>
          </div>
          {missedQuestions.length > 0 && (
            <Badge variant="destructive">{missedQuestions.length} missed</Badge>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setDarkMode((v) => !v)}
          >
            {darkMode ? "Light" : "Dark"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSummary(true)}
          >
            Summary
          </Button>
        </div>
      </div>

      {/* Session Summary Modal */}
      {showSummary && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 print:hidden" onClick={() => setShowSummary(false)}>
          <Card className="mx-4 w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
            <CardHeader>
              <CardTitle>Study Session Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Overall mastery</span>
                <span className="text-2xl font-bold">{mastery}%</span>
              </div>
              <Progress value={mastery} className={cn("h-3", mastery < 40 && "[&>div]:bg-red-500", mastery >= 40 && mastery < 70 && "[&>div]:bg-yellow-500", mastery >= 70 && "[&>div]:bg-green-500")} />

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg border p-3">
                  <p className="text-lg font-semibold">{cardsReviewed}</p>
                  <p className="text-xs text-muted-foreground">Cards reviewed</p>
                </div>
                <div className="rounded-lg border p-3">
                  <p className="text-lg font-semibold">{correctQuiz}/{answeredQuiz}</p>
                  <p className="text-xs text-muted-foreground">MCQ accuracy</p>
                </div>
                <div className="rounded-lg border p-3">
                  <p className="text-lg font-semibold">{summaryData.knewCount}</p>
                  <p className="text-xs text-muted-foreground">Cards confident on</p>
                </div>
                <div className="rounded-lg border p-3">
                  <p className="text-lg font-semibold">{summaryData.didntKnowCount}</p>
                  <p className="text-xs text-muted-foreground">Cards unsure on</p>
                </div>
                <div className="rounded-lg border p-3">
                  <p className="text-lg font-semibold">{summaryData.frNailed}</p>
                  <p className="text-xs text-muted-foreground">FR nailed</p>
                </div>
                <div className="rounded-lg border p-3">
                  <p className="text-lg font-semibold">{missedQuestions.length}</p>
                  <p className="text-xs text-muted-foreground">Still missed</p>
                </div>
              </div>

              {summaryData.topWeakTags.length > 0 && (
                <div>
                  <p className="mb-2 text-sm font-semibold">Focus on these topics:</p>
                  <div className="space-y-2">
                    {summaryData.topWeakTags.map((t) => (
                      <div key={t.tag} className="flex items-center gap-2">
                        <span className="w-28 shrink-0 text-sm">{t.tag}</span>
                        <Progress value={t.pct} className={cn("h-2 flex-1", t.pct < 50 && "[&>div]:bg-red-500", t.pct >= 50 && "[&>div]:bg-yellow-500")} />
                        <span className="text-sm font-medium">{t.pct}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <Button className="w-full" onClick={() => setShowSummary(false)}>
                Back to studying
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Stats row */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4 print:hidden">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">{s.label}</p>
              <p className="text-2xl font-bold">{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Controls */}
      <div className="mb-6 space-y-4 print:hidden">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex flex-wrap gap-2">
            {activeData.chapters.map((ch) => (
              <Button key={ch.id} variant={chapter === ch.id ? "default" : "outline"} size="sm" onClick={() => setChapter(ch.id)}>
                {ch.label}
              </Button>
            ))}
          </div>
          <div className="w-full sm:w-64">
            <Input type="search" placeholder="Search concepts..." value={search} onChange={(e) => setSearch(e.target.value.trim().toLowerCase())} />
          </div>
        </div>

        <Tabs value={mode} onValueChange={setMode}>
          <TabsList>
            {activeData.modes.map((m) => (
              <TabsTrigger key={m.id} value={m.id}>
                {m.label}
                {m.id === "review-mistakes" && missedQuestions.length > 0 && (
                  <span className="ml-1 rounded-full bg-destructive px-1.5 py-0.5 text-[10px] text-destructive-foreground">
                    {missedQuestions.length}
                  </span>
                )}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <details className="text-xs text-muted-foreground">
          <summary className="cursor-pointer hover:text-foreground">Keyboard shortcuts</summary>
          <div className="mt-2 grid grid-cols-2 gap-x-6 gap-y-1 sm:grid-cols-4">
            <span><kbd className="rounded border px-1">Space</kbd> Flip card</span>
            <span><kbd className="rounded border px-1">&larr;</kbd><kbd className="rounded border px-1">&rarr;</kbd> Prev / Next</span>
            <span><kbd className="rounded border px-1">1-4</kbd> Answer MCQ</span>
            <span><kbd className="rounded border px-1">S</kbd> Shuffle</span>
            <span><kbd className="rounded border px-1">T</kbd> Toggle tough</span>
            <span><kbd className="rounded border px-1">R</kbd> Reveal checklist</span>
          </div>
        </details>
      </div>

      {/* Session tracker */}
      <div className="mb-6 print:hidden">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {sessionStats.map((s) => (
            <div key={s.label} className="rounded-lg border bg-card p-3">
              <p className="text-lg font-semibold">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>
        <div className="mt-2 flex justify-end">
          <Button variant="ghost" size="sm" className="text-xs text-muted-foreground" onClick={resetAllProgress}>
            Reset all progress
          </Button>
        </div>
      </div>

      {/* ===== TERM IDs ===== */}
      {mode === "term-ids" && activeData.termIds && (
        <div className="space-y-4 animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-semibold">Term IDs</h2>
              <Badge variant="secondary">{termList.length} terms</Badge>
            </div>
            <span className="text-sm text-muted-foreground">
              {termList.length ? `${termIndex + 1} of ${termList.length}` : "0 of 0"}
            </span>
          </div>

          <Card className="overflow-visible">
            <CardContent className="space-y-4 p-6">
              {displayTerm ? (
                <>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{displayTerm.tag}</Badge>
                    {termScores[displayTerm.term] && (
                      <Badge variant={termScores[displayTerm.term] === "knew" ? "outline" : "secondary"}>
                        {termScores[displayTerm.term] === "knew" ? "Confident" : "Needs work"}
                      </Badge>
                    )}
                  </div>
                  <h3 className="text-2xl font-bold">{displayTerm.term}</h3>
                  <p className="text-sm text-muted-foreground">Write what you know about this term, then reveal the answer.</p>
                  <Textarea
                    placeholder="What is this term? Describe it..."
                    className="min-h-[120px]"
                    value={termDraft}
                    onChange={(e) => setTermDraft(e.target.value)}
                  />
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" onClick={() => setTermRevealed((v) => !v)}>
                      {termRevealed ? "Hide answer" : "Reveal answer"}
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => nextTerm(-1)}>Previous</Button>
                    <Button variant="outline" size="sm" onClick={() => nextTerm(1)}>Next</Button>
                    <Button variant="outline" size="sm" onClick={() => { setTermShuffled((v) => !v); setTermIndex(0); }}>
                      {termShuffled ? "In order" : "Shuffle"}
                    </Button>
                  </div>
                  {termRevealed && (
                    <div className="rounded-lg border bg-muted/50 p-4">
                      <p className="text-sm font-semibold mb-1">Definition:</p>
                      <p className="text-sm leading-relaxed">{displayTerm.definition}</p>
                      <div className="mt-4 flex gap-2">
                        <Button
                          size="sm"
                          variant={termScores[displayTerm.term] === "knew" ? "default" : "outline"}
                          className={cn(termScores[displayTerm.term] !== "knew" && "border-green-500 text-green-700 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-950")}
                          onClick={() => scoreTerm(displayTerm.term, "knew")}
                        >
                          Knew it
                        </Button>
                        <Button
                          size="sm"
                          variant={termScores[displayTerm.term] === "didnt-know" ? "default" : "outline"}
                          className={cn(termScores[displayTerm.term] !== "didnt-know" && "border-red-500 text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950")}
                          onClick={() => scoreTerm(displayTerm.term, "didnt-know")}
                        >
                          Didn't know
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-muted-foreground">No terms match this filter.</p>
              )}
            </CardContent>
          </Card>

          {/* Term ID progress */}
          {Object.keys(termScores).length > 0 && (
            <div className="rounded-lg border bg-card p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold">Progress</span>
                <span className="text-sm text-muted-foreground">
                  {Object.values(termScores).filter((v) => v === "knew").length} / {termList.length} confident
                </span>
              </div>
              <Progress
                value={termList.length ? (Object.values(termScores).filter((v) => v === "knew").length / termList.length) * 100 : 0}
                className="h-2"
              />
            </div>
          )}
        </div>
      )}

      {/* ===== OVERVIEW ===== */}
      {mode === "overview" && (
        <div className="space-y-6 animate-in fade-in-0 slide-in-from-bottom-2 duration-300 print:hidden">
          {weakTopics.length > 0 && (
            <Card>
              <CardHeader><CardTitle className="text-base">Weak Topics</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {weakTopics.map((t) => (
                  <div key={t.tag} className="flex items-center gap-3">
                    <span className="w-32 shrink-0 text-sm font-medium">{t.tag}</span>
                    <Progress value={t.pct} className={cn("h-2 flex-1", t.pct < 50 && "[&>div]:bg-red-500", t.pct >= 50 && t.pct < 80 && "[&>div]:bg-yellow-500", t.pct >= 80 && "[&>div]:bg-green-500")} />
                    <span className={cn("w-12 text-right text-sm font-semibold", t.pct < 50 && "text-red-600 dark:text-red-400", t.pct >= 50 && t.pct < 80 && "text-yellow-600 dark:text-yellow-400", t.pct >= 80 && "text-green-600 dark:text-green-400")}>{t.pct}%</span>
                    <span className="text-xs text-muted-foreground">{t.correct}/{t.total}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader><CardTitle className="text-base">Chapter Map</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {overviewData.chapterMap.map((entry) => (
                  <div key={entry.chapter}>
                    <p className="mb-1 text-sm font-semibold">{entry.chapter}</p>
                    <ul className="list-disc space-y-1 pl-4 text-sm text-muted-foreground">
                      {entry.points.map((p) => <li key={p}>{p}</li>)}
                    </ul>
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-base">Likely Test Prompts</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {overviewData.likelyQuestions.map((q) => (
                  <p key={q} className="rounded-md bg-muted p-2 text-sm">{q}</p>
                ))}
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-base">Ultra-fast Cram</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {overviewData.cramChecklist.map((item) => (
                  <p key={item} className="border-l-2 border-primary pl-3 text-sm text-muted-foreground">{item}</p>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* ===== CONNECTIONS ===== */}
      {mode === "connections" && activeData.causeEffectChains && (
        <div className="space-y-6 animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
          {/* Cause-Effect Chains */}
          <div>
            <h2 className="text-lg font-semibold mb-4">Cause → Effect Chains</h2>
            <p className="text-sm text-muted-foreground mb-4">Follow how one event triggered the next. These chains are what essay questions test.</p>
            <div className="space-y-4">
              {(activeData.causeEffectChains || [])
                .filter((c) => chapter === "all" || c.chapter === chapter)
                .filter((c) => matchesSearch([c.title, ...c.chain.map((s) => s.event + " " + s.effect)], search))
                .map((chain) => (
                  <Card key={chain.title}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">
                          {activeData.chapters.find((ch) => ch.id === chain.chapter)?.label || chain.chapter}
                        </Badge>
                        <CardTitle className="text-base">{chain.title}</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-0">
                        {chain.chain.map((step, i) => (
                          <div key={i} className="flex gap-3">
                            <div className="flex flex-col items-center">
                              <div className={cn(
                                "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                                i === 0 ? "bg-primary text-primary-foreground" :
                                i === chain.chain.length - 1 ? "bg-destructive text-destructive-foreground" :
                                "bg-muted text-muted-foreground"
                              )}>
                                {i + 1}
                              </div>
                              {i < chain.chain.length - 1 && (
                                <div className="w-px flex-1 bg-border my-1" />
                              )}
                            </div>
                            <div className="pb-4">
                              <p className="text-sm font-semibold">{step.event}</p>
                              <p className="text-sm text-muted-foreground">{step.effect}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </div>

          {/* Cross-Unit Connections */}
          {activeData.crossConnections && (
            <div>
              <h2 className="text-lg font-semibold mb-4">Cross-Unit Connections</h2>
              <p className="text-sm text-muted-foreground mb-4">How themes link across units. Master these for essay questions that ask you to connect topics.</p>
              <div className="grid gap-4 md:grid-cols-2">
                {(activeData.crossConnections || [])
                  .filter((c) => chapter === "all" || c.units.includes(chapter))
                  .filter((c) => matchesSearch([c.title, c.explanation, ...c.examples], search))
                  .map((conn) => (
                    <Card key={conn.title}>
                      <CardHeader className="pb-3">
                        <div className="flex flex-wrap gap-1.5 mb-2">
                          {conn.units.map((u) => (
                            <Badge key={u} variant="outline" className="text-xs">
                              {activeData.chapters.find((ch) => ch.id === u)?.label || u}
                            </Badge>
                          ))}
                        </div>
                        <CardTitle className="text-base">{conn.title}</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <p className="text-sm leading-relaxed">{conn.explanation}</p>
                        <details className="group">
                          <summary className="cursor-pointer text-sm font-medium text-primary hover:underline">
                            Show examples ({conn.examples.length})
                          </summary>
                          <ul className="mt-2 list-disc space-y-1 pl-4 text-sm text-muted-foreground">
                            {conn.examples.map((ex, i) => <li key={i}>{ex}</li>)}
                          </ul>
                        </details>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ===== FLASHCARDS ===== */}
      {mode === "flashcards" && (
        <div className="space-y-4 animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-semibold">Active Recall Deck</h2>
              {showToughOnly && <Badge variant="secondary">{filteredFlashcards.length} tough cards</Badge>}
            </div>
            <span className="text-sm text-muted-foreground">
              {filteredFlashcards.length ? `${flashcardIndex + 1} of ${filteredFlashcards.length}` : "0 of 0"}
            </span>
          </div>

          <Card className="cursor-pointer overflow-visible transition-all hover:shadow-md" onClick={() => flashcard && setFlashcardFlipped((v) => !v)}>
            <CardContent className="flex min-h-[240px] flex-col gap-4 p-6">
              {flashcard ? (
                <>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{flashcard.tag}</Badge>
                    {toughCards.includes(flashcard.prompt) && <Badge variant="destructive">Tough</Badge>}
                    {confidenceStats[flashcard.prompt] && (
                      <Badge variant={confidenceStats[flashcard.prompt] === "knew" ? "outline" : "secondary"}>
                        {confidenceStats[flashcard.prompt] === "knew" ? "Confident" : "Unsure"}
                      </Badge>
                    )}
                  </div>
                  {!flashcardFlipped ? (
                    <>
                      <h3 className="my-4 text-xl font-semibold">{flashcard.prompt}</h3>
                      <p className="text-sm text-muted-foreground">Click or press Space to reveal</p>
                    </>
                  ) : (
                    <>
                      <Badge className="w-fit" variant="outline">Answer</Badge>
                      <p className="my-4 text-base leading-relaxed">{flashcard.answer}</p>
                      {/* Confidence rating */}
                      <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                        <Button
                          size="sm"
                          variant={confidenceStats[flashcard.prompt] === "knew" ? "default" : "outline"}
                          className={cn(confidenceStats[flashcard.prompt] !== "knew" && "border-green-500 text-green-700 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-950")}
                          onClick={() => rateConfidence(flashcard.prompt, "knew")}
                        >
                          Knew it
                        </Button>
                        <Button
                          size="sm"
                          variant={confidenceStats[flashcard.prompt] === "didnt-know" ? "default" : "outline"}
                          className={cn(confidenceStats[flashcard.prompt] !== "didnt-know" && "border-red-500 text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950")}
                          onClick={() => rateConfidence(flashcard.prompt, "didnt-know")}
                        >
                          Didn't know
                        </Button>
                      </div>
                    </>
                  )}
                </>
              ) : (
                <p className="text-muted-foreground">
                  {showToughOnly ? "No tough cards marked yet. Study some cards and mark the hard ones." : "No flashcards match this filter."}
                </p>
              )}
            </CardContent>
          </Card>

          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={() => nextFlashcard(-1)}>Previous</Button>
            <Button size="sm" onClick={() => setFlashcardFlipped((v) => !v)}>Flip</Button>
            <Button variant="outline" size="sm" onClick={() => flashcard && toggleTough(flashcard.prompt)}>
              {flashcard && toughCards.includes(flashcard.prompt) ? "Unmark tough" : "Mark tough"}
            </Button>
            <Button variant="outline" size="sm" onClick={() => nextFlashcard(1)}>Next</Button>
            <Button variant="outline" size="sm" onClick={randomFlashcard}>Shuffle</Button>
            <Button
              variant={showToughOnly ? "default" : "outline"} size="sm"
              onClick={() => { setShowToughOnly((v) => !v); setFlashcardIndex(0); setFlashcardFlipped(false); }}
              disabled={!showToughOnly && toughCards.length === 0}
            >
              Tough only ({toughCards.length})
            </Button>
            <Button
              variant={srSmartMode ? "default" : "outline"} size="sm"
              onClick={() => { setSrSmartMode((v) => !v); setFlashcardIndex(0); setFlashcardFlipped(false); }}
              title="Spaced repetition: prioritize cards you didn't know, then tough, then untouched, then known"
            >
              {srSmartMode ? "Smart mode ON" : "Smart mode"}
            </Button>
          </div>
          {srSmartMode && (
            <p className="text-xs text-muted-foreground">
              Smart mode orders cards by weakness: Didn't know → Tough → New → Known last.
            </p>
          )}
        </div>
      )}

      {/* ===== POLITICAL CARTOONS ===== */}
      {mode === "cartoons" && (
        <div className="space-y-4 animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Political Cartoon Analysis</h2>
            <span className="text-sm text-muted-foreground">
              {filteredCartoons.length ? `${cartoonIndex + 1} of ${filteredCartoons.length}` : "0 of 0"}
            </span>
          </div>

          {currentCartoon ? (
            <Card>
              <CardHeader>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="secondary">{currentCartoon.chapter}</Badge>
                  <Badge variant="outline">{currentCartoon.year}</Badge>
                </div>
                <CardTitle className="text-xl">{currentCartoon.title}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  <strong>Artist:</strong> {currentCartoon.artist} · <strong>Source:</strong> {currentCartoon.source}
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Section tabs */}
                <div className="flex flex-wrap gap-2">
                  {["description", "symbols", "context", "message", "questions"].map((s) => (
                    <Button
                      key={s}
                      variant={cartoonSection === s ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCartoonSection(s)}
                      className="capitalize"
                    >
                      {s}
                    </Button>
                  ))}
                </div>

                {cartoonSection === "description" && (
                  <div className="space-y-2">
                    <h4 className="font-semibold">What's in the cartoon:</h4>
                    <p className="text-sm leading-relaxed">{currentCartoon.description}</p>
                    <p className="text-xs text-muted-foreground">
                      Read the description carefully, then move through the sections to practice analysis.
                    </p>
                  </div>
                )}

                {cartoonSection === "symbols" && (
                  <div className="space-y-2">
                    <h4 className="font-semibold">Key symbols and their meanings:</h4>
                    <ul className="list-disc space-y-1 pl-5 text-sm">
                      {(currentCartoon.symbols || []).map((sym, i) => (
                        <li key={i}>{sym}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {cartoonSection === "context" && (
                  <div className="space-y-2">
                    <h4 className="font-semibold">Historical context:</h4>
                    <p className="text-sm leading-relaxed">{currentCartoon.context}</p>
                  </div>
                )}

                {cartoonSection === "message" && (
                  <div className="space-y-2">
                    <h4 className="font-semibold">The cartoon's argument:</h4>
                    <p className="text-sm leading-relaxed">{currentCartoon.message}</p>
                  </div>
                )}

                {cartoonSection === "questions" && (
                  <div className="space-y-3">
                    <h4 className="font-semibold">Analysis questions — write your own answers:</h4>
                    {(currentCartoon.questions || []).map((q, i) => (
                      <div key={i} className="space-y-1">
                        <p className="text-sm font-medium">{i + 1}. {q}</p>
                        <Textarea
                          placeholder="Your analysis..."
                          className="min-h-[60px]"
                          value={(cartoonAnswers[currentCartoon.title] || {})[i] || ""}
                          onChange={(e) => saveCartoonAnswer(currentCartoon.title, i, e.target.value)}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-6 text-sm text-muted-foreground">
                No political cartoons match this filter.
              </CardContent>
            </Card>
          )}

          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={() => nextCartoon(-1)}>Previous</Button>
            <Button variant="outline" size="sm" onClick={() => nextCartoon(1)}>Next</Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => { setCartoonIndex(Math.floor(Math.random() * filteredCartoons.length)); setCartoonSection("description"); }}
              disabled={!filteredCartoons.length}
            >
              Random
            </Button>
          </div>
        </div>
      )}

      {/* ===== MOCK TEST ===== */}
      {mode === "mock-test" && (
        <div className="space-y-4 animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
          {!mockTestActive && !mockTestComplete && (
            <Card>
              <CardHeader>
                <CardTitle>Mock Test</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Practice test format: MCQs, short answers, and a political cartoon analysis. Timed.
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium">MCQs</label>
                    <Input
                      type="number"
                      min="1"
                      max="50"
                      value={mockTestConfig.mcqCount}
                      onChange={(e) => setMockTestConfig((c) => ({ ...c, mcqCount: Math.max(1, parseInt(e.target.value) || 1) }))}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Short answers</label>
                    <Input
                      type="number"
                      min="0"
                      max="10"
                      value={mockTestConfig.shortAnswerCount}
                      onChange={(e) => setMockTestConfig((c) => ({ ...c, shortAnswerCount: Math.max(0, parseInt(e.target.value) || 0) }))}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Cartoon analysis</label>
                    <Input
                      type="number"
                      min="0"
                      max="5"
                      value={mockTestConfig.cartoonCount}
                      onChange={(e) => setMockTestConfig((c) => ({ ...c, cartoonCount: Math.max(0, parseInt(e.target.value) || 0) }))}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Duration (min)</label>
                    <Input
                      type="number"
                      min="5"
                      max="180"
                      value={mockTestConfig.durationMin}
                      onChange={(e) => setMockTestConfig((c) => ({ ...c, durationMin: Math.max(5, parseInt(e.target.value) || 45) }))}
                    />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Chapter: <strong>{chapter === "all" ? "All chapters" : chapter}</strong>. Change chapter selector at top to scope the test.
                </p>
                <Button onClick={startMockTest} className="w-full">Start Mock Test</Button>
              </CardContent>
            </Card>
          )}

          {mockTestActive && mockTestQuestions && (
            <>
              <Card>
                <CardContent className="flex items-center justify-between p-4">
                  <Badge variant={mockTestTimeLeft <= 60 ? "destructive" : "secondary"} className="tabular-nums text-base">
                    {formatTime(mockTestTimeLeft)} remaining
                  </Badge>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={resetMockTest}>Cancel</Button>
                    <Button size="sm" onClick={submitMockTest}>Submit</Button>
                  </div>
                </CardContent>
              </Card>

              {mockTestQuestions.mcq.length > 0 && (
                <Card>
                  <CardHeader><CardTitle>Section 1: Multiple Choice ({mockTestQuestions.mcq.length})</CardTitle></CardHeader>
                  <CardContent className="space-y-6">
                    {mockTestQuestions.mcq.map((q, idx) => (
                      <div key={idx} className="space-y-2">
                        <p className="text-sm font-medium">{idx + 1}. {q.question}</p>
                        <div className="grid gap-1">
                          {q.options.map((opt, optIdx) => (
                            <Button
                              key={optIdx}
                              variant={mockTestAnswers.mcq[idx] === optIdx ? "default" : "outline"}
                              size="sm"
                              className="h-auto justify-start whitespace-normal py-2 text-left"
                              onClick={() => mockTestMcqAnswer(idx, optIdx)}
                            >
                              <span className="mr-2 text-muted-foreground">{String.fromCharCode(65 + optIdx)}.</span>
                              {opt}
                            </Button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {mockTestQuestions.short.length > 0 && (
                <Card>
                  <CardHeader><CardTitle>Section 2: Short Answer ({mockTestQuestions.short.length})</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    {mockTestQuestions.short.map((s, idx) => (
                      <div key={idx} className="space-y-2">
                        <p className="text-sm font-medium">{idx + 1}. {s.prompt}</p>
                        <Textarea
                          placeholder="Your answer..."
                          className="min-h-[120px]"
                          value={mockTestAnswers.short[idx] || ""}
                          onChange={(e) => mockTestShortAnswer(idx, e.target.value)}
                        />
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {mockTestQuestions.cartoons.length > 0 && (
                <Card>
                  <CardHeader><CardTitle>Section 3: Political Cartoon Analysis ({mockTestQuestions.cartoons.length})</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    {mockTestQuestions.cartoons.map((c, idx) => (
                      <div key={idx} className="space-y-3 rounded border p-4">
                        <div>
                          <h4 className="font-semibold">{c.title} ({c.year})</h4>
                          <p className="text-xs text-muted-foreground">{c.artist} — {c.source}</p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold uppercase text-muted-foreground">Description</p>
                          <p className="text-sm">{c.description}</p>
                        </div>
                        <div className="space-y-2">
                          <p className="text-sm font-medium">Analyze this cartoon: What is its message? What symbols are used? What is the historical context? How might it have shaped public opinion?</p>
                          <Textarea
                            placeholder="Your analysis..."
                            className="min-h-[150px]"
                            value={mockTestAnswers.cartoon[idx] || ""}
                            onChange={(e) => mockTestCartoonAnswer(idx, e.target.value)}
                          />
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              <Button onClick={submitMockTest} className="w-full" size="lg">Submit Mock Test</Button>
            </>
          )}

          {mockTestComplete && mockTestQuestions && (
            <>
              <Card>
                <CardHeader><CardTitle>Mock Test Results</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  {mockTestScore && mockTestQuestions.mcq.length > 0 && (
                    <div>
                      <p className="text-lg font-semibold">
                        MCQ Score: {mockTestScore.mcqCorrect} / {mockTestScore.mcqTotal}
                        {" "}({Math.round((mockTestScore.mcqCorrect / mockTestScore.mcqTotal) * 100)}%)
                      </p>
                    </div>
                  )}
                  <p className="text-sm text-muted-foreground">
                    Short answers and cartoon analysis are self-graded. Review below against the checklist.
                  </p>
                  <Button onClick={resetMockTest} variant="outline">Take Another Test</Button>
                </CardContent>
              </Card>

              {mockTestQuestions.mcq.length > 0 && (
                <Card>
                  <CardHeader><CardTitle>MCQ Review</CardTitle></CardHeader>
                  <CardContent className="space-y-3">
                    {mockTestQuestions.mcq.map((q, idx) => {
                      const userAnswer = mockTestAnswers.mcq[idx];
                      const correct = userAnswer === q.answerIndex;
                      return (
                        <div key={idx} className={cn("rounded border p-3", correct ? "border-green-500 bg-green-50 dark:bg-green-950/30" : "border-red-500 bg-red-50 dark:bg-red-950/30")}>
                          <p className="text-sm font-medium">{idx + 1}. {q.question}</p>
                          <p className="text-xs mt-1">
                            Your answer: <strong>{userAnswer !== undefined ? q.options[userAnswer] : "(blank)"}</strong>
                          </p>
                          {!correct && (
                            <p className="text-xs text-green-700 dark:text-green-400">
                              Correct: <strong>{q.options[q.answerIndex]}</strong>
                            </p>
                          )}
                          <p className="text-xs mt-1 text-muted-foreground">{q.explanation}</p>
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>
              )}

              {mockTestQuestions.short.length > 0 && (
                <Card>
                  <CardHeader><CardTitle>Short Answer Review — check against checklist</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    {mockTestQuestions.short.map((s, idx) => (
                      <div key={idx} className="space-y-2 rounded border p-3">
                        <p className="text-sm font-medium">{idx + 1}. {s.prompt}</p>
                        <div>
                          <p className="text-xs font-semibold uppercase text-muted-foreground">Your answer:</p>
                          <p className="text-sm whitespace-pre-wrap">{mockTestAnswers.short[idx] || "(blank)"}</p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold uppercase text-muted-foreground">Checklist — did you include:</p>
                          <ul className="list-disc pl-5 text-xs">
                            {s.include.map((item, i) => <li key={i}>{item}</li>)}
                          </ul>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {mockTestQuestions.cartoons.length > 0 && (
                <Card>
                  <CardHeader><CardTitle>Cartoon Analysis Review</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    {mockTestQuestions.cartoons.map((c, idx) => (
                      <div key={idx} className="space-y-2 rounded border p-3">
                        <h4 className="font-semibold">{c.title} ({c.year})</h4>
                        <div>
                          <p className="text-xs font-semibold uppercase text-muted-foreground">Your analysis:</p>
                          <p className="text-sm whitespace-pre-wrap">{mockTestAnswers.cartoon[idx] || "(blank)"}</p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold uppercase text-muted-foreground">Symbols:</p>
                          <ul className="list-disc pl-5 text-xs">
                            {(c.symbols || []).map((sym, i) => <li key={i}>{sym}</li>)}
                          </ul>
                        </div>
                        <div>
                          <p className="text-xs font-semibold uppercase text-muted-foreground">Context:</p>
                          <p className="text-xs">{c.context}</p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold uppercase text-muted-foreground">Message:</p>
                          <p className="text-xs">{c.message}</p>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>
      )}

      {/* ===== MCQ ===== */}
      {mode === "quiz" && (
        <div className="space-y-4 animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-semibold">Multiple-Choice Drill</h2>
              {timedMode && (
                <Badge variant={timer.timeLeft <= 10 ? "destructive" : "secondary"} className="tabular-nums">
                  {formatTime(timer.timeLeft)}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button variant={timedMode ? "default" : "outline"} size="sm" onClick={toggleTimedMode}>
                {timedMode ? "Timer ON" : "Timed mode"}
              </Button>
              <span className="text-sm text-muted-foreground">
                {filteredQuiz.length ? `${quizIndex + 1} of ${filteredQuiz.length}` : "0 of 0"}
              </span>
            </div>
          </div>

          <Card>
            <CardContent className="space-y-4 p-6">
              {quizItem && shuffledQuizOptions ? (
                <>
                  <Badge variant="secondary">{quizItem.tag}</Badge>
                  <h3 className="text-lg font-semibold">{quizItem.question}</h3>
                  <div className="grid gap-2">
                    {shuffledQuizOptions.order.map((originalIdx, displayIdx) => {
                      const option = quizItem.options[originalIdx];
                      const isCorrect = quizAnswered && originalIdx === quizItem.answerIndex;
                      const isWrong = quizAnswered && originalIdx === quizSelectedIndex && originalIdx !== quizItem.answerIndex;
                      return (
                        <Button
                          key={`${quizItem.question}-${option}`}
                          variant="outline"
                          className={cn(
                            "h-auto justify-start whitespace-normal py-3 text-left",
                            isCorrect && "border-green-500 bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-400",
                            isWrong && "border-red-500 bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-400",
                            quizAnswered && "pointer-events-none"
                          )}
                          onClick={() => answerQuiz(originalIdx)}
                          disabled={quizAnswered}
                        >
                          <span className="mr-2 text-muted-foreground">{displayIdx + 1}.</span>
                          {option}
                        </Button>
                      );
                    })}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {quizAnswered
                      ? quizSelectedIndex === -1 ? `Time's up! ${quizItem.explanation}` : quizItem.explanation
                      : "Pick the best answer (or press 1-4)."}
                  </p>
                </>
              ) : (
                <p className="text-muted-foreground">No MCQs match this filter.</p>
              )}
            </CardContent>
          </Card>

          <div className="flex gap-2">
            <Button size="sm" onClick={nextQuiz}>Next question</Button>
            <Button variant="outline" size="sm" onClick={resetQuiz}>Reset</Button>
          </div>

          {answeredQuiz > 0 && (
            <Progress value={filteredQuiz.length ? (answeredQuiz / filteredQuiz.length) * 100 : 0} className="h-2" />
          )}
        </div>
      )}

      {/* ===== FREE RESPONSE ===== */}
      {mode === "free-response" && (
        <div className="space-y-4 animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-semibold">Write It Like Test Day</h2>
              {timedMode && (
                <Badge variant={timer.timeLeft <= 60 ? "destructive" : "secondary"} className="tabular-nums">
                  {formatTime(timer.timeLeft)}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button variant={timedMode ? "default" : "outline"} size="sm" onClick={toggleTimedMode}>
                {timedMode ? "Timer ON" : "Timed mode"}
              </Button>
              <span className="text-sm text-muted-foreground">
                {filteredFreeResponse.length ? `${freeResponseIndex + 1} of ${filteredFreeResponse.length}` : "0 of 0"}
              </span>
            </div>
          </div>

          <Card>
            <CardContent className="space-y-4 p-6">
              {freeResponsePrompt ? (
                <>
                  <Badge variant="secondary">
                    {activeData.chapters.find((c) => c.id === freeResponsePrompt.chapter)?.label || freeResponsePrompt.chapter}
                  </Badge>
                  <h3 className="text-lg font-semibold">{freeResponsePrompt.prompt}</h3>
                  <p className="text-sm text-muted-foreground">
                    Write your answer first. Then reveal the checklist and grade yourself.
                  </p>
                  <Textarea
                    placeholder="Write your answer here..."
                    className="min-h-[180px]"
                    value={freeResponseDrafts[freeResponsePrompt.prompt] || ""}
                    onChange={(e) => updateDraft(e.target.value)}
                  />
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" onClick={() => setFreeResponseChecklistOpen((v) => !v)}>
                      {freeResponseChecklistOpen ? "Hide checklist" : "Reveal checklist (R)"}
                    </Button>
                    <Button variant="outline" size="sm" onClick={nextFreeResponse}>Next prompt</Button>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {getScoreText(freeResponseScores[freeResponsePrompt.prompt])}
                  </p>
                  {freeResponseChecklistOpen && (
                    <div className="rounded-lg border bg-muted/50 p-4">
                      <ul className="list-disc space-y-1 pl-4 text-sm">
                        {freeResponsePrompt.include.map((point) => <li key={point}>{point}</li>)}
                      </ul>
                    </div>
                  )}
                  <div className="flex gap-2">
                    {[0, 1, 2].map((score) => {
                      const labels = ["Need work", "Almost there", "Nailed it"];
                      const active = freeResponseScores[freeResponsePrompt.prompt] === score;
                      return (
                        <Button key={score} size="sm" variant={active ? "default" : "outline"} onClick={() => scoreResponse(score)}>
                          {labels[score]}
                        </Button>
                      );
                    })}
                  </div>
                </>
              ) : (
                <p className="text-muted-foreground">No free-response prompts match this filter.</p>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* ===== MATCHING ===== */}
      {mode === "matching" && (
        <div className="space-y-4 animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Term & Definition Matching</h2>
            <span className="text-sm text-muted-foreground">
              {filteredMatchingSets.length
                ? `Set ${matchingSetIndex + 1} of ${filteredMatchingSets.length} — ${matchingMatchedPairs.length}/${matchingSet?.pairs.length || 0} matched`
                : "0 of 0"}
            </span>
          </div>

          <Card>
            <CardContent className="space-y-4 p-6">
              {matchingSet ? (
                <>
                  <Badge variant="secondary">{activeData.chapters.find((c) => c.id === matchingSet.chapter)?.label || matchingSet.chapter}</Badge>
                  <h3 className="text-lg font-semibold">{matchingSet.title}</h3>
                  <p className="text-sm text-muted-foreground">Pick one term and one definition. Correct pairs lock in.</p>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Terms</p>
                      {matchingSet.pairs.map((pair, i) => {
                        const matched = matchingMatchedPairs.includes(i);
                        return (
                          <Button key={pair.term} variant="outline"
                            className={cn("h-auto w-full justify-start whitespace-normal py-2 text-left",
                              matchingSelectedTerm === i && "border-primary bg-primary/5",
                              matched && "border-green-500 bg-green-50 text-green-700 pointer-events-none dark:bg-green-950 dark:text-green-400"
                            )}
                            onClick={() => !matched && setMatchingSelectedTerm(i)} disabled={matched}
                          >{pair.term}</Button>
                        );
                      })}
                    </div>
                    <div className="space-y-2">
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Definitions</p>
                      {matchingDefinitionOrder.map((pairIndex) => {
                        const pair = matchingSet.pairs[pairIndex];
                        const matched = matchingMatchedPairs.includes(pairIndex);
                        return (
                          <Button key={`${matchingSet.title}-${pair.term}`} variant="outline"
                            className={cn("h-auto w-full justify-start whitespace-normal py-2 text-left text-sm",
                              matchingSelectedDefinition === pairIndex && "border-primary bg-primary/5",
                              matched && "border-green-500 bg-green-50 text-green-700 pointer-events-none dark:bg-green-950 dark:text-green-400"
                            )}
                            onClick={() => !matched && setMatchingSelectedDefinition(pairIndex)} disabled={matched}
                          >{pair.definition}</Button>
                        );
                      })}
                    </div>
                  </div>
                  {matchingFeedback && <p className="text-sm font-medium">{matchingFeedback}</p>}
                </>
              ) : (
                <p className="text-muted-foreground">No matching sets match this filter.</p>
              )}
            </CardContent>
          </Card>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={resetMatchingSet}>Reset set</Button>
            <Button size="sm" onClick={nextMatchingSet}>Next set</Button>
          </div>
        </div>
      )}

      {/* ===== CRAM SHEET ===== */}
      {mode === "cram" && (
        <div className="space-y-4 animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
          <div className="flex items-center justify-between print:hidden">
            <h2 className="text-lg font-semibold">Comparisons & Memory Anchors</h2>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Best used 30 min before test</span>
              <Button size="sm" variant="outline" onClick={() => window.print()}>Print</Button>
            </div>
          </div>
          <div className="hidden print:block print:mb-4">
            <h1 className="text-2xl font-bold">Philosophy Cram Sheet</h1>
            <p className="text-sm text-gray-600">Chapters 1 & 2 — Comparisons & Memory Anchors</p>
          </div>
          <div id="cram-content" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 print:grid-cols-2 print:gap-2">
            {activeData.comparisons.map((item, i) => (
              <Card key={`${item.chapter}-${item.title}-${i}`} className="print:shadow-none print:border-gray-300">
                <CardContent className="p-4 print:p-2">
                  <Badge variant="outline" className="mb-2 print:text-[10px]">
                    {activeData.chapters.find((c) => c.id === item.chapter)?.label || item.chapter}
                  </Badge>
                  <h3 className="mb-1 font-semibold print:text-sm">{item.title}</h3>
                  <p className="text-sm text-muted-foreground print:text-xs">
                    <span className="font-medium text-foreground">Main idea: </span>{item.summary}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground print:text-xs">
                    <span className="font-medium text-foreground">Why it matters: </span>{item.whyItMatters}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* ===== REVIEW MISTAKES ===== */}
      {mode === "review-mistakes" && (
        <div className="space-y-4 animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Review Mistakes</h2>
            <span className="text-sm text-muted-foreground">
              {missedQuizItems.length ? `${reviewIndex + 1} of ${missedQuizItems.length}` : ""}
            </span>
          </div>
          {missedQuizItems.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center p-12 text-center">
                <p className="text-2xl font-bold">All clear!</p>
                <p className="mt-2 text-muted-foreground">No missed questions. Go answer some MCQs — wrong answers show up here.</p>
              </CardContent>
            </Card>
          ) : (
            <>
              <Card>
                <CardContent className="space-y-4 p-6">
                  <Badge variant="destructive">Previously missed</Badge>
                  <h3 className="text-lg font-semibold">{reviewItem.question}</h3>
                  <div className="grid gap-2">
                    {reviewItem.options.map((option, i) => {
                      const isCorrect = reviewAnswered && i === reviewItem.answerIndex;
                      const isWrong = reviewAnswered && i === reviewSelectedIndex && i !== reviewItem.answerIndex;
                      return (
                        <Button key={`review-${reviewItem.question}-${option}`} variant="outline"
                          className={cn("h-auto justify-start whitespace-normal py-3 text-left",
                            isCorrect && "border-green-500 bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-400",
                            isWrong && "border-red-500 bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-400",
                            reviewAnswered && "pointer-events-none"
                          )}
                          onClick={() => answerReview(i)} disabled={reviewAnswered}
                        >
                          <span className="mr-2 text-muted-foreground">{i + 1}.</span>{option}
                        </Button>
                      );
                    })}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {reviewAnswered ? reviewItem.explanation : "Get it right to clear it from the list."}
                  </p>
                </CardContent>
              </Card>
              <div className="flex gap-2">
                <Button size="sm" onClick={nextReview}>Next mistake</Button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
