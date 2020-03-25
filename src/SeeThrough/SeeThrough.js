import React from 'react';
import PropTypes from 'prop-types';
import './SeeThrough.style'

function SeeThrough({ children }) {
  return (
    <div>
      { children }
    </div>
  );
}

SeeThrough.propTypes = {
  children: PropTypes.any,
  active: PropTypes.bool,
};

SeeThrough.defaultProps = {
  active: false,
};

export default SeeThrough;
