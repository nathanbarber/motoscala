app.controller("bench", function($scope, $rootScope, $location) {
    if($scope.loggedIn == false) {
        return $location.path("/login");
    }
    $scope.logsLoaded = false;
    $scope.username = window.credentials.username;
    $scope.getLogList = function() {
        return new Promise((resolve, reject) => {
            $.ajax({
                url: `/list-log?username=${window.credentials.username}&token=${window.serverAccessToken}`,
                method: "GET",
                success: (data) => {
                    console.log(data);
                    resolve(data.logs);
                },
                error: (err) => {
                    console.log(err);
                    $scope.showError(err.responseJSON.message);
                    $scope.relogin();
                    reject(err);
                }
            })
        });
    }
    $scope.getLog = function(logid) {
        return new Promise((resolve, reject) => {
            $.ajax({
                url: `/dump-log?username=${window.credentials.username}&logid=${logid}&token=${window.serverAccessToken}`, 
                method: "GET",
                success: (data) => {
                    console.log(data);
                    resolve(data.log);
                },
                error: (err) => {
                    console.log(err);
                    $scope.showError(err.responseJSON.message);
                    reject(err);
                }
            })
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
    $scope.loadLogs = (async () => {
        $scope.logList = await $scope.getLogList();
        $scope.logs = [];
        for(let logid of $scope.logList) {
            let log = await $scope.getLog(logid);
            if(log.entries[0] && log.entries[0].href) {
                try {
                    log.entries[0].media = await $scope.loadMedia(log.entries[0].href);
                } catch(err) {
                    $scope.showError("Could not load entry media");
                }
            }
            log.id = logid
            $scope.logs.push(log);
        }
        $scope.logsLoaded = true;
        console.log("Loaded logs", $scope.logs);
        window.logs = $scope.logs;
        $scope.$apply();
    })();
    $scope.createLog = () => {
        $location.path("/create");
    }

    // Display functions

    $scope.limit = (str, limit) => {
        let limited = str.substring(0, limit);
        if(limited == str) return str;
        return limited + "...";
    }
    $scope.toProject = (id) => {
        $location.path(`/project/${id}`);
    }
});