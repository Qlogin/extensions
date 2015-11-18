// Get selection elements and setup callbacks
function select(event) {
   event.target.style.border = '2px solid blue';
}
function unselect(event) {
   event.target.style.border = '2px solid white';
}
function open_link(event) {
   self.port.emit('link-clicked', event.target.getAttribute('data-url'));
}

var elems = document.getElementsByClassName('selection');
var i;
for (i = 0; i != elems.length; ++i) {
   elems[i].addEventListener('mouseover', select);
   elems[i].addEventListener('mouseout', unselect);
   elems[i].addEventListener('click', open_link);
}

// Listen for the "show" event being sent from the
// main add-on code. It means that the panel's about
// to be shown.
self.port.on("show", function onShow() {
   // TODO:
});