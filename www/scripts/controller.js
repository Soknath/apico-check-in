// controller.js
'use strict';
app.controller('SlidingMenuController', function($scope){
  
    $scope.checkSlidingMenuStatus = function(){
      
        $scope.slidingMenu.on('postclose', function(){
            $scope.slidingMenu.setSwipeable(false);
        });
        $scope.slidingMenu.on('postopen', function(){
            $scope.slidingMenu.setSwipeable(true);
        });
    };
  
    $scope.checkSlidingMenuStatus();
});

//Map controller
app.controller('MapController', ['$scope','$http', '$window', 'leafletData', 'myService', function ($scope, $http, $window, leafletData, myService) {
    
    if ($window.localStorage["userId"] === undefined) {
      $window.location.href = 'index.html';
    } else {
    // extend tile GWClayer
      
      var powermap_th = new myService.powermapTile("tile.powermap.in.th", {key: 'e10adc3949ba59abbe56e057f20f883e' });
      var osm = L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png');
      var googleSat = L.tileLayer('http://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',{
        maxZoom: 22,
        subdomains:['mt0','mt1','mt2','mt3']
      });
      var baselayers = {
        "Powermap": powermap_th,
        "OSM": osm,
        "Google Satellite": googleSat,
      };
      var marker = L.marker([14, 100]);
      leafletData.getMap().then(function(map){
        // console.log(map);
        powermap_th.addTo(map);
        new L.control.layers(baselayers).addTo(map);
        document.addEventListener("deviceready", function(){
   
             var onSuccess = function(position){
              // alert( "Longitude:" + position.coords.longitude + "\n" +
              //  "Latitude:" + position.coords.latitude)};
                $scope.lat = position.coords.latitude;
                $scope.lng = position.coords.longitude;
                marker.setLatLng([$scope.lat, $scope.lng]);
                marker.addTo(map);
                map.setView(marker.getLatLng());
                map.on('move',function(){
                  var center = map.getCenter();
                  marker.setLatLng(center);
                  hideButton(map);
                })
             };
             var onError = function(message){
                ons.notification.alert({
                    message:"Sorry we can not get your current location; either you have disable location service or GPS signal is low at the moment",
                });
              
                // marker.setLatLng([14,100]);
                marker.addTo(map);
                map.setView(marker.getLatLng());
                map.on('move',function(){
                  var center = map.getCenter();
                  marker.setLatLng(center);
                  hideButton(map);
                })
             };
           
             var option = {
              frequency: 5000,
              timeout: 6000
             };
             navigator.geolocation.getCurrentPosition(onSuccess, onError, option);
           });
           

        ///////////////////////////////////////////////////////////////////

        // map.on('locationfound', function(e){
        //   marker.setLatLng(e.latlng);
        // });
        // map.on('locationerror', function(e){
        //   // alert(e.message);
        //   ons.notification.alert({
        //     message: 'Sorry we can not get your current location; either you have disable location service or GPS signal is low at the moment'
        //   });
        // });
        // map.locate({setView: true, maxZoom: 16, enableHighAccuracy: true});

        ///////////////////////////////////////////////////////////////////

        map.setZoom(16, {animate: true});
      });
          $scope.checkInHere = function(){
            leafletData.getMap().then(function(map){
              $window.localStorage['lat'] = map.getCenter().lat;
              $window.localStorage['lng'] = map.getCenter().lng;
            });
              $window.location.href = 'navForm.html';
          };

          // hide button if zoom less then 17
          function hideButton(map){
            if (map.getZoom() >= 17 ){
              $scope.ShowAddPoi = true;
              $scope.ShowNearPoi = true;
            } else {
              $scope.ShowAddPoi = false;
              $scope.ShowNearPoi = false;
            }
          };

          $scope.currentLocation = function getlocation(){
            leafletData.getMap().then(function(map){
                // console.log(map);
                document.addEventListener("deviceready", function(){
       
                    var onSuccess = function(position){
                      // alert( "Longitude:" + position.coords.longitude + "\n" +
                      //  "Latitude:" + position.coords.latitude)};
                        $scope.lat = position.coords.latitude;
                        $scope.lng = position.coords.longitude;
                        map.panTo([$scope.lat, $scope.lng]);
                    };
                    var onError = function(message){
                        ons.notification.alert({
                            message:"Sorry we can not get your current location; either you have disable location service or GPS signal is low at the moment",
                        });
                    };
                   
                    var option = {
                      frequency: 5000,
                      timeout: 6000
                    };
                    navigator.geolocation.getCurrentPosition(onSuccess, onError, option);
                });
            });
          };
          
          var overlaymarker = L.featureGroup();
          leafletData.getMap().then(function(map){
              overlaymarker.addTo(map)
          });
          var nearbyIcon = L.icon({
              iconUrl: '/www/images/nearby_icon.png',

              iconSize:     [30, 30], // size of the icon
              iconAnchor:   [15, 30], // point of the icon which will correspond to marker's location
              popupAnchor:  [0, -30] // point from which the popup should open relative to the iconAnchor
          });
          $scope.getNearbyPoi = function(){
            leafletData.getMap().then(function(map){
              $http.get(myService.api_host + '/php/reversegeocode.php', {params: {
                  lat : map.getCenter().lat,
                  lng : map.getCenter().lng,
                  key: 'e10adc3949ba59abbe56e057f20f883e',
                  limit: 10}}).success(function (response) {
                      for (var i=0; i < response.length; i++){
                        if (response[i] == "no result found.") {
                          ons.notification.alert({
                            title: '',
                            message: 'ไม่มีสถานที่ใกล้เคียง',
                            buttonLabel: 'ตกลง',
                          });
                        };
                        L.marker([response[i].latitude, response[i].longitude], {icon: nearbyIcon}).bindPopup(response[i].name_t).addTo(overlaymarker);
                    };
                    map.fitBounds(overlaymarker.getbounds());
              });
            });
          };

          $scope.clearOverlay = function(){
            leafletData.getMap().then(function(map){
              if (map.hasLayer(overlaymarker)){
                // show button here
                overlaymarker.clearLayers();
              } else {  
              };
            });
          };
          
          // leafletData.getMap().then(function(map){
          //   map.on('move',function(){
          //       if (map.hasLayer(overlaymarker)){
          //           $scope.showOverlay = true;
          //       } else {
          //           $scope.showOverlay = flase;
          //       };
          //   })
          // });
          // 
          $scope.zoomin = function(){
            leafletData.getMap().then(function(map){
              map.zoomIn();
            });
          };
          
          $scope.zoomout = function(){
            leafletData.getMap().then(function(map){
              map.zoomOut();
            });
          };
  };
}]);

