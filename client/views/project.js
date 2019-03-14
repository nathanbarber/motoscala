app.controller("project", function($scope, $location, $rootScope, $compile) {
    $scope.logid = window.location.href.split("/").pop();
    $scope.query = '';
    $scope.loaded = false;
    $scope.getLog = (dumpURI) => {
        return new Promise((resolve, reject) => {
            console.log("promise loaded");
            if($scope.logid.substring(0, 3).includes("log") && $scope.logid.length == 67) {
                $.ajax({
                    url: dumpURI, 
                    method: "GET",
                    success: data => {
                        console.log(data);
                        resolve(data.log);
                    },
                    error: err => {
                        console.log(err);
                        $scope.showError(err.responseJSON.message);
                        $scope.relogin();
                        reject(err);
                    }
                });
            } else {
                $location.path("/bench");
                $scope.$apply();
                reject("Incorrect logid in url");
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
        $scope.log = await $scope.getLog(
            `/dump-log?username=${window.credentials ? window.credentials.username : ''}&logid=${$scope.logid}&token=${window.serverAccessToken || ''}`
        );
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
        $scope.ownerMatch = ($scope.log.owner == (window.credentials ? window.credentials.username : ''));
        $scope.loaded = true;
        $scope.$apply();
        console.log("Log", $scope.log)
    }
    $scope.loadLog();

    // Display functions

    $scope.createEntry = () => {
        $location.path(`/create-entry/${$scope.logid}`);
    }
    $scope.deleteEntry = id => {
        return new Promise((resolve, reject) => {
            $.ajax({
                url: "/delete-entry",
                method: "POST",
                data: {
                    username: window.credentials ? window.credentials.username: '',
                    token: window.serverAccessToken,
                    logid: $scope.logid,
                    entryid: id
                },
                success: data => {
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
        let $confirmbox = $scope.generateShadowbox("Confirm your project name to delete.", "Delete", true),
            $button = $confirmbox.find(".action-button");
            $input = $confirmbox.find("input"),
            $shadow = $confirmbox.find(".shadow");
        $shadow.on("click", () => {
            $confirmbox.remove();
        });
        console.log($input);
        $button.css("background-color", "#ccc");
        $input.on("change keyup paste", () => {
            if($input.val() == $scope.log.name) {
                $input.css("border-bottom-color", "#99CC99");
                $button.attr("style", "");
                $button.off("click");
                $button.on("click", $scope.confirmedLogDelete);
            } else {
                $input.css("border-bottom-color", "var(--accent-color)");
                $button.css("background-color", "#ccc");
                $button.off("click");
            }
        });
    }
    $scope.confirmedLogDelete = () => {
        var deleteBody = {
            username: window.credentials ? window.credentials.username : '',
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
        console.log("focused", $rootScope.focused);
        $location.path(`/edit/entry/${id}`);
    }
    $scope.updateLog = () => {
        $rootScope.focused = $scope.log;
        $rootScope.focused.logid = $scope.logid;
        $location.path(`/edit/log/${$scope.logid}`)
    }
});