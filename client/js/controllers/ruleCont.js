/**
 * Created by Wesley on 4/20/2016.
 */
(function(){
    'use strict';

    angular.module('ruleController', [])
        .controller('ruleController', ruleController);

    ruleController.$inject = [];

    function ruleController() {
        var rc = this;
        var date = new Date();

        var days = [{
                totalHours: 9,
                shiftHours: "8am-5pm",
                day: "Sunday"
            },{
                totalHours: 12,
                shiftHours: "7am-7pm",
                day: "Monday"
            },{
                totalHours: 12,
                shiftHours: "7am-7pm",
                day: "Tuesday"
            },{
                totalHours: 12,
                shiftHours: "7am-7pm",
                day: "Wednesday"
            },{
                totalHours: 12,
                shiftHours: "7am-7pm",
                day: "Thursday"
            },{
                totalHours: 10,
                shiftHours: "7am-5pm",
                day: "Friday"
            },{
                totalHours: 9,
                shiftHours: "7am-4pm",
                day: "Saturday"
            }
        ];

        var today = days[date.getDay()];

        rc.salesmen=0;
        rc.lprph=0;
        rc.budget=0;
        rc.spendPerHr=0;

        rc.today=today;

        //Dynamically setting our hours of operation to the current day
        rc.operationHours=today.totalHours;

    }

}());
