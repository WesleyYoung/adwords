/**
 * Created by Wesley on 4/23/2016.
 */
(function(){
    'use strict';

    angular.module('navController', [])
        .controller('navController', navController);

    navController.$inject = ["$location"];
    function navController($location) {
        var nav = this;
        nav.isActive = isActive;

        function isActive(viewLocation) {
            return viewLocation === $location.path();
        }
    }

}());