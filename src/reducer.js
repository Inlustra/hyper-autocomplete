import { keys } from "./utils";

const ADD_CHAR = "ADD_CHAR";
const REMOVE_CHAR = "REMOVE_CHAR";
const RESET_INPUT = "RESET_INPUT";
const STOP_INPUT = "STOP_INPUT";

/** ACTION CREATORS */

const addCharAction = (event, char) => ({
  type: ADD_CHAR,
  payload: { event, char }
});
const removeCharAction = (event, char) => ({
  type: REMOVE_CHAR,
  payload: { event, char }
});
const resetInputAction = () => ({
  type: RESET_INPUT
});
const stopInputAction = () => ({ type: STOP_INPUT });

/** INIT STATE */

const initState = {
  currentUserInput: "",
  stopped: false
};

/** REDUCERS */

export const reduceAutocomplete = (state, action) => {
  switch (action.type) {
    case RESET_INPUT:
      return { ...state, currentUserInput: "", stopped: false };
    case STOP_INPUT:
      return { ...state, currentUserInput: "", stopped: true };
    case ADD_CHAR:
      return state.stopped
        ? state
        : {
            ...state,
            currentUserInput: state.currentUserInput + action.payload.char
          };
    case REMOVE_CHAR:
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

export const reduceSessions = (state, action) => {
  return state.set(
    "autoComplete",
    reduceAutocomplete(state.autoComplete || initState, action)
  );
};

function getKeyAction() {
  const event = window.event || {};
  const { keyCode, charCode, ctrlKey } = event;
  switch (keyCode) {
    case keys.controlC:
      if (ctrlKey) {
        return resetInputAction();
      }
    case keys.enter:
      return resetInputAction();
    case keys.arrowUp:
    case keys.arrowDown:
      return stopInputAction();
    case keys.backspace:
      return removeCharAction();
    default:
      if (keyCode || charCode)
        return addCharAction(event, String.fromCharCode(keyCode || charCode));
  }
}

export const middleware = store => next => action => {
  switch (action.type) {
    case "SESSION_USER_DATA":
      const action = getKeyAction();
      if (action) {
        next(action);
      }
      console.log(store.getState().sessions.autoComplete);
      break;
  }
  next(action);
};
