/**
 * Created by Wesley on 4/20/2016.
 */
(function () {
    'use strict';

    angular.module('marketManager', [

        //Libraries
        'ui.router',
        'ngAnimate',
        'ngMaterial',
        'ngAria',
        'ngMessages',
        'ngRoute',
        "toaster",
        "chart.js",
        "ui.grid",
        "ui.grid.selection",
        "ui.grid.edit",
        "ui.grid.pagination",
        "ui.grid.resizeColumns",

        //Animations
        "slide",

        //Directives
        "campaignDirective",
        "adGroupDirective",
        "loadingScreenDirective",

        //Filters
        "long-date-filter",
        
        //Factories
        "leadFactory",

        //Services
        "planService",
        "campaignService",
        "adGroupService",

        //Controllers
        "navController",
        "campaignController",
        "campaignViewController",
        "ruleController",
        "recordController"
    ])

        .config(["$stateProvider", "$urlRouterProvider", "ChartJsProvider",
            function ($stateProvider, $urlRouterProvider, ChartJsProvider) {

                ChartJsProvider.setOptions({ colors : [ '#008AFF', '#008AFF', '#008AFF',  '#008AFF', '#008AFF', '#008AFF', '#008AFF'] });

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