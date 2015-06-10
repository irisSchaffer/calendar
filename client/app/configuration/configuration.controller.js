'use strict';

angular.module('calendarApp')
  .controller('ConfigurationCtrl', ['$scope', '$http', function ($scope, $http) {

    $scope.configuration = {};
    $scope.errors = {};

    $http.get('/api/configuration').success(function (configuration) {
      configuration.morning.start = new Date(configuration.morning.start);
      configuration.morning.end = new Date(configuration.morning.end);
      configuration.afternoon.start = new Date(configuration.afternoon.start);
      configuration.afternoon.end = new Date(configuration.afternoon.end);

      $scope.configuration = configuration;
    });

    $scope.update = function (form) {
      $scope.submitted = true;

      console.log($scope.configuration);

      if (form.$valid) {
        $http.put('/api/configuration', $scope.configuration)
          .success(function () {
            $scope.message = 'Configuration was updated successfully.';
          })
          .error(function (data) {
            $scope.errors = {};
            $scope.message = '';

            console.log(data.errors);

            // Update validity of form fields that match the mongoose errors
            angular.forEach(data.errors, function (error, field) {
              form[field].$setValidity('mongoose', false);
              $scope.errors[field] = error.message;
            });
          });
      }
    };
  }]);
