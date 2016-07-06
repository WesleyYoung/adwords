/**
 * Created by wesleyyoung1 on 6/10/16.
 */
(function(){
    'use strict';

    angular.module('loadingScreenDirective', [])
        .directive('loadingScreen', loadingScreen);

    loadingScreen.$inject=[];

    function loadingScreen(){

        dirController.$inject= ["$scope"];

        function dirController($scope){
            $scope.showLoading=true;
            if($scope.timed){
                setTimeout(function(){
                    //$scope.showLoading=false;
                }, 10000)
            }
            console.log($scope.timed)
        }

        return {
            restrict: 'AE',
            replace: 'true',
            scope: {
                title: "=title",
                subtitle: "=subtitle",
                timed: "=timed"
            },
            controller: dirController,
            template: `
                <div class="loading-screen">
                    <h2>{{title}}</h2>
                    <br>
                    <div layout="row" layout-sm="column" layout-align="space-around">
                        <md-progress-circular md-mode="indeterminate"></md-progress-circular>
                    </div>
                    <br>
                    <h4 style="color: grey">{{subtitle}}</h4>
                </div>
            `
        }

        
    }


})();