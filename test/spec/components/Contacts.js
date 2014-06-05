'use strict';

describe('Contacts', function () {
  var Contacts, component;

  beforeEach(function () {
    Contacts = require('../../../src/scripts/components/Contacts.jsx');
    component = Contacts();
  });

  it('should create a new instance of Contacts', function () {
    expect(component).toBeDefined();
  });
});
