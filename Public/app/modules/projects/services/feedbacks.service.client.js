(function () {
    'use strict';

    angular
    .module('wittyProjectModule')
    .factory('Feedbacks', Feedbacks);

    Feedbacks.$inject = ['$http', '$cookieStore', '$rootScope', '$resource', '$q'];
    function Feedbacks($http, $cookieStore, $rootScope, $resource, $q) {
        var service = {};

        service.createFeedbacks = createFeedbacks;
        service.getFeedbacksbyProjectId = getFeedbacksbyProjectId;
        service.getFeedbacksbyProjectPublicId = getFeedbacksbyProjectPublicId;
        service.deleteFeedbacks = deleteFeedbacks;
        service.deleteFeedbackReply = deleteFeedbackReply;
        service.addFeedbackReply = addFeedbackReply;

        return service;


        function createFeedbacks (data, callback) {
            $http.post('/feedbacks', data).success(function (response) {
                callback(response);
            });
        };

        function getFeedbacksbyProjectId (project_id, callback) {
            $http.get('/project/' + project_id + '/feedbacks').success(function (response) {
                callback(response);
            });
        };

        function getFeedbacksbyProjectPublicId (public_id, callback) {
            $http.get('/project/' + public_id + '/feedbacks/public').success(function (response) {
                callback(response);
            }).error(function (error_response) {
                callback(error_response);
            });
        };

        function deleteFeedbacks (feedbacks_id, callback) {
            $http.delete('/feedback/' + feedbacks_id).success(function (response) {
                callback(response);
            });
        };

        function deleteFeedbackReply (reply_id, callback) {
            $http.delete('/feedback_replies/' + reply_id).success(function (response) {
                callback(response);
            }).error(function (error_response) {
                callback(error_response);
            });
        }

        function addFeedbackReply (data, callback) {
            $http.post('/feedback_replies', data).success(function (response) {
                callback(response);
            }).error(function (error_response) {
                callback(error_response);
            });
        }



    };

})();
