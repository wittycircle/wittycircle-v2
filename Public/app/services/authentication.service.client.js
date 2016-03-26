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

        return service;

        // private functions for user by email
        function getUserByEmail(email) {
            var data = [];
            var ret;
            var defer = $q.defer();

            data = $resource('http://127.0.0.1/user_email/:email', {email: '@email'});
            data.query({email: email}).$promise.then(function(data) {
                ret = data[0].profile[0];
                defer.resolve(ret);
            });

            return defer.promise;
        }

        // Login fonction to api Rest
        function Login(email, password, callback) {
            $http({
                  url: "http://127.0.0.1/api/login",
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
        }

        // Setting Credentials and user object to $cookieStore
        function SetCredentials(email, id, profile_id, username, callback) {

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
    }

    // Base64 encoding service used by Authentication
    var Base64 = {

        keyStr: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=',

        encode: function (input) {
            var output = "";
            var chr1, chr2, chr3 = "";
            var enc1, enc2, enc3, enc4 = "";
            var i = 0;

            do {
                chr1 = input.charCodeAt(i++);
                chr2 = input.charCodeAt(i++);
                chr3 = input.charCodeAt(i++);

                enc1 = chr1 >> 2;
                enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
                enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
                enc4 = chr3 & 63;

                if (isNaN(chr2)) {
                    enc3 = enc4 = 64;
                } else if (isNaN(chr3)) {
                    enc4 = 64;
                }

                output = output +
                    this.keyStr.charAt(enc1) +
                    this.keyStr.charAt(enc2) +
                    this.keyStr.charAt(enc3) +
                    this.keyStr.charAt(enc4);
                chr1 = chr2 = chr3 = "";
                enc1 = enc2 = enc3 = enc4 = "";
            } while (i < input.length);

            return output;
        },

        decode: function (input) {
            var output = "";
            var chr1, chr2, chr3 = "";
            var enc1, enc2, enc3, enc4 = "";
            var i = 0;

            // remove all characters that are not A-Z, a-z, 0-9, +, /, or =
            var base64test = /[^A-Za-z0-9\+\/\=]/g;
            if (base64test.exec(input)) {
                window.alert("There were invalid base64 characters in the input text.\n" +
                    "Valid base64 characters are A-Z, a-z, 0-9, '+', '/',and '='\n" +
                    "Expect errors in decoding.");
            }
            input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

            do {
                enc1 = this.keyStr.indexOf(input.charAt(i++));
                enc2 = this.keyStr.indexOf(input.charAt(i++));
                enc3 = this.keyStr.indexOf(input.charAt(i++));
                enc4 = this.keyStr.indexOf(input.charAt(i++));

                chr1 = (enc1 << 2) | (enc2 >> 4);
                chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
                chr3 = ((enc3 & 3) << 6) | enc4;

                output = output + String.fromCharCode(chr1);

                if (enc3 != 64) {
                    output = output + String.fromCharCode(chr2);
                }
                if (enc4 != 64) {
                    output = output + String.fromCharCode(chr3);
                }

                chr1 = chr2 = chr3 = "";
                enc1 = enc2 = enc3 = enc4 = "";

            } while (i < input.length);

            return output;
        }

    };

})();
