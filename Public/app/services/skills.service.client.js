/**
 * @ngdoc service
 * @name wittyApp.skills
 * @description
 * # skills
 * Factory in the wittyApp.
 */
  (function () {
      'use strict';

      angular
          .module('wittyApp')
          .factory('Skills', Skills);

      Skills.$inject = ['$http', '$cookieStore', '$rootScope', '$resource', '$q'];
      function Skills($http, $cookieStore, $rootScope, $resource, $q) {
          var service = {};

          service.getSkills = getSkills;
          service.getUserSkills = getUserSkills;
          service.addUserSkill = addUserSkill;

          return service;


          function getSkills() {
              var data = [];
              var ret;
              var defer = $q.defer();

              data = $resource('/skills');
              data.query().$promise.then(function(data) {
                  ret = data;
                  defer.resolve(ret);
              });

              return defer.promise;
          };

          function getUserSkills(user_id) {
            var data = [];
            var ret;
            var defer = $q.defer();

            data = $resource('/user/:user_id/skills', {user_id: '@user_id'});
            data.query({user_id: user_id}).$promise.then(function(data) {
                ret = data;
                defer.resolve(ret);
            });

            return defer.promise;
          };

          function addUserSkill(skill_id, callback) {
            $http.get('/skill/add/' + skill_id).success(function(response) {
              callback(response);
            });
          };


      };

  })();
