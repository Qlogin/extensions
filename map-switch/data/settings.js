var ids = [];
var cboxes = [];

if (self.options.used_services.length == 0) {
   for (var id in services) {
      ids.push([id, true]);
   }
} else {
   for (let id_state of self.options.used_services) {
      ids.push(id_state);
   }
}

var maps = document.getElementsByClassName('maps')[0];
if (maps) {
   var childs   = maps.children;
   var src_item = childs[childs.length - 1];

   for (var i = 1; i != ids.length; ++i) {
      var new_item = src_item.cloneNode(true);
      maps.insertBefore(new_item, src_item);
   }

   for (var i in ids) {
      var [id, checked] = ids[i];
      var text = document.createTextNode(services[id].name);
      childs[i].appendChild(text);
      childs[i].addEventListener('dragstart', dragStart);
      var cb = childs[i].getElementsByTagName('input')[0];
      cb.setAttribute('value', id);
      cb.checked = checked;
      cb.addEventListener('change', handleToggled);
      cboxes.push(cb);
   }
}

function handleToggled(event) {
   var used_services = [];
   for (let cb of cboxes) {
      used_services.push([cb.value, cb.checked]);
   }
   console.log(used_services);
   self.port.emit('update_services', used_services);
}

function dragStart(ev) {
   ev.target.opacity = '0.5';
   ev.dataTransfer.effectAllowed='move';
   ev.dataTransfer.setData("Text", ev.target.value);
   ev.dataTransfer.setDragImage(ev.target, 0, 0);
   return true;
}

function dragOver(ev) {

}