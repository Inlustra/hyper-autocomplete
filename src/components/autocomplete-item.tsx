import React from "react";

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
          padding: "5px",
          lineHeight: AutocompleteItemComponent.ITEM_HEIGHT_PX + "px",
          height: AutocompleteItemComponent.ITEM_HEIGHT_PX + "px",
          whiteSpace: "nowrap",
          textOverflow: "hidden"
        }}
      >
        {this.props.suggestion.highlightLabel || this.props.suggestion.label}
        {this.props.suggestion.detail && (
          <span
            style={{
              fontWeight: "lighter"
            }}
          >
            - {this.props.suggestion.detail}
          </span>
        )}
      </div>
    );
  }
}
