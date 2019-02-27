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
        .otherwise({
            redirectTo: "/"
        });
});

app.run(function($rootScope) {
    $rootScope.notLoggedIn = true;
});
app.controller("navbar", function($scope, $location) {
    $scope.toHome = function() {
        $location.path("/");
        hardShut();
    }
    $scope.toSignup = function() {
        $location.path("/signup");
        hardShut();
    }
    $scope.toLogin = function() {
        $location.path("/login");
        hardShut();
    }
    $(document).ready(function() {
        $(".hamburger").mousedown(function() {
            if($(".menu-items").css("display") == "none") {
                extendo();
            } else {
                contracto();
            }
        });
    });
});
    

function extendo(time) {
    let timep = time || 150;
    // Extendo
    $(".sheet#big").animate({
        top: "5px",
        borderBottomWidth: "9px"
    }, timep);
    $(".sheet#med").animate({
        borderBottomWidth: "9px"
    }, timep);
    $(".sheet#sml").animate({
        top: "35px",
        borderBottomWidth: "9px"
    }, timep);
    // Open menu
    $(".menu-items").css("display", "block");
    $(".menu-items").animate({
        height: `${(parseInt($(".item").css("margin")) * 2 + $(".item").height() - 4) * $(".item").length}px`
    }, 130);
}

function contracto(time) {
    let timep = time || 150;
    // Contracto
    $(".sheet#big").animate({
        top: "10px",
        borderBottomWidth: "12px"
    }, timep);
    $(".sheet#med").animate({
        borderBottomWidth: "12px"
    }, timep);
    $(".sheet#sml").animate({
        top: "30px",
        borderBottomWidth: "12px"
    }, timep);
    // Close menu
    $(".menu-items").animate({
        height: "0px"
    }, 130, function() {
        $(".menu-items").css("display", "none");
    });
}

function hardShut(time) {
    let timep = time || 60;
    $(".sheet#big").animate({
        top: "10px",
        borderBottomWidth: "12px"
    }, timep);
    $(".sheet#med").animate({
        borderBottomWidth: "12px"
    }, timep);
    $(".sheet#sml").animate({
        top: "30px",
        borderBottomWidth: "12px"
    }, timep);
    // Close menu
    $(".menu-items").css({
        height: "0px"
    });
    $(".menu-items").css("display", "none");
}
app.controller("account", function($scope, $location) {
    $scope.doSignUp = function() {
        
    }
    $scope.doLogin = function() {

    }
    $scope.storeToken = function() {

    }
});
app.controller("home", function($scope, $location) {
    $scope.toSignUp = function() {
        $location.path("/signup");
    }
})

function animation() {
    var $canvas = $("#animation"),
        canvas = $canvas[0],
        cx = canvas.getContext('2d');

    // DPI SCALAGE
    canvas.width = w * 2;
    canvas.height = h * 2;
    canvas.style.width = w;
    canvas.style.height = h;
    cx.scale(2, 2);

    window.onresize = function() {
        // DPI SCALAGE
        canvas.width = w * 2;
        canvas.height = h * 2;
        canvas.style.width = w;
        canvas.style.height = h;
        cx.scale(2, 2);
    }
    
    return setInterval(() => {
        
    }, 10)
}