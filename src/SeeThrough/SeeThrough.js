import React from 'react';
import PropTypes from 'prop-types';
import './SeeThrough.style.scss';
import PartialMask from './PartialMask';

function SeeThrough({ children, active }) {
  const bounds = {
    x: 10,
    y: 10,
    width: 200,
    height: 100,
  };

  return (
    <div className='ReactSeeThrough-wrapper'>
      { children }

      { active && <PartialMask exclude={ [bounds] } /> }
    </div>
  );
}

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
};

SeeThrough.defaultProps = {
  active: false,
};

export default SeeThrough;
