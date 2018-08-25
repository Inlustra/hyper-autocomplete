interface Suggestion {
  title: string;
  detail?: string;
  documentation?: string;
  sortText?: string;
  filterText?: string;
  insertText?: string;
}

interface AutocompleteContext {
  currentUserInput: string;
  stopped: boolean;
  suggestions: Suggestion[];
  cwd: string;
}

interface Autocomplete {
  sessions: {
    [key: string]: AutocompleteContext | undefined;
  };
}

interface AutocompleteSessionsState {
  autocomplete: Autocomplete;
}

interface AutocompleteState {
  sessions: AutocompleteSessionsState;
}
