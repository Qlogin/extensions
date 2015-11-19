var { ToggleButton } = require('sdk/ui/button/toggle');
var panels = require("sdk/panel");
var self = require("sdk/self");

var button = ToggleButton({
  id: "my-button",
  label: "my button",
  icon: {
    "16": "./icon-16.png",
    "32": "./icon-32.png",
    "64": "./icon-64.png"
  },
  onChange: handleChange
});

var panel = panels.Panel({
  contentURL: self.data.url("panel.html"),
  width: 300,
  height:300,
  onHide: handleHide
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

var tabs = require("sdk/tabs");

panel.port.on("title-clicked", function () {
  tabs.open("http://parolemanager.com");
  panel.hide();
});

var urls = require("sdk/url");

panel.on("show", function() {
  host = urls.URL(tabs.activeTab.url).hostname;
  panel.port.emit("set-domain", host);
});
