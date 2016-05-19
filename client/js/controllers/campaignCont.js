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

        cc.campaignGrid = campaignService.campaignGrid;

    }

    CampaignController.prototype.toggleOnStat=function(id){
        var cc = this;
        var $http = cc.$http;
        var toStatus;
        cc.campaignsById[id].status=="PAUSED"?toStatus="ENABLED":toStatus="PAUSED";
        $http.post('/changecampaignstatus',{
            id: id,
            toStatus: toStatus
        }).then(function(response){
            console.log(response.data.message);
            cc.getCampaigns();//
        })
    };

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