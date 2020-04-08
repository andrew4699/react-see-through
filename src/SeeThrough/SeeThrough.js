import React, { useState, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import PartialMask from './PartialMask';
import { withResizeDetector } from 'react-resize-detector';
import NoopClassWrapper from './NoopClassWrapper';

const emptyRect = { x: 0, y: 0, width: 0, height: 0 };

/**
 * getBoundingClientRect returns a rectangle relative to the viewport.
 * Modified from https://stackoverflow.com/a/1480137
 *
 * @returns a bounding rectangle relative to the top left of the document.
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
 * @returns the minimal rectangle that covers all the given rectangles.
 *          If "rects" is empty, returns an empty rectangle at position (0, 0).
 */
function getMinimalCoveringRect(rects) {
  if(rects.length === 0) {
    return emptyRect;
  }

  // Figure out the min/max coordinates of all the rectangles
  let minX = Number.POSITIVE_INFINITY,
    minY = Number.POSITIVE_INFINITY,
    maxX = Number.NEGATIVE_INFINITY,
    maxY = Number.NEGATIVE_INFINITY;

  for(const { x, y, width, height } of rects) {
    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    maxX = Math.max(maxX, x + width);
    maxY = Math.max(maxY, y + height);
  }

  // Compute the rectangle from the min/max coordinates
  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY,
  };
}

/**
 * @param {Element} root - Where to start the search
 * @param {number} depth - The number of levels down from the root to search.
 *                         A depth of 0 returns nothing.
 *                         A depth of 1 returns the direct children of the root. And so on.
 * @param {Array} children - An array to store all non-text children elements of the root up to the
 *                           specified depth, not including the root
 */
function findChildren(root, depth, children) {
  if(depth === 0) {
    return;
  }

  for(const child of root.children) {
    children.push(child);
    findChildren(child, depth - 1, children); // Stack depth is linear in depth, which shouldn't be very high
  }
}

/**
 * Copied from https://github.com/maslianok/react-resize-detector
 * @returns whether or not this is being rendered by the server
 */
function isSSR() {
  return typeof window === 'undefined';
}

/**
 * Manages a count of how many times the window has been resized since this component was mounted.
 * @returns Returns the count of resizes
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
  const bounds = useMemo(() => {
    if(!active || !wrapper) {
      return emptyRect;
    }

    const childNodes = [];
    findChildren(wrapper, childSearchDepth, childNodes);
    return getMinimalCoveringRect(childNodes.map(getAbsoluteBoundingRect));
  }, [wrapper, active, children, childSearchDepth]);

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
   * children don't contribute to the parent's size so the depth needs to be large enough that the search sees them.
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
