/**
 * @ngdoc factory
 * @name wittyApp.facory:Locations
 * @description
 * # Locations
 * Factory in the wittyApp.
 */
 (function () {
     'use strict';

     angular
         .module('wittyApp')
         .factory('Locations', Locations);

     Locations.$inject = ['$http', '$cookieStore', '$rootScope', '$resource', '$q'];
     function Locations($http, $cookieStore, $rootScope, $resource, $q) {
         var service = {};

         service.setplaces = setplaces;
         service.getplaces = getplaces;

         return service;

         function setplaces(string, obj) {
          var specialCity = ['Hong Kong', 'Vatican City'];
          if (!string || !obj) {
            return null;
          }
          if (specialCity.indexOf(string) !== -1){
            obj.location_city = string;
            obj.location_country = "";
            obj.location_state = "";
          } else {
            if (string.indexOf(",") !== -1) {
              string = string.split(',');
              if (string.length == 2) {
                obj.location_city = string[0].trim();
                obj.location_country = string[1].trim();
                obj.location_state = "";
                return;
              } if (string.length == 3) {
                  obj.location_city = string[0].trim();
                  obj.location_state = string[1].trim();
                  obj.location_country = string[2].trim();
                  return;
               }
            } else {
              if (string.indexOf(' ') === -1) {
                obj.location_city = string;
                obj.location_country = "";
                obj.location_state = "";
                return;
              } else {
                string = string.split(' ');
                if (string.length === 2) {
                  obj.location_city = string[0].trim();
                  obj.location_country = string[1].trim();
                  obj.location_state = "";
                  return;
                }
              }
            }
          }
         };

         function getplaces(obj) {
           var new_string = "";

           if (!obj)
             return;
           if (!obj.location_state) {
             new_string = obj.location_city + ', ' + obj.location_country;
             return new_string;
           } else {
             new_string = obj.location_city + ', ' + obj.location_state;
             return new_string;
           }
         };

     };

 })();
