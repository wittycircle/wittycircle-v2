'use strict';

/**
 * @ngdoc function
 * @name wittyApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the wittyApp
 **/

angular.module('wittyApp').controller('HeadCtrl', function ($scope, $http, $timeout) {

	$scope.seo = {
		pageTitle: "Wittycircle | Where the world meets future entrepreneurs",
		pageDescription: "Nobody can build great things alone. Share your ideas or projects on Wittycircle and be connected to the right people, at the right time.",
	};

	$scope.card = {
		title: "Wittycircle | Where the world meets future entrepreneurs",
		url: "https://www.wittycircle.com",
		image: "http://res.cloudinary.com/dqpkpmrgk/image/upload/v1476481759/Capture_d_e%CC%81cran_2016-10-14_a%CC%80_11.51.00_xdd1hm.png"
	};

	if ($(window).width() < 736) {
		$scope.mobile = true;
		$scope.viewport = "width=device-width,height=device-height,user-scalable=no,initial-scale=1.0";
	} else {
		$scope.mobile = false;
		$scope.viewport = "width=device-width";
	}

	$scope.hideNewsModal = function() {
		$('#modal-news-section').attr('class', 'animated fadeOutRight faOuRi');
		$('#model-news-section').css('display', 'none');
		$scope.displayNews = false;
	};
});
