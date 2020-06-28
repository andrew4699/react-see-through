import React, { useMemo } from 'react';
import { createPortal } from 'react-dom';
import PropTypes from 'prop-types';
import { useContainer, rectilinearDissection, useWindowResizeCount } from './helpers';

function rectToString(rect) {
  return `${rect.x},${rect.y},${rect.width},${rect.height}`;
}

// MultiBoxPartialMask masks part of a page by putting multiple box elements in areas that are
// not excluded. The box elements each have the maskColor.
export default function MultiBoxPartialMask({ exclude, maskColor, onClick }) {
  // Compute the page dimensions
  const windowResizeCount = useWindowResizeCount();
  const page = useMemo(() => ({
    x: 0,
    y: 0,
    width: document.documentElement.scrollWidth,
    height: document.documentElement.scrollHeight,
  }), [windowResizeCount]);

  // Compute the boxes that are needed to cover the non-excluded area
  const dissection = useMemo(() => rectilinearDissection(page, exclude), [page, exclude]);
  const boxes = dissection.map(box =>
    <div key={ rectToString(box) } onClick={ onClick } style={{
      position: 'absolute',
      top: box.y,
      left: box.x,
      width: box.width,
      height: box.height,
      background: maskColor,
    }} />
  );

  // Create a container for the boxes. The reason we want a container as a child on the body
  // is because we want the boxes to have absolute positioning relative to the entire document.
  const container = useContainer();
  if(!container) {
    return null;
  }

  return createPortal(
    <div
      width={ document.documentElement.scrollWidth }
      height={ document.documentElement.scrollHeight }
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        zIndex: 2000000000, // 2 billion
      }}
    >
      { boxes }
    </div>,
    container
  );
}

MultiBoxPartialMask.propTypes = {
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
};
