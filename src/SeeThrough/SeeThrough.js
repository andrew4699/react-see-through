import React, { useState, useEffect, useMemo } from 'react';
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
 * Manages a count of how many times the window has been resized since this component was mounted.
 * @returns the count of resizes
 */
function useWindowResizeCount() {
  const [windowResizeCount, setWindowResizeCount] = useState(0);

  useEffect(() => {
    const resizeHandler = () => setWindowResizeCount(windowResizeCount + 1);
    window.addEventListener('resize', resizeHandler);
    return () => window.removeEventListener('resize', resizeHandler);
  }, [windowResizeCount]);

  return windowResizeCount;
}

// withResizeDetector re-renders the component when its width/height change
// and it injects "width" and "height" props, but we don't use those
const SeeThrough = withResizeDetector(function SeeThrough(props) {
  const { children, active, onClick, className, style, maskColor } = props;

  // Track window resizes so we can re-render appropriately
  const windowResizeCount = useWindowResizeCount();

  // Figure out the size of the children
  const [wrapper, setWrapper] = useState(null);
  const bounds = useMemo(() => {
    if(!wrapper) {
      return { x: 0, y: 0, width: 0, height: 0 };
    }

    return getAbsoluteBoundingRect(wrapper);
  }, [windowResizeCount, getAbsoluteBoundingRect, wrapper]);

  return (
    <div ref={ setWrapper } className={ className } style={ style }>
      { children }
      { active && <PartialMask exclude={ [bounds] } onClick={ onClick } maskColor={ maskColor } /> }
    </div>
  );
});

SeeThrough.propTypes = {
  /**
   * The elements that that you want to be see-through.
   */
  children: PropTypes.any,

  /**
   * Whether or not this <SeeThrough> is active.
   * Currently, only one active SeeThrough at a time is supported.
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
   */
  className: PropTypes.string,

  /**
   * <SeeThrough> creates a <div> wrapper around all the contained elements.
   * This could break layouts that require very particular element hierarchies, like flex containers.
   * "style" allows you to style that <div> in-case adding it breaks your layout.
   */
  style: PropTypes.any,

  /**
   * The color of the mask.
   * Supports all canvas fillStyle formats, e.g. "#AAA333", "red", "rgba(10, 12, 8, 0.2)", ...
   */
  maskColor: PropTypes.string,
};

SeeThrough.defaultProps = {
  active: false,
  onClick: () => {}, // Do nothing
  className: '',
  style: {},
  maskColor: 'rgba(0, 0, 0, 0.4)',
};

export default SeeThrough;
