'use strict';

angular.module('calendarApp')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/configuration', {
        templateUrl: 'app/configuration/configuration.html',
        controller: 'ConfigurationCtrl'
      });
  });