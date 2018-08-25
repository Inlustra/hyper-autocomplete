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

/**
 * SELECTORS
 */

export const getAutocomplete = (state: AutocompleteSessionsState) =>
  state.autocomplete || initState;
export const getSessions = (state: AutocompleteSessionsState) =>
  getAutocomplete(state).sessions;

export const getSessionByUid = (
  state: AutocompleteSessionsState,
  uid: string
) => getSessions(state)[uid] || initSession;

/** REDUCERS */

export const reduceSessions = (
  state: HyperSessions & AutocompleteSessionsState,
  action: Actions
): HyperSessions & AutocompleteSessionsState => {
  switch (action.type) {
    case ActionTypes.SetCwd:
      return state.setIn(['autocomplete', 'sessions', action.payload.uid], {
        ...getSessionByUid(state, action.payload.uid),
        cwd: action.payload.cwd
      });
    case ActionTypes.ResetInput:
      return state.setIn(['autocomplete', 'sessions', action.payload.uid], {
        ...getSessionByUid(state, action.payload.uid),
        currentUserInput: '',
        stopped: false
      });
    case ActionTypes.StopInput:
      return state.setIn(['autocomplete', 'sessions', action.payload.uid], {
        ...getSessionByUid(state, action.payload.uid),
        currentUserInput: '',
        stopped: true
      });
    case ActionTypes.AddChar: {
      const session = getSessionByUid(state, action.payload.uid);
      return session.stopped
        ? state
        : state.setIn(['autocomplete', 'sessions', action.payload.uid], {
            ...getSessionByUid(state, action.payload.uid),
            currentUserInput: session.currentUserInput + action.payload.char
          });
    }
    case ActionTypes.RemoveChar: {
      const session = getSessionByUid(state, action.payload.uid);
      return session.stopped
        ? state
        : state.setIn(['autocomplete', 'sessions', action.payload.uid], {
            ...getSessionByUid(state, action.payload.uid),
            currentUserInput: session.currentUserInput.slice(0, -1)
          });
    }
    case HyperActionTypes.Init:
      return state.set('autocomplete', initState);
    default:
      console.log(action.type);

      return state;
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
  const state: HyperState & AutocompleteSessionsState = store.getState();
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
