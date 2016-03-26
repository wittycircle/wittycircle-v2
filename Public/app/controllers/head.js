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
		pageTitle: "Wittycircle | The creators marketplace",
		pageDescription: "Have an idea worth spreading? You found the right place. Start with finding skilled peope around you, ask for feedback, support and meet your early fans.",
	};

	$scope.card = {
		title: "Wittycircle",
		type: "Marketplace",
		url: "http://www.wittycircle.com",
		image: "https://res.cloudinary.com/dqpkpmrgk/image/upload/v1456926920/footer_discover_tzxces.jpg"
	};
});