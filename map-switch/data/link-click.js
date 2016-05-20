var elems = [];
var current_poi;

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
         elink.children[1].style.display = 'inline';
         current_poi = services[id].get_poi_from_url(url);
      } else {
         elink.children[1].style.display = 'none';
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
   var ids = ['yandex', 'google', 'panoramio', 'osm', 'osm_ru', 'f4map', 'wikimapia'];
   
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
   
   // Settings link
   var setts = document.getElementById('settings');
   setts.addEventListener('click', function() {
      if (typeof addon !== 'undefined') {
         addon.port.emit('open-settings')
      } else { 
         document.location.href = 'settings.html';
      }
   });

   // Listen for the "show" event being sent from the
   // main add-on code. It means that the panel's about
   // to be shown.
   if (typeof addon !== 'undefined') {
      addon.port.on('show', on_show);
   } else {
      // TEST
      on_show('http://yandex.ru/maps');
   }
}