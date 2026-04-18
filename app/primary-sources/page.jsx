"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const DECKS = [
  {
    slug: "cold-war-dbq",
    title: "Cold War DBQ Activity",
    era: "1945-1953",
    pages: 7,
    chapter: "The Cold War",
    summary:
      "Primary sources on origins of the Cold War: Churchill's Iron Curtain, Kennan, Truman Doctrine, Marshall Plan, NSC-68, NATO, Berlin Airlift, home-front propaganda.",
  },
  {
    slug: "affluent-society",
    title: "An Affluent Society",
    era: "1947-1960",
    pages: 15,
    chapter: "50s & Civil Rights",
    summary:
      "1950s boom, Kitchen Debate, Levittown, Galbraith vs Harrington, gender roles, Beats, cartoons on suburban life and inequality.",
  },
  {
    slug: "civil-rights-1950s",
    title: "Civil Rights in the 1950s",
    era: "1896-1960",
    pages: 22,
    chapter: "50s & Civil Rights",
    summary:
      "Plessy, Jim Crow, Brown v Board, Emmett Till, Montgomery, Little Rock, Green Book, key CR organizations and tactics.",
  },
  {
    slug: "birmingham-jail",
    title: "Letter from Birmingham Jail — MLK Jr.",
    era: "1963",
    pages: 19,
    chapter: "50s & Civil Rights",
    summary:
      "Full text of King's Letter. Outsider, four steps, case against waiting, just vs unjust laws, white moderate, extremism reframed.",
  },
  {
    slug: "birmingham-jail-activity",
    title: "Birmingham Jail — Primary Source Reader Activity",
    era: "1963",
    pages: 7,
    chapter: "50s & Civil Rights",
    summary:
      "Guided analysis packet. Comprehension questions, quotes to unpack, arguments to reconstruct.",
  },
  {
    slug: "vietnam-war",
    title: "The Vietnam War",
    era: "1945-1975",
    pages: 17,
    chapter: "The 60s",
    summary:
      "Ho Chi Minh, Dien Bien Phu, Geneva Accords, Diem, Gulf of Tonkin, Rolling Thunder, Tet, Vietnamization, Fall of Saigon.",
  },
  {
    slug: "vietnam-primary",
    title: "Vietnam Primary Sources",
    era: "1945-1975",
    pages: 20,
    chapter: "The 60s",
    summary:
      "Ho Chi Minh declaration, Nixon-Ho letters, RFK speech, O'Brien excerpts (Things They Carried, Rainy River), Caputo, antiwar materials.",
  },
  {
    slug: "nixon-conservative",
    title: "End of the 60s & The Conservative Turn — Nixon",
    era: "1968-1974",
    pages: 27,
    chapter: "Rise of Conservatism",
    summary:
      "1968 crisis, Silent Majority, Southern Strategy, Vietnamization, detente, Watergate. Sharon Statement, rights movements of 60s-70s.",
  },
  {
    slug: "seventies-malaise",
    title: "The 1970s: From Malaise to Morning in America",
    era: "1973-1980",
    pages: 10,
    chapter: "Ford/Carter",
    summary:
      "Oil shocks, stagflation, Iran Hostages, Eagle Claw, Carter's Malaise Speech, Moral Majority, Reagan 1980 campaign.",
  },
  {
    slug: "reagan-era",
    title: "The Reagan Era",
    era: "1981-1989",
    pages: 32,
    chapter: "Reagan Revolution",
    summary:
      "Reaganomics, War on Drugs, mass incarceration, SDI, Contras, Iran-Contra, Gary Webb, Gorbachev, Berlin Wall, USSR collapse.",
  },
];

function padPage(n, total) {
  const width = String(total).length >= 2 ? 2 : 1;
  return String(n).padStart(width, "0");
}

function deckImageUrl(slug, pageNum, totalPages) {
  const n = padPage(pageNum, totalPages);
  return `/primary-sources/${slug}/page-${n}.jpg`;
}

