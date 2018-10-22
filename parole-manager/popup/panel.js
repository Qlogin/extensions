var messageDigest = new com.oclib.javascript.security.MessageDigest();
var numeralSystem = new com.oclib.javascript.math.NumeralSystem();
var motoString = "";


function updateMoto() {
  var moto = document.getElementById("moto");
  if (moto.value != "" && moto.type == "password") {
    motoString = moto.value;
    showMoto(false);

    if (typeof addon !== 'undefined')
      addon.port.emit("moto-changed", motoString);
  }
}

function showMoto(show) {
  var moto = document.getElementById("moto");
  var hint = document.getElementById("hint");
  if (show) {
    updateMoto();
    moto.type  = "text";
    moto.value = motoString;
  } else {
    moto.type  = "password";
    moto.value = "";
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
  return ""+a+""+b+""+c+""+d;
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

/// Main panel events callback ///

function on_init(host) {
  document.getElementById("domain").value = host;

  var moto = document.getElementById("moto");
  if (motoString != "") {
    moto.setAttribute("placeholder", "●●●●●●●●●●");
  } else {
    moto.setAttribute("placeholder", "");
  }

  addon.port.emit('set-height', document.body.scrollHeight);
}

function on_close() {
  updateMoto();

  var moto = document.getElementById("moto");
  moto.value = "";
  document.getElementById("password").value = "";
}

function on_set_user(user) {
  if (user != "") {
    document.getElementById("email").value = user;
  }
}

function on_set_moto(moto) {
  motoString = moto;
  showMoto(false);
}

function on_show_hint(show) {
  document.getElementById("hint").style.display = show ? "inline-block" : "none";
}

/// Initialization block ///

function listenForClicks() {
  document.getElementById("title").addEventListener("click", function(e) {
    browser.tabs.create({url: "http://parolemanager.com"});
  });
  document.getElementById("moto").addEventListener("blur", function(e) { updateMoto(); });

  let hint = document.getElementById("hint");
  hint.addEventListener("mousedown", function(e) { showMoto(true); });
  hint.addEventListener("mouseup"  , function(e) { showMoto(false); });

  // Buttons
  document.getElementById("getPassword").addEventListener("click", function(e) { showPassword(true); });
  document.getElementById("copyPassword").addEventListener("click", function(e) { copyToClipboard(); });
  document.getElementById("fillForm").addEventListener("click", function(e) { fillForm(); });

  document.getElementById("clear").addEventListener("click", function(e) { showPassword(false); });
}

function reportExecuteScriptError() {
  document.getElementById("fillForm").disabled = true;
}

document.addEventListener("DOMContentLoaded", function(e) {
  listenForClicks();

  if (typeof browser !== 'undefined') {
    browser.tabs.executeScript({file: "/content_scripts/fill-form.js"})
      .catch(reportExecuteScriptError);
  }
});

