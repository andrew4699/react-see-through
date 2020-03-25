import React from 'react';

import MyComponent from '../src/index';

class Example extends React.Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {}

  render() {
    return (
      <div>
        <MyComponent name='Jack'/>
      </div>
    );
  }
}

export default Example;
