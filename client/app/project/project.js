'use strict';

angular.module('calendarApp')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/project', {
        templateUrl: 'app/project/project.html',
        controller: 'ProjectCtrl'
      });
  });
