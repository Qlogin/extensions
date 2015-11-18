// Get selection elements and setup callbacks
var elems = document.getElementsByClassName('selection');
var i;
for (i = 0; i != elems.length; ++i) {
   elems[i].addEventListener('mouseover', function(event) {
      event.target.style.border = '2px solid blue';
   });
   elems[i].addEventListener('mouseout', function(event) {
      event.target.style.border = '2px solid white';
   });
   elems[i].addEventListener('click', function(event) {
      self.port.emit('link-clicked', 'https://www.yandex.ru');
   });
}

// Listen for the "show" event being sent from the
// main add-on code. It means that the panel's about
// to be shown.
self.port.on("show", function onShow() {
   // TODO:
});