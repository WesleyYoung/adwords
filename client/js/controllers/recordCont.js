/**
 * Created by Wesley on 4/20/2016.
 */
(function(){
    'use strict';

    angular.module('recordController', [])
        .controller('recordController', recordController);

    recordController.$inject = ["$http", "$scope", "leadFactory"];

    function recordController($http, $scope, leadFactory) {
        var rc = this;

        rc.convertDate=leadFactory.convertDate;

        rc.firstGraphLabels = [];
        rc.firstGraphData = [
            [],
            []
        ];

        console.log(leadFactory.metaData());
            
        rc.firstGraphSeries=["1st Range", "2nd Range"];
        rc.compareRangesFirstDate = new Date("2016","5","1");
        rc.compareRangesFirstDate2=new Date();
        rc.compareRangesSecondDate = new Date("2016","5","15");
        rc.compareRangesSecondDate2=new Date();
        rc.rangeCompareLength="week";
        rc.compareInterval="halfhour";

        rc.searchRangeStart=new Date("2016","5","15");
        rc.searchRangeEnd=new Date("2016","5","20");
        rc.secondGraphLabels = [];
        rc.secondGraphData = [];
        rc.secondGraphTotals=0;
        rc.rangeInterval = "quarterly";

        rc.thirdGraphData = [];
        rc.thirdGraphLabels = [];
        rc.thirdGraphTotals = 0;
        rc.searchDay=new Date("2016", "5", "15");
        rc.specificInterval = "quarterly";
        
        rc.singleScroll=function(dir){
            var mod=dir=="next"?1:-1;
            rc.searchDay=new Date(rc.searchDay.getFullYear(), rc.searchDay.getMonth(), parseInt(rc.searchDay.getDate())+mod)
            rc.getSpecificDay(rc.convertDate(rc.searchDay), rc.specificInterval)
        };

        rc.compareRanges=function(first, second, type, interval){
            var modifier = type=="week"?7:type=="halfmonth"?14:30;
            rc.compareRangesFirstDate2=new Date(first.getFullYear(), first.getMonth(), (parseInt(first.getDate())+modifier));
            rc.compareRangesSecondDate2=new Date(second.getFullYear(), second.getMonth(), (parseInt(second.getDate())+modifier));
            var endDate1 = rc.convertDate(rc.compareRangesFirstDate2),
                endDate2 = rc.convertDate(rc.compareRangesSecondDate2);
            leadFactory.getSpecificRange(rc.convertDate(first), endDate1, interval).then(data=>{
                rc.firstGraphData[0]=data.data;
                rc.firstGraphLabels=data.labels;
                //console.log(data.labels);
                leadFactory.getSpecificRange(rc.convertDate(second), endDate2, interval).then(data2=>{
                    rc.firstGraphData[1]=data2.data;
                    console.log(data2.data.length==data.data.length);
                })
            });
        };

        rc.getSpecificRange=function(start, end, type) {
            leadFactory.getSpecificRange(start, end, type).then(data=> {
                rc.secondGraphData = data.data;
                rc.secondGraphLabels = data.labels;
                rc.secondGraphTotals = data.total;
            });
        };

        rc.getSpecificDay=function(day, interval){
            leadFactory.getSpecificDay(day, interval).then(data=>{
                rc.thirdGraphData=data.data;
                rc.thirdGraphLabels=data.labels;
                rc.thirdGraphTotals=data.total;
            });
        };

        $scope.labels = ["January", "February", "March", "April", "May", "June", "July"];
        $scope.series = ['Series A', 'Series B'];
        $scope.data = [
            [65, 59, 80, 81, 56, 55, 40],
            [28, 48, 40, 19, 86, 27, 90]
        ];
        $scope.onClick = function (points, evt) {
            console.log(points, evt);
        };
        $scope.datasetOverride = [{ yAxisID: 'y-axis-1' }, { yAxisID: 'y-axis-2' }];

        rc.lineGraphOptions = {
            scales: {
                yAxes: [
                    {
                        id: 'y-axis-1',
                        type: 'linear',
                        display: true,
                        position: 'left'
                    },
                    {
                        id: 'y-axis-2',
                        type: 'linear',
                        display: true,
                        position: 'right'
                    }
                ]
            }
        };

        rc.getSpecificDay(rc.convertDate(rc.searchDay), rc.specificInterval);
        rc.getSpecificRange(rc.convertDate(rc.searchRangeStart),rc.convertDate(rc.searchRangeEnd), 'quarterly');
        rc.compareRanges(rc.compareRangesFirstDate, rc.compareRangesSecondDate, rc.rangeCompareLength, rc.compareInterval)
    }

}());