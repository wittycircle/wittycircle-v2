'use strict';

/**
 * @ngdoc function
 * @name wittyApp.controller:SettingCtrl
 * @description
 * # SettingCtrl
 * Controller of the wittyApp
 **/

angular.module('wittyApp')
	.controller('SettingCtrl', function($http, $timeout, $location, $scope, $rootScope, $state, Authentication, $stateParams) {

	/*** BACKGROUND ***/
	$scope.backPic = $rootScope.globals.currentUser.profile_cover;

	/*** WATCH GENERAL ***/
	$scope.$watch('data.first_name', function(value, oldvalue) {
		if ((value !== oldvalue)) {
			$scope.changeText = "Save Changes";
			$scope.settingChanged = false;
		}
	});
	$scope.$watch('data.last_name', function(value, oldvalue) {
		if (value !== oldvalue) {
			$scope.changeText = "Save Changes";
			$scope.settingChanged = false;
		}
	});
	$scope.$watch('data.username', function(value, oldvalue) {
		if (value !== oldvalue) {
			$scope.changeText = "Save Changes";
			$scope.settingChanged = false;
		}
	});
	$scope.$watch('data.email', function(value, oldvalue) {
		if (value !== oldvalue) {
			$scope.changeText = "Save Changes";
			$scope.settingChanged = false;
		}
	});

	/*** WATCH PASSWORD ***/
	$scope.$watch('newPass.currentPass', function(value, oldvalue) {
		if ((value !== oldvalue)) {
			$scope.passwordChanged = false;
		}
	});
	$scope.$watch('newPass.password', function(value, oldvalue) {
		if ((value !== oldvalue)) {
			$scope.passwordChanged = false;
		}
	});
	$scope.$watch('newPass.confirmPass', function(value, oldvalue) {
		if ((value !== oldvalue)) {
			$scope.passwordChanged = false;
		}
	});

	$scope.changeText 		= "Save Changes";
	$scope.checkFirstName = true;
	$scope.checkLastName 	= true;
	$scope.checkEmail 		= true;
	$scope.checkUsername 	= true;

	var id = $rootScope.globals.currentUser.id;
	var Url = '/user/' + id;
	var UrlC = Url + '/credentials'

	/*** Update Profile ***/
	var refresh = function () {
		$http.get(Url).success(function(res){
			$scope.data.first_name 	= res.profile.first_name;
			$scope.data.last_name	= res.profile.last_name;
			$scope.data.email 		= res.data.email;
			$scope.data.username	= res.data.username;
			$scope.password 	= res.data.password;
		});
	}
	refresh();
	$scope.data = {};

	function getChange() {
		$scope.changeText 		= "Saved";
		$scope.settingChanged 	= true;
	};

	$scope.generalUpdate = function() {
		if (!$scope.data.first_name)
			$scope.checkFirstName	= false;
		else
			$scope.checkFirstName 	= true;
		if (!$scope.data.last_name)
			$scope.checkLastName 	= false;
		else
			$scope.checkLastName 	= true;
		if (!$scope.data.username)
			$scope.checkUsername 	= false;
		else
			$scope.checkUsername 	= true;
		if (!$scope.data.email)
			$scope.checkEmail 		= false;
		else
			$scope.checkEmail 		= true;
		if (!$scope.checkFirstName || !$scope.checkLastName || !$scope.checkEmail || !$scope.checkUsername)
			return ;
		$http.put(Url, $scope.data).success(function(res){
			if (res.success) {
				Authentication.SetCredentials(res.data.email, res.data.id, $rootScope.globals.currentUser.profile_id, res.data.username, function(done){
					$scope.checkFirstName 	= true;
					$scope.checkLastName 	= true;
					$scope.checkEmail 		= true;
					$scope.checkExistU 		= false;
					$scope.checkExistE 		= false;
					getChange();
					refresh();
				});
			} else {
				if (res.msg === "Username already in use")
					$scope.checkExistU = true;
				else
					$scope.checkExistE = true;
			}
		});
	};


	/*** Update Password ***/

	$scope.newPass = {};

	function getSaved() {
		$scope.passwordChanged = true;
	};

	$scope.passwordUpdate = function() {
		if (!$rootScope.globals.currentUser.password && $rootScope.globals.currentUser) {
			var pass = {
				email: $rootScope.globals.currentUser.email,
				password: $scope.newPass.password,
				currentPass: "",
			};

			if (!$scope.newPass.password)
				$scope.checkNewPass 	= true;
			else
				$scope.checkNewPass 	= false;
			if (!$scope.newPass.confirmPass) {
				if ($scope.passNotMatch)
					$scope.passNotMatch = false;
				$scope.checkConfirmPass = true;
			}
			else
				$scope.checkConfirmPass = false;

			if (($scope.newPass.password === $scope.newPass.confirmPass) && $scope.newPass.password.length >= 8) {
				$http.put(UrlC, pass).success(function(res){
					if (res.success) {
						$rootScope.globals.currentUser.password = $scope.newPass.password;
						$scope.newPass.password 				= [];
						$scope.newPass.confirmPass 				= [];
						$scope.password 						= true;
						$timeout(getSaved, 600);
					} else {
						$scope.checkNewPass 		= false;
						$scope.checkConfirmPass 	= false;
					}
				});
			} else {
				if ($scope.newPass.password) {
					if ($scope.newPass.password.length < 8)
						$scope.checkSizePass 		= true;
					else {
						$scope.checkConfirmPass 	= false;
						$scope.passNotMatch 		= true;
						$scope.checkSizePass 		= false;
					}
				}
			}
		} else {
			var pass = {
				email: $rootScope.globals.currentUser.email,
				password: $scope.newPass.password,
				currentPass: $scope.newPass.currentPass
			};

			if (!$scope.newPass.currentPass)
				$scope.checkCurrentPass = true;
			else
				$scope.checkCurrentPass = false;
			if (!$scope.newPass.password)
				$scope.checkNewPass 	= true;
			else
				$scope.checkNewPass 	= false;
			if (!$scope.newPass.confirmPass) {
				if ($scope.passNotMatch)
					$scope.passNotMatch = false;
				$scope.checkConfirmPass = true;
			}
			else
				$scope.checkConfirmPass = false;

			if (($scope.newPass.password === $scope.newPass.confirmPass) && $scope.newPass.password.length >= 8 && $scope.newPass.currentPass.length > 0) {
				$http.put(UrlC, pass).success(function(res){
					if (res.success) {
						$scope.newPass.password 	= [];
						$scope.newPass.confirmPass 	= [];
						$scope.newPass.currentPass 	= [];
						$timeout(getSaved, 300);
					} else {
						$scope.checkCurrentPass 	= true;
						$scope.checkSizePass 		= false;
						$scope.passNotMatch 		= false;
						$scope.checkNewPass 		= false;
						$scope.checkConfirmPass 	= false;
					}
				});
			} else {
				if ($scope.newPass.password) {
					if ($scope.newPass.password.length < 8) {
						$scope.checkCurrentPass = false;
						$scope.checkSizePass 	= true;
					}
					else {
						$scope.checkConfirmPass = false;
						$scope.passNotMatch 	= true;
					}
				}
			}
		}
	};

	$scope.deleteProfile = function() {
		if ($rootScope.globals.currentUser) {
			$http.delete('/user/' + $rootScope.globals.currentUser.id, function(res) {
				Authentication.ClearCredentials(function(res) {
		          	window.location.replace('https://www.wittycircle.com');
		        });
			});
		}
	};
});