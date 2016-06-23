/**
 * Created by wesleyyoung1 on 6/10/16.
 */
(function(){
    'use strict';

    angular.module('loadingScreenDirective', [])
        .directive('loadingScreen', loadingScreen);

    loadingScreen.$inject=[];

    function loadingScreen(){


        return {
            restrict: 'AE',
            replace: 'true',
            scope: {
                info: "=info"
            },
            template: `
                <div class="loading-screen">
                    <h2>{{info.title}}</h2>
                    <br>
                    <i class="fa fa-spinner fa-pulse fa-5x fa-fw"></i>
                </div>
            `
        }
    }


})();