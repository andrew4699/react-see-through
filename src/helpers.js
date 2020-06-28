import { useState, useEffect } from 'react';

/**
 * Manages a count of how many times the window has been resized since this component was mounted.
 * @returns Returns the count of resizes
 */
export function useWindowResizeCount() {
  const [windowResizeCount, setWindowResizeCount] = useState(0);

  useEffect(() => {
    if(isSSR()) {
      return;
    }

    const resizeHandler = () => setWindowResizeCount(windowResizeCount + 1);
    window.addEventListener('resize', resizeHandler);
    return () => window.removeEventListener('resize', resizeHandler);
  }, [windowResizeCount]);

  return windowResizeCount;
}

// Returns whether or not rectangles r1 and r2 intersect
export function doRectsIntersect(r1, r2) {
  return r1.x < (r2.x + r2.width) && r2.x < (r1.x + r1.width) &&
    r1.y < (r2.y + r2.height) && r2.y < (r1.y + r1.height);
}

/**
 * NOTE: The runtime complexity is not optimal and this can run slowly in degenerate cases
 * This solution is a lot easier to implement. Adopted from https://stackoverflow.com/a/26105552
 * An optimal solution is available here: https://link.springer.com/article/10.1007/BF02189307
 *
 * @param {object} source - the rectangle to dissect
 * @param {Array} holes - list of holes to dissect the source rectangle around
 * @returns an array of rectangles R such that (R + holes) = source and rectangles in R and holes do not intersect
 */
export function rectilinearDissection(source, holes) {
  // TODO: ignore empty holes
  // TODO: handle empty source

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

  // Finding an uncovered space
  /*
    The search marker will start at (source.x, source.y).

    When we place a rectangle, it will move to the right of that rectangle while keeping the same y.
    If the search marker is ever placed where another rectangle is, it will also go to the right of that rectangle while keeping the same y.
    If the search marker ever goes oustide the source rectangle, it returns to the left on the next y.
  */

  const R = [];
  const { x, y, width, height } = source;
  let search = { x, y };

  while(true) {
    // We're done if the search marker passed the bottom right of the screen
    if(search.y === height) {
      break;
    }

    // Create the initial rectangle
    const r = {
      ...search,
      width: 1,
      height: 1,
    };

    // Advance the search marker and retry if it intersects
    const intersecting = R.concat(holes).find(rect => doRectsIntersect(rect, r));
    if(intersecting) {
      search.x = intersecting.x + intersecting.width;
      if(search.x >= width) {
        search.x = source.x;
        search.y++;
      }

      continue;
    }

    // Expand r to the right
    while((r.x + r.width) <= width && !R.concat(holes).some(hole => doRectsIntersect(hole, r))) {
      r.width++;
    }
    r.width--; // We increased the width until it intersected, so we subtract 1 from the width at the end to get back to non-intersecting

    // Expand r down
    while((r.y + r.height) <= height && !R.concat(holes).some(hole => doRectsIntersect(hole, r))) {
      r.height++;
    }
    r.height--; // We increased the height until it intersected, so we subtract 1 from the height at the end to get back to non-intersecting

    // Add this rectangle to our dissection
    R.push(r);

    // Advance the search marker simply
    search.x = r.x + r.width;
    if(search.x >= width) {
      search.x = source.x;
      search.y++;
    }
  }

  return R;
}

/**
 * Manages an empty <div> as a child of the document body.
 * @returns a reference to the container Element or null if it hasn't been created yet.
 */
export function useContainer() {
  const [container, setContainer] = useState(null);
  useEffect(() => {
    const newContainer = document.createElement('div');
    document.body.appendChild(newContainer);
    setContainer(newContainer);
    return () => newContainer.remove();
  }, []);

  return container;
}
