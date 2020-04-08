/// <reference types="cypress" />

import React, { Component } from 'react';
import SeeThrough from './SeeThrough';
import NoopClassWrapper from './NoopClassWrapper';
import ReactTestUtils from 'react-dom/test-utils'; // ES6
import 'cypress-react-unit-test';

// From https://github.com/bahmutov/cypress-react-unit-test/issues/51
import * as ReactDOM from 'react-dom';
window.ReactDOM = ReactDOM;

const simpleString = 'Some Text';

function box(width, height) {
  const style = {
    width: `${width}px`,
    height: `${height}px`,
  };
  return <div style={ style } />;
}

class CompNoopWrapper extends Component { render() { return this.props.children; } }

// Tests
describe('SeeThrough#childSearchDepth', () => {
  const simpleBoxes = childSearchDepth => (
    <SeeThrough childSearchDepth={ childSearchDepth } active>
      { box(20, 20) }
      <div>
        { box(20, 20) }
      </div>
      { box(20, 20) }
    </SeeThrough>
  );

  it('should compute an empty rectangle for depth = 0', () => {
    // cy.mount(simpleBoxes(0));

    cy.mount(
      <CompNoopWrapper>
        <SeeThrough active>
          <div>some content</div>
        </SeeThrough>
      </CompNoopWrapper>
    );

    cy.get(CompNoopWrapper).then(tree => {
      const mask = ReactTestUtils.findRenderedComponentWithType(tree, NoopClassWrapper);
      const bounds = mask.props.exclude[0];
      expect(bounds.x).to.equal(5);
    });

  });

  // TODO: other tests with actual rendering
});
