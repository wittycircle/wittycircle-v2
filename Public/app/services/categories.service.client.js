/**
 * @ngdoc factory
 * @name wittyApp.facory:categories
 * @description
 * # categories
 * Factory in the wittyApp.
 */
 (function () {
     'use strict';

     angular
         .module('wittyApp')
         .factory('Categories', Categories);

     Categories.$inject = ['$http', '$cookieStore', '$rootScope', '$resource', '$q'];
     function Categories($http, $cookieStore, $rootScope, $resource, $q) {
         var service = {};

         service.getCategories = getCategories;
         service.getCategory = getCategory;
	 service.getCategoryUnresolved = getCategoryUnresolved;

         return service;

         function getCategories(callback) {
           $http.get('/categories').success(function (response) {
             callback(response);
           });
         };

         function getCategory(id, callback) {
           $http.get('/category/' + id).success(function (response) {
             callback(response);
           }).error(function (error_message) {
             callback(error_message);
           });
         };

        function getCategoryUnresolved(id) {
            if (id) {
                return $http.get('/category/' + id)
            } else {
                return null;
            }
        }

     };

 })();
