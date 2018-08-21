const React = require('react');
const Close = require('./components/close');

const overlayStyles = {
  position: 'absolute',
  bottom: 0,
  right: 0,
  cursor: 'pointer',
  borderRadius: 5,
  borderWidth: 1,
  borderStyle: 'solid',
  transition: 'left 0.75s, bottom 0.75s, top 0.75s, right 0.75s, width 0.75s, height 0.75s'
};

console.log('in here');
module.exports = class extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      expanded: false,
      showClose: false
    };

    this.handleClick = this.handleClick.bind(this);
    this.handleMouseEnter = this.handleMouseEnter.bind(this);
    this.handleMouseLeave = this.handleMouseLeave.bind(this);
  }

  handleClick () {
    this.setState({
      expanded: !this.state.expanded
    });
  }

  handleMouseEnter () {
    this.setState({
      showClose: true
    });
  }

  handleMouseLeave () {
    this.setState({
      showClose: false
    });
  }
  mapChildren () {
    return React.Children.map(this.props.children, (child) => {
      return React.cloneElement(child, {
        expanded: this.state.expanded
      });
    });
  }

  render () {
    let children = this.mapChildren();
    if (this.state.showClose) {
      const close = React.createElement(Close, {key: 'close', onClick: this.props.onClose, color: this.props.foregroundColor});
      children = children.concat(close)
    }
    const inner = React.createElement('div', {style: {position: 'relative'}}, children);
    const dynamicStyles = {
      borderColor: this.props.foregroundColor,
      backgroundColor: this.props.backgroundColor,
      width: this.props.width || 200,
      height: this.props.height || 150
    };

    if (this.state.expanded) {
      dynamicStyles.width = '100%';
      dynamicStyles.height = '100%';
    }
    return React.createElement('div', {style: Object.assign({}, overlayStyles, dynamicStyles), onDoubleClick: this.handleClick, onMouseEnter: this.handleMouseEnter, onMouseLeave: this.handleMouseLeave}, inner);
  }
};
