(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _loglevel = require('loglevel');

var _loglevel2 = _interopRequireDefault(_loglevel);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var port = function port(portName) {
    var _this = this;

    var portType = arguments.length <= 1 || arguments[1] === undefined ? 'client' : arguments[1];
    var clientConnectedPort = arguments.length <= 2 || arguments[2] === undefined ? null : arguments[2];

    _classCallCheck(this, port);

    this.port = null;
    this.portName = null;
    this.portType = null;
    this.throttled = {};

    this.onMessage = function (request) {
        _loglevel2.default.trace("port[%s][%s].onMessage() request %o", _this.portName, _this.portType, request);
        if (_this.onMessageCb) _this.onMessageCb(request);
    };

    this.onMessageCb = function (request) {
        _loglevel2.default.trace("port[%s][%s].onMessageCb() request %o", _this.portName, _this.portType, request);
    };

    this.addOnMessageCb = function (cb) {
        _loglevel2.default.trace("port[%s][%s].addOnMessageCb() with cb %o", _this.portName, _this.portType, cb);
        _this.onMessageCb = cb;
    };

    this.onDisconnect = function () {
        _loglevel2.default.error("port[%s][%s].constructor() port disconnected from other side", _this.portName, _this.portType);
        _this.port = null;
    };

    this.send = function (data) {
        var useThrottling = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];
        var throttlingKey = arguments.length <= 2 || arguments[2] === undefined ? null : arguments[2];
        var throttleTime = arguments.length <= 3 || arguments[3] === undefined ? 1000 : arguments[3];

        _loglevel2.default.trace("port[%s][%s].send()" + (useThrottling ? " throttled" : "") + " data %o", _this.portName, _this.portType, data);
        if (!_this.port) {
            _loglevel2.default.debug("port[%s][%s].send() port not connected", _this.portName, _this.portType);
            return;
        }

        try {
            _loglevel2.default.trace("port[%s][%s].send() sending", _this.portName, _this.portType);
            if (!useThrottling || new Date().getTime() - throttleTime > (_this.throttled[throttlingKey] || 0)) {
                _this.port.postMessage(data);
                if (useThrottling) _this.throttled[throttlingKey] = new Date().getTime();
                _loglevel2.default.debug("port[%s][%s].send() sent data %o", _this.portName, _this.portType, data);
            } else _loglevel2.default.trace("port[%s][%s].send() send canceled due throttling %d ms", _this.portName, _this.portType, throttleTime);
        } catch (e) {
            _this.port = null;
            _loglevel2.default.error("port[%s][%s].send() error while sending %o", _this.portName, _this.portType, e);
        }
    };

    _loglevel2.default.trace("port[%s][%s].constructor() with portType <%s> and client's connected port %o", this.portName, this.portType, portType, clientConnectedPort);
    try {
        if (portType == 'client') {
            _loglevel2.default.trace("port[%s][%s].constructor() port connecting", this.portName, this.portType);
            this.port = chrome.runtime.connect({ name: portName });
            _loglevel2.default.trace("port[%s][%s].constructor() port connected", this.portName, this.portType);
        } else if (portType == 'host') {
            this.port = clientConnectedPort;
        }
        this.port.onDisconnect.addListener(this.onDisconnect);
        this.port.onMessage.addListener(this.onMessage);
        this.portType = portType;
        this.portName = portName;
    } catch (e) {
        _loglevel2.default.trace("port[%s][%s].constructor() port connection error %o", this.portName, this.portType, e);
    }
};

exports.default = port;

},{"loglevel":4}],2:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _loglevel = require('loglevel');

var _loglevel2 = _interopRequireDefault(_loglevel);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var utils = function () {
    function utils() {
        _classCallCheck(this, utils);
    }

    //проверка URL'а вкладки на предмет Я.Музыки или Я.Радио


    _createClass(utils, null, [{
        key: 'isUrlMatch',
        value: function isUrlMatch(url) {
            if (url.match(/^https?:\/\/(radio|music)\.yandex\.(ru|by|kz|ua)\/.*\.(gif|png|jpg|svg|js|css|ico)$/)) return false;

            var isRadio = url.match(/^https?:\/\/radio\.yandex\.(ru|by|kz|ua)\/.*$/) !== null,
                isMusic = url.match(/^https?:\/\/music\.yandex\.(ru|by|kz|ua)\/.*$/) !== null;

            return isRadio || isMusic ? { isRadio: isRadio, isMusic: isMusic } : false;
        }
    }, {
        key: 'injectScript',


        //inject'им наш код в content-script вкладки
        value: function injectScript(tabId, file) {
            chrome.tabs.executeScript(tabId, { file: file }, function () {
                if (chrome.runtime.lastError) {
                    if (chrome.runtime.lastError.message == 'The tab was closed') return false;

                    throw new Error("Inject of file <" + file + "> on tab <" + tabId + "> error: " + chrome.runtime.lastError.message);
                }
            });
        }
    }, {
        key: 'injectCode',


        //inject кода в пространоство страницы из CS скрипта, который выполняется в песочнице
        value: function injectCode(func) {
            var script = document.createElement('script');

            for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
                args[_key - 1] = arguments[_key];
            }

            script.textContent = 'try {(' + func + ')(' + args + '); } catch(e) {console.error("injected error", e);};';
            (document.head || document.documentElement).appendChild(script);
            script.parentNode.removeChild(script);
        }
    }, {
        key: 'guid',
        value: function guid() {
            var s4 = function s4() {
                return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
            };
            return '' + s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
        }
    }]);

    return utils;
}();

utils.errorHandler = function (e) {
    _loglevel2.default.error("errorHandler() with error", e);
    ga('send', 'event', 'error', 'bg', "v" + chrome.runtime.getManifest().version + "\n" + e.stack);
};

exports.default = utils;

},{"loglevel":4}],3:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _loglevel = require('loglevel');

var _loglevel2 = _interopRequireDefault(_loglevel);

var _utils = require('../common/utils');

var _utils2 = _interopRequireDefault(_utils);

var _port = require('../common/port');

var _port2 = _interopRequireDefault(_port);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var VOLUME_STEP = 0.03;
var CUSTOM_EVENT_NAME = 'customInjectedEvt';

var yandex =

