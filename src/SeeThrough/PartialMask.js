import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import PropTypes from 'prop-types';
import './PartialMask.style.scss';

/**
 * Manages an empty <div> as a child of the document body.
 * @returns a reference to the container Element or null if it hasn't been created yet.
 */
function useContainer() {
  const [container, setContainer] = useState(null);
  useEffect(() => {
    const newContainer = document.createElement('div');
    document.body.appendChild(newContainer);
    setContainer(newContainer);
    return () => newContainer.remove();
  }, []);

  return container;
}

function PartialMask({ exclude, onClick }) {
  // Setup a canvas to draw the mask
  const [canvas, setCanvas] = useState(null);
  useEffect(() => {
    if(!canvas) {
      return;
    }

    const ctx = canvas.getContext('2d');
    ctx.globalAlpha = 0.4;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for(const { x, y, width, height } of exclude) {
      ctx.clearRect(x, y, width, height);
    }
  }, [canvas, exclude]);

  // Handle canvas events
  const onClickCanvas = useCallback(({ pageX, pageY }) => {
    if(!canvas) {
      return;
    }

    // Check if the click was in a masked or unmasked area
    const insideMask = exclude.some(({ x, y, width, height }) =>
      (x <= pageX && pageX <= x + width) &&
      (y <= pageY && pageY <= y + height)
    );

    onClick(insideMask);
  }, [canvas, exclude, onClick]);

  // Create a container to use this mask
  const container = useContainer();
  if(!container) {
    return null;
  }

  return createPortal(
    <canvas
      ref={ setCanvas }
      width={ document.documentElement.scrollWidth }
      height={ document.documentElement.scrollHeight }
      className='ReactSeeThrough-mask'
      onClick={ onClickCanvas }
    />,
    container
  );
}

PartialMask.propTypes = {
  /**
   * An array of sections that should NOT be masked. All values are in "px".
   */
  exclude: PropTypes.arrayOf(PropTypes.shape({
    x: PropTypes.number.isRequired,
    y: PropTypes.number.isRequired,
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
  })).isRequired,

  /**
   * A function to call when the partially masked component is clicked.
   * The function is passed the following arguments:
   *
   *    mask - a boolean indicating whether the click was on the masked (black) or unmasked (non-block) area
   */
  onClick: PropTypes.func,
};

PartialMask.defaultProps = {
  onClick: () => {}, // Do nothing
};

export default PartialMask;
