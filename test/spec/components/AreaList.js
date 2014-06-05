'use strict';

describe('AreaList', function () {
  var AreaList, component;

  beforeEach(function () {
    AreaList = require('../../../src/scripts/components/AreaList.jsx');
    component = AreaList();
  });

  it('should create a new instance of AreaList', function () {
    expect(component).toBeDefined();
  });
});
