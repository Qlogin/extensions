// ==UserScript==
// @name        Geocaching coordinates
// @namespace   Roman.Qlogin
// @include     http://www.geocaching.su/*
// @description Find geo coordinates on geocachers sites and make links to OSM
// @version     1
// @grant       none
// ==/UserScript==

'use strict';

var rex = /[NS]\s*(\d+)\s*(°|градусов)\s*([0-9.,]+)\s*('|мин)?.{1,10}[EW]\s*(\d+)\s*(°|градусов)\s*([0-9.,]+)\s*('|мин)?/g;

function convert(str, deg1, sym1, min1, sym2, deg2, sym3, min2, sym4)
{
   var val1 = parseFloat(deg1) + parseFloat(min1.replace(',', '.')) / 60.0;
   var val2 = parseFloat(deg2) + parseFloat(min2.replace(',', '.')) / 60.0;
   var osm_link = 'http://openstreetmap.ru/'
            + '#mmap=17/' + val1.toString() + '/' + val2.toString()
            + '&map=17/' + val1.toString() + '/' + val2.toString();
   var ya_link = 'https://maps.yandex.ru/?ll='
               + val2.toString() + '%2C' + val1.toString() + '&z=17&whatshere[point]='
               + val2.toString() + '%2C' + val1.toString() + '&whatshere[zoom]=17';
   var google_link = 'https://www.google.ru/maps/@'
                   + val1.toString() + ',' + val2.toString() + ',17.75z';

   var tag  = '<b>' + str + '</b> [<a href="' + ya_link + '" target="_maps">ya</a>|'
                              +   '<a href="' + osm_link + '"target="_maps">osm</a>|'
                              +   '<a href="' + google_link + '"target="_maps">gmap</a>]';
   return tag;
}

var html = document.body.innerHTML;
var new_html = html.replace(rex, convert);
document.body.innerHTML = new_html;
