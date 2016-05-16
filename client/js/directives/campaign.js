/**
 * Created by Wesley on 4/20/2016.
 */
(function(){
    'use strict';

    angular.module('campaignDirective', [])
        .directive('campaign', campaignDirective);

    campaignDirective.$inject = [];

    function campaignDirective() {
        return {
            restrict: "AE",
            replace: 'true',
            scope: {
                campaignInfo: "=campaignInfo"
            },
            template: `
                <div class="container-fluid campaign-container">
                    <h3>{{campaignInfo.name}}</h3>
                    <p>{{campaignInfo.status}}</p>
                    <span> CPL: {{campaignInfo.CPL}} Cost: {{campaignInfo.cost}}</span>
                </div>
            `
        }
    }

}());

