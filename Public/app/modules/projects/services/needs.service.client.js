(function () {
    'use strict';

    angular
    .module('wittyProjectModule')
    .factory('Needs', Needs);

    Needs.$inject = ['$http', '$rootScope', '$q'];
    function Needs ($http, $rootScope, $q) {
        var service = {};

        service.getNeedsByProjectPublicIdUnresolved = getNeedsByProjectPublicIdUnresolved;

        return service;


        function getNeedsByProjectPublicIdUnresolved (public_id) {
            if (public_id) {
                return $http.get('/openings/project/' + public_id);
            } else {
                return false;
            }
        }



    };

})();
