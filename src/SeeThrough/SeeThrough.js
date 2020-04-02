import React, { Children, Component, cloneElement } from 'react';
import PropTypes from 'prop-types';
import PartialMask from './PartialMask';
import { withResizeDetector } from 'react-resize-detector';

/**
 * getBoundingClientRect returns a rectangle relative to the viewport.
 * This function returns one relative to the top left of the document.
 *
 * Modified from https://stackoverflow.com/a/1480137
 */
function getAbsoluteBoundingRect(element) {
  // Width and height should not change based on bounds relativity
  // so it's fine to use getBoundingClientRect for this
  const relativeRect = element.getBoundingClientRect();
  const width = relativeRect.right - relativeRect.left;
  const height = relativeRect.bottom - relativeRect.top;

  // Traverse up the tree from this element, adding all relative positions together
  let x = 0, y = 0;
  do {
    x += element.offsetLeft || 0;
    y += element.offsetTop || 0;
    element = element.offsetParent;
  } while(element);

  return { x, y, width, height };
}

/**
 * areSetsEqual returns whether or not the Sets "a" and "b" are equal
 */
function areSetsEqual(a, b) {
  if(a.size !== b.size) {
    return false;
  }

  return [...a].every(el => b.has(el));
}

class SeeThrough extends Component {
  state = {
    childrenRefs: new Set(),
    windowResizeCount: 0, // Tracking this lets us recompute bounding boxes on window resize
  }

  componentDidMount() {
    // Children refs become available on mount
    this.updateChildrenRefs();

    // Handle window resizes
    window.addEventListener('resize', this.onWindowResize);
  }

  componentDidUpdate() {
    this.updateChildrenRefs();
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.onWindowResize);
  }

  updateChildrenRefs = () => {
    const childrenRefs = new Set(Object.values(this.refs));
    if(!areSetsEqual(childrenRefs, this.state.childrenRefs)) {
      this.setState({ childrenRefs });
    }
  }

  onWindowResize = () => {
    this.setState(prevState => {
      prevState.windowResizeCount++;
      return prevState;
    });
  }

  render() {
    const { children, active, onClick, maskColor } = this.props;

    const childrenWithRefs = Children.map(children, (child, idx) =>
      cloneElement(child, { ref: 'child' + idx })
    );

    const bounds = [...this.state.childrenRefs.values()].map(getAbsoluteBoundingRect);

    return (
      <>
        { childrenWithRefs }
        { active && <PartialMask exclude={ bounds } onClick={ onClick } maskColor={ maskColor } /> }
      </>
    );
  }
}

SeeThrough.propTypes = {
  /**
   * The element(s) that that you want to be see-through.
   * **DIRECT STRINGS ARE NOT ALLOWED.** That is, you cannot do something like:
   *
   *    `<SeeThrough>Some text on your page</SeeThrough>`
   *
   * Instead, you must have something like
   *
   *    `<SeeThrough><div>Some text on your page</div></SeeThrough>`
   *
   */
  children: PropTypes.oneOfType([
    PropTypes.element,
    PropTypes.arrayOf(PropTypes.element),
  ]),

  /**
   * Whether or not this <SeeThrough> is active.
   * Currently, only one active SeeThrough at a time is supported, but it can have multiple children.
   */
  active: PropTypes.bool,

  /**
   * A function to call when the see-through component is clicked. This only works when the component is "active".
   * The function is passed the following arguments:
   *
   *    masked - a boolean indicating whether the click was on the masked (black) or unmasked (non-block) area
   */
  onClick: PropTypes.func,

  /**
   * The color of the mask.
   * Supports all canvas fillStyle formats, e.g. "#AAA333", "red", "rgba(10, 12, 8, 0.2)", ...
   */
  maskColor: PropTypes.string,
};

SeeThrough.defaultProps = {
  active: false,
  onClick: () => {}, // Do nothing
  maskColor: 'rgba(0, 0, 0, 0.4)',
};

// withResizeDetector re-renders the component when its width/height change
// and it injects "width" and "height" props, but we don't use those
export default withResizeDetector(SeeThrough);
