var messageDigest = new com.oclib.javascript.security.MessageDigest();
var numeralSystem = new com.oclib.javascript.math.NumeralSystem();
var motoString = "";

function titleClicked() {
  addon.port.emit("title-clicked");
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
  if (newMoto != "")
     motoString = newMoto;
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

function on_init(host) {
  document.getElementById("domain").value = host;

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

if (typeof addon !== 'undefined') {
  addon.port.on("init", on_init);
  addon.port.on("close", on_close);
  addon.port.on("set-user", on_set_user);
}
