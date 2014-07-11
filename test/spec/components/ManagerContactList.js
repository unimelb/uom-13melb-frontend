'use strict';

describe('ManagerContactList', function () {
  var ManagerContactList, component;

  beforeEach(function () {
    ManagerContactList = require('../../../src/scripts/components/ManagerContactList.jsx');
    component = ManagerContactList();
  });

  it('should create a new instance of ManagerContactList', function () {
    expect(component).toBeDefined();
  });
});
