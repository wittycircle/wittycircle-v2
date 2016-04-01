'use strict';

describe('TermsCtrl unit test', function () {

  // load the controller's module
  //beforeEach(module('wittyApp'));
  //beforeEach(module('wittyApp'));
  beforeEach(angular.mock.module("wittyApp"));

  var TermsCtrl;
  var scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    TermsCtrl = $controller('TermsCtrl', {
      $scope: scope
      // place here mocked dependencies
    });
  }));

  it('testing controller', function() {
      expect(TermsCtrl).toBeDefined();
  });

});
