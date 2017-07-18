// ==UserScript==
// @id           monoceros@Roman.Qlogin
// @name         Monoceros Links
// @namespace    Roman.Qlogin
// @author       Roman Kulagin
// @include      http://10.10.74.11:*
// @include      http://10.10.54.139:*
// @description  Prettify DOM structure of Monoceros UI pages
// @license      MIT
// @homepage     https://qlogin.github.io/extensions/
// @homepageURL  https://qlogin.github.io/extensions/
// @downloadURL  https://qlogin.github.io/extensions/gm_scripts/Monoceros_Links/Monoceros_Links.user.js
// @updateURL    https://qlogin.github.io/extensions/gm_scripts/Monoceros_Links/Monoceros_Links.user.js
// @supportURL   https://github.com/qlogin/extensions/issues
// @version      0.2
// @grant        none
// ==/UserScript==

var style_str = "" +
"body { margin-top: 40px; }" +
".navbar {" +
"    font-family: monospace;" +
"    position: fixed;" +
"    top: 0;" +
"    left: 0;" +
"    background-color: lightgrey;" +
"    padding: 10px;" +
"    width: 100%;" +
"    z-index: 100;" +
"}" +
".monoceros-logo {" +
"    display: inline-block;" +
"    background-image: url(\"https://encrypted-tbn1.gstatic.com/images?q=tbn:ANd9GcQsK3pvC3HzIRo9whCbUZBVAyDo-ZEetyDhdijefZQrh59VIWtK\");" +
"    background-size: 100% 100%;" +
"    width: 32px;" +
"    height: 32px;" +
"}" +
".heading1 {" +
"    padding-bottom: 10px;" +
"    font-family: 'Crafty Girls';" +
"    font-weight: 300;" +
"}" +
"select, input:not([type]) {" +
"    padding: 3px 5px;" +
"    margin: 2px 2px;" +
"    display: inline-block;" +
"    border: 1px solid #888;" +
"    border-radius: 4px;" +
"    box-sizing: border-box;" +
"}" +
".button-holder input[type=submit] {" +
"    background-color: mediumseagreen;" +
"	  box-shadow: 0px 1px 3px rgba(0, 0, 0, 0.12), 0px 1px 2px rgba(0, 0, 0, 0.24);" +
"    padding: 3px 5px;" +
"    margin: 2px 2px;" +
"    border-radius: 4px;" +
"    cursor: pointer;" +
"    color: white;" +
"    text-shadow: 1px -1px 2px darkgreen;" +
"}" +
".button-holder input[type=submit]:hover { background-color: mediumaquamarine; }" +
"#tasks_table td { vertical-align: top; }" +
"#tasks_table tr:nth-child(even) { background-color: #f2f2f2; }" +
"th { background-color: lightblue; }" +
".form-header {" +
"    background-color: lightblue;" +
"    font-weight: bold;" +
"    padding-top: 5px;" +
"    padding-bottom: 5px;" +
"    border: 1px solid #999;" +
"}";

var icon_link = document.createElement("link");
icon_link.href = "https://encrypted-tbn1.gstatic.com/images?q=tbn:ANd9GcQsK3pvC3HzIRo9whCbUZBVAyDo-ZEetyDhdijefZQrh59VIWtK";
icon_link.type = "image/x-icon";
icon_link.rel  = "shortcut icon";
document.head.appendChild(icon_link);

var font_link = document.createElement("link");
font_link.href = "https://fonts.googleapis.com/css?family=Crafty+Girls";
font_link.rel  = "stylesheet";
document.head.appendChild(font_link);

var css = document.createElement("style");
css.innerHTML = style_str;
document.head.appendChild(css);

var links = ["layers/ui", "layers", "tasks/ui", "tasks"];

var div = document.createElement("div");
div.setAttribute("class", "navbar");

var i;
for (i = 0; i != links.length; ++i) {
   var lnk = links[i];
   var sep = document.createTextNode(" | ");
   var anc = document.createElement("a");
   anc.href = "/" + lnk;
   var txt = document.createTextNode(lnk);
   anc.appendChild(txt);
   div.appendChild(sep);
   div.appendChild(anc);
}
document.body.insertBefore(div, document.body.firstChild);

var h1 = document.getElementsByClassName("heading1")[0];
if (h1) {
   var logo = document.createElement("div");
   logo.setAttribute("class", "monoceros-logo");
   h1.appendChild(logo);

   inputs = document.getElementsByTagName("input");
   for (i = 0; i != inputs.length; ++i) {
      if (inputs[i].type == "text") {
         if (inputs[i].value == inputs[i].getAttribute("value")) {
            inputs[i].value = "";
         }
      }
   }
}