//INFO: все args отличные от number должны быть в виде return JSON.stringify(arg)
function yandex() {
    var _this = this;

    _classCallCheck(this, yandex);

    this.storage = {};
    this.commands = {
        next: { fnc: function fnc() {
                externalAPI.next();
            }, args: null },

        play: { fnc: function fnc(trackIndex) {
                typeof trackIndex == 'number' ? externalAPI.play(trackIndex) : externalAPI.togglePause();
            }, args: function args(request) {
                return request.trackIndex;
            } },

        prev: { fnc: function fnc() {
                externalAPI.prev();
            }, args: null },

        info: { fnc: function fnc() {
                document.dispatchEvent(new CustomEvent(window.CUSTOM_EVENT_NAME, { detail: { action: 'info', track: externalAPI.getCurrentTrack() } }));
            }, args: null },

        like: { fnc: function fnc() {
                externalAPI.toggleLike();
            }, args: null },

        dislike: { fnc: function fnc() {
                externalAPI.toggleDislike();
            }, args: null },

        volume: { fnc: function fnc(volume) {
                externalAPI.setVolume(volume);
            }, args: function args(request) {
                return request.value;
            } },

        volumeToggle: { fnc: function fnc() {
                externalAPI.toggleMute();
            }, args: null },

        volumeup: { fnc: function fnc(volumeStep) {
                externalAPI.setVolume(externalAPI.getVolume() + volumeStep);
            }, args: VOLUME_STEP },

        volumedown: { fnc: function fnc(volumeStep) {
                externalAPI.setVolume(externalAPI.getVolume() - volumeStep);
            }, args: VOLUME_STEP },

        shuffle: { fnc: function fnc() {
                externalAPI.toggleShuffle();
            }, args: null },

        repeat: { fnc: function fnc() {
                externalAPI.toggleRepeat();
            }, args: null },

        position: { fnc: function fnc(position) {
                externalAPI.setPosition(position);
            }, args: function args(request) {
                return request.position;
            } },

        navigate: { fnc: function fnc(url) {
                externalAPI.navigate(url);
            }, args: function args(request) {
                return JSON.stringify(request.url);
            } },

        //playlist load track info
        populate: { fnc: function fnc(from, count) {
                externalAPI.populate(from, count);
            }, args: function args(request) {
                return [request.from, request.count];
            } },

        debug: { fnc: function fnc(level) {
                _loglevel2.default.setLevel(level);
            }, args: function args(request) {
                return request.level;
            }, doNotInject: true },

        //из bg получаем событие, сохраняем в песочнице cs, затем инжектим в песочницу сайта как window.chrome_ext
        storage: { fnc: function fnc(storage) {
                _this.storage = storage;
                _utils2.default.injectCode.apply(null, [function (storage) {
                    window.chrome_ext = { storage: storage };
                }].concat(JSON.stringify(storage)));
            }, args: function args(request) {
                return request.storage;
            }, doNotInject: true },

        fullstate: { fnc: function fnc() {
                document.dispatchEvent(new CustomEvent(window.CUSTOM_EVENT_NAME, { detail: { action: 'fullstate',
                        track: externalAPI.getCurrentTrackWrapper(),
                        progress: externalAPI.getProgress(),
                        source: externalAPI.getSourceInfoWrapper(),
                        controls: {
                            states: externalAPI.getControlsWrapper(),
                            volume: externalAPI.getVolume(),
                            shuffle: externalAPI.getShuffleWrapper(),
                            repeat: externalAPI.getRepeatWrapper()
                        },
                        playlist: {
                            prev: externalAPI.getPrevTrack(),
                            list: externalAPI.getTracksList(),
                            index: externalAPI.getTrackIndex(),
                            next: externalAPI.getNextTrack()
                        },
                        isPlaying: externalAPI.isPlaying(),
                        user: {
                            uid: Mu.blocks.di.repo.auth.user.uid,
                            did: Mu.blocks.di.repo.auth.user.device_id
                        }
                    } }));
            }, args: null }
    };
    this.extApiEvents = {
        //событие смены состояния play/pause
        'EVENT_STATE': function EVENT_STATE() {
            document.dispatchEvent(new CustomEvent(window.CUSTOM_EVENT_NAME, { detail: { action: 'state', isPlaying: externalAPI.isPlaying() } }));
        },

        //событие смены трека
        'EVENT_TRACK': function EVENT_TRACK() {
            document.dispatchEvent(new CustomEvent(window.CUSTOM_EVENT_NAME, { detail: { action: 'track', track: externalAPI.getCurrentTrackWrapper(), source: externalAPI.getSourceInfoWrapper(), progress: externalAPI.getProgress() } }));
        },

        //событие нажатия на кнопку повтор, шафл, лайк
        'EVENT_CONTROLS': function EVENT_CONTROLS() {
            document.dispatchEvent(new CustomEvent(window.CUSTOM_EVENT_NAME, { detail: { action: 'controls', controls: { states: externalAPI.getControlsWrapper(), volume: externalAPI.getVolume(), shuffle: externalAPI.getShuffleWrapper(), repeat: externalAPI.getRepeatWrapper() } } }));
            //при клике на (диз)лайк срабатывает данное событие, но само состояние (диз)лайка находится в externalAPI.getCurrentTrackWrapper(), поэтому для его обновления вызываем событие track
            document.dispatchEvent(new CustomEvent(window.CUSTOM_EVENT_NAME, { detail: { action: 'track', track: externalAPI.getCurrentTrackWrapper(), source: externalAPI.getSourceInfoWrapper(), progress: externalAPI.getProgress(), secondary: true } }));
        },

        //событие изменения плейлиста с целью поймать его обнуление
        'EVENT_TRACKS_LIST': function EVENT_TRACKS_LIST() {
            document.dispatchEvent(new CustomEvent(window.CUSTOM_EVENT_NAME, { detail: { action: 'trackslist', playlist: { list: externalAPI.getTracksList(), index: externalAPI.getTrackIndex(), prev: externalAPI.getPrevTrack(), next: externalAPI.getNextTrack() } } }));
        },

        //событие изменения громкости
        'EVENT_VOLUME': function EVENT_VOLUME() {
            document.dispatchEvent(new CustomEvent(window.CUSTOM_EVENT_NAME, { detail: { action: 'volume', volume: externalAPI.getVolume() } }));
        },

        //событие прогресса проигрывания
        'EVENT_PROGRESS': function EVENT_PROGRESS() {
            document.dispatchEvent(new CustomEvent(window.CUSTOM_EVENT_NAME, { detail: { action: 'progress', progress: externalAPI.getProgress() } }));
        },

        //событие начала и конца рекламы
        'EVENT_ADVERT': function EVENT_ADVERT(e) {
            document.dispatchEvent(new CustomEvent(window.CUSTOM_EVENT_NAME, { detail: { action: 'advert', info: e, state: e !== false } }));
        }
    };
    this.throttledEvents = { progress: { timer: 0, time: 100 } };
    this.port = null;

    this.onMessage = function (request) {
        _loglevel2.default.debug("yandex.onMessage() action <%s>", request.action);

        if (!_this.commands[request.action]) {
            _loglevel2.default.debug("yandex.onMessage() action not defined");
            return;
        }

        var args = typeof _this.commands[request.action].args == 'function' ? _this.commands[request.action].args.call(_this, request) : _this.commands[request.action].args;

        _loglevel2.default.trace("yandex.onMessage() injecting func %o with args %o", _this.commands[request.action].fnc, args);

        if (!_this.commands[request.action].doNotInject) _utils2.default.injectCode.apply(null, [_this.commands[request.action].fnc].concat(args));else _this.commands[request.action].fnc.apply(null, [].concat(args));
    };

    this.init = function () {
        _loglevel2.default.trace("yandex.init()");

        //добавляем обертки над АПИ
        //TODO: попросить поправить этот момент в АПИ
        _loglevel2.default.trace("yandex.init() injecting externalAPI wrappers");
        _utils2.default.injectCode(function () {
            externalAPI.getCurrentTrackWrapper = function () {
                var t = this.getCurrentTrack();
                if (t) {
                    if (t.version === undefined) t.version = null;
                    if (t.cover === undefined) t.cover = null;
                }
                return t;
            };
            externalAPI.getControlsWrapper = function () {
                var controls = this.getControls();
                for (var key in controls) {
                    switch (controls[key]) {
                        case externalAPI.CONTROL_ENABLED:
                            controls[key] = 'enabled';
                            break;
                        case externalAPI.CONTROL_DISABLED:
                            controls[key] = 'disabled';
                            break;
                        case externalAPI.CONTROL_DENIED:
                            controls[key] = 'denied';
                            break;
                        case undefined:
                            controls[key] = null;
                            break;
                    }
                }return controls;
            };
            externalAPI.getSourceInfoWrapper = function () {
                var t = this.getSourceInfo();
                if (t && t.cover === undefined) t.cover = null;
                return t;
            };
            externalAPI.getRepeatWrapper = function () {
                switch (externalAPI.getRepeat()) {
                    case externalAPI.REPEAT_ALL:
                        return 2;
                        break;
                    case externalAPI.REPEAT_ONE:
                        return true;
                        break;
                    case externalAPI.REPEAT_NONE:
                    default:
                        return false;
                        break;
                }
            };
            externalAPI.getShuffleWrapper = function () {
                switch (externalAPI.getShuffle()) {
                    case externalAPI.SHUFFLE_ON:
                        return true;
                        break;
                    case externalAPI.SHUFFLE_OFF:
                    default:
                        return false;
                        break;
                }
            };
        });

        //добавляем наш обработчик событий, через который происходит обратная связь
        _loglevel2.default.trace("yandex.init() injecting CUSTOM_EVENT_NAME");
        _utils2.default.injectCode(function (val) {
            window.CUSTOM_EVENT_NAME = val;
        }, JSON.stringify(CUSTOM_EVENT_NAME));

        _loglevel2.default.trace("yandex.init() injecting document CUSTOM_EVENT_NAME event listener");
        document.addEventListener(CUSTOM_EVENT_NAME, function (e) {
            _loglevel2.default.trace("yandex.customEventListener()", e.detail);
            var useThrottling = !!_this.throttledEvents[e.detail.action],
                throttlingKey = e.detail.action,
                throttleTime = useThrottling ? _this.throttledEvents[e.detail.action].time : null;

            _loglevel2.default.trace("yandex.customEventListener() sending to port: useThrottling <%o>, throttlingKey <%s>, throttleTime <%d>", useThrottling, throttlingKey, throttleTime);
            _this.port.send(e.detail, useThrottling, throttlingKey, throttleTime);
        });

        //добавляем слушателей событий externalAPI
        _loglevel2.default.trace("yandex.init() injecting externalAPI events listeners");
        for (var event in _this.extApiEvents) {
            _utils2.default.injectCode(function (evt, fnc) {
                externalAPI.on(externalAPI[evt], fnc);
            }, JSON.stringify(event), _this.extApiEvents[event]);
        } //добавляем слушателя стандартных DOM событий
        _loglevel2.default.trace("yandex.init() injecting DOM events listeners");
        _utils2.default.injectCode(function () {
            window.addEventListener('unload', function () {
                document.dispatchEvent(new CustomEvent(window.CUSTOM_EVENT_NAME, { detail: { action: 'shutdown' } }));
            });
            window.addEventListener('beforeunload', function (e) {
                var settingsValue = window.chrome_ext ? window.chrome_ext.storage['store.settings.close_alert'] : true;
                var msg = "Вы уверены, что хотите закрыть окно во время проигрывания Яндекс.Музыки?";
                if (settingsValue && externalAPI && externalAPI.isPlaying()) {
                    e.returnValue = msg;
                    return msg;
                }
            });
            window.addEventListener('focus', function () {
                document.dispatchEvent(new CustomEvent(window.CUSTOM_EVENT_NAME, { detail: { action: 'focus' } }));
            });
            window.addEventListener('blur', function () {
                document.dispatchEvent(new CustomEvent(window.CUSTOM_EVENT_NAME, { detail: { action: 'blur' } }));
            });
        });

        //формируем и отправляем расширению начальное состояние
        _loglevel2.default.trace("yandex.init() injecting initial player state sync");
        _utils2.default.injectCode(function () {
            document.dispatchEvent(new CustomEvent(window.CUSTOM_EVENT_NAME, { detail: { action: 'fullstate',
                    track: externalAPI.getCurrentTrackWrapper(),
                    progress: externalAPI.getProgress(),
                    source: externalAPI.getSourceInfoWrapper(),
                    controls: {
                        states: externalAPI.getControlsWrapper(),
                        volume: externalAPI.getVolume(),
                        shuffle: externalAPI.getShuffleWrapper(),
                        repeat: externalAPI.getRepeatWrapper()
                    },
                    playlist: {
                        prev: externalAPI.getPrevTrack(),
                        list: externalAPI.getTracksList(),
                        index: externalAPI.getTrackIndex(),
                        next: externalAPI.getNextTrack()
                    },
                    isPlaying: externalAPI.isPlaying(),
                    user: {
                        uid: Mu.blocks.di.repo.auth.user.uid,
                        did: Mu.blocks.di.repo.auth.user.device_id
                    }
                } }));
        });

        //резка рекламы
        _loglevel2.default.trace("yandex.init() injecting XMLHttpRequest proxy for AD spoofing");
        _utils2.default.injectCode(function () {
            (function () {
                var XHR = window.XMLHttpRequest;
                window.XMLHttpRequest = function () {
                    var o = new XHR(),
                        t = this,
                        adv = null;
                    t.DONE = o.DONE;
                    t.HEADERS_RECEIVED = o.HEADERS_RECEIVED;
                    t.LOADING = o.LOADING;
                    t.OPENED = o.OPENED;
                    t.UNSENT = o.UNSENT;
                    t.abort = function () {
                        o.abort();
                    };
                    t.addEventListener = function () {
                        o.addEventListener.apply(o, arguments);
                    };
                    t.dispatchEvent = function () {
                        o.dispatchEvent.apply(o, arguments);
                    };
                    t.getAllResponseHeaders = function () {
                        return o.getAllResponseHeaders();
                    };
                    t.getResponseHeader = function () {
                        return o.getResponseHeader.apply(o, arguments);
                    };
                    o.onabort = function () {
                        if (typeof t.onabort === 'function') t.onabort();
                    };
                    o.onerror = function () {
                        if (typeof t.onerror === 'function') t.onerror();
                    };
                    o.onload = function () {
                        if (typeof t.onload === 'function') t.onload();
                    };
                    o.onloadend = function () {
                        if (typeof t.onloadend === 'function') t.onloadend();
                    };
                    o.onloadstart = function () {
                        if (typeof t.onloadstart === 'function') t.onloadstart();
                    };
                    o.onprogress = function () {
                        if (typeof t.onprogress === 'function') t.onprogress();
                    };
                    o.onreadystatechange = function onReady() {
                        if (o.readyState === 4 && o.responseURL.indexOf('start') != -1) {
                            //console.log("next will be adv?", o.response.advert.afterSkip, o.response.advert.afterPlay);
                            adv = o.response;
                            adv.advert.afterSkip = 'none';
                            adv.advert.afterPlay = 'none';
                        }
                        if (typeof t.onreadystatechange === 'function') t.onreadystatechange();
                    };
                    o.ontimeout = function () {
                        if (typeof t.ontimeout === 'function') t.ontimeout();
                    };
                    t.open = function () {
                        o.open.apply(o, arguments);
                    };
                    t.overrideMimeType = function () {
                        o.overrideMimeType.apply(o, arguments);
                    };
                    Object.defineProperty(this, "readyState", { get: function get() {
                            return o.readyState;
                        } });
                    t.removeEventListener = function () {
                        o.removeEventListener.apply(o, arguments);
                    };
                    Object.defineProperty(this, "response", {
                        get: function get() {
                            if (adv && !!window.chrome_ext.storage['store.settings.premium_key']) return adv;
                            return o.response;
                        }
                    });
                    Object.defineProperty(this, "responseText", { get: function get() {
                            return o.responseText;
                        } });
                    Object.defineProperty(this, "responseType", { get: function get() {
                            return o.responseType;
                        }, set: function set(value) {
                            o.responseType = value;
                        } });
                    Object.defineProperty(this, "responseURL", { get: function get() {
                            return o.responseURL;
                        } });
                    Object.defineProperty(this, "responseXML", { get: function get() {
                            return o.responseXML;
                        } });
                    t.send = function () {
                        o.send.apply(o, arguments);
                    };
                    t.setRequestHeader = function () {
                        o.setRequestHeader.apply(o, arguments);
                    };
                    Object.defineProperty(this, "status", { get: function get() {
                            return o.status;
                        } });
                    Object.defineProperty(this, "statusText", { get: function get() {
                            return o.statusText;
                        } });
                    Object.defineProperty(this, "timeout", { get: function get() {
                            return o.timeout;
                        }, set: function set(value) {
                            o.timeout = value;
                        } });
                    Object.defineProperty(this, "upload", { get: function get() {
                            return o.upload;
                        } });
                    Object.defineProperty(this, "withCredentials", { get: function get() {
                            return o.withCredentials;
                        }, set: function set(value) {
                            o.withCredentials = value;
                        } });
                };
            })();
        });
    };

    _loglevel2.default.trace("yandex.constructor()");
    //соединение с extension'ом
    this.port = new _port2.default('ymusic', 'client', null);
    //проброс обработчика полученных от extension'а сообщений
    this.port.addOnMessageCb(this.onMessage);

    return this;
};

