export enum HyperActionTypes {
  Init = "INIT",
  SetXTermTitle = "SESSION_SET_XTERM_TITLE",
  SessionUserData = "SESSION_USER_DATA",
  SessionAdd = "SESSION_ADD",
  SessionSetActive = "SESSION_SET_ACTIVE",
  SessionAddData = "SESSION_ADD_DATA",
  SessionPtyData = "SESSION_PTY_DATA"
}

export enum ActionTypes {
  SetCwd = "SET_CWD",

  // Legacy Prompt
  AddChar = "ADD_CHAR",
  RemoveChar = "REMOVE_CHAR",
  ResetInput = "RESET_INPUT",
  StopInput = "STOP_INPUT",
  SetSuggestions = "SET_SUGGESTIONS",

  // New Prompt
  LastLineChange = "LAST_LINE_CHANGE",
  SetCurrentInput = "SET_CURRENT_INPUT"
}

/** ACTION TYPES */

export interface SetCwdAction {
  type: ActionTypes.SetCwd;
  payload: { uid: string; cwd: string };
}

export interface AddCharAction {
  type: ActionTypes.AddChar;
  payload: {
    uid: string;
    event: KeyboardEvent;
    char: string;
  };
}

export interface RemoveCharAction {
  type: ActionTypes.RemoveChar;
  payload: { uid: string };
}

export interface ResetInputAction {
  type: ActionTypes.ResetInput;
  payload: { uid: string };
}

export interface StopInputAction {
  type: ActionTypes.StopInput;
  payload: { uid: string };
}

export interface SetSuggestionsAction {
  type: ActionTypes.SetSuggestions;
  payload: { uid: string; suggestions: Suggestion[] };
}

export interface LastLineChangeAction {
  type: ActionTypes.LastLineChange;
  payload: { uid: string; line: string | null };
}

export interface SetCurrentInputAction {
  type: ActionTypes.SetCurrentInput;
  payload: { uid: string; input: string };
}

export type HyperActions =
  | { type: HyperActionTypes.SetXTermTitle; uid: string }
  | { type: HyperActionTypes.Init }
  | { type: HyperActionTypes.SessionUserData }
  | { type: HyperActionTypes.SessionAdd; pid: string }
  | { type: HyperActionTypes.SessionAddData; pid: string; data: string }
  | { type: HyperActionTypes.SessionPtyData; pid: string; data: string }
  | { type: HyperActionTypes.SessionSetActive; uid: string };

export type Actions =
  | HyperActions
  | AddCharAction
  | RemoveCharAction
  | ResetInputAction
  | StopInputAction
  | SetCwdAction
  | SetSuggestionsAction
  | LastLineChangeAction
  | SetCurrentInputAction;

/** ACTION CREATORS */

export const setSuggestionsAction = (
  uid: string,
  suggestions: Suggestion[]
): SetSuggestionsAction => ({
  type: ActionTypes.SetSuggestions,
  payload: { uid, suggestions }
});

export const setCwdAction = (uid: string, cwd: string): SetCwdAction => ({
  type: ActionTypes.SetCwd,
  payload: { uid, cwd }
});

export const addCharAction = (
  uid: string,
  event: KeyboardEvent,
  char: string
): AddCharAction => ({
  type: ActionTypes.AddChar,
  payload: { uid, event, char }
});

export const removeCharAction = (uid: string): RemoveCharAction => ({
  type: ActionTypes.RemoveChar,
  payload: { uid }
});

export const resetInputAction = (uid: string): ResetInputAction => ({
  type: ActionTypes.ResetInput,
  payload: { uid }
});

export const stopInputAction = (uid: string): StopInputAction => ({
  type: ActionTypes.StopInput,
  payload: { uid }
});

export const lastLineChange = (
  uid: string,
  line: string | null
): LastLineChangeAction => ({
  type: ActionTypes.LastLineChange,
  payload: { uid, line }
});

export const setCurrentInput = (
  uid: string,
  input: string
): SetCurrentInputAction => ({
  type: ActionTypes.SetCurrentInput,
  payload: { uid, input }
});
