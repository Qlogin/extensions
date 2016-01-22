var buttons = require('sdk/ui/button/toggle');
var panels = require("sdk/panel");
var urls = require("sdk/url");
var tabs = require("sdk/tabs");
var self = require("sdk/self");

// Setup UI elements

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
  height:355,
  onShow: handleShow,
  onHide: handleHide
});

// Callbacks

function handleChange(state) {
  if (state.checked) {
    panel.show({
      position: button
    });
  }
}

function handleShow() {
  host = urls.URL(tabs.activeTab.url).hostname;
  panel.port.emit("init", host);

  var worker = tabs.activeTab.attach({
    contentScriptFile: [self.data.url("jquery.min.js"),
                        self.data.url("fill-form.js")]
  });
  worker.port.on("set-user", function(user) {
    panel.port.emit("set-user", user);
  });
  worker.port.emit("get-user");
}

function handleHide() {
  button.state('window', {checked: false});
  panel.port.emit("close");
}

// Signals/slots

panel.port.on("title-clicked", function () {
  tabs.open("http://parolemanager.com");
  panel.hide();
});

panel.port.on("fill-form", function(email, password) {
    var worker = tabs.activeTab.attach({
      contentScriptFile: [self.data.url("jquery.min.js"),
                          self.data.url("fill-form.js")]
    });
    worker.port.emit("fill-form", email, password);
});