app.directive('ngThumb', ['$window', function($window) {
    var helper = {
        support: !!($window.FileReader && $window.CanvasRenderingContext2D),
        isFile: function(item) {
            return angular.isObject(item) && item instanceof $window.File;
        },
        isImage: function(file) {
            var type =  '|' + file.type.slice(file.type.lastIndexOf('/') + 1) + '|';
            return '|jpg|png|jpeg|bmp|gif|'.indexOf(type) !== -1;
        }
    };

    return {
        restrict: 'A',
        template: '<canvas/>',
        link: function(scope, element, attributes) {
            if (!helper.support) return;

            var params = scope.$eval(attributes.ngThumb);

            if (!helper.isFile(params.file)) return;
            if (!helper.isImage(params.file)) return;

            var canvas = element.find('canvas');
            var reader = new FileReader();

            reader.onload = onLoadFile;
            reader.readAsDataURL(params.file);

            function onLoadFile(event) {
                var img = new Image();
                img.onload = onLoadImage;
                img.src = event.target.result;
            }

            function onLoadImage() {
                var width = params.width || this.width / this.height * params.height;
                var height = params.height || this.height / this.width * params.width;
                canvas.attr({ width: width, height: height });
                canvas[0].getContext('2d').drawImage(this, 0, 0, width, height);
            }
        }
    };
}]);

