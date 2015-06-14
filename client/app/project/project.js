'use strict';

angular.module('calendarApp')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/projects', {
        templateUrl: 'app/project/project.html',
        controller: 'ProjectCtrl'
      });
  });
