app.controller("create", function($scope, $location) {
    if($scope.loggedIn == false) {
        $location.path("/login");
    }
    $scope.logName = "Ex. Rocket Couch";
    $scope.logDescription = "Airplanes? No, this isn't 1990. I introduce to you the flying fouton.";
    $scope.logTags = "comfy, spacious, speedy";
    $scope.entryCreateVisible = false;
    $scope.entryCreate = () => {
        $scope.entryCreateVisible = true;
    }
    $scope.entryTitle = "";
    $scope.entryText = "";
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
    $scope.updatedMedia = async (input) => {
        let media = input.files[0];
        console.log(media);
        $scope.media = await $scope.readMedia(media);
        $scope.hasMedia = true;
        $scope.$apply();
        console.log($scope.media);
    }
    $scope.createLog = () => {
        console.log("Creating project");
        return new Promise((resolve, reject) => {
            let createLogRequest = {
                username: window.credentials.username,
                token: window.serverAccessToken,
                logname: $scope.logName,
                description: $scope.logDescription
            };
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
        console.log(createEntryRes);
        $location.path("/bench");
        $scope.$apply();
    }

    // Create entry 

    $scope.logid = window.location.href.split("/").pop();
    $scope.initEntry = async () => {
        let createEntryRes = (await $scope.createEntry($scope.logid));
        console.log(createEntryRes);
        $location.path(`/project/${$scope.logid}`);
        $scope.$apply();
    }
});