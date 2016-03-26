/**
 * @ngdoc factory
 * @name wittyApp.facory:Profile
 * @description
 * # Profile
 * Factory in the wittyApp.
 **/

(function () {

    angular
        .module('wittyApp')
        .factory('Profile', Profile);

    Profile.$inject = ['$http', '$resource', '$q', 'Users'];
    function Profile($http, $resource, $q, Users) {
        var service = {};

        service.getUserbyUsername   = getUserbyUsername;
        service.followUser          = followUser;
        service.getFollowedUser     = getFollowedUser;
        // service.countView           = countView;
        // service.countFollow         = countFollow;
        // service.sendAllCount        = sendAllCount;
        return service;


        function getUserbyUsername(username) {
            'use strict';
            var data = [];
            var ret;
            var defer = $q.defer();

            data = $resource('http://127.0.0.1/username/:username', {username: '@username'});
            data.query({username: username}).$promise.then(function(data) {
                ret = data[0];
                defer.resolve(ret);
            });

            return defer.promise;
        };

        function followUser(username, callback) {
            'use strict';
            $http.post('http://127.0.0.1/follow/user/' + username).success(function(res){
                callback(res);
            });
        };

        function getFollowedUser(list, callback) {
            $http.get('http://127.0.0.1/user_followed').success(function(res)  {
                res.list = list;
                $http.post('http://127.0.0.1/user_followed/get/list', res).success(function(res) {
                    callback(res);
                });              
            });
        };

        // var setView;
        // var setFollow;

        // function getNumberView(count) {
        //     setView = count;
        // };
        // function getNumberFollow(count) {
        //     setFollow = count;
        // };

        // function countView (callback) {
        //     $http.get('http://127.0.0.1/view').success(function(res) {
        //         var views = res.data;
        //         for(var i = 0, count = 0; i < views.length; i++) {
        //             if (!views[i].m_read)
        //                 count++;
        //         }
        //         callback(count);
        //     });
        // };

        // function countFollow(callback) {
        //     $http.get('http://127.0.0.1/follow/list').success(function(res) {
        //         var follow = res.data;
        //         for(var i = 0, count = 0; i < follow.length; i++) {
        //             if (!follow[i].f_read)
        //                 count++;
        //         }
        //         callback(count);
        //     });
        // };

        // function countProjecFollow(callback) {
        //     $http.get("http://127.0.0.1/follow_notification/project").success(function(res) {
        //         var projectFollow = res.data;
        //         for(var i = 0, count = 0; i < projectFollow.length; i++) {
        //             if (!projectFollow[i].m_read)
        //                 count++;
        //         }
        //         callback(count)
        //     });
        // }

        // function sendAllCount(callback) {
        //     countView(function(vCount) {
        //         countFollow(function(fCount) {
        //             countProjecFollow(function(pfCount) {
        //                 var allCount = vCount + fCount + pfCount;
        //                 callback(allCount);
        //             });
        //         });
        //     });
        // }

    };

})();
