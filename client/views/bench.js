app.controller("bench", function($scope, $location) {
    if(!window.serverAccessToken) {
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
                    reject(err);
                }
            })
        });
    }
    $scope.loadLogs = (async () => {
        $scope.logList = await $scope.getLogList();
        $scope.logs = [];
        for(let logid of $scope.logList) {
            $scope.logs.push(await $scope.getLog(logid));
        }
        $scope.logsLoaded = true;
        console.log($scope.logs);
        $scope.$apply();
    })();
});