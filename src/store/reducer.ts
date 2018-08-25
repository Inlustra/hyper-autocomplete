import { keys } from '../utils';
import { exec } from 'child_process';

import {
  resetInputAction,
  Actions,
  HyperActionTypes,
  ActionTypes,
  HyperActions,
  stopInputAction,
  removeCharAction,
  addCharAction,
  setCwdAction
} from './actions';

/** INIT STATE */

const initState: Autocomplete = {
  sessions: {}
};

const initSession: AutocompleteSession = {
  currentUserInput: '',
  stopped: false,
  cwd: '',
  items: [
    {
      title: 'string'
    }
  ]
};

/** REDUCERS */

export const reduceAutocompleteSession = (
  globalState: Autocomplete,
  state: AutocompleteSession,
  action: Actions
): AutocompleteSession => {
  switch (action.type) {
    case ActionTypes.SetCwd:
      return state;
    case ActionTypes.ResetInput:
      return { ...state, currentUserInput: '', stopped: false };
    case ActionTypes.StopInput:
      return { ...state, currentUserInput: '', stopped: true };
    case ActionTypes.AddChar:
      return state.stopped
        ? state
        : {
            ...state,
            currentUserInput: state.currentUserInput + action.payload.char
          };
    case ActionTypes.RemoveChar:
      return state.stopped
        ? state
        : {
            ...state,
            currentUserInput: state.currentUserInput.slice(0, -1)
          };
    default:
      return state;
  }
};

export const reduceSessions = (
  state: HyperSessions & AutocompleteState,
  action: Actions
): HyperSessions & AutocompleteState => {
  const autocomplete = state.autocomplete || initState;
  switch (action.type) {
    case HyperActionTypes.Init:
      return state.set('autocomplete', { sessions: autocomplete.sessions });
    default:
      const autocompleteSession =
        autocomplete.sessions[state.activeUid] || initSession;
      if (!state.activeUid) {
        return state;
      }
      return state.set('autocomplete', {
        ...autocomplete,
        sessions: {
          ...autocomplete.sessions,
          [state.activeUid]: reduceAutocompleteSession(
            autocomplete,
            autocompleteSession,
            action
          )
        }
      });
  }
};

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

export const middleware = (store: any) => (
  next: (action: Action<any>) => {}
) => (action: Actions) => {
  const state: HyperState = store.getState();
  const activeUid = state.sessions.activeUid;
  switch (action.type) {
    /**
     * Cwd Actions
     */
    case HyperActionTypes.SetXTermTitle:
    case HyperActionTypes.SessionSetActive:
      const pid = state.sessions.sessions[action.uid].pid;
      setCwd(store.dispatch, action.uid, pid);
      break;
    case HyperActionTypes.SessionAdd:
      setCwd(store.dispatch, activeUid, action.pid);
      break;
    case HyperActionTypes.SessionAddData:
      const event = window.event as KeyboardEvent | undefined;
      if (event && event.keyCode === keys.enter) {
        const sessions = store.getState().sessions;
        const pid = sessions.sessions[sessions.activeUid].pid;
        setCwd(store.dispatch, activeUid, pid);
      }
      break;

    /**
     * Key Actions
     */
    case HyperActionTypes.SessionUserData: {
      const event = window.event as KeyboardEvent | undefined;
      if (!event) {
        break;
      }
      const { keyCode, charCode, ctrlKey } = event;
      switch (keyCode) {
        case keys.c:
          if (ctrlKey) {
            next(resetInputAction(activeUid));
          }
          break;
        case keys.enter:
          next(resetInputAction(activeUid));
          break;
        case keys.arrowUp:
        case keys.arrowDown:
          next(stopInputAction(activeUid));
          break;
        case keys.backspace:
          next(removeCharAction(activeUid));
          break;
        default:
          if (keyCode || charCode)
            next(
              addCharAction(
                activeUid,
                event,
                String.fromCharCode(keyCode || charCode)
              )
            );
      }
    }
  }
  next(action);
};
