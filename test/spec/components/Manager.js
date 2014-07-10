'use strict';

describe('Manager', function () {
  var Manager, component;

  beforeEach(function () {
    Manager = require('../../../src/scripts/components/Manager.jsx');
    component = Manager();
  });

  it('should create a new instance of Manager', function () {
    expect(component).toBeDefined();
  });
});
