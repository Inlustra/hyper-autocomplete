interface Window {
  store: {
    dispatch: (action: any) => void;
  };
  config: {
    getConfig: () => HyperConfig;
  };
}
