/**
 * Created by Wesley on 4/23/2016.
 */
(function(){
    'use strict';

    angular.module('planService', [])
        .service('planService', planService);

    planService.$inject = ["$http"];

    function planService($http) {
        var ps = this;

    }

}());