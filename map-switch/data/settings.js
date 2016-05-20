window.onload = function init() {
    var ids = [];
    for (var id in services)
        ids.push(id)

    var maps = document.getElementsByClassName('maps')[0];
    var childs   = maps.children;
    var src_item = childs[childs.length - 1];

    for (var i = 1; i != ids.length; ++i) {
        var new_item = src_item.cloneNode(true);
        maps.insertBefore(new_item, src_item);
    }
    
   for (var i = 0; i != ids.length; ++i) {
       var text = document.createTextNode(services[ids[i]].name);
       childs[i].appendChild(text);
       childs[i].getElementsByTagName('input')[0].setAttribute('value', ids[i]);
   }
}