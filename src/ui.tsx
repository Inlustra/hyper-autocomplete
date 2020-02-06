import * as React from "react";
import { AutocompleteWindow } from "./components/autocomplete-window";
import { uiChangeAction } from "./store/actions";

interface UIProps {
  uid: string;
  term: any;
  onLastLineChange: (lastLine: string) => void;
  context: AutocompleteContext;
  padding: number;
  backgroundColor: string;
}

interface State {
  scrollPosition: number;
  width: number;
  height: number;
  cursorPosition: CursorPosition;
  registered: boolean;
}

export const decorateTerm = (Term: any, something: any) => {
  const Component = class extends React.Component<UIProps, State> {
    divElement: HTMLDivElement | null = null;

    constructor(props: any) {
      super(props);
    }

    state: State = {
      scrollPosition: 0,
      registered: false,
      width: 0,
      height: 0,
      cursorPosition: {
        col: 0,
        height: 0,
        row: 0,
        width: 0,
        x: 0,
        y: 0
      }
    };

    componentDidUpdate() {
      if (!this.state.registered) {
        // TODO: Move this to the right lifecycle
        const term = this.getTerm();
        if (term) {
          this.getTerm().on("scroll", (scrollPosition: number) => {
            this.setState({ scrollPosition });
            this.handleLineChange();
          });
          this.setState({ registered: true });
        }
      }
    }

    getTerm(): any | undefined {
      return this.props.term?._core ?? this.props.term;
    }

    getRows(): number | null {
      return this.getTerm()?.buffer.lines.length;
    }

    handleLineChange() {
      const { cursorPosition, scrollPosition } = this.state;
      const { uid } = this.props;
      const currentLine = this.getLine(cursorPosition.row + scrollPosition);
      window.store.dispatch(
        uiChangeAction({
          uid,
          cursorPosition,
          scrollPosition,
          currentLine
        })
      );
    }

    getLastLine() {
      const rows = this.getTerm()?.buffer.lines.length;
      if (!rows) return null;
      for (let i = rows; i >= 0; i--) {
        const line = this.getLine(i);
        if (line?.trim()) {
          return line;
        }
      }
      return null;
    }

    getLine(lineNr: number): string | null {
      let line = null;
      const term = this.getTerm();
      const lines = term?.buffer.lines;
      const rows = lines?.length;
      if (lines && lineNr >= 0 && lineNr < rows) {
        line = "";
        const lineBuffer = lines.get(lineNr);
        // hyper < 2.1.0
        if (lineBuffer instanceof Array) {
          line = lineBuffer.reduce((acc, el) => acc + el[1], "");
        } else {
          return lineBuffer.translateToString();
        }
      }
      return line;
    }

    getCursor(): string | null {
      const term = this.getTerm();
      return term?.buffer.cursorX;
    }

    render() {
      return (
        <div
          ref={divElement => (this.divElement = divElement)}
          style={{ height: "100%", width: "100%", position: "relative" }}
        >
          <Term
            {...this.props}
            onCursorMove={(cursorPosition: CursorPosition) => {
              this.setState({ cursorPosition });
              this.handleLineChange();
            }}
            onResize={() => this.resizeAutocompleteWindow()}
          />
          <AutocompleteWindow
            backgroundColor={this.props.backgroundColor}
            padding={this.props.padding}
            suggestions={this.props.context.suggestions}
            terminalWidth={this.state.width}
            terminalHeight={this.state.height}
            position={this.state.cursorPosition}
          />
        </div>
      );
    }

    resizeAutocompleteWindow() {
      if (this.divElement) {
        this.setState({
          width: this.divElement.clientWidth,
          height: this.divElement.clientHeight
        });
      }
    }

    componentDidMount() {
      this.resizeAutocompleteWindow();
    }
  };

  return Component;
};
