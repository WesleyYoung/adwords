/**
 * Created by Wesley on 4/20/2016.
 */
(function(){
    'use strict';

    angular.module('recordController', [])
        .controller('recordController', recordController);

    recordController.$inject = ["$http", "$scope", "leadFactory", "$timeout"];

    function recordController($http, $scope, leadFactory, $timeout) {
        var rc = this;

        function randomColorNumb(){
            return Math.floor((Math.random()*255)+1);
        }

        rc.convertDate=leadFactory.convertDate;

        rc.isLoading=true;

        $timeout(function(){
            rc.isLoading=false;
        }, 1500);
        
        //These need to become The objects for each graph
        rc.graphA ={
            data: [],
            makeup: [],
            labels: [],
            totals: 0,
            types: ["chart-bar", "chart-doughnut"],
            type: "chart-bar",
            onclick: function(data, event){
                if(data[0]!==undefined){
                    console.log(data);
                    var label = data[0]._model.label,
                        chartData=this.chartData,
                        labels = data[0]._xScale.ticks,
                        value;
                    for(var i=0;i<labels.length;i++){
                        if(label==labels[i]){
                            value=chartData[i];
                        }
                    }
                    console.log(label, value)
                }
            },
            options: {
                scales: {
                    yAxes: [
                        {
                            id: 'y-axis-1',
                            type: 'linear',
                            display: true,
                            position: 'left',
                            scaleLabel: {
                                display: false,
                                labelString: "Leads"
                            }
                        },
                        {
                            id: 'y-axis-2',
                            type: 'linear',
                            display: true,
                            position: 'right'
                        }
                    ]
                }
            },
            datasetOverride: [
            {
                label: "Bar chart",
                borderWidth: 1,
                type: 'bar'
                //borderColor: "rgba("+randomColorNumb()+","+randomColorNumb()+","+randomColorNumb()+",1)",
                //backgroundColor: "rgba("+randomColorNumb()+","+randomColorNumb()+","+randomColorNumb()+",1)"
            }
            //{
            //    label: "Line chart",
            //    borderWidth: 3,
            //    hoverBackgroundColor: "rgba(255,99,132,0.4)",
            //    hoverBorderColor: "rgba(255,99,132,1)",
            //    borderColor: "rgba(255,0,0,1)",
            //    type: 'line'
            //}
        ]
        };
        rc.getSpecificDay=function(day, interval){
            leadFactory.getSpecificDay(day, interval).then(data=>{
                //$scope.$apply(function(){
                //console.log(data.contacted);
                rc.graphA.data=data.data;
                //rc.graphA.data[1]=data.contacted;
                rc.graphA.labels=data.labels;
                rc.graphA.totals=data.total;
                rc.graphA.makeup=data.makeup;
                //})
            });
        };

        
        rc.firstGraph={
            data: [
                [],
                []
            ],
            labels: [],
            series: []
        };
        
        rc.secondGraph={
            data: [],
            labels: [],
            series: [],
            searchDates: {
                start: new Date("2016","5","1"),
                end: new Date("2016","5","15")
            }
        };

        rc.firstGraphLabels = [];
        rc.firstGraphData = [
            [],
            []
        ];

        leadFactory.getMetaData().then(data=>{
            rc.metaMinDate=new Date(data.minDate);
            rc.metaMaxDate=new Date(data.maxDate);
        });
            
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
            var newDate=new Date(rc.searchDay.getFullYear(), rc.searchDay.getMonth(), parseInt(rc.searchDay.getDate())+mod);
            if (dir=='next'&&newDate/1000<=rc.metaMaxDate/1000||dir=='prev'&&newDate/1000>=rc.metaMinDate/1000){
                rc.searchDay=newDate;
                rc.getSpecificDay(rc.convertDate(rc.searchDay), rc.specificInterval)
            }
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
        //rc.getSpecificRange(rc.convertDate(rc.searchRangeStart),rc.convertDate(rc.searchRangeEnd), 'quarterly');
        //rc.compareRanges(rc.compareRangesFirstDate, rc.compareRangesSecondDate, rc.rangeCompareLength, rc.compareInterval)
    }

}());