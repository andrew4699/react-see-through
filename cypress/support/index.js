// From https://github.com/bahmutov/cypress-react-unit-test/issues/51
Cypress.on('window:load', win => {
  win.ReactDOM = window.ReactDOM || win.ReactDOM;
});
