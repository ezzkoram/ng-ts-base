(() => {
    var app = angular.module('app', ['templates', 'ngRoute']);

    app.config(['$routeProvider', ($routeProvider: angular.route.IRouteProvider): void => {
        $routeProvider.when('/', {
            templateUrl: 'pages/home.html'
        })
        .when('/page-a', {
            templateUrl: 'pages/page-a.html'
        })
        .when('/page-b', {
            templateUrl: 'pages/page-b.html',
            controller: pages.PageBController,
            controllerAs: 'c'
        });
    }]);
})();

