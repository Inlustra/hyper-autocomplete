import { keys } from "./utils";

const HANDLE_KEY = "HANDLE_KEY";
const RESET_AUTOCOMPLETE = "RESET_AUTOCOMPLETE";
const STOP_AUTOCOMPLETE = "STOP_AUTOCOMPLET";

/** ACTION CREATORS */

const handleKeyAction = (event, data) => ({
  type: HANDLE_KEY,
  payload: { event, data }
});
const resetAutoCompleteAction = () => ({
  type: RESET_AUTOCOMPLETE
});
const stopAutoCompleteAction = () => ({ type: STOP_AUTOCOMPLETE });

/** INIT STATE */

const initState = {
  currentUserInput: "",
  stopped: false
};

/** REDUCERS */

function handleKey(state = initState, { event = {}, data = "" }) {
  const { keyCode, charCode, ctrlKey, shiftKey, altKey } = event;
  switch (keyCode) {
    case keys.controlC:
      if (ctrlKey) {
        return { ...state, currentUserInput: "" };
      }
      return state;
    case keys.enter:
      return { ...state, currentUserInput: "" };
    case keys.arrowDown:
    case keys.arrowUp:
      return { ...state, currentUserInput: "", stopped: true };
    case keys.backspace:
      return {
        ...state,
        currentUserInput: state.currentUserInput.slice(0, -1)
      };
    default:
      if (keyCode || charCode) {
        return {
          ...state,
          currentUserInput:
            state.currentUserInput + String.fromCharCode(keyCode || charCode)
        };
      }
      return state;
  }
}

export const reduceAutocomplete = (state, action) => {
  switch (action.type) {
    case HANDLE_KEY:
      return handleKey(state, action.payload);
    default:
      return state;
  }
};

export const reduceUI = (state, action) => {
  return state.set(
    "autoComplete",
    reduceAutocomplete(state.autoComplete || initState, action)
  );
};

export const middleware = store => next => action => {
  switch (action.type) {
    case "SESSION_USER_DATA":
      next(handleKeyAction(window.event, action.data));
      break;
    case HANDLE_KEY:
      console.log(store.getState());
      console.log(action);
      break;
  }
  next(action);
};
