export enum HyperActionTypes {
  Init = "INIT",
  SetXTermTitle = "SESSION_SET_XTERM_TITLE",
  SessionUserData = "SESSION_USER_DATA",
  SessionAdd = "SESSION_ADD",
  SessionSetActive = "SESSION_SET_ACTIVE",
  SessionAddData = "SESSION_ADD_DATA",
  SessionPtyData = "SESSION_PTY_DATA",
  UiCommandExec = "UI_COMMAND_EXEC"
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
  UiChange = "UI_CHANGE",
  CommandSplit = "COMMAND_SPLIT",
  UpdateCommand = "UPDATE_COMMAND"
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

export interface CommandSplitAction {
  type: ActionTypes.CommandSplit;
  payload: { uid: string };
}

export interface UiChangeAction {
  type: ActionTypes.UiChange;
  payload: {
    uid: string;
    inputLine?: number;
    currentLine?: string | null;
    scrollPosition?: number;
    cursorPosition?: CursorPosition;
  };
}

export interface UpdateCommandAction {
  type: ActionTypes.UpdateCommand;
  payload: {
    uid: string;
  };
}

export type HyperActions =
  | { type: HyperActionTypes.SetXTermTitle; uid: string }
  | { type: HyperActionTypes.Init }
  | { type: HyperActionTypes.SessionUserData }
  | { type: HyperActionTypes.SessionAdd; pid: string }
  | { type: HyperActionTypes.SessionAddData; pid: string; data: string }
  | { type: HyperActionTypes.SessionPtyData; pid: string; data: string }
  | { type: HyperActionTypes.SessionSetActive; uid: string }
  | {
      type: HyperActionTypes.UiCommandExec;
      command: "editor:deletePreviousWord" | "editor:deleteBeginningLine";
    };

export type Actions =
  | HyperActions
  | AddCharAction
  | RemoveCharAction
  | ResetInputAction
  | StopInputAction
  | SetCwdAction
  | SetSuggestionsAction
  | UiChangeAction
  | CommandSplitAction
  | UpdateCommandAction;

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

export const uiChangeAction = (
  payload: UiChangeAction["payload"]
): UiChangeAction => ({
  type: ActionTypes.UiChange,
  payload
});

export const commandSplitAction = (uid: string): CommandSplitAction => ({
  type: ActionTypes.CommandSplit,
  payload: { uid }
});

export const updateCommandAction = (uid: string): UpdateCommandAction => ({
  type: ActionTypes.UpdateCommand,
  payload: { uid }
});
