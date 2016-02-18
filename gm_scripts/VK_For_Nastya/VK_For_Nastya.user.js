// ==UserScript==
// @id          vk4nastya@Roman.Qlogin
// @name        VK For Nastya
// @namespace   Roman.Qlogin
// @author      Roman Kulagin
// @description Modify VK.com pages
// @include     *vk.com/*
// @include     *vkontakte.ru/*
// @license     MIT
// @homepage     https://qlogin.github.io/extensions/
// @homepageURL  https://qlogin.github.io/extensions/
// @downloadURL  https://qlogin.github.io/extensions/gm_scripts/VK_For_Nastya/VK_For_Nastya.user.js
// @updateURL    https://qlogin.github.io/extensions/gm_scripts/VK_For_Nastya/VK_For_Nastya.user.js
// @supportURL   https://github.com/qlogin/extensions/issues
// @version     0.1
// @grant       none
// ==/UserScript==

var titles = [" - лучшая девушка на свете!", 
              " - физик, художник и просто красавица! )))",
              " - мечта, Ромино вдохновение!"];
var cur_title = titles[Math.floor(Math.random() * titles.length)];

function refresh_page() {
  var user = document.getElementsByClassName("page_name");
  if (user.length == 1 && user[0].textContent === "Роман  Кулагин") {
    var stat = document.querySelector("#page_current_info .current_text");
    if (stat) {
      stat.innerHTML = "Безумно влюблен в <a href=\"/id86475825\">Настеньку</a> " +
        "<img src=\"http://thefinalcurtain1.files.wordpress.com/2014/03/gs_heart_clipart_free.png?w=16\"></img>";
    }
    var upd_profile = function() {
      var profile = document.querySelectorAll("#profile_short .profile_info .miniblock");
      for (var i = 0; i != profile.length; ++i) {
        if (profile[1].children[0].textContent == "Семейное положение:") {
          profile[1].children[1].innerHTML = "Скоро женится на <a href=\"/id86475825\">Анастасии Панфутовой</a>"; 
        }
      }
    }; 
    upd_profile();
    var btn = document.getElementsByClassName("profile_info_link");
    if (btn.length != 0)
      btn[0].addEventListener("click", upd_profile);
  } else if (user.length == 1 && user[0].textContent === "Anastasia  Panfutova") {
    var span = document.createElement("span");
    span.textContent = cur_title;
    span.style.color = "#f44";
    user[0].appendChild(span);
  }
  window.setTimeout(refresh_page, 2000);
}

refresh_page();

var messages = ["Настенька!!! Я тебя очень-очень сильно ЛЮБЛЮ!!!", 
                "Настёна! Мне удивительно хорошо рядом с тобой!", 
                "Настенька!!! Ты удивительная, потрясающая, невероятная!",
                "Солнышко моё! Я безумно рад, что мы вместе!"];

var div = document.createElement("div");
div.style.position = "fixed";
div.style.right = "5px";
div.style.top = "5px";
var link = document.createElement("a");
link.setAttribute("href", "/id35784");
var img = document.createElement("img");
img.setAttribute("src", "https://pp.vk.me/c625422/v625422784/34a0f/wArh8YnEam4.jpg");
img.style.width = "100px";
img.style.float = "right";
img.style.marginRight = "10px";
link.appendChild(img);
var msgdiv = document.createElement("div");
msgdiv.setAttribute("class", "fc_msgs_wrap fc_msgs_out");
msgdiv.style.height = "50px";
var msgtail = document.createElement("div");
msgtail.setAttribute("class", "chats_sp fc_out_msg_arr");
msgdiv.appendChild(msgtail);
var msgbody = document.createElement("div");
msgbody.setAttribute("class", "fc_msgs fl_r");
msgbody.style.height = "50px";
msgdiv.appendChild(msgbody);
var msg = document.createElement("div");
msg.setAttribute("class", "fc_msg wrapped  fc_msg_last fl_l");
msg.textContent = messages[Math.floor(Math.random() * messages.length)];
msgbody.appendChild(msg);
div.appendChild(link);
div.appendChild(document.createElement("br"));
div.appendChild(msgdiv);
document.body.appendChild(div);