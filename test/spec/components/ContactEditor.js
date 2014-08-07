'use strict';

describe('ContactEditor', function () {
  var ContactEditor, component;

  beforeEach(function () {
    ContactEditor = require('../../../src/scripts/components/ContactEditor.jsx');
    component = ContactEditor();
  });

  it('should create a new instance of ContactEditor', function () {
    expect(component).toBeDefined();
  });
});
