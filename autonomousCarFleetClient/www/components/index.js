/**
 * Created by simonthome on 23/12/2016.
 */
'use strict';
angular.module('starter').run(['ApiService', '$rootScope', '$state', 'LocalStorageService', '$window',
  function (ApiService, $rootScope, $state, LocalStorageService, $window) {
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

    $rootScope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState) {
      console.log("TO STATE: " + JSON.stringify(fromState));

      ApiService.isLoggedIn()
        .then((isAuth) => {
          if (!isAuth && _.has(toState, 'data.authorization') && _.has(toState, 'data.redirectTo') &&
            fromState.url !== '/login') {
            $state.go(toState.data.redirectTo);
          }
        });
      if ((angular.isUndefined($window.localStorage.getItem('token')) ||
        $window.localStorage.getItem('token') === null) && _.has(toState, 'data.authorization') &&
        _.has(toState, 'data.redirectTo')) {
        $state.go(toState.data.redirectTo);
      }
    });


  }]);
