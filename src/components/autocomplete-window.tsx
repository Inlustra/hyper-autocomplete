import React from 'react';
import { AutocompleteItemComponent } from './autocomplete-item';

interface AutocompleteWindowProps {
  padding: number;
  suggestions: Suggestion[];
  backgroundColor: string;
  terminalHeight: number;
  terminalWidth: number;
  position: CursorPosition;
}

export class AutocompleteWindow extends React.PureComponent<
  AutocompleteWindowProps
> {

  private static MAX_HEIGHT_PX = 150;

  constructor(props: AutocompleteWindowProps) {
    super(props);
  }

  render() {
    return this.props.suggestions.length < 1 ? (
      <div />
    ) : (
      <div
        style={{
          position: 'absolute',
          padding: this.props.padding,
          zIndex: 4,
          ...this.calcPosition()
        }}
      >
        <div
          style={{
            maxHeight: AutocompleteWindow.MAX_HEIGHT_PX + 'px',
            color: 'white',
            width: '400px',
            border: '1px solid white',
            display: 'flex',
            overflowX: 'hidden',
            overflowY: 'scroll',
            backgroundColor: this.props.backgroundColor,
            boxShadow:
              '0 4px 8px 0 rgba(0,0,0,0.12), 0 2px 4px 0 rgba(0,0,0,0.08)',
            flexDirection: this.shouldInvert() ? 'column-reverse' : 'column'
          }}
        >
          {this.props.suggestions.map(item => (
            <AutocompleteItemComponent suggestion={item} />
          ))}
        </div>
      </div>
    );
  }

  getItemsHeight() {
    return Math.min(
      AutocompleteWindow.MAX_HEIGHT_PX,
      this.props.suggestions.length * AutocompleteItemComponent.ITEM_HEIGHT_PX
    );
  }

  getTerminalPositionTop() {
    return this.props.position.y + this.props.position.height;
  }

  shouldInvert() {
    return (
      this.props.terminalHeight <
      this.getTerminalPositionTop() + this.getItemsHeight() + 15
    );
  }

  calcPosition() {
    const totalHeight = this.getItemsHeight();
    return {
      top: this.shouldInvert()
        ? this.props.position.y - totalHeight
        : this.props.position.y + this.props.position.height,
      left: this.props.position.x + this.props.position.width
    };
  }
}
