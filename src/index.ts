export { decorateTerm } from './ui';
export { middleware, reduceSessions } from './store/reducer';

export const mapTermsState = (
  state: HyperSessions & AutocompleteState,
  map: any
) => {
  return { ...map, autocomplete: state.sessions.autocomplete };
};

export const getTermGroupProps = (
  uid: string,
  parentProps: any,
  props: any
) => {
  return { ...props, autocomplete: parentProps.autocomplete };
};

export const getTermProps = (uid: string, parentProps: any, props: any) => {
  return { ...props, autocomplete: parentProps.autocomplete.sessions[uid] };
};
