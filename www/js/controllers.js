var url = "https://gist.githubusercontent.com/debianmaster/1fcf12fcbf20fdd4d202/raw/2c55aa21d814cf3bdc9144b09768c3a2b86ad62a/movies.json";

var app =angular.module('starter.controllers', []);

app.controller('AppCtrl', function ($scope, $ionicModal, $timeout, $cordovaMedia,$ionicLoading,PushProcessingService) {
    // Form data for the login modal
    $scope.loginData = {};
    $scope.fileMap=[];
    $scope.media = null;
    $scope.isPlaying = false;
    $scope.playStatus = "Play";
    $scope.queue = [];
    $scope.totalDuration = null;
    $scope.timeElapsed = 0;
    $scope.uiEvent=false;
    $scope.playingNow=0;
    $scope.pause = function () {
        $scope.isPlaying = false;
        $cordovaMedia.pause($scope.media);
    };
    $scope.stopSong = function(){
        if($scope.media!=null){
            $scope.media.release();
            $scope.media = null;
        }
    }
    $scope.uiPlay= function (direction) {
        $scope.uiEvent=true;
        setTimeout(function(){
            $scope.uiEvent=false;
        },1000)
        if(direction=='next')
            $scope.playNext();
        else
            $scope.playPrevious();

    }
    $scope.playPrevious = function(){
        $scope.stopSong();
        $scope.playingNow-=2;
        $scope.playNext();
    }
    $scope.playNext = function () {
        $scope.stopSong();
        $scope.currentSong = $scope.queue[$scope.playingNow];
        $scope.playingNow++;
        var mediaStatusCallback = function (mediaState) {
            switch (mediaState) {
                case Media.MEDIA_STOPPED:
                    if(!$scope.uiEvent)
                    $scope.playNext();
                    break;
            }
        }
        $scope.downloadFile($scope.currentSong.url,function(file){
            $scope.media = new Media(file, null, null, mediaStatusCallback);
            $scope.totalDuration = $scope.media.getDuration();
            $cordovaMedia.play($scope.media);
            var mediaTimer = setInterval(function () {
                // get media position
                $scope.media.getCurrentPosition(
                    // success callback
                    function (position) {
                        if (position > -1) {
                            $scope.timeElapsed = position;

                        }
                    },
                    // error callback
                    function (e) {
                        console.log("Error getting pos=" + e);
                    }
                );
                $scope.timeElapsed++;
            }, 1000);
        });
    }
    $scope.addSong = function (movieOrSong, queue) {
        try {
            $scope.playingNow=0;
            $scope.isPlaying = true;

            if (!queue) {
                $scope.queue = [];
                if($scope.media!=null)
                $cordovaMedia.stop($scope.media);

            }
            for (var k in movieOrSong.songs) {
                $scope.queue.push(movieOrSong.songs[k]);
            }
            $scope.playNext();
        }
        catch (ex) {
            alert(ex);
        }
    };
    // Create the login modal that we will use later
    $ionicModal.fromTemplateUrl('templates/login.html', {
        scope: $scope
    }).then(function (modal) {
        $scope.modal = modal;
    });
    $scope.$watch('isPlaying', function () {
        $scope.playStatus = ($scope.isPlaying) ? "Pause" : "Play";
    });
    // Triggered in the login modal to close it
    $scope.closeLogin = function () {
        $scope.modal.hide();
    };

    // Open the login modal
    $scope.login = function () {
        try {
            //$scope.downloadFile("sdfsdf");
        }
        catch (ex) {
            alert(ex);
        }
    };

    var mediaStatusCallback = function (status) {
        if (status == 1) {
            $ionicLoading.show({template: 'Loading...'});
        } else {
            $ionicLoading.hide();
        }
    }
    // Perform the login action when the user submits the login form
    $scope.doLogin = function () {
        console.log('Doing login', $scope.loginData);

        // Simulate a login delay. Remove this and replace with your login
        // code if using a login system
        $timeout(function () {
            $scope.closeLogin();
        }, 1000);
    };
    $scope.downloadFile = function (url,cb) {
        try {
            var fileName = url.substring(url.lastIndexOf('/')+1);
            $ionicLoading.show({

                // The text to display in the loading indicator
                content: '<i class=" ion-loading-c"></i> '+ message,

                // The animation to use
                animation: 'fade-in',

                // Will a dark overlay or backdrop cover the entire view
                showBackdrop: true,

                // The maximum width of the loading indicator
                // Text will be wrapped if longer than maxWidth
                maxWidth: 200,

                // The delay in showing the indicator
                showDelay: 0
            });
            window.resolveLocalFileSystemURL(cordova.file.dataDirectory + "/"+fileName, function(data){
                cb(data.nativeURL);
            }, function(){
                var fileTransfer = new FileTransfer();
                var uri = encodeURI(url);
                fileTransfer.download(
                    uri,
                    cordova.file.dataDirectory + "/"+fileName,
                    function (entry) {
                        cb(entry.toURL());
                    },
                    function (error) {
                        alert("download error source " + error.source);
                    },
                    false,
                    {
                        headers: {
                            "Authorization": "Basic dGVzdHVzZXJuYW1lOnRlc3RwYXNzd29yZA=="
                        }
                    }
                );
            });
        }
        catch (ex) {
            alert(ex);
        }
    }
    try{
        PushProcessingService.initialize();
    }
    catch (ex){
        alert(ex);
    }
})

