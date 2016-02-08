// ==UserScript==
// @id          wiki_language_flag@Roman.Qlogin
// @name        Wiki Language Flag
// @namespace   Roman.Qlogin
// @author      Roman Kulagin
// @description Add panel with flag icons for available languages of current article
// @include     *.wikipedia.org/wiki/*
// @license     MIT
// @homepage    https://qlogin.github.io/extensions/
// @homepageURL https://qlogin.github.io/extensions/
// @downloadURL https://qlogin.github.io/extensions/gm_scripts/Wiki_Language_Flag/Wiki_Language_Flag.user.js
// @updateURL   https://qlogin.github.io/extensions/gm_scripts/Wiki_Language_Flag/Wiki_Language_Flag.user.js
// @supportURL  https://github.com/qlogin/extensions/issues
// @version     0.1
// @grant       none
// ==/UserScript==

var lang_icons = {
    'ru' : 'http://flagpedia.net/data/flags/mini/ru.png',
    'en' : 'http://flagpedia.net/data/flags/mini/gb.png',
    'simple' : 'http://flagpedia.net/data/flags/mini/us.png'
};

var lngs = ['simple', 'en', 'ru'];
var div_lng = document.createElement('div');
div_lng.style.position = 'fixed';
div_lng.style.top = '5px';
div_lng.style.left   = '0';
div_lng.style.width  = '10.7em';
div_lng.style.background = 'rgba(200, 200, 200, 0.85)';
div_lng.style.border = '0.15em ridge';
var title = document.createElement('span');
title.appendChild(document.createTextNode('Язык:'));
title.style.fontSize = '0.75em';
title.style.marginLeft = '5px';
div_lng.appendChild(title);
document.body.appendChild(div_lng);

for (var i = 0; i != lngs.length; ++i) {
    var href = '';
    var lng_a = document.querySelector('a[lang=' + lngs[i] + ']');
    if (lng_a !== null) {
        href = lng_a.getAttribute('href');
    } else if (document.location.hostname.startsWith(lngs[i])) {
        href = '#';
    }
    else
        continue;

    var link = document.createElement('a');
    link.setAttribute('href', href);
    link.style.float = 'right';
    var img = document.createElement('img');
    img.setAttribute('src', lang_icons[lngs[i]]);
    img.style.height = '15px';
    img.style.paddingRight = '5px';
    link.appendChild(img);
    div_lng.appendChild(link);
    if (href === '#')
       img.style.filter = 'brightness(70%)';
}