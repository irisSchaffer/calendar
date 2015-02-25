'use strict';

angular.module('calendarApp')
  .controller('ConfigurationCtrl', function ($scope, $http) {

    $scope.configuration = {};
    $scope.errors = {};

    $http.get('/api/configuration').success(function(configuration) {
      $scope.configuration = configuration;
    });

    $scope.update = function(configuration) {
      $scope.submitted = true;
      $scope.configuration = configuration;

      console.log(configuration.$valid);

      if(configuration.$valid) {
        $http.put('/api/configuration', configuration).
          success(function(data, status, headers, config) {
            $scope.errors = {};

            if (response.error) {
              angular.forEach(response.error.errors, function(error, field) {
                form[field].$setValidity('mongoose', false);
                $scope.errors[field] = error.message;
              });
            }
          });
      }
    };
  });
