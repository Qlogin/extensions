var FIREFOX = (typeof addon !== 'undefined');
var CHROMIUM = (typeof chrome !== 'undefined' && typeof chrome.tabs !== 'undefined');

var messageDigest = new com.oclib.javascript.security.MessageDigest();
var numeralSystem = new com.oclib.javascript.math.NumeralSystem();
var motoString = "";

function titleClicked() {
  if (FIREFOX) {
    addon.port.emit("title-clicked");
  } else if (CHROMIUM) {
    chrome.tabs.create({url: 'http://parolemanager.com', active: true});
  } else {
    document.location.href = 'http://parolemanager.com';
  }
}

function motoChanged() {
  var moto = document.getElementById("moto");
  var hint = document.getElementsByClassName("hint")[0];
  if (moto.value == "")
    hint.innerHTML = "[show]";
  else
    hint.innerHTML = "[hide]";
}

function hintClicked() {
  var moto = document.getElementById("moto");
  var hint = document.getElementsByClassName("hint")[0];
  if (moto.value != "") {
    motoString = moto.value;
    moto.value = "";
    moto.setAttribute("placeholder", "●●●●●●●●●●");
    hint.innerHTML = "[show]";
  } else if (motoString != "") {
    moto.value = motoString;
    hint.innerHTML = "[hide]";
  }
}

function getPassword() {
  var newMoto = document.getElementById("moto").value;
  if (newMoto != "") {
    motoString = newMoto;
    if (CHROMIUM) {
      chrome.runtime.getBackgroundPage(function(bgPage) {
        bgPage["motoString"] = motoString;
      });
    }
  }
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
  return ""+a+""+b+""+c+""+d;
};

function showPassword() {
  var shortPassword = getPassword();
  document.getElementById("password").value = shortPassword;
  return 1;
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
  } catch(err) {  
    console.log('Oops, unable to copy password');
  }
  area.value = "";
}

function fillForm() {
  var shortPassword = getPassword();
  var email = document.getElementById("email").value;
  addon.port.emit("fill-form", email, shortPassword);
}

// Main panel events callback
function get_host(url) {
  var proto_pos = url.indexOf('://');
  if (proto_pos > 0) {
     url = url.substring(proto_pos + 3);
  }
  var slash_pos = url.indexOf('/');
  if (slash_pos > 0) {
    url = url.substring(0, slash_pos);
  }
  var dot_pos = url.lastIndexOf('.');
  if (dot_pos > 0) {
    dot_pos = url.lastIndexOf('.', dot_pos - 1);
    url = url.substring(dot_pos + 1);
  }
  return url;
}

function on_init(url) {
  document.getElementById("domain").value = get_host(url);

  var moto = document.getElementById("moto");
  var hint = document.getElementsByClassName("hint")[0];
  if (motoString != "") {
    moto.setAttribute("placeholder", "●●●●●●●●●●");
    hint.innerHTML = "[show]";
  } else {
    moto.setAttribute("placeholder", "");
    hint.innerHTML = "";
  }
}

function on_close() {
  var moto = document.getElementById("moto");
  if (moto.value != "")
     motoString = moto.value;
  moto.value = "";
  document.getElementById("password").value = "";
}

function on_set_user(user) {
  if (user != "") {
    document.getElementById("email").value = user;
  }
}

window.onload = function init() {
  document.getElementById("moto").addEventListener("input", motoChanged);
  document.getElementsByClassName("hint")[0].addEventListener("click", hintClicked);
  document.getElementById("getPassword").addEventListener("click", showPassword);
  document.getElementById("copyPassword").addEventListener("click", copyToClipboard);
  document.getElementsByClassName("title")[0].addEventListener("click", titleClicked);

  if (FIREFOX) {
    addon.port.on("init", on_init);
    addon.port.on("close", on_close);
    addon.port.on("set-user", on_set_user);
    document.getElementById("fillForm").addEventListener("click", fillForm);
  } else if (CHROMIUM) {
    console.log('Init Tab');
    chrome.runtime.getBackgroundPage(function(bgPage) {
      motoString = bgPage["motoString"];
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        on_init(tabs[0].url);
      });
    });
  }
}
