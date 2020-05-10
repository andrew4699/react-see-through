import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import PropTypes from 'prop-types';
import { useContainer } from './helpers';

/**
 * NOTE: The runtime complexity is not optimal and this can run slowly in degenerate cases
 * This solution is a lot easier to implement. Adopted from https://stackoverflow.com/a/26105552
 * An optimal solution is available here: https://link.springer.com/article/10.1007/BF02189307
 *
 * @param {object} source - the rectangle to dissect
 * @param {Array} holes - list of holes to dissect the source rectangle around
 * @returns an array of rectangles R such that (R + holes) = source and rectangles in R and holes do not intersect
 */
function rectilinearDissection(source, holes) {
  // Pseudocode:
  /*
    R = []

    while R + holes != source
      place an empty rectangle r at some uncovered space
      horizontally expand r until it touches a covered space
      vertically expand r until it touches a covered space
      add r to R

    return R
  */

  // Heuristics:
  // -

  let { x, y } = source;
  while(x < source.x + source.width || y < source.y + source.height) {

  }

  const R = [];

  return R;
}

// MultiBoxPartialMask masks part of a page by putting multiple box elements in areas that are
// not excluded. The box elements each have the maskColor.
export default function MultiBoxPartialMask({ exclude, maskColor, onClick }) {
  // Create a container for the boxes. The reason we want a container as a child on the body
  // is because we want the boxes to have absolute positioning relative to the entire document.
  const container = useContainer();
  if(!container) {
    return null;
  }

  // Compute the boxes that are needed to cover the area
  const boxes = rectilinearDissection(page, exclude).map(rect => {
    <div>x</div>
  });
  console.log('boxes', boxes);

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

  /**
   * Same as SeeThrough.interactive
   */
  interactive: PropTypes.bool.isRequired,
};
