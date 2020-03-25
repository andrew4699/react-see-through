// Demo component
// this is only example component

import React from 'react';
import PropTypes from 'prop-types';
import './MyComponent.style';

class MyComponent extends React.Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {}

  render() {
    const { name } = this.props;
    return (
      <div className='my-component'>
        <i className='icon-test'>One</i><br></br>
        <i className='icon-test'>Two</i><br></br>
        <i className='icon-test'>Three</i>
        <div className='name-holder'>My name is - {name}</div>
      </div>
    )
  }
}

MyComponent.propTypes = {
  name: PropTypes.string
};

export default MyComponent;
