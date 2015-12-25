angular.module('lychee.controllers', ['lychee.services'])

.controller('MenuCtrl', function() {})

.controller('AppCtrl', function($scope, $rootScope, $api, $state, $ionicHistory, $localStorage, $navHelper, $uploader, $ionicPlatform) {

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

.controller('AlbumsCtrl', function($scope, $rootScope, $state, $api, $ionicModal, $localStorage, $uploader) {

    $scope.refresh = function() {
        $api.getAlbums(function(err, albums) {
            if (!err)
            $scope.albums = albums;
            $scope.$broadcast('scroll.refreshComplete');
        });
    };
    $scope.refresh();

    /* Login stuff */
    $scope.loginData = {
        "username": $localStorage.get('username'),
        "password": $localStorage.get('password')
    };
    $scope.login_error = "";

    $scope.showLogin = function() {
        $ionicModal.fromTemplateUrl('templates/login.html', {
            scope: $scope,
            animation: 'slide-in-up',
            focusFirstInput: true
        }).then(function(modal) {
            $scope.loginModal = modal;
            $scope.loginModal.show();
        });
    }

    $scope.doLogin = function() {
        $api.login($scope.loginData.username, $scope.loginData.password, function(err, loggedIn) {
            if (err)
            loggedIn = false;

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
        $scope.loginModal.hide();
        $scope.loginModal.remove()
    };

    /* New album stuff */
    $scope.newAlbumData = { "title": "" };
    $scope.add_album_error = "";

    $scope.showAddAlbum = function() {
        $ionicModal.fromTemplateUrl('templates/add_album.html', {
            scope: $scope,
            animation: 'slide-in-up',
            focusFirstInput: true
        }).then(function(modal) {
            $scope.addAlbumModal = modal;
            $scope.addAlbumModal.show();
        });
    }

    $scope.doAddAlbum = function() {
        $api.addAlbum($scope.newAlbumData.title, function(err, albumId) {
            if (err)
            added = false;

            if (!albumId)
            $scope.add_album_error = "Can't add album. An error occured.";
            else {
                $scope.add_album_error = "";
                $scope.closeAddAlbum();
                $scope.refresh();
            }
        });
    };

    $scope.closeAddAlbum = function() {
        $scope.addAlbumModal.hide();
        $scope.addAlbumModal.remove()
    };


    $scope.$on('$destroy', function() {
        try{
            $scope.loginModal && $scope.loginModal.remove();
            $scope.addAlbumModal && $scope.addAlbumModal.remove();
        } catch(err) {
            console.log(err.message);
        }
    });

    // Proxy to $uploader methods
    $scope.showUploads  = function() { $uploader.showUploads(); }
    $scope.isUploading  = function() { return $uploader.isUploading(); }
})

.controller('AlbumCtrl', function($scope, $rootScope, $api, $stateParams, $ionicPlatform, $ionicModal, $ionicSlideBoxDelegate, $uploader) {
    /* Gallery stuff */
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
            animation: 'slide-in-up'
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
            $scope.modal && $scope.modal.remove();
        } catch(err) {
            console.log(err.message);
        }
    });

    // Proxy to $uploader methods
    $scope.choosePhotos = function() { $uploader.choosePhotos($scope.album.id, $scope.album.title); }
    $scope.showUploads  = function() { $uploader.showUploads(); }
    $scope.isUploading  = function() { return $uploader.isUploading(); }
});
