var current_poi;
var services = {
   'yandex' : {
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
   }
};

var elems = document.getElementsByClassName('selection');
for (var i = 0; i != elems.length; ++i) {
   elems[i].addEventListener('mouseover', select);
   elems[i].addEventListener('mouseout', unselect);
   elems[i].addEventListener('click', open_link);
}

// Selection and clicking callbacks
function select(event) {
   event.currentTarget.style.border = '2px solid #b0da2e';
}
function unselect(event) {
   event.currentTarget.style.border = '2px solid white';
}
function open_link(event) {
   unselect(event);
   var link = event.currentTarget.getAttribute('data-url');
   if (current_poi) {
      var id = event.currentTarget.getAttribute('id');
      var url = services[id].get_url_from_poi(current_poi);
      link += url;
   }
   self.port.emit('link-clicked', link);
}

// Listen for the "show" event being sent from the
// main add-on code. It means that the panel's about
// to be shown.
self.port.on('show', function onShow(url) {
   current_poi = null;
   for (var i = 0; i != elems.length; ++i) {
      if (url.contains(elems[i].getAttribute('data-url'))) {
         elems[i].children[0].style.display = 'inline';
         var id = elems[i].getAttribute('id');
         current_poi = services[id].get_poi_from_url(url);
         var coord_elem = document.getElementById('coords');
         if (current_poi) {
            coord_elem.innerHTML = current_poi[1] + ', ' + current_poi[2];
         } else {
            coord_elem.innerHTML = '-';
         }
      } else {
         elems[i].children[0].style.display = 'none';
      }
   }
});