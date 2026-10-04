import data from "@/content/categories.json";
import type { CategoryDef } from "./types";

export const CATEGORIES = data.categories as CategoryDef[];
export const GROUPS = data.groups as { id: CategoryDef["group"]; label: string }[];

const byId = new Map(CATEGORIES.map((c) => [c.id, c]));

export function categoryLabel(id: string): string {
  return byId.get(id)?.label ?? id;
}

export function categoryGroup(id: string): CategoryDef["group"] | undefined {
  return byId.get(id)?.group;
}

export function groupLabel(id: string): string {
  return GROUPS.find((g) => g.id === id)?.label ?? id;
}
