app.controller("create", function($scope, $location) {
    if($scope.loggedIn == false) {
        $location.path("/login");
    }
    if($location.path().includes("create-entry")) {
        if($scope.focused == undefined) {
            $location.path("/bench");
            return;
        }
        $scope.logName = $scope.focused.name;
        $scope.logDescription = $scope.focused.description;
        $scope.logTags = $scope.focused.tags;
    } else {
        $scope.logName = "Your New Project!";
        $scope.logDescription = "This is your description! _This will be in bold_ and *this will be italicized!*";
        $scope.logTags = "hot, popping, heated debate";
    }
        
    $scope.entryCreateVisible = false;
    $scope.entryCreate = () => {
        $scope.entryCreateVisible = true;
    }
    $scope.entryTitle = "Your First Entry!";
    $scope.entryText = "Describe! Describe! Describe!";
    $scope.media = undefined;
    $scope.hasMedia = false;
    $scope.readMedia = (url) => {
        return new Promise((resolve, reject) => {
            var reader = new FileReader();
            reader.readAsDataURL(url);
            reader.onload = () => { resolve(reader.result) };
            reader.onerror = error => { 
                $scope.showError("Cannot read image");
                reject(error);
            };
        });
    }
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
        $scope.$apply();
    }
    $scope.createLog = () => {
        return new Promise((resolve, reject) => {
            let createLogRequest = {
                username: window.credentials.username,
                token: window.serverAccessToken,
                logname: $scope.logName,
                description: $scope.logDescription
            }
            
            $.ajax({
                url: "/make-log", 
                method: "POST",
                data: createLogRequest,
                success: data => {
                    resolve(data);
                },
                error: err => {
                    reject(err);
                    $scope.showError(err.responseJSON.message);
                }
            });
        });
    }
    $scope.createEntry = (logid) => {
        return new Promise((resolve, reject) => {
            let createEntryRequest = {
                username: window.credentials.username,
                token: window.serverAccessToken,
                logid: logid,
                etitle: $scope.entryTitle,
                etext: $scope.entryText,
                media: $scope.media
            };
            $.ajax({
                url: "/make-entry", 
                method: "POST",
                data: createEntryRequest,
                success: data => {
                    resolve(data);
                },
                error: err => {
                    reject(err);
                    $scope.showError(err.responseJSON.message);
                }
            })
        }); 
    }
    $scope.initProject = async () => {
        let logid = (await $scope.createLog()).logid,
            createEntryRes = (await $scope.createEntry(logid));
        $location.path("/bench");
        $scope.$apply();
    }

    // Create entry 

    $scope.logid = window.location.href.split("/").pop();
    $scope.initEntry = async () => {
        let createEntryRes = (await $scope.createEntry($scope.logid));
        $location.path(`/project/${$scope.logid}`);
        $scope.$apply();
    }
});