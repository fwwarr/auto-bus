angular.module('AutoBus', ['ngResource', 'ui.bootstrap', 'pascalprecht.translate'])

.controller('AutobusController', function($scope, $resource, $translate) {
	
	$scope.settings = {
		lang:'fr',
		timeFormat: {
			absolute: {
				show: true,
				format: 'HH:mm'
			},
			relative: {
				show: true
			}
		}
	};
	moment.locale($scope.settings.lang);
	
	$scope.stops = [
		{line:24, stop:52741, direction:'W'}
		,{line:80, stop:52442, direction:'N'}
	];
	window.localStorage.setItem('stops', JSON.stringify($scope.stops));
	
	$scope.refresh = function() {
		$scope.stops = JSON.parse(window.localStorage.getItem('stops'));
		for (var s in $scope.stops) {
			$scope.stops[s].result = $resource(
				'http://i-www.stm.info/:lang/lines/:line/stops/:stop/arrivals',
				{
					lang:$scope.settings.lang,
					line:$scope.stops[s].line,
					stop:$scope.stops[s].stop,
					d:moment().format('YYYYMMDD'),
					t:moment().format('HHmm'),
					direction:$scope.stops[s].direction,
					wheelchair:0,
					limit:5,
					callback:'JSON_CALLBACK'
				},
				{get:{method:'JSONP'}}
			).get();
		}
	}
	
	$scope.addStop = function() {
		$scope.stops.push({
			line:$scope.newStop.line,
			stop:$scope.newStop.stop,
			direction:$scope.newStop.direction});
		window.localStorage.setItem('stops', JSON.stringify($scope.stops));
		$scope.refresh();
	}
	
	$scope.removeStop = function(i) {
		$scope.stops.splice(i,1);
	}
	
	$scope.refresh();
	
	$scope.$watch(
		function(scope) { return scope.settings.lang },
		function(newValue, oldValue) {
			$translate.use(newValue);
			moment.locale(newValue);
			$scope.refresh();
	});
})

.directive('time', ['$interval', function($interval) {

	function link(scope, element, attrs) {
		var timeoutId;

		function updateTime() {
			var formattedTime = '';
			
			if(scope.settings.timeFormat.absolute.show) {
				formattedTime += moment(attrs.time, 'HHmm').format(scope.settings.timeFormat.absolute.format);
			};
			if(scope.settings.timeFormat.relative.show) {
				formattedTime += ' (' + moment(attrs.time, 'HHmm').fromNow() + ')';
			};
			
			element.text(formattedTime);
		}
		
		updateTime();

		timeoutId = $interval(function() {
			updateTime();
		}, 15000);

		element.on('$destroy', function() {
			$interval.cancel(timeoutId);
		});
	
	}

	return {
		link: link
	};
}])

.config(['$translateProvider', function ($translateProvider) {
	$translateProvider.translations('en', {
		SETTINGS: 'Settings',
		LANGUAGE: 'Language',
		TIME_FORMAT: 'Time Format',
		ABSOLUTE: 'Absolute',
		RELATIVE: 'Relative',
		OK: 'Ok',
		
		ADD_STOP: 'Add Stop',
		LINE: 'Line',
		STOP: 'Stop',
		DIRECTION: 'Direction',
		NORTH: 'North',
		SOUTH: 'South',
		EAST: 'East',
		WEST: 'West',
		CANCEL: 'Cancel',
		ADD: 'Add',
	});
	 
	$translateProvider.translations('fr', {
		SETTINGS: 'Préférences',
		LANGUAGE: 'Langue',
		TIME_FORMAT: 'Format d\'heure',
		ABSOLUTE: 'Absolu',
		RELATIVE: 'Relatif',
		OK: 'Ok',
		
		ADD_STOP: 'Ajouter un arrêt',
		LINE: 'Ligne',
		STOP: 'Arrêt',
		DIRECTION: 'Direction',
		NORTH: 'Nord',
		SOUTH: 'Sud',
		EAST: 'Est',
		WEST: 'Ouest',
		CANCEL: 'Annuler',
		ADD: 'Ajouter',
	});
	 
	$translateProvider.preferredLanguage('en');
	$translateProvider.fallbackLanguage('en');
}]);