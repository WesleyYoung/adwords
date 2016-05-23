/**
 * Created by wesleyyoung1 on 4/23/16.
 */
(function(){
    'use strict';

    angular.module('campaignViewController', [])
        .controller('campaignViewController', campaignViewController);

    campaignViewController.$inject = ["$http", "campaignService"];

    function campaignViewController($http, campaignService) {
        var cvc=this;


    }

}());