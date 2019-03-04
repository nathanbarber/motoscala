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
    $scope.toBench = function() {
        $location.path("/bench");
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

function getMenuHeight() {
    return `${(parseInt($(".item").css("margin")) * 2 + $(".item").height() - 4) * ($(".item").length - $(".item.ng-hide").length)}px`
}
    

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
        height: getMenuHeight()
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