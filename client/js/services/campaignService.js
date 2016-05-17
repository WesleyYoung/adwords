/**
 * Created by Wesley on 4/20/2016.
 */
(function(){
    'use strict';

    angular.module('campaignService', [])
        .service('campaignService', CampaignService);

    CampaignService.$inject = ["$http"];

    function CampaignService($http) {
        var cs = this;
        cs.$http=$http;


    }
}());