export default function PrimarySourcesPage() {
  const [activeDeck, setActiveDeck] = useState(null);
  const [pageIndex, setPageIndex] = useState(0);
  const [zoomed, setZoomed] = useState(false);

  const openDeck = useCallback((deck) => {
    setActiveDeck(deck);
    setPageIndex(0);
    setZoomed(false);
  }, []);

  const closeDeck = useCallback(() => {
    setActiveDeck(null);
    setZoomed(false);
  }, []);

  const nextPage = useCallback(() => {
    if (!activeDeck) return;
    setPageIndex((i) => Math.min(i + 1, activeDeck.pages - 1));
  }, [activeDeck]);

  const prevPage = useCallback(() => {
    setPageIndex((i) => Math.max(i - 1, 0));
  }, []);

  useEffect(() => {
    function onKey(e) {
      if (!activeDeck) return;
      if (e.key === "Escape") closeDeck();
      if (e.key === "ArrowRight") nextPage();
      if (e.key === "ArrowLeft") prevPage();
      if (e.key === " ") { e.preventDefault(); setZoomed((z) => !z); }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [activeDeck, nextPage, prevPage, closeDeck]);

  if (activeDeck) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <header className="sticky top-0 z-20 border-b border-border bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/70">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
            <div className="min-w-0">
              <Button variant="ghost" size="sm" onClick={closeDeck} className="-ml-2">
                ← Back to sources
              </Button>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <h1 className="truncate text-lg font-semibold">{activeDeck.title}</h1>
                <Badge variant="secondary">{activeDeck.era}</Badge>
                <Badge>{activeDeck.chapter}</Badge>
              </div>
            </div>
            <div className="flex items-center gap-2 whitespace-nowrap">
              <Button variant="outline" size="sm" onClick={prevPage} disabled={pageIndex === 0}>
                ← Prev
              </Button>
              <span className="text-sm tabular-nums text-muted-foreground">
                {pageIndex + 1} / {activeDeck.pages}
              </span>
              <Button variant="outline" size="sm" onClick={nextPage} disabled={pageIndex === activeDeck.pages - 1}>
                Next →
              </Button>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-6xl px-4 py-6">
          <p className="mb-4 text-sm text-muted-foreground">
            Arrow keys navigate · Spacebar toggles zoom · Esc exits
          </p>
          <div
            className={`relative flex justify-center rounded-lg border border-border bg-muted/30 p-2 transition-all ${
              zoomed ? "cursor-zoom-out" : "cursor-zoom-in"
            }`}
            onClick={() => setZoomed((z) => !z)}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={deckImageUrl(activeDeck.slug, pageIndex + 1, activeDeck.pages)}
              alt={`${activeDeck.title} — page ${pageIndex + 1}`}
              className={`${zoomed ? "max-w-none w-[150%]" : "max-w-full w-auto"} h-auto select-none transition-all`}
              draggable={false}
            />
          </div>
          <div className="mt-6 rounded-lg border border-border bg-card p-4">
            <p className="text-sm font-medium text-muted-foreground">Analysis prompts</p>
            <ul className="mt-2 space-y-1 text-sm">
              <li>• Who created this source, and for what audience?</li>
              <li>• What argument or perspective does it push? Name the rhetoric.</li>
              <li>• What historical context (event, policy, debate) makes it meaningful?</li>
              <li>• What does it reveal that a textbook summary would miss?</li>
              <li>• How would a critic from the opposing camp read this?</li>
            </ul>
          </div>

          <div className="mt-6 grid grid-cols-[repeat(auto-fill,minmax(64px,1fr))] gap-2">
            {Array.from({ length: activeDeck.pages }, (_, i) => (
              <button
                key={i}
                onClick={() => { setPageIndex(i); setZoomed(false); }}
                className={`aspect-[3/4] overflow-hidden rounded border transition ${
                  i === pageIndex ? "border-foreground ring-2 ring-foreground/30" : "border-border hover:border-foreground/40"
                }`}
                aria-label={`Go to page ${i + 1}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={deckImageUrl(activeDeck.slug, i + 1, activeDeck.pages)}
                  alt=""
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              </button>
            ))}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border">
        <div className="mx-auto max-w-6xl px-4 py-6">
          <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
            ← Back to study app
          </Link>
          <h1 className="mt-2 text-3xl font-bold tracking-tight">Primary Sources</h1>
          <p className="mt-2 max-w-3xl text-muted-foreground">
            Class source packets and slide decks, page-by-page. Use these to practice the
            primary-source analysis portion of the midterm. Click a deck to browse.
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {DECKS.map((deck) => (
            <Card
              key={deck.slug}
              className="group cursor-pointer overflow-hidden transition hover:border-foreground/30 hover:shadow-lg"
              onClick={() => openDeck(deck)}
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={deckImageUrl(deck.slug, 1, deck.pages)}
                  alt=""
                  className="h-full w-full object-cover transition group-hover:scale-[1.02]"
                  loading="lazy"
                />
              </div>
              <CardHeader className="pb-2">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="secondary">{deck.era}</Badge>
                  <Badge>{deck.chapter}</Badge>
                  <span className="ml-auto text-xs text-muted-foreground">{deck.pages} pages</span>
                </div>
                <CardTitle className="mt-2 text-base">{deck.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{deck.summary}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
