interface Suggestion {
  label: string;
  kind?: "Function" | "File" | "Directory" | "Executable" | "Snippet";
  detail?: string;
  documentation?: string;
  sortText?: string;
  filterText?: string;
  insertText?: string | { value: string };
  highlightLabel?: React.ReactNode;
}

interface AutocompleteContext {
  currentUserInput: string;
  stopped: boolean;
  suggestions: Suggestion[];
  cwd: string;
  command?: string;
  argument?: string;
  argumentList: string[];
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

type AutocompleteProvider = (
  context: AutocompleteContext
) => Promise<Suggestion[]>;

interface SubcommandConfig {
  name: string;
  detail?: string;
  provider?: AutocompleteProvider;
}
