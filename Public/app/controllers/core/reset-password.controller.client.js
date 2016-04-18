'use strict';

angular.module('wittyApp').controller('ResetPasswordCtrl',
function ($scope, $rootScope, $http, access) {

    var id = access.data.data[0].user_id;
    var user_email = access.data.data[0].user_email;
    var token = access.data.data[0].token;
    var Url = '/user/' + id;
    var UrlC = Url + '/credentials';
    $scope.textValidateOk = false;

    $scope.savePassword = function (new_password, new_password_two) {
        $scope.error1 = null;
        $scope.error2 = null;
        if (!new_password) {
            $scope.error1 = 'Please enter a password';
            return;
        } if (!new_password_two) {
            $scope.error2 = 'Please enter a password';
            return;
        } if (new_password && new_password.length < 8) {
            $scope.error1 = 'Your password must be at least 8 characters long';
            return;
        } if (new_password_two && new_password_two.length < 8) {
            $scope.error2 = 'Your password must be at least 8 characters long';
            return;
        } else {
            if (new_password && new_password_two && new_password === new_password_two) {
                var data = {
                    token: token,
                    email: user_email,
                    password: $scope.new_password,
                };
                $http.post('/api/updatepasswordreset', data).success(function (response) {
                    $scope.textValidateOk = 'You can now login with your new password.';
                    console.log(response);
                }).error(function (err_message) {
                    console.log(err_message);
                });
            } else {
                $scope.error1 = 'Not the same password';
                $scope.error2 = 'Not the same password';
            }
        }
    }

});
