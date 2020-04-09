/// <reference types="cypress" />
/* global cy */
/* eslint-disable react/prop-types */

import React, { Component } from 'react';
import SeeThrough from './SeeThrough';
import NoopClassWrapper from './NoopClassWrapper';
import ReactTestUtils from 'react-dom/test-utils';
import 'cypress-react-unit-test';

// From https://github.com/bahmutov/cypress-react-unit-test/issues/51
import * as ReactDOM from 'react-dom';
window.ReactDOM = ReactDOM;

const simpleString = 'Some Text';

// Helpers
beforeEach(() => {
  // Mount something in the beginning so that expectBounds can use .render
  // Using .render lets us expectBounds multiple times in one test

  const style = `
    body {
      margin: 0;
    }
  `;

  cy.mount(<CompNoopWrapper>TEMPORARY ELEMENT</CompNoopWrapper>, { style });
  return cy.get(CompNoopWrapper);
});


/**
 * @returns the minimal rectangle that covers all the given rectangles.
 *          If "rects" is empty, returns an empty rectangle at position (0, 0).
 */
function getMinimalCoveringRect(rects) {
  if(rects.length === 0) {
    return { x: 0, y: 0, width: 0, height: 0 };
  }

  // Figure out the min/max coordinates of all the rectangles
  let minX = Number.POSITIVE_INFINITY,
    minY = Number.POSITIVE_INFINITY,
    maxX = Number.NEGATIVE_INFINITY,
    maxY = Number.NEGATIVE_INFINITY;

  for(const { x, y, width, height } of rects) {
    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    maxX = Math.max(maxX, x + width);
    maxY = Math.max(maxY, y + height);
  }

  // Compute the rectangle from the min/max coordinates
  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY,
  };
}

function expectBounds(element, expectedBounds) {
  // Overrides the previous render
  cy.render(<CompNoopWrapper>{ element }</CompNoopWrapper>);

  return cy.get(CompNoopWrapper).then(tree => {
    const partialMask = ReactTestUtils.findRenderedComponentWithType(tree, NoopClassWrapper);
    const bounds = getMinimalCoveringRect(partialMask.props.exclude);
    expect(bounds).to.deep.equal(expectedBounds);
  });
}

function expectNoCrash(element) {
  // Overrides the previous render
  cy.render(<CompNoopWrapper>{ element }</CompNoopWrapper>);
  return cy.get(CompNoopWrapper);
}

function box(width, height) {
  const style = {
    width,
    height,
    overflow: 'hidden', // Allow boxes smaller than the single character we put in the box
  };

  // Text is intentionally included to make sure that SeeThrough handles text nodes correctly
  return <div style={ style }>t</div>;
}

// Child wrappers
const FuncNoopWrapper = ({ children }) => children; // NOTE: You can't attach a ref to a functional component so any ref techniques will need to handle that
const FuncDivWrapper = ({ children }) => <div>{ children }</div>;
class CompNoopWrapper extends Component { render() { return this.props.children; } }
class CompDivWrapper extends Component { render() { return <div>{ this.props.children }</div>; } }

// Tests
describe('SeeThrough#active-doesnt-crash', () => {
  it('handles no children', () => {
    expectNoCrash(
      <SeeThrough active childSearchDepth={ Number.POSITIVE_INFINITY } />
    );
  });

  it('handles a null child', () => {
    expectNoCrash(
      <SeeThrough active childSearchDepth={ Number.POSITIVE_INFINITY }>
        { null }
      </SeeThrough>
    );
  });

  it('handles many null children', () => {
    expectNoCrash(
      <SeeThrough active childSearchDepth={ Number.POSITIVE_INFINITY }>
        { null }
        { null }
      </SeeThrough>
    );
  });

  it('handles some null children', () => {
    expectNoCrash(
      <SeeThrough active childSearchDepth={ Number.POSITIVE_INFINITY }>
        <FuncDivWrapper>{ simpleString }</FuncDivWrapper>
        { null }
        <FuncDivWrapper>{ simpleString }</FuncDivWrapper>
        <FuncNoopWrapper>{ simpleString }</FuncNoopWrapper>
        { null }
      </SeeThrough>
    );
  });

  it('handles a simple FuncNoopWrapper', () => {
    expectNoCrash(
      <SeeThrough active childSearchDepth={ Number.POSITIVE_INFINITY }>
        <FuncNoopWrapper>
          { simpleString }
        </FuncNoopWrapper>
      </SeeThrough>
    );
  });

  it('handles a simple FuncDivWrapper', () => {
    expectNoCrash(
      <SeeThrough active childSearchDepth={ Number.POSITIVE_INFINITY }>
        <FuncDivWrapper>
          { simpleString }
        </FuncDivWrapper>
      </SeeThrough>
    );
  });

  it('handles a simple CompNoopWrapper', () => {
    expectNoCrash(
      <SeeThrough active childSearchDepth={ Number.POSITIVE_INFINITY }>
        <CompNoopWrapper>
          { simpleString }
        </CompNoopWrapper>
      </SeeThrough>
    );
  });

  it('handles a simple CompDivWrapper', () => {
    expectNoCrash(
      <SeeThrough active childSearchDepth={ Number.POSITIVE_INFINITY }>
        <CompDivWrapper>
          { simpleString }
        </CompDivWrapper>
      </SeeThrough>
    );
  });
});

