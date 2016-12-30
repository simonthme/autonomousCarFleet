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
          //let markers = [];
          //let routes = [];


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


            getDirections(map);

          };

          const moveMarker = (map, marker, latlng) => {
            console.log('setting marker : ' + latlng);

            marker.setPosition(latlng);
            // map.panTo(latlng);
          };

          const autoRefresh = (map, pathCoords, tripDist, tripTime, timeDone, marker) => {
            let i, route;
            let z = 0;

            route = new google.maps.Polyline({
              path: [],
              geodesic: true,
              strokeColor: 'transparent',
              strokeOpacity: 1.0,
              strokeWeight: 2,
              editable: false,
              map: map
            });

            // marker = new google.maps.Marker({map: map});

            let pointNumber = 0;

            if (timeDone > 0) {
              const onePointTime = Math.round((tripTime / pathCoords.length));
              pointNumber = Math.round(((timeDone * 60) / onePointTime));
            } else {
              pointNumber = 0;
            }

            console.log('point Number ' + pointNumber);


            const updatePath = (i, map, marker, pathCoords) => {

              $timeout(() => {
                route.getPath().push(pathCoords[i]);
                console.log('updatePath');
                moveMarker(map, marker, pathCoords[i]);
              }, Math.round(tripTime / pathCoords.length) * 1000 * z);
              z++;
            };

            for (i = pointNumber; i < pathCoords.length; i++) {
              updatePath(i, map, marker, pathCoords);
            }
          };

          const getDirections = (map) => {

            $timeout(() => {
              scope.carTrips.map(carTrip => {

                // let currentDate = new Date().getTime();

                let directionsService = new google.maps.DirectionsService();
                let directionsDisplay = new google.maps.DirectionsRenderer();
                let request = {
                  origin: carTrip.tripDepartureAddress,
                  destination: carTrip.tripArrivalAddress,
                  travelMode: google.maps.TravelMode.DRIVING
                };
                console.log(request);
                directionsService.route(request, function (result, status) {
                  if (status == google.maps.DirectionsStatus.OK) {
                    console.log(result);
                    const marker = new google.maps.Marker({
                      position: result.routes[0].legs[0].start_location,
                      map: map,
                      //icon: gpsMarker,
                      draggable: false,
                    });
                    //markers.push(scope.gpsmarker);
                    let currentDate = new Date();
                    currentDate.setSeconds(0);
                    currentDate.setMilliseconds(0);
                    currentDate.getTime();
                    // console.log('dep date in map directive : ' + carTrip.tripDepartureDate);
                    // console.log('current date : ' + currentDate.getTime());
                    let started = false;


                    $interval(() => {
                      // console.log('in interval');
                      // console.log('started' + started);
                      if (carTrip.tripDepartureDate <= currentDate.getTime() && !started) {
                        //console.log('start autorefresh');
                        console.log('autorefresh interval');
                        started = true;
                        autoRefresh(map, result.routes[0].overview_path, carTrip.tripDistanceValue,
                          carTrip.tripDurationValue, carTrip.timeDone, marker);
                      }
                    }, 3000);


                    // directionsDisplay.setDirections(result);
                  }
                });

                // directionsDisplay.setMap(map);
              });
            }, 300);
          };

          initialize();


          // google.maps.event.addDomListener($window, 'load', initialize);

        }
      }

    }]);
