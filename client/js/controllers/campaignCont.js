/**
 * Created by Wesley on 4/20/2016.
 */
(function(){
    'use strict';

    angular.module('campaignController', [])
        .controller('campaignController', CampaignController);

    CampaignController.$inject = ["campaignService", "$http", "$scope"];

    function CampaignController(campaignService, $http, $scope) {
        var cc = this;
        cc.$http = $http;
        cc.toggleOnState = campaignService.changeCampaignStatus;

        cc.campaignGrid = campaignService.campaignGrid;
        cc.campaigns = campaignService.campaigns;
        cc.campaignsById = campaignService.campaignsById;
        $scope.isWaiting = campaignService.isWaiting;

        console.log(cc.campaignsById);

        $scope.toggleOnState = cc.toggleOnState;

        $scope.$watch(function(){
            return campaignService.campaignGrid.data;
        }, function(value){
            cc.campaignGrid.data=value;
        });
        $scope.$watch(function(){
            return campaignService.isWaiting;
        }, function(value){
            $scope.isWaiting=value;
        })

    }

    CampaignController.prototype.getCampaigns=function(){
        console.log("Got here");
        var cc = this;
        var $http = cc.$http;
        $http.get('/getcampaigns').then(function(results){
            console.log(results.data);
            cc.campaigns=results.data.models;
            cc.campaignsById=results.data.byId;
            console.log(cc.campaignsById);
        });
    }

}());