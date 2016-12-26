/**
 * Created by simonthome on 24/06/2016.
 */

/* global google*/
'use strict';

angular.module('starter.mainpage').directive('map', ['$rootScope', 'ApiService', '$uibModal', '$interval', '$timeout', function($rootScope, ApiService, $uibModal, $interval, $timeout) {
    return {
      restrict: 'A',

      link: function (scope, element, attrs) {



        let lat = scope.$eval(attrs.lat);
        let lng = scope.$eval(attrs.lng);

        let zValue = scope.$eval(attrs.zoom);
        let markers = [];

        let myLatlng = {lat: lat, lng: lng};
        let mapOptions = {
          zoom: zValue,
          zoomControl:true,
          center: myLatlng,
          disableDefaultUI: true,
          maxZoom: 17
        };

        let map;
        map = new google.maps.Map(element[0], mapOptions);


        let setMap = () => {
          scope.$eval(attrs.value);




          let directionsService = new google.maps.DirectionsService();

          $timeout( () => {
            scope.carTrips.map(carTrip => {
              let directionsDisplay = new google.maps.DirectionsRenderer();
              let request = {
                origin: carTrip.tripDepartureAddress,
                destination: carTrip.tripArrivalAddress ,
                travelMode: google.maps.TravelMode.DRIVING
              };
              directionsService.route(request, function(result, status) {
                if (status == google.maps.DirectionsStatus.OK) {
                  directionsDisplay.setDirections(result);
                }
              });

              directionsDisplay.setMap(map);
            });
          }, 300);

        };
        setMap();

       }
     }

  }]);
