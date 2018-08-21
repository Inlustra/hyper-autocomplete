const HyperWindow = require("hyperterm-window");
const { AutoComplete } = require("./autocomplete");

exports.reduceUI = (state, action) => {
  switch (action.type) {
    case "TOGGLE_WINDOW":
      return state.set("showWindow", !state.showWindow);
  }
  return state;
};

exports.mapTermsState = (state, map) => {
  return Object.assign(map, {
    showWindow: state.ui.showWindow
  });
};

exports.getTermProps = (uid, parentProps, props) => {
  return Object.assign(props, {
    showWindow: parentProps.showWindow
  });
};

exports.decorateTerm = (Term, { React, notify }) => {
  return class extends React.Component {
    render() {
        console.log(Term)
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

const CHAR_CODE_1 = 161;
const CHAR_CODE_2 = 8482;
const CHAR_CODE_3 = 163;

const QUICK_SELECT_CHAR_CODE = [161, 8482, 163];
const keys = {
  controlC: 3,
  enter: 13
};
const RESET_CHAR_CODE = [...Object.values(keys), ...QUICK_SELECT_CHAR_CODE];

let currUserInputData = "";
let isStopped = false;

function reset(stopped = false) {
  currUserInputData = "";
  isStopped = stopped;
}

exports.middleware = store => next => action => {
  if (isStopped) {
    return next(action);
  }
  console.log(window.event)
  switch (action.type) {
    case "SESSION_USER_DATA":
      const { data } = action;
      let charCode = data.charCodeAt(0);
      console.log(charCode);
      if (QUICK_SELECT_CHAR_CODE.includes(charCode)) {
        reset(true); // Reset until we get a control-c!
        console.log("stopped");
      } else if (RESET_CHAR_CODE.includes(charCode)) {
        reset();
      } else if (charCode === 127) {
        currUserInputData = currUserInputData
          ? currUserInputData.slice(0, -1)
          : "";
        currUserInputData.length === 0 && reset();
      } else {
        currUserInputData += (data ? data : "").toLowerCase();
        currUserInputData.length === 0 && reset();
      }
      break;
  }
  next(action);
  console.log(currUserInputData);
};

// Current shell cwd
function setCwd(pid) {
  exec(
    `lsof -p ${pid} | grep cwd | tr -s ' ' | cut -d ' ' -f9-`,
    (err, cwd) => {
      currCwd = cwd.trim();
    }
  );
}
