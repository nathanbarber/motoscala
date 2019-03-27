app.controller("edit", function($scope, $location, $rootScope) {
    if($scope.loggedIn == false) {
        $location.path("/login");
    }
    $scope.ids = (() => {
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
    })();
    $scope.entryIndex = () => {
        for(let entry in $rootScope.focused.entries) {
            if($rootScope.focused.entries[entry].id == $scope.ids.id) return entry;
        }
    }
    $scope.accessSliderInit = (() => {
        if($rootScope.focused.public) {
            $(".toggle").css("backgroundColor", "var(--accent-color");
            $(".toggle").css("margin-left", $(".toggle").width());
        }
    })();
    $scope.changeAccess = () => {
        if($rootScope.focused.public == false) {
            $rootScope.focused.public = true;
            $(".toggle").css("backgroundColor", "var(--accent-color");
            $(".toggle").animate({
                "marginLeft": $(".toggle").width()
            }, 200);
        } else {
            $rootScope.focused.public = false;
            $(".toggle").css("backgroundColor", "var(--accent-color-lighter");
            $(".toggle").animate({
                "marginLeft": "0px",
                "backgroundColor": "var(--accent-color-lighter)"
            }, 200);
        }
    }
    $scope.readMedia = (url) => {
        return new Promise((resolve, reject) => {
            var reader = new FileReader();
            reader.readAsDataURL(url);
            reader.onload = () => {
                resolve(reader.result);
            };
            reader.onerror = error => { 
                $scope.showError("Cannot read image")
            };
        });
    }
    $scope.loadMedia = (href) => {
        return new Promise((resolve, reject) => {
            $.ajax({
                url: "/media" + href, 
                method: "GET",
                success: data => {
                    resolve(data)
                },
                error: err => {
                    $scope.showError("Could not load image");
                    reject(err);
                }
            });
        });
    };
    $scope.onUpdatedMedia = async (input) => {
        let media = input.files[0];
        let rexif = await new Promise((resolve) => {
            loadImage(
                media,
                function(img) {
                    resolve(img.toDataURL('image/jpeg', 0.5))
                },
                {
                    orientation: true
                }
            );
        });
        $scope.media = rexif;
        $scope.hasMedia = true;
        $scope.updatedMedia = true;
        $scope.$apply();
    }
    $scope.load = async () => {
        if($scope.ids.type == "entry") {
            let href = $rootScope.focused.entries[$scope.entryIndex()].href;
            if(href) {
                $scope.media = await $scope.loadMedia(href);
                $scope.hasMedia = true;
                $scope.$apply();
            }
        }
    }
    $scope.load();
    $scope.updateEntry = () => {
        var updateBody = {
            username: window.credentials.username,
            token: window.serverAccessToken,
            logid: $rootScope.focused.logid,
            entryid: $scope.ids.id,
            etitle: $rootScope.focused.entries[$scope.entryIndex()].title,
            etext: $scope.focused.entries[$scope.entryIndex()].text,
        };
        if($scope.updatedMedia == true) {
            updateBody.media = $scope.media;
        }
        return new Promise((resolve, reject) => {
            $.ajax({
                url: "/update-entry",
                method: "POST",
                data: updateBody,
                success: data => {
                    let logid = $rootScope.focused.logid;
                    $rootScope.focused = null;
                    $location.path(`/project/${logid}`);
                    $scope.$apply();
                },
                error: err => {
                    $scope.showError(err.responseJSON.message);
                }
            })
        });
    }
    $scope.updateLog = async() => {
        var updateBody = {
            username: window.credentials.username,
            token: window.serverAccessToken,
            logid: $rootScope.focused.logid,
            logname: $rootScope.focused.name,
            description: $rootScope.focused.description,
            public: $rootScope.focused.public
        };
        if($scope.updatedMedia == true) {
            updateBody.media = $scope.media;
        }
        return new Promise((resolve, reject) => {
            $.ajax({
                url: "/update-log",
                method: "POST",
                data: updateBody,
                success: data => {
                    let logid = $rootScope.focused.logid;
                    $rootScope.focused = null;
                    $location.path(`/project/${logid}`);
                    $scope.$apply();
                },
                error: err => {
                    $scope.showError(err.responseJSON.message);
                }
            })
        });
    }
});