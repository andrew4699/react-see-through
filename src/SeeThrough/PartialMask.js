import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import PropTypes from 'prop-types';

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

export default function PartialMask({ exclude, maskColor, onClick }) {
  // Setup a canvas to draw the mask
  const [canvas, setCanvas] = useState(null);
  useEffect(() => {
    if(!canvas) {
      return;
    }

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = maskColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for(const { x, y, width, height } of exclude) {
      ctx.clearRect(x, y, width, height);
    }
  }, [canvas, exclude, maskColor]);

  // Handle canvas events
  const onClickCanvas = useCallback(({ pageX, pageY }) => {
    if(!canvas) {
      return;
    }

    // Check if the click was in a masked or unmasked area
    const masked = !exclude.some(({ x, y, width, height }) =>
      (x <= pageX && pageX <= x + width) &&
      (y <= pageY && pageY <= y + height)
    );

    onClick(masked);
  }, [canvas, exclude, onClick]);

  // Create a container to use this mask
  const container = useContainer();
  console.log('conatiner', container);
  if(!container) {
    return null;
  }

  return createPortal(
    <canvas
      ref={ setCanvas }
      width={ document.documentElement.scrollWidth }
      height={ document.documentElement.scrollHeight }
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        zIndex: 2000000000, // 2 billion
      }}
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
   * Same as SeeThrough.onClick
   */
  onClick: PropTypes.func,

  /**
   * Same as SeeThrough.maskColor
   */
  maskColor: PropTypes.string,
};

PartialMask.defaultProps = {
  onClick: undefined, // Use SeeThrough defaults
  maskColor: undefined, // Use SeeThrough defaults
};
