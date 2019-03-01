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
                    if(data.success) {
                        $location.path("/validate");
                        $scope.$apply();
                    } else {
                        console.log("Signup err")
                    }
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