app.controller('postController', ['$scope', '$http', '$window', 'FileUploader', 'myService' , function($scope, $http, $window, FileUploader, myService) {
        if ($window.localStorage["userId"] === undefined) {
          $window.location.href = 'index.html';
        } else {

        // create a blank object to handle form data.
          $scope.poi = {};
          var lat = $window.localStorage['lat'];
          var lng = $window.localStorage['lng'];

          // add userid to form invisibly
          $scope.poi.userid = $window.localStorage['userId'];
          $scope.poi.lat= lat,
          $scope.poi.lng= lng,
          $scope.cancelButton = function(){
            $window.location.href = 'navMap.html';
          }
          $scope.types = ["ท่องเที่ยว, บันเทิง, กีฬา", "ศูนย์การค้า, ร้านอาหาร, ร้านค้า", "ธนาคาร","หน่วยงาน, สถาบัน","การเดินทาง, การติดต่อสื่อสาร","อสังหาริมทรัพย์, หมู่บ้าน, โรงงาน","ตัวแทนจำหน่าย","อื่นๆ"];
        // calling our submit function.
          $scope.postData= function(){
          // Posting data to php file  
            $http({
              method  : 'POST',
              url     : myService.host + 'clone.php',
              data    : $scope.poi,     //forms user object
              headers : {'Content-Type': 'application/x-www-form-urlencoded'} 
             }).success(function(data) {
                if (data.errors) {
                  // Showing errors.
                  $scope.errorName = data.errors.name;
                  $scope.errorType = data.errors.type;
                  ons.notification.confirm({
                    message: data.errors.name,
                  });
                } else {
                  $scope.message = data.message;
                  // $scope.addedid = data.new_id[0];
                  ons.notification.alert({
                    title: "",
                    message: "การเพิ่มสถานที่เสร็จสมบูรณ์",
                    buttonLabel: "ตกลง",
                  });
                  // add pictures
                  uploader.uploadAll();
                  $window.location.href = 'navPoiList.html';
                };
          });
        };
        var userId = $window.localStorage['userId'];
        // $scope.stepsModel = [];
          var uploader = $scope.uploader = new FileUploader({
              url: 'upload_poi.php',
              formData: [{
                  userId: userId,
              }],
          });

          // FILTERS

          uploader.filters.push({
              name: 'imageFilter',
              fn: function(item /*{File|FileLikeObject}*/, options) {
                  var type = '|' + item.type.slice(item.type.lastIndexOf('/') + 1) + '|';
                  return '|jpg|png|jpeg|bmp|gif|'.indexOf(type) !== -1;
              }
          });
        };

}]);

app.controller('loginCtrl', ['$scope', '$window', '$http', 'myService', function($scope, $window, $http, myService) {
      $scope.$on("$destroy", function(){
          $("ons-page").css('background-image', 'url(images/BG Boot2.png)');
      });
      // navigate to map if already login 
      if ($window.localStorage["userId"] === undefined) {
        $scope.signIn = function(){
          $http({
                method  : 'POST',
                url     : myService.host + 'login.php',
                data    : $scope.user, //forms user object
                headers : {'Content-Type': 'application/x-www-form-urlencoded'} 
               })
                .success(function(data) {
                  if (data.errors) {
                    // Showing errors.
                    $scope.errorUsername = data.errors.username;
                    $scope.errorPassword = data.errors.password;
                  } else {
                    $scope.message = data.message;
                    if (data.message !== 'successful'){
                      ons.notification.alert({
                        title: '',
                        message: $scope.message,
                        buttonLabel: 'ตกลง',
                      });
                    } else {
                        $window.localStorage.setItem("lat", 14);
                        $window.localStorage.setItem("lng", 100);
                        $window.localStorage.setItem("userId", data.id);
                        $window.localStorage.setItem("username", data.username);
                        $window.localStorage.setItem("password", data.password);
                        $window.localStorage.setItem("name", data.name);
                        $window.localStorage.setItem("profile_link", '');
                        $window.location.href = 'navMap.html';
                    }
                  };
                });
        };
      } else {
            $window.location.href = 'navMap.html';
      }
       

        $scope.signUp = function(){
            $window.location.href = 'navSignup.html';
        };

        $scope.forgetPass = function(material) {
          var mod = material ? 'material' : undefined;
          ons.notification.alert({
            title: "แนะนำ",
            message: "กรุณาติดต่อ:serviceaits@aapico.com หรือ โทร 02-150-0538",
            buttonLabel: "ตกลง",
          });
        };
}]);

