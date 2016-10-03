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
		pageTitle: "Wittycircle | Where the world meets entrepreneurs",
		pageDescription: "Nobody can build great things alone. Share your ideas or projects on Wittycircle and be connected to the right people, at the right time.",
	};

	$scope.card = {
		title: "Wittycircle | Where the world meets entrepreneurs",
		url: "https://www.wittycircle.com",
		image: "https://res.cloudinary.com/dqpkpmrgk/image/upload/v1475443938/Cover_Share_FB_Tw_mmyt5p.jpg"
	};

	if ($(window).width() < 736) {
		$scope.mobile = true;
		$scope.viewport = "width=device-width,height=device-height,user-scalable=no,initial-scale=1.0";
	} else {
		$scope.mobile = false;
		$scope.viewport = "width=device-width";
	}
});
