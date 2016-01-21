var elems = [];
var current_poi;
var services = {
   'yandex' : {
      name : 'Yandex Map',
      base_url : 'maps.yandex.ru',
      icon : 'http://maps.yandex.ru/favicon.png',
      get_poi_from_url : function(str) {
         var with_poi = true;
         var res = str.match(/whatshere\[point\]=([\d.]+)%2C([\d.]+).*whatshere\[zoom\]=(\d+)/);
         if (!res) {
            with_poi = false;
            res = str.match(/ll=([\d.]+)%2C([\d.]+).*z=(\d+)/);
            if (!res) {
               return res;
            }
         }
         return [with_poi, res[2], res[1], res[3]];
      },
      get_url_from_poi : function(args) {
         var link = '/?ll=' + args[2] + '%2C' + args[1] + '&z=' + args[3];
         if (args[0]) {
            link += '&whatshere[point]=' + args[2] + '%2C' + args[1] + '&whatshere[zoom]=' + args[3];
         }
         return link;
      }
   },
   'google' : {
      name : 'Google Map',
      base_url : 'www.google.ru/maps',
      icon : 'http://www.google.com/images/branding/product/ico/maps_16dp.ico',
      get_poi_from_url : function(str) {
         var res = str.match(/@([\d.]+),([\d.]+),([\d.]+)z/);
         if (!res) {
            return res;
         }
         return [false].concat(res.slice(1));
      },
      get_url_from_poi : function(args) {
         var link = '/@' + args[1] + ',' + args[2] + ',' + args[3] + 'z';
         return link;
      }
   },
   'osm' : {
      name : 'OpenStreetMap',
      base_url : 'www.openstreetmap.org',
      icon : 'http://www.openstreetmap.org/assets/favicon-16x16-b5e4abe84fb615809252921d52099ede3236d1b7112ea86065a8e37e421c610b.png',
      get_poi_from_url : function(str) {
         var with_poi = true;
         var res = str.match(/#map=(\d+)\/([\d.]+)\/([\d.]+)/);
         if (!res) {
            return res;
         }
         return [false, res[2], res[3], res[1]];
      },
      get_url_from_poi : function(args) {
         var link = '/#map=' + args[3] + '/' + args[1] + '/' + args[2];
         return link;
      }
   },
   'osm_ru' : {
      name : 'OpenStreetMap RU',
      base_url : 'openstreetmap.ru',
      icon : 'http://openstreetmap.ru/favicon.png',
      get_poi_from_url : function(str) {
         var with_poi = true;
         var res = str.match(/#mmap=(\d+)\/([\d.]+)\/([\d.]+)/);
         if (!res) {
            with_poi = false;
            var res = str.match(/#map=(\d+)\/([\d.]+)\/([\d.]+)/);
            if (!res) {
               return res;
            }
         }
         return [with_poi, res[2], res[3], res[1]];
      },
      get_url_from_poi : function(args) {
         var link = '/#';
         if (args[0]) {
            link += 'mmap=' + args[3] + '/' + args[1] + '/' + args[2] + '&';
         }
         link += 'map=' + args[3] + '/' + args[1] + '/' + args[2];
         return link;
      }
   },
   'panoramio' : {
      name : 'Panoramio',
      base_url : 'www.panoramio.com/map',
      icon : 'http://www.panoramio.com/img/favicon.ico',
      get_poi_from_url : function(str) {
         var res = str.match(/#lt=([\d.]+)&ln=([\d.]+)&z=([\d.]+)/);
         if (!res) {
            return res;
         }
         res[3] = String(17 - parseInt(res[3]));
         return [false].concat(res.slice(1));
      },
      get_url_from_poi : function(args) {
         var link = '#lt=' + args[1] + '&ln=' + args[2] + '&z=' + String(17 - parseInt(args[3])) + '&k=0';
         return link;
      }
   }
};

// Selection and clicking callbacks
function select(event) {
   event.currentTarget.style.border = '2px solid #b0da2e';
}
function unselect(event) {
   event.currentTarget.style.border = '2px solid white';
}
function open_link(event) {
   unselect(event);
   var id = event.currentTarget.parentElement.getAttribute('id');
   var link = services[id].base_url;
   if (current_poi) {
      var url = services[id].get_url_from_poi(current_poi);
      link += url;
   }
   if (typeof addon !== 'undefined') {
      addon.port.emit('link-clicked', link);
   } else {
      document.location.href = 'http://' + link;
   }
}

// Preparing panel content to show
function on_show(url) {
   current_poi = null;
   for (var i = 0; i != elems.length; ++i) {
      var id = elems[i].getAttribute('id');
      var elink = elems[i].getElementsByClassName('link')[0];
      if (url.indexOf(services[id].base_url) != -1) {
         elink.children[0].style.display = 'inline';
         current_poi = services[id].get_poi_from_url(url);
      } else {
         elink.children[0].style.display = 'none';
      }
      var img = elems[i].getElementsByClassName('icon')[0];
      img.setAttribute('src', services[id].icon);
   }
   var coord_elem = document.getElementById('coords');
   if (current_poi) {
      coord_elem.innerHTML = current_poi[1] + ', ' + current_poi[2];
   } else {
      coord_elem.innerHTML = '-';
   }
}

window.onload = function init() {
   var ids = ['yandex', 'google', 'osm', 'osm_ru', 'panoramio'];

   var src_row = document.getElementsByClassName('selection')[0];
   var table_rows = src_row.parentElement.children;
   var last_row = table_rows[table_rows.length - 1];

   elems.push(src_row);
   for (var i = 1; i != ids.length; ++i) {
      var new_row = src_row.cloneNode(true);
      src_row.parentElement.insertBefore(new_row, last_row);
      elems.push(new_row);
   }

   for (var i = 0; i != ids.length; ++i) {
      elems[i].setAttribute('id', ids[i]);

      var elink = elems[i].getElementsByClassName('link')[0];
      var text = document.createTextNode(services[ids[i]].name);
      elink.appendChild(text);

      elink.addEventListener('mouseover', select);
      elink.addEventListener('mouseout', unselect);
      elink.addEventListener('click', open_link);
   }

   // Listen for the "show" event being sent from the
   // main add-on code. It means that the panel's about
   // to be shown.
   if (typeof addon !== 'undefined') {
      addon.port.on('show', on_show);
   } else {
      // TEST
      on_show('http://maps.yandex.ru');
   }
}