/**
 * Created by simonthome on 23/12/2016.
 */
'use strict';
angular.module('starter.mainpage', []);
angular.module('starter.mainpage').controller('MainPageCtrl',
  ['$scope', '$rootScope', '$state', '$q', 'ApiService', '$uibModal',
    '$interval', 'LocalStorageService',
    // eslint-disable-next-line max-params
    function ($scope, $rootScope, $state, $q, ApiService, $uibModal, $interval,
              LocalStorageService) {
      $scope.trip = {
        date: '',
        time: '',
        departureAddress: '',
        arrivalAddress: ''
      };
      $scope.carSelectionValue = true;
      $scope.groupSelectionValue = false;
      $scope.selectedCar = '';
      $scope.selectedGroup = '';
      $scope.selectedGroupCars = [];
      $scope.availableGroups = [];
      $scope.carTrips = [];
      $scope.cars = [];
      $scope.stringGroups = [];
      $scope.groups = [{name: 'All cars', show: true}];
      $scope.trip.time = new Date();
      $scope.hstep = 1;
      $scope.mstep = 1;
      $scope.visibleMarker = true;
      $scope.ismeridian = true;
      $scope.formats =
        ['dd-MMMM-yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
      $scope.format = $scope.formats[0];
      const carMarker = {
        url: 'assets/image/carImg.svg',
        scaledSize: new google.maps.Size(20, 20),
        origin: new google.maps.Point(0, 0),
        anchor: new google.maps.Point(10, 10)
      };

      $scope.changeCarValue = () => {
        $scope.carSelectionValue = true;
        $scope.groupSelectionValue = false;
      };
      $scope.changeGroupValue = () => {
        $scope.carSelectionValue = false;
        $scope.groupSelectionValue = true;
      };
      const displayCars = () => {
        return $q((resolve, reject) => {
          ApiService.getCars()
            .then(responseCar => {
              $scope.carTrips = [];
              // eslint-disable-next-line array-callback-return
              responseCar.cars.map(car => {
                if (car.groupName &&
                  $scope.stringGroups.indexOf(car.groupName) === -1) {
                  $scope.stringGroups.push(car.groupName);
                }
                if (!car.used) {
                  car.maker = car.name;
                  car.ticked = false;
                  $scope.cars.push(car);
                }
              });
              console.log($scope.stringGroups);
              angular.forEach($scope.stringGroups, name => {
                $scope.groups.push({name, show: false});
              });
              $scope.availableGroups = [];
              // eslint-disable-next-line array-callback-return
              $scope.stringGroups.map(group => {
                let groupAvailable = true;
                ApiService.getGroupCars({groupName: group})
                  .then(response => {
                    // eslint-disable-next-line max-nested-callbacks
                    response.cars.map(car => {
                      if (car.used) {
                        groupAvailable = false;
                      }
                      return null;
                    });
                    if (groupAvailable) {
                      $scope.availableGroups.push(group);
                    }
                  })
                  .catch(
                    err => console.log('error getting gorup cars for used' +
                      err));
              });
              resolve(responseCar.cars);
            })
            .catch(err => {
              reject(err);
              console.log(err);
            });
        });
      };
      const getTimeDone = (car, trip) => {
        const currentDate = new Date();
        currentDate.setMilliseconds(0);
        const depDate = new Date(car.tripDepartureDate).getTime();
        let timeDoneSec = Math.round(currentDate.getTime() - depDate) / 1000;
        if (timeDoneSec < 0) {
          timeDoneSec = 0;
        }
        currentDate.setSeconds(0);
        const pourcentage = Math.round(
          (timeDoneSec / trip.durationValue) * 100);
        if (pourcentage >= 100 && !car.finished) {
          car.finished = true;
          ApiService.tripFinished({
            arrivalDate: car.tripDepartureDate + (car.tripDurationValue * 1000)
          }, trip._id)
            .then(() => {
              const carObj = {
                carId: car._id,
                used: false
              };
              if (!car.tripIntermediary) {
                return ApiService.updateUsedCar(carObj);
              }
            })
            .then(() => {
              displayCars();
              $state.reload('mainpage');
            })
            .catch(err => {
              console.log('error in tripFinished' + err);
            });
        }
        return pourcentage;
      };
      const timeTravelled = carArray => {
        return $q((resolve, reject) => {
          $scope.carTrips = [];
          // eslint-disable-next-line array-callback-return
          carArray.map(cary => {
            ApiService.getCarTrip(cary._id)
              .then(tripResponse => {
                // eslint-disable-next-line array-callback-return
                tripResponse.trips.map(trip => {
                  if (typeof trip.arrivalDate === 'undefined') {
                    const car = Object.assign({}, cary);
                    car.tripId = trip._id;
                    car.tripDistance = trip.distance;
                    car.tripTime = trip.duration;
                    car.tripDepartureAddress = trip.departureAddress;
                    car.tripArrivalAddress = trip.arrivalAddress;
                    car.tripDepartureDate =
                      new Date(trip.departureDate).getTime();
                    car.tripDurationValue = trip.durationValue;
                    car.tripDistanceValue = trip.distanceValue;
                    car.tripGroup = trip.groupName;
                    car.tripIntermediary = trip.intermediaryTrip;
                    car.tripMarker = new google.maps.Marker({
                      position: new google.maps.LatLng(48.858093, 2.294694),
                      icon: carMarker,
                      draggable: false,
                      visible: false
                    });
                    car.tripPolyline = new google.maps.Polyline({
                      path: [],
                      geodesic: true,
                      strokeColor: 'red',
                      strokeOpacity: 1.0,
                      strokeWeight: 2,
                      editable: false
                    });
                    // eslint-disable-next-line max-nested-callbacks
                    $interval(() => {
                      car.timeDone = getTimeDone(car, trip);
                    }, 1000);

                    $scope.carTrips.push(car);

                    if ($scope.carTrips.length === carArray.length) {
                      resolve();
                    }
                  }
                });
              })
              .catch(err => {
                console.log(err);
                reject();
              });
          });
        });
      };
      displayCars()
        .then(carArray => {
          return timeTravelled(carArray);
        })
        .then(() => {
          console.log('displaying trips');
        })
        .catch(err => {
          console.log('error in time Travelled' + err);
        });
      $scope.newCar = () => {
        $rootScope.modalInstance = $uibModal.open({
          templateUrl: 'components/main-page/views/newCar-modal.view.html',
          scope: $scope,
          controller: 'MainPageCtrl',
          resolve: {
            scopeParent() {
              return $scope;
            },
            modalId() {
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
            scopeParent() {
              return $scope;
            },
            modalId() {
              return $scope.modalId;
            }
          }
        });
      };
      $scope.addCar = carName => {
        ApiService.addCar({name: carName})
          .then(() => {
            $state.reload('mainpage');
            $rootScope.modalInstance.close('close');
          })
          .catch(err => {
            console.log(err);
          });
      };
      $scope.addTrip = () => {
        const datetime = new Date($scope.trip.date.getFullYear(),
          $scope.trip.date.getMonth(), $scope.trip.date.getDate(),
          $scope.trip.time.getHours(), $scope.trip.time.getMinutes());
        if ($scope.selectedCar !== '' && $scope.selectedGroup === '') {
          ApiService.getLastTrip($scope.selectedCar)
            .then(response => {
              if (response.trip === '') {
                const dataTrip = {
                  departureAddress:
                  $scope.trip.departureAddress.formatted_address,
                  arrivalAddress:
                  $scope.trip.arrivalAddress.formatted_address,
                  departureDate: datetime.getTime(),
                  carId: $scope.selectedCar,
                  intermediaryTrip: false
                };
                return ApiService.addTrip(dataTrip);
              } else { // eslint-disable-line no-else-return
                const dataTrip = {
                  departureAddress: response.trip.arrivalAddress,
                  arrivalAddress:
                  $scope.trip.departureAddress.formatted_address,
                  departureDate: new Date().getTime(),
                  carId: $scope.selectedCar,
                  intermediaryTrip: true
                };
                return ApiService.addTrip(dataTrip);
              }
            })
            .then(tripResponse => {
              $rootScope.modalInstance.close('close');
              if (tripResponse.trip.intermediaryTrip) {
                const intermediaryTripArrTime =
                  new Date(tripResponse.trip.departureDate).getTime() +
                  (tripResponse.trip.durationValue * 1000);
                let nextTripDepDate = '';
                if (intermediaryTripArrTime < datetime) {
                  nextTripDepDate = datetime.getTime();
                } else {
                  const delay = new Date(intermediaryTripArrTime -
                    datetime.getTime()).getTime();
                  nextTripDepDate =
                    new Date(datetime.getTime() + delay).getTime();
                }
                const dataTrip = {
                  departureAddress:
                  $scope.trip.departureAddress.formatted_address,
                  arrivalAddress:
                  $scope.trip.arrivalAddress.formatted_address,
                  departureDate: nextTripDepDate,
                  carId: $scope.selectedCar,
                  intermediaryTrip: false
                };
                ApiService.addTrip(dataTrip)
                  .then(() => {
                    console.log('trip successfully added');
                  })
                  .catch(err => console.log(err));
              }
              const carObj = {
                carId: $scope.selectedCar,
                used: true
              };
              return ApiService.updateUsedCar(carObj);
            })
            .then(() => {
              console.log('car used update successfull');
              $state.reload('mainpage');
            })
            .catch(err => {
              console.log(err);
            });
        } else if ($scope.selectedCar === '' && $scope.selectedGroup !== '') {
          let iterator = 0;
          ApiService.getLastGroupTrip({groupName: $scope.selectedGroup})
            .then(response => {
              const tempIntermediaryArrDate = [];
              // eslint-disable-next-line array-callback-return
              response.trips.map(trip => {
                iterator++;
                if (trip === null) {
                  if (iterator === response.trips.length) {
                    $rootScope.modalInstance.close('close');
                    const groupTrip = {
                      departureAddress:
                      $scope.trip.departureAddress.formatted_address,
                      arrivalAddress:
                      $scope.trip.arrivalAddress.formatted_address,
                      departureDate: datetime.getTime(),
                      groupName: $scope.selectedGroup,
                      intermediaryTrip: false
                    };
                    ApiService.addGroupTrip(groupTrip)
                      .then(() => {
                        return ApiService.updateGroupUsedCar(
                          {groupName: groupTrip.groupName});
                      })
                      .then(() => {
                        console.log('group used update successfull');
                        $state.reload('mainpage');
                      })
                      .catch(
                        err => console.log('error getting group trips client' +
                          err));
                  }
                } else {
                  const dataTrip = {
                    departureAddress: trip.arrivalAddress,
                    arrivalAddress:
                    $scope.trip.departureAddress.formatted_address,
                    departureDate: new Date().getTime(),
                    carId: trip.carId,
                    groupName: $scope.selectedGroup,
                    intermediaryTrip: true
                  };
                  ApiService.addTrip(dataTrip)
                    .then(tripResponse => {
                      $rootScope.modalInstance.close('close');
                      const intermediaryTripArrTime =
                        new Date(tripResponse.trip.departureDate).getTime() +
                        (tripResponse.trip.durationValue * 1000);
                      tempIntermediaryArrDate.push(intermediaryTripArrTime);
                      if (tempIntermediaryArrDate.length ===
                        response.trips.length) {
                        let nextTripDepDate = '';
                        const arrayMaxDate = Math.max.apply(null,
                          tempIntermediaryArrDate);
                        if (arrayMaxDate < datetime) {
                          nextTripDepDate = datetime.getTime();
                        } else {
                          const delay = new Date(arrayMaxDate -
                            datetime.getTime()).getTime();
                          nextTripDepDate =
                            new Date(datetime.getTime() + delay).getTime();
                        }
                        const groupTrip = {
                          departureAddress:
                          $scope.trip.departureAddress.formatted_address,
                          arrivalAddress:
                          $scope.trip.arrivalAddress.formatted_address,
                          departureDate: nextTripDepDate,
                          groupName: $scope.selectedGroup,
                          intermediaryTrip: false
                        };
                        ApiService.addGroupTrip(groupTrip)
                          .then(() => {
                            return ApiService.updateGroupUsedCar(
                              {groupName: groupTrip.groupName});
                          })
                          .then(() => {
                            console.log('group used update successfull');
                            $state.reload('mainpage');
                          })
                          .catch(err => console.log(
                            'error getting group trips client' + err));
                      }
                    })
                    .catch(err => {
                      console.log('error adding intermediary trip time' + err);
                    });
                }
              });
            });
        }
      };
      $scope.group = () => {
        $rootScope.modalInstance = $uibModal.open({
          templateUrl: 'components/main-page/views/newGroup-modal.view.html',
          scope: $scope,
          controller: 'MainPageCtrl',
          resolve: {
            scopeParent() {
              return $scope;
            },
            modalId() {
              return $scope.modalId;
            }
          }
        });
      };
      $scope.addGroup = groupName => {
        // eslint-disable-next-line array-callback-return
        $scope.selectedGroupCars.map(car => {
          ApiService.createGroup({
            groupName,
            carId: car._id
          })
            .then(() => {
              $rootScope.modalInstance.close('close');
              $state.reload('mainpage');
            })
            .catch(err => console.log(err));
        });
      };
      $scope.showGroup = group => {
        $scope.cars = [];
        $scope.groups.forEach(groupy => {
          groupy.show = group === groupy;
          if (groupy.show) {
            // eslint-disable-next-line no-negated-condition
            if (group.name !== 'All cars') {
              ApiService.getGroupCars({groupName: group.name})
                .then(responseCar => {
                  // eslint-disable-next-line array-callback-return
                  responseCar.cars.map(car => {
                    if (!car.used) {
                      car.maker = car.name;
                      car.ticked = false;
                      $scope.cars.push(car);
                    }
                  });
                  timeTravelled(responseCar.cars)
                    .then(() => {
                      $rootScope.$broadcast('initMap');
                      // eslint-disable-next-line array-callback-return
                      $scope.carTrips.map(carTrip => {
                        carTrip.tripMarker.setVisible(false);
                        carTrip.tripPolyline.setMap(null);
                      });
                    });
                })
                .catch(err => {
                  console.log(err);
                });
            } else {
              $state.reload('mainpage');
            }
          }
        });
      };

      $scope.dateOptions = {
        //  dateDisabled: disabled,
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
            scopeParent() {
              return $scope;
            },
            modalId() {
              return $scope.modalId;
            }
          }
        });
      };
      $scope.logoutModal = () => {
        LocalStorageService.removeLocalStorage();
        ApiService.logout();
        $state.go('login');
      };
      $scope.deleteCar = carId => {
        ApiService.deleteCar(carId)
          .then(() => {
            $state.reload('mainpage');
          })
          .catch(err => {
            console.log(err);
          });
      };
      $scope.deleteGroup = groupName => {
        ApiService.getGroupCars({groupName})
          .then(response => {
            // eslint-disable-next-line array-callback-return
            response.cars.map(car => {
              ApiService.deleteCar(car._id)
                .then(() => {
                  $state.reload('mainpage');
                })
                .catch(err => {
                  console.log(err);
                });
            });
          });
      };
      $scope.endTrip = carTrip => {
        ApiService.tripFinished({
          arrivalDate: carTrip.tripDepartureDate +
          (carTrip.tripDurationValue * 1000)
        }, carTrip.tripId)
          .then(() => {
            const carObj = {
              carId: carTrip._id,
              used: false
            };
            return ApiService.updateUsedCar(carObj);
          })
          .then(() => {
            displayCars();
            $state.reload('mainpage');
          })
          .catch(err => {
            console.log('error in tripFinished' + err);
          });
      };
      $scope.cancel = () => {
        $rootScope.modalInstance.close('close');
      };
    }]);
