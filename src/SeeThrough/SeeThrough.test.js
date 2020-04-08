/* eslint-disable react/prop-types */

import React, { Component } from 'react';
import { render, mount } from 'enzyme';
import SeeThrough from './SeeThrough';

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
});

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

  it('renders a FuncNoopWrapper child without crashing', () => {
    expect(
      <SeeThrough>
        <FuncNoopWrapper>
          { simpleString }
        </FuncNoopWrapper>
      </SeeThrough>
    ).toMount();
  });

  it('renders a FuncDivWrapper child without crashing', () => {
    expect(
      <SeeThrough>
        <FuncDivWrapper>
          { simpleString }
        </FuncDivWrapper>
      </SeeThrough>
    ).toMount();
  });

  it('renders a CompNoopWrapper child without crashing', () => {
    expect(
      <SeeThrough>
        <CompNoopWrapper>
          { simpleString }
        </CompNoopWrapper>
      </SeeThrough>
    ).toMount();
  });

  it('renders a CompDivWrapper child without crashing', () => {
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