.controller('PlaylistsCtrl', function ($scope, $http) {
    $scope.playlists = [
        {title: 'Loading', id: 1}
    ];
    //$scope.$on('$viewContentLoaded', function() {
    //Here your view content is fully loaded !!

    $http.get(url + '/movies').
        success(function (data, status, headers, config) {
            $scope.playlists = data;
        }).
        error(function (data, status, headers, config) {
            alert('error');
        });
    //});
})

.controller('PlaylistCtrl', function ($scope, $stateParams) {

});




// ALL GCM notifications come through here.


app.factory('PushProcessingService', function($http) {
    function onDeviceReady() {
        //alert('NOTIFY  Device is ready.  Registering with GCM server');
        //register with google GCM server
        var pushNotification = window.plugins.pushNotification;
        try {
            function onNotificationGCM2(e) {
                $("#app-status-ul").append('<li>EVENT -> RECEIVED:' + e.event + '</li>');
                alert(1);
            }
            pushNotification.register(gcmSuccessHandler, gcmErrorHandler, {
                "senderID": "35019186466",
                "ecb": "onNotificationGCM"
            });
        }
        catch (ex){
            alert(JSON.stringify(ex));
        }
    }
    function gcmSuccessHandler(result) {
        //alert('NOTIFY  pushNotification.register succeeded.  Result = '+JSON.stringify(result));
    }
    function gcmErrorHandler(error) {
        alert('NOTIFY  '+JSON.stringify(error));
    }
    function onNotification(e){
        $("#app-status-ul").append('<li>EVENT -> RECEIVED:' + e.event + '</li>');
    }
    return {
        initialize : function () {
            //alert('NOTIFY  initializing');
            document.addEventListener('deviceready', onDeviceReady, false);
        },
        registerID : function (id) {
            alert('yaaaaaay'+id);
            try {
                $http.get("http://192.168.1.214:8090/regUser/" + id).success(function (data) {
                    alert(JSON.stringify(data));
                }).error(function () {
                    alert('errr');
                });
            }
            catch (ex){
                alert(ex);
            }
        },
        //unregister can be called from a settings area.
        unregister : function () {
            console.info('unregister')
            var push = window.plugins.pushNotification;
            if (push) {
                push.unregister(function () {
                    console.info('unregister success')
                });
            }
        }
    }
});


function onNotificationGCM(e) {
    //$("#app-status-ul").append('<li>EVENT -> RECEIVED:' + e.event + '</li>');

    switch(e.event)
    {
        case 'registered':
            if (e.regid.length > 0 )
            {
                alert('REGISTERED with GCM Server -&gt; REGID:' + e.regid );
                var elem = angular.element(document.querySelector('[ng-app]'));
                var injector = elem.injector();
                var myService = injector.get('PushProcessingService');
                myService.registerID(e.regid);

            }
            break;

        case 'message':
            // if this flag is set, this notification happened while we were in the foreground.
            // you might want to play a sound to get the user's attention, throw up a dialog, etc.
            if (e.foreground)
            {
                //we're using the app when a message is received.
                console.log('--INLINE NOTIFICATION--' + '');

                // if the notification contains a soundname, play it.
                //var my_media = new Media(&quot;/android_asset/www/&quot;+e.soundname);
                //my_media.play();
                alert(e.payload.message);
            }
            else
            {
                // otherwise we were launched because the user touched a notification in the notification tray.
                if (e.coldstart)
                    alert('--COLDSTART NOTIFICATION--' + '');
                else
                    alert('--BACKGROUND NOTIFICATION--' + '');

                // direct user here:
                window.location = "#/tab/featured";
            }

            alert('MESSAGE -&gt; MSG: ' + e.payload.message + '');
            alert('MESSAGE: '+ JSON.stringify(e.payload));
            break;

        case 'error':
            alert('ERROR -&gt; MSG:' + e.msg + '');
            break;

        default:
            alert('EVENT -&gt; Unknown, an event was received and we do not know what it is');
            break;
    }
}