var services = {
    'yandex' : {
        name : 'Yandex Maps',
        base_url : 'yandex.ru/maps',
        icon : 'https://yandex.ru/maps/favicon.png',
        get_poi_from_url : function(str) {
            var with_poi = true;
            str = str.replace(/\[/g, '%5B').replace(/\]/g, '%5D').replace(/ /g, '%2C');
            var res = str.match(/whatshere%5Bpoint%5D=([\d.]+)%2C([\d.]+)&whatshere%5Bzoom%5D=(\d+)/);
            if (!res) {
                with_poi = false;
                res = str.match(/ll=([\d.]+)%2C([\d.]+).*z=(\d+)/);
                if (!res) {
                    return res;
                }
            }
                     return [with_poi, res[2], res[1], res[3]];
        },
        get_url_from_poi : function(args) {
            var link = '/?ll=' + args[2] + '%2C' + args[1] + '&z=' + args[3];
            if (args[0]) {
                link += '&whatshere[point]=' + args[2] + '%2C' + args[1] + '&whatshere[zoom]=' + args[3];
            }
                     return link;
        }
    },
    'google' : {
        name : 'Google Maps',
        base_url : 'www.google.ru/maps',
        icon : 'https://www.google.com/images/branding/product/ico/maps_16dp.ico',
        get_poi_from_url : function(str) {
            var res = str.match(/@([\d.]+),([\d.]+),([\d.]+)z/);
            if (!res) {
                return res;
            }
                     return [false].concat(res.slice(1));
        },
        get_url_from_poi : function(args) {
            var link = '/@' + args[1] + ',' + args[2] + ',' + args[3] + 'z';
            return link;
        }
    },
    'osm' : {
        name : 'OpenStreetMap',
        base_url : 'www.openstreetmap.org',
        icon : 'https://www.openstreetmap.org/assets/favicon-16x16-b5e4abe84fb615809252921d52099ede3236d1b7112ea86065a8e37e421c610b.png',
        get_poi_from_url : function(str) {
            var with_poi = true;
            var res = str.match(/#map=(\d+)\/([\d.]+)\/([\d.]+)/);
            if (!res) {
                return res;
            }
                     return [false, res[2], res[3], res[1]];
        },
        get_url_from_poi : function(args) {
            var link = '/#map=' + args[3] + '/' + args[1] + '/' + args[2];
            return link;
        }
    },
    'osm_ru' : {
        name : 'OpenStreetMap RU',
        base_url : 'openstreetmap.ru',
        icon : 'http://openstreetmap.ru/favicon.png',
        get_poi_from_url : function(str) {
            var with_poi = true;
            var res = str.match(/#mmap=(\d+)\/([\d.]+)\/([\d.]+)/);
            if (!res) {
                with_poi = false;
                var res = str.match(/#map=(\d+)\/([\d.]+)\/([\d.]+)/);
                if (!res) {
                    return res;
                }
            }
                     return [with_poi, res[2], res[3], res[1]];
        },
        get_url_from_poi : function(args) {
            var link = '/#';
            if (args[0]) {
                link += 'mmap=' + args[3] + '/' + args[1] + '/' + args[2] + '&';
            }
                     link += 'map=' + args[3] + '/' + args[1] + '/' + args[2];
                     return link;
        }
    },
    'panoramio' : {
        name : 'Panoramio',
        base_url : 'www.panoramio.com/map',
        icon : 'http://www.panoramio.com/img/favicon.ico',
        get_poi_from_url : function(str) {
            var res = str.match(/#lt=([\d.]+)&ln=([\d.]+)&z=([\d.]+)/);
            if (!res) {
                return res;
            }
                     res[3] = String(17 - parseInt(res[3]));
                     return [false].concat(res.slice(1));
        },
        get_url_from_poi : function(args) {
            var link = '#lt=' + args[1] + '&ln=' + args[2] + '&z=' + String(17 - parseInt(args[3])) + '&k=0';
            return link;
        }
    },
    'f4map' : {
        name : 'F4 map',
        base_url : 'demo.f4map.com',
        icon : 'https://www.f4map.com/cacheForever/f51c5661379bb5441e8e773abdf87d7a8a9932cd/images/f4_favicon.png',
        get_poi_from_url : function(str) {
            var res = str.match(/lat=([\d.]+)&lon=([\d.]+)&zoom=([\d.]+)/);
            if (!res) {
                return res;
            }
                     return [false].concat(res.slice(1));
        },
        get_url_from_poi : function(args) {
            var link = '/#lat=' + args[1] + '&lon=' + args[2] + '&zoom=' + args[3];
            return link;
        }
    },
    'wikimapia' : {
        name : 'Wikimapia',
        base_url: 'wikimapia.org',
        icon : 'http://wikimapia.org/favicon.ico',
        get_poi_from_url : function(str) {
            var res = str.match(/lat=([\d.]+)&lon=([\d.]+)&z=([\d.]+)/);
            if (!res) {
                return res;
            }
                       return [false].concat(res.slice(1));
        },
        get_url_from_poi : function(args) {
            var link = '/#lat=' + args[1] + '&lon=' + args[2] + '&z=' + args[3];
            return link;
        }
    }
};