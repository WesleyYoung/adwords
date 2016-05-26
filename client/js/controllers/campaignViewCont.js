/**
 * Created by wesleyyoung1 on 4/23/16.
 */
(function(){
    'use strict';

    angular.module('campaignViewController', [])
        .controller('campaignViewController', campaignViewController);

    campaignViewController.$inject = ["$http", "campaignService", "$scope", "$location"];

    function campaignViewController($http, campaignService, $scope, $location) {
        var cvc = this;
        var id = $location.path().split("/")[$location.path().split("/").length - 1];

        cvc.adGroupGrid = campaignService.adGroupGrid;

        cvc.campaignsById = campaignService.campaignsById;
        $scope.isWaiting = campaignService.isWaiting;
        $scope.toggleOnState = campaignService.changeAdGroupStatus;

        $scope.$watch(function () {
            return campaignService.adGroupGrid.data;
        }, function (value) {
            if(id=="all"){
                cvc.adGroupGrid.data = value
            }else{
                if(value!==undefined){
                    var output = [];
                    for(var i=0;i<value.length;i++){
                        if(value[i].campaignId==id){
                            output.push(value[i])
                        }
                    }
                    cvc.adGroupGrid.data = output;
                }else{
                    cvc.adGroupGrid.data = value
                }
            }
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

