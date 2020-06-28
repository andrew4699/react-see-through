import { rectilinearDissection, doRectsIntersect } from './helpers';

expect.extend({
  // dissection is valid iff
  //  1. dissection + holes covers the entire source
  //  2. none of its rectangles overlap
  toBeAValidDissectionOf(dissection, source, holes) {
    // (1) Check that dissection + holes covers the entire source
    // Create a boolean array the same size as the source. This will represent covered areas.
    //  covered[y][x] represents whether the point (source.x + x, source.y + y) is covered
    const covered = Array(source.height)
      .fill(0)
      .map(() => Array(source.width).fill(false));

    // Go through all dissections and holes, marking their area in the boolean array as covered
    for(const rect of dissection.concat(holes)) {
      for(let y = rect.y; y < rect.y + rect.height; y++) {
        for(let x = rect.x; x < rect.x + rect.width; x++) {
          covered[y][x] = true;
        }
      }
    }

    // Check if any area in the array is marked as uncovered
    for(let y = source.y; y < source.y + source.height; y++) {
      for(let x = source.x; x < source.x + source.width; x++) {
        if(!covered[y - source.y][x - source.x]) {
          return { pass: false, message: () => `Expected dissection ${JSON.stringify(dissection)} and holes ${JSON.stringify(holes)} to cover the source, but (${x}, ${y}) is not covered` };
        }
      }
    }

    // (2) Check that none of the dissection rectangles overlap
    for(const r1 of dissection) {
      for(const r2 of dissection) {
        // Skip rectangles that are the same
        if(r1 === r2) {
          continue;
        }

        if(doRectsIntersect(r1, r2)) {
          return { pass: false, message: () => `Expected dissected rectangles not to overlap, but ${JSON.stringify(r1)} and ${JSON.stringify(r2)} overlapped` };
        }
      }
    }

    return { pass: true, message: () => '' };
  },

  toContainPoint(dissection, x, y) {
    const pointRect = { x, y, width: 1, height: 1 };
    if(dissection.some(rect => doRectsIntersect(rect, pointRect))) {
      return { pass: true, message: () => '' };
    }

    return { pass: false, message: () => `Expected dissection ${JSON.stringify(dissection)} to contain point (${x}, ${y}) but it didn't` };
  },
});

describe('rectilinearDissection', () => {
  const source = { x: 0, y: 0, width: 300, height: 300 };

  it('computes a correct simple dissection', () => {
    const holes = [
      { x: 10, y: 10, width: 10, height: 10 },
    ];
    const dissection = rectilinearDissection(source, holes);

    expect(dissection).toBeAValidDissectionOf(source, holes);
    expect(dissection).toContainPoint(0, 0);
    expect(dissection).toContainPoint(200, 200);
    expect(dissection).not.toContainPoint(11, 11);
    expect(dissection).not.toContainPoint(19, 19);
  });

  it('handles holes in the top left corner', () => {
    const holes = [
      { x: 0, y: 0, width: 10, height: 10 },
      { x: 50, y: 50, width: 10, height: 10 },
    ];
    const dissection = rectilinearDissection(source, holes);

    expect(dissection).toBeAValidDissectionOf(source, holes);
    expect(dissection).toContainPoint(11, 11);
    expect(dissection).toContainPoint(61, 61);
    expect(dissection).not.toContainPoint(0, 0);
    expect(dissection).not.toContainPoint(51, 51);
  });

  it('handles holes in the bottom left corner', () => {
    const holes = [
      { x: 0, y: 290, width: 10, height: 10 },
      { x: 50, y: 50, width: 10, height: 10 },
    ];
    const dissection = rectilinearDissection(source, holes);

    expect(dissection).toBeAValidDissectionOf(source, holes);
    expect(dissection).toContainPoint(0, 0);
    expect(dissection).toContainPoint(61, 61);
    expect(dissection).not.toContainPoint(8, 291);
  });

  it('handles holes in the top right corner', () => {
    const holes = [
      { x: 290, y: 0, width: 10, height: 10 },
      { x: 50, y: 50, width: 10, height: 10 },
    ];
    const dissection = rectilinearDissection(source, holes);

    expect(dissection).toBeAValidDissectionOf(source, holes);
    expect(dissection).toContainPoint(0, 0);
    expect(dissection).toContainPoint(61, 61);
    expect(dissection).not.toContainPoint(291, 1);
    expect(dissection).not.toContainPoint(51, 51);
  });

  it('handles holes in the bottom right corner', () => {
    const holes = [
      { x: 290, y: 290, width: 10, height: 10 },
      { x: 50, y: 50, width: 10, height: 10 },
    ];
    const dissection = rectilinearDissection(source, holes);

    expect(dissection).toBeAValidDissectionOf(source, holes);
    expect(dissection).toContainPoint(0, 0);
    expect(dissection).toContainPoint(61, 61);
    expect(dissection).not.toContainPoint(291, 291);
    expect(dissection).not.toContainPoint(51, 51);
  });
});
