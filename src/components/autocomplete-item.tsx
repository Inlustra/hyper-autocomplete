import React from 'react';

interface AutocompleteItemProps {
  suggestion: Suggestion;
}

export class AutocompleteItemComponent extends React.PureComponent<
  AutocompleteItemProps
> {
  public static ITEM_HEIGHT_PX = 30;

  render() {
    return (
      <div
        style={{
          lineHeight: AutocompleteItemComponent.ITEM_HEIGHT_PX + 'px',
          height: AutocompleteItemComponent.ITEM_HEIGHT_PX + 'px'
        }}
      >
        {this.props.suggestion.title}
      </div>
    );
  }
}
