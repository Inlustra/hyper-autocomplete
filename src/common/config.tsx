export const getConfig = (): HyperAutocompleteConfig =>
  window.config?.getConfig().hyperAutocomplete ?? {};

export const getPrompt = () => getConfig().prompt;
