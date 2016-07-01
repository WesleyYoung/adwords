/**
 * Created by Wesley on 4/20/2016.
 */
(function(){
    'use strict';

    angular.module('recordController', [])
        .controller('recordController', recordController);

    recordController.$inject = ["$http", "$scope"];

    function recordController($http, $scope) {
        var rc = this;

        rc.getSpecificDay=getSpecificDay;

        rc.firstGraphLabels = [];
        rc.firstGraphData = [];

        rc.secondGraphLabels = [];
        rc.secondGraphData = [];

        rc.thirdGraphData = [];
        rc.thirdGraphLabels = [];


        $http.get('/leadData').then(function(results){
            console.log(results);
            var byDate = results.data.byDate,
                by15Monthly = results.data.by15Monthly;
            for(var i=0;i<byDate.length;i++){
                rc.firstGraphLabels.push(byDate[i].date);
                rc.firstGraphData.push(byDate[i].totalLeads);
            }
            for(var time in by15Monthly){
                rc.secondGraphLabels.push(time.replace(".", ":"));
                rc.secondGraphData.push(by15Monthly[time]);
            }
        })

        function getSpecificDay(day){
            rc.thirdGraphData = [];
            rc.thirdGraphLabels = [];
            $http.get('leadData').then(function(results){
                var data = results.data.byDate;
                for(var i=0;i<data.length;i++){
                    if(data[i].date==day){
                        for(var j=0;j<data[i].stats.length;j++){
                            rc.thirdGraphData.push(data[i].stats[j].leads);
                            rc.thirdGraphLabels.push(data[i].stats[j].quarter)
                        }
                        i=data.length;
                    }
                }
            })
        }


    }

}());