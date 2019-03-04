app.controller("edit", function($scope, $location, $rootScope) {
    $scope.ids = (() => {
        let href = window.location.href.split("/"),
            id = href.pop(),
            type = href.pop();
        if((id.includes("entry") && type == "entry") || (id.includes("log") && type == "log")) {
            if($rootScope.focused == null) $location.path("/bench");
            return {
                id: id,
                type: type
            }
        }
        return $location.path("/bench");
    })();
    $scope.entryIndex = () => {
        console.log($rootScope.focused);
        for(let entry in $rootScope.focused.entries) {
            if($rootScope.focused.entries[entry].id == $scope.ids.id) return entry;
        }
    }
    $scope.readMedia = (url) => {
        return new Promise((resolve, reject) => {
            var reader = new FileReader();
            reader.readAsDataURL(url);
            reader.onload = () => { resolve(reader.result) };
            reader.onerror = error => { reject(error) };
        });
    }
    $scope.loadMedia = (href) => {
        return new Promise(resolve => {
            $.get("/media" + href, (data) => {
                resolve(data)
            });
        });
    };
    $scope.updatedMedia = async (input) => {
        let media = input.files[0];
        console.log(media);
        $scope.media = await $scope.readMedia(media);
        $scope.hasMedia = true;
        $scope.updatedMedia = true;
        $scope.$apply();
        console.log($scope.media);
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
                    console.log(data);
                    let logid = $rootScope.focused.logid;
                    $rootScope.focused = null;
                    $location.path(`/project/${logid}`);
                    $scope.$apply();
                },
                error: err => {
                    console.log(err);
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
            description: $rootScope.focused.description
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
                    console.log(data);
                    let logid = $rootScope.focused.logid;
                    $rootScope.focused = null;
                    $location.path(`/project/${logid}`);
                    $scope.$apply();
                },
                error: err => {
                    console.log(err);
                }
            })
        });
    }
});