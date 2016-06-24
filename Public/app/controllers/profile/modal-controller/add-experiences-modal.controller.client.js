'use strict';

angular.module('wittyApp').controller('AddExperiencesModalCtrl', function ($timeout, $modalInstance, $http, $location, $scope, Locations, RetrieveData, redactorOptions) {

	$scope.startMonth           = "Month";
	$scope.startYear            = "Year";
	$scope.endMonth             = "Month";
	$scope.endYear              = "Year";
	$scope.startPeriod          = {};
	$scope.endPeriod            = {};

	RetrieveData.getData('/Schedule', 'GET').then(function(res) {
		$scope.days                 = res.days;
		$scope.months               = res.months;
		$scope.years                = res.years;
	});


	$scope.getStartMonth        = function(month) {
		$scope.startPeriod.month  = month;
		$scope.startMonth         = month.Pap;
	};
	$scope.getStartYear         = function(year) {
		$scope.startPeriod.year   = year;
		$scope.startYear          = year;
	};
	$scope.getEndMonth          = function(month) {
		$scope.endPeriod.month    = month;
		$scope.endMonth           = month.Pap;
	};
	$scope.getEndYear           = function(year) {
		$scope.endPeriod.year     = year;
		$scope.endYear            = year;
	};

	$scope.dismiss = function () {
		$modalInstance.dismiss();
	};

	$scope.savePosition         = function() {
		var endTime, dStart, position;

		/*** Error case ***/
		if (!$scope.eJob || !$scope.eCompany || !$scope.addExLocation || !$scope.startPeriod.month || !$scope.startPeriod.year)
		{
			$scope.noJob            = !$scope.eJob ?        true : false;
			$scope.noCompany        = !$scope.eCompany ?    true : false;
			$scope.noLocation       = !$scope.addExLocation ?  true : false;
			$scope.noTime           = (!$scope.startPeriod.month || !$scope.startPeriod.year) ? true : false;
			return ;
		}

		if (!$scope.endPeriod.month || !$scope.endPeriod.year || $scope.checkboxEndTime)
			endTime                 = "Present";
		else {
			endTime                 = new Date($scope.endPeriod.year + '.' + $scope.endPeriod.month.Num + '.' + "01");
			if (isNaN(endTime))
				endTime               = new Date(Date.UTC($scope.endPeriod.year, parseInt($scope.endPeriod.month.Num, 10) - 1, 1, 12, 0, 0)).toISOString();
		}

		dStart                    = new Date($scope.startPeriod.year + '.' + $scope.startPeriod.month.Num + '.' + "01");
		if (isNaN(dStart))
			dStart                  = new Date(Date.UTC($scope.startPeriod.year, parseInt($scope.startPeriod.month.Num, 10) - 1, 1, 12, 0, 0)).toISOString();

		position              = {
			title             : $scope.eJob,
			company           : $scope.eCompany,
			description       : $scope.eJobDescription,
			date_from         : dStart,
			date_to           : endTime,
		};
		Locations.setplaces($scope.addExLocation, position);

		$http.post('/experiences', position).success(function(res) {
			if (res.success) {
				$scope.profileVm.getProfileExp();
				$modalInstance.dismiss();
			}
		});
	};

})
.directive('locationSearch', function() {
	return {
		require: 'ngModel',
		link: function(scope, element, attrs, model) {
			var options   = {
				types: ['(cities)'],
			};

			scope.gPlace  = new google.maps.places.Autocomplete(element[0], options);

			google.maps.event.addListener(scope.gPlace, 'place_changed', function() {
				scope.$apply(function() {
					model.$setViewValue(element.val());

				});
			});

			scope.$watch('displayLocation', function(value) {
				if (value) {
					scope.addExLocation = value;
					var checkCountry          = value.indexOf('United States');
					if (checkCountry >= 0) {
						scope.displayLocation   = value.slice(0, checkCountry - 2);
					}
				}      
			});
		}
	};
});
