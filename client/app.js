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
        .when("/project/:logid", {
            templateUrl: "views/project.html",
            controller: "project"
        })
        .when("/create", {
            templateUrl: "views/create.html",
            controller: "create"
        })
        .when("/create-entry/:logid", {
            templateUrl: "views/create-entry.html",
            controller: "create"
        })
        .when("/edit/log/:logid", {
            templateUrl: "views/edit-log.html",
            controller: "edit"
        })
        .when("/edit/entry/:entryid", {
            templateUrl: "views/edit-entry.html",
            controller: "edit"
        })
        .otherwise({
            redirectTo: "/"
        });
});

app.run(function($rootScope) {
    $rootScope.username = sessionStorage.getItem("motoscala-username") || (window.credentials != undefined ? window.credentials.username : undefined);
    $rootScope.token = sessionStorage.getItem("motoscala-token") || window.serverAccessToken;
    if($rootScope.token && $rootScope.username) {
        window.credentials = {
            username: $rootScope.username
        };
        window.serverAccessToken = $rootScope.token;
        $rootScope.loggedIn = true;
    } else {
        $rootScope.loggedIn = false;
    }
    $rootScope.logList = [];
    $rootScope.logs = [];
    $rootScope.focused = null;
});