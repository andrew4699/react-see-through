import React from 'react';
import { shallow, render, mount } from 'enzyme';
import SeeThrough from './SeeThrough';

const simpleString = 'Some Text';

function FunctionalComponent({ children }) {
  return children;
}

describe('SeeThrough', () => {
  it('renders without crashing', () => {
    const wrapper = shallow(<SeeThrough />);
    expect(wrapper).toHaveLength(1);
  });

  it('renders without crashing with a functional component child', () => {
    // Why test this specifically? You can't attach a ref to a functional component so any
    // ref techniques will need handle this case properly
    const wrapper = mount(
      <SeeThrough>
        <FunctionalComponent>
          { simpleString }
        </FunctionalComponent>
      </SeeThrough>
    );

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
