var app = angular.module("motoscala", ['ngRoute', 'ngSanitize']);
app.config(function($routeProvider, $locationProvider) {
    $routeProvider
        .when("/", {
            templateUrl: "views/home/home.html",
            controller: "home"
        })
        .when("/signup", {
            templateUrl: "views/account/account-signup.html",
            controller: "account"
        })
        .when("/login", {
            templateUrl: "views/account/account-login.html", 
            controller: "account"
        })
        .when("/validate", {
            templateUrl: "views/account/account-validate.html",
            controller: "account"
        })
        .when("/bench", {
            templateUrl: "views/project/bench.html",
            controller: "bench"
        })
        .when("/project/:logid", {
            templateUrl: "views/project/project.html",
            controller: "project"
        })
        .when("/create", {
            templateUrl: "views/edit/create.html",
            controller: "create"
        })
        .when("/create-entry/:logid", {
            templateUrl: "views/edit/create-entry.html",
            controller: "create"
        })
        .when("/edit/log/:logid", {
            templateUrl: "views/edit/edit-log.html",
            controller: "edit"
        })
        .when("/edit/entry/:entryid", {
            templateUrl: "views/edit/edit-entry.html",
            controller: "edit"
        })
        .otherwise({
            redirectTo: "/"
        });
});

app.run(function($rootScope, $location) {
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
    $rootScope.display = {
        logs: [],
        log: {}
    };
    $rootScope.focused = null;

    // Re-login

    $rootScope.relogin = () => {
        $rootScope.logList = [];
        $rootScope.logs = [];
        $rootScope.focused = null;
        $rootScope.loggedIn = false;
        $location.path("/login");
        $rootScope.$apply();
    }

    // Error display

    $rootScope.errorMessage = "";
    $rootScope.showError = (message) => {
        $(".error-message").css("display", "block");
        $rootScope.errorMessage = message;
        $rootScope.$apply();
    }
    $rootScope.hideError = () => {
        $(".error-message").css("display", "none");
        $rootScope.errorMessage = "";
    }

    // Shadowbox display 

    $rootScope.generateShadowbox = (message, button, input) => {
        $(".shadow-box").remove();
        let shadowbox = `
            <div class="shadow-box container-fluid">
                <div class="row">
                    <div class="light-box col-10 offset-1 col-md-4 offset-md-4">
                        <div class="message">${message}</div>
                        ${(() => {
                            return (input ? '<input spellcheck="false">' : '')
                        })()}
                        <br><br><span class="action-button">${button}</span>
                    </div>
                </div>
                <div class="shadow"></div>
            </div>
        `;
        $("#view").prepend(shadowbox)
        return $("#view .shadow-box");
    }

    // Format text

    $rootScope.textFormatter = (object, attr) => {
        // Render newline correctly
        object[attr] = object[attr].replace(/\n/g, "\n");
        // Render html out of the mix
        object[attr] = object[attr].replace(/</g, "&lt");
        object[attr] = object[attr].replace(/>/g, "&gt");
        // Make _str_ bold
        let matchBolds = object[attr].match(/_/g),
            numBolds = matchBolds ? matchBolds.length : 0,
            num = numBolds - (numBolds % 2),
            countConv = 0,
            beginTag = true,
            htmlConverted = "";
        for(let i of object[attr]) {
            if(i == "_" && countConv <= num) {
                if(beginTag) { htmlConverted += "<strong>"; beginTag = false } 
                else { htmlConverted += "</strong>"; beginTag = true }
                countConv++;
                continue;
            }
            htmlConverted += i;
        }
        object[attr] = htmlConverted;
        // Make *str* italic
        let matchItalic = object[attr].match(/\*/g),
            numItalic = matchItalic ? matchItalic.length : 0;
            num = numItalic - (numItalic % 2),
            countConv = 0,
            beginTag = true,
            htmlConverted = "";
        for(let i of object[attr]) {
            if(i == "*" && countConv <= num) {
                if(beginTag) { htmlConverted += "<i>"; beginTag = false } 
                else { htmlConverted += "</i>"; beginTag = true }
                countConv++;
                continue;
            }
            htmlConverted += i;
        }
        object[attr] = htmlConverted;
        return object;
    }
    $rootScope.textNormalizer = (object, attr) => {
        object[attr] = object[attr].replace(/_/g, '');
        object[attr] = object[attr].replace(/\*/g, '');
        return object;
    }

    // Get IDS

    $rootScope.getIDs = () => {
        let href = window.location.href.split("/"),
            id = href.pop(),
            type = href.pop();
        if((id.substring(0, 5).includes("entry") && type == "entry") || (id.substring(0, 3).includes("log") && type == "log")) {
            if($rootScope.focused == null) $location.path("/bench");
            return {
                id: id,
                type: type
            }
        }
        return $location.path("/bench");
    };
});