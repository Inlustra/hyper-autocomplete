export { decorateTerm } from './ui';
export { middleware, reduceSessions } from './store/reducer';

import { getAutocomplete, getSessionByUid } from './store/reducer';

export const mapTermsState = (
  state: HyperState & AutocompleteState,
  map: any
) => {
  return { ...map, autocomplete: getAutocomplete(state.sessions) };
};

export const getTermGroupProps = (
  uid: string,
  parentProps: any,
  props: any
) => {
  return { ...props, autocomplete: parentProps.autocomplete };
};

export const getTermProps = (uid: string, parentProps: any, props: any) => {
  return { ...props, autocomplete: getSessionByUid(parentProps, uid) };
};
