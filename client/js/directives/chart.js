/**
 * Created by i97143 on 7/5/2016.
 */
(function(){
    'use strict';

    angular.module('reportChart',[])
        .directive('reportChart', reportChart);

    reportChart.$inject=[];

    function reportChart(){

        return {
            restrict: "AE",
            scope: {
                chartInfo: "=chartInfo",
                chartType: "=chartType",
                metaData: "=metaData"
            },
            template: `
            <md-content class="">
                <md-toolbar class="md-primary">
                    <h2 class="md-toolbar-tools">
                        <p>{{chartInfo.title}}</p>
                    </h2>
                </md-toolbar>
                <div layout="row">
                    
                    <md-datepicker class="" md-min-date="metaData.minDate" md-max-date="metaData.maxDate" flex md-open-on-focus ng-model="rc.searchDay" md-placeholder="Please choose a date"></md-datepicker>
                        <md-button  style="width: 200px" class="md-raised md-primary" ng-click="rc.getSpecificDay(rc.convertDate(rc.searchDay), rc.specificInterval)">Submit</md-button>
                        <span flex></span>
                            <md-button class="md-raised md-accent" ng-click="rc.singleScroll('prev')">< Prev</md-button>
                                <md-button class="md-raised md-warn" ng-click="rc.singleScroll('next')">Next ></md-button>
                </div>

                <canvas id="bar3" class="chart chart-bar" chart-data="rc.thirdGraphData" chart-labels="rc.thirdGraphLabels" chart-series="'Leads'" chart-colors="rc.graphColors"></canvas>
                <md-toolbar class="md-primary">
                    <h2 class="md-toolbar-tools">
                    <span>Total leads {{rc.thirdGraphTotals}}</span>
                    <span flex></span>
                    <md-radio-group layout="row" ng-model="rc.specificInterval">
                        <md-radio-button value="quarterly" class="md-accent" ng-click="rc.getSpecificDay(rc.convertDate(rc.searchDay), 'quarterly')">Quarterly</md-radio-button>
                        <md-radio-button value="halfhour" class="md-warn" ng-click="rc.getSpecificDay(rc.convertDate(rc.searchDay), 'halfhour')">1/2 Hour</md-radio-button>
                        <md-radio-button value="hourly" ng-click="rc.getSpecificDay(rc.convertDate(rc.searchDay), 'hourly')">Hourly</md-radio-button>
                    </md-radio-group>
                    </h2>
                </md-toolbar>
            </md-content>
            `
        }
    }

})();