describe('SeeThrough#childSearchDepth#boxes', () => {
  const boxes = childSearchDepth => (
    <SeeThrough childSearchDepth={ childSearchDepth } active>
      { box(20, 20) }
      <div style={{ display: 'inline-block' }}>
        { box(20, 20) }
      </div>
      { box(20, 20) }
    </SeeThrough>
  );

  it('should compute an empty rectangle for depth = 0', () => {
    expectBounds(boxes(0), { x: 0, y: 0, width: 0, height: 0 });
  });

  it('should account for all boxes for depth > 0', () => {
    // Cypress fun. expectBounds is async (with special CypressPromises) so to have multiple
    // expectBounds in one test, we have to write our test this way.
    cy.wrap(null)
      .then(() => expectBounds(boxes(1), { x: 0, y: 0, width: 20, height: 60 }))
      .then(() => expectBounds(boxes(2), { x: 0, y: 0, width: 20, height: 60 }))
      .then(() => expectBounds(boxes(3), { x: 0, y: 0, width: 20, height: 60 }));
  });
});

describe('SeeThrough#childSearchDepth#absoluteBoxes', () => {
  const boxes = childSearchDepth => (
    <SeeThrough childSearchDepth={ childSearchDepth } active>
      { box(20, 20) }
      <div style={{ display: 'inline-block' }}>
        <div style={{ position: 'absolute', top: 0, left: 0 }}>
          <div style={{ position: 'fixed', top: 0, left: 0 }}>
            { box(300, 200) }
          </div>

          { box(200, 160) }
        </div>
      </div>
      { box(20, 20) }
    </SeeThrough>
  );

  it('should compute an empty rectangle for depth = 0', () => {
    expectBounds(boxes(0), { x: 0, y: 0, width: 0, height: 0 });
  });

  it('should not see the absolute box at depth = 1', () => {
    expectBounds(boxes(1), { x: 0, y: 0, width: 20, height: 40 });
  });

  it('should see the absolute box at depth = 2', () => {
    expectBounds(boxes(2), { x: 0, y: 0, width: 200, height: 160 });
  });

  it('should see the fixed box at depth = 3', () => {
    expectBounds(boxes(3), { x: 0, y: 0, width: 300, height: 200 });
  });
});

describe('SeeThrough#childSearchDepth#edgeElements', () => {
  it('should ignore the size of SVG children', () => {
    expectBounds(
      <SeeThrough childSearchDepth={ Number.POSITIVE_INFINITY } active>
        { box(20, 20) }
        <div style={{ display: 'inline-block' }}>
          <svg viewBox='0 0 30 30' width='30' height='30'>
            <circle cx='5000' cy='5000' r='5000' />
          </svg>
        </div>
      </SeeThrough>,
      { x: 0, y: 0, width: 30, height: 50 },
    );
  });

  it('should correctly compute the absolute bounding box for an SVG in an arbitrary position', () => {
    expectBounds(
      <SeeThrough childSearchDepth={ Number.POSITIVE_INFINITY } active>
        <div style={{ display: 'inline-block', marginTop: 500, marginLeft: 500 }}>
          <svg viewBox='0 0 30 30' width='30' height='30'>
            <circle cx='5000' cy='5000' r='5000' />
          </svg>
        </div>
      </SeeThrough>,
      { x: 500, y: 500, width: 30, height: 30 },
    );
  });
});
