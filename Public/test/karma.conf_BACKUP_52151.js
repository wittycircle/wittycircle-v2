// Karma configuration
// http://karma-runner.github.io/0.12/config/configuration-file.html
// Generated on 2015-09-10 using
// generator-karma 1.0.0

module.exports = function(config) {
  'use strict';

  config.set({
    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,

    // base path, that will be used to resolve files and exclude
    basePath: '../',

    // testing framework to use (jasmine/mocha/qunit/...)
    // as well as any additional frameworks (requirejs/chai/sinon/...)
    frameworks: [
      "jasmine"
    ],

    // list of files / patterns to load in the browser
    files: [
      // bower:js
      'bower_components/jquery/dist/jquery.js',
      'bower_components/angular/angular.js',
      'bower_components/bootstrap/dist/js/bootstrap.js',
      'bower_components/angular-animate/angular-animate.js',
      'bower_components/angular-aria/angular-aria.js',
      'bower_components/angular-cookies/angular-cookies.js',
      'bower_components/angular-resource/angular-resource.js',
      'bower_components/angular-route/angular-route.js',
      'bower_components/angular-sanitize/angular-sanitize.js',
      'bower_components/angular-touch/angular-touch.js',
      'bower_components/angular-bootstrap/ui-bootstrap-tpls.js',
      'bower_components/angular-ui-router/release/angular-ui-router.js',
      'bower_components/angular-material/angular-material.js',
      'bower_components/ngmap/build/scripts/ng-map.js',
      'bower_components/angular-mocks/angular-mocks.js',
      'bower_components/oi.select/dist/select-tpls.min.js',
      'bower_components/angular-custom-select/dist/angular-custom-select.min.js',
      'bower_components/ng-file-upload/ng-file-upload.js',
      'bower_components/angular-tooltips/dist/angular-tooltips.min.js',
      'bower_components/angular-toArrayFilter/toArrayFilter.js',
      'bower_components/blueimp-load-image/js/load-image.js',
      'bower_components/blueimp-load-image/js/load-image-ios.js',
      'bower_components/blueimp-load-image/js/load-image-orientation.js',
      'bower_components/blueimp-load-image/js/load-image-meta.js',
      'bower_components/blueimp-load-image/js/load-image-exif.js',
      'bower_components/blueimp-load-image/js/load-image-exif-map.js',
      'bower_components/blueimp-canvas-to-blob/js/canvas-to-blob.js',
      'bower_components/blueimp-file-upload/js/jquery.fileupload.js',
      'bower_components/lodash/lodash.js',
      'bower_components/cloudinary_js/js/jquery.cloudinary.js',
      'bower_components/cloudinary_ng/js/angular.cloudinary.js',
      'bower_components/angular-css/angular-css.js',
      'bower_components/angular-bcrypt/dist/dtrw.bcrypt-df34c8d1.js',
      'bower_components/angular-socket-io/socket.js',
      // endbower
      "app/scripts/**/*.js",
      "test/mock/**/*.js",
      "test/spec/**/*.js"
    ],

    // list of files / patterns to exclude
    exclude: [
    ],

    // web server port
    port: 8080,

    // Start these browsers, currently available:
    // - Chrome
    // - ChromeCanary
    // - Firefox
    // - Opera
    // - Safari (only Mac)
    // - PhantomJS
    // - IE (only Windows)
    browsers: [
      "PhantomJS"
    ],

    // Which plugins to enable
    plugins: [
      "karma-phantomjs-launcher",
      "karma-jasmine"
    ],

    // Continuous Integration mode
    // if true, it capture browsers, run tests and exit
    singleRun: false,

    colors: true,

    // level of logging
    // possible values: LOG_DISABLE || LOG_ERROR || LOG_WARN || LOG_INFO || LOG_DEBUG
    logLevel: config.LOG_INFO,

    // Uncomment the following lines if you are using grunt's server to run the tests
    // proxies: {
    //   '/': 'http://localhost:9000/'
    // },
    // URL root prevent conflicts with the site root
    // urlRoot: '_karma_'
  });
};
