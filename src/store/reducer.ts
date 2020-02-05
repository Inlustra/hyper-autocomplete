import { keys } from "../utils";

import {
  resetInputAction,
  Actions,
  HyperActionTypes,
  ActionTypes,
  stopInputAction,
  removeCharAction,
  addCharAction,
  setCurrentInput
} from "./actions";
import { setCwd, updateSuggestions } from "./effects";
import { isUsingNewPromptFormat, getPrompt } from "../common/config";
/** INIT STATE */

const initState: Autocomplete = {
  sessions: {}
};

const initSession: AutocompleteContext = {
  currentUserInput: "",
  stopped: false,
  cwd: "",
  argumentList: [],
  suggestions: []
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
      return state.setIn(["autocomplete", "sessions", action.payload.uid], {
        ...getSessionByUid(state, action.payload.uid),
        cwd: action.payload.cwd
      });
    case ActionTypes.ResetInput:
      return state.setIn(["autocomplete", "sessions", action.payload.uid], {
        ...getSessionByUid(state, action.payload.uid),
        currentUserInput: "",
        arguments: [],
        command: undefined,
        stopped: false
      });
    case ActionTypes.StopInput:
      return state.setIn(["autocomplete", "sessions", action.payload.uid], {
        ...getSessionByUid(state, action.payload.uid),
        currentUserInput: "",
        arguments: [],
        command: undefined,
        stopped: true
      });

    case ActionTypes.SetSuggestions:
      return state.setIn(["autocomplete", "sessions", action.payload.uid], {
        ...getSessionByUid(state, action.payload.uid),
        suggestions: action.payload.suggestions
      });
    case ActionTypes.SetCurrentInput:
      const session = getSessionByUid(state, action.payload.uid);
      const currentUserInput = action.payload.input;
      const fullCommand = currentUserInput.split(" ");
      const command = fullCommand[0];
      const argumentList = fullCommand.splice(1);
      const argument =
        argumentList.length > 0
          ? argumentList[argumentList.length - 1] || undefined
          : undefined;
      return state.setIn(["autocomplete", "sessions", action.payload.uid], {
        ...session,
        currentUserInput,
        argumentList,
        argument,
        command
      });
    case ActionTypes.AddChar: {
      const session = getSessionByUid(state, action.payload.uid);
      const currentUserInput =
        session.currentUserInput + action.payload.event.key;
      const fullCommand = currentUserInput.split(" ");
      const command = fullCommand[0];
      const argumentList = fullCommand.splice(1);
      const argument =
        argumentList.length > 0
          ? argumentList[argumentList.length - 1] || undefined
          : undefined;
      return session.stopped
        ? state
        : state.setIn(["autocomplete", "sessions", action.payload.uid], {
            ...session,
            currentUserInput,
            argumentList,
            argument,
            command
          });
    }
    case ActionTypes.RemoveChar: {
      const session = getSessionByUid(state, action.payload.uid);
      const currentUserInput = session.currentUserInput.slice(0, -1);
      const fullCommand = currentUserInput.split(" ");
      const command = fullCommand[0];
      const argumentList = fullCommand.splice(1);
      const argument =
        argumentList.length > 0
          ? argumentList[argumentList.length - 1] || undefined
          : undefined;
      return session.stopped
        ? state
        : state.setIn(["autocomplete", "sessions", action.payload.uid], {
            ...session,
            currentUserInput,
            argument,
            argumentList,
            command
          });
    }
    case HyperActionTypes.Init:
      return state.set("autocomplete", initState);
    default:
      return state;
  }
};

export const middleware = (store: any) => (
  next: (action: Action<any>) => {}
) => (action: Actions) => {
  next(action);
  const state: HyperState & AutocompleteState = store.getState();
  const activeUid = state.sessions.activeUid;

  if (!isUsingNewPromptFormat()) {
    // old input management.
    switch (action.type) {
      case HyperActionTypes.SessionUserData: {
        const event = window.event as KeyboardEvent | undefined;
        if (!event) {
          break;
        }
        const { keyCode, charCode, ctrlKey } = event;
        switch (keyCode) {
          case keys.c:
            if (ctrlKey) {
              store.dispatch(resetInputAction(activeUid));
            }
            break;
          case keys.enter:
            store.dispatch(resetInputAction(activeUid));
            break;
          case keys.arrowUp:
          case keys.arrowDown:
            store.dispatch(stopInputAction(activeUid));
            break;
          case keys.backspace:
            store.dispatch(removeCharAction(activeUid));
            break;
          default:
            if (keyCode || charCode)
              store.dispatch(
                addCharAction(
                  activeUid,
                  event,
                  String.fromCharCode(keyCode || charCode)
                )
              );
        }
        break;
      }
    }
  } else {
    // New input management.
    switch (action.type) {
      case ActionTypes.LastLineChange:
        const {
          payload: { uid, line }
        } = action;
        const prompt = getPrompt();
        if (!prompt) break;
        if (!line) store.dispatch(setCurrentInput(uid, ""));
        if (line?.startsWith(prompt)) {
          const input = line?.replace(prompt, "");
          if (input) {
            store.dispatch(setCurrentInput(uid, input));
          }
        }
        break;
    }
  }
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
     * Update Autocomplete Suggestions
     */
    case ActionTypes.AddChar:
    case ActionTypes.RemoveChar:
    case ActionTypes.ResetInput:
    case ActionTypes.StopInput:
    case ActionTypes.SetCwd:
    case ActionTypes.SetCurrentInput:
      updateSuggestions(
        store.dispatch,
        action.payload.uid,
        getSessionByUid(store.getState().sessions, action.payload.uid)
      );
      break;
  }
};
