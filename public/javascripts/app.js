
// Declare app
var app = angular.module('app', [
    'ngResource',
    'ui.bootstrap',
    'ngRoute'
]);

// Declare public directory
app.constant('appSettings', {
    'appLocation': 'http://localhost:9000/',
    'publicDir': 'assets/',
    'userModel': 'users/'
});


// Routing
// Note the resolve assets loader. It's a light-weight factory i wrote which handles module managment and on-demand assets loading instead of requireJS
// It does NOT does async loading. 

  
app.config(function ($routeProvider, $controllerProvider, $provide, $httpProvider, appSettings) {
    $routeProvider.when('/home', {
        resolve: {
            load: function ($q, loadAssets) {

                // use promises to load needed assets and modules before showing the view. Avoid loading glitch and/or startup load delay
                files = ['services/userDataHandler.js', 'controllers/homeControllers.js', 'home.css', 'favicon.png'];
                return $q.all(files.map(loadAssets.startLoad));
            }
        },
        templateUrl: appSettings.publicDir + 'views/home.html'
    }).
    otherwise({
        redirectTo: '/home'
    });

    // create representations for the provides, later will be used to dynamically register factories and controllers
    app.controllerProvider = $controllerProvider.register;
    app.provideFactory = $provide.factory;


    /* You can also load if needed
      app.compileProvider = $compileProvider;
      app.routeProvider = $routeProvider;
      app.filterProvider = $filterProvider;
    */


});




// This is load Assets factory
app.factory('loadAssets', function ($q, appSettings) {

    var jsPath = appSettings.publicDir + "javascripts/",
        cssPath = appSettings.publicDir + "stylesheets/",
        imagesPath = appSettings.publicDir + "images/",
        head = document.getElementsByTagName("head")[0]; // define starting paths for each file tile

    return {
        startLoad: function (url) {

                var fileType = url.split(".").slice(-1);  // we must get (length - 1) because filenames like jquery.min.js     
                
                /* prevent duplicate loading - 
                   check if url exist in already loaded assets
                   
                   1. If asset exist, return true and quit.
                   2. If asset doesn't exist - add it.
                   3. If loadedAssets is undefined (first time you load something) - create this array.
                */

                if (this.loadedAssets == undefined || this.loadedAssets == null) {
                    this.loadedAssets = [];
                }
               
                if (this.loadedAssets.indexOf(url) >= 0) { // note that indexOf supported only in ie9+ , add fallback if you want to support legacy browsers.
                    return true;
                }

                this.loadedAssets.push.apply(this.loadedAssets, [url]);

                // load js files
                if (fileType == "js") {
                    var jsFile = document.createElement("script");
                    jsFile.src = jsPath + url;
                    head.appendChild(jsFile);
                    var waitforload = $q.defer();

                    jsFile.onload = function () {
                        waitforload.resolve(jsFile);
                    };
                    jsFile.onerror = function (e) {
                        waitforload.reject(e);
                        console.log("Could not load " + jsFile.src);
                    };

                    return waitforload.promise;
                }

                // load css files
                if (fileType == "css") {
                    var cssFile = document.createElement("link");
                    cssFile.setAttribute("rel", "stylesheet");
                    cssFile.setAttribute("type", "text/css");
                    cssFile.setAttribute("href", cssPath+url);
                    head.appendChild(cssFile);
                }


                // load images
                if (fileType == "jpg" || fileType == "jpeg" || fileType == "png" || fileType == "gif") {
                    var waitforload = $q.defer();
                    var image = new Image();
                    image.src = imagesPath + url;

                    image.onload = function () {
                        waitforload.resolve(image);
                    };
                    image.onerror = function (e) {
                        waitforload.reject(e);
                        console.log("Could not load " + image.src);
                    };
                        
                    return waitforload.promise;
                }
                
        },
        loadedAssets: this.loadedAssets
    }

});