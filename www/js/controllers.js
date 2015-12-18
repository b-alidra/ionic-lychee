angular.module('lychee.controllers', ['lychee.services'])

.controller('AppCtrl', function($scope, $state, $ionicHistory, $localStorage) {

    $scope.lychee_url = $localStorage.get("lychee_url");
    $scope.storeLycheeUrl = function() {
        $localStorage.set("lychee_url", $scope.lychee_url);
        $ionicHistory.nextViewOptions({
            disableBack: true
        });
        $state.go("app.albums");
    };

    if ($scope.lychee_url && $scope.lychee_url.length) {
        $ionicHistory.nextViewOptions({
            disableBack: true
        });
        $state.go("app.albums");
    }

    $scope.disconnect = function() {
        $localStorage.set('lychee_url', '');
        $ionicHistory.nextViewOptions({
            disableBack: true
        });
        $state.go("app.home");
    };
})

.controller('AlbumsCtrl', function($scope, $api) {
    $scope.refresh = function() {
        $api.getAlbums(function(err, albums) {
            if (!err)
                $scope.albums = albums;
        });
    };
})

.controller('AlbumCtrl', function($scope, $api, $stateParams, $ionicModal, $ionicSlideBoxDelegate) {
    $scope.album        = {};
    $scope.slides       = [];
    $scope.currentPhoto = null;
    $scope.showInfos    = false;
    $scope.highRes      = false;

    $scope.refresh = function() {
        $api.getAlbum($stateParams.albumID, function(err, album) {
            if (!err)
                $scope.album = album;
        });
    };

    $scope.showGallery = function(index) {
        $scope.activeSlide  = index;
        $scope.currentPhoto = $scope.album.photos[index];
        $scope.showInfos    = false;
        loadPhotoInfos(index);

        $ionicModal.fromTemplateUrl('templates/gallery.html', {
            scope: $scope,
            animation: 'fade-in'
        }).then(function(modal) {
            $scope.modal = modal;
            $scope.modal.show();
        });
    };

    $scope.slideChanged = function(index) {
        $scope.currentPhoto = $scope.album.photos[index];
        loadPhotoInfos(index);
    };

    $scope.toggleInfos = function() { $scope.showInfos = !$scope.showInfos; }
    $scope.toggleResolution = function() {
        $scope.highRes = !$scope.highRes;
        $scope.showInfos = false;
    }

    var loadPhotoInfos = function(index) {
        $api.getPhoto($scope.currentPhoto.id, $stateParams.albumID, function(err, photo) {
            console.log(photo);
            $scope.currentPhoto = photo;
        });
    };
    $scope.mustBeVisible = function(index) {
        return Math.abs($ionicSlideBoxDelegate.currentIndex() - index) < 5;
    }

    $scope.closeModal = function() {
        $scope.modal.hide();
        $scope.modal.remove()
    };

    $scope.$on('$destroy', function() {
        try{
          $scope.modal.remove();
        } catch(err) {
          console.log(err.message);
        }
      });
});
