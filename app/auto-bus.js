angular.module('AutoBus', ['ngResource', 'ui.bootstrap', 'pascalprecht.translate', 'ngStorage'])

.controller('AutobusController', function($scope, $resource, $translate, $localStorage) {
	
	$scope.$storage = $localStorage.$default({
		settings: {
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
		},
		stops: [
			{line:80, stop:51673, direction:'S'}
		]
	});
	moment.locale($scope.$storage.settings.lang);
	
	$scope.refresh = function() {
		for (var s in $scope.$storage.stops) {
			$scope.$storage.stops[s].result = $resource(
				'http://i-www.stm.info/:lang/lines/:line/stops/:stop/arrivals',
				{
					lang:$scope.$storage.settings.lang,
					line:$scope.$storage.stops[s].line,
					stop:$scope.$storage.stops[s].stop,
					d:moment().format('YYYYMMDD'),
					t:moment().format('HHmm'),
					direction:$scope.$storage.stops[s].direction,
					wheelchair:0,
					limit:5,
					callback:'JSON_CALLBACK'
				},
				{get:{method:'JSONP'}}
			).get();
		}
	}
	
	$scope.addStop = function() {
		$scope.$storage.stops.push({
			line:$scope.newStop.line,
			stop:$scope.newStop.stop,
			direction:$scope.newStop.direction});
		$scope.refresh();
	}
	
	$scope.removeStop = function(i) {
		$scope.$storage.stops.splice(i,1);
	}
	
	$scope.refresh();
	
	$scope.$watch(
		function(scope) { return scope.$storage.settings.lang },
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
			
			if(scope.$storage.settings.timeFormat.absolute.show) {
				formattedTime += moment(attrs.time, 'HHmm').format(scope.$storage.settings.timeFormat.absolute.format);
			};
			if(scope.$storage.settings.timeFormat.relative.show) {
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
