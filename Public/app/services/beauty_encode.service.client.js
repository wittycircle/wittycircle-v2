 (function () {
     'use strict';

     angular
         .module('wittyApp')
         .factory('Beauty_encode', Beauty_encode);

     Beauty_encode.$inject = ['$http', '$cookieStore', '$rootScope', '$resource', '$q'];
     function Beauty_encode($http, $cookieStore, $rootScope, $resource, $q) {
         var service = {};

         service.encodeUrl = encodeUrl;

         return service;

         function encodeUrl(url) {
           if (!url) {
             return;
           } else {
             url = url.replace(/ /g, '-');
           }
           return url;
         };

     };

 })();
