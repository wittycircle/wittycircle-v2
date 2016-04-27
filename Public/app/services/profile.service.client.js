(function () {

    'use strict';

    angular
    .module('wittyApp')
    .factory('Profile', Profile);

    Profile.$inject = ['$http', '$resource', '$q', 'Users'];
    function Profile($http, $resource, $q, Users) {
        var service = {};

        service.getUserbyUsername   = getUserbyUsername;
        service.followUser          = followUser;
        service.getFollowedUser     = getFollowedUser;
        return service;


        function getUserbyUsername(username) {
            var data = [];
            var ret;
            var defer = $q.defer();

            data = $resource('/username/:username', {username: '@username'});
            data.query({username: username}).$promise.then(function(data) {
                ret = data[0];
                defer.resolve(ret);
            });

            return defer.promise;
        };

        function followUser(username, callback) {
            $http.post('/follow/user/' + username).success(function(res){
                callback(res);
            }).error(function(err) {
                console.log(err);
            });
        };

        function getFollowedUser(list, callback) {
            $http.get('/user_followed').success(function(res)  {
                if (list.data) {
                    res.list = list.data;
                } else {
                    res.list = list;
                }
                if (list) {
                    $http.post('/user_followed/get/list', res).success(function(res) {
                        callback(res);
                    });
                }
            });
        };

    };

})();
