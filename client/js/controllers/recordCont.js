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
        rc.convertDate=convertDate;

        rc.searchDay=new Date("2016", "5", "2");

        rc.firstGraphLabels = [];
        rc.firstGraphData = [];

        rc.testFunc=function(){
            console.log("Hello!")
        }

        rc.secondGraphLabels = [];
        rc.secondGraphData = [];

        rc.thirdGraphData = [];
        rc.thirdGraphLabels = [];
        rc.thirdGraphTotals = 0;

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
            var found=false;
            $http.get('leadData').then(function(results){
                var data = results.data.byDate;
                for(var i=0;i<data.length;i++){
                    if(data[i].date==day){
                        found=true;
                        for(var j=0;j<data[i].stats.length;j++){
                            rc.thirdGraphData.push(data[i].stats[j].leads);
                            rc.thirdGraphLabels.push(data[i].stats[j].quarter)
                        }
                        rc.thirdGraphTotals=data[i].totalLeads;
                        i=data.length;
                    }
                }
            });
        }

        function convertDate(d){
            var yr=d.getFullYear(),
                mn=d.getMonth().length>1?(parseInt(d.getMonth())+1).toString():"0"+(parseInt(d.getMonth())+1).toString(),
                day=parseInt(d.getDate())>9?d.getDate():"0"+d.getDate();
            console.log( yr+"/"+mn+"/"+day);
            return yr+"/"+mn+"/"+day;
        }

        getSpecificDay(convertDate(rc.searchDay));
    }

}());