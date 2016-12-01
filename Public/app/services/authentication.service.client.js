(function () {
    'use strict';

    angular
        .module('wittyApp')
        .factory('Authentication', Authentication);

    Authentication.$inject = ['$http', '$cookieStore', '$rootScope', '$resource', '$q'];
    function Authentication($http, $cookieStore, $rootScope, $resource, $q) {
        var service = {};

        service.Login = Login;
        service.SetCredentials = SetCredentials;
        service.SetCredentialsSocial = SetCredentialsSocial;
        service.ClearCredentials = ClearCredentials;
        service.ResetPassword = ResetPassword;
        service.ResetPasswordTokenValidation = ResetPasswordTokenValidation;
        service.checkAdmin = checkAdmin;

        return service;

        // private functions for user by email
        function getUserByEmail(email) {
            var data = [];
            var ret;
            var defer = $q.defer();

            data = $resource('/user_email/:email', {email: '@email'});
            data.query({email: email}).$promise.then(function(data) {
                ret = data[0].profile[0];
                defer.resolve(ret);
            });

            return defer.promise;
        }

        // Login fonction to api Rest
        function Login(email, password, callback) {
            /*$http({
                  url: "/api/login",
                  dataType: "json",
                  method: "POST",
                  data: { email: email, password: password },
                  headers: {
                      "Content-Type": "application/json"
                  },
              })
                .success(function (response) {
                    callback(response);
                });
                */
            var data = {};
            data.email = email;
            data.password = password;
            $http.post('/api/login', data).success(function (response) {
                callback(response);
            });
        }

        function checkAdmin() {
            return $http.get('/admin/check');
        }

        // Setting Credentials and user object to $cookieStore
        function SetCredentials(email, id, profile_id, username, moderator, ambassador, callback) {

            getUserByEmail(email).then(function (result) {
                $rootScope.globals = {
                    currentUser: {
                        islogged: true,
                        id: id,
                        profile_id: profile_id,
                        email: email,
                        first_name: result.first_name,
                        last_name: result.last_name,
                        username: username,
                        moderator: moderator,
                        ambassador: ambassador
                    }
                };
                if (result.cover_picture)
                    $rootScope.globals.currentUser.profile_cover = result.cover_picture;
                if (result.profile_picture_icon)
                    $rootScope.globals.currentUser.profile_picture_icon = result.profile_picture_icon;

                //$http.defaults.headers.common['Authorization'] = 'Basic ' + authdata; // jshint ignore:line
                $cookieStore.put('globals', $rootScope.globals);
                callback({success: true});
            });
        }

        function SetCredentialsSocial(user, profile) {
            // console.log("username du setcred: " + user.username);
                $rootScope.globals = {
                    currentUser: {
                        islogged: true,
                        id: user.id,
                        profile_id: profile.profile_id,
                        email: user.email,
                        first_name: profile.first_name,
                        last_name: profile.last_name,
                        username: user.username,
			            moderator: user.moderator,
                        ambassador: user.ambassador
                    }
                };
                if (profile.cover_picture)
                    $rootScope.globals.currentUser.profile_cover = profile.cover_picture;
                if (profile.profile_picture_icon)
                    $rootScope.globals.currentUser.profile_picture_icon = profile.profile_picture_icon;
                //$http.defaults.headers.common['Authorization'] = 'Basic ' + authdata; // jshint ignore:line
                $cookieStore.put('globals', $rootScope.globals);
        }


        function ClearCredentials(callback) {
            $rootScope.globals = {};
            $cookieStore.remove('globals');
            $http.defaults.headers.common.Authorization = 'Basic ';
            callback(true);
        }

        function ResetPassword(email, callback) {
            var data = {};
            data.email_reset = email;
            $http.post('/api/resetpassword', data).success(function (response) {
                callback(response);
            }).error(function (error_message) {
                callback(error_message);
            });
        }

        function ResetPasswordTokenValidation(token) {
            return $http.get('/api/resetpassword/' + token);
        }

    }


})();
