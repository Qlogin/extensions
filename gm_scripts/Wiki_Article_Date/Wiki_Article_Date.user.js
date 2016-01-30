// ==UserScript==
// @name        Wiki Article Date
// @namespace   Roman.Qlogin
// @description Show last modification time of Wikipedia's article
// @include     *.wikipedia.org/*
// @version     1
// @grant       none
// ==/UserScript==

var str_date = '';
var last_date = document.getElementById('footer-info-lastmod');
if (last_date !== null) {
    var rus_match = last_date.textContent.match(/: \d\d:\d\d, (.*)\./);
    if (rus_match !== null) {
        str_date = 'от ' + rus_match[1];
    } else {
        var eng_match = last_date.textContent.match(/on (.*), at \d\d:\d\d/);
        if (eng_match !== null) {
            str_date = 'from ' + eng_match[1];
        }
    }
}

var rev_date = document.getElementById('mw-revision-date');
if (rev_date !== null) {
    var match = rev_date.textContent.match(/\d\d:\d\d, (.*)/);
    if (match !== null) {
        str_date = match[1];
    }
}

if (str_date !== '') {
    var title = document.getElementById('firstHeading');
    var viewh = document.querySelectorAll("#ca-history a");
    if (title !== null && viewh.length > 0) {
        var link = viewh[0].getAttribute('href');
        var sup_node = document.createElement('sup');
        var a_node = document.createElement('a');
        var a_text = document.createTextNode(str_date);
        a_node.setAttribute('href', link);
        a_node.appendChild(a_text);
        sup_node.appendChild(a_node);
        title.appendChild(sup_node);
        sup_node.style.fontSize = 'small';
        sup_node.style.paddingLeft = '5px';
    }
}