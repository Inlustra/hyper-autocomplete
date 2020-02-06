import { readdir } from "fs";
import { exec } from "child_process";
import { setCwdAction, setSuggestionsAction } from "./actions";
import { autocomplete } from "../autocompletion";
import { fileAutocompletionProvider } from "../autocompletion/providers/file";
import { gitAutocompletionProvider } from "../autocompletion/providers/git";

export const setCwd = (
  dispatch: Function,
  uid: string,
  pid: string | number
) => {
  exec(
    `lsof -p ${pid} | awk '$4=="cwd"' | tr -s ' ' | cut -d ' ' -f9-`,
    (err, stdout) => {
      console.log(stdout);
      dispatch(setCwdAction(uid, stdout.trim()));
    }
  );
};

let cachedProviders: AutocompleteProvider[] | undefined = undefined;

async function initAutocompleteProviders(): Promise<AutocompleteProvider[]> {
  return [fileAutocompletionProvider, await gitAutocompletionProvider()];
}

export const updateSuggestions = (
  dispatch: Function,
  uid: string,
  context: AutocompleteContext
) => {
  if (!cachedProviders) {
    initAutocompleteProviders().then(providers => {
      cachedProviders = providers;
      updateSuggestions(dispatch, uid, context);
    });
    return;
  }
  console.log(context)
  if (context.currentUserInput.length) {
    autocomplete(context, cachedProviders).then(suggestions =>
      dispatch(setSuggestionsAction(uid, suggestions))
    );
  } else {
    dispatch(setSuggestionsAction(uid, []));
  }
};
