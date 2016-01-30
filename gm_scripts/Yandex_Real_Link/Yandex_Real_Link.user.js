// ==UserScript==
// @name        Yandex Real Link
// @namespace   Roman.Qlogin
// @description Remove 'mousedown' attribute from links
// @include     https://*yandex.*
// @version     1
// @grant       none
// ==/UserScript==

'use strict';

Array.filter(document.getElementsByTagName('a'), function(e) {
        return e.hasAttribute('onmousedown');
    }).forEach(function(e) {
        e.removeAttribute('onmousedown');
});