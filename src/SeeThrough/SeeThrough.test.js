/* eslint-disable react/prop-types */
/* eslint-disable react/jsx-key */

import React, { Component } from 'react';
import SeeThrough from './SeeThrough';
import { render, mount } from 'enzyme';
import cases from 'jest-in-case';

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

/**
 *
 * @param {*} variants - an object that maps (property -> array of values)
 * @param {*} result - an array to store the cartesian product
 * @param {*} position - the current position in the variants object
 * @param {*} current - the current combination
 */
function cartesianProduct(variants, result, position = 0, current = []) {
  const keys = Object.keys(variants);

  if(position === keys.length) {
    result.push(Object.assign({}, current));
    return;
  }

  const key = keys[position];
  for(let i = 0; i < variants[key].length; i++) {
    cartesianProduct(variants, result, position + 1, Object.assign({ [key]: variants[key][i] }, current));
  }
}

function getComboName(combo, idx) {
  // It might be helpful later to include the JSON.stringify, but for now it makes the tests very slow
  return `Combo ${ idx }`;
}

// Child wrappers
const FuncNoopWrapper = ({ children }) => children; // NOTE: You can't attach a ref to a functional component so any ref techniques will need to handle that
const FuncDivWrapper = ({ children }) => <div>{ children }</div>;
class CompNoopWrapper extends Component { render() { return this.props.children; } }
class CompDivWrapper extends Component { render() { return <div>{ this.props.children }</div>; } }

// Tests
const variants = {
  active: [true, false, undefined],
  onClick: [undefined, () => {}],
  className: [undefined, 'ReactSeeThrough-test-class'],
  style: [undefined, {}, { color: 'red' }],
  maskColor: [undefined, '#000'],
  childSearchDepth: [0, 1, 2, Number.POSITIVE_INFINITY],
  childTagsToSkip: [[], ['svg']],
  children: [
    // no children
    undefined,

    // one null child
    null,

    // many null children
    <>
      { null }
      { null }
    </>,

    // some null children
    <>
      <FuncDivWrapper>{ simpleString }</FuncDivWrapper>
      { null }
      <FuncDivWrapper>{ simpleString }</FuncDivWrapper>
      <FuncNoopWrapper>{ simpleString }</FuncNoopWrapper>
      { null }
    </>,

    // simple FuncNoopWrapper
    <FuncNoopWrapper>
      { simpleString }
    </FuncNoopWrapper>,

    // simple FuncDivWrapper
    <FuncDivWrapper>
      { simpleString }
    </FuncDivWrapper>,

    // CompNoopWrapper
    <CompNoopWrapper>
      { simpleString }
    </CompNoopWrapper>,

    // CompDivWrapper
    <CompDivWrapper>
      { simpleString }
    </CompDivWrapper>,

    // Text children
    simpleString,
  ],
};

const propCombos = [];
cartesianProduct(variants, propCombos);

// These tests will go through all significant combinations of different props and check some behavior
cases(
  'SeeThrough#inactive-variants-dont-crash',
  props => expect(<SeeThrough { ...props }>{ props.children }</SeeThrough>).toMount(),

  propCombos
    .filter(combo => !combo.active) // js-dom doesn't support HTMLCanvas, which "active" requires
    .map((combo, idx) => Object.assign({ name: getComboName(combo, idx) }, combo)),
);

cases(
  'SeeThrough#variants-render-children',
  props => expect(<SeeThrough { ...props }>{ props.children }</SeeThrough>).toRenderAndContain(simpleString),

  propCombos.map((combo, idx) => Object.assign(
    { name: getComboName(combo, idx) },
    combo,
    { children: <div>{ simpleString }</div> }
  )),
);
