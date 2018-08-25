import { readdir } from 'fs';
import { exec } from 'child_process';
import { setCwdAction, setSuggestionsAction } from './actions';

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

export const updateSuggestions = (
  dispatch: Function,
  uid: string,
  context: AutocompleteContext
) => {
  if (context.currentUserInput.length) {
    readdir(context.cwd, (err, files) => {
      dispatch(
        setSuggestionsAction(
          uid,
          files.map(file => ({
            title: file
          }))
        )
      );
    });
  } else {
    dispatch(setSuggestionsAction(uid, []));
  }
  console.log(context);
};
