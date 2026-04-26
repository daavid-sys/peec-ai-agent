import { useSyncExternalStore } from "react";
import type { Engagement, Opening, Project, PromptOpportunity } from "./types";
import {
  demoEngagements,
  demoOpenings,
  demoProject,
  demoPrompts,
} from "./demo-data";

interface AppState {
  connected: boolean;
  demoMode: boolean;
  project: Project | null;
  prompts: PromptOpportunity[];
  selectedPromptId: string | null;
  openings: Opening[];
  selectedOpeningId: string | null;
  engagements: Engagement[];
}

let state: AppState = {
  connected: true,
  demoMode: true,
  project: demoProject,
  prompts: demoPrompts,
  selectedPromptId: demoPrompts[0]?.id ?? null,
  openings: demoOpenings,
  selectedOpeningId: demoOpenings[0]?.id ?? null,
  engagements: demoEngagements,
};

const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((l) => l());
}

export const store = {
  getState: () => state,
  subscribe: (l: () => void) => {
    listeners.add(l);
    return () => listeners.delete(l);
  },
  set: (partial: Partial<AppState>) => {
    state = { ...state, ...partial };
    notify();
  },
  // actions
  connect: () => {
    state = {
      ...state,
      connected: true,
      demoMode: true,
      project: demoProject,
    };
    notify();
  },
  loadDemoProject: () => {
    state = {
      ...state,
      connected: true,
      demoMode: true,
      project: demoProject,
      prompts: demoPrompts,
      selectedPromptId: demoPrompts[0].id,
      openings: demoOpenings,
      selectedOpeningId: demoOpenings[0].id,
      engagements: demoEngagements,
    };
    notify();
  },
  selectPrompt: (id: string) => {
    state = {
      ...state,
      selectedPromptId: id,
      // for demo, only p1 has openings — show all openings if matched
      openings: demoOpenings.filter((o) => o.promptId === id).length
        ? demoOpenings.filter((o) => o.promptId === id)
        : demoOpenings,
      selectedOpeningId: demoOpenings[0].id,
    };
    notify();
  },
  selectOpening: (id: string) => {
    state = { ...state, selectedOpeningId: id };
    notify();
  },
  updateEngagementStatus: (id: string, status: Engagement["status"]) => {
    state = {
      ...state,
      engagements: state.engagements.map((e) =>
        e.id === id ? { ...e, status } : e,
      ),
    };
    notify();
  },
  reset: () => {
    state = {
      connected: false,
      demoMode: true,
      project: null,
      prompts: [],
      selectedPromptId: null,
      openings: [],
      selectedOpeningId: null,
      engagements: [],
    };
    notify();
  },
};

export function useAppStore<T>(selector: (s: AppState) => T): T {
  return useSyncExternalStore(
    store.subscribe,
    () => selector(store.getState()),
    () => selector(store.getState()),
  );
}
