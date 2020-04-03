import React from 'react';
import { shallow, render } from 'enzyme';
import SeeThrough from './SeeThrough';

const simpleString = 'Some Text';

describe('SeeThrough', () => {
  it('renders without crashing', () => {
    const wrapper = shallow(<SeeThrough />);
    expect(wrapper).toHaveLength(1);
  });
});

describe('SeeThrough#inactive', () => {
  const simpleStringChild = <SeeThrough><div>{ simpleString }</div></SeeThrough>;

  it('should render the children', () => {
    expect(render(simpleStringChild).text()).toContain(simpleString);
  });
});

describe('SeeThrough#active', () => {
  const simpleStringChild = <SeeThrough active><div>{ simpleString }</div></SeeThrough>;

  it('should render the children', () => {
    expect(render(simpleStringChild).text()).toContain(simpleString);
  });
});
