const HyperWindow = require("hyperterm-window");
const { AutoComplete } = require("./autocomplete");

export const decorateTerm = (Term, { React, notify }) => {
  return class extends React.Component {
    render() {
      const children = [
        React.createElement(
          Term,
          Object.assign({}, this.props, { key: "term" })
        )
      ];
      // Add a custom component to be displayed in the window
      const windowProps = Object.assign({}, this.props, {
        key: "window",
        onClose: this.props.clearChart
      });
      const hyperwindow = React.createElement(
        HyperWindow,
        windowProps,
        AutoComplete
      );
      children.push(hyperwindow);
      return React.createElement(
        "div",
        { style: { width: "100%", height: "100%", position: "relative" } },
        children
      );
    }
  };
};


/**
      const { data } = action;
      let charCode = data.charCodeAt(0);
      console.log(charCode);
      if (charCode === 127) {
        currUserInputData = currUserInputData
          ? currUserInputData.slice(0, -1)
          : "";
        currUserInputData.length === 0 && reset();
      } else {
        currUserInputData += (data ? data : "").toLowerCase();
        currUserInputData.length === 0 && reset();
      }
      break;
 */
