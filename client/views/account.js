app.controller("account", function($scope, $location, $rootScope) {
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
            if(Array.isArray(verified) && verified[0] == false) {
                // Do something
                $scope.showError(verified[1]);
            } else {
                $.ajax({
                    url: "/signup",
                    method: "POST",
                    data: verified,
                    success: (data) => {
                        if(data.success) {
                            $location.path("/validate");
                            $scope.$apply();
                        } else {
                            console.log("Signup err")
                        }
                    },
                    error: (err) => {
                        console.log(err);
                        $scope.showError(err.responseJSON.message);
                    }
                });
            }
        });
    }
    $scope.doLogin = function() {
        $(document).ready(function() {
            let $user = $("input.username"),
                $pass = $("input.password");
            var cred = {
                    username: $user.val(),
                    password: $pass.val()
                },
                verified = verify(cred);
            console.log(verified);
            if(Array.isArray(verified) && verified[0] == false) {
                // Do something
            } else {
                window.credentials = verified;
                sessionStorage.setItem("motoscala-username", window.credentials.username);
                $.ajax({
                    url: "/login",
                    method: "POST",
                    data: verified,
                    success: (data) => {
                        console.log("logged in");
                        if(data.token) {
                            window.serverAccessToken = data.token;
                            sessionStorage.setItem("motoscala-token", data.token);
                            $rootScope.username = window.credentials.username;
                            $rootScope.token = window.serverAccessToken;
                            $rootScope.loggedIn = true;
                            console.log($rootScope.loggedIn);
                            $rootScope.$apply();
                            $location.path("/bench");
                            $rootScope.$apply();
                        } else {
                            $scope.showError("Login attempt unsuccessful")
                        }
                    },
                    error: (err) => {
                        console.log(err);
                        $scope.showError(err.responseJSON.message);
                    }
                });
            }
            
        }); 
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