import React, { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import './SeeThrough.style.scss';
import PartialMask from './PartialMask';
import { withResizeDetector } from 'react-resize-detector';

const SeeThrough = withResizeDetector(function SeeThrough({ children, active, onClick }) {
  const [wrapper, setWrapper] = useState(null);

  let bounds = { x: 0, y: 0, width: 0, height: 0 };
  if(wrapper) {
    const rect = wrapper.getBoundingClientRect();
    bounds = {
      x: rect.left,
      y: rect.top,
      width: rect.right - rect.left,
      height: rect.bottom - rect.top,
    };
  }

  return (
    <div ref={ setWrapper } className='ReactSeeThrough-wrapper'>
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
   * Whether or not the see-through is active.
   * The masking effect will is active when ANY <SeeThrough> element is active.
   */
  active: PropTypes.bool,

  /**
   * A function to call when the see through component is clicked. This only works when the component is "active".
   * The function is passed the following arguments:
   *
   *    mask - a boolean indicating whether the click was on the masked (black) or unmasked (non-block) area
   */
  onClick: PropTypes.func,
};

SeeThrough.defaultProps = {
  active: false,
  onClick: () => {}, // Do nothing
};

export default SeeThrough;
