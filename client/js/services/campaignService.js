/**
 * Created by Wesley on 4/20/2016.
 */
(function(){
    'use strict';

    angular.module('campaignService', [])
        .service('campaignService', campaignService);

    campaignService.$inject = ["$http"];

    function campaignService($http) {
        var cs = this;

        var testCampaigns=[
            {status: "Enabled", name: "Finch bask.com Search", cost: "$356.48", clicks: 692, CPL: "$4.24", id: "123"},
            {status: "Paused", name: "**AOL Support-New-SCM", cost: "$28.89", clicks: 92, CPL: "$3.61", id: "456"}
        ];

        return testCampaigns;
    }

}());