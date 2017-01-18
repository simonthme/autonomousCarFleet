/**
 * Created by simonthome on 24/12/2016.
 */
'use strict';

angular.module('starter.register', ['starter.mainpage']);
angular.module('starter.register')
    .controller('RegisterCtrl', ['$scope', 'ApiService', 'LocalStorageService', '$state', function ($scope, ApiService, LocalStorageService, $state) {
        $scope.account = {
            accountName: '',
            userName: '',
            password: ''
        };
        $scope.registerAlerts = [];
        $scope.closeAlert = function (index) {
            $scope.registerAlerts.splice(index, 1);
        };
        $scope.register = form => {
            if (form) {
                ApiService.register($scope.account)
                    .then(registerResponse => {
                        console.log(registerResponse);
                        const accountLogin = {
                            userName: $scope.account.userName,
                            password: $scope.account.password
                        };
                        return ApiService.login(accountLogin);
                    })
                    .then(loginResponse => {
                        console.log(loginResponse);
                        ApiService.saveToken(loginResponse.token);
                        LocalStorageService.saveUser(loginResponse.accountData);
                        $state.go('mainpage');
                    })
                    .catch(err => {
                        console.log(err);
                    });
            }
        };
    }]);
