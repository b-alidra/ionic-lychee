var api_host = 'https://photos.b-alidra.com' + '/php/api.php'; //window.localStorage.getItem("lychee_url") + '/php/api.php';

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
})

.controller('AlbumsCtrl', function($scope, $api) {
    $scope.refresh = function() {
        $api.getAlbums(function(err, albums) {
            if (!err)
            $scope.albums = albums;
            $scope.$broadcast('scroll.refreshComplete');
        });
    };
})

.controller('AlbumCtrl', function($scope, $api, $stateParams, $ionicModal, $ionicScrollDelegate, $ionicSlideBoxDelegate) {
    $scope.photos      = [];
    $scope.slides      = [];
    var first_shown_index = 0;

    $scope.refresh = function() {
        $api.getAlbum($stateParams.albumID, function(err, photos) {
            if (!err)
            $scope.photos = photos;
            $scope.$broadcast('scroll.refreshComplete');
        });
    };

    $scope.showGallery = function(index) {
        $scope.slides      = [];
        $scope.activeSlide = 0;
        first_shown_index  = index;

        if (index >= 0) {
            $scope.slides.push($scope.photos[index - 1]);
            $scope.activeSlide ++;
        }
            $scope.slides.push($scope.photos[index]);
        if (index < $scope.photos.length - 1)
            $scope.slides.push($scope.photos[index + 1]);
            $ionicSlideBoxDelegate.update();
        $ionicModal.fromTemplateUrl('templates/gallery.html', {
            scope: $scope,
            animation: 'fade-in'
        }).then(function(modal) {
            $scope.modal = modal;
            $scope.modal.show();
        });

        $ionicSlideBoxDelegate.update();
    };

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

    $scope.slideChanged = function(index) {
        if ($scope.slides.length > 0) {
            index += first_shown_index;
        }
        else
            $scope.activeSlide = index - first_shown_index + 1;
        if (index > 0 && ($scope.slides.length == 0 || first_shown_index > index))
            $scope.slides.unshift($scope.photos[index - 1]);
        if ($scope.slides.length <= 1)
            $scope.slides.push($scope.photos[index]);
        if (index < $scope.photos.length - 1 && ($scope.slides.length == 2 || first_shown_index < index))
            $scope.slides.push($scope.photos[index + 1]);
            $ionicSlideBoxDelegate.update();
    };
});
