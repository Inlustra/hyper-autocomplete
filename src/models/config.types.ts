interface HyperBaseConfig {
  foregroundColor: string;
  borderColor: string;
  backgroundColor: string;
  cursorColor: string;
  colors: {
    // TODO: This can be an array, handle that!
    black: string;
    blue: string;
    brightBlack: string;
    brightWhite: string;
    cyan: string;
    gray: string;
    green: string;
    lightBlack: string;
    lightBlue: string;
    lightCyan: string;
    lightGreen: string;
    lightMagenta: string;
    lightRed: string;
    lightWhite: string;
    lightYellow: string;
    magenta: string;
    red: string;
    white: string;
    yellow: string;
  };
}

interface TextConfig {
  fontFamily: string;
  fontSize: number;
  color: string;
}

interface HyperAutocompleteConfig {
  label: TextConfig;
  description: TextConfig & { backgroundColor: string };
  detail: TextConfig;
  backgroundColor: string;
}

type HyperConfig = DeepPartial<
  HyperBaseConfig & { hyperAutocomplete: HyperAutocompleteConfig }
>;
