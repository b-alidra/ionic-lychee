angular.module('lychee.services', [])

/**
 * Local storage services
 */
.factory('$localStorage', ['$window', function($window) {
    return {
        set: function(key, value) {
            $window.localStorage[key] = value;
        },
        unset: function(key, value) {
            delete $window.localStorage[key];
        },
        get: function(key, defaultValue) {
            return $window.localStorage[key] || defaultValue;
        },
        setObject: function(key, value) {
            $window.localStorage[key] = JSON.stringify(value);
        },
        getObject: function(key) {
            return JSON.parse($window.localStorage[key] || '{}');
        }
    }
}])

/**
 * Navigation helper service
 */
.factory('$navHelper', ['$window', '$ionicHistory', '$state', function($window, $ionicHistory, $state) {
    return {
        goHome: function() {
            $ionicHistory.nextViewOptions({
                disableBack: true
            });
            $state.go("app.home");
        },
        startApp: function() {
            $ionicHistory.nextViewOptions({
                disableBack: true
            });
            $state.go("app.albums");
        }
    };
}])

/**
 * Lychee API client
 */
.factory('$api', [ '$http', '$localStorage', function($http, $localStorage) {
    return {
        /**
         * Fetch the albums:
         * - all if the user is logged in
         * - only the public ones otherwise
         */
        getAlbums: function(callback) {
            var lychee_url = $localStorage.get('lychee_url');
            var api_url    = lychee_url + '/php/api.php';

            $http({
                "method": 'get',
                "url": api_url + '?function=Album::getAll',
                "format": 'json'
            }).then(function successCallback(response) {
                var albums = [];
                angular.forEach(response.data.albums, function(a) {
                    // Fix thumbs url
                    if (a.thumbs.length > 0)
                        a.thumbs[0] = lychee_url + '/' + a.thumbs[0];
                    albums.push(a);
                });
                callback && callback(null, albums);
            }, function errorCallback(response) {
                callback && callback({"error": true});
            });
        },

        /**
         * Fetch one album
         */
        getAlbum: function(albumID, callback) {
            var lychee_url = $localStorage.get('lychee_url');
            var api_url    = lychee_url + '/php/api.php';

            $http.post(api_url, {
                "function": "Album::get",
                "albumID": albumID,
                "password": ""
            })
            .then(function successCallback(response) {

                var album  = response.data;
                var photos = [];

                angular.forEach(album.content, function(p) {
                    // Fix big and thumbs urls
                    p.url      = lychee_url + '/' + p.url;
                    p.thumbUrl = lychee_url + '/' + p.thumbUrl;

                    photos.push(p);
                });

                album.photos = photos;
                delete(album.content);

                callback && callback(null, album);
            }, function errorCallback(response) {
                callback && callback({"error": true});
            });
        },

        /**
         * Fetch one photo
         */
        getPhoto: function(photoID, albumID, callback) {
            var lychee_url = $localStorage.get('lychee_url');
            var api_url    = lychee_url + '/php/api.php';

            $http.post(api_url, {
                "function": "Photo::get",
                "photoID": photoID,
                "albumID": albumID,
                "password": ""
            })
            .then(function successCallback(response) {
                var photo  = response.data;

                // Fix big and thumbs urls
                photo.url      = lychee_url + '/' + photo.url;
                photo.thumbUrl = lychee_url + '/' + photo.thumbUrl;

                callback && callback(null, photo);
            }, function errorCallback(response) {
                callback && callback({"error": true});
            });
        },

        /**
         * User login
         */
        login: function(username, password, callback) {
            $http.post($localStorage.get('lychee_url') + '/php/api.php', {
                "function": "Session::login",
                "user": username,
                "password": password
            })
            .then(function successCallback(response) {
                if (response.data) {
                    $localStorage.set('username', username);
                    $localStorage.set('password', password);
                }
                callback && callback(null, response.data)
            }, function errorCallback(response) {
                callback && callback({"error": response.statusText});
            });
        },

        /**
         * User logout
         */
        logout: function(callback) {
            $http.post($localStorage.get('lychee_url') + '/php/api.php', {
                "function": "Session::logout"
            })
            .then(function successCallback(response) {
                $localStorage.unset('username');
                $localStorage.unset('password');
                callback && callback(null, response.data)
            }, function errorCallback(response) {
                callback && callback({"error": response.statusText});
            });
        },

        /**
         * User login
         */
        addAlbum: function(title, callback) {
            $http.post($localStorage.get('lychee_url') + '/php/api.php', {
                "function": "Album::add",
                "title": title
            })
            .then(function successCallback(response) {
                alert(JSON.stringify(response));
                callback && callback(null, response.data)
            }, function errorCallback(response) {
                callback && callback({"error": response.statusText});
            });
        },
    };
}]);
