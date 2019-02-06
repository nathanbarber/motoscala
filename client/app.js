var app = angular.module("motoscala", ['ngRoute']);
app.config(function($routeProvider, $locationProvider) {
    $routeProvider
    .when("/", {
        templateUrl: "views/home.html",
        controller: "home"
    })

    .otherwise({
        redirectTo: "/"
    })

    $locationProvider.html5Mode(true);
})

app.run(function($rootScope) {
    
})