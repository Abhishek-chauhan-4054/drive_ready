"use client";

import { useMemo, useState } from "react";
import type { StateStatus, StateSummary } from "@/lib/types";
import { StateCard, STATUS_LABEL } from "./Common";

const FILTERS: Array<{ id: "all" | StateStatus; label: string }> = [
  { id: "all", label: "All states" },
  { id: "available", label: STATUS_LABEL.available },
  { id: "study-hub", label: STATUS_LABEL["study-hub"] },
  { id: "in-review", label: "In verification" },
  { id: "coming-soon", label: STATUS_LABEL["coming-soon"] },
];

const ORDER: Record<StateStatus, number> = { available: 0, "study-hub": 1, "in-review": 2, "coming-soon": 3 };

export function StateDirectory({ states }: { states: StateSummary[] }) {
  const [q, setQ] = useState("");
  const [f, setF] = useState<"all" | StateStatus>("all");
  const [sort, setSort] = useState<"status" | "az">("status");

  const list = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return states
      .filter((s) => (f === "all" || s.status === f) && (!needle || s.name.toLowerCase().includes(needle) || s.code.toLowerCase() === needle))
      .sort((a, b) => (sort === "status" ? ORDER[a.status] - ORDER[b.status] : 0) || a.name.localeCompare(b.name));
  }, [states, q, f, sort]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: states.length };
    for (const s of states) c[s.status] = (c[s.status] ?? 0) + 1;
    return c;
  }, [states]);

  return (
    <div>
      <div className="filter-bar">
        <label htmlFor="state-search" className="sr-only">Search states</label>
        <input
          id="state-search"
          className="search"
          type="search"
          placeholder="Search by state name or code…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          autoComplete="off"
        />
        <button type="button" className="chip" aria-pressed={sort === "az"} onClick={() => setSort(sort === "az" ? "status" : "az")}>
          {sort === "az" ? "Sorted A–Z" : "Sort A–Z"}
        </button>
      </div>
      <div className="filter-bar" role="group" aria-label="Filter by status">
        {FILTERS.map((x) => (
          <button key={x.id} type="button" className="chip" aria-pressed={f === x.id} onClick={() => setF(x.id)}>
            {x.label} <span className="tnum" style={{ opacity: 0.85 }}>{counts[x.id] ?? 0}</span>
          </button>
        ))}
      </div>
      <p className="sr-only" aria-live="polite">{list.length} states shown</p>
      {list.length ? (
        <div className="grid grid-4">
          {list.map((s) => (
            <StateCard key={s.code} s={s} />
          ))}
        </div>
      ) : (
        <p className="muted">No states match “{q}”.</p>
      )}
    </div>
  );
}
