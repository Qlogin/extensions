// ==UserScript==
// @name        Yandex Real Link
// @namespace   Roman.Qlogin
// @author      Roman Kulagin
// @description Remove 'mousedown' attribute from links (in search machines like yandex, google, etc.)
// @include     https://*yandex.*
// @include     https://*google.*
// @license     MIT
// @homepage    https://qlogin.github.io/extensions/
// @homepageURL https://qlogin.github.io/extensions/
// @downloadURL https://qlogin.github.io/extensions/gm_scripts/Yandex_Real_Link/Yandex_Real_Link.user.js
// @updateURL   https://qlogin.github.io/extensions/gm_scripts/Yandex_Real_Link/Yandex_Real_Link.user.js
// @supportURL  https://github.com/qlogin/extensions/issues
// @version     0.1
// @grant       none
// ==/UserScript==

'use strict';

Array.filter(document.getElementsByTagName('a'), function(e) {
        return e.hasAttribute('onmousedown');
    }).forEach(function(e) {
        e.removeAttribute('onmousedown');
});
