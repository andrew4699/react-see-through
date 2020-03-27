import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import PropTypes from 'prop-types';
import './PartialMask.style.scss';

/**
 * Manages an empty <div> as a child of the document body.
 * @returns a reference to the container Element or null if it hasn't been created yet.
 */
function useContainer(id) {
  const [container, setContainer] = useState(null);
  useEffect(() => {
    const newContainer = document.createElement('div');
    newContainer.id = id;
    document.body.appendChild(newContainer);
    setContainer(newContainer);
    return () => newContainer.remove();
  }, [id]);

  return container;
}

function PartialMask({ exclude }) {
  // Create a container to use this mask
  const containerID = 'zzz';
  const container = useContainer(containerID);

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

  if(!container) {
    return null;
  }

  return createPortal(
    <canvas
      ref={ setCanvas }
      width={ document.documentElement.scrollWidth }
      height={ document.documentElement.scrollHeight }
      className='ReactSeeThrough-mask'
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
};

export default PartialMask;
