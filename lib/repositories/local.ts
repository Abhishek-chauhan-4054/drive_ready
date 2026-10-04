import "server-only";
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import roster from "@/content/roster.json";
import { SITE } from "../site";
import type { Question, StateContent, StateStatus, StateSummary } from "../types";
import type { ContentProvider, QuestionQuery } from "./types";

const STATES_DIR = join(process.cwd(), "content", "states");

type RosterEntry = {
  code: string;
  name: string;
  slug: string;
  priority?: boolean;
  agency?: { name: string; url: string };
};

let cache: Map<string, StateContent> | null = null;

/** Loads every content/states/*.json once per build. Adding a file is all it takes. */
function loadAll(): Map<string, StateContent> {
  if (cache) return cache;
  const map = new Map<string, StateContent>();
  if (existsSync(STATES_DIR)) {
    for (const file of readdirSync(STATES_DIR)) {
      if (!file.endsWith(".json")) continue;
      const data = JSON.parse(readFileSync(join(STATES_DIR, file), "utf8")) as StateContent;
      map.set(data.slug, data);
    }
  }
  cache = map;
  return map;
}

const approved = (qs: Question[]) => qs.filter((q) => q.status === "approved");

function statusFor(entry: RosterEntry, content: StateContent | undefined): StateStatus {
  if (content) {
    const n = approved(content.questions).length;
    const hasPractice = content.testTypes.some((t) => t.available);
    if (hasPractice && n >= SITE.minQuestionsForPractice) return "available";
    return "study-hub";
  }
  return entry.priority ? "in-review" : "coming-soon";
}

function summarize(entry: RosterEntry): StateSummary {
  const content = loadAll().get(entry.slug);
  return {
    code: entry.code,
    name: entry.name,
    slug: entry.slug,
    status: statusFor(entry, content),
    priority: Boolean(entry.priority),
    questionCount: content ? approved(content.questions).length : 0,
    agency: content ? { name: content.officialSource.name, url: content.officialSource.url } : entry.agency,
  };
}

export const LocalContentProvider: ContentProvider = {
  states: {
    async listStates() {
      return (roster.states as RosterEntry[]).map(summarize);
    },
    async getStateBySlug(slug) {
      const s = loadAll().get(slug);
      if (!s) return null;
      return { ...s, questions: approved(s.questions) };
    },
    async getStateSummary(slug) {
      const entry = (roster.states as RosterEntry[]).find((r) => r.slug === slug);
      return entry ? summarize(entry) : null;
    },
  },
  questions: {
    async getQuestions(stateCode: string, query: QuestionQuery = {}) {
      const s = [...loadAll().values()].find((x) => x.stateCode === stateCode);
      if (!s) return [];
      return s.questions.filter(
        (q) =>
          (query.includeDrafts ? q.status !== "retired" : q.status === "approved") &&
          (!query.licenseType || q.licenseType === query.licenseType),
      );
    },
  },
  tests: {
    async getTestTypes(slug) {
      return loadAll().get(slug)?.testTypes ?? [];
    },
    async getPrimaryTestType(slug) {
      const types = loadAll().get(slug)?.testTypes ?? [];
      return types.find((t) => t.available) ?? types[0] ?? null;
    },
    async getMockPresets(slug, testTypeId) {
      const t = loadAll().get(slug)?.testTypes.find((x) => x.id === testTypeId);
      return t?.mockPresets ?? [];
    },
  },
};
