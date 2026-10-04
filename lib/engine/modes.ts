import type { PoolFilter } from "./select";

export type PracticeModeId =
  | "quick"
  | "random"
  | "topic"
  | "signs"
  | "laws"
  | "safety"
  | "weak"
  | "mistakes"
  | "unseen";

export interface PracticeModeDef {
  id: PracticeModeId;
  label: string;
  blurb: string;
  count: number;
  balanceTopics: boolean;
  preferUnseen: boolean;
  filter: PoolFilter;
  /** Needs progress history to be meaningful. */
  needsHistory?: boolean;
  needsTopic?: boolean;
}

/** Every practice mode is just a different configuration of the same engine. */
export const PRACTICE_MODES: PracticeModeDef[] = [
  { id: "quick", label: "Quick Practice", blurb: "10 questions across topics. A fast daily warm-up.", count: 10, balanceTopics: true, preferUnseen: true, filter: {} },
  { id: "random", label: "Random Practice", blurb: "20 questions drawn at random from the whole bank.", count: 20, balanceTopics: false, preferUnseen: false, filter: {} },
  { id: "topic", label: "Topic Practice", blurb: "Drill one topic until it sticks.", count: 15, balanceTopics: false, preferUnseen: true, filter: {}, needsTopic: true },
  { id: "signs", label: "Road Signs", blurb: "Signs, signals and pavement markings.", count: 15, balanceTopics: false, preferUnseen: true, filter: { groups: ["signs"] } },
  { id: "laws", label: "Traffic Laws", blurb: "Right-of-way, speed limits, parking and licensing rules.", count: 15, balanceTopics: true, preferUnseen: true, filter: { groups: ["laws"] } },
  { id: "safety", label: "Safe Driving", blurb: "Sharing the road, emergencies, alcohol and equipment.", count: 15, balanceTopics: true, preferUnseen: true, filter: { groups: ["safety"] } },
  { id: "weak", label: "Weak Topics", blurb: "Focuses on the topics you miss most.", count: 15, balanceTopics: true, preferUnseen: false, filter: {}, needsHistory: true },
  { id: "mistakes", label: "Review Mistakes", blurb: "Every question you most recently got wrong.", count: 50, balanceTopics: false, preferUnseen: false, filter: { history: "incorrect" }, needsHistory: true },
  { id: "unseen", label: "New Questions", blurb: "Only questions you haven't answered yet.", count: 15, balanceTopics: true, preferUnseen: true, filter: { history: "unseen" } },
];

export const modeById = (id: string) => PRACTICE_MODES.find((m) => m.id === id);
