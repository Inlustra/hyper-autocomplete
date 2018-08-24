interface AutocompleteSession {
  currentUserInput: string;
  stopped: boolean;
}

interface Autocomplete {
  sessions: {
    [key: string]: AutocompleteSession | undefined;
  };
}

interface AutocompleteState {
  autocomplete?: Autocomplete;
}
