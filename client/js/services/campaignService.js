/**
 * Created by Wesley on 4/20/2016.
 */
(function(){
    'use strict';

    //ui-sref="/campaignView/{{row.entity.id}}"

    angular.module('campaignService', [])
        .service('campaignService', CampaignService);

    CampaignService.$inject = ["$http", "toaster"];

    function CampaignService($http, toaster) {
        var cs = this;
        cs.$http=$http;

        //var socket = io.connect('http://192.168.75.41:3343');

        //socket.on('campaignretrieve', function(data){
        //    console.log("Campaigns retrieved!");
        //    cs.campaigns=data.models;
        //    cs.campaignsById=data.byId;
        //    cs.campaignGrid.data = data.models;
        //});

        cs.changeCampaignStatus=changeCampaignStatus;

        cs.isWaiting=false;

        cs.campaignGrid = {
            data: undefined,
            enableFiltering: true,
            enableFullRowSelection: true,
            showColumnFooter: true,
            columnDefs: [
                {field: 'status',
                    maxWidth: 70,
                    cellTemplate: `
                    <button class="campaign-cell">
                        <i ng-if="row.entity.status=='ENABLED'&&!grid.appScope.isWaiting" ng-click="grid.appScope.toggleOnState(row.entity.id)" class="fa fa-toggle-on fa-2x" style="color: green;"></i>
                        <i ng-if="row.entity.status=='PAUSED'&&!grid.appScope.isWaiting" ng-click="grid.appScope.toggleOnState(row.entity.id)" class="fa fa-toggle-off fa-2x" style="color: grey;"></i>
                        <i ng-if="grid.appScope.isWaiting" class="fa fa-spinner fa-pulse fa-2x fa-fw"></i>
                    </button>
                    `,
                    cellTooltip: function(row, col){
                        return "Use this to toggle the status of " + row.entity.name
                    },
                    filter: {
                        selectOptions: [
                            {value: 1, label: 'ENABLED'},
                            {value: 2, label: "PAUSED"}
                        ]
                    }
                },
                {field: "name",
                    cellTemplate: `
                    <span class="campaign-cell" style="margin-left: 10px; margin-top: 10px !important;">
                        <a class="campaign-cell"  href="#/campaignView/{{row.entity.id}}" style="color: black">{{row.entity.name}}</a>
                    </span>
                    `,
                    cellTooltip: function(row, col) {
                    return "Tool tip!";
                    }
                }
            ],
            paginationPageSizes: [25, 50, 75],
            paginationPageSize: 25
        };

        cs.adGroupGrid={
            data: undefined,
            enableFiltering: true,
            enableFullRowSelection: true,
            showColumnFooter: true,
            columnDefs: [
                {field: "status"},
                {field: "name"},
                {field: "campaignName"}
            ],
            paginationPageSizes: [25, 50, 75],
            paginationPageSize: 25
        };

        getCampaigns().then(function(results){
            cs.campaignGrid.data = results.models;
            cs.campaigns=results.models;
            cs.campaignsById=results.byId;
        });

        function getCampaigns(){
            return $http.get('/getcampaigns').then(function(results){
                console.log(results.data);
                return results.data;
            });
        }

        function changeCampaignStatus(id){
            console.log("Got here");
            cs.isWaiting=true;
            var toStatus;
            cs.campaignsById[id].status=="PAUSED"?toStatus="ENABLED":toStatus="PAUSED";
            $http.post('/changecampaignstatus',{
                id: id,
                toStatus: toStatus
            }).then(function(response){
                if(response.data.error){
                    console.log(response.data.error);
                    cs.isWaiting=false;
                    toaster.pop('error', "There was an error!", response.data.error)

                }else{
                    console.log(response.data.message);
                    cs.campaignGrid.data=response.data.newCampaignSet.models;
                    cs.campaigns=response.data.newCampaignSet.models;
                    cs.campaignsById=response.data.newCampaignSet.byId;
                    cs.isWaiting=false;
                    toaster.pop('success', "Success!", response.data.message)
                }
            })
        }

    }
}());

