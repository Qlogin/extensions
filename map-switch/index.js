var buttons = require('sdk/ui/button/toggle');
var panels = require("sdk/panel");
var tabs = require("sdk/tabs");
var self = require("sdk/self");

var panel = panels.Panel({
   width : 204,
   height: 124,
   contentURL: self.data.url("map-list.html"),
   contentScriptFile: self.data.url("link-click.js"),
   onHide: handleHide
});

var button = buttons.ToggleButton({
   id: "map-list-button",
   label: "Switch Map",
   icon: {
      "16": "./icon-16.png",
      "32": "./icon-32.png",
      "64": "./icon-64.png"
   },
   onChange: handleChange
});

function handleChange(state) {
   if (state.checked) {
      panel.show({
         position: button
      });
   }
}

function handleHide() {
   button.state('window', {checked: false});
}

panel.port.on("link-clicked", function (url) {
   tabs.activeTab.url = url;
   panel.hide();
});