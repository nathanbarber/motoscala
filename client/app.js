var app = angular.module("motoscala", ['ngRoute']);
app.config(function($routeProvider, $locationProvider) {
    $routeProvider
        .when("/", {
            templateUrl: "views/home.html",
            controller: "home"
        })
        .when("/signup", {
            templateUrl: "views/account-signup.html",
            controller: "account"
        })
        .when("/login", {
            templateUrl: "views/account-login.html", 
            controller: "account"
        })
        .when("/validate", {
            templateUrl: "views/account-validate.html",
            controller: "account"
        })
        .when("/bench", {
            templateUrl: "views/bench.html",
            controller: "bench"
        })
        .otherwise({
            redirectTo: "/"
        });
});

app.run(function($rootScope) {
    $rootScope.notLoggedIn = true;
    $rootScope.logList = [];
    $rootScope.logs = [];
});