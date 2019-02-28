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
        $(document).ready(function() {
            let $user = $("input.username"),
                $email = $("input.email"),
                $password = $("input.password"),
                $pv = $("input.password-verify"),
                $phone = $("input.phone");
            var cred = {
                    username: $user.val(),
                    email: $email.val(),
                    password: $password.val(),
                    pv: [$password.val(), $pv.val()],
                    phone: $phone.val()
                },
                verified = verify(cred);
            console.log(verified);
            $.ajax({
                url: "/signup",
                method: "POST",
                data: verified,
                success: (data) => {
                    console.log(data)
                },
                error: (err) => {
                    console.log(err);
                }
            });
        });
    }
    $scope.doLogin = function() {

    }
    $scope.storeToken = function() {

    }
});

function verify(cred) {
    for(let part in cred) {
        switch(part) {
            case "username": 
                if(/^[_A-z0-9]*((-|\s)*[_A-z0-9])*$/g.test(cred[part]) == false) return [false, "Remove special characters from your username"];
                if(cred[part].length < 5) return [false, "Your username must be five or more characters in length"];
                break;
            case "password":
                if(cred[part].length < 5) return [false, "Your password must be five or more characters in length (for security)"];
                break;
            case "pv":
                if(cred[part][0] != cred[part][1]) return [false, "Your passwords do not match"]
                break;
            case "email":
                let testemail = cred[part].split("@");
                if(testemail.length != 2) return [false, "Please enter a valid email"];
                if(!(testemail[1].includes("."))) return [false, "Please enter a valid email"];
                break;
            case "phone": 
                if(/^[0-9\-]/.test(cred[part]) == false) return [false, "Phone numbers may only consist of numbers and dashes"];
                cred[part] = cred[part].replace("-", "");
                if(cred[part].length != 10) return [false, "Phone number needs to be ten digits"];
                break;
        }
    }
    if(cred['pv']) {
        delete cred['pv'];
    }
    return cred;
}
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