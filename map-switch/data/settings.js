var ids = [];
var cboxes = [];
var drag_element = null;

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
   let childs   = maps.children;
   let src_item = childs[childs.length - 1];

   for (let i = 1; i != ids.length; ++i) {
      let new_item = src_item.cloneNode(true);
      maps.insertBefore(new_item, src_item);
   }

   for (let i in ids) {
      let [id, checked] = ids[i];
      let text = document.createTextNode(services[id].name);
      childs[i].pos = i;
      childs[i].appendChild(text);
      childs[i].addEventListener('dragstart', dragStart);
      childs[i].addEventListener('dragenter', dragEnter);
      childs[i].addEventListener('dragover' , dragOver);
      childs[i].addEventListener('dragleave', dragLeave);
      childs[i].addEventListener('dragend'  , dragEnd);
      childs[i].addEventListener('drop'     , drop);

      let cb = childs[i].getElementsByTagName('input')[0];
      cb.checked = checked;
      cb.setAttribute('value', id);
      cb.addEventListener('change', handleToggled);
      cboxes.push(cb);
   }
}

function handleToggled(event) {
   var used_services = [];
   for (let cb of cboxes) {
      used_services.push([cb.value, cb.checked]);
   }
   self.port.emit('update_services', used_services);
}

function dragStart(ev) {
   drag_element = ev.target;
   ev.target.opacity = '0.5';
   ev.dataTransfer.effectAllowed = 'move';
   ev.dataTransfer.setData('MyFormat', 'MyData');

   setTimeout(function() {
      if (drag_element) {
         drag_element.style.backgroundColor = 'rgb(220, 220, 220)';
         drag_element.style.color = 'rgb(128, 128, 128)';
      }
   }, 100);
}

function dragEnter(ev) {
   ev.preventDefault();
   if (ev.target !== drag_element) {
      ev.target.style.backgroundColor = 'rgb(208, 255, 208)';
   }
}

function dragOver(ev) {
   ev.preventDefault(); // Allows us to drop.
   ev.dataTransfer.dropEffect = 'move';
   return false;
}

function dragLeave(ev) {
   ev.preventDefault();
   if (ev.target !== drag_element) {
      ev.target.style.backgroundColor = 'transparent';
   }
}

function dragEnd(ev) {
   drag_element.style.backgroundColor = 'transparent';
   drag_element.style.color = 'black';
   drag_element = null;
}

function drop(ev) {
   var data = ev.dataTransfer.getData('MyFormat');
   if (data !== 'MyData') {
      return;
   }

   ev.stopPropagation();
   if (ev.target === drag_element) {
      return;
   }

   ev.target.style.backgroundColor = 'transparent';
   if (ev.target.pos < drag_element.pos) {
      ev.target.parentNode.insertBefore(drag_element, ev.target);
   } else {
      ev.target.parentNode.insertBefore(drag_element, ev.target.nextSibling);
   }

   var used_services = [];
   cboxes = [];

   let childs = maps.children;
   for (let i = 0; i != childs.length; ++i) {
      childs[i].pos = i;

      let cb = childs[i].getElementsByTagName('input')[0];
      cboxes.push(cb);
      used_services.push([cb.value, cb.checked]);
   }
   self.port.emit('update_services', used_services);
   return false;
}
