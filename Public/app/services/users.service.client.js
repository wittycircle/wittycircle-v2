(function () {
    'use strict';

    angular
    .module('wittyApp')
    .factory('Users', Users);

    Users.$inject = ['$http', '$cookieStore', '$rootScope', '$resource', '$q'];
    function Users($http, $cookieStore, $rootScope, $resource, $q) {
        var service = {};

        service.getUsers                    = getUsers;
        service.getProfiles                 = getProfiles;
        service.getUserbyId                 = getUserbyId;
        service.getUserbyIdUnresolved       = getUserbyIdUnresolved;
        service.getCardProfiles             = getCardProfiles;
        service.getProfileView              = getProfileView;
        service.getLastMessage              = getLastMessage;
        service.shareIdMessage              = shareIdMessage;
        service.getNumber                   = getNumber;
        service.count                       = count;
        service.sendNumber                  = sendNumber;
        service.getUserIdByProfileId        = getUserIdByProfileId;
        service.updateUser                  = updateUser;
        service.getProfileByUserId          = getProfileByUserId;
        service.getProfilesByProfileId      = getProfilesByProfileId;

        return service;

        var property = {};
        function shareIdMessage () {
            return property;
        };

        var number;
        function getNumber(no) {
            number = no;
        };
        function sendNumber() {
            return number;
        }

        function getLastMessage() {
            var defer = $q.defer();

            return $http.get('/messages/get/all')
            .then(function(response) {
                defer.resolve(response.data);
                return defer.promise;
            }, function(response) {
                return defer.promise;
            });
        }

        function count() { // count number of unread dialogue
            $http.get('/messages/get/all').success(function(res) {
                if (res.success) {
                    var lastMessages = res.topic;
                    for(var i = 0, count = 0; i < lastMessages.length; i++) {
                        if (lastMessages[i].sender != $rootScope.globals.currentUser.username && !lastMessages[i].read)
                        count++;
                    };
                    getNumber(count);
                }
            });
        }

        function getUserIdByProfileId(profile_id) {
            var defer = $q.defer();

            return $http.get('/userId/' + profile_id)
            .then(function(response) {
                defer.resolve(response.data);
                if (response.data.userId){
                    property = {
                        "id": response.data.userId.id,
                    };
                }
                return defer.promise;
            }, function(response) {
                return defer.promise;
            });
        }

        function getUsers() {
            var data = [];
            var ret;
            var defer = $q.defer();

            data = $resource('/users');
            data.query().$promise.then(function(data) {
                ret = data;
                defer.resolve(ret);
            });

            return defer.promise;
        }

        function getProfiles() {
            var data = [];
            var ret;
            var defer = $q.defer();

            data = $resource('/profiles');
            data.query().$promise.then(function(data) {
                ret = data;
                defer.resolve(ret);
            });

            return defer.promise;
        }

        function getCardProfiles(callback) {
            $http.get('/user/card/profiles').success(function(res) {
                callback(res);
            });
        }

        function getProfileView(username) {
            $http.put('/profiles/view/' + username);
        }

        function getProfileByUserId(user_id, callback) {
            $http.post('/profileId/' + user_id).success(function(response) {
                callback(response);
            }).error(function(error_message) {
                callback(error_message);
            });
        }

        function getProfilesByProfileId(profile_id, callback) {
            $http.post('/profiles/' + profile_id).success(function(response) {
                callback(response);
            }).error(function(error_message) {
                callback(error_message);
            });
        }

        function getUserbyId(user_id, callback) {
            $http.get('/user/'+ user_id).success(function (response) {
                callback(response);
            });
        }

        function getUserbyIdUnresolved(user_id) {
            if (user_id) {
                return $http.get('/user/' + user_id);
            } else {
                return null;
            }
        }

        function updateUser(user_id, data, callback) {
            data.email = $rootScope.globals.currentUser.email;
            data.first_name = $rootScope.globals.currentUser.first_name;
            data.last_name = $rootScope.globals.currentUser.last_name;
            data.username = $rootScope.globals.currentUser.username;
            $http.put('/user/'+ user_id, data).success(function (response) {
                callback(response);
            }).error(function (response) {
                callback(response);
            });
        }


    };

})();
