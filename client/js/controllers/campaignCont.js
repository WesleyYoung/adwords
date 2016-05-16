/**
 * Created by Wesley on 4/20/2016.
 */
(function(){
    'use strict';

    angular.module('campaignController', [])
        .controller('campaignController', CampaignController);

    CampaignController.$inject = ["campaignService", "$http"];

    function CampaignController(campaignService, $http) {
        var cc = this;
        this.$http=$http;

        cc.campaigns=campaignService;


    }

    CampaignController.prototype.toggleOnStat=function(id){
        //...
    };

    CampaignController.prototype.getCampaigns=function(){
        var $http=this.$http;

        $http.get('/getcampaigns').then(function(results){
            console.log(results);
        })
    };

}());