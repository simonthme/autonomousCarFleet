/**
 * Created by simonthome on 23/12/2016.
 */
'use strict';
angular.module('starter',
  ['ui.router', 'ui.bootstrap', 'starter.login', 'starter.register', 'google.places', 'isteven-multi-select'])
  .config(['$stateProvider', '$urlRouterProvider', '$locationProvider',
    ($stateProvider, $urlRouterProvider) => {

      $stateProvider
        .state('login', {
          url: '/login',
          controller: 'LoginCtrl',
          templateUrl: 'components/login/views/login.view.html',
        })
        .state('register', {
          url: '/register',
          controller: 'RegisterCtrl',
          templateUrl: 'components/register/views/register.view.html',
        })
        .state('mainpage', {
          url: '/mainpage',
          controller: 'MainPageCtrl',
          templateUrl: 'components/main-page/views/main-page.view.html',
          data: {
            authorization: false,
            redirectTo: 'login'
          }
        });

      $urlRouterProvider.otherwise('login');
    }]);