/**
 * Created by simonthome on 24/06/2016.
 */
'use strict';

angular.module('starter.mainpage')
  .directive('map', ['$rootScope', 'ApiService', '$uibModal', '$interval',
    '$timeout',
    // eslint-disable-next-line max-params
    function ($rootScope, ApiService, $uibModal, $interval, $timeout) {
      return {
        restrict: 'A',
        link(scope, element, attrs) {
          const lat = scope.$eval(attrs.lat);
          const lng = scope.$eval(attrs.lng);
          const zValue = scope.$eval(attrs.zoom);
          const markers = [];
          const myLatlng = {lat, lng};
          scope.$eval(attrs.value);
          // eslint-disable-next-line max-params
          const autoRefresh = (map, pathCoords, tripDist, tripTime, timeDone,
                               marker) => {
            let i;
            let z = 0;
            let pointNumber = 0;
            if (timeDone > 0) {
              const onePointTime = Math.round((tripTime / pathCoords.length));
              pointNumber = Math.round(((timeDone * 60) / onePointTime));
            } else {
              pointNumber = 0;
            }
            const updatePath = (i, map, marker, pathCoords) => {
              $timeout(() => {
                marker.setPosition(pathCoords[i]);
                // to change speed (now realtime)
              }, Math.round(tripTime / pathCoords.length) * 1000 * z);
              z++;
            };
            for (i = pointNumber; i < pathCoords.length; i++) {
              updatePath(i, map, marker, pathCoords);
            }
          };
          const getDirections = map => {
            $timeout(() => {
              let interTrip = false;
              // eslint-disable-next-line array-callback-return
              scope.carTrips.map(carTrip => {
                if (carTrip.intermediaryTrip) {
                  interTrip = true;
                }
                const directionsService = new google.maps.DirectionsService();
                const request = {
                  origin: carTrip.tripDepartureAddress,
                  destination: carTrip.tripArrivalAddress,
                  travelMode: google.maps.TravelMode.DRIVING
                };
                directionsService.route(request, (result, status) => {
                  if (status === google.maps.DirectionsStatus.OK) {
                    carTrip.tripMarker.setPosition(
                      result.routes[0].legs[0].start_location);
                    if (interTrip && carTrip.intermediaryTrip) {
                      carTrip.tripMarker.setVisible(true);
                    }
                    if (!interTrip) {
                      carTrip.tripMarker.setVisible(true);
                    }
                    carTrip.tripMarker.setMap(map);
                    carTrip.tripPolyline.setMap(map);
                    markers.push(carTrip.tripMarker);
                    const currentDate = new Date();
                    currentDate.setSeconds(0);
                    currentDate.setMilliseconds(0);
                    currentDate.getTime();
                    carTrip.tripPolyline.setPath(
                      result.routes[0].overview_path);
                    carTrip.tripPolyline.setMap(map);
                    let started = false;
                    $interval(() => {
                      const timeDate = new Date();
                      timeDate.setSeconds(0);
                      timeDate.setMilliseconds(0);
                      const depDate = new Date(carTrip.tripDepartureDate)
                        .getTime();
                      const timeDone = Math.round(
                          timeDate.getTime() - depDate) / 60000;
                      if (timeDone >= 0 && !started) {
                        started = true;
                        autoRefresh(map, result.routes[0].overview_path,
                          carTrip.tripDistanceValue,
                          carTrip.tripDurationValue, timeDone,
                          carTrip.tripMarker);
                      }
                    }, 2000);
                  }
                });
              });
            }, 300);
          };
          const initialize = () => {
            const mapOptions = {
              zoom: zValue,
              zoomControl: true,
              center: myLatlng,
              disableDefaultUI: true,
              maxZoom: 17
            };
            scope.map = new google.maps.Map(element[0], mapOptions);
            scope.markerVisible = (carTrip, visibleMarker) => {
              carTrip.tripMarker.setVisible(visibleMarker);
              if (visibleMarker) {
                carTrip.tripPolyline.setMap(scope.map);
              } else {
                carTrip.tripPolyline.setMap(null);
              }
            };
            getDirections(scope.map);
          };
          initialize();
          scope.$on('initMap', () => {
            initialize();
          });
        }
      };
    }]);
