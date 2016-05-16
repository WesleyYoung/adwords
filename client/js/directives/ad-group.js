/**
 * Created by wesleyyoung1 on 4/23/16.
 */
(function(){
    'use strict';

    angular.module('adGroupDirective', [])
        .directive('adGroup', adGroupDirective);

    adGroupDirective.$inject = [];

    function adGroupDirective() {
        return {
            restrict: "AE",
            replace: 'true',
            scope: {
                adGroupInfo: "=adGroupInfo"
            },
            template: `
                <div class="container-fluid campaign-container">
                    <h3>{{adGroupInfo.name}}</h3>
                    <p>{{adGroupInfo.status}}</p>
                    <span> CPL: {{adGroupInfo.CPL}} Cost: {{adGroupInfo.cost}}</span>
                </div>
            `
        }
    }

}());
