/**
 * Created by simonthome on 24/06/2016.
 */

'use strict';

angular.module('starter.mainpage')
  .directive('map', ['$rootScope', 'ApiService', '$uibModal', '$interval', '$timeout', '$window',
    function ($rootScope, ApiService, $uibModal, $interval, $timeout, $window) {
      return {
        restrict: 'A',

        link: function (scope, element, attrs) {


          let lat = scope.$eval(attrs.lat);
          let lng = scope.$eval(attrs.lng);

          let zValue = scope.$eval(attrs.zoom);
          let markers = [];


          let myLatlng = {lat: lat, lng: lng};

          scope.$eval(attrs.value);

          const initialize = () => {
            let mapOptions = {
              zoom: zValue,
              zoomControl: true,
              center: myLatlng,
              disableDefaultUI: true,
              maxZoom: 17
            };
            let map = new google.maps.Map(element[0], mapOptions);

            scope.markerVisible = (carTrip, visibleMarker) => {
              carTrip.tripMarker.setVisible(visibleMarker);
              if (visibleMarker) {
                carTrip.tripPolyline.setMap(map);
              } else {
                carTrip.tripPolyline.setMap(null);
              }
            };


            getDirections(map);

          };

          const moveMarker = (map, marker, latlng) => {
            console.log("setting position marker: " + latlng);
            marker.setPosition(latlng);
          };

          const autoRefresh = (map, pathCoords, tripDist, tripTime, timeDone, marker) => {
            let i, route;
            let z = 0;

            // route = new google.maps.Polyline({
            //   path: [],
            //   geodesic: true,
            //   strokeColor: 'red',
            //   strokeOpacity: 1.0,
            //   strokeWeight: 2,
            //   editable: false,
            //   map: map
            // });


            let pointNumber = 0;

            if (timeDone > 0) {
              const onePointTime = Math.round((tripTime / pathCoords.length));
              pointNumber = Math.round(((timeDone * 60) / onePointTime));
            } else {
              pointNumber = 0;
            }

            console.log('tripTime ' + Math.round(tripTime / pathCoords.length) );


            const updatePath = (i, map, marker, pathCoords) => {
              //console.log('update Path call function');
              $timeout(() => {
                //route.getPath().push(pathCoords[i]);
                console.log('updatePath');
                moveMarker(map, marker, pathCoords[i]);
              },  Math.round(tripTime / pathCoords.length) * 1000 * z); // to change speed (now realtime)
              z++;
            };

            for (i = pointNumber; i < pathCoords.length; i++) {
              updatePath(i, map, marker, pathCoords);
            }
          };

          const getDirections = (map) => {

            $timeout(() => {
              scope.carTrips.map(carTrip => {
                let directionsService = new google.maps.DirectionsService();
                let request = {
                  origin: carTrip.tripDepartureAddress,
                  destination: carTrip.tripArrivalAddress,
                  travelMode: google.maps.TravelMode.DRIVING
                };
                console.log(request);
                directionsService.route(request, function (result, status) {
                  if (status == google.maps.DirectionsStatus.OK) {
                    console.log(result);
                    carTrip.tripMarker.setPosition(result.routes[0].legs[0].start_location);
                    carTrip.tripMarker.setMap(map);
                    carTrip.tripMarker.setVisible(true);
                    carTrip.tripPolyline.setMap(map);
                    markers.push(carTrip.tripMarker);
                    let currentDate = new Date();
                    currentDate.setSeconds(0);
                    currentDate.setMilliseconds(0);
                    currentDate.getTime();
                    let started = false;

                    carTrip.tripPolyline.setPath(result.routes[0].overview_path);
                    carTrip.tripPolyline.setMap(map);
                    $interval(() => {
                      if (carTrip.tripDepartureDate <= currentDate.getTime() && !started) {
                        started = true;
                        autoRefresh(map, result.routes[0].overview_path, carTrip.tripDistanceValue,
                          carTrip.tripDurationValue, carTrip.timeDone, carTrip.tripMarker);
                      }
                    }, 1000);
                  }
                });
              });
            }, 300);
          };

          initialize();

        }
      }

    }]);