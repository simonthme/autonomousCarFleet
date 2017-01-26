/**
 * Created by simonthome on 23/12/2016.
 */
'use strict';

angular.module('starter').service('LocalStorageService',
  ['$q', '$window', function ($q, $window) {
    const saveUser = user => {
      // eslint-disable-next-line no-negated-condition
      if (typeof (Storage) !== 'undefined') {
        $window.localStorage.setItem('user', JSON.stringify(user));
      } else {
        console.log('browser does not support local storage');
      }
    };
    const getUser = () => {
      const deffered = $q.defer();
      // eslint-disable-next-line no-negated-condition
      if (typeof (Storage) !== 'undefined') {
        const user = JSON.parse($window.localStorage.getItem('user'));
        // eslint-disable-next-line no-negated-condition
        if (user !== null) {
          deffered.resolve(user);
        } else {
          console.log('error getting user null');
          deffered.reject();
        }
      } else {
        console.log('browser does not support local storage');
      }
      return deffered.promise;
    };
    const removeLocalStorage = () => {
      // eslint-disable-next-line no-negated-condition
      if (typeof (Storage) !== 'undefined') {
        $window.localStorage.removeItem('user');
        $window.localStorage.removeItem('token');
      } else {
        console.log('browser does not support local storage, data not removed');
      }
    };
    return {
      saveUser,
      getUser,
      removeLocalStorage
    };
  }]);
