

interface AutocompleteItem {
  title: string;
  expanded?: boolean;
  description?: string;
}
interface AutocompleteSession {
  currentUserInput: string;
  stopped: boolean;
  items: AutocompleteItem[]
  cwd: string
}

interface Autocomplete {
  sessions: {
    [key: string]: AutocompleteSession | undefined;
  };
}

interface AutocompleteSessionsState {
  autocomplete: Autocomplete;
}

interface AutocompleteState {
  sessions: AutocompleteSessionsState
}
