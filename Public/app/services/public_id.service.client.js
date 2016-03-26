/**
 * @ngdoc factory
 * @name wittyApp.facory:public_id
 * @description
 * # public_id
 * Factory in the wittyApp.
 */
 (function () {
       'use strict';

       angular
           .module('wittyApp')
           .factory('Public_id', Public_id);

       Public_id.$inject = ['$http', '$cookieStore', '$rootScope', '$resource', '$q', '$cookies'];
       function Public_id($http, $cookieStore, $rootScope, $resource, $q, $cookies) {
           var service = {};

           service.createPublicId = createPublicId;

           return service;

           function createPublicId() {
             var public_id_generated;

             public_id_generated = Math.floor((Math.random() * 90000) + 10000);
             return public_id_generated;
           }



       };

})();
