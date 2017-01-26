/**
 * Created by simonthome on 23/12/2016.
 */
'use strict';

angular.module('starter')
  .factory('ApiService',
  ['LocalStorageService', '$q', '$http', 'ApiUrl', '$window',
    // eslint-disable-next-line max-params
    function (LocalStorageService, $q, $http, ApiUrl, $window) {
      let authenticated = false;
      let currentToken = '';
      const tokenHeader = token => {
        authenticated = true;
        currentToken = token;
        $http.defaults.headers.common.Authorization = currentToken;
      };
      const saveToken = token => {
        // eslint-disable-next-line no-negated-condition
        if (typeof (Storage) !== 'undefined') {
          $window.localStorage.setItem('token', JSON.stringify(token));
        } else {
          console.log('browser does not support local storage');
        }
      };
      const getToken = () => {
        const deferred = $q.defer();
        const token = JSON.parse($window.localStorage.getItem('token'));
        if (token !== null) {
          tokenHeader(token);
        }
        deferred.resolve(token);
        return deferred.promise;
      };
      const isLoggedIn = () => {
        const deferred = $q.defer();
        getToken()
            .then(() => {
              deferred.resolve(authenticated);
            });
        return deferred.promise;
      };
      const login = account => {
        return $q((resolve, reject) => {
          $http.post(ApiUrl.url + '/login', account)
              .then(response => {
                if (response.data.success) {
                  resolve(response.data);
                } else {
                  reject();
                }
              })
              .catch(err => {
                console.log('error login in ' + err);
              });
        });
      };
      const logout = () => {
        authenticated = false;
        currentToken = '';
      };
      const register = account => {
        return $q((resolve, reject) => {
          $http.put(ApiUrl.url + '/register', account)
              .then(response => {
                if (response.data.success) {
                  resolve(response.data);
                } else {
                  reject();
                }
              })
              .catch(err => {
                console.log('error register ' + err);
              });
        });
      };
      const getCars = () => {
        return $q((resolve, reject) => {
          $http.get(ApiUrl.url + '/car', {handleError: true})
              .then(response => {
                if (response.data.success) {
                  resolve(response.data);
                } else {
                  reject();
                }
              })
              .catch(err => {
                console.log('error getting cars ' + err);
              });
        });
      };
      const addCar = car => {
        return $q((resolve, reject) => {
          $http.put(ApiUrl.url + '/car', car)
              .then(response => {
                if (response.data.success) {
                  resolve(response.data);
                } else {
                  reject();
                }
              })
              .catch(err => {
                console.log('error login in ' + err);
              });
        });
      };
      const addTrip = trip => {
        return $q((resolve, reject) => {
          $http.put(ApiUrl.url + '/trip', trip)
              .then(response => {
                if (response.data.success) {
                  resolve(response.data);
                } else {
                  reject();
                }
              })
              .catch(err => {
                console.log('error put trip' + err);
              });
        });
      };
      const addGroupTrip = trip => {
        return $q((resolve, reject) => {
          $http.put(ApiUrl.url + '/trip/group', trip)
              .then(response => {
                if (response.data.success) {
                  resolve(response.data);
                } else {
                  reject();
                }
              })
              .catch(err => {
                console.log('error put trip' + err);
              });
        });
      };
      const getCar = id => {
        return $q((resolve, reject) => {
          $http.get(ApiUrl.url + '/trip/' + id)
              .then(response => {
                if (response.data.success) {
                  resolve(response.data);
                } else {
                  reject();
                }
              })
              .catch(err => {
                console.log('error get car' + err);
              });
        });
      };
      const getCarTrip = carId => {
        return $q((resolve, reject) => {
          $http.get(ApiUrl.url + '/trip/car/' + carId)
              .then(response => {
                if (response.data.success) {
                  resolve(response.data);
                } else {
                  reject();
                }
              })
              .catch(err => {
                console.log('error get trip car' + err);
              });
        });
      };
      const tripFinished = (date, tripId) => {
        console.log(date.arrivalDate);
        return $q((resolve, reject) => {
          $http.patch(ApiUrl.url + '/trip/' + tripId, date)
              .then(response => {
                if (response.data.success) {
                  resolve(response.data);
                } else {
                  reject();
                }
              })
              .catch(err => {
                console.log('error get trip car' + err);
              });
        });
      };
      const updateUsedCar = car => {
        return $q((resolve, reject) => {
          $http.patch(ApiUrl.url + '/car/' + car.carId, car)
              .then(response => {
                if (response.data.success) {
                  resolve(response.data);
                } else {
                  reject();
                }
              })
              .catch(err => {
                console.log('error get trip car' + err);
              });
        });
      };
      const updateGroupUsedCar = groupName => {
        return $q((resolve, reject) => {
          $http.patch(ApiUrl.url + '/group', groupName)
              .then(response => {
                if (response.data.success) {
                  resolve(response.data);
                } else {
                  reject();
                }
              })
              .catch(err => {
                console.log('error get trip car' + err);
              });
        });
      };
      const deleteCar = carId => {
        return $q((resolve, reject) => {
          $http.delete(ApiUrl.url + '/car/' + carId)
              .then(response => {
                if (response.data.success) {
                  resolve(response.data);
                } else {
                  reject();
                }
              })
              .catch(err => {
                console.log('error delete car' + err);
              });
        });
      };
      const createGroup = groupObj => {
        return $q((resolve, reject) => {
          $http.patch(ApiUrl.url + '/group/' + groupObj.carId, groupObj)
              .then(response => {
                if (response.data.success) {
                  resolve(response.data);
                } else {
                  reject();
                }
              })
              .catch(err => {
                console.log('error creating group' + err);
              });
        });
      };
      const getGroupCars = groupName => {
        return $q((resolve, reject) => {
          $http.post(ApiUrl.url + '/group', groupName)
              .then(response => {
                if (response.data.success) {
                  resolve(response.data);
                } else {
                  reject();
                }
              })
              .catch(err => {
                console.log('error creating group' + err);
              });
        });
      };
      const getLastTrip = carId => {
        return $q((resolve, reject) => {
          $http.get(ApiUrl.url + '/trip/last/' + carId)
              .then(response => {
                if (response.data.success) {
                  resolve(response.data);
                } else {
                  reject();
                }
              })
              .catch(err => {
                console.log('error creating group' + err);
              });
        });
      };
      const getLastGroupTrip = groupName => {
        return $q((resolve, reject) => {
          $http.post(ApiUrl.url + '/trip/last/', groupName)
              .then(response => {
                if (response.data.success) {
                  resolve(response.data);
                } else {
                  reject();
                }
              })
              .catch(err => {
                console.log('error creating group' + err);
              });
        });
      };
      return {
        login,
        register,
        getCars,
        saveToken,
        getToken,
        isLoggedIn,
        addCar,
        addTrip,
        addGroupTrip,
        getCar,
        getCarTrip,
        tripFinished,
        updateUsedCar,
        updateGroupUsedCar,
        logout,
        deleteCar,
        createGroup,
        getGroupCars,
        getLastTrip,
        getLastGroupTrip
      };
    }]);
