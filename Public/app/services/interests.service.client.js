/**
 * @ngdoc service
 * @name wittyApp.interests
 * @description
 * # interests
 * Factory in the wittyApp.
 */
  (function () {
      'use strict';

      angular
          .module('wittyApp')
          .factory('Interests', Interests);

      Interests.$inject = ['$http', '$cookieStore', '$rootScope', '$resource', '$q'];
      function Interests($http, $cookieStore, $rootScope, $resource, $q) {
          var service = {};

          service.getInterests = getInterests;
          service.getUserInterests = getUserInterests;

          return service;


          function getInterests() {
              var data = [];
              var ret;
              var defer = $q.defer();

              data = $resource('/interests');
              data.query().$promise.then(function(data) {
                  ret = data;
                  defer.resolve(ret);
              });

              return defer.promise;
          };

          function getUserInterests(user_id) {
            var data = [];
            var ret;
            var defer = $q.defer();

            data = $resource('/user/:user_id/interests', {user_id: '@user_id'});
            data.query({user_id: user_id}).$promise.then(function(data) {
                ret = data;
                defer.resolve(ret);
            });

            return defer.promise;
          }


      };

  })();
