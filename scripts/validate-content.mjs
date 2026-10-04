#!/usr/bin/env node
/**
 * Content validator — `npm run validate-content` (also runs automatically before `npm run build`).
 *
 * Fails (exit 1) on any production-content error so a bad question can never ship.
 * Warnings (stale verification dates, etc.) are printed but do not fail the build.
 */
import { readFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const CONTENT = join(ROOT, "content");
const STATES_DIR = join(CONTENT, "states");

const DIFFICULTIES = new Set(["easy", "medium", "hard"]);
const STATUSES = new Set(["approved", "draft", "retired"]);
const CONTENT_TYPES = new Set(["PRACTICE", "OFFICIAL_REFERENCE"]);
const RESOURCE_KINDS = new Set(["agency", "handbook", "sample-test", "licensing"]);
const REQUIRED_Q_FIELDS = [
  "id", "state", "licenseType", "contentType", "category", "difficulty", "question",
  "options", "correctAnswer", "explanation", "sourceTitle", "sourceUrl", "sourceSection",
  "lastVerified", "status",
];
const STALE_DAYS = 365;

const errors = [];
const warnings = [];
const err = (where, msg) => errors.push(`✖ ${where}: ${msg}`);
const warn = (where, msg) => warnings.push(`⚠ ${where}: ${msg}`);

const readJson = (p) => {
  try {
    return JSON.parse(readFileSync(p, "utf8"));
  } catch (e) {
    err(p.replace(ROOT + "/", ""), `invalid JSON — ${e.message}`);
    return null;
  }
};

const isIsoDate = (s) => typeof s === "string" && /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(Date.parse(s));
const today = new Date();

function checkUrl(where, url, officialDomains) {
  let u;
  try {
    u = new URL(url);
  } catch {
    return err(where, `invalid URL "${url}"`);
  }
  if (u.protocol !== "https:") err(where, `URL must use https: ${url}`);
  if (officialDomains) {
    const host = u.hostname.toLowerCase();
    const ok = officialDomains.some((d) => host === d || host.endsWith("." + d));
    if (!ok) err(where, `URL host "${host}" is not one of the state's official domains (${officialDomains.join(", ")})`);
  }
}

const normalize = (s) => s.toLowerCase().replace(/[^\p{L}\p{N}½¼¾$%]+/gu, " ").trim();

// ---------------------------------------------------------------- roster + categories
const roster = readJson(join(CONTENT, "roster.json"));
const cats = readJson(join(CONTENT, "categories.json"));
const categoryIds = new Set((cats?.categories ?? []).map((c) => c.id));
const groupIds = new Set((cats?.groups ?? []).map((g) => g.id));
for (const c of cats?.categories ?? []) {
  if (!groupIds.has(c.group)) err("categories.json", `category "${c.id}" has unknown group "${c.group}"`);
}

const rosterByCode = new Map();
const rosterSlugs = new Set();
for (const s of roster?.states ?? []) {
  if (!/^[A-Z]{2}$/.test(s.code)) err("roster.json", `bad state code "${s.code}"`);
  if (rosterByCode.has(s.code)) err("roster.json", `duplicate state code ${s.code}`);
  if (rosterSlugs.has(s.slug)) err("roster.json", `duplicate slug ${s.slug}`);
  rosterByCode.set(s.code, s);
  rosterSlugs.add(s.slug);
  if (s.agency?.url) checkUrl(`roster.json ${s.code}`, s.agency.url, null);
  if (s.agency?.url && !new URL(s.agency.url).hostname.endsWith(".gov")) {
    err(`roster.json ${s.code}`, `agency URL must be a .gov domain: ${s.agency.url}`);
  }
}
if (roster && roster.states.length !== 50) err("roster.json", `expected 50 states, found ${roster.states.length}`);

// ---------------------------------------------------------------- state files
const allIds = new Map();
let questionTotal = 0;
const files = readdirSync(STATES_DIR).filter((f) => f.endsWith(".json"));

for (const file of files) {
  const where = `states/${file}`;
  const st = readJson(join(STATES_DIR, file));
  if (!st) continue;

  for (const k of ["stateCode", "stateName", "slug", "officialSource", "officialDomains", "resources", "testTypes", "questions", "lastReviewed"]) {
    if (st[k] === undefined || st[k] === null) err(where, `missing "${k}"`);
  }
  const r = rosterByCode.get(st.stateCode);
  if (!r) err(where, `stateCode "${st.stateCode}" is not in roster.json`);
  else {
    if (r.slug !== st.slug) err(where, `slug "${st.slug}" does not match roster slug "${r.slug}"`);
    if (r.name !== st.stateName) err(where, `stateName "${st.stateName}" does not match roster "${r.name}"`);
  }
  if (file !== `${st.slug}.json`) err(where, `file name must be ${st.slug}.json`);
  if (!isIsoDate(st.lastReviewed)) err(where, `lastReviewed must be YYYY-MM-DD`);

  const domains = st.officialDomains ?? [];
  if (!domains.length) err(where, "officialDomains must list at least one domain");
  for (const d of domains) if (!d.endsWith(".gov")) err(where, `official domain "${d}" must be a .gov domain`);

  checkUrl(`${where} officialSource`, st.officialSource?.url, domains);
  const kinds = new Set();
  for (const res of st.resources ?? []) {
    if (!RESOURCE_KINDS.has(res.kind)) err(where, `resource kind "${res.kind}" invalid`);
    if (!res.title) err(where, `resource missing title`);
    checkUrl(`${where} resource "${res.title}"`, res.url, domains);
    kinds.add(res.kind);
  }
  for (const k of ["agency", "handbook"]) if (!kinds.has(k)) err(where, `resources must include an official "${k}" link`);

  // test types
  const typeIds = new Set();
  for (const t of st.testTypes ?? []) {
    const tw = `${where} testType ${t.id}`;
    if (!t.id || !t.name) err(tw, "test type needs id and name");
    typeIds.add(t.id);
    if (!t.testRules) {
      if (t.available) err(tw, "available test types must define testRules");
      continue;
    }
    const tr = t.testRules;
    if (tr.officialPassingCorrect != null && tr.officialQuestionCount == null) err(tw, "officialPassingCorrect needs officialQuestionCount");
    if (tr.officialPassingCorrect != null && tr.officialPassingCorrect > tr.officialQuestionCount) err(tw, "passing correct exceeds question count");
    if (tr.officialPassingPercent != null && (tr.officialPassingPercent <= 0 || tr.officialPassingPercent > 100)) err(tw, "passing percent out of range");
    if (!tr.source?.url) err(tw, "testRules.source.url is required — test rules must cite an official source");
    else checkUrl(`${tw} testRules.source`, tr.source.url, domains);
    for (const p of t.mockPresets ?? []) {
      if (!p.id || !p.label || !(p.questionCount > 0)) err(tw, `mock preset needs id, label and questionCount`);
      if (p.passingCorrect != null && p.passingCorrect > p.questionCount) err(tw, `preset ${p.id}: passingCorrect > questionCount`);
      if (p.isOfficialFormat && p.passingCorrect == null && p.passingPercent == null) err(tw, `preset ${p.id}: official presets must state a passing rule`);
    }
  }

  // questions
  const seenText = new Map();
  const stateCats = new Set(st.categories ?? []);
  for (const q of st.questions ?? []) {
    const qw = `${where} ${q.id ?? "(no id)"}`;
    for (const f of REQUIRED_Q_FIELDS) {
      const v = q[f];
      if (v === undefined || v === null || (typeof v === "string" && !v.trim())) err(qw, `missing ${f}`);
    }
    if (q.id) {
      if (allIds.has(q.id)) err(qw, `duplicate question id (also in ${allIds.get(q.id)})`);
      allIds.set(q.id, file);
    }
    if (q.state !== st.stateCode) err(qw, `state "${q.state}" does not match file state ${st.stateCode}`);
    if (!typeIds.has(q.licenseType)) err(qw, `licenseType "${q.licenseType}" is not a test type in this state`);
    if (!CONTENT_TYPES.has(q.contentType)) err(qw, `contentType must be PRACTICE or OFFICIAL_REFERENCE`);
    if (!categoryIds.has(q.category)) err(qw, `invalid category "${q.category}"`);
    if (!stateCats.has(q.category)) err(qw, `category "${q.category}" not listed in state categories`);
    if (!DIFFICULTIES.has(q.difficulty)) err(qw, `invalid difficulty "${q.difficulty}"`);
    if (!STATUSES.has(q.status)) err(qw, `invalid status "${q.status}"`);
    if (!Array.isArray(q.options) || q.options.length < 2) err(qw, "needs at least 2 options");
    else {
      if (new Set(q.options.map(normalize)).size !== q.options.length) err(qw, "duplicate options");
      if (!q.options.includes(q.correctAnswer)) err(qw, "correctAnswer is not one of the options");
    }
    if (q.sourceUrl) checkUrl(qw, q.sourceUrl, domains);
    if (q.lastVerified) {
      if (!isIsoDate(q.lastVerified)) err(qw, "lastVerified must be YYYY-MM-DD");
      else {
        const d = new Date(q.lastVerified);
        if (d > today) err(qw, "lastVerified is in the future");
        else if ((today - d) / 864e5 > STALE_DAYS) warn(qw, `lastVerified is older than ${STALE_DAYS} days — re-verify against the source`);
      }
    }
    if (q.question) {
      const key = normalize(q.question);
      if (seenText.has(key)) err(qw, `duplicate question text (same as ${seenText.get(key)})`);
      seenText.set(key, q.id);
    }
    if (q.contentType === "OFFICIAL_REFERENCE" && !q.officialUsageNote) {
      err(qw, "OFFICIAL_REFERENCE questions need officialUsageNote explaining why they can be shown");
    }
    if (q.status === "approved") questionTotal++;
  }
  for (const c of stateCats) if (!categoryIds.has(c)) err(where, `state category "${c}" is not a global category`);
}

// ---------------------------------------------------------------- report
for (const w of warnings) console.warn(w);
if (errors.length) {
  for (const e of errors) console.error(e);
  console.error(`\nContent validation FAILED with ${errors.length} error(s).`);
  process.exit(1);
}
console.log(`✔ Content valid — ${files.length} state file(s), ${questionTotal} approved question(s), ${warnings.length} warning(s).`);
