// The place in each room where you write, and how that journal talks to you.

/** How the close-up looks: a board with notes stuck on it, or an open diary. */
export type Kind = "cork" | "mirror" | "fridge" | "diary";
export type Spot = { title: string; kind: Kind; prompt: string; save: string; empty: string };

export const SPOTS: Record<string, Record<string, Spot>> = {
  bedroom: {
    journal: {
      title: "the cork board",
      kind: "cork",
      prompt: "pin a thought before sleep…",
      save: "pin it",
      empty: "nothing pinned yet. the board is waiting.",
    },
  },
  bathroom: {
    journal: {
      title: "the mirror",
      kind: "mirror",
      prompt: "what did you tell yourself today?",
      save: "stick it on",
      empty: "the mirror is clear. say something kind.",
    },
  },
  kitchen: {
    journal: {
      title: "the fridge door",
      kind: "fridge",
      prompt: "what fed you today?",
      save: "stick it on",
      empty: "an empty fridge door. leave a note.",
    },
  },
  balcony: {
    journal: {
      title: "the diary",
      kind: "diary",
      prompt: "tonight, i'm thinking about…",
      save: "write it down",
      empty: "a fresh page. the night is quiet.",
    },
  },
};