app.controller('signupCtrl', ['$scope', '$http', '$window', 'FileUploader', 'myService', function($scope, $http, $window, FileUploader, myService) {
      // create random id
      var rand = Math.floor((Math.random() * 100) + 1); 
      var d = new Date();
      var time = d.getTime();
      var randId = rand + time;

      $scope.user = {};
      $scope.user.randId = randId;
      $scope.createAccount = function(){
          $http({
                method  : 'POST',
                url     : myService.host + 'signup.php',
                data    : $scope.user, //forms user object
                headers : {'Content-Type': 'application/x-www-form-urlencoded'} 
               })
                .success(function(data) {
                  if (data.errors) {
                    // Showing errors.
                    $scope.errorUsername = data.errors.username;
                    $scope.errorPassword = data.errors.password;
                    $scope.errorRePassword = data.errors.repassword;
                  } else {
                    $scope.message = data.message;
                    uploader.uploadAll();
                    ons.notification.alert({
                      message: $scope.message,
                      callback: function(){
                        alert
                        if ($scope.message == 'successful'){
                          $window.location.href = 'index.html';
                        }
                      }
                    });
                  };
                });
        };

        var uploader = $scope.uploader = new FileUploader({
            url: 'upload_profile.php',
            formData: [{
              randid: randId,
            }]
        });

        // FILTERS

        uploader.filters.push({
            name: 'imageFilter',
            fn: function(item /*{File|FileLikeObject}*/, options) {
                var type = '|' + item.type.slice(item.type.lastIndexOf('/') + 1) + '|';
                return '|jpg|png|jpeg|bmp|gif|'.indexOf(type) !== -1;
            }
        });
}]);


app.controller('topScoreController', function($scope,  $http, $window, myService) {
  if ($window.localStorage["userId"] === undefined) {
    $window.location.href = 'index.html';
  };
  $scope.getAll = function() {
    $http.get(myService.host + 'userQuery.php').success(function(response) {
       $scope.messages = response;
       // alert(response);
    });
  }

 $scope.getAll();

});

app.controller('PoiController', ['$scope','$http', '$window', 'leafletData', 'myService', function ($scope, $http, $window, leafletData, myService) {
    if ($window.localStorage["userId"] === undefined) {
      $window.location.href = 'index.html';
    }
    // extend tile GWClayer

    var powermap_th = new myService.powermapTile("tile.powermap.in.th", {key: 'e10adc3949ba59abbe56e057f20f883e' });
    var googleSat = L.tileLayer('http://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',{
      maxZoom: 22,
      subdomains:['mt0','mt1','mt2','mt3']
    });
    var baselayers = {
      "Powermap": powermap_th,
      "Google Satellite": googleSat,
    };
    leafletData.getMap().then(function(map){
      // console.log(map)
      powermap_th.addTo(map);
      new L.control.layers(baselayers).addTo(map);
      
        var overlaymarker = L.featureGroup();
        leafletData.getMap().then(function(map){
            overlaymarker.addTo(map)
        });
        var nearbyIcon = L.icon({
            iconUrl: '/images/home.png',

            iconSize:     [30, 30], // size of the icon
            iconAnchor:   [15, 30], // point of the icon which will correspond to marker's location
            popupAnchor:  [0, -30] // point from which the popup should open relative to the iconAnchor
        });
        leafletData.getMap().then(function(map){
          $http.get(myService.host + 'getpois.php', {params: {userid : $window.localStorage['userId']}}).success(function (response) {
                ons.notification.alert({
                  message: 'you have added ' +  response.length + ' points.'
                });
                  for (var i=0; i < response.length; i++){
                    if (response[i] == "no result found.") {
                      ons.notification.alert({
                        message: 'no nearby poi found',
                      });
                    };
                    L.marker([response[i].lat, response[i].lng], {icon: nearbyIcon}).bindPopup(response[i].name).addTo(overlaymarker);
                };
                map.fitBounds(overlaymarker.getBounds(), {maxZoom: 16});
          });
        });
    });
    
}]);

