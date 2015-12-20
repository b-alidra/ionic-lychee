angular.module('lychee.controllers', ['lychee.services'])

.controller('MenuCtrl', function() {})

.controller('AppCtrl', function($scope, $rootScope, $api, $state, $ionicHistory, $localStorage, $navHelper) {
    $scope.error  = "";
    $scope.lychee = { "url": $localStorage.get("lychee_url") };

    $scope.storeLycheeUrl = function() {
        $localStorage.set("lychee_url", $scope.lychee.url);
        checkLogin();
    };

    $scope.disconnect = function() {
        $localStorage.unset('lychee_url');
        $navHelper.goHome();
    };

    if ($scope.lychee.url && $scope.lychee.url.length) {
        checkLogin();
    }

    function checkLogin() {
        stored_username = $localStorage.get('username', 'undefined');
        stored_password = $localStorage.get('password', 'undefined');

        if (!$rootScope.loggedIn &&
            stored_username != 'undefined' &&
            stored_password != 'undefined' ) {

            $api.login(stored_username, stored_password, function(err, loggedIn) {
                if (err)
                    loggedIn = false;

                $rootScope.loggedIn = loggedIn;
                $navHelper.startApp();
            });
        }
        else {
            $navHelper.startApp();
        }
    }
})

.controller('AlbumsCtrl', function($scope, $rootScope, $api, $ionicModal, $localStorage) {
    $scope.loginData = {
        "username": $localStorage.get('username'),
        "password": $localStorage.get('password')
    };
    $scope.login_error = "";

    $scope.refresh = function() {
        $api.getAlbums(function(err, albums) {
            if (!err)
                $scope.albums = albums;
            $scope.$broadcast('scroll.refreshComplete');
        });
    };

    $scope.login = function() {
        $ionicModal.fromTemplateUrl('templates/login.html', {
        scope: $scope,
        animation: 'fade-in'
        }).then(function(modal) {
            $scope.modal = modal;
            $scope.modal.show();
        });
    }

    $scope.doLogin = function() {
        $api.login($scope.loginData.username, $scope.loginData.password, function(err, loggedIn) {
            if (err)
                $loggedIn = false;

            $rootScope.loggedIn = loggedIn;

            if (!loggedIn)
                $scope.login_error = "Can't connect. Please check your infos.";
            else {
                $scope.login_error = "";
                $scope.closeLogin();
                $scope.refresh();
            }
        });
    };

    $scope.logout = function() {
        $api.logout(function(err, loggedOut) {
            if (!err && loggedOut)
                $rootScope.loggedIn = false;

            $scope.closeLogin();
            $scope.refresh();
        });
    };

    $scope.closeLogin = function() {
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

alert('in');
    $scope.refresh();
})

.controller('AlbumCtrl', function($scope, $api, $stateParams, $ionicModal, $ionicSlideBoxDelegate) {
    $scope.album        = {};
    $scope.slides       = [];
    $scope.currentPhoto = null;
    $scope.showInfos    = false;
    $scope.highRes      = false;
    $scope.rotation     = 0;

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
        $scope.rotation     = 0;
        $scope.currentPhoto = $scope.album.photos[index];
        loadPhotoInfos(index);
    };

    $scope.toggleInfos = function() { $scope.showInfos = !$scope.showInfos; }
    $scope.toggleResolution = function() {
        $scope.highRes = !$scope.highRes;
        $scope.showInfos = false;
    }
    $scope.rotateRight = function() { $scope.rotation += 90; }
    $scope.rotateLeft = function() { $scope.rotation  -= 90; }

    var loadPhotoInfos = function(index) {
        $api.getPhoto($scope.currentPhoto.id, $stateParams.albumID, function(err, photo) {
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
