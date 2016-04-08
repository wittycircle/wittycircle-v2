 (function () {
    'use strict';

    angular
        .module('wittyProjectModule')
        .factory('Project_Involvment', Project_Involvment);

     Project_Involvment.$inject = ['$http', '$rootScope', '$q', 'Users'];
     function Project_Involvment ($http, $rootScope, $q, Users) {
         var service = {};

         service.getUserInvolvedByProjectId = getUserInvolvedByProjectId;
         service.getAllUsersInvolvedByPublicId = getAllUsersInvolvedByPublicId;

         return service;

         function getUserInvolvedByProjectId (project_id) {
          if (project_id) {
            return $http.get('/project/' + project_id + '/involved');
          } else {
            return null;
          }
         }

         function getAllUsersInvolvedByPublicId (public_id) {
           if (public_id) {
             return $http.get('/project/involved_users/' + public_id);
           } else {
             return null;
           }
         }

     };

 })();
