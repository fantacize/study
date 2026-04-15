"use client";

import { useEffect, useMemo, useState } from "react";
import { studyData } from "../data.js";

function matchesSearch(parts, term) {
  if (!term) return true;
  return parts.join(" ").toLowerCase().includes(term);
}

function shuffle(array) {
  const copy = [...array];

  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }

  return copy;
}

function getScoreText(score) {
  if (score === 2) return "Marked as nailed it. Move on or rewrite it once more for speed.";
  if (score === 1) return "Marked as almost there. Tighten the missing ideas and try it again later.";
  if (score === 0) return "Marked as need work. Come back after MCQ or matching and retry it.";
  return "Write your answer, reveal the checklist, then self-score it honestly.";
}

export default function Page() {
  const [chapter, setChapter] = useState("all");
  const [mode, setMode] = useState("overview");
  const [search, setSearch] = useState("");

  const [flashcardIndex, setFlashcardIndex] = useState(0);
  const [flashcardFlipped, setFlashcardFlipped] = useState(false);
  const [cardsReviewed, setCardsReviewed] = useState(0);
  const [toughCards, setToughCards] = useState([]);

  const [quizIndex, setQuizIndex] = useState(0);
  const [quizAnswered, setQuizAnswered] = useState(false);
  const [quizSelectedIndex, setQuizSelectedIndex] = useState(null);
  const [quizResults, setQuizResults] = useState([]);

  const [freeResponseIndex, setFreeResponseIndex] = useState(0);
  const [freeResponseChecklistOpen, setFreeResponseChecklistOpen] = useState(false);
  const [freeResponseDrafts, setFreeResponseDrafts] = useState({});
  const [freeResponseScores, setFreeResponseScores] = useState({});

  const [matchingSetIndex, setMatchingSetIndex] = useState(0);
  const [matchingDefinitionOrder, setMatchingDefinitionOrder] = useState([]);
  const [matchingSelectedTerm, setMatchingSelectedTerm] = useState(null);
  const [matchingSelectedDefinition, setMatchingSelectedDefinition] = useState(null);
  const [matchingMatchedPairs, setMatchingMatchedPairs] = useState([]);
  const [matchingFeedback, setMatchingFeedback] = useState("");
  const [matchingAttempts, setMatchingAttempts] = useState(0);
  const [matchingCorrect, setMatchingCorrect] = useState(0);

  const filteredFlashcards = useMemo(
    () =>
      studyData.flashcards.filter((card) => {
        const chapterMatch = chapter === "all" || card.chapter === chapter;
        const searchMatch = matchesSearch([card.tag, card.prompt, card.answer], search);
        return chapterMatch && searchMatch;
      }),
    [chapter, search]
  );

  const filteredQuiz = useMemo(
    () =>
      studyData.quiz.filter((item) => {
        const chapterMatch = chapter === "all" || item.chapter === chapter;
        const searchMatch = matchesSearch(
          [item.tag, item.question, item.options.join(" "), item.explanation],
          search
        );
        return chapterMatch && searchMatch;
      }),
    [chapter, search]
  );

  const filteredFreeResponse = useMemo(
    () =>
      studyData.shortAnswers.filter((item) => {
        const chapterMatch = chapter === "all" || item.chapter === chapter;
        const searchMatch = matchesSearch([item.prompt, item.include.join(" ")], search);
        return chapterMatch && searchMatch;
      }),
    [chapter, search]
  );

  const filteredMatchingSets = useMemo(
    () =>
      studyData.matchingSets.filter((set) => {
        const chapterMatch = chapter === "all" || set.chapter === chapter;
        const searchMatch = matchesSearch(
          [
            set.title,
            ...set.pairs.map((pair) => pair.term),
            ...set.pairs.map((pair) => pair.definition)
          ],
          search
        );
        return chapterMatch && searchMatch;
      }),
    [chapter, search]
  );

  const filteredComparisons = useMemo(
    () =>
      studyData.comparisons.filter((item) => {
        const chapterMatch = chapter === "all" || item.chapter === chapter;
        const searchMatch = matchesSearch([item.title, item.summary, item.whyItMatters], search);
        return chapterMatch && searchMatch;
      }),
    [chapter, search]
  );

  const overviewData = useMemo(() => {
    const chapterMap = studyData.overview.chapterMap.filter(
      (entry) => chapter === "all" || entry.chapter.toLowerCase().replace(" ", "-") === chapter
    );

    return {
      chapterMap: chapterMap.length ? chapterMap : studyData.overview.chapterMap,
      likelyQuestions: studyData.overview.likelyQuestions.filter((question) =>
        matchesSearch([question], search)
      ),
      cramChecklist: studyData.overview.cramChecklist.filter((item) =>
        matchesSearch([item], search)
      )
    };
  }, [chapter, search]);

  const flashcard = filteredFlashcards[Math.min(flashcardIndex, Math.max(filteredFlashcards.length - 1, 0))];
  const quizItem = filteredQuiz[Math.min(quizIndex, Math.max(filteredQuiz.length - 1, 0))];
  const freeResponsePrompt =
    filteredFreeResponse[Math.min(freeResponseIndex, Math.max(filteredFreeResponse.length - 1, 0))];
  const matchingSet =
    filteredMatchingSets[Math.min(matchingSetIndex, Math.max(filteredMatchingSets.length - 1, 0))];

  useEffect(() => {
    setFlashcardIndex(0);
    setFlashcardFlipped(false);
    setQuizIndex(0);
    setQuizAnswered(false);
    setQuizSelectedIndex(null);
    setQuizResults([]);
    setFreeResponseIndex(0);
    setFreeResponseChecklistOpen(false);
    setMatchingSetIndex(0);
    setMatchingDefinitionOrder([]);
    setMatchingSelectedTerm(null);
    setMatchingSelectedDefinition(null);
    setMatchingMatchedPairs([]);
    setMatchingFeedback("");
  }, [chapter, search]);

  useEffect(() => {
    if (!matchingSet) {
      setMatchingDefinitionOrder([]);
      return;
    }

    setMatchingDefinitionOrder((current) => {
      if (current.length === matchingSet.pairs.length) {
        return current;
      }
      return shuffle(matchingSet.pairs.map((_, index) => index));
    });
  }, [matchingSet]);

  useEffect(() => {
    if (matchingSelectedTerm === null || matchingSelectedDefinition === null) {
      return;
    }

    setMatchingAttempts((value) => value + 1);

    if (matchingSelectedTerm === matchingSelectedDefinition) {
      setMatchingCorrect((value) => value + 1);
      setMatchingMatchedPairs((current) => [...current, matchingSelectedTerm]);
      setMatchingFeedback("Correct match. Keep going until the whole set is cleared.");
    } else {
      setMatchingFeedback("Not quite. Reset your eye and try another pairing.");
    }

    setMatchingSelectedTerm(null);
    setMatchingSelectedDefinition(null);
  }, [matchingSelectedTerm, matchingSelectedDefinition]);

  const totalMatchingPairs = filteredMatchingSets.reduce((sum, set) => sum + set.pairs.length, 0);
  const answeredQuiz = quizResults.length;
  const correctQuiz = quizResults.filter(Boolean).length;

  function nextFlashcard(step = 1) {
    if (!filteredFlashcards.length) return;
    setFlashcardFlipped(false);
    setFlashcardIndex((current) => (current + step + filteredFlashcards.length) % filteredFlashcards.length);
    setCardsReviewed((value) => value + 1);
  }

  function randomFlashcard() {
    if (!filteredFlashcards.length) return;
    setFlashcardFlipped(false);
    setFlashcardIndex(Math.floor(Math.random() * filteredFlashcards.length));
    setCardsReviewed((value) => value + 1);
  }

  function toggleTough(prompt) {
    setToughCards((current) =>
      current.includes(prompt) ? current.filter((item) => item !== prompt) : [...current, prompt]
    );
  }

  function answerQuiz(index) {
    if (!quizItem || quizAnswered) return;
    setQuizSelectedIndex(index);
    setQuizAnswered(true);
    setQuizResults((current) => [...current, index === quizItem.answerIndex]);
  }

  function nextQuiz() {
    if (!filteredQuiz.length) return;
    setQuizAnswered(false);
    setQuizSelectedIndex(null);
    setQuizIndex((current) => (current + 1) % filteredQuiz.length);
  }

  function resetQuiz() {
    setQuizIndex(0);
    setQuizAnswered(false);
    setQuizSelectedIndex(null);
    setQuizResults([]);
  }

  function updateDraft(value) {
    if (!freeResponsePrompt) return;
    setFreeResponseDrafts((current) => ({ ...current, [freeResponsePrompt.prompt]: value }));
  }

  function scoreResponse(score) {
    if (!freeResponsePrompt) return;
    setFreeResponseScores((current) => ({ ...current, [freeResponsePrompt.prompt]: score }));
  }

  function nextFreeResponse() {
    if (!filteredFreeResponse.length) return;
    setFreeResponseChecklistOpen(false);
    setFreeResponseIndex((current) => (current + 1) % filteredFreeResponse.length);
  }

  function resetMatchingSet() {
    if (!matchingSet) return;
    setMatchingSelectedTerm(null);
    setMatchingSelectedDefinition(null);
    setMatchingMatchedPairs([]);
    setMatchingFeedback("");
    setMatchingDefinitionOrder(shuffle(matchingSet.pairs.map((_, index) => index)));
  }

  function nextMatchingSet() {
    if (!filteredMatchingSets.length) return;
    const nextIndex = (matchingSetIndex + 1) % filteredMatchingSets.length;
    setMatchingSetIndex(nextIndex);
    setMatchingSelectedTerm(null);
    setMatchingSelectedDefinition(null);
    setMatchingMatchedPairs([]);
    setMatchingFeedback("");
    const nextSet = filteredMatchingSets[nextIndex];
    setMatchingDefinitionOrder(shuffle(nextSet.pairs.map((_, index) => index)));
  }

  const chapterTitle =
    studyData.chapters.find((item) => item.id === chapter)?.title || "Full Review";

  return (
    <div className="page-shell">
      <header className="hero">
        <div className="hero-copy">
          <p className="eyebrow">Study App</p>
          <h1>Philosophy Study Studio</h1>
          <p className="hero-text">
            Turn your Chapter 1 and Chapter 2 notes into active review with flashcards,
            MCQs, free-response drills, matching sets, and a cram sheet built around the
            exact ideas your test is likely to hit.
          </p>
        </div>
        <div className="hero-stats">
          <article className="stat-card">
            <span className="stat-label">Flashcards</span>
            <strong>{filteredFlashcards.length}</strong>
          </article>
          <article className="stat-card">
            <span className="stat-label">MCQs</span>
            <strong>{filteredQuiz.length}</strong>
          </article>
          <article className="stat-card">
            <span className="stat-label">Free Response</span>
            <strong>{filteredFreeResponse.length}</strong>
          </article>
          <article className="stat-card">
            <span className="stat-label">Matching Pairs</span>
            <strong>{totalMatchingPairs}</strong>
          </article>
        </div>
      </header>

      <main className="workspace">
        <section className="control-panel">
          <div className="panel-card">
            <label className="section-label">Focus</label>
            <div className="pill-row">
              {studyData.chapters.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={`pill${chapter === item.id ? " active" : ""}`}
                  onClick={() => setChapter(item.id)}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className="panel-card">
            <label className="section-label" htmlFor="search-input">
              Search concepts
            </label>
            <input
              id="search-input"
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value.trim().toLowerCase())}
              placeholder="Try Socrates, Darwin, dualism..."
              autoComplete="off"
            />
          </div>

          <div className="panel-card">
            <label className="section-label">Mode</label>
            <div className="pill-row">
              {studyData.modes.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={`pill${mode === item.id ? " active" : ""}`}
                  onClick={() => setMode(item.id)}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className="panel-card compact">
            <p className="section-label">Session Tracker</p>
            <div className="tracker-grid">
              <div>
                <span className="tracker-number">{cardsReviewed}</span>
                <span className="tracker-label">Cards reviewed</span>
              </div>
              <div>
                <span className="tracker-number">{`${correctQuiz} / ${answeredQuiz}`}</span>
                <span className="tracker-label">MCQ score</span>
              </div>
              <div>
                <span className="tracker-number">{Object.keys(freeResponseScores).length}</span>
                <span className="tracker-label">Free responses scored</span>
              </div>
              <div>
                <span className="tracker-number">{`${matchingCorrect} / ${matchingAttempts}`}</span>
                <span className="tracker-label">Matching score</span>
              </div>
            </div>
          </div>
        </section>

        <section className="study-surface">
          <section className={`view-panel${mode === "overview" ? " active" : ""}`}>
            <div className="section-heading">
              <div>
                <p className="eyebrow">Overview</p>
                <h2>What to master fast</h2>
              </div>
              <p className="section-note">
                {chapterTitle}
                {search ? ` filtered by "${search}"` : ""}
              </p>
            </div>
            <div className="overview-grid">
              <article className="feature-card">
                <h3>Chapter map</h3>
                <div className="stack-list">
                  {overviewData.chapterMap.map((entry) => (
                    <article className="stack-item" key={entry.chapter}>
                      <h4>{entry.chapter}</h4>
                      <ul>
                        {entry.points.map((point) => (
                          <li key={point}>{point}</li>
                        ))}
                      </ul>
                    </article>
                  ))}
                </div>
              </article>
              <article className="feature-card">
                <h3>Likely test prompts</h3>
                <div className="stack-list">
                  {overviewData.likelyQuestions.map((question) => (
                    <article className="stack-item" key={question}>
                      <p>{question}</p>
                    </article>
                  ))}
                </div>
              </article>
              <article className="feature-card">
                <h3>Ultra-fast cram</h3>
                <div className="stack-list checklist">
                  {overviewData.cramChecklist.map((item) => (
                    <article className="stack-item" key={item}>
                      <p>{item}</p>
                    </article>
                  ))}
                </div>
              </article>
            </div>
          </section>

          <section className={`view-panel${mode === "flashcards" ? " active" : ""}`}>
            <div className="section-heading">
              <div>
                <p className="eyebrow">Flashcards</p>
                <h2>Active recall deck</h2>
              </div>
              <p className="section-note">
                {filteredFlashcards.length ? `${flashcardIndex + 1} of ${filteredFlashcards.length}` : "0 of 0"}
              </p>
            </div>

            <article
              className={`flashcard${flashcardFlipped ? " flipped" : ""}`}
              tabIndex={0}
              role="button"
              onClick={() => flashcard && setFlashcardFlipped((value) => !value)}
              onKeyDown={(event) => {
                if ((event.key === "Enter" || event.key === " ") && flashcard) {
                  event.preventDefault();
                  setFlashcardFlipped((value) => !value);
                }
              }}
            >
              <div className="flashcard-face flashcard-front">
                <span className="card-tag">
                  {flashcard
                    ? toughCards.includes(flashcard.prompt)
                      ? `${flashcard.tag} • Tough`
                      : flashcard.tag
                    : "No result"}
                </span>
                <p className="card-label">Prompt</p>
                <h3>{flashcard ? flashcard.prompt : "No flashcards match this filter."}</h3>
                <p className="card-hint">
                  {flashcard
                    ? "Tap to reveal the answer."
                    : "Clear the search or change the chapter filter to see cards again."}
                </p>
              </div>
              <div className="flashcard-face flashcard-back">
                <span className="card-tag card-tag-answer">Answer</span>
                <p className="card-label">What to remember</p>
                <div className="answer-copy">
                  {flashcard ? flashcard.answer : "No answer available while filtered out."}
                </div>
              </div>
            </article>

            <div className="action-row">
              <button className="ghost-button" type="button" onClick={() => nextFlashcard(-1)}>
                Previous
              </button>
              <button className="primary-button" type="button" onClick={() => setFlashcardFlipped((value) => !value)}>
                Flip card
              </button>
              <button
                className="ghost-button"
                type="button"
                onClick={() => flashcard && toggleTough(flashcard.prompt)}
              >
                {flashcard && toughCards.includes(flashcard.prompt) ? "Unmark tough" : "Mark tough"}
              </button>
              <button className="ghost-button" type="button" onClick={() => nextFlashcard(1)}>
                Next
              </button>
              <button className="ghost-button" type="button" onClick={randomFlashcard}>
                Shuffle
              </button>
            </div>
          </section>

          <section className={`view-panel${mode === "quiz" ? " active" : ""}`}>
            <div className="section-heading">
              <div>
                <p className="eyebrow">MCQ</p>
                <h2>Multiple-choice drill</h2>
              </div>
              <p className="section-note">
                {filteredQuiz.length ? `${quizIndex + 1} of ${filteredQuiz.length}` : "0 of 0"}
              </p>
            </div>

            <article className="quiz-card">
              <span className="card-tag">{quizItem ? quizItem.tag : "No result"}</span>
              <h3>{quizItem ? quizItem.question : "No MCQs match this filter."}</h3>
              <div className="options-list">
                {quizItem ? (
                  quizItem.options.map((option, index) => {
                    const isCorrect = quizAnswered && index === quizItem.answerIndex;
                    const isIncorrect = quizAnswered && index === quizSelectedIndex && index !== quizItem.answerIndex;

                    return (
                      <button
                        key={`${quizItem.question}-${option}`}
                        type="button"
                        className={`option-button${isCorrect ? " correct" : ""}${isIncorrect ? " incorrect" : ""}${quizAnswered ? " locked" : ""}`}
                        onClick={() => answerQuiz(index)}
                        disabled={quizAnswered}
                      >
                        {option}
                      </button>
                    );
                  })
                ) : null}
              </div>
              <div className="quiz-feedback">
                {quizItem
                  ? quizAnswered
                    ? quizItem.explanation
                    : "Pick the best answer, then move to the next question."
                  : "Try a different chapter or clear the search field."}
              </div>
            </article>

            <div className="action-row">
              <button className="primary-button" type="button" onClick={nextQuiz}>
                Next question
              </button>
              <button className="ghost-button" type="button" onClick={resetQuiz}>
                Reset MCQ run
              </button>
            </div>
          </section>

          <section className={`view-panel${mode === "free-response" ? " active" : ""}`}>
            <div className="section-heading">
              <div>
                <p className="eyebrow">Free Response</p>
                <h2>Write it like test day</h2>
              </div>
              <p className="section-note">
                {filteredFreeResponse.length ? `${freeResponseIndex + 1} of ${filteredFreeResponse.length}` : "0 of 0"}
              </p>
            </div>

            <article className="quiz-card free-response-card">
              <span className="card-tag">
                {freeResponsePrompt
                  ? freeResponsePrompt.chapter === "chapter-1"
                    ? "Chapter 1"
                    : "Chapter 2"
                  : "No result"}
              </span>
              <h3>
                {freeResponsePrompt
                  ? freeResponsePrompt.prompt
                  : "No free-response prompts match this filter."}
              </h3>
              <p className="prompt-meta">
                Write your answer first. Then reveal the scoring checklist and grade yourself.
              </p>
              <textarea
                className="response-input"
                placeholder="Write your answer here..."
                value={freeResponsePrompt ? freeResponseDrafts[freeResponsePrompt.prompt] || "" : ""}
                onChange={(event) => updateDraft(event.target.value)}
                disabled={!freeResponsePrompt}
              />
              <div className="action-row">
                <button
                  className="primary-button"
                  type="button"
                  onClick={() => setFreeResponseChecklistOpen((value) => !value)}
                >
                  {freeResponseChecklistOpen ? "Hide checklist" : "Reveal checklist"}
                </button>
                <button className="ghost-button" type="button" onClick={nextFreeResponse}>
                  Next prompt
                </button>
              </div>
              <div className="free-response-feedback">
                {freeResponsePrompt
                  ? getScoreText(freeResponseScores[freeResponsePrompt.prompt])
                  : "Clear the search or change the chapter filter."}
              </div>
              <div className={`prompt-answer${freeResponseChecklistOpen ? " visible" : ""}`}>
                {freeResponsePrompt ? (
                  <ul>
                    {freeResponsePrompt.include.map((point) => (
                      <li key={point}>{point}</li>
                    ))}
                  </ul>
                ) : null}
              </div>
              <div className="self-score-row">
                {[0, 1, 2].map((score) => {
                  const label = score === 0 ? "Need work" : score === 1 ? "Almost there" : "Nailed it";
                  return (
                    <button
                      key={score}
                      className={`${score === 2 ? "primary-button" : "ghost-button"} self-score-btn${
                        freeResponsePrompt && freeResponseScores[freeResponsePrompt.prompt] === score
                          ? " active-score"
                          : ""
                      }`}
                      type="button"
                      onClick={() => scoreResponse(score)}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </article>
          </section>

          <section className={`view-panel${mode === "matching" ? " active" : ""}`}>
            <div className="section-heading">
              <div>
                <p className="eyebrow">Matching</p>
                <h2>Term and definition sets</h2>
              </div>
              <p className="section-note">
                {filteredMatchingSets.length
                  ? `${matchingSetIndex + 1} of ${filteredMatchingSets.length} • ${matchingMatchedPairs.length} / ${
                      matchingSet?.pairs.length || 0
                    } matched`
                  : "0 of 0"}
              </p>
            </div>

            <article className="quiz-card matching-card">
              <div className="matching-header">
                <span className="card-tag">
                  {matchingSet ? (matchingSet.chapter === "chapter-1" ? "Chapter 1" : "Chapter 2") : "No result"}
                </span>
                <h3>{matchingSet ? matchingSet.title : "No matching sets match this filter."}</h3>
                <p className="prompt-meta">
                  Pick one term and one definition. Match all pairs to clear the set.
                </p>
              </div>

              <div className="matching-board">
                <div>
                  <p className="section-label">Terms</p>
                  <div className="matching-column">
                    {matchingSet
                      ? matchingSet.pairs.map((pair, index) => {
                          const matched = matchingMatchedPairs.includes(index);
                          return (
                            <button
                              key={pair.term}
                              type="button"
                              className={`matching-button${matchingSelectedTerm === index ? " selected" : ""}${
                                matched ? " matched" : ""
                              }`}
                              onClick={() => !matched && setMatchingSelectedTerm(index)}
                              disabled={matched}
                            >
                              {pair.term}
                            </button>
                          );
                        })
                      : null}
                  </div>
                </div>
                <div>
                  <p className="section-label">Definitions</p>
                  <div className="matching-column">
                    {matchingSet
                      ? matchingDefinitionOrder.map((pairIndex) => {
                          const pair = matchingSet.pairs[pairIndex];
                          const matched = matchingMatchedPairs.includes(pairIndex);
                          return (
                            <button
                              key={`${matchingSet.title}-${pair.term}`}
                              type="button"
                              className={`matching-button definition-button${
                                matchingSelectedDefinition === pairIndex ? " selected" : ""
                              }${matched ? " matched" : ""}`}
                              onClick={() => !matched && setMatchingSelectedDefinition(pairIndex)}
                              disabled={matched}
                            >
                              {pair.definition}
                            </button>
                          );
                        })
                      : null}
                  </div>
                </div>
              </div>

              <div className="quiz-feedback">
                {matchingSet
                  ? matchingFeedback || "Pick one term and one definition. A correct pair locks into place."
                  : "Clear the search or switch chapters."}
              </div>

              <div className="action-row">
                <button className="ghost-button" type="button" onClick={resetMatchingSet}>
                  Reset set
                </button>
                <button className="primary-button" type="button" onClick={nextMatchingSet}>
                  Next set
                </button>
              </div>
            </article>
          </section>

          <section className={`view-panel${mode === "cram" ? " active" : ""}`}>
            <div className="section-heading">
              <div>
                <p className="eyebrow">Cram Sheet</p>
                <h2>Comparisons and memory anchors</h2>
              </div>
              <p className="section-note">Best used 30 minutes before the test.</p>
            </div>
            <div className="comparison-grid">
              {filteredComparisons.length ? (
                filteredComparisons.map((item, index) => (
                  <article className="comparison-card" key={`${item.chapter}-${item.title}-${index}`}>
                    <span className="chapter-chip">
                      {item.chapter === "chapter-1" ? "Chapter 1" : "Chapter 2"}
                    </span>
                    <h3>{item.title}</h3>
                    <p>
                      <strong>Main idea:</strong> {item.summary}
                    </p>
                    <p>
                      <strong>Why it matters:</strong> {item.whyItMatters}
                    </p>
                  </article>
                ))
              ) : (
                <article className="comparison-card">
                  <h3>No comparison cards match this filter.</h3>
                  <p>Try removing your search terms or switching chapters.</p>
                </article>
              )}
            </div>
          </section>
        </section>
      </main>
    </div>
  );
}
