/**
 * Created by wesleyyoung1 on 5/18/16.
 */
angular.module('slide', [])
    .animation('.custom-slide', ["$animateCss" ,function($animateCss) {
        return {

            enter: function(element){
                return $animateCss(element, {
                    event: 'enter',
                    structural: true,
                    addClass: 'maroon-setting',
                    from: { height:-500 },
                    to: { height: 200 }
                })
            }
        }
    }]);