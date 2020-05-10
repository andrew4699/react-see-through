import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import PropTypes from 'prop-types';
import { useContainer } from './helpers';

// CanvasPartialMask masks part of a page by overlaying a canvas over it and making the
// excluded areas transparent while the rest of the canvas is the maskColor.
export default function CanvasPartialMask({ exclude, maskColor, onClick }) {
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

  // Create a container for the canvas. The reason we want a container as a child on the body
  // is because we want the canvas to have absolute positioning relative to the entire document.
  const container = useContainer();
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

CanvasPartialMask.propTypes = {
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
  onClick: PropTypes.func.isRequired,

  /**
   * Same as SeeThrough.maskColor
   */
  maskColor: PropTypes.string.isRequired,

  /**
   * Same as SeeThrough.interactive
   */
  interactive: PropTypes.bool.isRequired,
};
