import React from "react";
import { ui } from "../common/ui";

interface AutocompleteItemProps {
  onClick?: () => void;
  config: HyperAutocompleteConfig;
  suggestion: Suggestion;
}

interface AutocompleteItemState {
  icon?: IconComponent | undefined;
}

export class AutocompleteItemComponent extends React.PureComponent<
  AutocompleteItemProps,
  AutocompleteItemState
> {
  state: AutocompleteItemState = {};
  public static ITEM_HEIGHT_PX = 30;

  constructor(props: AutocompleteItemProps) {
    super(props);
    this.state = {
      icon: undefined
    };

    this.updateIcon = this.updateIcon.bind(this);
    this.getIcon = this.getIcon.bind(this);
    this.updateIcon(props.suggestion);
  }

  componentDidUpdate(prevSugg: AutocompleteItemProps) {
    const { label } = this.props.suggestion;
    if (prevSugg.suggestion.label !== label) {
      this.updateIcon(this.props.suggestion);
    }
  }

  updateIcon = (suggestion: Suggestion) => {
    this.getIcon(suggestion).then(icon => {
      this.setState({ icon });
    });
  };

  async getIcon({ label, kind }: Suggestion) {
    return await ((kind === "Directory" &&
      ui.getIconForFolder(label, "dark")) ||
      (kind === "File" && ui.getIconForFile(label, "dark")) ||
      undefined);
  }

  render() {
    const Icon = this.state.icon;
    return (
      <div
        onClick={this.props.onClick}
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "5px",
          lineHeight: AutocompleteItemComponent.ITEM_HEIGHT_PX + "px",
          minHeight: AutocompleteItemComponent.ITEM_HEIGHT_PX + "px",
          whiteSpace: "nowrap",
          textOverflow: "hidden"
        }}
      >
        <div style={{ display: "flex", alignItems: "center" }}>
          {Icon && <Icon style={{ marginRight: 10, width: 15, height: 15 }} />}
          <span style={{ ...this.props.config.label, marginRight: 10 }}>
            {this.props.suggestion.highlightLabel ||
              this.props.suggestion.label}
          </span>
        </div>
        {this.props.suggestion.detail && (
          <span
            style={{
              ...this.props.config.detail
            }}
          >
            {this.props.suggestion.detail}
          </span>
        )}
      </div>
    );
  }
}
