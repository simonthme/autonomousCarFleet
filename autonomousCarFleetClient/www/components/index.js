/**
 * Created by simonthome on 23/12/2016.
 */
'use strict';
angular.module('starter').run(['ApiService', '$rootScope', '$state', 'LocalStorageService', '$window', function (ApiService, $rootScope, $state, LocalStorageService, $window) {
  ApiService.isLoggedIn()
    .then(isLogged => {
      console.log(isLogged);
    if (isLogged) {
      ApiService.getToken();
      LocalStorageService.getUser().then(user => {
        console.log("user id : " + user._id);
      });
    }
  });



}]);
