'use strict';

describe('CurrentArea', function () {
  var CurrentArea, component;

  beforeEach(function () {
    CurrentArea = require('../../../src/scripts/components/CurrentArea.jsx');
    component = CurrentArea();
  });

  it('should create a new instance of CurrentArea', function () {
    expect(component).toBeDefined();
  });
});
