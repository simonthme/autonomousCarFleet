/**
 * Created by simonthome on 23/12/2016.
 */
'use strict';
angular.module('starter.mainpage', []);
angular.module('starter.mainpage').controller('MainPageCtrl',
  ['$scope', '$rootScope', '$state', '$q', 'ApiService', '$uibModal', '$interval', 'LocalStorageService',
    function ($scope, $rootScope, $state, $q, ApiService, $uibModal, $interval, LocalStorageService) {

      $scope.trip = {
        date: '',
        time: '',
        departureAddress: '',
        arrivalAddress: '',
      };

      $scope.selectedCar = '';
      $scope.carTrips = [];
      $scope.cars = [];

      $scope.trip.time = new Date();

      $scope.hstep = 1;
      $scope.mstep = 1;

      $scope.visibleMarker = true;
      $scope.ismeridian = true;

      $scope.formats = ['dd-MMMM-yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
      $scope.format = $scope.formats[0];

      let carMarker = {
        url: 'assets/image/carImg.svg',
        scaledSize: new google.maps.Size(20, 20),
        origin: new google.maps.Point(0, 0),
        anchor: new google.maps.Point(10, 10)
      };


      const displayCars = () => {
        return $q((resolve, reject) => {
          ApiService.getCars()
            .then(responseCar => {
              responseCar.cars.map(car => {
                if (!car.used) {
                  $scope.cars.push(car);
                }
              });
              resolve(responseCar.cars);
            })
            .catch(err => {
              reject(err);
              console.log(err);
            });
        });
      };

      const timeTravelled = (carArray) => {
        $scope.carTrips = [];
        carArray.map(car => {
          ApiService.getCarTrip(car._id)
            .then(tripResponse => {
              tripResponse.trips.map(trip => {

                if (typeof trip.arrivalDate === 'undefined') {
                  car.tripDistance = trip.distance;
                  car.tripTime = trip.duration;
                  car.tripDepartureAddress = trip.departureAddress;
                  car.tripArrivalAddress = trip.arrivalAddress;
                  car.tripDepartureDate = new Date(trip.departureDate).getTime();
                  car.tripDurationValue = trip.durationValue;
                  car.tripDistanceValue = trip.distanceValue;
                  car.tripMarker = new google.maps.Marker({
                    position: new google.maps.LatLng(48.858093, 2.294694),
                    icon: carMarker,
                    draggable: false,
                    visible: false,
                  });
                  car.tripPolyline = new google.maps.Polyline({
                    path: [],
                    geodesic: true,
                    strokeColor: 'red',
                    strokeOpacity: 1.0,
                    strokeWeight: 2,
                    editable: false,
                   // map: map
                  });
                  const currentDate = new Date();
                  currentDate.setMilliseconds(0);
                  currentDate.setSeconds(0);
                  //currentDate.getTime();
                  car.timeDone = Math.round(currentDate.getTime() - car.tripDepartureDate) / 60000;
                  // console.log('Duration value ' + Math.round(trip.durationValue / 60));
                  // console.log('car time done ' + car.timeDone);
                  if (Math.round((trip.durationValue / 60)) <= car.timeDone) {
                    ApiService.tripFinished({
                      arrivalDate: car.tripDepartureDate + trip.durationValue * 1000
                    }, trip._id)
                      .then(response => {
                        const carObj = {
                          carId: trip.carId,
                          used: false,
                        };
                        return ApiService.updateUsedCar(carObj)
                      })
                      .then(() => {
                        console.log('updated arrival date success');
                        //$state.reload();
                      })
                      .catch(err => {
                        console.log('error in tripFinished');
                      });
                  }
                  $scope.carTrips.push(car);

                }
              });
            })
            .catch(err => console.log(err));
        })
      };

      displayCars()
        .then(carArray => {
          timeTravelled(carArray);
          $interval(() => {
            timeTravelled(carArray);
          }, 60000);
        });


      $scope.newCar = () => {
        $rootScope.modalInstance = $uibModal.open({
          templateUrl: 'components/main-page/views/newCar-modal.view.html',
          scope: $scope,
          controller: 'MainPageCtrl',
          resolve: {
            scopeParent: function () {
              return $scope;
            },
            modalId: function () {
              return $scope.modalId;
            }
          }
        });
      };

      $scope.newTrip = () => {
        $rootScope.modalInstance = $uibModal.open({
          templateUrl: 'components/main-page/views/newTrip-modal.view.html',
          scope: $scope,
          controller: 'MainPageCtrl',
          resolve: {
            scopeParent: function () {
              return $scope;
            },
            modalId: function () {
              return $scope.modalId;
            }
          }
        });
      };

      $scope.addCar = (carName) => {

        ApiService.addCar({name: carName})
          .then(responseCar => {
            console.log(responseCar);
            $state.reload();
            $rootScope.modalInstance.close('close');
          })
          .catch(err => {
            console.log(err);
          })
      };

      $scope.addTrip = () => {
        const datetime = new Date($scope.trip.date.getFullYear(), $scope.trip.date.getMonth(), $scope.trip.date.getDate(),
          $scope.trip.time.getHours(), $scope.trip.time.getMinutes());
        const dataTrip = {
          departureAddress: $scope.trip.departureAddress.formatted_address,
          arrivalAddress: $scope.trip.arrivalAddress.formatted_address,
          departureDate: datetime.getTime(),
          carId: $scope.selectedCar,
        };
        ApiService.addTrip(dataTrip)
          .then(trip => {
            $state.reload();
            $rootScope.modalInstance.close('close');
            console.log(trip);
            const carObj = {
              carId: $scope.selectedCar,
              used: true,
            };
            return ApiService.updateUsedCar(carObj)
          })
          .then(carResponse => {
            console.log('car used update successfull');
            $state.reload();
          })
          .catch(err => {
            console.log(err);
          })
      };

      $scope.dateOptions = {
        //dateDisabled: disabled,
        formatYear: 'yy',
        maxDate: new Date(2020, 5, 22),
        minDate: new Date(),
        startingDay: 1
      };

      $scope.open1 = function () {
        $scope.popup1.opened = true;
      };

      $scope.setDate = function (year, month, day) {
        $scope.trip.date = new Date(year, month, day);
      };

      $scope.today = function () {
        $scope.trip.date = new Date();
      };
      $scope.today();

      $scope.popup1 = {
        opened: false
      };

      $scope.autocompleteOptions = {
        componentRestrictions: {country: 'fr'},
        types: ['geocode']
      };




      $scope.logout = () => {
        $rootScope.modalInstance = $uibModal.open({
          templateUrl: 'components/main-page/views/logout-modal.view.html',
          scope: $scope,
          controller: 'MainPageCtrl',
          resolve: {
            scopeParent: function () {
              return $scope;
            },
            modalId: function () {
              return $scope.modalId;
            }
          }
        });
      };

      $scope.logoutModal = () => {
        LocalStorageService.removeLocalStorage();
        ApiService.logout();
        $state.go('login');
      }




    }]);