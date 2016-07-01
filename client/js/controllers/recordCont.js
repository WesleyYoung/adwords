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
        rc.specificInterval = "quarterly";

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

        function getSpecificDay(day, interval){
            rc.thirdGraphData = [];
            rc.thirdGraphLabels = [];
            var found=false;
            $http.get('leadData').then(function(results){
                var data = results.data.byDate;
                for(var i=0;i<data.length;i++){
                    if(data[i].date==day){
                        found=true;
                        var stats = interval=="quarterly"?data[i].stats:interval=="hourly"?convertToHourly(data[i].stats):convertToHalfHour(data[i].stats);
                        stats = fixTime(stats, interval);
                        for(var j=0;j<stats.length;j++){
                            rc.thirdGraphData.push(stats[j].leads);
                            rc.thirdGraphLabels.push(stats[j].time)
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
            return yr+"/"+mn+"/"+day;
        }

        function convertToHourly(stats){
            //console.log(stats);
            var output=[];
            for(var i=0;i<stats.length;i++){
                var hr = stats[i].time.split(":")[0];
                if(output[output.length-1]==undefined||output[output.length-1].time!==hr){
                    output.push({leads: stats[i].leads, time: hr})
                }else{
                    output[output.length-1].leads=parseInt(output[output.length-1].leads)+parseInt(stats[i].leads);
                }
            }

            return output;
        }

        function convertToHalfHour(stats){
            var output=[];
            for(var i=0;i<stats.length;i++){
                var hr = stats[i].time.split(":")[0],
                    hlf = stats[i].time.split(":")[1];
                if(output[output.length-1]==undefined||parseInt(hlf)==0||hlf=="30"){
                    output.push({leads: stats[i].leads, time: hr+":"+hlf})
                }else{
                    output[output.length-1].leads=parseInt(output[output.length-1].leads)+parseInt(stats[i].leads);
                }
            }
            return output;
        }

        function fixTime(stats, type){
            if(type=="hourly"){
                for(var i=0;i<stats.length;i++){
                    stats[i].time=parseInt(stats[i].time);
                    if(stats[i].time>12){
                        stats[i].time-=12;
                        stats[i].time+="pm"
                    }else if(stats[i].time==12){
                        stats[i].time+="pm"
                    }else{
                        stats[i].time+="am";
                    }
                }
            }else{
                for(var i=0;i<stats.length;i++){
                    var hr = parseInt(stats[i].time.split(":")[0]),
                        min = stats[i].time.split(":")[1],
                        ext = "";
                    if(hr>12){
                        hr-=12;
                        ext="pm"
                    }else if(hr==12){
                        ext="pm"
                    }else{
                        ext="am";
                    }
                    stats[i].time=hr+":"+min+ext;
                }
            }
            return stats;
        }

        getSpecificDay(convertDate(rc.searchDay), rc.specificInterval);
    }

}());