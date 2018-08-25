import React from "react";
import { AutocompleteWindow } from "./components/autocomplete-window";

interface UIProps {
  autocomplete: AutocompleteSession;
  padding: number;
  backgroundColor: string;
}

export const decorateTerm = (Term: any) => {
  return class extends React.Component<UIProps> {
    divElement: any | undefined;
    autoCompleteWindow: AutocompleteWindow | undefined | null;

    constructor(props: any) {
      super(props);
    }

    state = {
      width: 0,
      height: 0
    };

    render() {
      return (
        <div
          ref={divElement => (this.divElement = divElement)}
          style={{ height: "100%", width: "100%", position: "relative" }}
        >
          <AutocompleteWindow
            ref={instance => (this.autoCompleteWindow = instance)}
            backgroundColor={this.props.backgroundColor}
            input={this.props.autocomplete.currentUserInput}
            padding={this.props.padding}
            items={this.props.autocomplete.items}
          />
          <Term
            {...this.props}
            onCursorMove={(cursorPos: CursorPosition) => {
              if (this.autoCompleteWindow)
                this.autoCompleteWindow.setState({ position: cursorPos });
            }}
            onResize={() => this.resizeAutocompleteWindow()}
          />
        </div>
      );
    }

    resizeAutocompleteWindow() {
      if (this.autoCompleteWindow) {
        this.autoCompleteWindow.setState({
          terminalWidth: this.divElement.clientWidth,
          terminalHeight: this.divElement.clientHeight
        });
      }
    }

    componentDidMount() {
      this.resizeAutocompleteWindow();
    }
  };
};
