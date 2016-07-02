/**
 * Created by I97143 on 6/17/2016.
 */
(function(){
    'use strict';

    angular.module('long-date-filter', [])
        .filter('longDate', longDate);

    function longDate(){
        var monthNames = [
            "January", "February", "March",
            "April", "May", "June", "July",
            "August", "September", "October",
            "November", "December"
        ];

        return function(input){
            if(input!==undefined && typeof input == 'object' ){
                var day = input.getDate(),
                    month = input.getMonth(),
                    year = input.getFullYear(),
                    suffix = day=="1"||day=="21"||day=="31"?"st":day=="2"||day=="22"?"nd":day=="3"||day=="23"?"rd":"th";

                return monthNames[month] + " " + day + suffix + " " + year
            }else{
                return input;
            }
        }
    }
})();