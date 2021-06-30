/*global angular */

angular.module('todomvc')
    .service('dbug', function () {
        this.log = function (message) {
            return console.log(message)
        }
 
    });