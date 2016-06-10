/**
 * Created by wesleyyoung1 on 4/23/16.
 */
(function(){
    'use strict';

    angular.module('campaignViewController', [])
        .controller('campaignViewController', campaignViewController);

    campaignViewController.$inject = ["$http", "adGroupService","campaignService", "$scope", "$location"];

    function campaignViewController($http, adGroupService, campaignService, $scope, $location) {
        var cvc = this;
        var id = $location.path().split("/")[$location.path().split("/").length - 1];

        adGroupService.onload(id);

        cvc.adGroupGrid = adGroupService.adGroupGrid;

        //If the grid data isn't undefined, it means we've already used the service and older data is still in the service.
        //This will prevent the older data from showing up before the newer data is loaded
        if(cvc.adGroupGrid.data!==undefined){cvc.adGroupGrid.data=undefined}

        $scope.isWaiting = adGroupService.isWaiting;
        $scope.toggleOnState = adGroupService.changeAdGroupStatus;

        if(id!=='all'){
            adGroupService.narrowAdGroups();
        }else{
            adGroupService.allAdGroups();
        }

        $scope.$watch(function () {
            return adGroupService.adGroupGrid.data;
        }, function (value) {
            cvc.adGroupGrid.data = value
        });

        $scope.$watch(function () {
            return adGroupService.isWaiting;
        }, function (value) {
            $scope.isWaiting = value;
        });

    }
}());

