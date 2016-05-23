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
                cache: false,
                url: url
            }).then( function(response, status, headers, config) {
                deferred.resolve(response.data);
                return deferred.promise;
            });

            return data;
        }

        function ppdData(url, method, data, param, cache) {
            var deferred = $q.defer();
            var httpRequest = {};

            httpRequest.method      = method;
            httpRequest.url         = url;
            httpRequest.cache       = cache === 0 ? false: true;
            if (data)
                httpRequest.data    = data;
            if (param)
               httpRequest.url += param;

            var data = $http(httpRequest).then( function(response, status, headers, config) {
                deferred.resolve(response.data);
                return deferred.promise;
            });

            return data;
        }
    };


})();
