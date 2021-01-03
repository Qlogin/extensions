var messageDigest = new com.oclib.javascript.security.MessageDigest();
var numeralSystem = new com.oclib.javascript.math.NumeralSystem();
var motoString = "";
var motoIsVisible = false;

function updateMoto() {
   var moto = document.getElementById("moto");
   if (moto.value != "" && moto.type == "password") {
      motoString = moto.value;
      showMoto(false);

      chrome.runtime.sendMessage({
         command: "updateMoto",
         moto: motoString
      });
   }
}

function showMoto(show) {
   var moto = document.getElementById("moto");
   var hint = document.getElementById("hint");
   if (show) {
      updateMoto();
      moto.type = "text";
      moto.value = motoString;
      motoIsVisible = true;
   } else {
      moto.type = "password";
      moto.value = "";
      motoIsVisible = false;
      if (motoString != "") {
         moto.setAttribute("placeholder", "●●●●●●●●●●");
      } else {
         moto.setAttribute("placeholder", "");
      }
   }
}

function getPassword() {
   updateMoto();
   var stringForPassword = motoString
      + document.getElementById("domain").value
      + document.getElementById("email").value;
   var convertedPassword = getPasswordSimple(stringForPassword);
   var length = document.getElementById("length").value;
   return convertedPassword.substr(0, length);
}

function getPasswordSimple(string) {
   var longPassword = messageDigest.md5(string).toUpperCase();
   var a = longPassword.substr(0, 8);
   var b = longPassword.substr(8, 8);
   var c = longPassword.substr(16, 8);
   var d = longPassword.substr(24, 8);
   a = numeralSystem.convert(a, 16, 62);
   b = numeralSystem.convert(b, 16, 62);
   c = numeralSystem.convert(c, 16, 62);
   d = numeralSystem.convert(d, 16, 62);
   return "" + a + "" + b + "" + c + "" + d;
};

function showPassword(show) {
   var pwd = document.getElementById("password");
   if (show) {
      var shortPassword = getPassword();
      pwd.value = shortPassword;
   } else {
      pwd.value = "";
   }
}

function copyToClipboard() {
   var shortPassword = getPassword();
   var area = document.getElementById("password");
   area.value = shortPassword;
   area.select();

   try {
      var successful = document.execCommand('copy');
      var msg = successful ? 'successfully' : 'unsuccessfully';
      console.log('Copy password to clipboard ' + msg);
   } catch (err) {
      console.log('Oops, unable to copy password');
   }
   area.value = "";
}

/// Main panel events callback ///

function on_set_moto(response) {
   motoString = response.moto;
   showMoto(false);
}

function on_set_domain(tabs) {
   var current = tabs[0];
   if (current.url) {
      try {
         let url = new URL(current.url);
         let dotpos = url.hostname.lastIndexOf('.');
         if (dotpos != -1) {
            dotpos = url.hostname.lastIndexOf('.', dotpos - 1);
            document.getElementById("domain").value = url.hostname.substr(dotpos + 1);
         }
      } catch (e) {
         // Invalid active tab URL
      }
   }
}

function on_script_message(msg) {
   if (msg.command == "setUser") {
      document.getElementById("email").value = msg.user;
   }
}

function on_check_script(response) {
   console.log('Check script response!');
   response = response || {};
   if (!("status" in response)) {
      console.log('Injecting scripts!');
      chrome.tabs.executeScript({
         file: "content_scripts/jquery.min.js"
      });
      chrome.tabs.executeScript({
         file: "content_scripts/fill-form.js"
      });
   }

   var port = chrome.runtime.connect({ name: "popup" });
   port.onMessage.addListener(on_script_message);
   port.postMessage({ command: "getUser" });

   document.getElementById("fillForm").addEventListener("click", function (e) { 
      var shortPassword = getPassword();
      var username = document.getElementById("email").value;

      port.postMessage({ 
         command: "fillForm", 
         user: username, 
         password: shortPassword 
      });
   });
}

function on_show_hint(show) {
   document.getElementById("hint").style.display = show ? "inline-block" : "none";
}

/// Initialization block ///

function listenForClicks() {
   document.getElementById("title").addEventListener("click", function (e) {
      if (typeof chrome !== 'undefined') {
         chrome.tabs.create({ url: "http://parolemanager.com" });
      }
   });
   document.getElementById("moto").addEventListener("blur", function (e) { updateMoto(); });

   let hint = document.getElementById("hint");
   hint.addEventListener("mousedown", function (e) { showMoto(true); });
   hint.addEventListener("mouseup", function (e) { showMoto(false); });
   hint.addEventListener("mouseout", function (e) { 
      if (motoIsVisible) {
         showMoto(false); 
      }
   });

   // Buttons
   document.getElementById("getPassword").addEventListener("click", function (e) { showPassword(true); });
   document.getElementById("copyPassword").addEventListener("click", function (e) { copyToClipboard(); });
   document.getElementById("clear").addEventListener("click", function (e) { showPassword(false); });
}

document.addEventListener("DOMContentLoaded", function (e) {
   listenForClicks();

   if (typeof chrome !== "undefined") {
      chrome.tabs.query({ active: true, currentWindow: true }, on_set_domain);
      chrome.runtime.sendMessage({ command: "getMoto" }, on_set_moto);
      chrome.runtime.sendMessage({ command: "checkScript" }, on_check_script);
   }
});
