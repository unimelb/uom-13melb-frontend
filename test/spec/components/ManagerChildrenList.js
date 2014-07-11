'use strict';

describe('ManagerChildrenList', function () {
  var ManagerChildrenList, component;

  beforeEach(function () {
    ManagerChildrenList = require('../../../src/scripts/components/ManagerChildrenList.jsx');
    component = ManagerChildrenList();
  });

  it('should create a new instance of ManagerChildrenList', function () {
    expect(component).toBeDefined();
  });
});
