'use strict';

describe('AreaContacts', function () {
  var AreaContacts, component;

  beforeEach(function () {
    AreaContacts = require('../../../src/scripts/components/AreaContacts.jsx');
    component = AreaContacts();
  });

  it('should create a new instance of AreaContacts', function () {
    expect(component).toBeDefined();
  });
});
