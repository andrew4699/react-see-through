import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import CanvasPartialMask from './CanvasPartialMask';
import MultiBoxPartialMask from './MultiBoxPartialMask';
import { withResizeDetector } from 'react-resize-detector';
import NoopClassWrapper from './NoopClassWrapper';
import { useNotify } from './SeeThroughController';
import { useWindowResizeCount } from './helpers';

/**
 * Gets rid of non-integer values in our rectangles
 *
 * @returns a rectangle with position/size rounded so as to make the rectangle bigger
 */
function biggerRoundedRect(rect) {
  return {
    x: Math.floor(rect.x),
    y: Math.floor(rect.y),
    width: Math.ceil(rect.width),
    height: Math.ceil(rect.height),
  };
}

/**
 * Wrapper around element.getBoundingClientRect() that also supports text nodes.
 *
 * @returns a rectangle describing the element's position, relative to the viewport
 */
function getBoundingClientRect(element) {
  switch(element.nodeType) {
    case Node.ELEMENT_NODE: {
      return element.getBoundingClientRect();
    }

    case Node.TEXT_NODE: {
      const range = document.createRange();
      range.selectNodeContents(element);
      return range.getBoundingClientRect();
    }

    default: {
      throw new Error('Unsupported node type ' + element.nodeType);
    }
  }
}

/**
 * @returns a bounding rectangle relative to the top left of the document
 */
function getAbsoluteBoundingRect(element) {
  const rect = getBoundingClientRect(element);

  return {
    x: rect.x + document.documentElement.scrollLeft,
    y: rect.y + document.documentElement.scrollTop,

    // Width and height shouldn't change based on bounds relativity so they don't need anything special
    width: rect.right - rect.left,
    height: rect.bottom - rect.top,
  };
}

/**
 * @returns the lowercase tag name of this element
 */
function getTagName(element) {
  return element.tagName.toLowerCase();
}

/**
 * @param {Element} root - Where to start the search
 * @param {number} depth - The number of levels down from the root to search.
 *                         A depth of 0 returns nothing.
 *                         A depth of 1 returns the direct children of the root. And so on.
 * @param {Set} childTagsToSkip - a Set of element tag names to not continue traversing. The elements
 *                                with the tags themselves will still be considered, but not their children.
 * @param {Array} children - An array to store all children elements of the root
 *                           up to the specified depth, not including the root
 */
function findChildren(root, depth, childTagsToSkip, children) {
  if(depth === 0) {
    return;
  }

  for(const child of root.childNodes) {
    if(child.nodeType !== Node.TEXT_NODE && child.nodeType !== Node.ELEMENT_NODE) {
      continue;
    }

    children.push(child);

    if(child.nodeType === Node.ELEMENT_NODE && childTagsToSkip.has(getTagName(child))) {
      continue;
    }

    findChildren(child, depth - 1, childTagsToSkip, children); // Stack depth is linear in "depth", which shouldn't be very high
  }
}

function SeeThrough({ children, active, onClick, maskColor, className, style, childSearchDepth, childTagsToSkip, interactive }) {
  // We want to update the bounds when the window is resized
  const windowResizeCount = useWindowResizeCount();

  // Keep track of a ref to the wrapper
  const [wrapper, setWrapper] = useState(null);

  // Figure out which area we want to mask
  const [bounds, setBounds] = useState([]);
  useEffect(() => {
    if(!active || !wrapper) {
      return;
    }

    const childNodes = [];
    findChildren(wrapper, childSearchDepth, new Set(childTagsToSkip), childNodes); // Could be memoized more tightly
    setBounds(childNodes.map(getAbsoluteBoundingRect).map(biggerRoundedRect));
  }, [wrapper, active, children, childSearchDepth, childTagsToSkip, windowResizeCount]);

  // Update the controller with our current state
  const notify = useNotify();
  useEffect(() => {
    if(!notify) {
      return;
    }

    notify(active, bounds, onClick);
    return () => notify(false, [], () => {}); // Become inactive when we dismount
  }, [active, bounds, notify]);

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

      { (!notify && active) && (
        <NoopClassWrapper
          component={ interactive ? MultiBoxPartialMask : CanvasPartialMask }
          key='mask'
          exclude={ bounds }
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
   *    masked - a boolean indicating whether the click was on the masked (black) or unmasked (non-black) area
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
   * The color of the mask. If you're using a SeeThroughController, you should pass this to that instead.
   * Supports all canvas fillStyle formats, e.g. "#AAA333", "red", "rgba(10, 12, 8, 0.2)", ...
   */
  maskColor: PropTypes.string,

  /**
   * SeeThrough searches children in the DOM tree to determine the area to reveal. Suppose your DOM looks like this:
   *
   *    SeeThrough -> A -> B -> C -> D
   *
   * A depth of 3 means that the revealed areas will be A, B, and C.
   *
   * Normally a depth of 1 is enough because parents will be as big as their children. However, absolute/fixed
   * children don't contribute to the parent's size so the depth needs to be large enough that the search sees them.
   */
  childSearchDepth: PropTypes.number,

  /**
   * SeeThrough searches children in the DOM tree to determine the area to reveal (more details under "childSearchDepth").
   * This is a list of element tags that won't be traversed further down. **Note that the tags themselves will still be considered.**
   */
  childTagsToSkip: PropTypes.arrayOf(PropTypes.string),

  /**
   * Whether or not you can interact (click/hover/etc) with elements in an **active** SeeThrough.
   * You can always interact with elements in an inactive SeeThrough.
   *
   * Note that if interactive, this SeeThrough's onClick method will **only** be called if the
   * black masked area is clicked.
   */
  interactive: PropTypes.bool,
};

SeeThrough.defaultProps = {
  active: false,
  onClick: () => {}, // Do nothing
  className: '',
  style: {},
  maskColor: 'rgba(0, 0, 0, 0.4)',
  childSearchDepth: 1,
  childTagsToSkip: ['svg'], // Children inside an SVG could have a lot of overflow. Lets skip them as a precaution.
  interactive: false,
};

// withResizeDetector re-renders the component when its width/height change
// and it injects "width" and "height" props, but we don't use those
export default withResizeDetector(SeeThrough);
