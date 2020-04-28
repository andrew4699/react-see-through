import React, { Component } from 'react';
import PropTypes from 'prop-types';

// Functional components don't have refs so it's difficult to read their props during testing.
// This component lets you wrap any React component in a class component and will receive the same props.
export default class NoopClassWrapper extends Component {
  render() {
    return <this.props.component {...this.props} />;
  }
}

NoopClassWrapper.propTypes = {
  /**
   * The type of component to render with the given props.
   */
  component: PropTypes.any.isRequired,
};
