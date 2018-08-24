import { keys } from "./utils";

enum ActionTypes {
  AddChar = "ADD_CHAR",
  RemoveChar = "REMOVE_CHAR",
  ResetInput = "RESET_INPUT",
  StopInput = "STOP_INPUT"
}

/** ACTION TYPES */

interface AddCharAction {
  type: ActionTypes.AddChar;
  payload: {
    session: string;
    event: KeyboardEvent;
    char: string;
  };
}

interface RemoveCharAction {
  type: ActionTypes.RemoveChar;
  payload: {
    session: string;
  };
}

interface ResetInputAction {
  type: ActionTypes.ResetInput;
  payload: {
    session: string;
  };
}

interface StopInputAction {
  type: ActionTypes.StopInput;
  payload: {
    session: string;
  };
}

type Actions =
  | AddCharAction
  | RemoveCharAction
  | ResetInputAction
  | StopInputAction;

/** ACTION CREATORS */

const addCharAction = (
  session: string,
  event: KeyboardEvent,
  char: string
): AddCharAction => ({
  type: ActionTypes.AddChar,
  payload: { session, event, char }
});
const removeCharAction = (session: string): RemoveCharAction => ({
  type: ActionTypes.RemoveChar,
  payload: { session }
});
const resetInputAction = (session: string): ResetInputAction => ({
  type: ActionTypes.ResetInput,
  payload: { session }
});
const stopInputAction = (session: string): StopInputAction => ({
  type: ActionTypes.StopInput,
  payload: { session }
});

/** INIT STATE */

const initState: Autocomplete = {
  sessions: {}
};

const initSession: AutocompleteSession = {
  currentUserInput: "",
  stopped: false
};

/** REDUCERS */

export const reduceAutocompleteSession = (
  state: AutocompleteSession,
  action: Actions
): AutocompleteSession => {
  switch (action.type) {
    case ActionTypes.ResetInput:
      return { ...state, currentUserInput: "", stopped: false };
    case ActionTypes.StopInput:
      return { ...state, currentUserInput: "", stopped: true };
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
  const autocompleteSession =
    autocomplete.sessions[state.activeUid] || initSession;
  return state.set("autocomplete", {
    ...autocomplete,
    sessions: {
      ...autocomplete.sessions,
      [state.activeUid]: reduceAutocompleteSession(autocompleteSession, action)
    }
  });
};

function getKeyAction(session: string): Actions | undefined {
  const event = window.event as KeyboardEvent | undefined;
  if (!event) {
    return;
  }
  const { keyCode, charCode, ctrlKey } = event;
  switch (keyCode) {
    case keys.c:
      if (ctrlKey) {
        return resetInputAction(session);
      }
      break;
    case keys.enter:
      return resetInputAction(session);
    case keys.arrowUp:
    case keys.arrowDown:
      return stopInputAction(session);
    case keys.backspace:
      return removeCharAction(session);
    default:
      if (keyCode || charCode)
        return addCharAction(
          session,
          event,
          String.fromCharCode(keyCode || charCode)
        );
  }
}

export const middleware = (store: any) => (
  next: (action: Action<any>) => {}
) => (action: Action<any>) => {
  switch (action.type) {
    case "SESSION_USER_DATA":
      {
        const action = getKeyAction(store.getState());
        if (action) {
          next(action);
        }
      }
      console.log(store.getState().sessions);
      break;
  }
  next(action);
};
