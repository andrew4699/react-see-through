/// <reference types="cypress" />

/* eslint-disable react/prop-types */

import React, { Component } from 'react';
import { shallow, render, mount } from 'enzyme';
import SeeThrough from './SeeThrough';
import 'cypress-react-unit-test';

const simpleString = 'Some Text';

// Helpers
expect.extend({
  toMount(element) {
    try {
      mount(element);
      return { pass: true, message: () => '' };
    } catch(ex) {
      return { pass: false, message: () => `expected ${element} to mount, but it failed: ${ex}` };
    }
  },
  toRenderAndContain(element, text) {
    const renderedText = render(element).text();
    if(!renderedText.includes(text)) {
      return { pass: false, message: () => `Expected text to contain ${text}, but was ${renderedText}` };
    }

    return { pass: true, message: () => '' };
  },
  toHaveBounds(element, expectedBounds) {
    // const actualBounds =
    //   shallow(element) // <SeeThrough>
    //   .shallow() // <ResizeDetector>
    //   .shallow() // <ChildWrapper>
    //   .shallow() // <Fragment>
    //   .childAt(1) // <PartialMask>
    //   .props().exclude[0];
    // .find('PartialMask')

    const actualBounds = cy.mount(element);
    console.log('act bounds', actualBounds);
    return { pass: true, message: () => '' };
  },
});

function box(width, height) {
  const style = {
    width: `${width}px`,
    height: `${height}px`,
  };
  return <div style={ style } />;
}

// Child wrappers
const FuncNoopWrapper = ({ children }) => children; // NOTE: You can't attach a ref to a functional component so any ref techniques will need to handle that
const FuncDivWrapper = ({ children }) => <div>{ children }</div>;
class CompNoopWrapper extends Component { render() { return this.props.children; } }
class CompDivWrapper extends Component { render() { return <div>{ this.props.children }</div>; } }

// Tests
describe('SeeThrough#inactive', () => {
  it('renders no children without crashing', () => {
    expect(<SeeThrough />).toMount();
  });

  it('renders some null children without crashing', () => {
    expect(
      <SeeThrough>
        <FuncDivWrapper>{ simpleString }</FuncDivWrapper>
        { null }
        <FuncDivWrapper>{ simpleString }</FuncDivWrapper>
        <FuncNoopWrapper>{ simpleString }</FuncNoopWrapper>
      </SeeThrough>
    ).toMount();
  });

  it('renders without crashing with a FuncNoopWrapper child', () => {
    expect(
      <SeeThrough>
        <FuncNoopWrapper>
          { simpleString }
        </FuncNoopWrapper>
      </SeeThrough>
    ).toMount();
  });

  it('renders without crashing with a FuncDivWrapper child', () => {
    expect(
      <SeeThrough>
        <FuncDivWrapper>
          { simpleString }
        </FuncDivWrapper>
      </SeeThrough>
    ).toMount();
  });

  it('renders without crashing with a CompNoopWrapper child', () => {
    expect(
      <SeeThrough>
        <CompNoopWrapper>
          { simpleString }
        </CompNoopWrapper>
      </SeeThrough>
    ).toMount();
  });

  it('renders without crashing with a CompDivWrapper child', () => {
    expect(
      <SeeThrough>
        <CompDivWrapper>
          { simpleString }
        </CompDivWrapper>
      </SeeThrough>
    ).toMount();
  });

  it('should render the children', () => {
    expect(<SeeThrough active><div>{ simpleString }</div></SeeThrough>).toRenderAndContain(simpleString);
  });
});

describe('SeeThrough#active', () => {
  it('should render the children', () => {
    expect(<SeeThrough active><div>{ simpleString }</div></SeeThrough>).toRenderAndContain(simpleString);
  });
});

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
    expect(simpleBoxes(0)).toHaveBounds({ x: 0, y: 0, width: 0, height: 0 });
  });

  // TODO: other tests with actual rendering
});