app.controller('profileCtrl', function($scope, $window, $http, FileUploader) {
  $scope.types = ["ท่องเที่ยว, บันเทิง, กีฬา", "ศูนย์การค้า, ร้านอาหาร, ร้านค้า", "ธนาคาร","หน่วยงาน, สถาบัน","การเดินทาง, การติดต่อสื่อสาร","อสังหาริมทรัพย์, หมู่บ้าน, โรงงาน","ตัวแทนจำหน่าย","อื่นๆ"];
  // get Image
  if ($window.localStorage["userId"] === undefined) {
    $window.location.href = 'index.html';
  } else {
    $scope.profile_link = $window.localStorage['profile_link'];

    $scope.update = {};
    $scope.update.userid = $window.localStorage.userId;
    $scope.updateAccount = function(){
      $http({
            method  : 'POST',
            url     : myService.host + 'update_profile_data.php',
            data    : $scope.update, //forms user object
            headers : {'Content-Type': 'application/x-www-form-urlencoded'} 
           }).success(function(data) {
              if (data.errors) {
                      // Showing errors.
                      $scope.errorUsername = data.errors.username;
                      $scope.errorPassword = data.errors.password;
                    } else {
                      $window.localStorage['username'] = $scope.update.username;
                      $window.localStorage['password'] = $scope.update.password;
                      $window.localStorage['name'] = $scope.update.name;
                      $window.localStorage['position'] = $scope.update.position; 
                      $window.localStorage['company'] =$scope.update.company;
                      $window.localStorage['tel'] =  $scope.update.tel;
                      $window.localStorage['email'] = $scope.update.email;
                      // clear picture and request new one
                      $window.localStorage['profile_link'] = '';
                      // update picture
                      uploader.uploadAll();
                      $window.location.href = 'index.html';
                    };
                  });
    };

    $scope.username = $window.localStorage['username'];
    $scope.password = $window.localStorage['password'];
    // initial current user password and id
    
    $scope.update.username = $window.localStorage['username'];
    $scope.update.password = $window.localStorage['password'];
    $scope.update.name = $window.localStorage['name'];
    $scope.update.position = $window.localStorage['position'];
    $scope.update.company = $window.localStorage['company'];
    $scope.update.tel = $window.localStorage['tel'];
    $scope.update.email = $window.localStorage['email'];

    // upload new profile
    var uploader = $scope.uploader = new FileUploader({
        url: 'update_profile.php',
        formData: [{
          userid: $window.localStorage['userId'],
        }]
    });
  };

});

app.controller('menuCtrl', function($scope, $window, $http, myService) {
  // get Image
  if ($window.localStorage['userId'] !== undefined){
    if ($window.localStorage['profile_link'] === ''){
      // make a call
        $http({
              method  : 'POST',
              url     : myService.host + 'getprofile.php',
              data    : {user_id: $window.localStorage.userId}, //forms user object
              headers : {'Content-Type': 'application/x-www-form-urlencoded'} 
             })
              .success(function(data) {
                if (data.errors) {
                  // Showing errors.
                  // alert('no profile picture found');
                } else {
                  $scope.profile_link = data.link;
                  $window.localStorage.setItem('profile_link', $scope.profile_link)
                };
              });
    };
  } else {
    // $window.location.href = 'index.html';
  };

  $scope.name = $window.localStorage['name']
  $scope.profile_link = $window.localStorage['profile_link'];
  $scope.email = $window.localStorage['email'];
  $scope.position = $window.localStorage['position'];
  $scope.company = $window.localStorage['company'];
  // sign out click
    $scope.clearLocalStorage = function(){
      $window.localStorage.clear();
      $window.location.href = 'index.html';

    }
});

app.controller('aboutCtrl', ['$scope', '$http', '$window', function($scope, $http, $window) {
  // $scope.$on("$destroy", function(){
  //     $("ons-page").css('background-image', 'url(images/BG Boot2.png)');
  // });
}]);


app.controller('poiListCtrl', ['$scope', '$http', '$window', 'myService', function($scope, $http, $window, myService) {
    if ($window.localStorage["userId"] === undefined) {
    $window.location.href = 'index.html';
  };
  $scope.path = myService.host;
  $http.get(myService.host + 'getpois.php', {params: {userid : $window.localStorage['userId']}}).success(function (response) {
              $scope.messages = response;
              });

  $scope.openMap = function(m){
    $window.localStorage.setItem('poilat',m.lat),
    $window.localStorage.setItem('poilng',m.lng),
    $window.localStorage.setItem('poiname',m.name),
    $window.location.href = 'navMap_1.html'
  };

  $scope.openDetails = function(m){
    $window.localStorage.setItem('poilat',m.lat),
    $window.localStorage.setItem('poilng',m.lng),
    $window.localStorage.setItem('poiname',m.name),
    $window.localStorage.setItem('poilink', myService.host + m.link),
    $window.localStorage.setItem('poitype',m.type),
    $window.localStorage.setItem('poidetail',m.detail),
    $window.location.href = 'navPoiDetails.html'
  };

}]);

