'use strict';

describe('ManagerAreaBrowser', function () {
  var ManagerAreaBrowser, component;

  beforeEach(function () {
    ManagerAreaBrowser = require('../../../src/scripts/components/ManagerAreaBrowser.jsx');
    component = ManagerAreaBrowser();
  });

  it('should create a new instance of ManagerAreaBrowser', function () {
    expect(component).toBeDefined();
  });
});
