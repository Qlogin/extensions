// ==UserScript==
// @name         Monoceros Links
// @namespace    Roman.Qlogin
// @description  Add Monoceros common links
// @include      http://10.10.54.55:55555/*
// @version      1
// @grant        none
// ==/UserScript==

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

var h1 = document.getElementsByTagName("h1")[0];
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

   var create_by_dir = document.getElementById("layer_from_dir_task_creation");
   if (create_by_dir) {
      forms = [];
      for (i = 0; i != document.forms.length; ++i)
         forms.push(document.forms.item(i));

      table = document.createElement("table");
      create_by_dir.parentNode.insertBefore(table, create_by_dir);
      for (i = 0; i != forms.length; ++i) {
         if (forms[i].id.startsWith("layer_frames_")) {
            row = document.createElement("tr");
            row.appendChild(document.createElement("td"));
            row.appendChild(document.createElement("td"));
            table.appendChild(row);
            forms[i].children[1].style.width = "200px";
            label = forms[i].children[0];
            forms[i].removeChild(label);
            row.children[0].appendChild(document.createTextNode(label.textContent));
            row.children[0].style.padding = "5px";
            row.children[1].appendChild(forms[i]);
         }
      }

      wrapToFieldset(create_by_dir, "Create layer from directory:", 3);
      var create_accurate = document.getElementById("accurate_layer_task_creation");
      if (create_accurate) {
           wrapToFieldset(create_accurate, "Create accurate layer:", 3);
      }

      var details = document.getElementsByTagName("details");
      for (i = 0; i != details.length; ++i) {
         var div = document.createElement("div");
         div.style.display = "none";
         div.appendChild(details[i].childNodes[1]);
         details[i].appendChild(div);
         var summary = details[i].childNodes[0];
         summary.onclick = function(event) {
              var next = event.target.nextSibling;
              if (next.style.display === "none") {
                 next.style.display = "block";
              } else {
                 next.style.display = "none";
              }
         };
         //var iframe = document.createElement("iframe");
         //iframe.src = "data:application/json;charset=utf-8," + encodeURI(details[i].childNodes[1].textContent);
         //iframe.style.width = "100%";
         //details[i].removeChild(details[i].childNodes[1]);
         //details[i].appendChild(iframe);
         //iframe.contentWindow.document.open("application/json", "replace");
         //iframe.contentWindow.document.write(details[i].childNodes[1].textContent);
         //iframe.contentWindow.document.close();
      }
   }

   var h2 = document.getElementsByTagName('h2');
   if (h2.length == 1 && h2[0].textContent == "Layers:") {
      var layer = null;
      var layers = document.getElementsByTagName('h3');
      if (layers.length > 0)
         layer = layers[0];

      while (layer) {
         var res = layer.textContent.match(/Layer '([a-zA-Z0-9_-]+)'/);
         if (res) {
            layer.innerHTML = "Layer '<a href=\"/layers/" + res[1] + "\">" + res[1] + "'</a>:";
         }
         var div = document.createElement("div");
         div.setAttribute("class", "layer");
         var child = layer.nextSibling;
         layer.parentNode.insertBefore(div, child);
         while (child && child.nodeName.toLowerCase() != "h3") {
            var next = child.nextSibling;
            if (child.nodeName.toLowerCase() == "table") {
               var details = document.createElement("details");
               var summary = document.createElement("summary");
               summary.textContent = "[Click for information]";
               summary.onclick = function(event) {
                  var body = event.target.nextSibling;
                  if (body.style.display == "none") {
                     body.style.display = "table";
                  } else {
                     body.style.display = "none";
                  }
               }
               details.appendChild(summary);
               details.appendChild(child);
               div.appendChild(details);
               child.style.display = "none";
               child = next;
               continue;
            } else if (child.nodeName.toLowerCase() == "form" &&
                       child.getAttribute("action").endsWith('multi_angle')) {
               child = wrapToFieldset(child, "Multi Angle", 0);
            }
            div.appendChild(child);
            child = next;
         }
         layer = child;
      }
   }
}

function wrapToFieldset(element, fieldset_name, childnum) {
   var parent = element.parentNode;
   var div = document.createElement("p");
   var fieldset = document.createElement("fieldset");
   var title = document.createElement("legend");
   title.appendChild(document.createTextNode(fieldset_name));
   fieldset.appendChild(title);
   div.appendChild(fieldset);
   parent.insertBefore(div, element);

   var index = Array.prototype.indexOf.call(parent.childNodes, element);
   fieldset.appendChild(element);
   while (--childnum >= 0) {
      fieldset.appendChild(parent.childNodes[index]);
   }
   return div;
}
