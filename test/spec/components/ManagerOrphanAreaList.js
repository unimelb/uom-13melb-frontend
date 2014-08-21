'use strict';

describe('ManagerOrphanAreaList', function () {
  var ManagerOrphanAreaList, component;

  beforeEach(function () {
    ManagerOrphanAreaList = require('../../../src/scripts/components/ManagerOrphanAreaList.jsx');
    component = ManagerOrphanAreaList();
  });

  it('should create a new instance of ManagerOrphanAreaList', function () {
    expect(component).toBeDefined();
  });
});
