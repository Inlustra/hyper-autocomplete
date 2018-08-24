import React from "react";

interface AutocompleteItemProps {
  title: string;
  description?: string;
}

export class AutocompleteItemComponent extends React.PureComponent<
  AutocompleteItemProps
> {
  public static ITEM_HEIGHT_PX = 30;

  render() {
    return (
      <div
        style={{
          height: AutocompleteItemComponent.ITEM_HEIGHT_PX + "px"
        }}
      >
        {this.props.title}
      </div>
    );
  }
}

interface AutocompleteItem {
  title: string;
  expanded?: boolean;
  description?: string;
}

interface AutocompleteWindowProps {
  padding: number;
}

export class AutocompleteWindow extends React.PureComponent<
  AutocompleteWindowProps
> {
  state: {
    position: CursorPosition;
    items: AutocompleteItem[];
    terminalWidth: number;
    terminalHeight: number;
  };

  private static MAX_HEIGHT_PX = 150;

  constructor(props: AutocompleteWindowProps) {
    super(props);
    this.state = {
      items: [],
      terminalWidth: 0,
      terminalHeight: 0,
      position: {
        x: 0,
        y: 0,
        width: 8,
        height: 8,
        col: 8,
        row: 8
      }
    };
  }

  render() {
    return this.state.items.length < 1 ? (
      <div />
    ) : (
      <div
        style={{
          position: "absolute",
          padding: this.props.padding,
          zIndex: 1,
          ...this.calcPosition()
        }}
      >
        <div
          style={{
            color: "white",
            width: "300px",
            border: "1px solid white",
            display: "flex",
            flexDirection: this.shouldInvert() ? "column-reverse" : "column"
          }}
        >
          {this.state.items.map(item => (
            <AutocompleteItemComponent
              title={item.title}
              description={item.description}
            />
          ))}
        </div>
      </div>
    );
  }

  getItemsHeight() {
    return Math.min(
      AutocompleteWindow.MAX_HEIGHT_PX,
      this.state.items.length * AutocompleteItemComponent.ITEM_HEIGHT_PX
    );
  }

  getTerminalPositionTop() {
    return this.state.position.y + this.state.position.height;
  }

  shouldInvert() {
    return (
      this.state.terminalHeight <
      this.getTerminalPositionTop() + this.getItemsHeight()
    );
  }

  calcPosition() {
    const totalHeight = this.getItemsHeight();
    return {
      top: this.shouldInvert()
        ? this.state.position.y - totalHeight
        : this.state.position.y + this.state.position.height,
      left: this.state.position.x + this.state.position.width
    };
  }
}
