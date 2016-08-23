// (function () {

//     'use strict';


//     angular
//     .module('wittyApp')
//     .controller('LoginCtrl', LoginCtrl)

//     LoginCtrl.$inject = [];
//     function LoginCtrl ($rootScope) {

//             $rootScope.navbar.nshow = false;

//             $scope.lef = true;
//             $scope.lpf = true;
//             $scope.lf = true;
//             $scope.showReset = false;
//             $scope.textButton = 'Log In';
//             $scope.TextReset = 'Forgot password?';
//             $scope.validateReset = false;


//             $scope.login = function() {
//                 if ($scope.showReset === false) {
//                     if (!$scope.email)
//                     $scope.lef = false;
//                     else
//                     $scope.lef = true;
//                     if (!$scope.password)
//                     $scope.lpf = false;
//                     else
//                     $scope.lpf = true;

//                     if (!$scope.lpf || !$scope.lef)
//                     return ;

//                     Authentication.Login($scope.email, $scope.password, function (response) {
//                         if (response.success) {
//                             Authentication.SetCredentials(response.user.email, response.user.id, response.user.profile_id, response.user.username, function(res) {
//                                 if (res.success)
//                                     window.location.href = "https://www.wittycircle.com";
//                             });
//                         } else {
//                             $scope.lf = false;
//                         }
//                     });
//                 } if ($scope.showReset === true) {
//                     if ($scope.ereset) {
//                         Authentication.ResetPassword($scope.ereset, function (response) {
//                             if (response.message) {
//                                 $scope.validateReset = 2;
//                                 $scope.textValidateReset = 'Sorry, no account was found with this email!';
//                             } else {
//                                 $scope.validateReset = true;
//                                 $scope.textValidateReset = 'E-mail successfully sent!';
//                             }
//                         });
//                     }
//                 }
//             };

//             $scope.showResetPassword = function () {
//                 if ($scope.showReset === false) {
//                     $scope.showReset = true;
//                     $scope.textButton = 'Reset Password';
//                     $scope.TextReset = 'Cancel';
//                 } else if ($scope.showReset === true) {
//                     $scope.showReset = false;
//                     $scope.textButton = 'Log In';
//                     $scope.TextReset = 'Forgot Password?';
//                     $scope.validateReset = false;
//                     $scope.textValidateReset = '';
//                 }
//             };

//     }

// })();
