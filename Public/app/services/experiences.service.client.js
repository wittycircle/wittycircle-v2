(function () {
    'use strict';

    angular
        .module('wittyApp')
        .factory('Experiences', Experiences);

    Experiences.$inject = ['$http', '$cookieStore', '$rootScope', '$resource', '$q'];
    function Experiences($http, $cookieStore, $rootScope, $resource, $q) {
        var service = {};

        service.getExperiences = getExperiences;
        service.createExperience = createExperience;
        service.updateExperience = updateExperience;
        service.deleteExperience = deleteExperience;

        return service;


        function getExperiences(user_id) {
            var data = [];
            var ret;
            var defer = $q.defer();

            data = $resource('/user/:user_id/experiences', {user_id: '@user_id'});
            data.query({user_id: user_id}).$promise.then(function(data) {
                ret = data;
                defer.resolve(ret);
            });

            return defer.promise;
        };

        function createExperience(data, callback) {
          $http.post('/experiences', data).success(function (response) {
            callback(response);
          });
        };

        function updateExperience(data, experience_id, callback) {
          $http.put('/experience/' + experience_id, data).success(function (response) {
            callback(response);
          });
        };

        function deleteExperience(experience_id, callback) {
          $http.delete('/experience/' + experience_id).success(function (response) {
            callback(response);
          });
        };

    };

})();
