app.controller("project", function($scope, $location, $rootScope) {
    if($scope.loggedIn == false) {
        $location.path("/login");
    }
    $scope.logid = window.location.href.split("/").pop();
    $scope.loaded = false;
    $scope.getLog = logid => {
        return new Promise((resolve, reject) => {
            console.log("promise loaded");
            if($scope.logid.substring(0, 3).includes("log") && $scope.logid.length == 67) {
                $.ajax({
                    url: `/dump-log?username=${window.credentials.username}&logid=${logid}&token=${window.serverAccessToken}`, 
                    method: "GET",
                    success: data => {
                        resolve(data.log);
                    },
                    error: err => {
                        console.log(err);
                        $scope.showError(err.responseJSON.message);
                        reject(err);
                    }
                });
            } else {
                reject("Incorrect logid in url");
                $location.path("/bench");
            }
        });
    };
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
    $scope.loadLog = async () => {
        $scope.log = await $scope.getLog($scope.logid);
        for(let entry of $scope.log.entries) {
            if(entry.href) {
                try { 
                    entry.media = await $scope.loadMedia(entry.href) 
                } catch(err) { 
                    console.log(err);
                    $scope.showError("Could not load entry image");
                }
            }
        }
        $scope.loaded = true;
        $scope.$apply();
        console.log("Log", $scope.log)
    }
    $scope.loadLog();

    // Display functions

    $scope.createEntry = () => {
        $location.path(`/create-entry/${$scope.logid}`);
    }
    $scope.showActions = ($event) => {
        console.log($event);
        let $entry = (() => {
                if($($event.target).attr("class").includes("entry")) {
                    return $($event.target);
                }
                return $($event.target).parent();
            })(),
            $action = $entry.children(".action");
        if($action.css("display") == "none") {
            $action.css("display", "block");
        } else {
            $action.css("display", "none");
        }
    }
    $scope.deleteEntry = id => {
        return new Promise((resolve, reject) => {
            $.ajax({
                url: "/delete-entry",
                method: "POST",
                data: {
                    username: window.credentials.username,
                    token: window.serverAccessToken,
                    logid: $scope.logid,
                    entryid: id
                },
                success: (data) => {
                    console.log(data);
                    resolve(data);
                    for(let entry in $scope.log.entries) {
                        if($scope.log.entries[entry].id == id) {
                            $scope.log.entries.splice(entry, 1);
                        }
                    }
                    $scope.$apply();
                    console.log($scope.log);
                },
                error: err => {
                    console.log(err);
                    $scope.showError(err.responseJSON.message);
                    reject(err);
                }
            });
        }); 
    }
    $scope.deleteLog = () => {
        var deleteBody = {
            username: window.credentials.username,
            token: window.serverAccessToken,
            logid: $scope.logid
        }
        return new Promise((resolve, reject) => {
            $.ajax({
                url: "/delete-log",
                method: "POST",
                data: deleteBody,
                success: data => {
                    $location.path("/bench");
                    $scope.$apply();
                    resolve(data)
                },
                error: err => {
                    console.log(err);
                    $scope.showError(err.responseJSON.message);
                    reject(err);
                }
            })
        });
    }
    $scope.updateEntry = id => {
        $rootScope.focused = $scope.log;
        $rootScope.focused.logid = $scope.logid;
        $location.path(`/edit/entry/${id}`);
    }
    $scope.updateLog = () => {
        $rootScope.focused = $scope.log;
        $rootScope.focused.logid = $scope.logid;
        $location.path(`/edit/log/${$scope.logid}`)
    }
});