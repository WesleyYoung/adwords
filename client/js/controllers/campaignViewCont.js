/**
 * Created by wesleyyoung1 on 4/23/16.
 */
(function(){
    'use strict';

    angular.module('campaignViewController', [])
        .controller('campaignViewController', campaignViewController);

    campaignViewController.$inject = ["$http", "campaignService", "$scope"];

    function campaignViewController($http, campaignService, $scope) {
        var cvc=this;

        cvc.adGroupGrid = campaignService.adGroupGrid;
        $scope.isWaiting = campaignService.isWaiting;
        $scope.toggleOnState = campaignService.changeAdGroupStatus;

        $scope.$watch(function(){
            return campaignService.adGroupGrid.data;
        }, function(value){
            cvc.adGroupGrid.data = value;
        });

        $scope.$watch(function(){
            return campaignService.isWaiting;
        }, function(value){
            $scope.isWaiting=value;
        })

    }

}());