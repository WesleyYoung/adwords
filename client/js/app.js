/**
 * Created by Wesley on 4/20/2016.
 */
(function(){
    'use strict';

    angular.module('marketManager', [
        "ui.router",
        "navController",
        "ngAnimate",
        "slide",
        "campaignDirective",
        "adGroupDirective",
        "planService",
        "campaignService",
        "adGroupService",
        "campaignController",
        "campaignViewController",
        "ruleController",
        "recordController",
        "ui.grid",
        "ui.grid.selection",
        "ui.grid.edit",
        "ui.grid.pagination",
        "ui.grid.resizeColumns",
        "toaster"
    ])

        .config(["$stateProvider", "$urlRouterProvider",
            function ($stateProvider, $urlRouterProvider) {

                // App States (pages)
                $stateProvider
                    .state("campaigns", {
                        url: "/campaigns",
                        templateUrl: "views/campaigns.html",
                        controller: "campaignController as cc"
                    })
                    .state("campaignView", {
                        url: "/campaignView/:id",
                        templateUrl: "views/campaignView.html",
                        controller: "campaignViewController as cvc"
                    })
                    .state("rules", {
                        url: "/rules",
                        templateUrl: "views/ruleEditor.html",
                        controller: "ruleController as rc"
                    })
                    .state("records", {
                        url: "/records",
                        templateUrl: "views/records.html",
                        controller: "recordController as rc"
                    });

                // If none of the above states are matched, use the 'campaigns' page as a fallback
                $urlRouterProvider.otherwise("/campaigns");
            }]);
}());