exports.default = yandex;

},{"../common/port":1,"../common/utils":2,"loglevel":4}],4:[function(require,module,exports){
/*
* loglevel - https://github.com/pimterry/loglevel
*
* Copyright (c) 2013 Tim Perry
* Licensed under the MIT license.
*/
(function (root, definition) {
    "use strict";
    if (typeof define === 'function' && define.amd) {
        define(definition);
    } else if (typeof module === 'object' && module.exports) {
        module.exports = definition();
    } else {
        root.log = definition();
    }
}(this, function () {
    "use strict";
    var noop = function() {};
    var undefinedType = "undefined";

    function realMethod(methodName) {
        if (typeof console === undefinedType) {
            return false; // We can't build a real method without a console to log to
        } else if (console[methodName] !== undefined) {
            return bindMethod(console, methodName);
        } else if (console.log !== undefined) {
            return bindMethod(console, 'log');
        } else {
            return noop;
        }
    }

    function bindMethod(obj, methodName) {
        var method = obj[methodName];
        if (typeof method.bind === 'function') {
            return method.bind(obj);
        } else {
            try {
                return Function.prototype.bind.call(method, obj);
            } catch (e) {
                // Missing bind shim or IE8 + Modernizr, fallback to wrapping
                return function() {
                    return Function.prototype.apply.apply(method, [obj, arguments]);
                };
            }
        }
    }

    // these private functions always need `this` to be set properly

    function enableLoggingWhenConsoleArrives(methodName, level, loggerName) {
        return function () {
            if (typeof console !== undefinedType) {
                replaceLoggingMethods.call(this, level, loggerName);
                this[methodName].apply(this, arguments);
            }
        };
    }

    function replaceLoggingMethods(level, loggerName) {
        /*jshint validthis:true */
        for (var i = 0; i < logMethods.length; i++) {
            var methodName = logMethods[i];
            this[methodName] = (i < level) ?
                noop :
                this.methodFactory(methodName, level, loggerName);
        }
    }

    function defaultMethodFactory(methodName, level, loggerName) {
        /*jshint validthis:true */
        return realMethod(methodName) ||
               enableLoggingWhenConsoleArrives.apply(this, arguments);
    }

    var logMethods = [
        "trace",
        "debug",
        "info",
        "warn",
        "error"
    ];

    function Logger(name, defaultLevel, factory) {
      var self = this;
      var currentLevel;
      var storageKey = "loglevel";
      if (name) {
        storageKey += ":" + name;
      }

      function persistLevelIfPossible(levelNum) {
          var levelName = (logMethods[levelNum] || 'silent').toUpperCase();

          // Use localStorage if available
          try {
              window.localStorage[storageKey] = levelName;
              return;
          } catch (ignore) {}

          // Use session cookie as fallback
          try {
              window.document.cookie =
                encodeURIComponent(storageKey) + "=" + levelName + ";";
          } catch (ignore) {}
      }

      function getPersistedLevel() {
          var storedLevel;

          try {
              storedLevel = window.localStorage[storageKey];
          } catch (ignore) {}

          if (typeof storedLevel === undefinedType) {
              try {
                  var cookie = window.document.cookie;
                  var location = cookie.indexOf(
                      encodeURIComponent(storageKey) + "=");
                  if (location) {
                      storedLevel = /^([^;]+)/.exec(cookie.slice(location))[1];
                  }
              } catch (ignore) {}
          }

          // If the stored level is not valid, treat it as if nothing was stored.
          if (self.levels[storedLevel] === undefined) {
              storedLevel = undefined;
          }

          return storedLevel;
      }

      /*
       *
       * Public API
       *
       */

      self.levels = { "TRACE": 0, "DEBUG": 1, "INFO": 2, "WARN": 3,
          "ERROR": 4, "SILENT": 5};

      self.methodFactory = factory || defaultMethodFactory;

      self.getLevel = function () {
          return currentLevel;
      };

      self.setLevel = function (level, persist) {
          if (typeof level === "string" && self.levels[level.toUpperCase()] !== undefined) {
              level = self.levels[level.toUpperCase()];
          }
          if (typeof level === "number" && level >= 0 && level <= self.levels.SILENT) {
              currentLevel = level;
              if (persist !== false) {  // defaults to true
                  persistLevelIfPossible(level);
              }
              replaceLoggingMethods.call(self, level, name);
              if (typeof console === undefinedType && level < self.levels.SILENT) {
                  return "No console available for logging";
              }
          } else {
              throw "log.setLevel() called with invalid level: " + level;
          }
      };

      self.setDefaultLevel = function (level) {
          if (!getPersistedLevel()) {
              self.setLevel(level, false);
          }
      };

      self.enableAll = function(persist) {
          self.setLevel(self.levels.TRACE, persist);
      };

      self.disableAll = function(persist) {
          self.setLevel(self.levels.SILENT, persist);
      };

      // Initialize with the right level
      var initialLevel = getPersistedLevel();
      if (initialLevel == null) {
          initialLevel = defaultLevel == null ? "WARN" : defaultLevel;
      }
      self.setLevel(initialLevel, false);
    }

    /*
     *
     * Package-level API
     *
     */

    var defaultLogger = new Logger();

    var _loggersByName = {};
    defaultLogger.getLogger = function getLogger(name) {
        if (typeof name !== "string" || name === "") {
          throw new TypeError("You must supply a name when creating a logger.");
        }

        var logger = _loggersByName[name];
        if (!logger) {
          logger = _loggersByName[name] = new Logger(
            name, defaultLogger.getLevel(), defaultLogger.methodFactory);
        }
        return logger;
    };

    // Grab the current global log variable in case of overwrite
    var _log = (typeof window !== undefinedType) ? window.log : undefined;
    defaultLogger.noConflict = function() {
        if (typeof window !== undefinedType &&
               window.log === defaultLogger) {
            window.log = _log;
        }

        return defaultLogger;
    };

    return defaultLogger;
}));

},{}],5:[function(require,module,exports){
'use strict';

var _loglevel = require('loglevel');

var _loglevel2 = _interopRequireDefault(_loglevel);

var _yandex = require('./cs/yandex');

var _yandex2 = _interopRequireDefault(_yandex);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_loglevel2.default.setLevel("INFO"); //"TRACE" > "DEBUG" > "INFO" > "WARN" > "ERROR" > "SILENT"
//for debug:
//window.logger = log;

new _yandex2.default().init();

},{"./cs/yandex":3,"loglevel":4}]},{},[5])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJleHRlbnNpb25fc3JjXFxjb21tb25cXHBvcnQuanMiLCJleHRlbnNpb25fc3JjXFxjb21tb25cXHV0aWxzLmpzIiwiZXh0ZW5zaW9uX3NyY1xcY3NcXHlhbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9sb2dsZXZlbC9saWIvbG9nbGV2ZWwuanMiLCJleHRlbnNpb25fc3JjXFxjcy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7OztBQ0FBOzs7Ozs7OztJQUVNLEksR0FPRixjQUFZLFFBQVosRUFBdUU7QUFBQTs7QUFBQSxRQUFqRCxRQUFpRCx5REFBdEMsUUFBc0M7QUFBQSxRQUE1QixtQkFBNEIseURBQU4sSUFBTTs7QUFBQTs7QUFBQSxTQUx2RSxJQUt1RSxHQUxoRSxJQUtnRTtBQUFBLFNBSnZFLFFBSXVFLEdBSjVELElBSTREO0FBQUEsU0FIdkUsUUFHdUUsR0FINUQsSUFHNEQ7QUFBQSxTQUZ2RSxTQUV1RSxHQUYzRCxFQUUyRDs7QUFBQSxTQXlCdkUsU0F6QnVFLEdBeUIzRCxtQkFBVztBQUNuQiwyQkFBSSxLQUFKLENBQVUscUNBQVYsRUFBaUQsTUFBSyxRQUF0RCxFQUFnRSxNQUFLLFFBQXJFLEVBQStFLE9BQS9FO0FBQ0EsWUFBSSxNQUFLLFdBQVQsRUFDSSxNQUFLLFdBQUwsQ0FBaUIsT0FBakI7QUFDUCxLQTdCc0U7O0FBQUEsU0ErQnZFLFdBL0J1RSxHQStCekQsbUJBQVc7QUFDckIsMkJBQUksS0FBSixDQUFVLHVDQUFWLEVBQW1ELE1BQUssUUFBeEQsRUFBa0UsTUFBSyxRQUF2RSxFQUFpRixPQUFqRjtBQUNILEtBakNzRTs7QUFBQSxTQW1DdkUsY0FuQ3VFLEdBbUN0RCxjQUFNO0FBQ25CLDJCQUFJLEtBQUosQ0FBVSwwQ0FBVixFQUFzRCxNQUFLLFFBQTNELEVBQXFFLE1BQUssUUFBMUUsRUFBb0YsRUFBcEY7QUFDQSxjQUFLLFdBQUwsR0FBbUIs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QTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQy9OQTs7OztBQUNBOzs7Ozs7QUFFQSxtQkFBSSxRQUFKLENBQWEsTUFBYixFOzs7O0FBSUEsdUJBQWtCLElBQWxCIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsImltcG9ydCBsb2cgZnJvbSAnbG9nbGV2ZWwnO1xyXG5cclxuY2xhc3MgcG9ydCB7XHJcblxyXG4gICAgcG9ydCA9IG51bGw7XHJcbiAgICBwb3J0TmFtZSA9IG51bGw7XHJcbiAgICBwb3J0VHlwZSA9IG51bGw7XHJcbiAgICB0aHJvdHRsZWQgPSB7fTtcclxuXHJcbiAgICBjb25zdHJ1Y3Rvcihwb3J0TmFtZSwgcG9ydFR5cGUgPSAnY2xpZW50JywgY2xpZW50Q29ubmVjdGVkUG9ydCA9IG51bGwpIHtcclxuICAgICAgICBsb2cudHJhY2UoXCJwb3J0WyVzXVslc10uY29uc3RydWN0b3IoKSB3aXRoIHBvcnRUeXBlIDwlcz4gYW5kIGNsaWVudCdzIGNvbm5lY3RlZCBwb3J0ICVvXCIsIHRoaXMucG9ydE5hbWUsIHRoaXMucG9ydFR5cGUsIHBvcnRUeXBlLCBjbGllbnRDb25uZWN0ZWRQb3J0KTtcclxuICAgICAgICB0cnlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGlmIChwb3J0VHlwZSA9PSAnY2xpZW50JykgXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGxvZy50cmFjZShcInBvcnRbJXNdWyVzXS5jb25zdHJ1Y3RvcigpIHBvcnQgY29ubmVjdGluZ1wiLCB0aGlzLnBvcnROYW1lLCB0aGlzLnBvcnRUeXBlKTtcclxuICAgICAgICAgICAgICAgIHRoaXMucG9ydCA9IGNocm9tZS5ydW50aW1lLmNvbm5lY3Qoe25hbWU6IHBvcnROYW1lfSk7XHJcbiAgICAgICAgICAgICAgICBsb2cudHJhY2UoXCJwb3J0WyVzXVslc10uY29uc3RydWN0b3IoKSBwb3J0IGNvbm5lY3RlZFwiLCB0aGlzLnBvcnROYW1lLCB0aGlzLnBvcnRUeXBlKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIGlmIChwb3J0VHlwZSA9PSAnaG9zdCcpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHRoaXMucG9ydCA9IGNsaWVudENvbm5lY3RlZFBvcnQ7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy5wb3J0Lm9uRGlzY29ubmVjdC5hZGRMaXN0ZW5lcih0aGlzLm9uRGlzY29ubmVjdCk7XHJcbiAgICAgICAgICAgIHRoaXMucG9ydC5vbk1lc3NhZ2UuYWRkTGlzdGVuZXIodGhpcy5vbk1lc3NhZ2UpO1xyXG4gICAgICAgICAgICB0aGlzLnBvcnRUeXBlID0gcG9ydFR5cGU7XHJcbiAgICAgICAgICAgIHRoaXMucG9ydE5hbWUgPSBwb3J0TmFtZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgY2F0Y2ggKGUpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBsb2cudHJhY2UoXCJwb3J0WyVzXVslc10uY29uc3RydWN0b3IoKSBwb3J0IGNvbm5lY3Rpb24gZXJyb3IgJW9cIiwgdGhpcy5wb3J0TmFtZSwgdGhpcy5wb3J0VHlwZSwgZSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIG9uTWVzc2FnZSA9IHJlcXVlc3QgPT4ge1xyXG4gICAgICAgIGxvZy50cmFjZShcInBvcnRbJXNdWyVzXS5vbk1lc3NhZ2UoKSByZXF1ZXN0ICVvXCIsIHRoaXMucG9ydE5hbWUsIHRoaXMucG9ydFR5cGUsIHJlcXVlc3QpO1xyXG4gICAgICAgIGlmICh0aGlzLm9uTWVzc2FnZUNiKVxyXG4gICAgICAgICAgICB0aGlzLm9uTWVzc2FnZUNiKHJlcXVlc3QpO1xyXG4gICAgfTtcclxuXHJcbiAgICBvbk1lc3NhZ2VDYiA9IHJlcXVlc3QgPT4ge1xyXG4gICAgICAgIGxvZy50cmFjZShcInBvcnRbJXNdWyVzXS5vbk1lc3NhZ2VDYigpIHJlcXVlc3QgJW9cIiwgdGhpcy5wb3J0TmFtZSwgdGhpcy5wb3J0VHlwZSwgcmVxdWVzdCk7XHJcbiAgICB9O1xyXG5cclxuICAgIGFkZE9uTWVzc2FnZUNiID0gY2IgPT4ge1xyXG4gICAgICAgIGxvZy50cmFjZShcInBvcnRbJXNdWyVzXS5hZGRPbk1lc3NhZ2VDYigpIHdpdGggY2IgJW9cIiwgdGhpcy5wb3J0TmFtZSwgdGhpcy5wb3J0VHlwZSwgY2IpO1xyXG4gICAgICAgIHRoaXMub25NZXNzYWdlQ2IgPSBjYjtcclxuICAgIH07XHJcblxyXG4gICAgb25EaXNjb25uZWN0ID0gKCkgPT4ge1xyXG4gICAgICAgIGxvZy5lcnJvcihcInBvcnRbJXNdWyVzXS5jb25zdHJ1Y3RvcigpIHBvcnQgZGlzY29ubmVjdGVkIGZyb20gb3RoZXIgc2lkZVwiLCB0aGlzLnBvcnROYW1lLCB0aGlzLnBvcnRUeXBlKTtcclxuICAgICAgICB0aGlzLnBvcnQgPSBudWxsO1xyXG4gICAgfTtcclxuXHJcbiAgICBzZW5kID0gKGRhdGEsIHVzZVRocm90dGxpbmcgPSBmYWxzZSwgdGhyb3R0bGluZ0tleSA9IG51bGwsIHRocm90dGxlVGltZSA9IDEwMDApID0+IHtcclxuICAgICAgICBsb2cudHJhY2UoXCJwb3J0WyVzXVslc10uc2VuZCgpXCIrKHVzZVRocm90dGxpbmcgPyBcIiB0aHJvdHRsZWRcIiA6IFwiXCIpK1wiIGRhdGEgJW9cIiwgdGhpcy5wb3J0TmFtZSwgdGhpcy5wb3J0VHlwZSwgZGF0YSk7XHJcbiAgICAgICAgaWYgKCF0aGlzLnBvcnQpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBsb2cuZGVidWcoXCJwb3J0WyVzXVslc10uc2VuZCgpIHBvcnQgbm90IGNvbm5lY3RlZFwiLCB0aGlzLnBvcnROYW1lLCB0aGlzLnBvcnRUeXBlKTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgbG9nLnRyYWNlKFwicG9ydFslc11bJXNdLnNlbmQoKSBzZW5kaW5nXCIsIHRoaXMucG9ydE5hbWUsIHRoaXMucG9ydFR5cGUpO1xyXG4gICAgICAgICAgICBpZiAoIXVzZVRocm90dGxpbmcgfHwgbmV3IERhdGUoKS5nZXRUaW1lKCkgLSB0aHJvdHRsZVRpbWUgPiAodGhpcy50aHJvdHRsZWRbdGhyb3R0bGluZ0tleV0gfHwgMCkpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHRoaXMucG9ydC5wb3N0TWVzc2FnZShkYXRhKTtcclxuICAgICAgICAgICAgICAgIGlmICh1c2VUaHJvdHRsaW5nKVxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMudGhyb3R0bGVkW3Rocm90dGxpbmdLZXldID0gbmV3IERhdGUoKS5nZXRUaW1lKCk7XHJcbiAgICAgICAgICAgICAgICBsb2cuZGVidWcoXCJwb3J0WyVzXVslc10uc2VuZCgpIHNlbnQgZGF0YSAlb1wiLCB0aGlzLnBvcnROYW1lLCB0aGlzLnBvcnRUeXBlLCBkYXRhKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgICAgICBsb2cudHJhY2UoXCJwb3J0WyVzXVslc10uc2VuZCgpIHNlbmQgY2FuY2VsZWQgZHVlIHRocm90dGxpbmcgJWQgbXNcIiwgdGhpcy5wb3J0TmFtZSwgdGhpcy5wb3J0VHlwZSwgdGhyb3R0bGVUaW1lKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgY2F0Y2ggKGUpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLnBvcnQgPSBudWxsO1xyXG4gICAgICAgICAgICBsb2cuZXJyb3IoXCJwb3J0WyVzXVslc10uc2VuZCgpIGVycm9yIHdoaWxlIHNlbmRpbmcgJW9cIiwgdGhpcy5wb3J0TmFtZSwgdGhpcy5wb3J0VHlwZSwgZSk7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgcG9ydDsiLCJpbXBvcnQgbG9nIGZyb20gJ2xvZ2xldmVsJztcclxuXHJcbmNsYXNzIHV0aWxzIHtcclxuICAgIGNvbnN0cnVjdG9yKCkge31cclxuXHJcbiAgICAvL9C/0YDQvtCy0LXRgNC60LAgVVJMJ9CwINCy0LrQu9Cw0LTQutC4INC90LAg0L/RgNC10LTQvNC10YIg0K8u0JzRg9C30YvQutC4INC40LvQuCDQry7QoNCw0LTQuNC+XHJcbiAgICBzdGF0aWMgaXNVcmxNYXRjaCh1cmwpIHtcclxuICAgICAgICBpZiAodXJsLm1hdGNoKC9eaHR0cHM/OlxcL1xcLyhyYWRpb3xtdXNpYylcXC55YW5kZXhcXC4ocnV8Ynl8a3p8dWEpXFwvLipcXC4oZ2lmfHBuZ3xqcGd8c3ZnfGpzfGNzc3xpY28pJC8pKVxyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcblxyXG4gICAgICAgIGxldCBpc1JhZGlvID0gKHVybC5tYXRjaCgvXmh0dHBzPzpcXC9cXC9yYWRpb1xcLnlhbmRleFxcLihydXxieXxrenx1YSlcXC8uKiQvKSAhPT0gbnVsbCksXHJcbiAgICAgICAgICAgIGlzTXVzaWMgPSAodXJsLm1hdGNoKC9eaHR0cHM/OlxcL1xcL211c2ljXFwueWFuZGV4XFwuKHJ1fGJ5fGt6fHVhKVxcLy4qJC8pICE9PSBudWxsKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIGlzUmFkaW8gfHwgaXNNdXNpYyA/IHtpc1JhZGlvOiBpc1JhZGlvLCBpc011c2ljOiBpc011c2ljfSA6IGZhbHNlO1xyXG4gICAgfTtcclxuXHJcbiAgICAvL2luamVjdCfQuNC8INC90LDRiCDQutC+0LQg0LIgY29udGVudC1zY3JpcHQg0LLQutC70LDQtNC60LhcclxuICAgIHN0YXRpYyBpbmplY3RTY3JpcHQodGFiSWQsIGZpbGUpIHtcclxuICAgICAgICBjaHJvbWUudGFicy5leGVjdXRlU2NyaXB0KHRhYklkLCB7ZmlsZTogZmlsZX0sICgpID0+IHtcclxuICAgICAgICAgICAgaWYgKGNocm9tZS5ydW50aW1lLmxhc3RFcnJvcilcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgaWYgKGNocm9tZS5ydW50aW1lLmxhc3RFcnJvci5tZXNzYWdlID09ICdUaGUgdGFiIHdhcyBjbG9zZWQnKVxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuXHJcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJJbmplY3Qgb2YgZmlsZSA8XCIrZmlsZStcIj4gb24gdGFiIDxcIit0YWJJZCtcIj4gZXJyb3I6IFwiK2Nocm9tZS5ydW50aW1lLmxhc3RFcnJvci5tZXNzYWdlKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfTtcclxuXHJcbiAgICAvL2luamVjdCDQutC+0LTQsCDQsiDQv9GA0L7RgdGC0YDQsNC90L7RgdGC0LLQviDRgdGC0YDQsNC90LjRhtGLINC40LcgQ1Mg0YHQutGA0LjQv9GC0LAsINC60L7RgtC+0YDRi9C5INCy0YvQv9C+0LvQvdGP0LXRgtGB0Y8g0LIg0L/QtdGB0L7Rh9C90LjRhtC1XHJcbiAgICBzdGF0aWMgaW5qZWN0Q29kZShmdW5jLCAuLi5hcmdzKSB7XHJcbiAgICAgICAgbGV0IHNjcmlwdCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NjcmlwdCcpO1xyXG4gICAgICAgIHNjcmlwdC50ZXh0Q29udGVudCA9ICd0cnkgeygnICsgZnVuYyArICcpKCcgKyBhcmdzICsgJyk7IH0gY2F0Y2goZSkge2NvbnNvbGUuZXJyb3IoXCJpbmplY3RlZCBlcnJvclwiLCBlKTt9Oyc7XHJcbiAgICAgICAgKGRvY3VtZW50LmhlYWQgfHwgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50KS5hcHBlbmRDaGlsZChzY3JpcHQpO1xyXG4gICAgICAgIHNjcmlwdC5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKHNjcmlwdCk7XHJcbiAgICB9XHJcblxyXG4gICAgc3RhdGljIGd1aWQoKSB7XHJcbiAgICAgICAgbGV0IHM0ID0gZnVuY3Rpb24oKXsgcmV0dXJuIE1hdGguZmxvb3IoKDEgKyBNYXRoLnJhbmRvbSgpKSAqIDB4MTAwMDApLnRvU3RyaW5nKDE2KS5zdWJzdHJpbmcoMSk7IH07XHJcbiAgICAgICAgcmV0dXJuIGAke3M0KCl9JHtzNCgpfS0ke3M0KCl9LSR7czQoKX0tJHtzNCgpfS0ke3M0KCl9JHtzNCgpfSR7czQoKX1gO1xyXG4gICAgfTtcclxuXHJcbiAgICBzdGF0aWMgZXJyb3JIYW5kbGVyID0gZSA9PiB7XHJcbiAgICAgICAgbG9nLmVycm9yKFwiZXJyb3JIYW5kbGVyKCkgd2l0aCBlcnJvclwiLCBlKTtcclxuICAgICAgICBnYSgnc2VuZCcsICdldmVudCcsICdlcnJvcicsICdiZycsIFwidlwiK2Nocm9tZS5ydW50aW1lLmdldE1hbmlmZXN0KCkudmVyc2lvbitcIlxcblwiK2Uuc3RhY2spO1xyXG4gICAgfTtcclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgdXRpbHM7IiwiaW1wb3J0IGxvZyBmcm9tICdsb2dsZXZlbCc7XHJcbmltcG9ydCB1dGlscyBmcm9tICcuLi9jb21tb24vdXRpbHMnO1xyXG5pbXBvcnQgcG9ydENsYXNzIGZyb20gJy4uL2NvbW1vbi9wb3J0JztcclxuXHJcbmNvbnN0IFZPTFVNRV9TVEVQID0gMC4wMztcclxuY29uc3QgQ1VTVE9NX0VWRU5UX05BTUUgPSAnY3VzdG9tSW5qZWN0ZWRFdnQnO1xyXG5cclxuY2xhc3MgeWFuZGV4IHtcclxuICAgIHN0b3JhZ2UgPSB7fTtcclxuXHJcbiAgICAvL0lORk86INCy0YHQtSBhcmdzINC+0YLQu9C40YfQvdGL0LUg0L7RgiBudW1iZXIg0LTQvtC70LbQvdGLINCx0YvRgtGMINCyINCy0LjQtNC1IHJldHVybiBKU09OLnN0cmluZ2lmeShhcmcpXHJcbiAgICBjb21tYW5kcyA9IHtcclxuICAgICAgICBuZXh0OiB7Zm5jOiAoKSA9PiB7IGV4dGVybmFsQVBJLm5leHQoKSB9LCBhcmdzOiBudWxsfSxcclxuXHJcbiAgICAgICAgcGxheToge2ZuYzogdHJhY2tJbmRleCA9PiB7ICh0eXBlb2YgdHJhY2tJbmRleCA9PSAnbnVtYmVyJykgPyBleHRlcm5hbEFQSS5wbGF5KHRyYWNrSW5kZXgpIDogZXh0ZXJuYWxBUEkudG9nZ2xlUGF1c2UoKSB9LCBhcmdzOiAocmVxdWVzdCkgPT4gcmVxdWVzdC50cmFja0luZGV4fSxcclxuXHJcbiAgICAgICAgcHJldjoge2ZuYzogKCkgPT4geyBleHRlcm5hbEFQSS5wcmV2KCkgfSwgYXJnczogbnVsbH0sXHJcblxyXG4gICAgICAgIGluZm86IHtmbmM6ICgpID0+IHsgZG9jdW1lbnQuZGlzcGF0Y2hFdmVudChuZXcgQ3VzdG9tRXZlbnQod2luZG93LkNVU1RPTV9FVkVOVF9OQU1FLCB7ZGV0YWlsOiB7YWN0aW9uOiAnaW5mbycsIHRyYWNrOiBleHRlcm5hbEFQSS5nZXRDdXJyZW50VHJhY2soKX19KSl9LCBhcmdzOiBudWxsfSxcclxuXHJcbiAgICAgICAgbGlrZToge2ZuYzogKCkgPT4geyBleHRlcm5hbEFQSS50b2dnbGVMaWtlKCk7IH0sIGFyZ3M6IG51bGx9LFxyXG5cclxuICAgICAgICBkaXNsaWtlOiB7Zm5jOiAoKSA9PiB7IGV4dGVybmFsQVBJLnRvZ2dsZURpc2xpa2UoKSB9LCBhcmdzOiBudWxsfSxcclxuXHJcbiAgICAgICAgdm9sdW1lOiB7Zm5jOiB2b2x1bWUgPT4geyBleHRlcm5hbEFQSS5zZXRWb2x1bWUodm9sdW1lKSB9LCBhcmdzOiAocmVxdWVzdCkgPT4gcmVxdWVzdC52YWx1ZX0sXHJcblxyXG4gICAgICAgIHZvbHVtZVRvZ2dsZToge2ZuYzogKCkgPT4geyBleHRlcm5hbEFQSS50b2dnbGVNdXRlKCkgfSwgYXJnczogbnVsbH0sXHJcblxyXG4gICAgICAgIHZvbHVtZXVwOiB7Zm5jOiB2b2x1bWVTdGVwID0+IHsgZXh0ZXJuYWxBUEkuc2V0Vm9sdW1lKGV4dGVybmFsQVBJLmdldFZvbHVtZSgpK3ZvbHVtZVN0ZXApIH0sIGFyZ3M6IFZPTFVNRV9TVEVQfSxcclxuXHJcbiAgICAgICAgdm9sdW1lZG93bjoge2ZuYzogdm9sdW1lU3RlcCA9PiB7IGV4dGVybmFsQVBJLnNldFZvbHVtZShleHRlcm5hbEFQSS5nZXRWb2x1bWUoKS12b2x1bWVTdGVwKSB9LCBhcmdzOiBWT0xVTUVfU1RFUH0sXHJcblxyXG4gICAgICAgIHNodWZmbGU6IHtmbmM6ICgpID0+IHsgZXh0ZXJuYWxBUEkudG9nZ2xlU2h1ZmZsZSgpIH0sIGFyZ3M6IG51bGx9LFxyXG5cclxuICAgICAgICByZXBlYXQ6IHtmbmM6ICgpID0+IHsgZXh0ZXJuYWxBUEkudG9nZ2xlUmVwZWF0KCkgfSwgYXJnczogbnVsbH0sXHJcblxyXG4gICAgICAgIHBvc2l0aW9uOiB7Zm5jOiBwb3NpdGlvbiA9PiB7IGV4dGVybmFsQVBJLnNldFBvc2l0aW9uKHBvc2l0aW9uKSB9LCBhcmdzOiAocmVxdWVzdCkgPT4gcmVxdWVzdC5wb3NpdGlvbn0sXHJcblxyXG4gICAgICAgIG5hdmlnYXRlOiB7Zm5jOiB1cmwgPT4geyBleHRlcm5hbEFQSS5uYXZpZ2F0ZSh1cmwpOyB9LCBhcmdzOiAocmVxdWVzdCkgPT4gSlNPTi5zdHJpbmdpZnkocmVxdWVzdC51cmwpfSxcclxuXHJcbiAgICAgICAgLy9wbGF5bGlzdCBsb2FkIHRyYWNrIGluZm9cclxuICAgICAgICBwb3B1bGF0ZToge2ZuYzogKGZyb20sIGNvdW50KSA9PiB7IGV4dGVybmFsQVBJLnBvcHVsYXRlKGZyb20sIGNvdW50KTsgfSwgYXJnczogKHJlcXVlc3QpID0+IFtyZXF1ZXN0LmZyb20sIHJlcXVlc3QuY291bnRdfSxcclxuXHJcbiAgICAgICAgZGVidWc6IHtmbmM6IGxldmVsID0+IHsgbG9nLnNldExldmVsKGxldmVsKTsgfSwgYXJnczogKHJlcXVlc3QpID0+IHJlcXVlc3QubGV2ZWwsIGRvTm90SW5qZWN0OnRydWUgfSxcclxuXHJcbiAgICAgICAgLy/QuNC3IGJnINC/0L7Qu9GD0YfQsNC10Lwg0YHQvtCx0YvRgtC40LUsINGB0L7RhdGA0LDQvdGP0LXQvCDQsiDQv9C10YHQvtGH0L3QuNGG0LUgY3MsINC30LDRgtC10Lwg0LjQvdC20LXQutGC0LjQvCDQsiDQv9C10YHQvtGH0L3QuNGG0YMg0YHQsNC50YLQsCDQutCw0Logd2luZG93LmNocm9tZV9leHRcclxuICAgICAgICBzdG9yYWdlOiB7Zm5jOiBzdG9yYWdlID0+IHtcclxuICAgICAgICAgICAgdGhpcy5zdG9yYWdlID0gc3RvcmFnZTtcclxuICAgICAgICAgICAgdXRpbHMuaW5qZWN0Q29kZS5hcHBseShudWxsLCBbZnVuY3Rpb24oc3RvcmFnZSl7XHJcbiAgICAgICAgICAgICAgICB3aW5kb3cuY2hyb21lX2V4dCA9IHtzdG9yYWdlOiBzdG9yYWdlfTtcclxuICAgICAgICAgICAgfV0uY29uY2F0KEpTT04uc3RyaW5naWZ5KHN0b3JhZ2UpKSk7XHJcbiAgICAgICAgfSwgYXJnczogKHJlcXVlc3QpID0+IHJlcXVlc3Quc3RvcmFnZSwgZG9Ob3RJbmplY3Q6dHJ1ZX0sXHJcblxyXG4gICAgICAgIGZ1bGxzdGF0ZToge2ZuYzogKCkgPT4ge1xyXG4gICAgICAgICAgICBkb2N1bWVudC5kaXNwYXRjaEV2ZW50KG5ldyBDdXN0b21FdmVudCh3aW5kb3cuQ1VTVE9NX0VWRU5UX05BTUUsIHtkZXRhaWw6IHthY3Rpb246ICdmdWxsc3RhdGUnLFxyXG4gICAgICAgICAgICAgICAgdHJhY2s6IGV4dGVybmFsQVBJLmdldEN1cnJlbnRUcmFja1dyYXBwZXIoKSxcclxuICAgICAgICAgICAgICAgIHByb2dyZXNzOiBleHRlcm5hbEFQSS5nZXRQcm9ncmVzcygpLFxyXG4gICAgICAgICAgICAgICAgc291cmNlOiBleHRlcm5hbEFQSS5nZXRTb3VyY2VJbmZvV3JhcHBlcigpLFxyXG4gICAgICAgICAgICAgICAgY29udHJvbHM6IHtcclxuICAgICAgICAgICAgICAgICAgICBzdGF0ZXM6IGV4dGVybmFsQVBJLmdldENvbnRyb2xzV3JhcHBlcigpLFxyXG4gICAgICAgICAgICAgICAgICAgIHZvbHVtZTogZXh0ZXJuYWxBUEkuZ2V0Vm9sdW1lKCksXHJcbiAgICAgICAgICAgICAgICAgICAgc2h1ZmZsZTogZXh0ZXJuYWxBUEkuZ2V0U2h1ZmZsZVdyYXBwZXIoKSxcclxuICAgICAgICAgICAgICAgICAgICByZXBlYXQ6IGV4dGVybmFsQVBJLmdldFJlcGVhdFdyYXBwZXIoKVxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIHBsYXlsaXN0OiB7XHJcbiAgICAgICAgICAgICAgICAgICAgcHJldjogZXh0ZXJuYWxBUEkuZ2V0UHJldlRyYWNrKCksXHJcbiAgICAgICAgICAgICAgICAgICAgbGlzdDogZXh0ZXJuYWxBUEkuZ2V0VHJhY2tzTGlzdCgpLFxyXG4gICAgICAgICAgICAgICAgICAgIGluZGV4OiBleHRlcm5hbEFQSS5nZXRUcmFja0luZGV4KCksXHJcbiAgICAgICAgICAgICAgICAgICAgbmV4dDogZXh0ZXJuYWxBUEkuZ2V0TmV4dFRyYWNrKClcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBpc1BsYXlpbmc6IGV4dGVybmFsQVBJLmlzUGxheWluZygpLFxyXG4gICAgICAgICAgICAgICAgdXNlcjoge1xyXG4gICAgICAgICAgICAgICAgICAgIHVpZDogTXUuYmxvY2tzLmRpLnJlcG8uYXV0aC51c2VyLnVpZCxcclxuICAgICAgICAgICAgICAgICAgICBkaWQ6IE11LmJsb2Nrcy5kaS5yZXBvLmF1dGgudXNlci5kZXZpY2VfaWRcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfX0pKTtcclxuICAgICAgICB9LCBhcmdzOiBudWxsfVxyXG4gICAgfTtcclxuXHJcbiAgICBleHRBcGlFdmVudHMgPSB7XHJcbiAgICAgICAgLy/RgdC+0LHRi9GC0LjQtSDRgdC80LXQvdGLINGB0L7RgdGC0L7Rj9C90LjRjyBwbGF5L3BhdXNlXHJcbiAgICAgICAgJ0VWRU5UX1NUQVRFJzogKCkgPT4ge1xyXG4gICAgICAgICAgICBkb2N1bWVudC5kaXNwYXRjaEV2ZW50KG5ldyBDdXN0b21FdmVudCh3aW5kb3cuQ1VTVE9NX0VWRU5UX05BTUUsIHtkZXRhaWw6IHthY3Rpb246ICdzdGF0ZScsIGlzUGxheWluZzogZXh0ZXJuYWxBUEkuaXNQbGF5aW5nKCl9fSkpO1xyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIC8v0YHQvtCx0YvRgtC40LUg0YHQvNC10L3RiyDRgtGA0LXQutCwXHJcbiAgICAgICAgJ0VWRU5UX1RSQUNLJzogKCkgPT4ge1xyXG4gICAgICAgICAgICBkb2N1bWVudC5kaXNwYXRjaEV2ZW50KG5ldyBDdXN0b21FdmVudCh3aW5kb3cuQ1VTVE9NX0VWRU5UX05BTUUsIHtkZXRhaWw6IHthY3Rpb246ICd0cmFjaycsIHRyYWNrOiBleHRlcm5hbEFQSS5nZXRDdXJyZW50VHJhY2tXcmFwcGVyKCksIHNvdXJjZTogZXh0ZXJuYWxBUEkuZ2V0U291cmNlSW5mb1dyYXBwZXIoKSwgcHJvZ3Jlc3M6IGV4dGVybmFsQVBJLmdldFByb2dyZXNzKCl9fSkpO1xyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIC8v0YHQvtCx0YvRgtC40LUg0L3QsNC20LDRgtC40Y8g0L3QsCDQutC90L7Qv9C60YMg0L/QvtCy0YLQvtGALCDRiNCw0YTQuywg0LvQsNC50LpcclxuICAgICAgICAnRVZFTlRfQ09OVFJPTFMnOiAoKSA9PiB7XHJcbiAgICAgICAgICAgIGRvY3VtZW50LmRpc3BhdGNoRXZlbnQobmV3IEN1c3RvbUV2ZW50KHdpbmRvdy5DVVNUT01fRVZFTlRfTkFNRSwge2RldGFpbDoge2FjdGlvbjogJ2NvbnRyb2xzJywgY29udHJvbHM6IHtzdGF0ZXM6IGV4dGVybmFsQVBJLmdldENvbnRyb2xzV3JhcHBlcigpLCB2b2x1bWU6IGV4dGVybmFsQVBJLmdldFZvbHVtZSgpLCBzaHVmZmxlOiBleHRlcm5hbEFQSS5nZXRTaHVmZmxlV3JhcHBlcigpLCByZXBlYXQ6IGV4dGVybmFsQVBJLmdldFJlcGVhdFdyYXBwZXIoKX19fSkpO1xyXG4gICAgICAgICAgICAvL9C/0YDQuCDQutC70LjQutC1INC90LAgKNC00LjQtynQu9Cw0LnQuiDRgdGA0LDQsdCw0YLRi9Cy0LDQtdGCINC00LDQvdC90L7QtSDRgdC+0LHRi9GC0LjQtSwg0L3QviDRgdCw0LzQviDRgdC+0YHRgtC+0Y/QvdC40LUgKNC00LjQtynQu9Cw0LnQutCwINC90LDRhdC+0LTQuNGC0YHRjyDQsiBleHRlcm5hbEFQSS5nZXRDdXJyZW50VHJhY2tXcmFwcGVyKCksINC/0L7RjdGC0L7QvNGDINC00LvRjyDQtdCz0L4g0L7QsdC90L7QstC70LXQvdC40Y8g0LLRi9C30YvQstCw0LXQvCDRgdC+0LHRi9GC0LjQtSB0cmFja1xyXG4gICAgICAgICAgICBkb2N1bWVudC5kaXNwYXRjaEV2ZW50KG5ldyBDdXN0b21FdmVudCh3aW5kb3cuQ1VTVE9NX0VWRU5UX05BTUUsIHtkZXRhaWw6IHthY3Rpb246ICd0cmFjaycsIHRyYWNrOiBleHRlcm5hbEFQSS5nZXRDdXJyZW50VHJhY2tXcmFwcGVyKCksIHNvdXJjZTogZXh0ZXJuYWxBUEkuZ2V0U291cmNlSW5mb1dyYXBwZXIoKSwgcHJvZ3Jlc3M6IGV4dGVybmFsQVBJLmdldFByb2dyZXNzKCksIHNlY29uZGFyeTp0cnVlfX0pKTtcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICAvL9GB0L7QsdGL0YLQuNC1INC40LfQvNC10L3QtdC90LjRjyDQv9C70LXQudC70LjRgdGC0LAg0YEg0YbQtdC70YzRjiDQv9C+0LnQvNCw0YLRjCDQtdCz0L4g0L7QsdC90YPQu9C10L3QuNC1XHJcbiAgICAgICAgJ0VWRU5UX1RSQUNLU19MSVNUJzogKCkgPT4ge1xyXG4gICAgICAgICAgICBkb2N1bWVudC5kaXNwYXRjaEV2ZW50KG5ldyBDdXN0b21FdmVudCh3aW5kb3cuQ1VTVE9NX0VWRU5UX05BTUUsIHtkZXRhaWw6IHthY3Rpb246ICd0cmFja3NsaXN0JywgcGxheWxpc3Q6IHtsaXN0OiBleHRlcm5hbEFQSS5nZXRUcmFja3NMaXN0KCksIGluZGV4OiBleHRlcm5hbEFQSS5nZXRUcmFja0luZGV4KCksIHByZXY6IGV4dGVybmFsQVBJLmdldFByZXZUcmFjaygpLCBuZXh0OiBleHRlcm5hbEFQSS5nZXROZXh0VHJhY2soKX19fSkpO1xyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIC8v0YHQvtCx0YvRgtC40LUg0LjQt9C80LXQvdC10L3QuNGPINCz0YDQvtC80LrQvtGB0YLQuFxyXG4gICAgICAgICdFVkVOVF9WT0xVTUUnOiAoKSA9PiB7XHJcbiAgICAgICAgICAgIGRvY3VtZW50LmRpc3BhdGNoRXZlbnQobmV3IEN1c3RvbUV2ZW50KHdpbmRvdy5DVVNUT01fRVZFTlRfTkFNRSwge2RldGFpbDoge2FjdGlvbjogJ3ZvbHVtZScsIHZvbHVtZTogZXh0ZXJuYWxBUEkuZ2V0Vm9sdW1lKCl9fSkpO1xyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIC8v0YHQvtCx0YvRgtC40LUg0L/RgNC+0LPRgNC10YHRgdCwINC/0YDQvtC40LPRgNGL0LLQsNC90LjRj1xyXG4gICAgICAgICdFVkVOVF9QUk9HUkVTUyc6ICgpID0+IHtcclxuICAgICAgICAgICAgZG9jdW1lbnQuZGlzcGF0Y2hFdmVudChuZXcgQ3VzdG9tRXZlbnQod2luZG93LkNVU1RPTV9FVkVOVF9OQU1FLCB7ZGV0YWlsOiB7YWN0aW9uOiAncHJvZ3Jlc3MnLCBwcm9ncmVzczogZXh0ZXJuYWxBUEkuZ2V0UHJvZ3Jlc3MoKX19KSk7XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgLy/RgdC+0LHRi9GC0LjQtSDQvdCw0YfQsNC70LAg0Lgg0LrQvtC90YbQsCDRgNC10LrQu9Cw0LzRi1xyXG4gICAgICAgICdFVkVOVF9BRFZFUlQnOiBlID0+IHtcclxuICAgICAgICAgICAgZG9jdW1lbnQuZGlzcGF0Y2hFdmVudChuZXcgQ3VzdG9tRXZlbnQod2luZG93LkNVU1RPTV9FVkVOVF9OQU1FLCB7ZGV0YWlsOiB7YWN0aW9uOiAnYWR2ZXJ0JywgaW5mbzogZSwgc3RhdGU6IGUgIT09IGZhbHNlfX0pKTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG5cclxuICAgIHRocm90dGxlZEV2ZW50cyA9IHtwcm9ncmVzczoge3RpbWVyOjAsIHRpbWU6MTAwfX07XHJcblxyXG4gICAgcG9ydCA9IG51bGw7XHJcblxyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgbG9nLnRyYWNlKFwieWFuZGV4LmNvbnN0cnVjdG9yKClcIik7XHJcbiAgICAgICAgLy/RgdC+0LXQtNC40L3QtdC90LjQtSDRgSBleHRlbnNpb24n0L7QvFxyXG4gICAgICAgIHRoaXMucG9ydCA9IG5ldyBwb3J0Q2xhc3MoJ3ltdXNpYycsICdjbGllbnQnLCBudWxsKTtcclxuICAgICAgICAvL9C/0YDQvtCx0YDQvtGBINC+0LHRgNCw0LHQvtGC0YfQuNC60LAg0L/QvtC70YPRh9C10L3QvdGL0YUg0L7RgiBleHRlbnNpb24n0LAg0YHQvtC+0LHRidC10L3QuNC5XHJcbiAgICAgICAgdGhpcy5wb3J0LmFkZE9uTWVzc2FnZUNiKHRoaXMub25NZXNzYWdlKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcblxyXG4gICAgb25NZXNzYWdlID0gcmVxdWVzdCA9PiB7XHJcbiAgICAgICAgbG9nLmRlYnVnKFwieWFuZGV4Lm9uTWVzc2FnZSgpIGFjdGlvbiA8JXM+XCIsIHJlcXVlc3QuYWN0aW9uKTtcclxuXHJcbiAgICAgICAgaWYgKCF0aGlzLmNvbW1hbmRzW3JlcXVlc3QuYWN0aW9uXSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGxvZy5kZWJ1ZyhcInlhbmRleC5vbk1lc3NhZ2UoKSBhY3Rpb24gbm90IGRlZmluZWRcIik7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGxldCBhcmdzID0gKHR5cGVvZiB0aGlzLmNvbW1hbmRzW3JlcXVlc3QuYWN0aW9uXS5hcmdzID09ICdmdW5jdGlvbicpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgID8gdGhpcy5jb21tYW5kc1tyZXF1ZXN0LmFjdGlvbl0uYXJncy5jYWxsKHRoaXMsIHJlcXVlc3QpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDogdGhpcy5jb21tYW5kc1tyZXF1ZXN0LmFjdGlvbl0uYXJncztcclxuXHJcbiAgICAgICAgbG9nLnRyYWNlKFwieWFuZGV4Lm9uTWVzc2FnZSgpIGluamVjdGluZyBmdW5jICVvIHdpdGggYXJncyAlb1wiLCB0aGlzLmNvbW1hbmRzW3JlcXVlc3QuYWN0aW9uXS5mbmMsIGFyZ3MpO1xyXG5cclxuICAgICAgICBpZiAoIXRoaXMuY29tbWFuZHNbcmVxdWVzdC5hY3Rpb25dLmRvTm90SW5qZWN0KVxyXG4gICAgICAgICAgICB1dGlscy5pbmplY3RDb2RlLmFwcGx5KG51bGwsIFt0aGlzLmNvbW1hbmRzW3JlcXVlc3QuYWN0aW9uXS5mbmNdLmNvbmNhdChhcmdzKSk7XHJcbiAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICB0aGlzLmNvbW1hbmRzW3JlcXVlc3QuYWN0aW9uXS5mbmMuYXBwbHkobnVsbCwgW10uY29uY2F0KGFyZ3MpKTtcclxuICAgIH07XHJcblxyXG4gICAgaW5pdCA9ICgpID0+IHtcclxuICAgICAgICBsb2cudHJhY2UoXCJ5YW5kZXguaW5pdCgpXCIpO1xyXG5cclxuICAgICAgICAvL9C00L7QsdCw0LLQu9GP0LXQvCDQvtCx0LXRgNGC0LrQuCDQvdCw0LQg0JDQn9CYXHJcbiAgICAgICAgLy9UT0RPOiDQv9C+0L/RgNC+0YHQuNGC0Ywg0L/QvtC/0YDQsNCy0LjRgtGMINGN0YLQvtGCINC80L7QvNC10L3RgiDQsiDQkNCf0JhcclxuICAgICAgICBsb2cudHJhY2UoXCJ5YW5kZXguaW5pdCgpIGluamVjdGluZyBleHRlcm5hbEFQSSB3cmFwcGVyc1wiKTtcclxuICAgICAgICB1dGlscy5pbmplY3RDb2RlKCgpID0+IHtcclxuICAgICAgICAgICAgZXh0ZXJuYWxBUEkuZ2V0Q3VycmVudFRyYWNrV3JhcHBlciA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgbGV0IHQgPSB0aGlzLmdldEN1cnJlbnRUcmFjaygpO1xyXG4gICAgICAgICAgICAgICAgaWYgKHQpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHQudmVyc2lvbiA9PT0gdW5kZWZpbmVkKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0LnZlcnNpb24gPSBudWxsO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICh0LmNvdmVyID09PSB1bmRlZmluZWQpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHQuY292ZXIgPSBudWxsO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHQ7XHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIGV4dGVybmFsQVBJLmdldENvbnRyb2xzV3JhcHBlciA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgbGV0IGNvbnRyb2xzID0gdGhpcy5nZXRDb250cm9scygpO1xyXG4gICAgICAgICAgICAgICAgZm9yKGxldCBrZXkgaW4gY29udHJvbHMpXHJcbiAgICAgICAgICAgICAgICAgICAgc3dpdGNoIChjb250cm9sc1trZXldKVxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSBleHRlcm5hbEFQSS5DT05UUk9MX0VOQUJMRUQ6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250cm9sc1trZXldID0gJ2VuYWJsZWQnO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgZXh0ZXJuYWxBUEkuQ09OVFJPTF9ESVNBQkxFRDpcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRyb2xzW2tleV0gPSAnZGlzYWJsZWQnO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgZXh0ZXJuYWxBUEkuQ09OVFJPTF9ERU5JRUQ6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250cm9sc1trZXldID0gJ2RlbmllZCc7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSB1bmRlZmluZWQ6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250cm9sc1trZXldID0gbnVsbDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gY29udHJvbHM7XHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIGV4dGVybmFsQVBJLmdldFNvdXJjZUluZm9XcmFwcGVyID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgdCA9IHRoaXMuZ2V0U291cmNlSW5mbygpO1xyXG4gICAgICAgICAgICAgICAgaWYgKHQgJiYgdC5jb3ZlciA9PT0gdW5kZWZpbmVkKVxyXG4gICAgICAgICAgICAgICAgICAgIHQuY292ZXIgPSBudWxsO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHQ7XHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIGV4dGVybmFsQVBJLmdldFJlcGVhdFdyYXBwZXIgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIHN3aXRjaCAoZXh0ZXJuYWxBUEkuZ2V0UmVwZWF0KCkpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBleHRlcm5hbEFQSS5SRVBFQVRfQUxMOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gMjtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBleHRlcm5hbEFQSS5SRVBFQVRfT05FOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBleHRlcm5hbEFQSS5SRVBFQVRfTk9ORTpcclxuICAgICAgICAgICAgICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICBleHRlcm5hbEFQSS5nZXRTaHVmZmxlV3JhcHBlciA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgc3dpdGNoIChleHRlcm5hbEFQSS5nZXRTaHVmZmxlKCkpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBleHRlcm5hbEFQSS5TSFVGRkxFX09OOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBleHRlcm5hbEFQSS5TSFVGRkxFX09GRjpcclxuICAgICAgICAgICAgICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICAvL9C00L7QsdCw0LLQu9GP0LXQvCDQvdCw0Ygg0L7QsdGA0LDQsdC+0YLRh9C40Log0YHQvtCx0YvRgtC40LksINGH0LXRgNC10Lcg0LrQvtGC0L7RgNGL0Lkg0L/RgNC+0LjRgdGF0L7QtNC40YIg0L7QsdGA0LDRgtC90LDRjyDRgdCy0Y/Qt9GMXHJcbiAgICAgICAgbG9nLnRyYWNlKFwieWFuZGV4LmluaXQoKSBpbmplY3RpbmcgQ1VTVE9NX0VWRU5UX05BTUVcIik7XHJcbiAgICAgICAgdXRpbHMuaW5qZWN0Q29kZSh2YWwgPT4ge1xyXG4gICAgICAgICAgICB3aW5kb3cuQ1VTVE9NX0VWRU5UX05BTUUgPSB2YWw7XHJcbiAgICAgICAgfSwgSlNPTi5zdHJpbmdpZnkoQ1VTVE9NX0VWRU5UX05BTUUpKTtcclxuXHJcbiAgICAgICAgbG9nLnRyYWNlKFwieWFuZGV4LmluaXQoKSBpbmplY3RpbmcgZG9jdW1lbnQgQ1VTVE9NX0VWRU5UX05BTUUgZXZlbnQgbGlzdGVuZXJcIik7XHJcbiAgICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihDVVNUT01fRVZFTlRfTkFNRSwgZSA9PiB7XHJcbiAgICAgICAgICAgIGxvZy50cmFjZShcInlhbmRleC5jdXN0b21FdmVudExpc3RlbmVyKClcIiwgZS5kZXRhaWwpO1xyXG4gICAgICAgICAgICBsZXQgdXNlVGhyb3R0bGluZyA9ICghIXRoaXMudGhyb3R0bGVkRXZlbnRzW2UuZGV0YWlsLmFjdGlvbl0pLFxyXG4gICAgICAgICAgICAgICAgdGhyb3R0bGluZ0tleSA9IGUuZGV0YWlsLmFjdGlvbixcclxuICAgICAgICAgICAgICAgIHRocm90dGxlVGltZSA9IHVzZVRocm90dGxpbmcgPyB0aGlzLnRocm90dGxlZEV2ZW50c1tlLmRldGFpbC5hY3Rpb25dLnRpbWUgOiBudWxsO1xyXG5cclxuICAgICAgICAgICAgbG9nLnRyYWNlKFwieWFuZGV4LmN1c3RvbUV2ZW50TGlzdGVuZXIoKSBzZW5kaW5nIHRvIHBvcnQ6IHVzZVRocm90dGxpbmcgPCVvPiwgdGhyb3R0bGluZ0tleSA8JXM+LCB0aHJvdHRsZVRpbWUgPCVkPlwiLCB1c2VUaHJvdHRsaW5nLCB0aHJvdHRsaW5nS2V5LCB0aHJvdHRsZVRpbWUpO1xyXG4gICAgICAgICAgICB0aGlzLnBvcnQuc2VuZChlLmRldGFpbCwgdXNlVGhyb3R0bGluZywgdGhyb3R0bGluZ0tleSwgdGhyb3R0bGVUaW1lKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgLy/QtNC+0LHQsNCy0LvRj9C10Lwg0YHQu9GD0YjQsNGC0LXQu9C10Lkg0YHQvtCx0YvRgtC40LkgZXh0ZXJuYWxBUElcclxuICAgICAgICBsb2cudHJhY2UoXCJ5YW5kZXguaW5pdCgpIGluamVjdGluZyBleHRlcm5hbEFQSSBldmVudHMgbGlzdGVuZXJzXCIpO1xyXG4gICAgICAgIGZvciAoY29uc3QgZXZlbnQgaW4gdGhpcy5leHRBcGlFdmVudHMpXHJcbiAgICAgICAgICAgIHV0aWxzLmluamVjdENvZGUoKGV2dCwgZm5jKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBleHRlcm5hbEFQSS5vbihleHRlcm5hbEFQSVtldnRdLCBmbmMpO1xyXG4gICAgICAgICAgICB9LCBKU09OLnN0cmluZ2lmeShldmVudCksIHRoaXMuZXh0QXBpRXZlbnRzW2V2ZW50XSk7XHJcblxyXG4gICAgICAgIC8v0LTQvtCx0LDQstC70Y/QtdC8INGB0LvRg9GI0LDRgtC10LvRjyDRgdGC0LDQvdC00LDRgNGC0L3Ri9GFIERPTSDRgdC+0LHRi9GC0LjQuVxyXG4gICAgICAgIGxvZy50cmFjZShcInlhbmRleC5pbml0KCkgaW5qZWN0aW5nIERPTSBldmVudHMgbGlzdGVuZXJzXCIpO1xyXG4gICAgICAgIHV0aWxzLmluamVjdENvZGUoKCkgPT4ge1xyXG4gICAgICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigndW5sb2FkJywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgZG9jdW1lbnQuZGlzcGF0Y2hFdmVudChuZXcgQ3VzdG9tRXZlbnQod2luZG93LkNVU1RPTV9FVkVOVF9OQU1FLCB7ZGV0YWlsOiB7YWN0aW9uOiAnc2h1dGRvd24nfX0pKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdiZWZvcmV1bmxvYWQnLCBmdW5jdGlvbihlKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBzZXR0aW5nc1ZhbHVlID0gd2luZG93LmNocm9tZV9leHQgPyB3aW5kb3cuY2hyb21lX2V4dC5zdG9yYWdlWydzdG9yZS5zZXR0aW5ncy5jbG9zZV9hbGVydCddIDogdHJ1ZTtcclxuICAgICAgICAgICAgICAgIGNvbnN0IG1zZyA9IFwi0JLRiyDRg9Cy0LXRgNC10L3Riywg0YfRgtC+INGF0L7RgtC40YLQtSDQt9Cw0LrRgNGL0YLRjCDQvtC60L3QviDQstC+INCy0YDQtdC80Y8g0L/RgNC+0LjQs9GA0YvQstCw0L3QuNGPINCv0L3QtNC10LrRgS7QnNGD0LfRi9C60Lg/XCI7XHJcbiAgICAgICAgICAgICAgICBpZiAoc2V0dGluZ3NWYWx1ZSAmJiBleHRlcm5hbEFQSSAmJiBleHRlcm5hbEFQSS5pc1BsYXlpbmcoKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGUucmV0dXJuVmFsdWUgPSBtc2c7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG1zZztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdmb2N1cycsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIGRvY3VtZW50LmRpc3BhdGNoRXZlbnQobmV3IEN1c3RvbUV2ZW50KHdpbmRvdy5DVVNUT01fRVZFTlRfTkFNRSwge2RldGFpbDoge2FjdGlvbjogJ2ZvY3VzJ319KSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignYmx1cicsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIGRvY3VtZW50LmRpc3BhdGNoRXZlbnQobmV3IEN1c3RvbUV2ZW50KHdpbmRvdy5DVVNUT01fRVZFTlRfTkFNRSwge2RldGFpbDoge2FjdGlvbjogJ2JsdXInfX0pKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIC8v0YTQvtGA0LzQuNGA0YPQtdC8INC4INC+0YLQv9GA0LDQstC70Y/QtdC8INGA0LDRgdGI0LjRgNC10L3QuNGOINC90LDRh9Cw0LvRjNC90L7QtSDRgdC+0YHRgtC+0Y/QvdC40LVcclxuICAgICAgICBsb2cudHJhY2UoXCJ5YW5kZXguaW5pdCgpIGluamVjdGluZyBpbml0aWFsIHBsYXllciBzdGF0ZSBzeW5jXCIpO1xyXG4gICAgICAgIHV0aWxzLmluamVjdENvZGUoKCkgPT4ge1xyXG4gICAgICAgICAgICBkb2N1bWVudC5kaXNwYXRjaEV2ZW50KG5ldyBDdXN0b21FdmVudCh3aW5kb3cuQ1VTVE9NX0VWRU5UX05BTUUsIHtkZXRhaWw6IHthY3Rpb246ICdmdWxsc3RhdGUnLFxyXG4gICAgICAgICAgICAgICAgdHJhY2s6IGV4dGVybmFsQVBJLmdldEN1cnJlbnRUcmFja1dyYXBwZXIoKSxcclxuICAgICAgICAgICAgICAgIHByb2dyZXNzOiBleHRlcm5hbEFQSS5nZXRQcm9ncmVzcygpLFxyXG4gICAgICAgICAgICAgICAgc291cmNlOiBleHRlcm5hbEFQSS5nZXRTb3VyY2VJbmZvV3JhcHBlcigpLFxyXG4gICAgICAgICAgICAgICAgY29udHJvbHM6IHtcclxuICAgICAgICAgICAgICAgICAgICBzdGF0ZXM6IGV4dGVybmFsQVBJLmdldENvbnRyb2xzV3JhcHBlcigpLFxyXG4gICAgICAgICAgICAgICAgICAgIHZvbHVtZTogZXh0ZXJuYWxBUEkuZ2V0Vm9sdW1lKCksXHJcbiAgICAgICAgICAgICAgICAgICAgc2h1ZmZsZTogZXh0ZXJuYWxBUEkuZ2V0U2h1ZmZsZVdyYXBwZXIoKSxcclxuICAgICAgICAgICAgICAgICAgICByZXBlYXQ6IGV4dGVybmFsQVBJLmdldFJlcGVhdFdyYXBwZXIoKVxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIHBsYXlsaXN0OiB7XHJcbiAgICAgICAgICAgICAgICAgICAgcHJldjogZXh0ZXJuYWxBUEkuZ2V0UHJldlRyYWNrKCksXHJcbiAgICAgICAgICAgICAgICAgICAgbGlzdDogZXh0ZXJuYWxBUEkuZ2V0VHJhY2tzTGlzdCgpLFxyXG4gICAgICAgICAgICAgICAgICAgIGluZGV4OiBleHRlcm5hbEFQSS5nZXRUcmFja0luZGV4KCksXHJcbiAgICAgICAgICAgICAgICAgICAgbmV4dDogZXh0ZXJuYWxBUEkuZ2V0TmV4dFRyYWNrKClcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBpc1BsYXlpbmc6IGV4dGVybmFsQVBJLmlzUGxheWluZygpLFxyXG4gICAgICAgICAgICAgICAgdXNlcjoge1xyXG4gICAgICAgICAgICAgICAgICAgIHVpZDogTXUuYmxvY2tzLmRpLnJlcG8uYXV0aC51c2VyLnVpZCxcclxuICAgICAgICAgICAgICAgICAgICBkaWQ6IE11LmJsb2Nrcy5kaS5yZXBvLmF1dGgudXNlci5kZXZpY2VfaWRcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfX0pKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgLy/RgNC10LfQutCwINGA0LXQutC70LDQvNGLXHJcbiAgICAgICAgbG9nLnRyYWNlKFwieWFuZGV4LmluaXQoKSBpbmplY3RpbmcgWE1MSHR0cFJlcXVlc3QgcHJveHkgZm9yIEFEIHNwb29maW5nXCIpO1xyXG4gICAgICAgIHV0aWxzLmluamVjdENvZGUoKCkgPT4ge1xyXG4gICAgICAgICAgICAoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgbGV0IFhIUiA9IHdpbmRvdy5YTUxIdHRwUmVxdWVzdDtcclxuICAgICAgICAgICAgICAgIHdpbmRvdy5YTUxIdHRwUmVxdWVzdCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgbyA9IG5ldyBYSFIoKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgdCA9IHRoaXMsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGFkdiA9IG51bGw7XHJcbiAgICAgICAgICAgICAgICAgICAgdC5ET05FID0gby5ET05FO1xyXG4gICAgICAgICAgICAgICAgICAgIHQuSEVBREVSU19SRUNFSVZFRCA9IG8uSEVBREVSU19SRUNFSVZFRDtcclxuICAgICAgICAgICAgICAgICAgICB0LkxPQURJTkcgPSBvLkxPQURJTkc7XHJcbiAgICAgICAgICAgICAgICAgICAgdC5PUEVORUQgPSBvLk9QRU5FRDtcclxuICAgICAgICAgICAgICAgICAgICB0LlVOU0VOVCA9IG8uVU5TRU5UO1xyXG4gICAgICAgICAgICAgICAgICAgIHQuYWJvcnQgPSBmdW5jdGlvbiAoKSB7IG8uYWJvcnQoKTsgfTtcclxuICAgICAgICAgICAgICAgICAgICB0LmFkZEV2ZW50TGlzdGVuZXIgPSBmdW5jdGlvbiAoKSB7IG8uYWRkRXZlbnRMaXN0ZW5lci5hcHBseShvLCBhcmd1bWVudHMpOyB9O1xyXG4gICAgICAgICAgICAgICAgICAgIHQuZGlzcGF0Y2hFdmVudCA9IGZ1bmN0aW9uICgpIHsgby5kaXNwYXRjaEV2ZW50LmFwcGx5KG8sIGFyZ3VtZW50cyk7IH07XHJcbiAgICAgICAgICAgICAgICAgICAgdC5nZXRBbGxSZXNwb25zZUhlYWRlcnMgPSBmdW5jdGlvbiAoKSB7IHJldHVybiBvLmdldEFsbFJlc3BvbnNlSGVhZGVycygpOyB9O1xyXG4gICAgICAgICAgICAgICAgICAgIHQuZ2V0UmVzcG9uc2VIZWFkZXIgPSBmdW5jdGlvbiAoKSB7IHJldHVybiBvLmdldFJlc3BvbnNlSGVhZGVyLmFwcGx5KG8sIGFyZ3VtZW50cyk7IH07XHJcbiAgICAgICAgICAgICAgICAgICAgby5vbmFib3J0ID0gZnVuY3Rpb24gKCkgeyBpZiAodHlwZW9mIHQub25hYm9ydCA9PT0gJ2Z1bmN0aW9uJykgdC5vbmFib3J0KCk7IH07XHJcbiAgICAgICAgICAgICAgICAgICAgby5vbmVycm9yID0gZnVuY3Rpb24gKCkgeyBpZiAodHlwZW9mIHQub25lcnJvciA9PT0gJ2Z1bmN0aW9uJykgdC5vbmVycm9yKCk7IH07XHJcbiAgICAgICAgICAgICAgICAgICAgby5vbmxvYWQgPSBmdW5jdGlvbiAoKSB7IGlmICh0eXBlb2YgdC5vbmxvYWQgPT09ICdmdW5jdGlvbicpIHQub25sb2FkKCk7IH07XHJcbiAgICAgICAgICAgICAgICAgICAgby5vbmxvYWRlbmQgPSBmdW5jdGlvbiAoKSB7IGlmICh0eXBlb2YgdC5vbmxvYWRlbmQgPT09ICdmdW5jdGlvbicpIHQub25sb2FkZW5kKCk7IH07XHJcbiAgICAgICAgICAgICAgICAgICAgby5vbmxvYWRzdGFydCA9IGZ1bmN0aW9uICgpIHsgaWYgKHR5cGVvZiB0Lm9ubG9hZHN0YXJ0ID09PSAnZnVuY3Rpb24nKSB0Lm9ubG9hZHN0YXJ0KCk7IH07XHJcbiAgICAgICAgICAgICAgICAgICAgby5vbnByb2dyZXNzID0gZnVuY3Rpb24gKCkgeyBpZiAodHlwZW9mIHQub25wcm9ncmVzcyA9PT0gJ2Z1bmN0aW9uJykgdC5vbnByb2dyZXNzKCk7IH07XHJcbiAgICAgICAgICAgICAgICAgICAgby5vbnJlYWR5c3RhdGVjaGFuZ2UgPSBmdW5jdGlvbiBvblJlYWR5KCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoby5yZWFkeVN0YXRlID09PSA0ICYmIG8ucmVzcG9uc2VVUkwuaW5kZXhPZignc3RhcnQnKSAhPSAtMSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy9jb25zb2xlLmxvZyhcIm5leHQgd2lsbCBiZSBhZHY/XCIsIG8ucmVzcG9uc2UuYWR2ZXJ0LmFmdGVyU2tpcCwgby5yZXNwb25zZS5hZHZlcnQuYWZ0ZXJQbGF5KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFkdiA9IG8ucmVzcG9uc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhZHYuYWR2ZXJ0LmFmdGVyU2tpcCA9ICdub25lJztcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFkdi5hZHZlcnQuYWZ0ZXJQbGF5ID0gJ25vbmUnO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgdC5vbnJlYWR5c3RhdGVjaGFuZ2UgPT09ICdmdW5jdGlvbicpIHQub25yZWFkeXN0YXRlY2hhbmdlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgICAgICBvLm9udGltZW91dCA9IGZ1bmN0aW9uICgpIHsgaWYgKHR5cGVvZiB0Lm9udGltZW91dCA9PT0gJ2Z1bmN0aW9uJykgdC5vbnRpbWVvdXQoKTsgfTtcclxuICAgICAgICAgICAgICAgICAgICB0Lm9wZW4gPSBmdW5jdGlvbiAoKSB7IG8ub3Blbi5hcHBseShvLCBhcmd1bWVudHMpOyB9O1xyXG4gICAgICAgICAgICAgICAgICAgIHQub3ZlcnJpZGVNaW1lVHlwZSA9IGZ1bmN0aW9uICgpIHsgby5vdmVycmlkZU1pbWVUeXBlLmFwcGx5KG8sIGFyZ3VtZW50cyk7IH07XHJcbiAgICAgICAgICAgICAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsIFwicmVhZHlTdGF0ZVwiLCB7IGdldDogZnVuY3Rpb24gKCkgeyByZXR1cm4gby5yZWFkeVN0YXRlOyB9IH0pO1xyXG4gICAgICAgICAgICAgICAgICAgIHQucmVtb3ZlRXZlbnRMaXN0ZW5lciA9IGZ1bmN0aW9uICgpIHsgby5yZW1vdmVFdmVudExpc3RlbmVyLmFwcGx5KG8sIGFyZ3VtZW50cyk7IH07XHJcbiAgICAgICAgICAgICAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsIFwicmVzcG9uc2VcIiwge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChhZHYgJiYgISF3aW5kb3cuY2hyb21lX2V4dC5zdG9yYWdlWydzdG9yZS5zZXR0aW5ncy5wcmVtaXVtX2tleSddKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBhZHY7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gby5yZXNwb25zZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCBcInJlc3BvbnNlVGV4dFwiLCB7IGdldDogZnVuY3Rpb24gKCkgeyByZXR1cm4gby5yZXNwb25zZVRleHQ7IH0gfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsIFwicmVzcG9uc2VUeXBlXCIsIHsgZ2V0OiBmdW5jdGlvbiAoKSB7IHJldHVybiBvLnJlc3BvbnNlVHlwZTsgfSwgc2V0OiBmdW5jdGlvbiAodmFsdWUpIHsgby5yZXNwb25zZVR5cGUgPSB2YWx1ZTsgfSB9KTtcclxuICAgICAgICAgICAgICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgXCJyZXNwb25zZVVSTFwiLCB7IGdldDogZnVuY3Rpb24gKCkgeyByZXR1cm4gby5yZXNwb25zZVVSTDsgfSB9KTtcclxuICAgICAgICAgICAgICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgXCJyZXNwb25zZVhNTFwiLCB7IGdldDogZnVuY3Rpb24gKCkgeyByZXR1cm4gby5yZXNwb25zZVhNTDsgfSB9KTtcclxuICAgICAgICAgICAgICAgICAgICB0LnNlbmQgPSBmdW5jdGlvbiAoKSB7IG8uc2VuZC5hcHBseShvLCBhcmd1bWVudHMpOyB9O1xyXG4gICAgICAgICAgICAgICAgICAgIHQuc2V0UmVxdWVzdEhlYWRlciA9IGZ1bmN0aW9uICgpIHsgby5zZXRSZXF1ZXN0SGVhZGVyLmFwcGx5KG8sIGFyZ3VtZW50cyk7IH07XHJcbiAgICAgICAgICAgICAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsIFwic3RhdHVzXCIsIHsgZ2V0OiBmdW5jdGlvbiAoKSB7IHJldHVybiBvLnN0YXR1czsgfSB9KTtcclxuICAgICAgICAgICAgICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgXCJzdGF0dXNUZXh0XCIsIHsgZ2V0OiBmdW5jdGlvbiAoKSB7IHJldHVybiBvLnN0YXR1c1RleHQ7IH0gfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsIFwidGltZW91dFwiLCB7IGdldDogZnVuY3Rpb24gKCkgeyByZXR1cm4gby50aW1lb3V0OyB9LCBzZXQ6IGZ1bmN0aW9uICh2YWx1ZSkgeyBvLnRpbWVvdXQgPSB2YWx1ZTsgfSB9KTtcclxuICAgICAgICAgICAgICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgXCJ1cGxvYWRcIiwgeyBnZXQ6IGZ1bmN0aW9uICgpIHsgcmV0dXJuIG8udXBsb2FkOyB9IH0pO1xyXG4gICAgICAgICAgICAgICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCBcIndpdGhDcmVkZW50aWFsc1wiLCB7IGdldDogZnVuY3Rpb24gKCkgeyByZXR1cm4gby53aXRoQ3JlZGVudGlhbHM7IH0sIHNldDogZnVuY3Rpb24gKHZhbHVlKSB7IG8ud2l0aENyZWRlbnRpYWxzID0gdmFsdWU7IH0gfSk7XHJcbiAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICB9KSgpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfTtcclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgeWFuZGV4OyIsIi8qXG4qIGxvZ2xldmVsIC0gaHR0cHM6Ly9naXRodWIuY29tL3BpbXRlcnJ5L2xvZ2xldmVsXG4qXG4qIENvcHlyaWdodCAoYykgMjAxMyBUaW0gUGVycnlcbiogTGljZW5zZWQgdW5kZXIgdGhlIE1JVCBsaWNlbnNlLlxuKi9cbihmdW5jdGlvbiAocm9vdCwgZGVmaW5pdGlvbikge1xuICAgIFwidXNlIHN0cmljdFwiO1xuICAgIGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtcbiAgICAgICAgZGVmaW5lKGRlZmluaXRpb24pO1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIG1vZHVsZSA9PT0gJ29iamVjdCcgJiYgbW9kdWxlLmV4cG9ydHMpIHtcbiAgICAgICAgbW9kdWxlLmV4cG9ydHMgPSBkZWZpbml0aW9uKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcm9vdC5sb2cgPSBkZWZpbml0aW9uKCk7XG4gICAgfVxufSh0aGlzLCBmdW5jdGlvbiAoKSB7XG4gICAgXCJ1c2Ugc3RyaWN0XCI7XG4gICAgdmFyIG5vb3AgPSBmdW5jdGlvbigpIHt9O1xuICAgIHZhciB1bmRlZmluZWRUeXBlID0gXCJ1bmRlZmluZWRcIjtcblxuICAgIGZ1bmN0aW9uIHJlYWxNZXRob2QobWV0aG9kTmFtZSkge1xuICAgICAgICBpZiAodHlwZW9mIGNvbnNvbGUgPT09IHVuZGVmaW5lZFR5cGUpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTsgLy8gV2UgY2FuJ3QgYnVpbGQgYSByZWFsIG1ldGhvZCB3aXRob3V0IGEgY29uc29sZSB0byBsb2cgdG9cbiAgICAgICAgfSBlbHNlIGlmIChjb25zb2xlW21ldGhvZE5hbWVdICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHJldHVybiBiaW5kTWV0aG9kKGNvbnNvbGUsIG1ldGhvZE5hbWUpO1xuICAgICAgICB9IGVsc2UgaWYgKGNvbnNvbGUubG9nICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHJldHVybiBiaW5kTWV0aG9kKGNvbnNvbGUsICdsb2cnKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBub29wO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gYmluZE1ldGhvZChvYmosIG1ldGhvZE5hbWUpIHtcbiAgICAgICAgdmFyIG1ldGhvZCA9IG9ialttZXRob2ROYW1lXTtcbiAgICAgICAgaWYgKHR5cGVvZiBtZXRob2QuYmluZCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgcmV0dXJuIG1ldGhvZC5iaW5kKG9iaik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIHJldHVybiBGdW5jdGlvbi5wcm90b3R5cGUuYmluZC5jYWxsKG1ldGhvZCwgb2JqKTtcbiAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICAvLyBNaXNzaW5nIGJpbmQgc2hpbSBvciBJRTggKyBNb2Rlcm5penIsIGZhbGxiYWNrIHRvIHdyYXBwaW5nXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gRnVuY3Rpb24ucHJvdG90eXBlLmFwcGx5LmFwcGx5KG1ldGhvZCwgW29iaiwgYXJndW1lbnRzXSk7XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIHRoZXNlIHByaXZhdGUgZnVuY3Rpb25zIGFsd2F5cyBuZWVkIGB0aGlzYCB0byBiZSBzZXQgcHJvcGVybHlcblxuICAgIGZ1bmN0aW9uIGVuYWJsZUxvZ2dpbmdXaGVuQ29uc29sZUFycml2ZXMobWV0aG9kTmFtZSwgbGV2ZWwsIGxvZ2dlck5hbWUpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGlmICh0eXBlb2YgY29uc29sZSAhPT0gdW5kZWZpbmVkVHlwZSkge1xuICAgICAgICAgICAgICAgIHJlcGxhY2VMb2dnaW5nTWV0aG9kcy5jYWxsKHRoaXMsIGxldmVsLCBsb2dnZXJOYW1lKTtcbiAgICAgICAgICAgICAgICB0aGlzW21ldGhvZE5hbWVdLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcmVwbGFjZUxvZ2dpbmdNZXRob2RzKGxldmVsLCBsb2dnZXJOYW1lKSB7XG4gICAgICAgIC8qanNoaW50IHZhbGlkdGhpczp0cnVlICovXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbG9nTWV0aG9kcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgdmFyIG1ldGhvZE5hbWUgPSBsb2dNZXRob2RzW2ldO1xuICAgICAgICAgICAgdGhpc1ttZXRob2ROYW1lXSA9IChpIDwgbGV2ZWwpID9cbiAgICAgICAgICAgICAgICBub29wIDpcbiAgICAgICAgICAgICAgICB0aGlzLm1ldGhvZEZhY3RvcnkobWV0aG9kTmFtZSwgbGV2ZWwsIGxvZ2dlck5hbWUpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZGVmYXVsdE1ldGhvZEZhY3RvcnkobWV0aG9kTmFtZSwgbGV2ZWwsIGxvZ2dlck5hbWUpIHtcbiAgICAgICAgLypqc2hpbnQgdmFsaWR0aGlzOnRydWUgKi9cbiAgICAgICAgcmV0dXJuIHJlYWxNZXRob2QobWV0aG9kTmFtZSkgfHxcbiAgICAgICAgICAgICAgIGVuYWJsZUxvZ2dpbmdXaGVuQ29uc29sZUFycml2ZXMuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICB9XG5cbiAgICB2YXIgbG9nTWV0aG9kcyA9IFtcbiAgICAgICAgXCJ0cmFjZVwiLFxuICAgICAgICBcImRlYnVnXCIsXG4gICAgICAgIFwiaW5mb1wiLFxuICAgICAgICBcIndhcm5cIixcbiAgICAgICAgXCJlcnJvclwiXG4gICAgXTtcblxuICAgIGZ1bmN0aW9uIExvZ2dlcihuYW1lLCBkZWZhdWx0TGV2ZWwsIGZhY3RvcnkpIHtcbiAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgIHZhciBjdXJyZW50TGV2ZWw7XG4gICAgICB2YXIgc3RvcmFnZUtleSA9IFwibG9nbGV2ZWxcIjtcbiAgICAgIGlmIChuYW1lKSB7XG4gICAgICAgIHN0b3JhZ2VLZXkgKz0gXCI6XCIgKyBuYW1lO1xuICAgICAgfVxuXG4gICAgICBmdW5jdGlvbiBwZXJzaXN0TGV2ZWxJZlBvc3NpYmxlKGxldmVsTnVtKSB7XG4gICAgICAgICAgdmFyIGxldmVsTmFtZSA9IChsb2dNZXRob2RzW2xldmVsTnVtXSB8fCAnc2lsZW50JykudG9VcHBlckNhc2UoKTtcblxuICAgICAgICAgIC8vIFVzZSBsb2NhbFN0b3JhZ2UgaWYgYXZhaWxhYmxlXG4gICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgd2luZG93LmxvY2FsU3RvcmFnZVtzdG9yYWdlS2V5XSA9IGxldmVsTmFtZTtcbiAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgIH0gY2F0Y2ggKGlnbm9yZSkge31cblxuICAgICAgICAgIC8vIFVzZSBzZXNzaW9uIGNvb2tpZSBhcyBmYWxsYmFja1xuICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgIHdpbmRvdy5kb2N1bWVudC5jb29raWUgPVxuICAgICAgICAgICAgICAgIGVuY29kZVVSSUNvbXBvbmVudChzdG9yYWdlS2V5KSArIFwiPVwiICsgbGV2ZWxOYW1lICsgXCI7XCI7XG4gICAgICAgICAgfSBjYXRjaCAoaWdub3JlKSB7fVxuICAgICAgfVxuXG4gICAgICBmdW5jdGlvbiBnZXRQZXJzaXN0ZWRMZXZlbCgpIHtcbiAgICAgICAgICB2YXIgc3RvcmVkTGV2ZWw7XG5cbiAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICBzdG9yZWRMZXZlbCA9IHdpbmRvdy5sb2NhbFN0b3JhZ2Vbc3RvcmFnZUtleV07XG4gICAgICAgICAgfSBjYXRjaCAoaWdub3JlKSB7fVxuXG4gICAgICAgICAgaWYgKHR5cGVvZiBzdG9yZWRMZXZlbCA9PT0gdW5kZWZpbmVkVHlwZSkge1xuICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgdmFyIGNvb2tpZSA9IHdpbmRvdy5kb2N1bWVudC5jb29raWU7XG4gICAgICAgICAgICAgICAgICB2YXIgbG9jYXRpb24gPSBjb29raWUuaW5kZXhPZihcbiAgICAgICAgICAgICAgICAgICAgICBlbmNvZGVVUklDb21wb25lbnQoc3RvcmFnZUtleSkgKyBcIj1cIik7XG4gICAgICAgICAgICAgICAgICBpZiAobG9jYXRpb24pIHtcbiAgICAgICAgICAgICAgICAgICAgICBzdG9yZWRMZXZlbCA9IC9eKFteO10rKS8uZXhlYyhjb29raWUuc2xpY2UobG9jYXRpb24pKVsxXTtcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfSBjYXRjaCAoaWdub3JlKSB7fVxuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIElmIHRoZSBzdG9yZWQgbGV2ZWwgaXMgbm90IHZhbGlkLCB0cmVhdCBpdCBhcyBpZiBub3RoaW5nIHdhcyBzdG9yZWQuXG4gICAgICAgICAgaWYgKHNlbGYubGV2ZWxzW3N0b3JlZExldmVsXSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgIHN0b3JlZExldmVsID0gdW5kZWZpbmVkO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHJldHVybiBzdG9yZWRMZXZlbDtcbiAgICAgIH1cblxuICAgICAgLypcbiAgICAgICAqXG4gICAgICAgKiBQdWJsaWMgQVBJXG4gICAgICAgKlxuICAgICAgICovXG5cbiAgICAgIHNlbGYubGV2ZWxzID0geyBcIlRSQUNFXCI6IDAsIFwiREVCVUdcIjogMSwgXCJJTkZPXCI6IDIsIFwiV0FSTlwiOiAzLFxuICAgICAgICAgIFwiRVJST1JcIjogNCwgXCJTSUxFTlRcIjogNX07XG5cbiAgICAgIHNlbGYubWV0aG9kRmFjdG9yeSA9IGZhY3RvcnkgfHwgZGVmYXVsdE1ldGhvZEZhY3Rvcnk7XG5cbiAgICAgIHNlbGYuZ2V0TGV2ZWwgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgcmV0dXJuIGN1cnJlbnRMZXZlbDtcbiAgICAgIH07XG5cbiAgICAgIHNlbGYuc2V0TGV2ZWwgPSBmdW5jdGlvbiAobGV2ZWwsIHBlcnNpc3QpIHtcbiAgICAgICAgICBpZiAodHlwZW9mIGxldmVsID09PSBcInN0cmluZ1wiICYmIHNlbGYubGV2ZWxzW2xldmVsLnRvVXBwZXJDYXNlKCldICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgbGV2ZWwgPSBzZWxmLmxldmVsc1tsZXZlbC50b1VwcGVyQ2FzZSgpXTtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKHR5cGVvZiBsZXZlbCA9PT0gXCJudW1iZXJcIiAmJiBsZXZlbCA+PSAwICYmIGxldmVsIDw9IHNlbGYubGV2ZWxzLlNJTEVOVCkge1xuICAgICAgICAgICAgICBjdXJyZW50TGV2ZWwgPSBsZXZlbDtcbiAgICAgICAgICAgICAgaWYgKHBlcnNpc3QgIT09IGZhbHNlKSB7ICAvLyBkZWZhdWx0cyB0byB0cnVlXG4gICAgICAgICAgICAgICAgICBwZXJzaXN0TGV2ZWxJZlBvc3NpYmxlKGxldmVsKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICByZXBsYWNlTG9nZ2luZ01ldGhvZHMuY2FsbChzZWxmLCBsZXZlbCwgbmFtZSk7XG4gICAgICAgICAgICAgIGlmICh0eXBlb2YgY29uc29sZSA9PT0gdW5kZWZpbmVkVHlwZSAmJiBsZXZlbCA8IHNlbGYubGV2ZWxzLlNJTEVOVCkge1xuICAgICAgICAgICAgICAgICAgcmV0dXJuIFwiTm8gY29uc29sZSBhdmFpbGFibGUgZm9yIGxvZ2dpbmdcIjtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIHRocm93IFwibG9nLnNldExldmVsKCkgY2FsbGVkIHdpdGggaW52YWxpZCBsZXZlbDogXCIgKyBsZXZlbDtcbiAgICAgICAgICB9XG4gICAgICB9O1xuXG4gICAgICBzZWxmLnNldERlZmF1bHRMZXZlbCA9IGZ1bmN0aW9uIChsZXZlbCkge1xuICAgICAgICAgIGlmICghZ2V0UGVyc2lzdGVkTGV2ZWwoKSkge1xuICAgICAgICAgICAgICBzZWxmLnNldExldmVsKGxldmVsLCBmYWxzZSk7XG4gICAgICAgICAgfVxuICAgICAgfTtcblxuICAgICAgc2VsZi5lbmFibGVBbGwgPSBmdW5jdGlvbihwZXJzaXN0KSB7XG4gICAgICAgICAgc2VsZi5zZXRMZXZlbChzZWxmLmxldmVscy5UUkFDRSwgcGVyc2lzdCk7XG4gICAgICB9O1xuXG4gICAgICBzZWxmLmRpc2FibGVBbGwgPSBmdW5jdGlvbihwZXJzaXN0KSB7XG4gICAgICAgICAgc2VsZi5zZXRMZXZlbChzZWxmLmxldmVscy5TSUxFTlQsIHBlcnNpc3QpO1xuICAgICAgfTtcblxuICAgICAgLy8gSW5pdGlhbGl6ZSB3aXRoIHRoZSByaWdodCBsZXZlbFxuICAgICAgdmFyIGluaXRpYWxMZXZlbCA9IGdldFBlcnNpc3RlZExldmVsKCk7XG4gICAgICBpZiAoaW5pdGlhbExldmVsID09IG51bGwpIHtcbiAgICAgICAgICBpbml0aWFsTGV2ZWwgPSBkZWZhdWx0TGV2ZWwgPT0gbnVsbCA/IFwiV0FSTlwiIDogZGVmYXVsdExldmVsO1xuICAgICAgfVxuICAgICAgc2VsZi5zZXRMZXZlbChpbml0aWFsTGV2ZWwsIGZhbHNlKTtcbiAgICB9XG5cbiAgICAvKlxuICAgICAqXG4gICAgICogUGFja2FnZS1sZXZlbCBBUElcbiAgICAgKlxuICAgICAqL1xuXG4gICAgdmFyIGRlZmF1bHRMb2dnZXIgPSBuZXcgTG9nZ2VyKCk7XG5cbiAgICB2YXIgX2xvZ2dlcnNCeU5hbWUgPSB7fTtcbiAgICBkZWZhdWx0TG9nZ2VyLmdldExvZ2dlciA9IGZ1bmN0aW9uIGdldExvZ2dlcihuYW1lKSB7XG4gICAgICAgIGlmICh0eXBlb2YgbmFtZSAhPT0gXCJzdHJpbmdcIiB8fCBuYW1lID09PSBcIlwiKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIllvdSBtdXN0IHN1cHBseSBhIG5hbWUgd2hlbiBjcmVhdGluZyBhIGxvZ2dlci5cIik7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgbG9nZ2VyID0gX2xvZ2dlcnNCeU5hbWVbbmFtZV07XG4gICAgICAgIGlmICghbG9nZ2VyKSB7XG4gICAgICAgICAgbG9nZ2VyID0gX2xvZ2dlcnNCeU5hbWVbbmFtZV0gPSBuZXcgTG9nZ2VyKFxuICAgICAgICAgICAgbmFtZSwgZGVmYXVsdExvZ2dlci5nZXRMZXZlbCgpLCBkZWZhdWx0TG9nZ2VyLm1ldGhvZEZhY3RvcnkpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBsb2dnZXI7XG4gICAgfTtcblxuICAgIC8vIEdyYWIgdGhlIGN1cnJlbnQgZ2xvYmFsIGxvZyB2YXJpYWJsZSBpbiBjYXNlIG9mIG92ZXJ3cml0ZVxuICAgIHZhciBfbG9nID0gKHR5cGVvZiB3aW5kb3cgIT09IHVuZGVmaW5lZFR5cGUpID8gd2luZG93LmxvZyA6IHVuZGVmaW5lZDtcbiAgICBkZWZhdWx0TG9nZ2VyLm5vQ29uZmxpY3QgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKHR5cGVvZiB3aW5kb3cgIT09IHVuZGVmaW5lZFR5cGUgJiZcbiAgICAgICAgICAgICAgIHdpbmRvdy5sb2cgPT09IGRlZmF1bHRMb2dnZXIpIHtcbiAgICAgICAgICAgIHdpbmRvdy5sb2cgPSBfbG9nO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGRlZmF1bHRMb2dnZXI7XG4gICAgfTtcblxuICAgIHJldHVybiBkZWZhdWx0TG9nZ2VyO1xufSkpO1xuIiwiaW1wb3J0IGxvZyBmcm9tICdsb2dsZXZlbCc7XHJcbmltcG9ydCB5YW5kZXhDbGFzcyBmcm9tICcuL2NzL3lhbmRleCc7XHJcblxyXG5sb2cuc2V0TGV2ZWwoXCJJTkZPXCIpOyAvL1wiVFJBQ0VcIiA+IFwiREVCVUdcIiA+IFwiSU5GT1wiID4gXCJXQVJOXCIgPiBcIkVSUk9SXCIgPiBcIlNJTEVOVFwiXHJcbi8vZm9yIGRlYnVnOlxyXG4vL3dpbmRvdy5sb2dnZXIgPSBsb2c7XHJcblxyXG5uZXcgeWFuZGV4Q2xhc3MoKS5pbml0KCk7Il19
