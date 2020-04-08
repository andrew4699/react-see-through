import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import PartialMask from './PartialMask';
import { withResizeDetector } from 'react-resize-detector';
import NoopClassWrapper from './NoopClassWrapper';

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
 * Returns whether or not this is being rendered by the server
 *
 * Copied from https://github.com/maslianok/react-resize-detector
 */
function isSSR() {
  return typeof window === 'undefined';
}

/**
 * Manages a count of how many times the window has been resized since this component was mounted.
 *
 * Returns the count of resizes
 */
function useWindowResizeCount() {
  const [windowResizeCount, setWindowResizeCount] = useState(0);

  useEffect(() => {
    if(isSSR()) {
      return;
    }

    const resizeHandler = () => setWindowResizeCount(windowResizeCount + 1);
    window.addEventListener('resize', resizeHandler);
    return () => window.removeEventListener('resize', resizeHandler);
  }, [windowResizeCount]);

  return windowResizeCount;
}

function SeeThrough({ children, active, onClick, maskColor, className, style, childSearchDepth }) {
  // We want to update the bounds when the window is resized
  useWindowResizeCount();

  // Keep track of a ref to the wrapper
  const [wrapper, setWrapper] = useState(null);

  // Figure out which area we want to mask
  let bounds = { x: 0, y: 0, width: 0, height: 0 };
  if(wrapper) {
    bounds = getAbsoluteBoundingRect(wrapper);
  }

  return (
    <>
      <div
        key='wrapper'
        ref={ setWrapper }
        className={ className }
        style={ style }
      >
        { children }
      </div>

      { active && (
        <NoopClassWrapper
          component={ PartialMask }
          key='mask'
          exclude={ [bounds] }
          onClick={ onClick }
          maskColor={ maskColor }
        />
      ) }
    </>
  );
}

SeeThrough.propTypes = {
  /**
   * The element(s) that that you want to be see-through.
   */
  children: PropTypes.node,

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
   * <SeeThrough> creates a <div> wrapper around all the contained elements.
   * This could break layouts that require very particular element hierarchies, like flex containers.
   * "className" allows you to style that <div> in-case adding it breaks your layout.
   *
   * There is currently no way to avoid having the <div> container due to limitations of React refs.
   */
  className: PropTypes.string,

  /**
   * <SeeThrough> creates a <div> wrapper around all the contained elements.
   * This could break layouts that require very particular element hierarchies, like flex containers.
   * "style" allows you to style that <div> in-case adding it breaks your layout.
   *
   * There is currently no way to avoid having the <div> container due to limitations of React refs.
   */
  style: PropTypes.any,

  /**
   * The color of the mask.
   * Supports all canvas fillStyle formats, e.g. "#AAA333", "red", "rgba(10, 12, 8, 0.2)", ...
   */
  maskColor: PropTypes.string,

  /**
   * SeeThrough searches children in the DOM tree to determine the area to reveal. Suppose your DOM looks like this:
   *
   *    SeeThrough -> A -> B -> C -> D
   *
   * A depth of 3 means that the revealed area will be max_area(A, B, C).
   *
   * Normally a depth of 1 is enough because parents will be as big as their children. However, absolute/fixed
   * children don't contribute to the parent's size so the depth needs to be large enough so that the search sees them.
   */
  childSearchDepth: PropTypes.number,
};

SeeThrough.defaultProps = {
  active: false,
  onClick: () => {}, // Do nothing
  className: '',
  style: {},
  maskColor: 'rgba(0, 0, 0, 0.4)',
  childSearchDepth: 1,
};

// withResizeDetector re-renders the component when its width/height change
// and it injects "width" and "height" props, but we don't use those
export default withResizeDetector(SeeThrough);
