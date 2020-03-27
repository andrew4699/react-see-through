import React, { useState } from 'react';
import PropTypes from 'prop-types';
import PartialMask from './PartialMask';
import { withResizeDetector } from 'react-resize-detector';

const emptyRect = {
  left: 0,
  top: 0,
  right: 0,
  bottom: 0,
};

const SeeThrough = withResizeDetector(function SeeThrough({ children, active, onClick, className, style }) {
  const [wrapper, setWrapper] = useState(null);

  // Figure out how big the wrapped component is
  const rect = wrapper ? wrapper.getBoundingClientRect() : emptyRect;
  const bounds = {
    x: rect.left,
    y: rect.top,
    width: rect.right - rect.left,
    height: rect.bottom - rect.top,
  };

  return (
    <div ref={ setWrapper } className={ className } style={ style }>
      { children }
      { active && <PartialMask exclude={ [bounds] } onClick={ onClick } /> }
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
   * A function to call when the see through component is clicked. This only works when the component is "active".
   * The function is passed the following arguments:
   *
   *    mask - a boolean indicating whether the click was on the masked (black) or unmasked (non-block) area
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
};

SeeThrough.defaultProps = {
  active: false,
  onClick: () => {}, // Do nothing
  className: '',
  style: {},
};

export default SeeThrough;
