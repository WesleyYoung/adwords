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

        $scope.labels = ['2006', '2007', '2008', '2009', '2010', '2011', '2012'];
        $scope.series = ['Series A'];

        $scope.data = [
            [65, 59, 80, 81, 56, 55, 40]
            //[28, 48, 40, 19, 86, 27, 90]
        ];


        $http.get('/leadData').then(function(results){
            console.log(results)
            var data = results.data.byDate;
            var leads = [],
                quarters = [],
                dates = [];

            for(var i=0;i<data.length;i++){
                dates.push(data[i].date);
                leads.push(data[i].totalLeads);
            }
            $scope.labels = dates;
            $scope.data = leads;
        })


    }

}());