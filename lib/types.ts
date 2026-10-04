export type Difficulty = "easy" | "medium" | "hard";
export type ContentType = "PRACTICE" | "OFFICIAL_REFERENCE";
export type QuestionStatus = "approved" | "draft" | "retired";

export interface Question {
  id: string;
  state: string;
  licenseType: string;
  contentType: ContentType;
  category: string;
  difficulty: Difficulty;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  sourceTitle: string;
  sourceUrl: string;
  sourceSection: string;
  lastVerified: string;
  status: QuestionStatus;
  tags?: string[];
  /** Set true when option order carries meaning (e.g. "All of the above"). */
  lockOptionOrder?: boolean;
  /** Required for OFFICIAL_REFERENCE items: why we may show it. */
  officialUsageNote?: string;
}

export interface SectionRequirement {
  tag: string;
  label: string;
  questionCount: number;
  minCorrect: number;
}

export interface SourceRef {
  title: string;
  url: string;
  section?: string;
}

export interface TestRules {
  officialQuestionCount: number | null;
  officialPassingCorrect: number | null;
  officialPassingPercent: number | null;
  timeLimitMinutes: number | null;
  sectionRequirements: SectionRequirement[];
  notes: string[];
  source: SourceRef;
}

export interface MockPreset {
  id: string;
  label: string;
  description: string;
  questionCount: number;
  passingCorrect: number | null;
  passingPercent: number | null;
  isOfficialFormat: boolean;
  sectionRequirements?: SectionRequirement[];
  includeTags?: string[];
  excludeTags?: string[];
  timeLimitMinutes?: number | null;
}

export interface TestType {
  id: string;
  name: string;
  shortName: string;
  available: boolean;
  description: string;
  testRules?: TestRules;
  mockPresets?: MockPreset[];
}

export type ResourceKind = "agency" | "handbook" | "sample-test" | "licensing";

export interface Resource {
  kind: ResourceKind;
  title: string;
  url: string;
}

export interface SourcedNote {
  text: string;
  sourceUrl: string;
  sourceSection?: string;
}

export interface FaqItem {
  q: string;
  a: string;
  sourceUrl?: string;
}

export interface StateContent {
  stateCode: string;
  stateName: string;
  slug: string;
  agencyShortName: string;
  officialSource: { name: string; url: string };
  officialDomains: string[];
  lastReviewed: string;
  resources: Resource[];
  intro: string;
  testTypes: TestType[];
  categories: string[];
  commonMistakes: SourcedNote[];
  faq: FaqItem[];
  questions: Question[];
}

/**
 * - available:    verified question bank — practice + mock tests are live
 * - study-hub:    verified test format + official links, question bank in progress
 * - in-review:    on the launch roadmap; handbook verification in progress
 * - coming-soon:  not started yet
 */
export type StateStatus = "available" | "study-hub" | "in-review" | "coming-soon";

export interface StateSummary {
  code: string;
  name: string;
  slug: string;
  status: StateStatus;
  priority: boolean;
  questionCount: number;
  agency?: { name: string; url: string };
}

export interface CategoryDef {
  id: string;
  label: string;
  group: "signs" | "laws" | "safety";
}
