 (function () {
     'use strict';

     angular
         .module('wittyProjectModule')
         .factory('Project_History', Project_History);

     Project_History.$inject = ['$http', '$rootScope'];
     function Project_History($http, $rootScope) {
         var service = {};

         service.addProjectHistoryToCurrentUser         = addProjectHistoryToCurrentUser;
         service.getCurrentUserProjectHistoryUnresolved = getCurrentUserProjectHistoryUnresolved;

         return service;


         function addProjectHistoryToCurrentUser (project_id, callback) {
           if (project_id) {
             var history = {};

             history.project_id = project_id;
             $http.post('/history/project/'+ $rootScope.globals.currentUser.id, history).success(function (response) {
               callback(response);
             });
           } else {
             return null;
           }
         }

         function getCurrentUserProjectHistoryUnresolved () {
           return $http.get('/history/project/'+ $rootScope.globals.currentUser.id);
         }



     };

 })();
