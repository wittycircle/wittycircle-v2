(function () {
    'use strict';

    angular
    .module('wittyApp')
    .factory('RetrieveData', RetrieveData);

    RetrieveData.$inject = ['$http', '$q'];
    function RetrieveData($http, $q) {
        var service = {};

        service.getData     = getData;
        service.ppdData     = ppdData;

        return service;


        function getData(url, method) {
            var deferred = $q.defer();

            var data = $http({
                method: method,
                url: url
            }).then( function(response, status, headers, config) {
                deferred.resolve(response.data);
                return deferred.promise;
            });

            return data;
        }

        function ppdData(url, method, data, param) {
            var deferred = $q.defer();

            var data = $http({

                method  : method,
                url     : url,
                data    : data,
                param   : param,

            }).then( function(response, status, headers, config) {

                deferred.resolve(response.data);
                return deferred.promise;
            });

            return data;
        }
    };


})();
