// Practice tests mirror midterm format:
//   Section A: Multiple Choice (15 Qs)
//   Section B: Primary Source / Political Cartoon Analysis (2 sources, open response)
//   Section C: Short Answer (3 prompts)
// Coverage: Foner chapters 23-26 (Cold War origins through end of Reagan admin, 1950-1989).

export const practiceTests = [
  {
    id: "midterm-pt1",
    title: "Practice Midterm 1 — Cold War to Civil Rights",
    focus: "Chs 23-24 heavy, 25 light",
    minutes: 45,
    mcq: [
      {
        question: "George Kennan's 'Long Telegram' argued that the Soviet Union could best be countered by:",
        options: [
          "Immediate military confrontation to break the regime",
          "Political, economic, and ideological containment without direct military conflict",
          "Nuclear first strike to force unconditional surrender",
          "Complete disengagement and mutual recognition",
        ],
        answerIndex: 1,
        explanation: "Kennan advocated patient, long-term containment. He later objected that NSC-68 militarized his recommendation.",
      },
      {
        question: "The Truman Doctrine (1947) was first applied to:",
        options: ["Germany and Austria", "Greece and Turkey", "Japan and Korea", "Italy and France"],
        answerIndex: 1,
        explanation: "Truman requested $400M in aid to Greece (fighting communist insurgency) and Turkey (under Soviet pressure), ending US isolationism.",
      },
      {
        question: "Which of the following best describes the Marshall Plan's purpose?",
        options: [
          "Punish Germany with reparations like Versailles",
          "Rebuild European economies to prevent communism from spreading through misery",
          "Create a military alliance against the USSR",
          "Relocate displaced persons to the Americas",
        ],
        answerIndex: 1,
        explanation: "Marshall: 'The seeds of totalitarian regimes are nurtured by misery and want.' Economic containment.",
      },
      {
        question: "NSC-68 (1950) differed from Kennan's containment by:",
        options: [
          "Recommending withdrawal from Europe",
          "Calling for massive military buildup and tripling defense spending",
          "Proposing direct nuclear first-use",
          "Favoring cooperation with China",
        ],
        answerIndex: 1,
        explanation: "NSC-68 transformed containment from political/economic to heavily military. Defense spending tripled.",
      },
      {
        question: "The Berlin Airlift (1948-49) is historically significant because:",
        options: [
          "It was the first direct combat between US and Soviet forces",
          "It demonstrated that the US would defend West Berlin without firing a shot, and led directly to NATO",
          "It forced Stalin to accept unified German elections",
          "It allowed free movement across the Iron Curtain",
        ],
        answerIndex: 1,
        explanation: "The airlift showed resolve through logistics and soft power. NATO was founded in April 1949.",
      },
      {
        question: "Which pair of events in 1949 produced the greatest shock to American Cold War confidence?",
        options: [
          "Cuban Revolution and Sputnik launch",
          "Soviet atomic bomb test and Mao's victory in China",
          "Hungarian Revolution and Suez Crisis",
          "Korean War and Berlin Wall",
        ],
        answerIndex: 1,
        explanation: "August: USSR tested atomic bomb. October: Mao proclaimed PRC. These 'twin shocks' fueled McCarthyism and NSC-68.",
      },
      {
        question: "During the Korean War, President Truman fired General MacArthur primarily because MacArthur:",
        options: [
          "Refused to fight",
          "Publicly demanded expansion of the war including nuclear use against China, violating civilian control",
          "Lost the Battle of Inchon",
          "Negotiated secretly with North Korea",
        ],
        answerIndex: 1,
        explanation: "MacArthur's public defiance threatened civilian control of the military and the limited-war doctrine.",
      },
      {
        question: "The Hollywood Ten (1947) were convicted of contempt of Congress because they:",
        options: [
          "Confessed to Soviet espionage",
          "Refused to answer HUAC questions about Communist Party membership, invoking the First Amendment",
          "Plagiarized Communist Party pamphlets in screenplays",
          "Published classified material",
        ],
        answerIndex: 1,
        explanation: "They invoked First Amendment protections. All went to prison; the studios issued the Waldorf Statement creating the blacklist.",
      },
      {
        question: "In Brown v. Board of Education (1954), Chief Justice Warren's unanimous opinion held that:",
        options: [
          "Separate but equal facilities violate the 14th Amendment in education",
          "Private schools could still segregate",
          "Schools must desegregate within 30 days",
          "Local governments could set their own segregation rules",
        ],
        answerIndex: 0,
        explanation: "'Separate educational facilities are inherently unequal.' Brown II (1955) added 'with all deliberate speed,' which enabled resistance.",
      },
      {
        question: "Levittown (1951+) illustrates:",
        options: [
          "The success of de jure integration policies",
          "De facto segregation — mass-produced suburbs with whites-only sales policies",
          "Federal civil rights enforcement",
          "Integrated union-built housing",
        ],
        answerIndex: 1,
        explanation: "William Levitt refused to sell to Black families. Combined with redlining, created a racial wealth gap that persists.",
      },
      {
        question: "John Kenneth Galbraith's The Affluent Society (1958) argued that America suffered from:",
        options: [
          "Insufficient consumer spending",
          "'Private wealth amid public squalor' — underfunded infrastructure and public goods",
          "Too much government planning",
          "A shortage of manufacturing",
        ],
        answerIndex: 1,
        explanation: "Galbraith critiqued a society that bought private luxuries while ignoring public needs.",
      },
      {
        question: "Rosa Parks's 1955 arrest in Montgomery is best understood as:",
        options: [
          "An entirely spontaneous refusal by a tired seamstress",
          "A deliberate act by a trained NAACP activist that sparked a 381-day boycott",
          "A publicity stunt funded by the Communist Party",
          "A private dispute unrelated to civil rights",
        ],
        answerIndex: 1,
        explanation: "Parks was NAACP secretary and Highlander-trained. Knowing this corrects the 'tired seamstress' myth.",
      },
      {
        question: "The 1957 Little Rock Crisis ended when:",
        options: [
          "Governor Faubus withdrew the Arkansas National Guard voluntarily",
          "President Eisenhower sent the 101st Airborne Division to escort the Little Rock Nine",
          "The Supreme Court ordered immediate closure of Central High",
          "Federal courts ruled in favor of segregation",
        ],
        answerIndex: 1,
        explanation: "First federal troop deployment to protect Black civil rights since Reconstruction.",
      },
      {
        question: "In 'Letter from Birmingham Jail' (1963), King argues the greatest obstacle to Black freedom is:",
        options: [
          "The Ku Klux Klan",
          "The White Citizens' Council",
          "The white moderate who prefers 'order' to justice",
          "The federal government",
        ],
        answerIndex: 2,
        explanation: "The argument is so provocative because it targets allies, not enemies.",
      },
      {
        question: "Which best captures Foner's framing of the 1950s civil rights movement's key insight?",
        options: [
          "Legal victories alone could dismantle Jim Crow without direct action",
          "Legal change and organized mass action had to work together, with TV giving protests national reach",
          "Nonviolent protest was irrelevant compared to court cases",
          "Northern de facto segregation was solved by Brown v. Board",
        ],
        answerIndex: 1,
        explanation: "Foner emphasizes the combination — NAACP legal strategy plus SCLC/SNCC direct action plus television.",
      },
    ],
    sources: [
      {
        slug: "cold-war-dbq",
        page: 1,
        title: "Cold War DBQ — Document Packet (opening)",
        prompt:
          "Using the document and your knowledge of the period, identify which Cold War strategy the source reflects (containment, rollback, detente) and explain what evidence in the text supports your choice. Then note one limitation of reading the period through this single source.",
      },
      {
        slug: "birmingham-jail-activity",
        page: 3,
        title: "Letter from Birmingham Jail — Activity Packet",
        prompt:
          "Identify the specific argument King develops on this page. Name one philosopher or religious figure he cites (e.g., Aquinas, Augustine, Buber, Tillich) and explain how the reference strengthens his case. Then explain why the letter was addressed to 'moderate' clergymen rather than open segregationists.",
      },
    ],
    shortAnswer: [
      {
        prompt: "Explain how Kennan's original containment strategy differed from the version enacted by NSC-68. Why does this difference matter for understanding later conflicts like Korea and Vietnam?",
        rubric: [
          "Kennan: political, economic, ideological pressure — not military confrontation",
          "NSC-68 militarized containment: tripled defense spending, called for buildup",
          "Kennan himself objected to the shift",
          "Militarization produced proxy wars (Korea, Vietnam) rather than diplomatic pressure",
          "Helps explain why the Cold War became so expensive in lives and money",
        ],
      },
      {
        prompt: "Why did the civil rights movement accelerate in the 1950s specifically, even though segregation had existed for decades? Cite at least three distinct factors.",
        rubric: [
          "WWII and Korean War: Black veterans demanded rights they fought for",
          "Cold War: American racism was a foreign policy liability, pressured federal action",
          "Television: nonviolent protesters appeared dignified, opponents looked brutal",
          "Legal groundwork by NAACP (Marshall) culminating in Brown v. Board",
          "Grassroots organizing and the Great Migration concentrated Black political power",
        ],
      },
      {
        prompt: "In the Letter from Birmingham Jail, King distinguishes 'just' from 'unjust' laws. Explain his framework and why his argument for civil disobedience does not reduce to lawlessness.",
        rubric: [
          "Just law uplifts human personality, squares with moral/natural law (Aquinas)",
          "Unjust law degrades personality, is inflicted by majority on minority but not on itself",
          "Unjust law must be broken openly, lovingly, with willingness to accept penalty",
          "Accepting penalty demonstrates 'highest respect for law'",
          "References Augustine ('unjust law is no law at all'), Buber (I-thou), Tillich (sin as separation)",
        ],
      },
    ],
  },

  {
    id: "midterm-pt2",
    title: "Practice Midterm 2 — The Sixties and Conservative Turn",
    focus: "Chs 25-26 heavy",
    minutes: 45,
    mcq: [
      {
        question: "In 1945 Ho Chi Minh's declaration of Vietnamese independence quoted prominently from:",
        options: ["The Communist Manifesto", "The American Declaration of Independence", "Mao's writings", "French revolutionary slogans"],
        answerIndex: 1,
        explanation: "Ho invoked 'all men are created equal' to appeal for US support. America backed France instead.",
      },
      {
        question: "The 1954 Geneva Accords:",
        options: [
          "Permanently partitioned Vietnam at the 17th parallel",
          "Temporarily divided Vietnam and scheduled 1956 reunification elections that were never held",
          "Transferred Vietnam to UN administration",
          "Granted immediate independence to all of Indochina without conditions",
        ],
        answerIndex: 1,
        explanation: "Elections were scrapped by Diem and the US because Ho would have won ~80%.",
      },
      {
        question: "The Gulf of Tonkin Resolution (1964):",
        options: [
          "Was a formal declaration of war",
          "Granted the president broad authority to use military force without congressional approval for specific actions",
          "Restricted presidential war powers",
          "Was vetoed by Johnson",
        ],
        answerIndex: 1,
        explanation: "Effectively a blank check. Pentagon Papers later revealed the resolution was drafted before the incident.",
      },
      {
        question: "The Tet Offensive (1968) is best described as:",
        options: [
          "A decisive communist military victory",
          "A US tactical victory that shattered American public confidence and credibility",
          "A NATO operation in Southeast Asia",
          "A failed ceasefire proposal",
        ],
        answerIndex: 1,
        explanation: "NVA/VC suffered heavy losses but the scope of the attacks contradicted 'light at the end of the tunnel' claims. Cronkite declared stalemate; LBJ withdrew.",
      },
      {
        question: "Tim O'Brien's 'On the Rainy River' inverts the traditional understanding of courage by arguing that:",
        options: [
          "Courage is inherited from family",
          "Going to a war he opposed was cowardly; fleeing to Canada would have been brave",
          "Courage is impossible in modern war",
          "Fighting without killing is the truest courage",
        ],
        answerIndex: 1,
        explanation: "'I would go to the war because I was embarrassed not to.' Social shame overrode conscience.",
      },
      {
        question: "Betty Friedan's The Feminine Mystique (1963) identified:",
        options: [
          "The need for women to return to traditional roles",
          "'The problem that has no name' — educated suburban housewives' despair at domestic confinement",
          "The economic advantages of two-income households",
          "The superiority of European gender norms",
        ],
        answerIndex: 1,
        explanation: "Launched second-wave feminism. Friedan co-founded NOW in 1966.",
      },
      {
        question: "The 1969 Stonewall uprising is significant because:",
        options: [
          "It ended federal prosecution of gays and lesbians",
          "It sparked the modern LGBTQ+ rights movement through organized resistance to a police raid",
          "It was peaceful and widely celebrated at the time",
          "It established the Pride Parade as a federal holiday",
        ],
        answerIndex: 1,
        explanation: "Five days of protests launched the modern movement and annual Pride marches.",
      },
      {
        question: "Rachel Carson's Silent Spring (1962) is credited with:",
        options: [
          "Sparking the modern environmental movement and eventually leading to DDT restrictions and the EPA",
          "Ending the use of plastics",
          "Founding the National Park system",
          "Launching nuclear disarmament",
        ],
        answerIndex: 0,
        explanation: "Silent Spring warned of pesticide impacts and helped produce the 1970 creation of the EPA.",
      },
      {
        question: "The Warren Court decision establishing Miranda rights addressed:",
        options: [
          "Freedom of the press",
          "Rights of the accused during police interrogation",
          "School prayer",
          "Interracial marriage",
        ],
        answerIndex: 1,
        explanation: "Miranda v. Arizona (1966). Warren Court also issued Griswold (privacy), Loving (interracial marriage), Tinker (student speech).",
      },
      {
        question: "Nixon's 'Silent Majority' speech (November 1969) argued that:",
        options: [
          "Most Americans secretly opposed the war",
          "A quiet conservative majority supported his Vietnam policy while antiwar protesters were a vocal minority",
          "The public should protest louder",
          "Congress was silent on key issues",
        ],
        answerIndex: 1,
        explanation: "Nixon framed protesters as a loud minority vs. the 'real' patriotic majority.",
      },
      {
        question: "The Southern Strategy, as Kevin Phillips described it, aimed to:",
        options: [
          "Win Black voters for the GOP",
          "Exploit white racial resentment to realign Southern whites into a new Republican majority",
          "Abolish the Electoral College",
          "Invest federal aid in the rural South",
        ],
        answerIndex: 1,
        explanation: "Phillips wrote Republicans would get only 10-20% of Black vote — 'don't need any more.'",
      },
      {
        question: "Nixon's Vietnamization combined:",
        options: [
          "Full withdrawal with unconditional surrender",
          "Public US troop withdrawal with secret expanded bombing of Cambodia and Laos",
          "Diplomatic engagement with an end to all bombing",
          "Use of nuclear weapons against Hanoi",
        ],
        answerIndex: 1,
        explanation: "Operation Menu bombed Cambodia secretly. The bombing destabilized Cambodia and contributed to the rise of the Khmer Rouge.",
      },
      {
        question: "The Watergate scandal reached its decisive turning point when:",
        options: [
          "Burglars were arrested in June 1972",
          "The Supreme Court, in US v. Nixon (1974), unanimously ordered Nixon to release the White House tapes",
          "The Senate rejected impeachment",
          "Nixon won reelection in 1972",
        ],
        answerIndex: 1,
        explanation: "The tapes proved Nixon directed the cover-up. He resigned on August 9, 1974.",
      },
      {
        question: "Foner argues that the Warren Court and the rights revolution of the 1960s expanded the definition of 'freedom' primarily by:",
        options: [
          "Returning to narrower 19th-century readings of the Constitution",
          "Recognizing new rights to privacy, free expression, and equal protection for previously excluded groups",
          "Emphasizing states' rights over federal power",
          "Reversing Reconstruction-era precedents",
        ],
        answerIndex: 1,
        explanation: "Foner treats the rights revolution as a major expansion of the substantive content of American liberty.",
      },
      {
        question: "Which event is most closely associated with the phrase 'the whole world is watching'?",
        options: [
          "Selma 1965",
          "Chicago Democratic National Convention, 1968",
          "Kent State shootings, 1970",
          "March on Washington, 1963",
        ],
        answerIndex: 1,
        explanation: "Police attacked protesters outside the DNC in Chicago; protesters chanted 'the whole world is watching' as it was broadcast live.",
      },
    ],
    sources: [
      {
        slug: "vietnam-primary",
        page: 2,
        title: "Vietnam Primary Sources — Ho Chi Minh / Early War",
        prompt:
          "Identify the author and context of this source. Explain how the speaker frames the war (national liberation vs. communist expansion vs. anti-colonial revolt). Then identify one specific American policy or document that this source either challenges or responds to, and explain how.",
      },
      {
        slug: "nixon-conservative",
        page: 5,
        title: "Nixon & the Conservative Turn",
        prompt:
          "Identify the rhetorical move Nixon is making on this page (e.g., Silent Majority appeal, Southern Strategy framing, law-and-order). Explain what political coalition he is trying to build and name one specific group whose votes this move targeted. Then cite one Foner-identified consequence that persisted for decades.",
      },
    ],
    shortAnswer: [
      {
        prompt: "Why did Tet Offensive matter more psychologically than militarily? Support your answer with specific evidence from the 1968 context.",
        rubric: [
          "Tactically: NVA/VC suffered heavy losses; failed to hold cities",
          "Strategically: attacks on 100+ cities including US Embassy contradicted optimistic claims",
          "Cronkite's Feb 1968 editorial declared stalemate",
          "LBJ: 'If I've lost Cronkite, I've lost Middle America'",
          "Led to LBJ's withdrawal from 1968 race; fed broader credibility gap",
        ],
      },
      {
        prompt: "Compare the 'rights revolution' of the 1960s with the conservative backlash it provoked. Name at least two movements and two conservative responses.",
        rubric: [
          "Rights movements: feminism (Friedan, NOW), LGBTQ (Stonewall), Chicano (Chavez/UFW), AIM (Alcatraz), environmentalism (Carson)",
          "Warren Court: Miranda, Griswold, Loving, Tinker, Engel",
          "Conservative backlash: YAF/Sharon Statement, Nixon's Silent Majority",
          "Southern Strategy exploited racial resentment",
          "Moral Majority (late 70s) mobilized evangelical response to rights revolution",
          "Tension defined politics from Nixon through Reagan",
        ],
      },
      {
        prompt: "How did Watergate deepen the public distrust of government that Vietnam had already begun to produce? Be specific about the mechanisms.",
        rubric: [
          "Vietnam's credibility gap: government had lied systematically (Pentagon Papers)",
          "Watergate: abuse of executive power, enemies lists, IRS/FBI weaponized",
          "Cover-up revealed by tapes after US v. Nixon (1974)",
          "First presidential resignation in US history",
          "Led to campaign finance reform, War Powers Act (1973)",
          "The '-gate' suffix became shorthand for ongoing cynicism",
          "Set stage for Reagan's 'government is the problem' framing",
        ],
      },
    ],
  },

  {
    id: "midterm-pt3",
    title: "Practice Midterm 3 — Ford/Carter & Reagan Revolution",
    focus: "Ch 26 heavy (1970s crisis through end of Cold War)",
    minutes: 45,
    mcq: [
      {
        question: "What directly triggered OPEC's 1973 oil embargo against the United States?",
        options: [
          "The Soviet invasion of Afghanistan",
          "US support for Israel during the Yom Kippur War",
          "Nixon's resignation",
          "Collapse of the Bretton Woods system",
        ],
        answerIndex: 1,
        explanation: "October 1973: Arab OPEC members embargoed oil to nations backing Israel. Prices quadrupled.",
      },
      {
        question: "Stagflation presented a fundamental challenge to Keynesian economics because it combined:",
        options: [
          "Deflation with low employment",
          "High inflation with stagnant growth / high unemployment",
          "Balanced budgets with high growth",
          "Wage cuts with full employment",
        ],
        answerIndex: 1,
        explanation: "Phillips curve assumed inflation and unemployment traded off. Stagflation broke that, delegitimizing the liberal consensus.",
      },
      {
        question: "The Iran Hostage Crisis lasted:",
        options: ["44 days", "144 days", "444 days", "1,444 days"],
        answerIndex: 2,
        explanation: "Nov 1979 to Jan 1981. Released minutes after Reagan's inauguration.",
      },
      {
        question: "Operation Eagle Claw (April 1980) was:",
        options: [
          "A successful Special Forces rescue of the Iran hostages",
          "A failed rescue mission in which a helicopter collision killed eight US servicemen",
          "The mining of Nicaraguan harbors",
          "The bombing of Libya",
        ],
        answerIndex: 1,
        explanation: "Helicopter failures forced abort; collision killed eight. Secretary Vance resigned in protest.",
      },
      {
        question: "Carter's 1979 'Crisis of Confidence' (Malaise) speech was initially well received but backfired primarily because:",
        options: [
          "Carter resigned two days later",
          "Carter demanded and received the resignation of his entire cabinet two days later, signaling disarray",
          "Congress impeached him",
          "The speech leaked before delivery",
        ],
        answerIndex: 1,
        explanation: "The cabinet reshuffle undermined the speech's moral authority and made the administration look chaotic.",
      },
      {
        question: "Jerry Falwell's Moral Majority (1979) is best understood as:",
        options: [
          "A bipartisan civic group",
          "A religious-right organization that mobilized evangelicals as a reliable Republican voting bloc",
          "A Catholic charity",
          "A secular tax-reform group",
        ],
        answerIndex: 1,
        explanation: "At peak ~4 million members. Key to Reagan's 1980 coalition and the rise of the religious right.",
      },
      {
        question: "Reagan's 1980 campaign slogan and core promise, contrasted with Carter's, was best summarized as:",
        options: [
          "Sacrifice and moral reform",
          "'Morning in America' — optimism, tax cuts, rebuilt military, restored greatness",
          "Austerity and balanced budgets above all",
          "Universal health care and détente",
        ],
        answerIndex: 1,
        explanation: "Reagan ran on optimism and 'government is the problem' against Carter's pessimism and sacrifice.",
      },
      {
        question: "Reaganomics, as enacted, primarily:",
        options: [
          "Raised the top marginal income tax rate from 28% to 70%",
          "Cut the top marginal income tax rate from 70% to 28%, increased military spending, and tripled the national debt",
          "Balanced the federal budget",
          "Nationalized major industries",
        ],
        answerIndex: 1,
        explanation: "Supply-side theory predicted self-financing cuts (Laffer). Debt exploded and inequality widened.",
      },
      {
        question: "The Anti-Drug Abuse Act of 1986 created a sentencing disparity of:",
        options: [
          "10:1 between powder cocaine and crack cocaine",
          "100:1 between powder cocaine (larger quantity) and crack cocaine (smaller)",
          "No disparity",
          "100:1 favoring crack cocaine",
        ],
        answerIndex: 1,
        explanation: "1g crack = 100g powder for sentencing. Disproportionately targeted Black communities; central to mass incarceration.",
      },
      {
        question: "Which best captures Reagan's Strategic Defense Initiative (SDI, 1983)?",
        options: [
          "An offensive nuclear weapons program",
          "A proposed space-based missile defense system, nicknamed 'Star Wars,' technologically implausible at the time",
          "A treaty signed with the USSR",
          "A cyber-defense program",
        ],
        answerIndex: 1,
        explanation: "Pressure strategy intended to force Soviet economic strain. Historians still debate how decisive SDI was in Soviet collapse.",
      },
      {
        question: "The Iran-Contra Affair violated US law by:",
        options: [
          "Raising taxes without Congress",
          "Selling arms to Iran in violation of an arms embargo and diverting profits to fund the Contras in violation of the Boland Amendment",
          "Recognizing China",
          "Breaking the SALT treaty",
        ],
        answerIndex: 1,
        explanation: "Both pieces were illegal. Oliver North orchestrated the diversion. Reagan claimed ignorance.",
      },
      {
        question: "Gary Webb's 1996 'Dark Alliance' series alleged that:",
        options: [
          "The Soviets sold drugs to fund spying",
          "CIA-backed Contras sold crack cocaine in Los Angeles during the 1980s, helping spark the crack epidemic",
          "China funded the opium trade",
          "Mexican cartels built the Reagan campaign",
        ],
        answerIndex: 1,
        explanation: "Major newspapers attacked Webb's reporting; he died in 2004. A 1998 CIA IG report substantially confirmed his main allegations.",
      },
      {
        question: "Gorbachev's domestic reforms after 1985 were:",
        options: [
          "Perestroika (economic restructuring) and Glasnost (openness)",
          "Shock therapy and privatization",
          "Full rearmament and centralization",
          "Reversal of post-Stalin reforms",
        ],
        answerIndex: 0,
        explanation: "Intended to save the USSR; unintentionally accelerated collapse by legitimizing criticism.",
      },
      {
        question: "The Berlin Wall fell on:",
        options: ["November 9, 1989", "December 25, 1991", "June 12, 1987", "August 13, 1961"],
        answerIndex: 0,
        explanation: "A confused East German press conference prompted crowds to storm the Wall. Germany reunified October 1990.",
      },
      {
        question: "Foner's overall framing of the Reagan years emphasizes:",
        options: [
          "Unqualified triumph over communism with few domestic costs",
          "Foreign policy recalibration paired with sharpening economic inequality, mass incarceration, and the deregulatory turn",
          "A return to New Deal economics",
          "Political realignment favoring the Democratic Party",
        ],
        answerIndex: 1,
        explanation: "Foner treats the period as both a Cold War endgame and a domestic transformation that produced lasting inequality.",
      },
    ],
    sources: [
      {
        slug: "seventies-malaise",
        page: 4,
        title: "1970s — From Malaise to Morning in America",
        prompt:
          "Identify the specific 1970s crisis this page highlights (stagflation, oil shock, Iran hostages, or related). Explain why mainstream Keynesian economics could not account for it, and how the crisis opened rhetorical space for Reagan's 1980 campaign.",
      },
      {
        slug: "reagan-era",
        page: 10,
        title: "Reagan Era Slide Deck",
        prompt:
          "Name the Reagan policy or event depicted on this page. Identify the rhetorical strategy (optimism, anti-government, anti-communism, moral-cultural appeal) and describe how it connected Reagan's domestic coalition (evangelicals, working-class whites, business conservatives) with his foreign policy goals.",
      },
    ],
    shortAnswer: [
      {
        prompt: "Explain how the crises of the late 1970s created the conditions for Reagan's 1980 victory. Address at least three distinct factors (economic, foreign policy, cultural).",
        rubric: [
          "Stagflation delegitimized Keynesian liberalism",
          "Oil shocks (1973, 1979) exposed energy vulnerability",
          "Iran Hostage Crisis (444 days) made Carter look weak",
          "Carter's malaise speech + cabinet reshuffle destroyed his standing",
          "Family demographic shifts fueled Religious Right / Moral Majority",
          "Reagan offered optimism vs. sacrifice; 'Morning in America' framing",
          "Coalition: evangelicals + working-class whites + business + Cold Warriors",
        ],
      },
      {
        prompt: "Assess Reaganomics. Did supply-side economics 'work'? Use evidence both for and against the claim.",
        rubric: [
          "For: ended stagflation, long expansion, top rate cut 70%→28%",
          "For: renewed optimism, broader ideological shift that outlasted Reagan",
          "Against: tripled national debt ($908B → $2.87T)",
          "Against: widened income inequality significantly",
          "Against: Laffer promise (self-financing cuts) did not pan out",
          "Evaluation: depends on metric — growth vs. distribution vs. debt",
        ],
      },
      {
        prompt: "Connect Reagan's War on Drugs to the broader phenomenon of mass incarceration. Why do some historians (e.g., Michelle Alexander) call this 'the New Jim Crow'?",
        rubric: [
          "Anti-Drug Abuse Act 1986; 100:1 crack/powder disparity",
          "Mandatory minimums and three-strikes laws",
          "Prison population grew from ~300K (1972) to 2M+ (2000)",
          "Disproportionately affected Black and Latino men",
          "Alexander: race-neutral on paper but racially stratified in effect",
          "Functions as a caste system replacing explicit segregation",
          "Linked to Reagan's Latin America policy via Contras / Gary Webb allegations",
        ],
      },
    ],
  },
];
