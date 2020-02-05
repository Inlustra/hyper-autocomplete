export const staticProvider = (
  suggestions: Suggestion[]
): AutocompleteProvider => async _ => [...suggestions];

export const combineProviders = (
  ...providers: AutocompleteProvider[]
): AutocompleteProvider => async context => {
  const suggestions = await Promise.all(
    providers.reduce<Promise<Suggestion[]>[]>(
      (prev, provider) => [...prev, provider(context)],
      []
    )
  );
  return suggestions.reduce<Suggestion[]>(
    (prev, curr) => [...prev, ...curr],
    []
  );
};

export const shortFlag = (char: string): AutocompleteProvider => async () => [
  { label: `-${char}` }
];
export const longFlag = (name: string): AutocompleteProvider => async () => [
  { label: `--${name}` }
];

export const commandWithSubcommands = (
  command: string,
  subCommands: SubcommandConfig[]
): AutocompleteProvider => {
  return async (context: AutocompleteContext) => {
    if (context.command !== command) return [];
    if (context.argumentList.length === 1) {
      return subCommands.map(({ name, detail, provider }) => ({
        label: name,
        detail,
        space: provider !== undefined
      }));
    } else if (context.argumentList.length === 2) {
      const firstArgument = context.argumentList[0];
      const subCommandConfig = subCommands.find(
        config => config.name === firstArgument
      );
      if (subCommandConfig && subCommandConfig.provider) {
        return await subCommandConfig.provider(context);
      }
    }
    return [];
  };
};
