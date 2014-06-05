'use strict';

describe('SearchBox', function () {
  var SearchBox, component;

  beforeEach(function () {
    SearchBox = require('../../../src/scripts/components/SearchBox.jsx');
    component = SearchBox();
  });

  it('should create a new instance of SearchBox', function () {
    expect(component).toBeDefined();
  });
});
