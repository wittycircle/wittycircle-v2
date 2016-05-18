(function () {

    'use strict';

    angular.module('wittyValidateAccountModule').config(function ($urlRouterProvider, $stateProvider, $httpProvider, $locationProvider) {
      $stateProvider
      .state('validate-account', {
        url: '/validate-account/:token',
        templateUrl: 'modules/validate-account/views/validate-account.view.client.html',
        controller: 'ValidateAccountCtrl',
        controllerAs: 'vm',
        resolve: {
            loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                     return $ocLazyLoad.load([
                         'modules/validate-account/controller/validate-account.controller.client.js',
                     ]);
            }],
            valid: function ($http, $stateParams) {
                return $http.get('/user/valid/' + $stateParams.token);
            }
        }
      })


    })

})();
