// ==UserScript==
// @name        Monoceros Links
// @namespace   Roman.Qlogin
// @description Add Monoceros common links
// @include     http://10.10.54.55:55555/*
// @version     1
// @grant       none
// ==/UserScript==

var links = ["layers/ui", "layers", "tasks/ui", "tasks"];

var par = document.createElement("p");

var i;
for (i = 0; i != links.length; ++i) {
  var lnk = links[i];
  var sep = document.createTextNode(" | ");
  var anc = document.createElement("a");
  anc.href = "/" + lnk;
  var txt = document.createTextNode(lnk);
  anc.appendChild(txt);
  par.appendChild(sep);
  par.appendChild(anc);
}

document.body.insertBefore(par, document.body.firstChild);