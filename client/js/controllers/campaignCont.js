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

        $http.get('/getcampaigns').then(function(results){
            console.log(results.data);
            cc.campaigns=results.data.entries;
        });

        console.log("Trying....", cc.campaigns);
    }

    CampaignController.prototype.toggleOnStat=function(id){
        //...
    };

}());