import { fileAutocompletionProvider } from "./providers/file";
import { gitAutocompletionProvider } from "./providers/git";
import { ui } from "../common/ui";
import React from "react";
import Fuse from "fuse.js";
import { fuseWithHighlights } from "../common/fuse";

const fuse = new Fuse([] as Suggestion[], {
  keys: ["searchText", "label"],
  includeMatches: true,
  includeScore: true
});

function dedupeSuggestions(suggestions: Suggestion[]) {
  return suggestions.filter((obj, pos, arr) => {
    return arr.map(mapObj => mapObj["label"]).indexOf(obj["label"]) === pos;
  });
}

export async function autocomplete(
  ctx: AutocompleteContext,
  providers: AutocompleteProvider[]
): Promise<Suggestion[]> {
  let suggestions = (
    await Promise.all(providers.map(provider => provider(ctx)))
  ).reduce<Suggestion[]>((prev, suggestions) => [...prev, ...suggestions], []);
  const searchTerm =
    ctx.argumentList.length > 0 ? ctx.argument || undefined : ctx.command;
  if (searchTerm) {
    fuse.setCollection(suggestions);
    suggestions = fuseWithHighlights(fuse.search(searchTerm))
      .sort((a, b) => {
        if (a.item.detail && b.item.detail) {
          if (a.score > b.score) {
            return 1;
          } else if (a.score < b.score) {
            return -1;
          }
        }
        if (a.item.detail) {
          return -1;
        } else if (b.item.detail) {
          return 1;
        } else if (a.score > b.score) {
          return 1;
        } else if (a.score < b.score) {
          return -1;
        } else {
          return a.item.label.localeCompare(b.item.label);
        }
      })
      .map(suggestion => ({
        ...suggestion.item,
        highlightLabel: suggestion.highlights.label
      }));
  } else {
    suggestions = suggestions.sort((a, b) => {
      if (a.detail && b.detail) {
        return a.label.localeCompare(b.label);
      } else if (a.detail) {
        return -1;
      } else if (b.detail) {
        return 1;
      } else {
        return a.label.localeCompare(b.label);
      }
    });
  }

  return dedupeSuggestions(suggestions);
}
