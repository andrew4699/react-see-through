/// <reference types="cypress" />
/* global cy */
/* eslint-disable react/prop-types */

import React, { Component } from 'react';
import SeeThrough from './SeeThrough';
import NoopClassWrapper from './NoopClassWrapper';
import ReactTestUtils from 'react-dom/test-utils'; // ES6
import 'cypress-react-unit-test';

// From https://github.com/bahmutov/cypress-react-unit-test/issues/51
import * as ReactDOM from 'react-dom';
window.ReactDOM = ReactDOM;

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

function expectBounds(element, expectedBounds) {
  // Overrides the previous render
  cy.render(<CompNoopWrapper>{ element }</CompNoopWrapper>);

  return cy.get(CompNoopWrapper).then(tree => {
    const partialMask = ReactTestUtils.findRenderedComponentWithType(tree, NoopClassWrapper);
    const bounds = partialMask.props.exclude[0];
    expect(bounds).to.deep.equal(expectedBounds);
  });
}

function box(width, height) {
  return <div style={{ width, height }} />;
}

class CompNoopWrapper extends Component { render() { return this.props.children; } }

// Tests
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

  it('should handle depths that are larger than the actual depth', () => {
    cy.wrap(null)
      .then(() => expectBounds(boxes(1), { x: 0, y: 0, width: 20, height: 60 }))
      .then(() => expectBounds(boxes(1e6), { x: 0, y: 0, width: 20, height: 60 }));
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
