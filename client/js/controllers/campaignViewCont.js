/**
 * Created by wesleyyoung1 on 4/23/16.
 */
(function(){
    'use strict';

    angular.module('campaignViewController', [])
        .controller('campaignViewController', campaignViewController);

    campaignViewController.$inject = ["campaignService"];

    function campaignViewController(campaignService) {
        var cvc=this;

    }

}());