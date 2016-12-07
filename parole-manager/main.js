var buttons = require("sdk/ui/button/toggle");
var sidebars = require("sdk/ui/sidebar")
var panels = require("sdk/panel");
var urls = require("sdk/url");
var tabs = require("sdk/tabs");
var self = require("sdk/self");
var hotkeys = require("sdk/hotkeys");

// Setup UI elements

var panel_btn = buttons.ToggleButton({
  id: "panel-button",
  label: "Parole Manager",
  icon: {
    "16": "./icon-16.png",
    "32": "./icon-32.png",
    "64": "./icon-64.png"
  },
  onChange: handlePanelToggle
});

var panel = panels.Panel({
  contentURL: self.data.url("panel.html"),
  width: 300,
  height:350,
  onShow: handlePanelShow,
  onHide: handlePanelHide
});

var sidebar = sidebars.Sidebar({
  id   : "manager-sidebar",
  title: "Parole Manager",
  url  : self.data.url("panel.html"),
  onAttach: handleSidebarAttach,
  onDetach: handleSidebarDetach,
  onReady:  handleSidebarReady
});

var sidebarHotKey = hotkeys.Hotkey({
  combo: "shift-alt-p",
  onPress: handleSidebarToggle,
});

// Callbacks

var page_worker;
var sidebar_worker;
var moto_string = "";

function _getHostName() {
  host = urls.URL(tabs.activeTab.url).hostname;
  if (!host)
    return "";

  var dot_pos = host.lastIndexOf('.');
  if (dot_pos > 0) {
    dot_pos = host.lastIndexOf('.', dot_pos - 1);
    host = host.substring(dot_pos + 1);
  }
  return host;
}

function handlePanelToggle(state) {
  if (state.checked) {
    panel.show({ position: panel_btn });
  }
}

function handlePanelShow() {
  panel.port.emit("init", _getHostName());
  panel.port.emit("set-moto", moto_string);

  if (page_worker)
    page_worker.port.emit("get-user");
}

function handlePanelHide() {
  panel_btn.state("window", { checked: false });
  panel.port.emit("close");
}

function handleSidebarToggle() {
  if (!sidebar_worker) {
    sidebar.show();
  } else {
    sidebar.hide();
  }
}

function handleSidebarAttach(worker) {
  sidebar_worker = worker;
  worker.port.on("title-clicked", function () {
    tabs.open("http://parolemanager.com");
  });
  worker.port.on("moto-changed", function(moto) {
    moto_string = moto;
  });
}

function handleSidebarReady() {
  if (!sidebar_worker)
    return;

  sidebar_worker.port.emit("set-moto", moto_string);

  if (tabs.activeTab.readyState == "interactive" ||
      tabs.activeTab.readyState == "complete")
  {
    sidebar_worker.port.emit("init", _getHostName());
    if (page_worker)
      page_worker.port.emit("get-user");
  }
}

function handleSidebarDetach(worker) {
  if (worker == sidebar_worker)
    sidebar_worker = null;
}

function handleTabChange(tab) {
  page_worker = tab.attach({
    contentScriptFile: [self.data.url("jquery.min.js"),
                        self.data.url("fill-form.js")]
  });
  page_worker.port.on("set-user", function(user) {
    if (panel.isShowing)
      panel.port.emit("set-user", user);
    if (sidebar_worker)
      sidebar_worker.port.emit("set-user", user);
  });
  page_worker.port.emit("get-user");
  if (sidebar_worker)
    sidebar_worker.port.emit("init", _getHostName());
}

// Signals/slots

tabs.on('activate', function (tab) {
  if (tab.readyState == "interactive" ||
      tab.readyState == "complete") {
    handleTabChange(tab);
  }
});
tabs.on('ready', function (tab) {
  if (tab == tabs.activeTab)
    handleTabChange(tab);
});

panel.port.on("title-clicked", function () {
  tabs.open("http://parolemanager.com");
  panel.hide();
});

panel.port.on("fill-form", function(email, password) {
    if (page_worker)
      page_worker.port.emit("fill-form", email, password);
});

panel.port.on("moto-changed", function(moto) {
  moto_string = moto;
  console.info("Set moto: " + moto);
  if (sidebar_worker)
    sidebar_worker.port.emit("set-moto", moto);
});
