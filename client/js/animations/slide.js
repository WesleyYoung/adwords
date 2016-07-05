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
                    from: { height:-300, opacity: 0 },
                    to: { height: 200, opacity: 1 }
                })
            }
        }
    }]);