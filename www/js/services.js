angular.module('lychee.services', [])

/**
 * Local storage services
 */
.factory('$localStorage', ['$window', function($window) {
    return {
        set: function(key, value) {
            $window.localStorage[key] = value;
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
 * Lychee API client
 */
.factory('$api', [ '$http', '$localStorage', function($http, $localStorage) {
    var lychee_url = $localStorage.get('lychee_url');
    var api_url    = lychee_url + '/php/api.php';

    return {
        /**
         * Fetch all the public albums
         */
        getAlbums: function(callback) {
            $http({
                "method": 'get',
                "url": api_url + '?function=Album::getAll',
                "format": 'json'
            }).then(function successCallback(response) {
                var albums = [];
                angular.forEach(response.data.albums, function(a) {
                    // Fix thumbs url
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
            $http.post(api_url, {
                "function": "Album::get",
                "albumID": albumID,
                "password": ""
            })
            .then(function successCallback(response) {
                var photos = [];
                angular.forEach(response.data.content, function(p) {
                    // Fix big and thumbs urls
                    p.url      = lychee_url + '/' + p.url;
                    p.thumbUrl = lychee_url + '/' + p.thumbUrl;
                    p.prevUrl  = lychee_url + '/uploads/thumb/' + p.previousPhoto;
                    p.nextUrl  = lychee_url + '/uploads/thumb/' + p.nextPhoto;

                    photos.push(p);
                });
                callback && callback(null, photos);
            }, function errorCallback(response) {
                callback && callback({"error": true});
            });
        }
    };
}]);
