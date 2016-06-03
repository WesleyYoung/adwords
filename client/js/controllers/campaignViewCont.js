/**
 * Created by wesleyyoung1 on 4/23/16.
 */
(function(){
    'use strict';

    angular.module('campaignViewController', [])
        .controller('campaignViewController', campaignViewController);

    campaignViewController.$inject = ["$http", "adGroupService","campaignService", "$scope", "$location"];

    function campaignViewController($http, adGroupService,campaignService, $scope, $location) {
        var cvc = this;
        var id = $location.path().split("/")[$location.path().split("/").length - 1];

        cvc.adGroupGrid = campaignService.adGroupGrid;

        cvc.campaignsById = campaignService.campaignsById;
        $scope.isWaiting = campaignService.isWaiting;
        $scope.toggleOnState = campaignService.changeAdGroupStatus;

        $scope.$watch(function () {
            return campaignService.adGroupGrid.data.filter(function(x){
                return x;
            });
        }, function (value) {
            cvc.adGroupGrid.data = value
        });

        $scope.$watch(function () {
            return campaignService.isWaiting;
        }, function (value) {
            $scope.isWaiting = value;
        });

        $scope.$watch(function () {
            return campaignService.campaignsById;
        }, function (value) {
            cvc.campaignsById = value;
        });
    }
}());

