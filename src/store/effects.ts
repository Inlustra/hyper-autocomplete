import { exec } from 'child_process';
import { setCwdAction } from './actions';

export const setCwd = (
  dispatch: Function,
  uid: string,
  pid: string | number
) => {
  exec(
    `lsof -p ${pid} | awk '$4=="cwd"' | tr -s ' ' | cut -d ' ' -f9-`,
    (err: any, stdout: string) => {
      console.log(stdout);
      dispatch(setCwdAction(uid, stdout.trim()));
    }
  );
};

export const updateSuggestions = (
  dispatch: Function,
  uid: string,
  session: AutocompleteSession
) => {
  console.log(session);
};
