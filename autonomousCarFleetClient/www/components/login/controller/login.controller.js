/**
 * Created by simonthome on 23/12/2016.
 */
'use strict';

angular.module('starter.login', ['starter.mainpage']);
angular.module('starter.login').controller('LoginCtrl', ['$scope', '$state', '$q', 'ApiService', 'LocalStorageService', function ($scope, $state, $q, ApiService, LocalStorageService) {
	$scope.loginAlerts = [];
	$scope.closeAlert = function(index) {
		$scope.loginAlerts.splice(index, 1);
	};
	$scope.account = {
		userName: '',
		password: ''
	};
	$scope.login = form => {
		if (form) {
			console.log($scope.account);
			ApiService.login($scope.account)
				.then(loginResponse => {
					console.log(loginResponse);
					ApiService.saveToken(loginResponse.token);
					LocalStorageService.saveUser(loginResponse.accountData);
					$state.go('mainpage');
				})
				.catch(err => {
				  $scope.loginAlerts.push({msg: 'Mot de passe ou identifiant incorrect', type: 'danger'});
				});
		}
	};
}]);
