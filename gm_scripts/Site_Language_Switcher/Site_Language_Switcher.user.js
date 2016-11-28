// ==UserScript==
// @id          site_language@Roman.Qlogin
// @name        Site Language Switcher
// @namespace   Roman.Qlogin
// @author      Roman Kulagin
// @description Add site language switcher at top-right corner (Combo box with icons-flags)
// @include     *.cppreference.com/w/*
// @include     *msdn.microsoft.com/*
// @license     MIT
// @homepage    https://qlogin.github.io/extensions
// @homepageURL https://qlogin.github.io/extensions
// @downloadURL https://qlogin.github.io/extensions/gm_scripts/Site_Language_Switcher/Site_Language_Switcher.user.js
// @updateURL   https://qlogin.github.io/extensions/gm_scripts/Site_Language_Switcher/Site_Language_Switcher.user.js
// @supportURL  https://github.com/qlogin/extensions/issues
// @version     0.1
// @grant       none
// ==/UserScript==

var style_str = "" +
".rq-dropbtn {" +
"    background-color: rgba(220,220,220,0.5);" +
"    padding: 12px;" +
"    border: none;" +
"    cursor: pointer;" +
"}\n" +
".rq-dropbtn:hover, .dropbtn:focus {" +
"    background-color: rgba(200,200,255,0.5);" +
"}\n" +
".rq-dropdown {" +
"    position: fixed;" +
"    right: 10px;" +
"    top: 10px;" +
"    display: inline-block;" +
"    z-index: 2000;"+
"}\n" +
".rq-dropdown-content {" +
"    display: none;" +
"    position: absolute;" +
"    right: 0px;" +
"    background-color: rgba(220,220,220,0.8);" +
"    min-width: 140px;" +
"    overflow: auto;" +
"    box-shadow: 0px 8px 16px 0px rgba(0,0,0,0.2);" +
"}\n" +
".rq-dropdown-content a {" +
"    color: black;" +
"    font-size: 12px;" +
"    padding: 8px 10px;" +
"    text-decoration: none;" +
"    display: block;" +
"}\n" +
".rq-dropdown a:hover {background-color: rgba(200,200,255,0.8)}\n" +
".rq-show {display:block;}\n";

var languages = {
    'ru' : { icon: 'http://flagpedia.net/data/flags/mini/ru.png', name: 'Русский'     , locale: 'ru-ru' },
    'en' : { icon: 'http://flagpedia.net/data/flags/mini/gb.png', name: 'English'     , locale: 'en-gb' },
    'us' : { icon: 'http://flagpedia.net/data/flags/mini/us.png', name: 'U.S. English', locale: 'en-us' },
    'de' : { icon: 'http://flagpedia.net/data/flags/mini/de.png', name: 'Deutche'     , locale: 'de-de' }
};

var cur_lng;

for (let lng in languages) {
    var l = languages[lng];
    var re = new RegExp('[\./](' + lng + '|' + l.locale + ')[\./]');
    if (re.test(document.URL)) {
        cur_lng = lng;
        break;
    }
}

if (cur_lng) {
    var css = document.createElement("style");
    css.innerHTML = style_str;
    document.body.appendChild(css);

    var div = document.createElement("div");
    div.className = "rq-dropdown";

    var btn = document.createElement("button");
    btn.className = "rq-dropbtn";
    div.appendChild(btn);

    var img = document.createElement("img");
    img.src = languages[cur_lng].icon;
    btn.appendChild(img);

    btn.onclick = function show_dropdown() {
        document.getElementById("rq-dropdown-id").classList.toggle("rq-show");
    };

    var div2 = document.createElement("div");
    div2.id = 'rq-dropdown-id';
    div2.className = 'rq-dropdown-content';
    div.appendChild(div2);

    for (let lng in languages) {
        var l = languages[lng];
        var link = document.createElement("a");
        if (lng != cur_lng) {
            var re1 = new RegExp('([\./])(' + cur_lng + ')([\./])');
            link.href = document.URL.replace(re1, '$1' + lng + '$3');
            var re2 = new RegExp('([\./])(' + languages[cur_lng].locale + ')([\./])');
            link.href = link.href.replace(re2, '$1' + l.locale + '$3');
        } else {
            link.href = "#";
        }
        var icon = document.createElement("img");
        icon.src = l.icon;
        link.appendChild(icon);
        link.appendChild(document.createTextNode(" " + l.name));
        div2.appendChild(link);
    }

    document.addEventListener("click", function(event) {
        if (!event.target.matches('.rq-dropdown *')) {
            var dropdowns = document.getElementsByClassName('rq-dropdown-content');
            for (var i = 0; i < dropdowns.length; i++) {
                var openDropdown = dropdowns[i];
                if (openDropdown.classList.contains('rq-show')) {
                    openDropdown.classList.remove('rq-show');
                }
            }
        }
    });
    document.body.appendChild(div);
}