var url="http://192.168.1.214:8090";

angular.module('starter.controllers', [])

.controller('AppCtrl', function($scope, $ionicModal, $timeout,$cordovaMedia) {
  // Form data for the login modal
  $scope.loginData = {};
  $scope.media=null;
  $scope.isPlaying=false;
  $scope.playStatus="Play";
  $scope.queue=[];
  $scope.totalDuration=null;
  $scope.timeElapsed=0;
  $scope.stopSong= function () {
    $scope.isPlaying = false;
    $cordovaMedia.pause($scope.media);
  };
  $scope.playNext=function(){
    alert(JSON.stringify($scope.queue));
    $scope.currentSong = $scope.queue.shift();
    console.log($scope.currentSong);
    var mediaStatusCallback=function(mediaState){
      switch (mediaState){
        case Media.MEDIA_STOPPED:
          //$scope.playNext();
          break;
      }
    }
    $scope.media= new Media($scope.currentSong.url, null, null, mediaStatusCallback);
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
    }, 1000);
  }
  $scope.addSong=function(movieOrSong,queue){
    try {
      console.log(movieOrSong);
      $scope.isPlaying = true;

      if (!queue) {
        $scope.queue = [];
        try {
          $cordovaMedia.stop($scope.media);
        }
        catch(ex){
          alert(ex);
        }
      }
      for (var k in movieOrSong.songs) {
        $scope.queue.push(movieOrSong.songs[k]);
      }
      $scope.playNext();
    }
    catch(ex){
     alert(ex);
    }
  };
  // Create the login modal that we will use later
  $ionicModal.fromTemplateUrl('templates/login.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modal = modal;
  });
  $scope.$watch('isPlaying',function(){
    $scope.playStatus = ($scope.isPlaying)?"Pause":"Play";
  });
  // Triggered in the login modal to close it
  $scope.closeLogin = function() {
    $scope.modal.hide();
  };

  // Open the login modal
  $scope.login = function() {
    try {
      var media = new Media($scope.currentSong.url, null, null, mediaStatusCallback);
      $cordovaMedia.play(media);
    }
    catch (ex){
      alert(ex);
    }
  };

  var mediaStatusCallback = function(status) {
    if(status == 1) {
      $ionicLoading.show({template: 'Loading...'});
    } else {
      $ionicLoading.hide();
    }
  }
  // Perform the login action when the user submits the login form
  $scope.doLogin = function() {
    console.log('Doing login', $scope.loginData);

    // Simulate a login delay. Remove this and replace with your login
    // code if using a login system
    $timeout(function() {
      $scope.closeLogin();
    }, 1000);
  };
})

.controller('PlaylistsCtrl', function($scope,$http) {
  $scope.playlists = [
    { title: 'Loading', id: 1 }
  ];
  //$scope.$on('$viewContentLoaded', function() {
    //Here your view content is fully loaded !!

    $http.get(url+'/movies').
        success(function(data, status, headers, config) {
          $scope.playlists = data;
        }).
        error(function(data, status, headers, config) {
           alert('error');
        });
  //});
})

.controller('PlaylistCtrl', function($scope, $stateParams) {

});
