'use strict';

/**
 * @ngdoc function
 * @name wittyApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the wittyApp
 **/

angular.module('wittyApp').controller('HeadCtrl', function ($scope) {

	$scope.seo = {
		pageTitle: "Wittycircle | The creators place",
		pageDescription: "Have an idea worth spreading? You found the right place. Start with finding skilled peope around you, ask for feedback, support and meet your early fans.",
	};

	$scope.card = {
		title: "Wittycircle | The creators place",
		url: "https://www.wittycircle.com",
		image: "https://res.cloudinary.com/dqpkpmrgk/image/upload/v1458576687/Share_banner_cover/banner_share.png"
	};

	if ($(window).width() < 736) {
		$scope.mobile = true;
		$scope.viewport = "width=device-width,height=device-height,user-scalable=no,initial-scale=1.0";
	} else {
		$scope.mobile = false;
		$scope.viewport = "width=device-width";
	}
});
