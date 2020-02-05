export const getConfig = (): HyperAutocompleteConfig =>
  window.config?.getConfig().hyperAutocomplete ?? {};

export const getPrompt = () => getConfig().prompt;

export const isUsingNewPromptFormat = () => {
  return typeof getPrompt() === "string";
};
