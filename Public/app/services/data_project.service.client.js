/**
 * @ngdoc factory
 * @name wittyApp.facory:projects
 * @description
 * # projects
 * Factory in the wittyApp.
 */
 (function () {
       'use strict';

       angular
           .module('wittyApp')
           .factory('Data_project', Data_project);

       Data_project.$inject = ['$http', '$cookieStore', '$rootScope', '$resource', '$q', '$cookies'];
       function Data_project($http, $cookieStore, $rootScope, $resource, $q, $cookies) {
           var service = {};

           service.setProjectId = setProjectId;
           service.returnProjectId = returnProjectId;

           return service;

           function setProjectId(id) {
             $cookies.put('createProjectId', id);
           }

           function returnProjectId() {
             var project = {};
             project.id = $cookies.get('createProjectId');
             return project;
           }

       };

})();
