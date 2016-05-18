/**
 * Created by Wesley on 4/20/2016.
 */
(function(){
    'use strict';

    angular.module('recordController', [])
        .controller('recordController', recordController);

    recordController.$inject = ["$http"];

    function recordController($http) {
        var rc = this;

        $http.get('/getreports')
        .then(function(result){
                console.log(result);
            })

    }

}());