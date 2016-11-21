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

	//** LinkedIN API

	function displayProfiles(profiles) {

		console.log(profiles);

		var member 			 = profiles.values[0],
			linPositions 	 = member.positions.values,
			newSavePositions = {}; 

		$scope.aboutDescription = member.summary ? member.summary : null;
		$scope.$apply();

		if (linPositions) {
			function recursive(index) {
				if (linPositions[index]) {
					newSavePositions.company 			= linPositions[index].company.name || null;
					newSavePositions.description 		= linPositions[index].summary || null;
					newSavePositions.location_city		= linPositions[index].location.name || null;
					newSavePositions.location_country 	= linPositions[index].location.country ? linPositions[index].location.country.name : null;
					newSavePositions.title  			= linPositions[index].title || null;

					if (linPositions[index].isCurrent)
						newSavePositions.date_to = "Present";
					newSavePositions.date_from 	= new Date(linPositions[index].startDate.month + "-01-" + linPositions[index].startDate.year);

					$http.post('/experiences', newSavePositions).success(function(res) {
					    if (res.success)
							return recursive(index + 1);
					});			
				} else {
					$scope.profileVm.getProfileExp();
					$modalInstance.dismiss();
				}
			};
			recursive(0);
		} else {
			$scope.onImport 		= false;
			$scope.noCurrentPosition = true;
			$timeout(function() {
				$scope.noCurrentPosition;
			}, 5000)
		}
	};

	function retrieveLinkedinPosition() {
		IN.API.Profile('me').fields([
			'headline', // Current Headline 
			'summary', // Current summary
			'first-name', 'last-name', // Add these to get the name
			'industry', 'date-of-birth', 'educations:(id,school-name)',
			'positions', // Add this one to get the job history
		])
		.result(displayProfiles)
		.error(function(err) {
			$scope.onImport = false;
	    	alert(err);
	    });;
	};

	$scope.getLinkedinField = function() {
		$scope.onImport = true;
		IN.User.authorize(retrieveLinkedinPosition);
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
