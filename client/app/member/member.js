'use strict';

angular.module('calendarApp')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/members', {
        templateUrl: 'app/member/member.html',
        controller: 'MemberCtrl',
        // this is because we want to remove the success query param, without reloading the page
        reloadOnSearch: false
      });
  });
