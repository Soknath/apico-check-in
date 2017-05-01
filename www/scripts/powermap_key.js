/* powermap.js


Depends on:
  jquery, bootstrap, leaflet
  modernizr, underscore, backbone

map is Leaflet map object

map object is window map

    setLocationHash
    parseLocationHash
    
    L.TileLayer.GWC extends L.TileLayer
*/

// first object            
var powermap = {lat:13.7715860541, lng:100.623434188}


/* POWERMAP attribution string */
powermap.attribution = '&copy; <a href="http://powermap.in.th">POWERMAP</a>';

var currentLocationIcon = L.icon({
    iconUrl: '/static/internal/images/Location-marker.png',
    iconSize: [34, 45],
    iconAnchor: [22, 94],
    popupAnchor: [-3, -76],
    shadowSize: [68, 95],
    shadowAnchor: [22, 94]
});

// http://leafletjs.com/reference.html#marker
// http://leafletjs.com/reference.html#icon


/* location marker can be placed by context menu */
powermap.current_location_marker = L.marker([powermap.lat, powermap.lng], 
                                                {icon: currentLocationIcon, 
                                                 draggable: true});

// powermap.current_location_marker = current_location_marker

window.powermap = powermap

/* initMapDisplay is called after the Leaflet map object is initialized.
    window.powermap = powermap
    powermap.map is the Leaflet object
    
    Add these widgets:
        scale,
        zoom level
        mouse center coordinate
        map center coordinate
        
    Register these events:
        moveend
        locationfound
        locationerror
*/
function initMapDisplay() {
    
    /* Remove the default zoom control */
    powermap.map.zoomDisplayControl.remove()
    
    L.control.zoomDisplay({position: "verticaltopright"}).addTo(powermap.map);

    // Change the position of the Zoom Control to a newly created placeholder.
    L.control.zoom({position: 'verticaltopright'}).addTo(powermap.map);

    // Display map scale bar
    L.control.scale({position: 'verticalbottomright', maxWidth: 200}).addTo(powermap.map);

    // Show coordinate (lat, lng) of the mouse location on the map
    L.control.mousePosition({
        position: 'verticalbottomright'
    }).addTo(powermap.map);

    // Display coordinate of the map center on the map
    L.control.mapCenterCoord({
        position: 'verticalbottomright'
    }).addTo(powermap.map);
    
    
    /* Events */
    powermap.map.on('moveend', updateLocationHash);
             
    powermap.map.on('locationfound', onLocationFound);
    powermap.map.on('locationerror', onLocationError);
}

function onLocationFound(e) {
    var radius = e.accuracy / 2;

    L.marker(e.latlng).addTo(map)
        .bindPopup("You are within " + radius + " meters from this point").openPopup();

    L.circle(e.latlng, radius).addTo(powermap.map);
    console.log("location found: " + e.message);
}

function onLocationError(e) {
    //alert(e.message); //silently ignore
    console.log("location not found: " + e.message);
}
            
function updateLocationHash(e){
    var latlng = map.getCenter();
    var z = map.getZoom();
    var lat = latlng.lat;
    var lng = latlng.lng;
    powermap.lat = lat;
    powermap.lng = lng;
    powermap.zoom = z;
    window.location.hash = lat + "," + lng + "," + z;
}


/* Parse location hash from URL. Returns false if cannot get location

*/
function parseLocationHash() {
    var lochash = window.location.hash.substr(1);
    var h = _.object(['lat', 'lng', 'zoom'], lochash.split(','));

    try {
        h.lat = parseFloat(h.lat)
        h.lng = parseFloat(h.lng)
        h.zoom = parseFloat(h.zoom)
    }
    catch(err) {
        console.log(err)
        return false
    }
    return h
}

/* Location marker - powermap.current_location_marker */
function setCurrentLocation(e) {
    var lat = e.latlng.lat;
    var lng = e.latlng.lng;
    powermap.lat = lat;
    powermap.lng = lng;
    updateLocationHash();

    powermap.current_location_marker.setLatLng([lat,lng]);
    powermap.current_location_marker.setOpacity(1.0);
    
    /* Add popup showing the marker coordinate */
    powermap.current_location_marker.bindPopup("Current Location Marker");
    powermap.current_location_marker.on('click',powermap.current_location_marker.openPopup)
}

/* when map is loaded. If there is location hashed then go to the hash.
   restoreLocationHash is registered with load event to execute on the map loading. 
*/
function restoreLocationHash(e) {
    console.log("restore location hash")
    var lochash = parseLocationHash();
    try {
        powermap.map.setView([lochash.lat,lochash.lng],lochash.zoom);
        
    } catch (err) {
        console.log(err)
        return false
    }
}



/* Extend TileLayer class prototype from Leaflet. This is base map tile.
   Before this was L.TileLayer.GWC = L.TileLayer.extend.
   Default options is built-in.

Usage:
    
    var powermap_en = new powermap.Tile("{{ tile_url_en }}", {
                attribution: powermap.attribution,
     });

*/
powermap.Tile = L.TileLayer.extend({
  options: {
      maxZoom: 18,   /* default options*/
      minZoom: 6,
      tms: true,
      bounds:[new L.LatLng(21.7500,90.2080), new L.LatLng(0.2080,112.09300)],
      attribution: "<a href='http://www.powermap.in.th'>POWERMAP</a>",
  },
  
 
  
  _padZeros: function(unPaddedInt,padReq) {
      padded = unPaddedInt.toString()
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
        key = "nokey"
    } else {
        key = this.options.key;
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
})





window.powermap.updateLocationHash = updateLocationHash
window.powermap.parseLocationHash = parseLocationHash
window.powermap.setCurrentLocation = setCurrentLocation
