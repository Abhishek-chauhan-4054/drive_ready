import type { MockPreset, Question, StateContent, StateSummary, TestType } from "../types";

/**
 * Data-access contracts. The UI only talks to these interfaces, so swapping the
 * LocalContentProvider (JSON files) for a SupabaseContentProvider later does not
 * touch any page or component.
 */
export interface StateRepository {
  listStates(): Promise<StateSummary[]>;
  getStateBySlug(slug: string): Promise<StateContent | null>;
  getStateSummary(slug: string): Promise<StateSummary | null>;
}

export interface QuestionQuery {
  licenseType?: string;
  /** Defaults to approved-only. Drafts are never served in production. */
  includeDrafts?: boolean;
}

export interface QuestionRepository {
  getQuestions(stateCode: string, query?: QuestionQuery): Promise<Question[]>;
}

export interface TestRepository {
  getTestTypes(stateSlug: string): Promise<TestType[]>;
  getPrimaryTestType(stateSlug: string): Promise<TestType | null>;
  getMockPresets(stateSlug: string, testTypeId: string): Promise<MockPreset[]>;
}

export interface ContentProvider {
  states: StateRepository;
  questions: QuestionRepository;
  tests: TestRepository;
}
