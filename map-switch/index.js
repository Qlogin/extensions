var buttons = require('sdk/ui/button/toggle');
var panels = require('sdk/panel');
var tabs = require('sdk/tabs');
var ss = require('sdk/simple-storage');

// Setup default settings
if (!ss.storage.used_services) {
    ss.storage.used_services = [];
}

// Create popup panel
var panel = panels.Panel({
   width : 224,
   height: 275,
   contentURL: './map-list.html',
   contentScriptFile: [
      './services.js',
      './link-click.js'
   ],
   contentScriptWhen : 'end',
   contentScriptOptions: {
      'used_services' : ss.storage.used_services
   },   
   onShow: handleShow,
   onHide: handleHide
});

// Add button that show popup
var button = buttons.ToggleButton({
   id: 'map-list-button',
   label: 'Switch Map',
   icon: {
      '16': './icon-16.png',
      '32': './icon-32.png',
      '64': './icon-64.png'
   },
   onChange: handleChange
});

// Switch Map
panel.port.on('set-height', function(height) {
   panel.height = height;
});

panel.port.on('link-clicked', function (url) {
   tabs.activeTab.url = url;
   panel.hide();
});

// Settings page
var settings_tab = null;

panel.port.on('open-settings', function() {
   panel.hide();
   if (settings_tab) {
      settings_tab.activate();
   } else {
      tabs.open('./settings.html');
   }
});

for (let tab of tabs) {
   handleOpenSettings(tab);
}
tabs.on('ready', handleOpenSettings);


///* Handlers *///

function handleChange(state) {
   if (state.checked) {
      panel.show({
         position: button
      });
   }
}

function handleShow() {
   panel.port.emit('show', tabs.activeTab.url);
}

function handleHide() {
   button.state('window', {checked: false});
}

function handleOpenSettings(tab) {
   if (tab.url == 'resource://map-switch-at-roman-dot-qlogin/data/settings.html') {
      settings_tab = tab;
      settings_tab.on('close', handleCloseSettings);
      var worker = tab.attach({
         contentScriptFile : [
            './services.js',
            './settings.js'
         ],
         contentScriptOptions: {
            'used_services' : ss.storage.used_services
         }
      });
      worker.port.on('update_services', updateServices);
   } else if (tab == settings_tab) {
      settings_tab = null;
   }

}

function handleCloseSettings(tab) {
   settings_tab = null;
}

function updateServices(used_ids) {
   ss.storage.used_services = used_ids;
   panel.port.emit('update_services', used_ids);
}
