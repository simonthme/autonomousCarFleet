/**
 * Created by simonthome on 23/12/2016.
 */
'use strict';
angular.module('starter.mainpage', []);
angular.module('starter.mainpage').controller('MainPageCtrl',
  ['$scope', '$rootScope', '$state', '$q', 'ApiService', '$uibModal', '$interval',
    function ($scope, $rootScope, $state, $q, ApiService, $uibModal, $interval) {

      $scope.trip = {
        date: '',
        time: '',
        departureAddress: '',
        arrivalAddress: '',
      };

      $scope.selectedCar = '';
      $scope.carTrips = [];

      const displayCars = () => {
        return $q((resolve, reject) => {
          ApiService.getCars()
            .then(responseCar => {
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
                  const currentDate = new Date().getTime();
                  car.timeDone = Math.round((currentDate - trip.departureDate)/60000);
                  console.log(car.timeDone);
                  console.log('duration value ' + trip.durationValue <= car.tripTime + '   : ' + trip.durationValue);
                  if (Math.round((trip.durationValue/60)) <= car.tripTime) {
                    ApiService.tripFinished({
                      arrivalDate: trip.departureDate + trip.durationValue
                    }, trip._id)
                      .then(response => {
                        console.log('successfully added arrivalDate' + response);
                      })
                      .catch(err => {
                        console.log('error finishing date' + err);
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
            timeTravelled(carArray);}, 10000);
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
          $scope.trip.time.getHours(), $scope.trip.time.getMinutes(), $scope.trip.time.getSeconds());
        const dataTrip = {
          departureAddress: $scope.trip.departureAddress.formatted_address,
          arrivalAddress: $scope.trip.arrivalAddress.formatted_address,
          departureDate: datetime.getTime(),
          carId: $scope.selectedCar,
        };
        console.log(dataTrip);
        ApiService.addTrip(dataTrip)
          .then(trip => {
            $state.reload();
            $rootScope.modalInstance.close('close');
            console.log(trip);
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

      $scope.formats = ['dd-MMMM-yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
      $scope.format = $scope.formats[0];

      $scope.popup1 = {
        opened: false
      };

      $scope.autocompleteOptions = {
        componentRestrictions: { country: 'fr' },
        types: ['geocode']
      };

      $scope.trip.time = new Date();

      $scope.hstep = 1;
      $scope.mstep = 1;


      $scope.ismeridian = true;



    }]);