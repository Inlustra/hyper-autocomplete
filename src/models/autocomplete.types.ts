

interface AutocompleteItem {
  title: string;
  expanded?: boolean;
  description?: string;
}
interface AutocompleteSession {
  currentUserInput: string;
  stopped: boolean;
  items: AutocompleteItem[]
}

interface Autocomplete {
  sessions: {
    [key: string]: AutocompleteSession | undefined;
  };
}

interface AutocompleteState {
  autocomplete?: Autocomplete;
}
