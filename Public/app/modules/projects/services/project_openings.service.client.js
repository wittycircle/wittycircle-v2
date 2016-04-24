/**
 * @ngdoc factory
 * @name wittyApp.facory:Project_Openings
 * @description
 * # Project_Openings
 * Factory in the wittyApp.
 **/
(function () {
    'use strict';

    angular
        .module('wittyApp')
        .factory('Project_Openings', Project_Openings);

    Project_Openings.$inject = ['$http', '$cookieStore', '$rootScope', '$resource', '$q'];
    function Project_Openings($http, $cookieStore, $rootScope, $resource, $q) {
        var service = {};

        service.updateOpenings = updateOpenings;
        
        return service;


        function updateOpenings(opening_id, data, callback) {
          $http.put('/opening/' + opening_id, data).success(function(response) {
            callback(response);
          }).error(function(error_response) {
            callback(response);
          });
        }

    };

})();
