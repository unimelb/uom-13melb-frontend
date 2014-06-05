'use strict';

describe('Main', function () {
  var Uom13melbFrontendApp, component;

  beforeEach(function () {
    var container = document.createElement('div');
    container.id = 'content';
    document.body.appendChild(container);

    Uom13melbFrontendApp = require('../../../src/scripts/components/Uom13melbFrontendApp.jsx');
    component = Uom13melbFrontendApp();
  });

  it('should create a new instance of Uom13melbFrontendApp', function () {
    expect(component).toBeDefined();
  });
});
