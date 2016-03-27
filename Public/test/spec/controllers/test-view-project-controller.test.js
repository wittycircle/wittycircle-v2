'use strict';

describe('viewProjectCtrl unit test', function () {

  // load the controller's module
  beforeEach(module('wittyProjectModule'));
  //beforeEach(angular.mock.module("wittyProjectModule"));

  var viewProjectCtrl;
  var scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    viewProjectCtrl = $controller('viewProjectCtrl', {
      $scope: scope
      // place here mocked dependencies
    });
  }));

  it('testing controller', function() {
      expect(viewProjectCtrl).toBeDefined();
  });

});
