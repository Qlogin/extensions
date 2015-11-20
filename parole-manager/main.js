var buttons = require('sdk/ui/button/toggle');
var panels = require("sdk/panel");
var self = require("sdk/self");

var button = buttons.ToggleButton({
  id: "manager-button",
  label: "Parole Manager",
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
  height:350,
  onShow: handleShow,
  onHide: handleHide
});

function handleChange(state) {
  if (state.checked) {
    panel.show({
      position: button
    });
  }
}

var urls = require("sdk/url");

function handleShow() {
  host = urls.URL(tabs.activeTab.url).hostname;
  var dot_pos = host.lastIndexOf('.');
  if (dot_pos > 0) {
    dot_pos = host.lastIndexOf('.', dot_pos - 1);
    host = host.substring(dot_pos + 1);
  }
  panel.port.emit("init", host);
}

function handleHide() {
  button.state('window', {checked: false});
  panel.port.emit("close");
}

var tabs = require("sdk/tabs");

panel.port.on("title-clicked", function () {
  tabs.open("http://parolemanager.com");
  panel.hide();
});