// map tile serivce
app.factory('myService', function(leafletData) {
  var powermapTile = L.TileLayer.extend({
        options: {
            maxZoom: 18,   /* default options*/
            minZoom: 6,
            tms: true,
            bounds:[new L.LatLng(21.7500,90.2080), new L.LatLng(0.2080,112.09300)],
            attribution: "<a href='http://www.powermap.in.th'>POWERMAP</a>",
        },
        
        _padZeros: function(unPaddedInt,padReq) {
            var padded = unPaddedInt.toString()
            while (padded.length < padReq) {
                padded = '0'+padded;
            }
            return padded
        },
        _getWrapTileNum: function () {
          // TODO refactor, limit is not valid for non-standard projections
          return Math.pow(2, this._getZoomForUrl());
        },

        _adjustTilePoint: function (tilePoint) {

          var limit = this._getWrapTileNum();

          // wrap tile coordinates
          if (!this.options.continuousWorld && !this.options.noWrap) {
            tilePoint.x = ((tilePoint.x % limit) + limit) % limit;
          }

          if (this.options.tms) {
            tilePoint.y = limit - tilePoint.y - 1;
          }

          tilePoint.z = this._getZoomForUrl();
        },

        getTileUrl: function (tilePoint) {
            
          this._url = "http://tile.powermap.in.th/v1/tile/th/EPSG_900913_{z}/{dir_x}_{dir_y}/{x}_{y}.png?key={key}";
            
          // console.log(tilePoint)
          this._adjustTilePoint(tilePoint);
          
          if (!("key" in this.options)) {
              console.log("No API Key");
              var key = "nokey"
          } else {
              var key = this.options.key;
          }
          // console.log(this.options.key)
          
          return L.Util.template(this._url, L.extend({
            s: this._getSubdomain(tilePoint),
            // z:  this._getZoomForUrl(),
            z: this._padZeros(this._getZoomForUrl(),2),
            dir_x: this._padZeros(Math.floor(tilePoint.x/(Math.pow(2,Math.floor(1+(this._getZoomForUrl(tilePoint)/2))))), Math.floor(this._getZoomForUrl(tilePoint)/6)+1),
            dir_y: this._padZeros(Math.floor(tilePoint.y/(Math.pow(2,Math.floor(1+(this._getZoomForUrl(tilePoint)/2))))), Math.floor(this._getZoomForUrl(tilePoint)/6)+1),
            x: this._padZeros(tilePoint.x,2+(Math.floor(this._getZoomForUrl(tilePoint)/6)*2)),
            y: this._padZeros(tilePoint.y,2+(Math.floor(this._getZoomForUrl(tilePoint)/6)*2)),
            key: key,
          }, this.options));
        }
      });
  var host = "http://192.168.1.35/Aapico-check-in/www/";
  var api_host = "http://api1.powermap.in.th/wisdomvast";
  return {
      powermapTile: powermapTile,
      host: host,
      api_host: api_host,
  };
});

app.controller('oneMakerController', function(leafletData, myService, $window){ 
    var powermap_th = new myService.powermapTile("tile.powermap.in.th", {key: 'e10adc3949ba59abbe56e057f20f883e' });
    var googleSat = L.tileLayer('http://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',{
      maxZoom: 22,
      subdomains:['mt0','mt1','mt2','mt3']
    });
    var baselayers = {
      "Powermap": powermap_th,
      "Google Satellite": googleSat,
    };
    leafletData.getMap().then(function(map){
      // console.log(map)
      powermap_th.addTo(map);
      new L.control.layers(baselayers).addTo(map);
      
        var overlaymarker = L.featureGroup();
        leafletData.getMap().then(function(map){
            overlaymarker.addTo(map)
        });
        var customIcon = L.icon({
            iconUrl: myService.host + '/images/home.png',

            iconSize:     [30, 30], // size of the icon
            iconAnchor:   [15, 30], // point of the icon which will correspond to marker's location
            popupAnchor:  [0, -30] // point from which the popup should open relative to the iconAnchor
        });
        leafletData.getMap().then(function(map){
            L.marker([$window.localStorage['poilat'], $window.localStorage['poilng']], {icon: customIcon}).bindPopup('Hello World').addTo(map);
            map.setView([$window.localStorage['poilat'], $window.localStorage['poilng']], 16);
          });
        });
    });

app.controller('poiDetailController', function($scope, $window){
  $scope.poilat = parseFloat($window.localStorage['poilat']).toFixed(4);
  $scope.poilng = parseFloat($window.localStorage['poilng']).toFixed(4);
  $scope.poiname = $window.localStorage['poiname'];
  $scope.poilink = $window.localStorage['poilink'];
  $scope.poitype= $window.localStorage['poitype'];
  $scope.poidetail = $window.localStorage['poidetail'];
});


