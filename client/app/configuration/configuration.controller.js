'use strict';

angular.module('calendarApp')
  .controller('ConfigurationCtrl', function ($scope, $http) {

    $scope.configuration = {};
    $scope.errors = {};

    $http.get('/api/configuration').success(function (configuration) {
      $scope.configuration = configuration;
    });

    $scope.update = function (form) {
      $scope.submitted = true;

      if (form.$valid) {
        $http.put('/api/configuration', $scope.configuration)
          .success(function () {
            $scope.message = 'Configuration was updated successfully';
          })
          .error(function (data) {
            $scope.errors = {};
            $scope.message = '';

            // Update validity of form fields that match the mongoose errors
            angular.forEach(data.errors, function (error, field) {
              form[field].$setValidity('mongoose', false);
              $scope.errors[field] = error.message;
            });
          });
      }
    };
  });
