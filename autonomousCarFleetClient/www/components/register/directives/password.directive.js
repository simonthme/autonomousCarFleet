/**
 * Created by simonthome on 24/12/2016.
 */
'use strict';
angular.module('starter.register').directive('compareTo', [function () {
	return {
		require: 'ngModel',
		scope: {
			otherModelValue: '=compareTo'
		},
		link: function (scope, element, attributes, ngModel) {
			ngModel.$validators.compareTo = function (modelValue) {
				return modelValue === scope.otherModelValue;
			};
			scope.$watch('otherModelValue', function () {
				ngModel.$validate();
			});
		}
	};
}]);
