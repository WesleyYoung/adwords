/**
 * Created by wesleyyoung1 on 6/3/16.
 */
(function(){
    'use strict';

    angular.module('adGroupService', [])
    .service('adGroupService', AdGroupService);

    AdGroupService.$inject=['$http', 'toaster', "$location"];

    function AdGroupService($http, toaster, $location){
        var ags = this;

        var campaignId = $location.path().split("/")[$location.path().split("/").length - 1];

        ags.isWaiting=false;

        ags.changeAdGroupStatus=changeAdGroupStatus;
        ags.narrowAdGroups=narrowAdGroups;
        ags.allAdGroups=allAdGroups;
        ags.onload = onload;

        ags.adGroupGrid={
            data: undefined,
            enableFiltering: true,
            enableFullRowSelection: true,
            showColumnFooter: true,
            columnDefs: [
                {
                    field: "status",
                    maxWidth: 70,
                    cellTemplate: `
                    <button class="campaign-cell">
                        <i ng-if="row.entity.status=='ENABLED'&&!grid.appScope.isWaiting" ng-click="grid.appScope.toggleOnState(row.entity.id)" class="fa fa-toggle-on fa-2x" style="color: green;"></i>
                        <i ng-if="row.entity.status=='PAUSED'&&!grid.appScope.isWaiting" ng-click="grid.appScope.toggleOnState(row.entity.id)" class="fa fa-toggle-off fa-2x" style="color: grey;"></i>
                        <div ng-if="grid.appScope.isWaiting" layout="row" layout-sm="column" layout-align="space-around"><md-progress-circular  md-mode="indeterminate" class="md-warn md-hue-3" md-diameter="25px"></md-progress-circular></div>
                    </button>
                    `
                },
                {
                    field: "name",
                    width: 250
                },
                {
                    field: "campaignName",
                    name: "Campaign"
                }
            ],
            paginationPageSizes: [25, 50, 75],
            paginationPageSize: 25
        };

        function changeAdGroupStatus(id){
            console.log("Got here");
            ags.isWaiting=true;
            var toStatus;
            var isWaiting = true;
            ags.adGroupsById[id].status=="PAUSED"?toStatus="ENABLED":toStatus="PAUSED";
            setTimeout(function(){
                if(isWaiting){
                    console.log("Response is taking a long time.");
                    toaster.pop('warning', "Waiting for response...", "The request has taken more than 30 seconds, if it doesn't get resolved please go make the requested change within AdWords");
                }
            }, 30000);
            $http.post('/changeadgroupstatus',{
                id: id,
                toStatus: toStatus
            }).then(function(response){
                if(response.data.error){
                    console.log(response.data.error);
                    ags.isWaiting=false;
                    toaster.pop('error', "There was an error!", response.data.error)

                }else{
                    console.log(response.data.message);
                    if(id!=='all'){
                        ags.adGroupGrid.data=response.data.newAdGroupSet.models.filter(function(ag){
                            return ag.campaignId==campaignId;
                        });
                    }else{
                        ags.adGroupGrid.data=response.data.newAdGroupSet.models
                    }
                    ags.adGroups=response.data.newAdGroupSet.models;
                    ags.adGroupsById=response.data.newAdGroupSet.byId;
                    ags.isWaiting=false;
                    toaster.pop('success', "Success!", response.data.message)
                }
            });
        }

        function allAdGroups(){
            getAdWordsData().then(function(results){
                if(results.error){
                    toaster.pop('error', 'There was an error processing your request: ', results.error)
                }else{
                    ags.adGroupGrid.data = results.adGroups.models;
                    ags.adGroups=results.adGroups.models;
                    ags.adGroupsById=results.adGroups.byId;
                }
            });
        }


        function getAdWordsData(){
            //return $http.get('/getcampaigns').then(function(campaignResults){
                //console.log(campaignResults.data);
                return $http.get('/getadgroups').then(function(adGroupResults){
                    return {adGroups: adGroupResults.data}
                });
            //});
        }

        function narrowAdGroups(){
            getAdWordsData().then(function(results){
                if(results.error){
                    toaster.pop('error', 'There was an error processing your request: ', results.error)
                }else{
                    ags.adGroupGrid.data = results.adGroups.models.filter(function(ag){
                        return ag.campaignId==campaignId;
                    });
                    ags.adGroups=results.adGroups.models;
                    ags.adGroupsById=results.adGroups.byId;
                }
            });
        }

        function onload(id){
            campaignId=id;
        }

    }

})();