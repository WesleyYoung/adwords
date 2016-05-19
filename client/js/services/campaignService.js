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

        cs.campaignGrid = {
            data: undefined,
            enableFiltering: true,
            enableFullRowSelection: true,
            showColumnFooter: true,
            columnDefs: [
                {field: 'status',
                    width: 70,
                    cellTemplate: `
                    <button class="campaign-status" ng-click="cc.toggleOnStat(row.entity.id)">
                        <i ng-if="row.entity.status=='ENABLED'" class="fa fa-toggle-on fa-2x" style="color: green;"></i>
                        <i ng-if="row.entity.status=='PAUSED'" class="fa fa-toggle-off fa-2x" style="color: grey;"></i>
                    </button>
                    `,
                    cellTooltip: function(row, col){
                        return "Use this to toggle the status of " + row.entity.name
                    }
                },
                {field: "name",
                    cellTooltip: function(row, col) {
                    return "Tool tip!";
                }}
            ],
            paginationPageSizes: [25, 50, 75],
            paginationPageSize: 25
        };

        getCampaigns().then(function(results){
            cs.campaignGrid.data = results;
        });

        function getCampaigns(){
            return $http.get('/getcampaigns').then(function(results){
                console.log(results.data);
                cs.campaigns=results.data.models;
                cs.campaignsById=results.data.byId;
                console.log(cs.campaignsById);
                return results.data.models;
            });
        }

    }
}());

