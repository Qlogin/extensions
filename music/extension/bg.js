(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _loglevel = require('loglevel');

var _loglevel2 = _interopRequireDefault(_loglevel);

var _storage = require('./storage');

var _storage2 = _interopRequireDefault(_storage);

var _tabs = require('./tabs');

var _tabs2 = _interopRequireDefault(_tabs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var DOUBLE_CLICK_TIME = 250;

var browserAction = function browserAction() {
    var _this = this;

    _classCallCheck(this, browserAction);

    this.titles = {
        na: 'Управление Яндекс.Музыкой/Радио: недоступно, нет открытых вкладок',
        musicPlay: 'Управление Яндекс.Музыкой: играет',
        radioPlay: 'Управление Яндекс.Радио: играет',
        musicPause: 'Управление Яндекс.Музыкой: пауза',
        radioPause: 'Управление Яндекс.Радио: пауза',
        musicWait: 'Управление Яндекс.Музыкой: в ожидании',
        radioWait: 'Управление Яндекс.Радио: в ожидании'
    };
    this.icons = {
        na: 'images/icon_38_2_na.png',
        musicPlay: 'images/icon_38_2_play.png',
        radioPlay: 'images/icon_38_2_play.png',
        musicPause: 'images/icon_38_2_pause.png',
        radioPause: 'images/icon_38_2_pause.png',
        musicWait: 'images/icon_38_2.png',
        radioWait: 'images/icon_38_2.png'
    };
    this.link = 'popup/popup.html';
    this.clickTimer = null;

    this.init = function () {
        _loglevel2.default.trace("browserAction.init()");
        switch (_storage2.default.get('global_mode')) {
            case 'popup':
                //если режим попап, то убираем слушатель клика по иконке, т.к. у нас выпадающее окно
                _this.removeClickListener();
                break;
            case 'button':
                //если режим кнопка, то попап не работает и добавляем слушатель клика по иконке
                _this.addClickListener();
                break;
        }
    };

    this.removeClickListener = function () {
        _loglevel2.default.trace("browserAction.removeClickListener()");
        chrome.browserAction.onClicked.removeListener(_this.clickHandler);
    };

    this.addClickListener = function () {
        _loglevel2.default.trace("browserAction.addClickListener()");
        chrome.browserAction.onClicked.addListener(_this.clickHandler);
    };

    this.clickHandler = function () {
        _loglevel2.default.trace("browserAction.clickHandler()");
        //с помощью таймера ловим даблклик если успеть кликнуть дважды до DOUBLE_CLICK_TIME мс
        if (_this.clickTimer) {
            window.clearTimeout(_this.clickTimer);
            _this.clickTimer = null;
            _tabs2.default.getActiveTab().send({ action: 'next' });
        } else _this.clickTimer = window.setTimeout(function () {
            _this.clickTimer = null;
            _tabs2.default.getActiveTab().send({ action: 'play' });
        }, DOUBLE_CLICK_TIME);
    };

    this.update = function () {
        _loglevel2.default.trace("browserAction.update()");

        //все вкладки закрыты
        if (!_tabs2.default.count()) {
            _loglevel2.default.trace("browserAction.update() all tabs closed, all set NA");
            chrome.browserAction.setIcon({ path: _this.icons.na });
            chrome.browserAction.setTitle({ title: _this.titles.na });
            //если открытых вкладок нет, то даже в режиме кнопки оставляем попап с возможностью открыть Я.М/Я.Р
            chrome.browserAction.setPopup({ popup: _this.link });
            return;
        }

        //есть активная вкладка
        var activeTab = _tabs2.default.getActiveTab();
        if (activeTab) {
            _loglevel2.default.trace("browserAction.update() set to " + (_storage2.default.get('global_mode') ? _this.link : "<null>"));

            //добавляем ссылку на попап в режиме попапа и удаляем ссылку в режиме кнопки
            switch (_storage2.default.get('global_mode')) {
                case 'popup':
                    chrome.browserAction.setPopup({ popup: _this.link });
                    break;
                case 'button':
                    chrome.browserAction.setPopup({ popup: "" });
                    break;
            }

            if (activeTab.player.isPlaying === true) {
                _loglevel2.default.trace("browserAction.update() icon set to playing");
                chrome.browserAction.setIcon({ path: _this.icons[activeTab.type + 'Play'] });
                chrome.browserAction.setTitle({ title: _this.titles[activeTab.type + 'Play'] });
            } else if (activeTab.player.isPlaying === false) {
                _loglevel2.default.trace("browserAction.update() icon set to paused");
                chrome.browserAction.setIcon({ path: _this.icons[activeTab.type + 'Pause'] });
                chrome.browserAction.setTitle({ title: _this.titles[activeTab.type + 'Pause'] });
            } else {
                _loglevel2.default.trace("browserAction.update() icon set to waiting");
                chrome.browserAction.setIcon({ path: _this.icons[activeTab.type + 'Wait'] });
                chrome.browserAction.setTitle({ title: _this.titles[activeTab.type + 'Wait'] });
            }
        }
    };

    this.closePopup = function () {
        _loglevel2.default.trace("browserAction.closePopup()");

        var popups = chrome.extension.getViews({ type: 'popup' });
        if (popups.length) {
            popups[0].close();
            _loglevel2.default.trace("browserAction.closePopup() closed");
        }
    };

    _loglevel2.default.trace("browserAction.constructor()");
    this.init();
};

exports.default = new browserAction();

},{"./storage":5,"./tabs":7,"loglevel":12}],2:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _loglevel = require('loglevel');

var _loglevel2 = _interopRequireDefault(_loglevel);

var _storage = require('./storage');

var _storage2 = _interopRequireDefault(_storage);

var _tabs = require('./tabs');

var _tabs2 = _interopRequireDefault(_tabs);

var _news = require('../../options_src/app/news');

var _news2 = _interopRequireDefault(_news);

var _port = require('../common/port');

var _port2 = _interopRequireDefault(_port);

var _notifications = require('./notifications');

var _notifications2 = _interopRequireDefault(_notifications);

var _browserAction = require('./browserAction');

var _browserAction2 = _interopRequireDefault(_browserAction);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

//for debug
//window.storage = storage;

var EXTERNAL_EXTENSION_ID = 'aofainoofnonhpfljipdaoagmjmhcidl';

var ext =
//список зарегистрированных в manifest.json команд и действия при их получении
//action - действие
//[confirm] - подтверждение {title, icon, storageOptionName}
//[beforeCb] - предусловие выполнения действия
//[afterCb]  - действия после отправки команды
function ext() {
    var _this = this;

    _classCallCheck(this, ext);

    this.commands = {
        player_next: { action: "next" },
        player_play: { action: "play" },
        player_prev: { action: "prev" },
        player_info: { action: "info" },
        player_volume_up: { action: "volumeup" },
        player_volume_toggle: { action: "volumeToggle" },
        player_volume_down: { action: "volumedown" },
        player_shuffle: { action: "shuffle" },
        player_repeat: {
            action: "repeat",
            afterCb: function afterCb() {
                if (_notifications2.default.notificationsGranted && _storage2.default.get("hotkey_repeat_notif")) {
                    var title = ["\nВключен повтор всех треков", "\nВыключен повтор", "\nВключен повтор трека"],
                        repeatMode = ~ ~_tabs2.default.getActiveTab().player.controls.repeat;
                    _notifications2.default.createToast('images/repeat_' + repeatMode + '.png', title[repeatMode]);
                }
            }
        },
        player_like: {
            action: "like",
            beforeCb: function beforeCb() {
                if (!_tabs2.default.getActiveTab().player.track.liked) return true;

                switch (_storage2.default.get("hotkey_like_action")) {
                    case 'remove':
                        return true;
                        break;
                    case 'none':
                        return false;
                        break;
                    case 'ask':
                        if (_notifications2.default.notificationsGranted) {
                            _notifications2.default.createConfirmation('like', 'Вы уверены что хотите убрать у трека отметку "Мне нравится"?', 'images/like-notif.png');
                            return false;
                        } else {
                            _loglevel2.default.warn("ext.onCommand() confirmation not granted, disabling confirmation");
                            return true;
                        }
                        break;
                }
            }
        },
        player_dislike: {
            action: "dislike",
            confirm: {
                title: function title() {
                    return _tabs2.default.getActiveTab().type != 'radio' ? 'Вы уверены что хотите отметить трек как "Не рекомендовать"?' : 'Вы уверены что хотите отметить трек как "Не нравится"?';
                },
                icon: function icon() {
                    return _tabs2.default.getActiveTab().type != 'radio' ? 'images/dontrec-notif.png' : 'images/dislike-notif.png';
                },
                storageOptionName: 'hotkey_dislike_action'
            }
        }
    };
    this.popupConnection = null;

    this.init = function () {
        _loglevel2.default.trace("ext.init()");

        //добавляем логгеру метод для трансляции уровня логирования в CS
        _loglevel2.default.cs = function () {
            var tab = _tabs2.default.getActiveTab();
            if (tab) tab.send({ action: "debug", level: _loglevel2.default.getLevel() });
        };

        //установка или обновление расширения
        _loglevel2.default.trace("ext.init() adding onInstalled event listener");
        chrome.runtime.onInstalled.addListener(_this.onInstalled);

        //добавляем слушатель событий, пришедших от CS скрипта из вкладки
        chrome.runtime.onConnect.addListener(_this.onConnect);

        //добавляем слушатель горячих клавищ
        chrome.commands.onCommand.addListener(_this.onCommand);

        //добавляем слушатель сообщений, пришедших из другого расширения
        chrome.runtime.onMessageExternal.addListener(_this.onMessageExternal);

        //задаем реакцию на событие изменения конфигурации
        _storage2.default.addOnStorageChangeCb(_this.onStorageChange);

        //проверка премиума
        if (_storage2.default.get('premium_key')) {
            _loglevel2.default.info("ext.init() Check premium key", _storage2.default.get('premium_key'), "for user", _storage2.default.get('user_id'));
            fetch("http://node.bbird.ru/api/?a=check&token=" + _storage2.default.get('premium_key') + "&user_id=" + _storage2.default.get('user_id'), { mode: 'cors' }).then(function (response) {
                if (response.status !== 200) {
                    ga('send', 'event', 'background', 'Fetch error: response status', response.status);
                    _loglevel2.default.error("ext.init() Wrong response status:", response.status);
                    return;
                }
                response.json().then(function (data) {
                    _loglevel2.default.trace("ext.init() Fetched data:", data);
                    if (data.result === false) {
                        _loglevel2.default.info("ext.init() Token rejected with error", data.error_code);
                        _storage2.default.set('premium_key', false);
                    } else {
                        if (data.new_token) {
                            _loglevel2.default.info("ext.init() Premium key updated");
                            _storage2.default.set('premium_key', data.new_token);
                        }
                        _loglevel2.default.info("ext.init() Premium key accepted");
                    }
                });
            }).catch(function (err) {
                ga('send', 'event', 'background', 'Fetch error: global error', err);
                _loglevel2.default.error("ext.init() Fetch error", err);
            });
        }

        //загружено расширение
        ga('send', 'event', 'background', 'init', _storage2.default.get('user_id'));
    };

    this.onStorageChange = function (e) {
        _loglevel2.default.trace("ext.onStorageChange() with key <%s>", e.key);
        switch (e.key) {
            case "store.settings.global_mode":
                _browserAction2.default.init();
                _browserAction2.default.update();
                break;

            case "store.settings.popup_show_var":
                _browserAction2.default.closePopup();
                break;
        }
        //при изменениях storage отправляем их в cs
        var tab = _tabs2.default.getActiveTab();
        if (tab !== false) tab.send({ action: 'storage', storage: _storage2.default.getAll() });
    };

    this.onConnect = function (port) {
        _loglevel2.default.trace("ext.onConnect() port %o", port);

        if (port.sender.tab && port.name == 'ymusic') {
            _loglevel2.default.trace("ext.onConnect() connect from CS from tab", port.sender.tab);
            var tab = _tabs2.default.getById(port.sender.tab.id);
            tab.addPort(port);
            //при открытии порта отправляем текущее состояние storage в cs
            tab.send({ action: 'storage', storage: _storage2.default.getAll() });
        }

        //соединение с extension'ом
        if (port.name == "popup") {
            _this.popupConnection = new _port2.default('popup', 'host', port);
            _this.popupConnection.addOnMessageCb(_this.onPopupMessage);
        }
    };

    this.onCommand = function (command) {
        _loglevel2.default.debug("ext.onCommand() with command <%s>", command);

        try {
            if (_tabs2.default.getActiveTab() === false) {
                _loglevel2.default.trace("ext.onCommand() there is no active tab");
                return;
            }
            if (!_this.commands[command]) {
                _loglevel2.default.trace("ext.onCommand() command unknown");
                return;
            }

            if (_this.commands[command].confirm && _storage2.default.get(_this.commands[command].confirm.storageOptionName)) {
                _loglevel2.default.debug("ext.onCommand() confirmation needed", _this.commands[command].confirm);
                if (_notifications2.default.notificationsGranted) _notifications2.default.createConfirmation(_this.commands[command].action, typeof _this.commands[command].confirm.title == 'function' ? _this.commands[command].confirm.title() : _this.commands[command].confirm.title, typeof _this.commands[command].confirm.icon == 'function' ? _this.commands[command].confirm.icon() : _this.commands[command].confirm.icon);else {
                    _loglevel2.default.warn("ext.onCommand() confirmation not granted, applying action");
                    _tabs2.default.getActiveTab().send({ action: _this.commands[command].action });
                    if (typeof _this.commands[command].afterCb == 'function') _this.commands[command].afterCb();
                }
            } else if (typeof _this.commands[command].beforeCb != 'function' || _this.commands[command].beforeCb()) {
                _loglevel2.default.debug("ext.onCommand() confirmation not needed");
                _tabs2.default.getActiveTab().send({ action: _this.commands[command].action });
                if (typeof _this.commands[command].afterCb == 'function') _this.commands[command].afterCb();
            }
        } catch (e) {
            utils.errorHandler(e);
        }
    };

    this.onInstalled = function (details) {
        _loglevel2.default.trace("ext.onInstalled()");
        try {
            //инициализируем хранилище настроек
            _storage2.default.init();

            //установка
            if (details.reason == "install") ga('send', 'event', 'background', 'installed', chrome.runtime.getManifest().version);
            //обновление (при условии, что версия изменилась)
            else if (details.reason == "update" && details.previousVersion != chrome.runtime.getManifest().version) {
                    ga('send', 'event', 'background', 'updated', details.previousVersion + '>' + chrome.runtime.getManifest().version);

                    //если в настройках стоит открытие страницы настроек на вкладке история изменений и в новостях есть описание
                    //данной версии - открываем страницу настроек автоматом
                    if (_storage2.default.get('autoopen') && _news2.default[chrome.runtime.getManifest().version]) chrome.tabs.create({ url: "/options/index.html" });
                }
        } catch (e) {
            utils.errorHandler(e);
        }
    };

    this.onMessageExternal = function (request, sender, sendResponse) {
        _loglevel2.default.trace("ext.onMessageExternal() request %o from sender %o", request, sender);
        if (sender.id != EXTERNAL_EXTENSION_ID) {
            _loglevel2.default.trace("ext.onMessageExternal() message from unknown sender, skipped");
            return;
        }

        _loglevel2.default.trace("ext.onMessageExternal() make some action");

        //    if (request.command == 'state')
        //    {
        //        sendResponse({result: true, state: bg.tabs.getActiveTab().player});
        //        return;
        //    }
        //
        //    this.onCommand("player_"+request.command);
        //    sendResponse({result: true});
    };

    this.onPopupDisconnect = function () {
        _loglevel2.default.trace("ext.onPopupDisconnect()");
        //до рефакторинга возникала проблема когда при изменении урла страницы не происходит событие onunload и это
        //приводит к ошибке, но зато происходит событие onDisconnect у порта, поэтому дублируем функционал закрытия
        //вкладки
        //tabs.shutdown(this.id);
        //this.popupConnection = null;
    };

    this.onPopupMessage = function (msg, port) {
        _loglevel2.default.trace("ext.onPopupMessage() with message %o from port %o", msg, port);
        //if (!msg.action)
        //{
        //    log.trace("ext.onPopupMessage() invalid message");
        //    return;
        //}
        //const actionListenerName = `on${msg.action.capitalize()}Action`;
        //
        //if (!this.hasOwnProperty(actionListenerName))
        //{
        //    log.trace("ext.onPopupMessage() listener of action <%s> not defined", msg.action);
        //    return;
        //}
        //
        //try {
        //    const isActive = (tabs.getActiveTab().id == this.id);
        //    log.trace("ext.onPopupMessage() calling action listener <%s>, is active tab <%o>", actionListenerName, isActive);
        //    this[actionListenerName].call(this, msg, isActive);
        //}
        //catch (e) { utils.errorHandler(e); }
    };

    _loglevel2.default.trace("ext.constructor()");
}

//канал для связи с popup'ом
;

exports.default = new ext();

},{"../../options_src/app/news":13,"../common/port":8,"./browserAction":1,"./notifications":3,"./storage":5,"./tabs":7,"loglevel":12}],3:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _loglevel = require('loglevel');

var _loglevel2 = _interopRequireDefault(_loglevel);

var _storage = require('./storage');

var _storage2 = _interopRequireDefault(_storage);

var _jqueryExtend = require('jquery-extend');

var _jqueryExtend2 = _interopRequireDefault(_jqueryExtend);

var _tabs = require('./tabs');

var _tabs2 = _interopRequireDefault(_tabs);

var _utils = require('../common/utils');

var _utils2 = _interopRequireDefault(_utils);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

//подразумевается, что в один момент времени возможно только одно уведомление от расширения

var notifications = function () {
    //флаг находится ли уведомление в стадии подтверждения

    //идентификатор

    //таймер автозакрытия уведомления

    //список доступных кнопок и действий по их нажатию

    function notifications() {
        var _this = this;

        _classCallCheck(this, notifications);

        this.buttons = {
            //2 возможные кнопки в режиме музыки
            music: [{
                value: function value() {
                    return _storage2.default.get('dislike');
                },
                action: 'dislike',
                title: 'Не рекомендовать',
                icon: 'images/dontrecommend.svg',
                confirm: {
                    title: 'Вы уверены что хотите отметить трек как "Не рекомендовать"?',
                    icon: 'images/dontrec-notif.png',
                    option: 'mr_dislike_action'
                }
            }, {
                value: function value() {
                    return _storage2.default.get('addto');
                },
                action: 'like',
                title: ['Убрать из "Моей музыки"', 'Добавить в "Мою музыку"'],
                icon: ['images/like.svg', 'images/unlike.svg'],
                invParam: 'liked'
            }, {
                value: function value() {
                    return _storage2.default.get('next');
                },
                action: 'next',
                title: 'Следующий трек',
                icon: 'images/ya_next.svg'
            }],
            //3 возможные кнопки в режиме музыки-радио
            musicradio: [{
                value: function value() {
                    return _storage2.default.get('mr_dislike');
                },
                action: 'dislike',
                title: 'Не нравится',
                icon: 'images/radio_dislike.svg',
                confirm: {
                    title: 'Вы уверены что хотите отметить трек как "Не нравится"?',
                    icon: 'images/dislike-notif.png',
                    option: 'mr_dislike_action'
                }
            }, {
                value: function value() {
                    return _storage2.default.get('mr_addto');
                },
                action: 'like',
                title: ['Убрать из "Моей музыки"', 'Добавить в "Мою музыку"'],
                icon: ['images/like.svg', 'images/unlike.svg'],
                invParam: 'liked'
            }, {
                value: function value() {
                    return _storage2.default.get('mr_next');
                },
                action: 'next',
                title: 'Следующий трек',
                icon: 'images/ya_next.svg'
            }],
            //3 возможные кнопки в режиме радио
            radio: [{
                value: function value() {
                    return _storage2.default.get('radio_dislike');
                },
                action: 'dislike',
                title: 'Не нравится',
                icon: 'images/radio_dislike.svg',
                confirm: {
                    title: 'Вы уверены что хотите отметить трек как "Не нравится"?',
                    icon: 'images/dislike-notif.png',
                    option: 'radio_dislike_action'
                }
            }, {
                value: function value() {
                    return _storage2.default.get('radio_like');
                },
                action: 'like',
                title: ['Убрать отметку "Нравится"', 'Нравится'],
                icon: ['images/like.svg', 'images/radio_like.svg'],
                invParam: 'liked'
            }, {
                value: function value() {
                    return _storage2.default.get('radio_next');
                },
                action: 'next',
                title: 'Следующий трек',
                icon: 'images/ya_next.svg'
            }]
        };
        this.confirmButtons = [{ title: 'Да', confirm: true }, { title: 'Нет' }];
        this.confirmTimeout = 5000;
        this.notificationsGranted = false;
        this.autoCloseTimer = null;
        this.autoCloseTimerToast = null;
        this.id = null;
        this.toastId = null;
        this.isConfirm = false;
        this.playerMode = null;

        this.onClosed = function (id, byUser) {
            _loglevel2.default.debug("notifications.onClosed() with id <%s>, byUser <%o>", id, byUser);
            if (_this.id && id == _this.id) {
                clearTimeout(_this.autoCloseTimer);
                _this.id = null;
            }
            if (_this.toastId && id == _this.toastId) {
                clearTimeout(_this.autoCloseTimerToast);
                _this.toastId = null;
            }
        };

        this.clear = function (id) {
            _loglevel2.default.debug("notifications.clear()");
            return new Promise(function (resolve, reject) {
                if (!id) resolve();
                //вызовет событие onClosed
                chrome.notifications.clear(id, function () {
                    return resolve();
                });
            });
        };

        this.createConfirmation = function (action, question, icon) {
            _loglevel2.default.debug("notifications.createConfirmation() with action <%s>, question <%s>, icon <%s>", action, question, icon);

            var tab = _tabs2.default.getActiveTab();

            clearTimeout(_this.autoCloseTimer);

            if (!tab) {
                _loglevel2.default.debug("notifications.createConfirmation() there is no active tabs");
                _this.clear(_this.id);
                return;
            }

            var btns = [];
            _this.confirmButtons.forEach(function (button) {
                btns.push({ title: button.title });
            });

            //убираем уведомление и далее создаем новое
            _this.clear(_this.id).then(function () {
                _this._createNotification(icon, question, btns, _this.autoCloseTimer, _this.confirmTimeout).then(function (id) {
                    _this.confirmAction = action;
                    _this.isConfirm = true;
                    _this.id = id;
                });
            });
        };

        this.onClicked = function (id) {
            _loglevel2.default.trace("notifications.onClicked() with id <%s>", id);
            if (!_tabs2.default.getActiveTab()) _loglevel2.default.trace("notifications.onClicked() there is no active tabs");else if (_storage2.default.get('focus')) //if (id.indexOf("confirm_") !== 0 && storage.get('focus'))
                {
                    _loglevel2.default.trace("notifications.onClicked() focusing window after click");
                    chrome.tabs.update(_tabs2.default.getActiveTab().id, { active: true });
                }
            _this.clear(id);
        };

        this.onButtonClicked = function (id, index) {
            _loglevel2.default.debug("notifications.onButtonClicked() with id <%s>, index <%d>", id, index);

            var tab = _tabs2.default.getActiveTab();
            if (!tab) {
                _loglevel2.default.debug("notifications.onButtonClicked() there is no active tabs");
                _this.clear(id);
                return;
            }

            clearTimeout(_this.autoCloseTimer);

            if (_this.isConfirm) {
                if (!_this.confirmButtons[index].confirm) _loglevel2.default.debug("notifications.onButtonClicked() confirm canceled");else {
                    _loglevel2.default.debug("notifications.onButtonClicked() confirm approved");
                    tab.send({ action: _this.confirmAction });
                }
            } else {
                var button = _this.buttons[_this.playerMode].filter(function (item) {
                    return item.value();
                })[index];

                _loglevel2.default.debug("notifications.onButtonClicked() regular button click on button %o", button);

                if (button.confirm !== undefined && _storage2.default.get(button.confirm.option)) {
                    _loglevel2.default.debug("notifications.onButtonClicked() creating confirmation %o of action <%s>", button.confirm, button.action);
                    _this.createConfirmation(button.action, button.confirm.title, button.confirm.icon);
                } else {
                    _loglevel2.default.debug("notifications.onButtonClicked() sending action <%s> to active tab", button.action);
                    tab.send({ action: button.action });
                }
            }
            _this.clear(id);
        };

        _loglevel2.default.debug("notifications.constructor()");

        //проверка прав на уведомления
        chrome.notifications.getPermissionLevel(function (level) {
            if (level == 'granted') {
                _loglevel2.default.debug("notifications.constructor() notifications granted");
                _this.notificationsGranted = true;

                //слушатель кликов по уведомлению
                chrome.notifications.onClicked.addListener(_this.onClicked);
                //слушатель кликов по кнопкам уведомления
                chrome.notifications.onButtonClicked.addListener(_this.onButtonClicked);
                //слушатель закрытия уведомления
                chrome.notifications.onClosed.addListener(_this.onClosed);
            } else _loglevel2.default.warn("notifications.constructor() notifications denied");
        });

        this.create = this.create.bind(this);
    }
    //тип плеера

    //идентификатор

    //флаг разрешенных уведомлений


    _createClass(notifications, [{
        key: '_createNotification',
        value: function _createNotification(icon, msg) {
            var buttons = arguments.length <= 2 || arguments[2] === undefined ? [] : arguments[2];
            var timerVar = arguments[3];

            var _this2 = this;

            var timer = arguments.length <= 4 || arguments[4] === undefined ? _storage2.default.get('time') * 1000 : arguments[4];
            var notifId = arguments.length <= 5 || arguments[5] === undefined ? _utils2.default.guid() : arguments[5];

            _loglevel2.default.debug("notifications._createNotification() with message <%s> and icon <%s>", msg, icon);
            return new Promise(function (resolve, reject) {
                if (!_this2.notificationsGranted) {
                    _loglevel2.default.debug("notifications._createNotification() notifications not granted");
                    resolve();
                }

                //создаем тело уведомления
                var options = {
                    title: msg,
                    iconUrl: icon,
                    type: 'basic',
                    message: ''
                };
                if (buttons && buttons.length) options.buttons = buttons;
                _loglevel2.default.debug("notifications._createNotification() creating notification, options %o", options);
                chrome.notifications.create(notifId, options, function (id) {
                    //запускаем таймер актозакрытия по таймеру
                    timerVar = setTimeout(function () {
                        _this2.clear(id);
                    }, timer);

                    //возвращаем идентификатор
                    resolve(id);
                });
            });
        }
    }, {
        key: 'create',
        value: function create(player, playerMode) {
            var _this3 = this;

            _loglevel2.default.debug("notifications.create() with player %o and playerMode <%s>", player, playerMode);

            //убираем уведомление и далее создаем новое
            this.clear(this.id).then(function () {
                //создаем кнопки
                var btns = [];
                _this3.buttons[playerMode].filter(function (item) {
                    return item.value();
                }).forEach(function (item) {
                    btns.push({
                        title: !item.invParam ? item.title : item.title[~ ~!player.track[item.invParam]],
                        iconUrl: !item.invParam ? item.icon : item.icon[~ ~!player.track[item.invParam]]
                    });
                });

                _this3._createNotification(player.getCoverURL("80x80"), player.getArtists() + ' - ' + player.track.title + (_storage2.default.get('popup_show_version') && player.track.version ? ' (' + player.track.version + ')' : ''), btns, _this3.autoCloseTimer).then(function (id) {
                    _this3.playerMode = playerMode;
                    _this3.isConfirm = false;
                    _this3.id = id;
                });
            });
        }
    }, {
        key: 'createToast',
        value: function createToast(icon, msg) {
            var _this4 = this;

            _loglevel2.default.debug("notifications.createToast() with message <%s> and icon <%s>", msg, icon);

            //убираем уведомление и далее создаем новое
            this.clear(this.toastId).then(function () {
                _this4._createNotification(icon, msg, null, _this4.autoCloseTimerToast).then(function (id) {
                    _this4.toastId = id;
                });
            });
        }
    }]);

    return notifications;
}();

exports.default = new notifications();

},{"../common/utils":9,"./storage":5,"./tabs":7,"jquery-extend":10,"loglevel":12}],4:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _loglevel = require('loglevel');

var _loglevel2 = _interopRequireDefault(_loglevel);

var _jqueryExtend = require('jquery-extend');

var _jqueryExtend2 = _interopRequireDefault(_jqueryExtend);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var player = function player() {
    var _this = this;

    _classCallCheck(this, player);

    this.isPlaying = false;
    this.isAdvert = false;
    this.track = {
        album: null,
        artists: null,
        cover: null,
        disliked: null,
        liked: null,
        link: null,
        title: null,
        version: null
    };
    this.progress = {
        position: null,
        duration: null,
        loaded: null
    };
    this.source = {
        title: null,
        link: null,
        type: null,
        cover: null,
        owner: null
    };
    this.controls = {
        states: {
            dislike: null,
            index: null,
            like: null,
            next: null,
            prev: null,
            repeat: null,
            shuffle: null
        },
        shuffle: null,
        repeat: null,
        volume: null
    };
    this.playlist = {
        prev: null,
        list: null,
        index: null,
        next: null
    };

    this.getArtists = function () {
        _loglevel2.default.trace("player.getArtists()");
        return _this.track.artists ? _this.track.artists.map(function (i) {
            return i.title;
        }).join(", ") : null;
    };

    this.getCoverURL = function (size) {
        var ctx = arguments.length <= 1 || arguments[1] === undefined ? _this : arguments[1];

        _loglevel2.default.trace("player.getCoverURL() with size <%s>", size);

        var _cover = 'https://music.yandex.ru/blocks/playlist-cover-stack/playlist-cover_no_cover3.png';
        var cover = _cover;

        if (!ctx.track) return _cover;

        if (ctx.track.cover) cover = ctx.track.cover;else if (ctx.track.album && ctx.track.album.cover) cover = ctx.track.album.cover;else if (ctx.source.cover) cover = ctx.source.cover;

        if ((typeof cover === 'undefined' ? 'undefined' : _typeof(cover)) == 'object') cover = cover.length ? cover[0] : _cover;

        cover = cover.replace("%%", size);
        if (cover.indexOf("http") == -1) cover = "https://" + cover;

        return cover;
    };

    this.update = function (data) {
        var deep = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];

        _loglevel2.default.trace("player.update() with data %o", data);
        if (deep) (0, _jqueryExtend2.default)(deep, _this, data);else Object.keys(data).forEach(function (key) {
            _this[key] = data[key];
        });
        _loglevel2.default.trace("player.update() updated player %o", _this);
    };
};

exports.default = player;

},{"jquery-extend":10,"loglevel":12}],5:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _utils = require('../common/utils');

var _utils2 = _interopRequireDefault(_utils);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var storage = function storage() {
    var _this = this;

    _classCallCheck(this, storage);

    this.defaults = {
        addto: true,
        mr_addto: true,
        radio_like: true,
        dislike: false,
        mr_dislike: true,
        radio_dislike: true,
        next: true,
        mr_next: false,
        radio_next: false,
        focus: true,
        time: 4,
        type: 'hotk_tr',
        autoopen: true,
        hotkey_like_action: 'ask',
        hotkey_dislike_action: true,
        hotkey_repeat_notif: false,
        m_dislike_action: true,
        mr_dislike_action: true,
        radio_dislike_action: true,
        new_tab_pinned: false,
        global_mode: 'popup',
        popup_show_var: 'full',
        popup_show_version: true,
        popup_show_r_sh: true,
        popup_volume_click_toggle: "0",
        close_alert: true,
        premium_key: false,
        user_id: function user_id() {
            return _utils2.default.guid();
        }
    };

    this.onStorageChange = function (e) {
        if (_this.onStorageChangeCb) _this.onStorageChangeCb(e);
    };

    this.onStorageChangeCb = function (request) {};

    this.addOnStorageChangeCb = function (cb) {
        _this.onStorageChangeCb = cb;
    };

    this.getAll = function () {
        var removePrefix = arguments.length <= 0 || arguments[0] === undefined ? false : arguments[0];

        var all = {};
        for (var i = 0; i < localStorage.length; i++) {
            var key = localStorage.key(i);
            if (key.indexOf("store.settings") != -1) all[removePrefix ? key.replace("store.settings.", "") : key] = JSON.parse(localStorage.getItem(key));
        }
        return all;
    };

    this.get = function (key) {
        var value = localStorage.getItem("store.settings." + key);
        return value === null ? _this.defaults[key] : JSON.parse(value);
    };

    this.set = function (key, value) {
        if (!_this.defaults.hasOwnProperty(key)) //this.defaults[key] === undefined)
            return;
        return localStorage.setItem("store.settings." + key, JSON.stringify(value));
    };

    this.init = function () {
        Object.keys(_this.defaults).forEach(function (key) {
            if (localStorage.getItem("store.settings." + key) === null) _this.set(key, typeof _this.defaults[key] == "function" ? _this.defaults[key]() : _this.defaults[key]);
        });
    };

    this.clear = function () {
        localStorage.clear();
    };

    window.addEventListener("storage", this.onStorageChange);
};

exports.default = new storage();

},{"../common/utils":9}],6:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _loglevel = require('loglevel');

var _loglevel2 = _interopRequireDefault(_loglevel);

var _tabs = require('./tabs');

var _tabs2 = _interopRequireDefault(_tabs);

var _player = require('./player');

var _player2 = _interopRequireDefault(_player);

var _ext = require('../bg/ext');

var _ext2 = _interopRequireDefault(_ext);

var _browserAction = require('./browserAction');

var _browserAction2 = _interopRequireDefault(_browserAction);

var _notifications = require('./notifications');

var _notifications2 = _interopRequireDefault(_notifications);

var _storage = require('./storage');

var _storage2 = _interopRequireDefault(_storage);

var _utils = require('../common/utils');

var _utils2 = _interopRequireDefault(_utils);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

String.prototype.capitalize = function () {
    return this.charAt(0).toUpperCase() + this.slice(1);
};
Object.prototype.filter = function (predicate) {
    var result = {};
    for (var key in this) {
        if (this.hasOwnProperty(key) && predicate(this[key])) result[key] = this[key];
    }return result;
};

var tab =
//плеер

//тип вкладки: радио или музыка

//идентификатор
function tab(tabId, tabType) {
    var _this = this;

    _classCallCheck(this, tab);

    this.timer = null;
    this.id = null;
    this.focused = false;
    this.type = null;
    this.openedTime = null;
    this.player = null;
    this.csConnection = null;

    this.aliveCheck = function () {
        _loglevel2.default.trace("tab.aliveCheck()");

        chrome.tabs.get(_this.id, function (tab) {
            if (chrome.runtime.lastError) {
                _loglevel2.default.trace("tab", _this.id, "removed due it's unavailability");
                _loglevel2.default.error("Tab closed via it's unavailability while alive check");
                //вкладка не найдена, удаляем вкладку (таймер будет очищен в методе shutdown)
                _tabs2.default.shutdown(_this.id);
            } else {
                //TODO: надо добавить некую дополнительную логику проверки вкладки на живучесть js
            }
        });
    };

    this.addPort = function (port) {
        _loglevel2.default.trace("tab.addPort() with port %o", port);
        _this.csConnection = port;
        _this.csConnection.onMessage.addListener(_this.onMessage);
        _this.csConnection.onDisconnect.addListener(_this.onDisconnect);
    };

    this.onDisconnect = function () {
        _loglevel2.default.trace("tab.onDisconnect()");
        //до рефакторинга возникала проблема когда при изменении урла страницы не происходит событие onunload и это
        //приводит к ошибке, но зато происходит событие onDisconnect у порта, поэтому дублируем функционал закрытия
        //вкладки
        _loglevel2.default.error("Tab closed via cs port disconnected");
        _tabs2.default.shutdown(_this.id);
        //this.csConnection = null;
    };

    this.onMessage = function (msg, port) {
        _loglevel2.default.trace("tab.onMessage() with message %o from port %o", msg, port);

        if (!msg.action) {
            _loglevel2.default.trace("tab.onMessage() invalid message");
            return;
        }
        var actionListenerName = 'on' + msg.action.capitalize() + 'Action';

        if (!_this.hasOwnProperty(actionListenerName)) {
            _loglevel2.default.trace("tab.onMessage() listener of action <%s> not defined", msg.action);
            return;
        }

        try {
            var isActive = _tabs2.default.getActiveTab().id == _this.id;
            _loglevel2.default.trace("tab.onMessage() calling action listener <%s>, is active tab <%o>", actionListenerName, isActive);
            _this[actionListenerName].call(_this, msg, isActive);
        } catch (e) {
            _utils2.default.errorHandler(e);
        }
    };

    this.send = function (data) {
        _loglevel2.default.trace("tab.send() with data %o", data);
        if (_this.csConnection) try {
            _this.csConnection.postMessage(data);
        } catch (e) {
            _loglevel2.default.error("tab.send() error", e);
            _this.csConnection = null;
        }
    };

    this.onFullstateAction = function (msg, isActive) {
        _loglevel2.default.trace("tab.onFullstate() with message %o, is active tab %o", msg, isActive);

        _storage2.default.set("user_id", msg.user.uid ? msg.user.uid : msg.user.did);

        _this.player.update({
            'track': msg.track,
            'progress': msg.progress,
            'source': msg.source,
            'controls': msg.controls,
            'playlist': msg.playlist,
            'isPlaying': msg.isPlaying
        });
        if (isActive) {
            //обновляем иконку на панели браузера
            _browserAction2.default.update();

            if (_ext2.default.popupConnection) {
                //old
                _ext2.default.popupConnection.send(['track', 'progress', 'source', 'controls', 'playlist', 'isPlaying']);
                //new
                _ext2.default.popupConnection.send({ action: 'track', payload: msg.track });
                _ext2.default.popupConnection.send({ action: 'progress', payload: msg.progress });
                _ext2.default.popupConnection.send({ action: 'source', payload: _extends({}, msg.source, { tabType: _this.type }) });
                _ext2.default.popupConnection.send({ action: 'controls', payload: msg.controls });
                _ext2.default.popupConnection.send({ action: 'playlist', payload: msg.playlist });
                _ext2.default.popupConnection.send({ action: 'isPlaying', payload: msg.isPlaying });
                //этот параметр мы храним в состоянии фоновой страницы, т.к. контент-страница не имеет метода,
                //возвращающего флаг реклама сейчас или нет и обновляется только через onAdvertAction, полученного
                //от контент-страницы.
                _ext2.default.popupConnection.send({ action: 'advert', payload: _this.player.isAdvert });
                _loglevel2.default.trace("tab.onFullstate() event sent to popup");
            }
        }
    };

    this.onStateAction = function (msg, isActive) {
        _loglevel2.default.trace("tab.onState() with message %o, is active tab %o", msg, isActive);
        _this.player.update({ 'isPlaying': msg.isPlaying });
        if (isActive) {
            //обновляем иконку на панели браузера
            _browserAction2.default.update();

            if (_ext2.default.popupConnection) {
                //old
                _ext2.default.popupConnection.send(['isPlaying']);
                //new
                _ext2.default.popupConnection.send({ action: 'isPlaying', payload: msg.isPlaying });
                _loglevel2.default.trace("tab.onState() event sent to popup");
            }
        }
    };

    this.onShutdownAction = function (msg, isActive) {
        _loglevel2.default.trace("tab.onShutdown() with message %o, is active tab %o", msg, isActive);
        _loglevel2.default.error("Tab closed via cs shutdown action");
        _tabs2.default.shutdown(_this.id);
    };

    this.onFocusAction = function (msg, isActive) {
        _loglevel2.default.trace("tab.onFocus() with message %o, is active tab %o", msg, isActive);
        _this.focused = true;
    };

    this.onBlurAction = function (msg, isActive) {
        _loglevel2.default.trace("tab.onBlur() with message %o, is active tab %o", msg, isActive);
        _this.focused = false;
    };

    this.onVolumeAction = function (msg, isActive) {
        _loglevel2.default.trace("tab.onVolume() with message %o, is active tab %o", msg, isActive);
        _this.player.update({ 'controls': { volume: msg.volume } }, true);
        if (isActive && _ext2.default.popupConnection) {
            //old
            _ext2.default.popupConnection.send(['controls']);
            //new
            _ext2.default.popupConnection.send({ action: 'volume', payload: msg.volume });
            _loglevel2.default.trace("tab.onVolume() event sent to popup");
        }
    };

    this.onAdvertAction = function (msg, isActive) {
        _loglevel2.default.trace("tab.onAdvertAction() with message %o, is active tab %o", msg, isActive);
        _this.player.update({ 'isAdvert': msg.state });
        if (isActive && _ext2.default.popupConnection) {
            _ext2.default.popupConnection.send({ action: 'advert', payload: msg.state });
            _loglevel2.default.trace("tab.onAdvertAction() event sent to popup");
        }
    };

    this.onProgressAction = function (msg, isActive) {
        _loglevel2.default.trace("tab.onProgress() with message %o, is active tab %o", msg, isActive);
        _this.player.update({ 'progress': msg.progress });
        if (isActive && _ext2.default.popupConnection) {
            //old
            _ext2.default.popupConnection.send(['progress']);
            //new
            _ext2.default.popupConnection.send({ action: 'progress', payload: msg.progress });
            _loglevel2.default.trace("tab.onProgress() event sent to popup");
        }
    };

    this.onTrackslistAction = function (msg, isActive) {
        _loglevel2.default.trace("tab.onTrackslist() with message %o, is active tab %o", msg, isActive);

        //плейлист очищен
        if (msg.playlist.list.length == 0) {
            _loglevel2.default.trace("tab.onTrackslist() playlist cleared, clearing player");
            //при очистке плеера сохраняем значение громкости
            var curVolume = _this.player.controls.volume;
            _this.player = new _player2.default();
            _this.player.update({ 'controls': { volume: curVolume } }, true);
            if (isActive && _ext2.default.popupConnection) {
                //old
                _ext2.default.popupConnection.send(['track', 'progress', 'source', 'controls', 'playlist', 'isPlaying']);
                //new
                _ext2.default.popupConnection.send({ action: 'track', payload: msg.track });
                _ext2.default.popupConnection.send({ action: 'progress', payload: msg.progress });
                _ext2.default.popupConnection.send({ action: 'source', payload: _extends({}, msg.source, { tabType: _this.type }) });
                _ext2.default.popupConnection.send({ action: 'controls', payload: msg.controls });
                _ext2.default.popupConnection.send({ action: 'playlist', payload: msg.playlist });
                _ext2.default.popupConnection.send({ action: 'isPlaying', payload: msg.isPlaying });
                _loglevel2.default.trace("tab.onTrackslist() all events sent to popup");
            }
            //обновляем иконку на панели браузера
            _browserAction2.default.update();
        }
        //обновление плейлиста
        else {
                _this.player.update({ 'playlist': msg.playlist });
                if (isActive && _ext2.default.popupConnection) {
                    //old
                    _ext2.default.popupConnection.send(['playlist']);
                    //new
                    _ext2.default.popupConnection.send({ action: 'playlist', payload: msg.playlist });
                    _loglevel2.default.trace("tab.onTrackslist() event sent to popup");
                }
            }
    };

    this.onControlsAction = function (msg, isActive) {
        _loglevel2.default.trace("tab.onControls() with message %o, is active tab %o", msg, isActive);
        _this.player.update({ 'controls': msg.controls });
        if (isActive && _ext2.default.popupConnection) {
            //old
            _ext2.default.popupConnection.send(['controls']);
            //new
            _ext2.default.popupConnection.send({ action: 'controls', payload: msg.controls });
            _loglevel2.default.trace("tab.onControls() event sent to popup");
        }
    };

    this.onTrackAction = function (msg, isActive) {
        _loglevel2.default.trace("tab.onTrack() with message %o, is active tab %o", msg, isActive, _this.player);
        var isInitial = _this.player === null;

        _this.player.update({
            'track': msg.track,
            'progress': msg.progress,
            'source': msg.source
        });
        if (isActive && _ext2.default.popupConnection) {
            //old
            _ext2.default.popupConnection.send(['track', 'progress', 'source']);
            //new
            _ext2.default.popupConnection.send({ action: 'track', payload: msg.track });
            _ext2.default.popupConnection.send({ action: 'progress', payload: msg.progress });
            _ext2.default.popupConnection.send({ action: 'source', payload: msg.source });
            _loglevel2.default.trace("tab.onTrack() event sent to popup");
        }
        if (!isActive) {
            _loglevel2.default.trace("tab.onTrack() tab is not active, don't create notification");
            return;
        }
        var type = _storage2.default.get('type'); //режим показа уведомлений

        if (type == "none" || type == "hotk") {
            _loglevel2.default.trace("tab.onTrack() don't create notification due settings");
            return false;
        }
        if (isInitial) {
            _loglevel2.default.debug("tab.onTrack() don't create notification on initial");
            return;
        }
        if (msg.secondary) {
            _loglevel2.default.trace("tab.onTrack() don't create notification due secondary action");
            return false;
        }
        //если открыт попап или фокус на текущей вкладке плеера - не показываем нотификацю
        if (chrome.extension.getViews({ type: 'popup' }).length > 0 || _tabs2.default.getActiveTab().focused) {
            _loglevel2.default.trace("tab.onTrack() don't create notification due focused or popup opened");
            return false;
        }

        _loglevel2.default.trace("tab.onTrack() creating notification");
        var buttonsType = _this.type;
        if (_this.type == 'music' && _this.player.source.type == 'radio') buttonsType += 'radio';
        _notifications2.default.create(_this.player, buttonsType);
    };

    this.onInfoAction = function (msg, isActive) {
        _loglevel2.default.trace("tab.onInfo() with message %o, is active tab %o", msg, isActive);

        if (!msg.track) {
            _loglevel2.default.trace("tab.onInfo() empty data");
            return;
        }
        if (!isActive) {
            _loglevel2.default.trace("tab.onInfo() tab is not active, don't create notification");
            return;
        }

        var type = _storage2.default.get('type'); //режим показа уведомлений

        if (type == "none" || type == "tr") {
            _loglevel2.default.trace("tab.onInfo() don't create notification due settings");
            return false;
        }

        _loglevel2.default.trace("tab.onTrack() creating notification");
        var buttonsType = _this.type;
        if (_this.type == 'music' && _this.player.source.type == 'radio') buttonsType += 'radio';
        _notifications2.default.create(_this.player, buttonsType);
    };

    _loglevel2.default.trace("tab.constructor() with id <%d> and type <%s>", tabId, tabType);

    this.id = tabId;
    this.openedTime = new Date().getTime();
    this.type = tabType;
    //раз в секунду проверяем жива ли вкладка
    this.timer = setInterval(this.aliveCheck, 1000);
    //инициализируем плеер
    this.player = new _player2.default();
}
//порт для связи с CS скриптом на странице вкладки

//время создания вкладки

//есть ли фокус на вкладке

//таймер мониторящий живучесть вкладки
;

exports.default = tab;

},{"../bg/ext":2,"../common/utils":9,"./browserAction":1,"./notifications":3,"./player":4,"./storage":5,"./tabs":7,"loglevel":12}],7:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _ext = require('./ext');

var _ext2 = _interopRequireDefault(_ext);

var _loglevel = require('loglevel');

var _loglevel2 = _interopRequireDefault(_loglevel);

var _utils = require('../common/utils');

var _utils2 = _interopRequireDefault(_utils);

var _tab = require('./tab');

var _tab2 = _interopRequireDefault(_tab);

var _browserAction = require('./browserAction');

var _browserAction2 = _interopRequireDefault(_browserAction);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var tabs = function tabs() {
    var _this = this;

    _classCallCheck(this, tabs);

    this.list = {};

    this.addTabsListeners = function () {
        _loglevel2.default.trace("tabs.addTabsListeners()");
        //событие обновления вкладки
        chrome.tabs.onUpdated.addListener(_this.onUpdated);
        //событие закрытия вкладки
        chrome.tabs.onRemoved.addListener(_this.onRemoved);
    };

    this.onRemoved = function (tabId, removeInfo) {
        _loglevel2.default.trace("tabs.onRemoved() on tab <%d>, removeInfo %o", tabId, removeInfo);
        try {
            if (_this.getById(tabId)) {
                _loglevel2.default.trace("tabs.onRemoved() removing tab from list");
                _loglevel2.default.error("Tab closed via tabs onRemoved event");
                _this.shutdown(tabId);
            }
        } catch (e) {
            _utils2.default.errorHandler(e);
        }
    };

    this.onUpdated = function (tabId, changeInfo, tab) {
        _loglevel2.default.trace("tabs.onUpdated() on tab <%d>, changeInfo %o, tab %o", tabId, changeInfo, tab);

        if (!('status' in changeInfo || 'url' in changeInfo)) {
            _loglevel2.default.trace("onUpdated() not interested change event", changeInfo);
            return;
        }

        //проверяем совпадение URL'а
        var URL = _utils2.default.isUrlMatch(tab.url);
        _loglevel2.default.trace("tabs.onUpdated() URL", URL);
        if (changeInfo.status != 'complete') {
            _loglevel2.default.trace("tabs.onUpdated() URL loading is not completed");
            return;
        }
        if (URL === false) {
            if (_this.getById(tabId)) {
                _loglevel2.default.error("tabs.onUpdated() URL changed to non-matched, removing it from list");
                _loglevel2.default.error("Tab closed via URL changed to non-matched while tabs onUpdated event");
                _this.shutdown(tabId);
            }
            return;
        }

        //новая вкладка, добавляем в список
        if (!_this.getById(tabId)) {
            _loglevel2.default.trace("tabs.onUpdated() tab URL valid and not found in list, adding");
            //добавляем вкладку в список
            _this.add(tabId, URL.isMusic ? 'music' : 'radio');
            //делаем инъекцию
            _utils2.default.injectScript(tabId, "extension/cs.js");
            //обновляем иконку на панели браузера
            _browserAction2.default.update();
        }
    };

    this.shutdown = function (tabId) {
        _loglevel2.default.trace("tabs.shutdown() on <%d>", tabId);
        //если закрываем текущую вкладку, закрываем попап
        if (_this.getActiveTab().id == tabId) {
            _loglevel2.default.trace("tabs.shutdown() closing popup");
            _browserAction2.default.closePopup();
        }

        //удаляем вкладку
        if (_this.list[tabId]) {
            _loglevel2.default.trace("tabs.shutdown() closing tab");
            //перед удалением очищаем таймер вкладки, который мониторил ее живучесть
            clearInterval(_this.list[tabId].timer);
            //удаляем
            delete _this.list[tabId];
        }

        //обновляем иконку на панели браузера
        _browserAction2.default.update();
    };

    this.getById = function (tabId) {
        _loglevel2.default.trace("tabs.getById() on <%d>", tabId);

        _loglevel2.default.trace("tabs.getById() returns %o", _this.list[tabId]);
        return _this.list[tabId]; //tab or undefined
    };

    this.getActiveTab = function () {
        _loglevel2.default.trace("tabs.getActiveTab() from list %o", _this.list);

        if (_this.count() == 1) {
            _loglevel2.default.trace("tabs.getActiveTab() returns %o", _this.list[Object.keys(_this.list)[0]]);
            return _this.list[Object.keys(_this.list)[0]];
        }

        //активной считается первая (по времени) открытая вкладка из списка
        var sortedByTime = Array.prototype.sort.call(_this.list, function (a, b) {
            if (a.openedTime < b.openedTime) return -1;
            if (a.openedTime > b.openedTime) return 1;
            return 0;
        });

        var result = Object.keys(sortedByTime).length ? sortedByTime[Object.keys(sortedByTime)[0]] : false;
        _loglevel2.default.trace("tabs.getActiveTab() returns %o", result);
        return result;
    };

    this.add = function (tabId, tabType) {
        _loglevel2.default.trace("tabs.addTab() on <%d> with type <%s>", tabId, tabType);

        _this.list[tabId] = new _tab2.default(tabId, tabType);
    };

    this.update = function (tabId, key, value) {
        _loglevel2.default.trace("tabs.update() on <%d> with data %s => %o", tabId, key, value);

        if (!_this.list[tabId] || !_this.list[tabId].hasOwnProperty(key)) {
            _loglevel2.default.trace("tabs.update() not updated");
            return false;
        }

        _this.list[tabId][key] = value;
        _loglevel2.default.trace("tabs.update() updated");
    };

    this.count = function () {
        _loglevel2.default.trace("tabs.count() returns <%d>", Object.keys(_this.list).length);
        return Object.keys(_this.list).length;
    };

    _loglevel2.default.trace("tabs.constructor()");

    //добавляем слушатель на изменения URL'ов вкладок
    this.addTabsListeners();
}

//добавляем слушатель на изменения URL'ов вкладок


//В CS на страницу вешается обработчик события onbeforeunload, который перед закрытием окна присылает сообщение
//расширению и соответствующей вкладке делается shutdown. Сам сервис является SPA и при навигации это событие не
//срабатывает, тем самым, не нужно следить куда уже заинжектили код, а куда нет. Также о закрытии окна может
//потенециально сообщить событие onDisconnect у порта, через который идет обмен сообщениями.
;

exports.default = new tabs();

},{"../common/utils":9,"./browserAction":1,"./ext":2,"./tab":6,"loglevel":12}],8:[function(require,module,exports){
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

},{"loglevel":12}],9:[function(require,module,exports){
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

},{"loglevel":12}],10:[function(require,module,exports){
module.exports = require("./lib/jquery").extend;

},{"./lib/jquery":11}],11:[function(require,module,exports){
/*!
 * (extracted from)
 * jQuery JavaScript Library v2.0.3
 * http://jquery.com/
 *
 * Copyright 2005, 2013 jQuery Foundation, Inc. and other contributors
 * Released under the MIT license
 * http://jquery.org/license
 *
 * Date: 2013-07-03T13:30Z
 */
var class2type = {
  "[object Boolean]":   "boolean",
  "[object Number]":    "number",
  "[object String]":    "string",
  "[object Function]":  "function",
  "[object Array]":     "array",
  "[object Date]":      "date",
  "[object RegExp]":    "regexp",
  "[object Object]":    "object",
  "[object Error]":     "error"
};

var core_toString = class2type.toString,
    core_hasOwn   = class2type.hasOwnProperty;

var jQuery = module.exports = {};

jQuery.isFunction = function( obj ) {
  return jQuery.type(obj) === "function";
};

jQuery.isArray = Array.isArray;

jQuery.isWindow = function( obj ) {
  return obj != null && obj === obj.window;
};

jQuery.type = function( obj ) {
  if ( obj == null ) {
    return String( obj );
  }
  return typeof obj === "object" || typeof obj === "function" ?
    class2type[ core_toString.call(obj) ] || "object" :
    typeof obj;
};

jQuery.isPlainObject = function( obj ) {
  if ( jQuery.type( obj ) !== "object" || obj.nodeType || jQuery.isWindow( obj ) ) {
    return false;
  }

  try {
    if ( obj.constructor && !core_hasOwn.call( obj.constructor.prototype, "isPrototypeOf" ) ) {
      return false;
    }
  } catch ( e ) {
    return false;
  }

  return true;
};

jQuery.extend = function() {
  var options,
      name,
      src,
      copy,
      copyIsArray,
      clone,
      target = arguments[0] || {},
      i = 1,
      length = arguments.length,
      deep = false;

  if ( typeof target === "boolean" ) {
    deep = target;
    target = arguments[1] || {};
    i = 2;
  }

  if ( typeof target !== "object" && !jQuery.isFunction(target) ) {
    target = {};
  }

  if ( length === i ) {
    target = this;
    --i;
  }

  for ( ; i < length; i++ ) {
    if ( (options = arguments[ i ]) != null ) {
      for ( name in options ) {
        src = target[ name ];
        copy = options[ name ];

        if ( target === copy ) {
          continue;
        }

        if ( deep && copy && ( jQuery.isPlainObject(copy) || (copyIsArray = jQuery.isArray(copy)) ) ) {
          if ( copyIsArray ) {
            copyIsArray = false;
            clone = src && jQuery.isArray(src) ? src : [];

          } else {
            clone = src && jQuery.isPlainObject(src) ? src : {};
          }

          target[ name ] = jQuery.extend( deep, clone, copy );

        } else if ( copy !== undefined ) {
          target[ name ] = copy;
        }
      }
    }
  }

  return target;
};

},{}],12:[function(require,module,exports){
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

},{}],13:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
var news = {
    '1.7.1': {
        date: '16 сентября 2016',
        text: 'Полный рефакторинг окна с управлением плеером, доработка поддержки рекламы, которой, к сожалению, на сайте на бесплатном аккаунте стало очень много.'
    },
    '1.7.0': {
        date: '16 сентября 2016',
        text: 'Лето прошло, наконец я вернулся к доработкам расширения. Официальный плагин от Я.Музыки не показал тех показателей количества пользователей, которые я печально предполагал и это даже не смотря на рекламу прямо на витрине. Так что обновления еще будут! Помню и про туду-лист в отзывах ;)',
        high: "true"
    },
    '1.6.15': {
        date: '24 мая 2016',
        text: 'Добавил возможность отключения подтверждения при открытии вкладки с Я.Музыкой во время проигрывания. Можно выключить в Настройки > Общее > Прочее'
    },
    '1.6.14': {
        date: '21 апреля 2016',
        text: 'Добавил поддержку кнопки "Не рекомендовать" в уведомления и горячие клавиши. Также были исправлены некоторые ошибки, возникшие из-за нового релиза Я.Музыки.'
    },
    '1.6.11': {
        date: '08 апреля 2016',
        text: 'Добавил возможность в настройках в разделе "Горячие клавиши" включить уведомление об изменении режима повтора.'
    },
    '1.6.7': {
        date: '26 февраля 2016',
        text: 'Яндекс добавил новый функционал: дизлайк треков, который влияет на попадание треков на радио и в рекомендации, соответственно, добавил поддержку данного функционала. Некоторые косметические изменения.'
    },
    '1.6.4': {
        date: '24 февраля 2016',
        text: 'Добавлена опция по управлению громкостью: либо как было ранее громкость изменяется ползунком при наведении мышки на иконку, либо нажатие на иконку включает/выключает полностью звук. Настраивается в разделе "ОБЩИЕ". Также исправлена работа кнопки play/progress для страниц, использующих масштаб, отличный от 100%.'
    },
    '1.6.1': {
        date: '12 февраля 2016',
        text: 'Большое обновление, которое добавляет возможность видеть плейлист в окне, добавлены кнопки повтора и шафла, заработали ссылки на исполнителя и название песни, ну и много чего еще "под капотом".'
    },
    '1.5.12': {
        date: '2 февраля 2016',
        text: 'Добавил отображение версии трека (можно выключить в настройках), а также поддержку масштаба браузера по умолчанию'
    },
    '1.5.11': {
        date: '17 января 2016',
        text: 'Убрана новогодняя тема и в процессе разработки возможность удаленного управления с планшета/мобильного'
    },
    //{
    //    date: '29 декабря 2015',
    //    text: 'Хочу поздравить Вас с наступающим Новым годом и пожелать всего самого наилучшего в 2016-м году!'
    //},
    '1.5.8': {
        date: '29 декабря 2015',
        text: 'Исправлена иногда возникающая на Я.Радио ошибка. На время новогодних праздников добавил соответствующую тему для окна управления и настроек :)'
    },
    '1.5.5': {
        date: '16 декабря 2015',
        text: 'Благодаря разработчикам Я.Музыки, расширение полностью переведно на специальное API для расширений, что должно минимизировать количество ошибок при обновлениях витрины Я.Музыка или Я.Радио. Также полностью обновлена страница настроек и всплывающее окно для управления плеером'
    },
    '1.4.13': {
        date: null,
        text: "В очередной раз переработал всю схему отслеживания вкладок, должно стать стабильнее; Яндекс вернули режим радио в Я.Музыку"
    },
    '1.4.12': {
        date: null,
        text: "Изменена работа плагина согласно обновлению сервиса Я.Музыка; Режим радио в Я.Музыке, похоже, убрали совсем, так что его поддержка отключена, в итоге осталось два режима: Я.Музыка и Я.Радио"
    },
    '1.4.11': {
        date: null,
        text: "Исправлена ошибка работы со вкладками от предыдущего обновления"
    },
    '1.4.5': {
        date: null,
        text: "Обновлен механизм слежения за вкладками с открытой Я.Музыкой/Радио с целью исключения зависаний вкладки"
    },
    '1.4.3': {
        date: null,
        text: 'В настройках добавлен новый пункт "Общие", где можно выбрать режим работы расширения: с окном управления или без, а также настроить элементы окна управления'
    },
    '1.4.1': {
        date: null,
        text: 'Исправлена ошибка с кнопкой "Нравится" в уведомлении в режиме Я.Радио'
    },
    '1.4.0': {
        date: null,
        text: 'Изменена работа со вкладками: расширение теперь работает с первой открытой вкладкой и открытие других вкладок я Я.Музыкой или Я.Радио больше никак не влияет (например, слушая в одной вкладке, можно в другой посмотреть какой-то плейлист или данные об исполнителе и это не прервет работу расширения). После того как первая "рабочая" вкладка будет закрыта, расширение автоматом переключится на следующю, если таковая будет активна'
    },
    '1.3.18': {
        date: null,
        text: "Изменено всплывающее окно во всех режимах. Функция перемотки теперь осуществляется при клике по краю кнопки play, где отображается текущая позиция проигрывания"
    },
    '1.3.0': {
        date: null,
        text: 'Добавлена поддержка сервиса Яндекс.Радио. Помимо этого был убрана возможность скачивания мп3-файлов, о чем написано в разделе "Помощь"'
    }
};

exports.default = news;

},{}],14:[function(require,module,exports){
'use strict';

var _loglevel = require('loglevel');

var _loglevel2 = _interopRequireDefault(_loglevel);

var _utils = require('./common/utils');

var _utils2 = _interopRequireDefault(_utils);

var _ext = require('./bg/ext');

var _ext2 = _interopRequireDefault(_ext);

var _tabs = require('./bg/tabs');

var _tabs2 = _interopRequireDefault(_tabs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_loglevel2.default.setLevel("INFO"); //"TRACE" > "DEBUG" > "INFO" > "WARN" > "ERROR" > "SILENT"
//for debug:
//window.logger = log;

//TODO: временное решение для popup'а, в идеале надо через port гонять всю инфу

window.tabs = _tabs2.default;

/*** GA ***/
(function (i, s, o, g, r, a, m) {
  i['GoogleAnalyticsObject'] = r;i[r] = i[r] || function () {
    (i[r].q = i[r].q || []).push(arguments);
  }, i[r].l = 1 * new Date();a = s.createElement(o), m = s.getElementsByTagName(o)[0];a.async = 1;a.src = g;m.parentNode.insertBefore(a, m);
})(window, document, 'script', 'https://ssl.google-analytics.com/analytics.js', 'ga');
ga('create', 'UA-56927760-1');
ga('set', 'checkProtocolTask', function () {});
/*** GA ends ***/

try {
  _ext2.default.init();
} catch (e) {
  _utils2.default.errorHandler(e);
}

},{"./bg/ext":2,"./bg/tabs":7,"./common/utils":9,"loglevel":12}]},{},[14])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJleHRlbnNpb25fc3JjXFxiZ1xcYnJvd3NlckFjdGlvbi5qcyIsImV4dGVuc2lvbl9zcmNcXGJnXFxleHQuanMiLCJleHRlbnNpb25fc3JjXFxiZ1xcbm90aWZpY2F0aW9ucy5qcyIsImV4dGVuc2lvbl9zcmNcXGJnXFxwbGF5ZXIuanMiLCJleHRlbnNpb25fc3JjXFxiZ1xcc3RvcmFnZS5qcyIsImV4dGVuc2lvbl9zcmNcXGJnXFx0YWIuanMiLCJleHRlbnNpb25fc3JjXFxiZ1xcdGFicy5qcyIsImV4dGVuc2lvbl9zcmNcXGNvbW1vblxccG9ydC5qcyIsImV4dGVuc2lvbl9zcmNcXGNvbW1vblxcdXRpbHMuanMiLCJub2RlX21vZHVsZXMvanF1ZXJ5LWV4dGVuZC9leHRlbmQuanMiLCJub2RlX21vZHVsZXMvanF1ZXJ5LWV4dGVuZC9saWIvanF1ZXJ5LmpzIiwibm9kZV9tb2R1bGVzL2xvZ2xldmVsL2xpYi9sb2dsZXZlbC5qcyIsIm9wdGlvbnNfc3JjXFxhcHBcXG5ld3MuanMiLCJleHRlbnNpb25fc3JjXFxiZy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7OztBQ0FBOzs7O0FBQ0E7Ozs7QUFDQTs7Ozs7Ozs7QUFFQSxJQUFNLG9CQUFvQixHQUExQjs7SUFFTSxhLEdBc0JGLHlCQUFjO0FBQUE7O0FBQUE7O0FBQUEsU0FyQmQsTUFxQmMsR0FyQkw7QUFDTCxZQUFJLG1FQURDO0FBRUwsbUJBQVcsbUNBRk47QUFHTCxtQkFBVyxpQ0FITjtBQUlMLG9CQUFZLGtDQUpQO0FBS0wsb0JBQVksZ0NBTFA7QUFNTCxtQkFBVyx1Q0FOTjtBQU9MLG1CQUFXO0FBUE4sS0FxQks7QUFBQSxTQVpkLEtBWWMsR0FaTjtBQUNKLFlBQUkseUJBREE7QUFFSixtQkFBVywyQkFGUDtBQUdKLG1CQUFXLDJCQUhQO0FBSUosb0JBQVksNEJBSlI7QUFLSixvQkFBWSw0QkFMUjtBQU1K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QUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7OztBQy9OQSxJQUFJLE9BQU87QUFDUCxhQUFVO0FBQ04sY0FBTSxrQkFEQTtBQUVOLGNBQU07QUFGQSxLQURIO0FBS1AsYUFBVTtBQUNOLGNBQU0sa0JBREE7QUFFTixjQUFNLGdTQUZBO0FBR04sY0FBTTtBQUhBLEtBTEg7QUFVUCxjQUFXO0FBQ1AsY0FBTSxhQURDO0FBRVAsY0FBTTtBQUZDLEtBVko7QUFjUCxjQUFXO0FBQ1AsY0FBTSxnQkFEQztBQUVQLGNBQU07QUFGQyxLQWRKO0FBa0JQLGNBQVc7QUFDUCxjQUFNLGdCQURDO0FBRVAsY0FBTTtBQUZDLEtBbEJKO0FBc0JQLGFBQVU7QUFDTixjQUFNLGlCQURBO0FBRU4sY0FBTTtBQUZBLEtBdEJIO0FBMEJQLGFBQVU7QUFDTixjQUFNLGlCQURBO0FBRU4sY0FBTTtBQUZBLEtBMUJIO0FBOEJQLGFBQVU7QUFDTixjQUFNLGlCQURBO0FBRU4sY0FBTTtBQUZBLEtBOUJIO0FBa0NQLGNBQVU7QUFDTixjQUFNLGdCQURBO0FBRU4sY0FBTTtBQUZBLEtBbENIO0FBc0NQLGNBQVM7QUFDTCxjQUFNLGdCQUREO0FBRUwsY0FBTTtBQUZELEtBdENGOzs7OztBQThDUCxhQUFRO0FBQ0osY0FBTSxpQkFERjtBQUVKLGNBQU07QUFGRixLQTlDRDtBQWtEUCxhQUFRO0FBQ0osY0FBTSxpQkFERjtBQUVKLGNBQU07QUFGRixLQWxERDtBQXNEUCxjQUFTO0FBQ0wsY0FBTSxJQUREO0FBRUwsY0FBTTtBQUZELEtBdERGO0FBMERQLGNBQVM7QUFDTCxjQUFNLElBREQ7QUFFTCxjQUFNO0FBRkQsS0ExREY7QUE4RFAsY0FBUztBQUNMLGNBQU0sSUFERDtBQUVMLGNBQU07QUFGRCxLQTlERjtBQWtFUCxhQUFRO0FBQ0osY0FBTSxJQURGO0FBRUosY0FBTTtBQUZGLEtBbEVEO0FBc0VQLGFBQVE7QUFDSixjQUFNLElBREY7QUFFSixjQUFNO0FBRkYsS0F0RUQ7QUEwRVAsYUFBUTtBQUNKLGNBQU0sSUFERjtBQUVKLGNBQU07QUFGRixLQTFFRDtBQThFUCxhQUFRO0FBQ0osY0FBTSxJQURGO0FBRUosY0FBTTtBQUZGLEtBOUVEO0FBa0ZQLGNBQVM7QUFDTCxjQUFNLElBREQ7QUFFTCxjQUFNO0FBRkQsS0FsRkY7QUFzRlAsYUFBUTtBQUNKLGNBQU0sSUFERjtBQUVKLGNBQU07QUFGRjtBQXRGRCxDQUFYOztrQkE0RmUsSTs7Ozs7QUM1RmY7Ozs7QUFDQTs7OztBQU1BOzs7O0FBR0E7Ozs7OztBQVBBLG1CQUFJLFFBQUosQ0FBYSxNQUFiLEU7Ozs7OztBQVFBLE9BQU8sSUFBUDs7O0FBR0EsQ0FBQyxVQUFTLENBQVQsRUFBVyxDQUFYLEVBQWEsQ0FBYixFQUFlLENBQWYsRUFBaUIsQ0FBakIsRUFBbUIsQ0FBbkIsRUFBcUIsQ0FBckIsRUFBdUI7QUFBQyxJQUFFLHVCQUFGLElBQTJCLENBQTNCLENBQTZCLEVBQUUsQ0FBRixJQUFLLEVBQUUsQ0FBRixLQUFNLFlBQVU7QUFBQyxLQUFDLEVBQUUsQ0FBRixFQUFLLENBQUwsR0FBTyxFQUFFLENBQUYsRUFBSyxDQUFMLElBQVEsRUFBaEIsRUFBb0IsSUFBcEIsQ0FBeUIsU0FBekI7QUFBb0MsR0FBMUQsRUFBMkQsRUFBRSxDQUFGLEVBQUssQ0FBTCxHQUFPLElBQUUsSUFBSSxJQUFKLEVBQXBFLENBQStFLElBQUUsRUFBRSxhQUFGLENBQWdCLENBQWhCLENBQUYsRUFBcUIsSUFBRSxFQUFFLG9CQUFGLENBQXVCLENBQXZCLEVBQTBCLENBQTFCLENBQXZCLENBQW9ELEVBQUUsS0FBRixHQUFRLENBQVIsQ0FBVSxFQUFFLEdBQUYsR0FBTSxDQUFOLENBQVEsRUFBRSxVQUFGLENBQWEsWUFBYixDQUEwQixDQUExQixFQUE0QixDQUE1QjtBQUErQixDQUExTyxFQUE0TyxNQUE1TyxFQUFtUCxRQUFuUCxFQUE0UCxRQUE1UCxFQUFxUSwrQ0FBclEsRUFBcVQsSUFBclQ7QUFDQSxHQUFHLFFBQUgsRUFBYSxlQUFiO0FBQ0EsR0FBRyxLQUFILEVBQVUsbUJBQVYsRUFBK0IsWUFBVSxDQUFFLENBQTNDOzs7QUFHQSxJQUFJO0FBQUUsZ0JBQUksSUFBSjtBQUFhLENBQW5CLENBQW9CLE9BQU8sQ0FBUCxFQUFVO0FBQUUsa0JBQU0sWUFBTixDQUFtQixDQUFuQjtBQUF3QiIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJpbXBvcnQgbG9nIGZyb20gJ2xvZ2xldmVsJztcclxuaW1wb3J0IHN0b3JhZ2UgZnJvbSAnLi9zdG9yYWdlJztcclxuaW1wb3J0IHRhYnMgZnJvbSAnLi90YWJzJztcclxuXHJcbmNvbnN0IERPVUJMRV9DTElDS19USU1FID0gMjUwO1xyXG5cclxuY2xhc3MgYnJvd3NlckFjdGlvbiB7XHJcbiAgICB0aXRsZXMgPSB7XHJcbiAgICAgICAgbmE6ICfQo9C/0YDQsNCy0LvQtdC90LjQtSDQr9C90LTQtdC60YEu0JzRg9C30YvQutC+0Lkv0KDQsNC00LjQvjog0L3QtdC00L7RgdGC0YPQv9C90L4sINC90LXRgiDQvtGC0LrRgNGL0YLRi9GFINCy0LrQu9Cw0LTQvtC6JyxcclxuICAgICAgICBtdXNpY1BsYXk6ICfQo9C/0YDQsNCy0LvQtdC90LjQtSDQr9C90LTQtdC60YEu0JzRg9C30YvQutC+0Lk6INC40LPRgNCw0LXRgicsXHJcbiAgICAgICAgcmFkaW9QbGF5OiAn0KPQv9GA0LDQstC70LXQvdC40LUg0K/QvdC00LXQutGBLtCg0LDQtNC40L46INC40LPRgNCw0LXRgicsXHJcbiAgICAgICAgbXVzaWNQYXVzZTogJ9Cj0L/RgNCw0LLQu9C10L3QuNC1INCv0L3QtNC10LrRgS7QnNGD0LfRi9C60L7QuTog0L/QsNGD0LfQsCcsXHJcbiAgICAgICAgcmFkaW9QYXVzZTogJ9Cj0L/RgNCw0LLQu9C10L3QuNC1INCv0L3QtNC10LrRgS7QoNCw0LTQuNC+OiDQv9Cw0YPQt9CwJyxcclxuICAgICAgICBtdXNpY1dhaXQ6ICfQo9C/0YDQsNCy0LvQtdC90LjQtSDQr9C90LTQtdC60YEu0JzRg9C30YvQutC+0Lk6INCyINC+0LbQuNC00LDQvdC40LgnLFxyXG4gICAgICAgIHJhZGlvV2FpdDogJ9Cj0L/RgNCw0LLQu9C10L3QuNC1INCv0L3QtNC10LrRgS7QoNCw0LTQuNC+OiDQsiDQvtC20LjQtNCw0L3QuNC4J1xyXG4gICAgfTtcclxuICAgIGljb25zID0ge1xyXG4gICAgICAgIG5hOiAnaW1hZ2VzL2ljb25fMzhfMl9uYS5wbmcnLFxyXG4gICAgICAgIG11c2ljUGxheTogJ2ltYWdlcy9pY29uXzM4XzJfcGxheS5wbmcnLFxyXG4gICAgICAgIHJhZGlvUGxheTogJ2ltYWdlcy9pY29uXzM4XzJfcGxheS5wbmcnLFxyXG4gICAgICAgIG11c2ljUGF1c2U6ICdpbWFnZXMvaWNvbl8zOF8yX3BhdXNlLnBuZycsXHJcbiAgICAgICAgcmFkaW9QYXVzZTogJ2ltYWdlcy9pY29uXzM4XzJfcGF1c2UucG5nJyxcclxuICAgICAgICBtdXNpY1dhaXQ6ICdpbWFnZXMvaWNvbl8zOF8yLnBuZycsXHJcbiAgICAgICAgcmFkaW9XYWl0OiAnaW1hZ2VzL2ljb25fMzhfMi5wbmcnXHJcbiAgICB9O1xyXG4gICAgbGluayA9ICdwb3B1cC9wb3B1cC5odG1sJztcclxuICAgIGNsaWNrVGltZXIgPSBudWxsO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIGxvZy50cmFjZShcImJyb3dzZXJBY3Rpb24uY29uc3RydWN0b3IoKVwiKTtcclxuICAgICAgICB0aGlzLmluaXQoKTtcclxuICAgIH1cclxuXHJcbiAgICBpbml0ID0gKCkgPT4ge1xyXG4gICAgICAgIGxvZy50cmFjZShcImJyb3dzZXJBY3Rpb24uaW5pdCgpXCIpO1xyXG4gICAgICAgIHN3aXRjaChzdG9yYWdlLmdldCgnZ2xvYmFsX21vZGUnKSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGNhc2UgJ3BvcHVwJzpcclxuICAgICAgICAgICAgICAgIC8v0LXRgdC70Lgg0YDQtdC20LjQvCDQv9C+0L/QsNC/LCDRgtC+INGD0LHQuNGA0LDQtdC8INGB0LvRg9GI0LDRgtC10LvRjCDQutC70LjQutCwINC/0L4g0LjQutC+0L3QutC1LCDRgi7Qui4g0YMg0L3QsNGBINCy0YvQv9Cw0LTQsNGO0YnQtdC1INC+0LrQvdC+XHJcbiAgICAgICAgICAgICAgICB0aGlzLnJlbW92ZUNsaWNrTGlzdGVuZXIoKTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlICdidXR0b24nOlxyXG4gICAgICAgICAgICAgICAgLy/QtdGB0LvQuCDRgNC10LbQuNC8INC60L3QvtC/0LrQsCwg0YLQviDQv9C+0L/QsNC/INC90LUg0YDQsNCx0L7RgtCw0LXRgiDQuCDQtNC+0LHQsNCy0LvRj9C10Lwg0YHQu9GD0YjQsNGC0LXQu9GMINC60LvQuNC60LAg0L/QviDQuNC60L7QvdC60LVcclxuICAgICAgICAgICAgICAgIHRoaXMuYWRkQ2xpY2tMaXN0ZW5lcigpO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuXHJcbiAgICByZW1vdmVDbGlja0xpc3RlbmVyID0gKCkgPT4ge1xyXG4gICAgICAgIGxvZy50cmFjZShcImJyb3dzZXJBY3Rpb24ucmVtb3ZlQ2xpY2tMaXN0ZW5lcigpXCIpO1xyXG4gICAgICAgIGNocm9tZS5icm93c2VyQWN0aW9uLm9uQ2xpY2tlZC5yZW1vdmVMaXN0ZW5lcih0aGlzLmNsaWNrSGFuZGxlcik7XHJcbiAgICB9O1xyXG5cclxuICAgIGFkZENsaWNrTGlzdGVuZXIgPSAoKSA9PiB7XHJcbiAgICAgICAgbG9nLnRyYWNlKFwiYnJvd3NlckFjdGlvbi5hZGRDbGlja0xpc3RlbmVyKClcIik7XHJcbiAgICAgICAgY2hyb21lLmJyb3dzZXJBY3Rpb24ub25DbGlja2VkLmFkZExpc3RlbmVyKHRoaXMuY2xpY2tIYW5kbGVyKTtcclxuICAgIH07XHJcblxyXG4gICAgY2xpY2tIYW5kbGVyID0gKCkgPT4ge1xyXG4gICAgICAgIGxvZy50cmFjZShcImJyb3dzZXJBY3Rpb24uY2xpY2tIYW5kbGVyKClcIik7XHJcbiAgICAgICAgLy/RgSDQv9C+0LzQvtGJ0YzRjiDRgtCw0LnQvNC10YDQsCDQu9C+0LLQuNC8INC00LDQsdC70LrQu9C40Log0LXRgdC70Lgg0YPRgdC/0LXRgtGMINC60LvQuNC60L3Rg9GC0Ywg0LTQstCw0LbQtNGLINC00L4gRE9VQkxFX0NMSUNLX1RJTUUg0LzRgVxyXG4gICAgICAgIGlmICh0aGlzLmNsaWNrVGltZXIpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB3aW5kb3cuY2xlYXJUaW1lb3V0KHRoaXMuY2xpY2tUaW1lcik7XHJcbiAgICAgICAgICAgIHRoaXMuY2xpY2tUaW1lciA9IG51bGw7XHJcbiAgICAgICAgICAgIHRhYnMuZ2V0QWN0aXZlVGFiKCkuc2VuZCh7YWN0aW9uOiAnbmV4dCd9KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICB0aGlzLmNsaWNrVGltZXIgPSB3aW5kb3cuc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmNsaWNrVGltZXIgPSBudWxsO1xyXG4gICAgICAgICAgICAgICAgdGFicy5nZXRBY3RpdmVUYWIoKS5zZW5kKHthY3Rpb246ICdwbGF5J30pO1xyXG4gICAgICAgICAgICB9LCBET1VCTEVfQ0xJQ0tfVElNRSk7XHJcbiAgICB9O1xyXG5cclxuICAgIHVwZGF0ZSA9ICgpID0+IHtcclxuICAgICAgICBsb2cudHJhY2UoXCJicm93c2VyQWN0aW9uLnVwZGF0ZSgpXCIpO1xyXG5cclxuICAgICAgICAvL9Cy0YHQtSDQstC60LvQsNC00LrQuCDQt9Cw0LrRgNGL0YLRi1xyXG4gICAgICAgIGlmICghdGFicy5jb3VudCgpKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgbG9nLnRyYWNlKFwiYnJvd3NlckFjdGlvbi51cGRhdGUoKSBhbGwgdGFicyBjbG9zZWQsIGFsbCBzZXQgTkFcIik7XHJcbiAgICAgICAgICAgIGNocm9tZS5icm93c2VyQWN0aW9uLnNldEljb24oe3BhdGg6IHRoaXMuaWNvbnMubmF9KTtcclxuICAgICAgICAgICAgY2hyb21lLmJyb3dzZXJBY3Rpb24uc2V0VGl0bGUoe3RpdGxlOiB0aGlzLnRpdGxlcy5uYX0pO1xyXG4gICAgICAgICAgICAvL9C10YHQu9C4INC+0YLQutGA0YvRgtGL0YUg0LLQutC70LDQtNC+0Log0L3QtdGCLCDRgtC+INC00LDQttC1INCyINGA0LXQttC40LzQtSDQutC90L7Qv9C60Lgg0L7RgdGC0LDQstC70Y/QtdC8INC/0L7Qv9Cw0L8g0YEg0LLQvtC30LzQvtC20L3QvtGB0YLRjNGOINC+0YLQutGA0YvRgtGMINCvLtCcL9CvLtCgXHJcbiAgICAgICAgICAgIGNocm9tZS5icm93c2VyQWN0aW9uLnNldFBvcHVwKHtwb3B1cDogdGhpcy5saW5rfSk7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8v0LXRgdGC0Ywg0LDQutGC0LjQstC90LDRjyDQstC60LvQsNC00LrQsFxyXG4gICAgICAgIGNvbnN0IGFjdGl2ZVRhYiA9IHRhYnMuZ2V0QWN0aXZlVGFiKCk7XHJcbiAgICAgICAgaWYgKGFjdGl2ZVRhYilcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGxvZy50cmFjZShcImJyb3dzZXJBY3Rpb24udXBkYXRlKCkgc2V0IHRvIFwiKyhzdG9yYWdlLmdldCgnZ2xvYmFsX21vZGUnKT90aGlzLmxpbms6XCI8bnVsbD5cIikpO1xyXG5cclxuICAgICAgICAgICAgLy/QtNC+0LHQsNCy0LvRj9C10Lwg0YHRgdGL0LvQutGDINC90LAg0L/QvtC/0LDQvyDQsiDRgNC10LbQuNC80LUg0L/QvtC/0LDQv9CwINC4INGD0LTQsNC70Y/QtdC8INGB0YHRi9C70LrRgyDQsiDRgNC10LbQuNC80LUg0LrQvdC+0L/QutC4XHJcbiAgICAgICAgICAgIHN3aXRjaChzdG9yYWdlLmdldCgnZ2xvYmFsX21vZGUnKSlcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgY2FzZSAncG9wdXAnOlxyXG4gICAgICAgICAgICAgICAgICAgIGNocm9tZS5icm93c2VyQWN0aW9uLnNldFBvcHVwKHtwb3B1cDogdGhpcy5saW5rfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlICdidXR0b24nOlxyXG4gICAgICAgICAgICAgICAgICAgIGNocm9tZS5icm93c2VyQWN0aW9uLnNldFBvcHVwKHtwb3B1cDogXCJcIn0pO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAoYWN0aXZlVGFiLnBsYXllci5pc1BsYXlpbmcgPT09IHRydWUpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGxvZy50cmFjZShcImJyb3dzZXJBY3Rpb24udXBkYXRlKCkgaWNvbiBzZXQgdG8gcGxheWluZ1wiKTtcclxuICAgICAgICAgICAgICAgIGNocm9tZS5icm93c2VyQWN0aW9uLnNldEljb24oe3BhdGg6IHRoaXMuaWNvbnNbYWN0aXZlVGFiLnR5cGUgKyAnUGxheSddfSk7XHJcbiAgICAgICAgICAgICAgICBjaHJvbWUuYnJvd3NlckFjdGlvbi5zZXRUaXRsZSh7dGl0bGU6IHRoaXMudGl0bGVzW2FjdGl2ZVRhYi50eXBlICsgJ1BsYXknXX0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2UgaWYgKGFjdGl2ZVRhYi5wbGF5ZXIuaXNQbGF5aW5nID09PSBmYWxzZSlcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgbG9nLnRyYWNlKFwiYnJvd3NlckFjdGlvbi51cGRhdGUoKSBpY29uIHNldCB0byBwYXVzZWRcIik7XHJcbiAgICAgICAgICAgICAgICBjaHJvbWUuYnJvd3NlckFjdGlvbi5zZXRJY29uKHtwYXRoOiB0aGlzLmljb25zW2FjdGl2ZVRhYi50eXBlICsgJ1BhdXNlJ119KTtcclxuICAgICAgICAgICAgICAgIGNocm9tZS5icm93c2VyQWN0aW9uLnNldFRpdGxlKHt0aXRsZTogdGhpcy50aXRsZXNbYWN0aXZlVGFiLnR5cGUgKyAnUGF1c2UnXX0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgbG9nLnRyYWNlKFwiYnJvd3NlckFjdGlvbi51cGRhdGUoKSBpY29uIHNldCB0byB3YWl0aW5nXCIpO1xyXG4gICAgICAgICAgICAgICAgY2hyb21lLmJyb3dzZXJBY3Rpb24uc2V0SWNvbih7cGF0aDogdGhpcy5pY29uc1thY3RpdmVUYWIudHlwZSArICdXYWl0J119KTtcclxuICAgICAgICAgICAgICAgIGNocm9tZS5icm93c2VyQWN0aW9uLnNldFRpdGxlKHt0aXRsZTogdGhpcy50aXRsZXNbYWN0aXZlVGFiLnR5cGUgKyAnV2FpdCddfSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9O1xyXG5cclxuICAgIGNsb3NlUG9wdXAgPSAoKSA9PiB7XHJcbiAgICAgICAgbG9nLnRyYWNlKFwiYnJvd3NlckFjdGlvbi5jbG9zZVBvcHVwKClcIik7XHJcblxyXG4gICAgICAgIGNvbnN0IHBvcHVwcyA9IGNocm9tZS5leHRlbnNpb24uZ2V0Vmlld3Moe3R5cGU6ICdwb3B1cCd9KTtcclxuICAgICAgICBpZiAocG9wdXBzLmxlbmd0aClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHBvcHVwc1swXS5jbG9zZSgpO1xyXG4gICAgICAgICAgICBsb2cudHJhY2UoXCJicm93c2VyQWN0aW9uLmNsb3NlUG9wdXAoKSBjbG9zZWRcIik7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgbmV3IGJyb3dzZXJBY3Rpb24oKTsiLCJpbXBvcnQgbG9nIGZyb20gJ2xvZ2xldmVsJztcclxuaW1wb3J0IHN0b3JhZ2UgZnJvbSAnLi9zdG9yYWdlJztcclxuaW1wb3J0IHRhYnMgZnJvbSAnLi90YWJzJztcclxuaW1wb3J0IG5ld3MgZnJvbSAnLi4vLi4vb3B0aW9uc19zcmMvYXBwL25ld3MnO1xyXG5pbXBvcnQgcG9ydENsYXNzIGZyb20gJy4uL2NvbW1vbi9wb3J0JztcclxuaW1wb3J0IG5vdGlmaWNhdGlvbnMgZnJvbSAnLi9ub3RpZmljYXRpb25zJztcclxuaW1wb3J0IGJyb3dzZXJBY3Rpb24gZnJvbSAnLi9icm93c2VyQWN0aW9uJztcclxuXHJcbi8vZm9yIGRlYnVnXHJcbi8vd2luZG93LnN0b3JhZ2UgPSBzdG9yYWdlO1xyXG5cclxuY29uc3QgRVhURVJOQUxfRVhURU5TSU9OX0lEID0gJ2FvZmFpbm9vZm5vbmhwZmxqaXBkYW9hZ21qbWhjaWRsJztcclxuXHJcbmNsYXNzIGV4dCB7XHJcbiAgICAvL9GB0L/QuNGB0L7QuiDQt9Cw0YDQtdCz0LjRgdGC0YDQuNGA0L7QstCw0L3QvdGL0YUg0LIgbWFuaWZlc3QuanNvbiDQutC+0LzQsNC90LQg0Lgg0LTQtdC50YHRgtCy0LjRjyDQv9GA0Lgg0LjRhSDQv9C+0LvRg9GH0LXQvdC40LhcclxuICAgIC8vYWN0aW9uIC0g0LTQtdC50YHRgtCy0LjQtVxyXG4gICAgLy9bY29uZmlybV0gLSDQv9C+0LTRgtCy0LXRgNC20LTQtdC90LjQtSB7dGl0bGUsIGljb24sIHN0b3JhZ2VPcHRpb25OYW1lfVxyXG4gICAgLy9bYmVmb3JlQ2JdIC0g0L/RgNC10LTRg9GB0LvQvtCy0LjQtSDQstGL0L/QvtC70L3QtdC90LjRjyDQtNC10LnRgdGC0LLQuNGPXHJcbiAgICAvL1thZnRlckNiXSAgLSDQtNC10LnRgdGC0LLQuNGPINC/0L7RgdC70LUg0L7RgtC/0YDQsNCy0LrQuCDQutC+0LzQsNC90LTRi1xyXG4gICAgY29tbWFuZHMgPSB7XHJcbiAgICAgICAgcGxheWVyX25leHQ6IHsgYWN0aW9uOlwibmV4dFwiIH0sXHJcbiAgICAgICAgcGxheWVyX3BsYXk6IHsgYWN0aW9uOlwicGxheVwiIH0sXHJcbiAgICAgICAgcGxheWVyX3ByZXY6IHsgYWN0aW9uOlwicHJldlwiIH0sXHJcbiAgICAgICAgcGxheWVyX2luZm86IHsgYWN0aW9uOlwiaW5mb1wiIH0sXHJcbiAgICAgICAgcGxheWVyX3ZvbHVtZV91cDogeyBhY3Rpb246XCJ2b2x1bWV1cFwiIH0sXHJcbiAgICAgICAgcGxheWVyX3ZvbHVtZV90b2dnbGU6IHsgYWN0aW9uOlwidm9sdW1lVG9nZ2xlXCIgfSxcclxuICAgICAgICBwbGF5ZXJfdm9sdW1lX2Rvd246IHsgYWN0aW9uOlwidm9sdW1lZG93blwiIH0sXHJcbiAgICAgICAgcGxheWVyX3NodWZmbGU6IHsgYWN0aW9uOlwic2h1ZmZsZVwiIH0sXHJcbiAgICAgICAgcGxheWVyX3JlcGVhdDoge1xyXG4gICAgICAgICAgICBhY3Rpb246XCJyZXBlYXRcIixcclxuICAgICAgICAgICAgYWZ0ZXJDYjogKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgaWYgKG5vdGlmaWNhdGlvbnMubm90aWZpY2F0aW9uc0dyYW50ZWQgJiYgc3RvcmFnZS5nZXQoXCJob3RrZXlfcmVwZWF0X25vdGlmXCIpKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHRpdGxlID0gW1wiXFxu0JLQutC70Y7Rh9C10L0g0L/QvtCy0YLQvtGAINCy0YHQtdGFINGC0YDQtdC60L7QslwiLCBcIlxcbtCS0YvQutC70Y7Rh9C10L0g0L/QvtCy0YLQvtGAXCIsIFwiXFxu0JLQutC70Y7Rh9C10L0g0L/QvtCy0YLQvtGAINGC0YDQtdC60LBcIl0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgcmVwZWF0TW9kZSA9IH5+dGFicy5nZXRBY3RpdmVUYWIoKS5wbGF5ZXIuY29udHJvbHMucmVwZWF0O1xyXG4gICAgICAgICAgICAgICAgICAgIG5vdGlmaWNhdGlvbnMuY3JlYXRlVG9hc3QoYGltYWdlcy9yZXBlYXRfJHtyZXBlYXRNb2RlfS5wbmdgLCB0aXRsZVtyZXBlYXRNb2RlXSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9LFxyXG4gICAgICAgIHBsYXllcl9saWtlOiB7XHJcbiAgICAgICAgICAgIGFjdGlvbjpcImxpa2VcIixcclxuICAgICAgICAgICAgYmVmb3JlQ2I6ICgpID0+IHtcclxuICAgICAgICAgICAgICAgIGlmICghdGFicy5nZXRBY3RpdmVUYWIoKS5wbGF5ZXIudHJhY2subGlrZWQpXHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcblxyXG4gICAgICAgICAgICAgICAgc3dpdGNoKHN0b3JhZ2UuZ2V0KFwiaG90a2V5X2xpa2VfYWN0aW9uXCIpKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgJ3JlbW92ZSc6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICBjYXNlICdub25lJzpcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICBjYXNlICdhc2snOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAobm90aWZpY2F0aW9ucy5ub3RpZmljYXRpb25zR3JhbnRlZCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbm90aWZpY2F0aW9ucy5jcmVhdGVDb25maXJtYXRpb24oJ2xpa2UnLCAn0JLRiyDRg9Cy0LXRgNC10L3RiyDRh9GC0L4g0YXQvtGC0LjRgtC1INGD0LHRgNCw0YLRjCDRgyDRgtGA0LXQutCwINC+0YLQvNC10YLQutGDIFwi0JzQvdC1INC90YDQsNCy0LjRgtGB0Y9cIj8nLCAnaW1hZ2VzL2xpa2Utbm90aWYucG5nJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb2cud2FybihcImV4dC5vbkNvbW1hbmQoKSBjb25maXJtYXRpb24gbm90IGdyYW50ZWQsIGRpc2FibGluZyBjb25maXJtYXRpb25cIik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgcGxheWVyX2Rpc2xpa2U6IHtcclxuICAgICAgICAgICAgYWN0aW9uOlwiZGlzbGlrZVwiLFxyXG4gICAgICAgICAgICBjb25maXJtOiB7XHJcbiAgICAgICAgICAgICAgICB0aXRsZTogZnVuY3Rpb24oKSB7IHJldHVybiB0YWJzLmdldEFjdGl2ZVRhYigpLnR5cGUgIT0gJ3JhZGlvJyA/ICfQktGLINGD0LLQtdGA0LXQvdGLINGH0YLQviDRhdC+0YLQuNGC0LUg0L7RgtC80LXRgtC40YLRjCDRgtGA0LXQuiDQutCw0LogXCLQndC1INGA0LXQutC+0LzQtdC90LTQvtCy0LDRgtGMXCI/JyA6ICfQktGLINGD0LLQtdGA0LXQvdGLINGH0YLQviDRhdC+0YLQuNGC0LUg0L7RgtC80LXRgtC40YLRjCDRgtGA0LXQuiDQutCw0LogXCLQndC1INC90YDQsNCy0LjRgtGB0Y9cIj8nIH0sXHJcbiAgICAgICAgICAgICAgICBpY29uOiBmdW5jdGlvbigpIHsgcmV0dXJuIHRhYnMuZ2V0QWN0aXZlVGFiKCkudHlwZSAhPSAncmFkaW8nID8gJ2ltYWdlcy9kb250cmVjLW5vdGlmLnBuZycgOiAnaW1hZ2VzL2Rpc2xpa2Utbm90aWYucG5nJyB9LFxyXG4gICAgICAgICAgICAgICAgc3RvcmFnZU9wdGlvbk5hbWU6ICdob3RrZXlfZGlzbGlrZV9hY3Rpb24nXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9O1xyXG5cclxuICAgIC8v0LrQsNC90LDQuyDQtNC70Y8g0YHQstGP0LfQuCDRgSBwb3B1cCfQvtC8XHJcbiAgICBwb3B1cENvbm5lY3Rpb24gPSBudWxsO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIGxvZy50cmFjZShcImV4dC5jb25zdHJ1Y3RvcigpXCIpO1xyXG4gICAgfVxyXG5cclxuICAgIGluaXQgPSAoKSA9PiB7XHJcbiAgICAgICAgbG9nLnRyYWNlKFwiZXh0LmluaXQoKVwiKTtcclxuXHJcbiAgICAgICAgLy/QtNC+0LHQsNCy0LvRj9C10Lwg0LvQvtCz0LPQtdGA0YMg0LzQtdGC0L7QtCDQtNC70Y8g0YLRgNCw0L3RgdC70Y/RhtC40Lgg0YPRgNC+0LLQvdGPINC70L7Qs9C40YDQvtCy0LDQvdC40Y8g0LIgQ1NcclxuICAgICAgICBsb2cuY3MgPSAoKSA9PiB7XHJcbiAgICAgICAgICAgIGNvbnN0IHRhYiA9IHRhYnMuZ2V0QWN0aXZlVGFiKCk7XHJcbiAgICAgICAgICAgIGlmICh0YWIpXHJcbiAgICAgICAgICAgICAgICB0YWIuc2VuZCh7YWN0aW9uOlwiZGVidWdcIiwgbGV2ZWw6IGxvZy5nZXRMZXZlbCgpfSk7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgLy/Rg9GB0YLQsNC90L7QstC60LAg0LjQu9C4INC+0LHQvdC+0LLQu9C10L3QuNC1INGA0LDRgdGI0LjRgNC10L3QuNGPXHJcbiAgICAgICAgbG9nLnRyYWNlKFwiZXh0LmluaXQoKSBhZGRpbmcgb25JbnN0YWxsZWQgZXZlbnQgbGlzdGVuZXJcIik7XHJcbiAgICAgICAgY2hyb21lLnJ1bnRpbWUub25JbnN0YWxsZWQuYWRkTGlzdGVuZXIodGhpcy5vbkluc3RhbGxlZCk7XHJcblxyXG4gICAgICAgIC8v0LTQvtCx0LDQstC70Y/QtdC8INGB0LvRg9GI0LDRgtC10LvRjCDRgdC+0LHRi9GC0LjQuSwg0L/RgNC40YjQtdC00YjQuNGFINC+0YIgQ1Mg0YHQutGA0LjQv9GC0LAg0LjQtyDQstC60LvQsNC00LrQuFxyXG4gICAgICAgIGNocm9tZS5ydW50aW1lLm9uQ29ubmVjdC5hZGRMaXN0ZW5lcih0aGlzLm9uQ29ubmVjdCk7XHJcblxyXG4gICAgICAgIC8v0LTQvtCx0LDQstC70Y/QtdC8INGB0LvRg9GI0LDRgtC10LvRjCDQs9C+0YDRj9GH0LjRhSDQutC70LDQstC40YlcclxuICAgICAgICBjaHJvbWUuY29tbWFuZHMub25Db21tYW5kLmFkZExpc3RlbmVyKHRoaXMub25Db21tYW5kKTtcclxuXHJcbiAgICAgICAgLy/QtNC+0LHQsNCy0LvRj9C10Lwg0YHQu9GD0YjQsNGC0LXQu9GMINGB0L7QvtCx0YnQtdC90LjQuSwg0L/RgNC40YjQtdC00YjQuNGFINC40Lcg0LTRgNGD0LPQvtCz0L4g0YDQsNGB0YjQuNGA0LXQvdC40Y9cclxuICAgICAgICBjaHJvbWUucnVudGltZS5vbk1lc3NhZ2VFeHRlcm5hbC5hZGRMaXN0ZW5lcih0aGlzLm9uTWVzc2FnZUV4dGVybmFsKTtcclxuXHJcbiAgICAgICAgLy/Qt9Cw0LTQsNC10Lwg0YDQtdCw0LrRhtC40Y4g0L3QsCDRgdC+0LHRi9GC0LjQtSDQuNC30LzQtdC90LXQvdC40Y8g0LrQvtC90YTQuNCz0YPRgNCw0YbQuNC4XHJcbiAgICAgICAgc3RvcmFnZS5hZGRPblN0b3JhZ2VDaGFuZ2VDYih0aGlzLm9uU3RvcmFnZUNoYW5nZSk7XHJcblxyXG4gICAgICAgIC8v0L/RgNC+0LLQtdGA0LrQsCDQv9GA0LXQvNC40YPQvNCwXHJcbiAgICAgICAgaWYgKHN0b3JhZ2UuZ2V0KCdwcmVtaXVtX2tleScpKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgbG9nLmluZm8oXCJleHQuaW5pdCgpIENoZWNrIHByZW1pdW0ga2V5XCIsIHN0b3JhZ2UuZ2V0KCdwcmVtaXVtX2tleScpLCBcImZvciB1c2VyXCIsIHN0b3JhZ2UuZ2V0KCd1c2VyX2lkJykpO1xyXG4gICAgICAgICAgICBmZXRjaChcImh0dHA6Ly9ub2RlLmJiaXJkLnJ1L2FwaS8/YT1jaGVjayZ0b2tlbj1cIiArIHN0b3JhZ2UuZ2V0KCdwcmVtaXVtX2tleScpICsgXCImdXNlcl9pZD1cIiArIHN0b3JhZ2UuZ2V0KCd1c2VyX2lkJyksIHttb2RlOiAnY29ycyd9KVxyXG4gICAgICAgICAgICAgICAgLnRoZW4oXHJcbiAgICAgICAgICAgICAgICAgICAgZnVuY3Rpb24ocmVzcG9uc2UpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHJlc3BvbnNlLnN0YXR1cyAhPT0gMjAwKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBnYSgnc2VuZCcsICdldmVudCcsICdiYWNrZ3JvdW5kJywgJ0ZldGNoIGVycm9yOiByZXNwb25zZSBzdGF0dXMnLCByZXNwb25zZS5zdGF0dXMpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbG9nLmVycm9yKFwiZXh0LmluaXQoKSBXcm9uZyByZXNwb25zZSBzdGF0dXM6XCIsIHJlc3BvbnNlLnN0YXR1cyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgcmVzcG9uc2UuanNvbigpLnRoZW4oZnVuY3Rpb24oZGF0YSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbG9nLnRyYWNlKFwiZXh0LmluaXQoKSBGZXRjaGVkIGRhdGE6XCIsIGRhdGEpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGRhdGEucmVzdWx0ID09PSBmYWxzZSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb2cuaW5mbyhcImV4dC5pbml0KCkgVG9rZW4gcmVqZWN0ZWQgd2l0aCBlcnJvclwiLCBkYXRhLmVycm9yX2NvZGUpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0b3JhZ2Uuc2V0KCdwcmVtaXVtX2tleScsIGZhbHNlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoZGF0YS5uZXdfdG9rZW4pXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb2cuaW5mbyhcImV4dC5pbml0KCkgUHJlbWl1bSBrZXkgdXBkYXRlZFwiKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RvcmFnZS5zZXQoJ3ByZW1pdW1fa2V5JywgZGF0YS5uZXdfdG9rZW4pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb2cuaW5mbyhcImV4dC5pbml0KCkgUHJlbWl1bSBrZXkgYWNjZXB0ZWRcIik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIClcclxuICAgICAgICAgICAgICAgIC5jYXRjaChmdW5jdGlvbihlcnIpIHtcclxuICAgICAgICAgICAgICAgICAgICBnYSgnc2VuZCcsICdldmVudCcsICdiYWNrZ3JvdW5kJywgJ0ZldGNoIGVycm9yOiBnbG9iYWwgZXJyb3InLCBlcnIpO1xyXG4gICAgICAgICAgICAgICAgICAgIGxvZy5lcnJvcihcImV4dC5pbml0KCkgRmV0Y2ggZXJyb3JcIiwgZXJyKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy/Qt9Cw0LPRgNGD0LbQtdC90L4g0YDQsNGB0YjQuNGA0LXQvdC40LVcclxuICAgICAgICBnYSgnc2VuZCcsICdldmVudCcsICdiYWNrZ3JvdW5kJywgJ2luaXQnLCBzdG9yYWdlLmdldCgndXNlcl9pZCcpKTtcclxuICAgIH07XHJcblxyXG4gICAgb25TdG9yYWdlQ2hhbmdlID0gZSA9PiB7XHJcbiAgICAgICAgbG9nLnRyYWNlKFwiZXh0Lm9uU3RvcmFnZUNoYW5nZSgpIHdpdGgga2V5IDwlcz5cIiwgZS5rZXkpO1xyXG4gICAgICAgIHN3aXRjaChlLmtleSkge1xyXG4gICAgICAgICAgICBjYXNlIFwic3RvcmUuc2V0dGluZ3MuZ2xvYmFsX21vZGVcIjpcclxuICAgICAgICAgICAgICAgIGJyb3dzZXJBY3Rpb24uaW5pdCgpO1xyXG4gICAgICAgICAgICAgICAgYnJvd3NlckFjdGlvbi51cGRhdGUoKTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgICAgICAgY2FzZSBcInN0b3JlLnNldHRpbmdzLnBvcHVwX3Nob3dfdmFyXCI6XHJcbiAgICAgICAgICAgICAgICBicm93c2VyQWN0aW9uLmNsb3NlUG9wdXAoKTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvL9C/0YDQuCDQuNC30LzQtdC90LXQvdC40Y/RhSBzdG9yYWdlINC+0YLQv9GA0LDQstC70Y/QtdC8INC40YUg0LIgY3NcclxuICAgICAgICBjb25zdCB0YWIgPSB0YWJzLmdldEFjdGl2ZVRhYigpO1xyXG4gICAgICAgIGlmICh0YWIgIT09IGZhbHNlKVxyXG4gICAgICAgICAgICB0YWIuc2VuZCh7YWN0aW9uOiAnc3RvcmFnZScsIHN0b3JhZ2U6IHN0b3JhZ2UuZ2V0QWxsKCl9KTtcclxuICAgIH07XHJcblxyXG4gICAgb25Db25uZWN0ID0gcG9ydCA9PiB7XHJcbiAgICAgICAgbG9nLnRyYWNlKFwiZXh0Lm9uQ29ubmVjdCgpIHBvcnQgJW9cIiwgcG9ydCk7XHJcblxyXG4gICAgICAgIGlmIChwb3J0LnNlbmRlci50YWIgJiYgcG9ydC5uYW1lID09ICd5bXVzaWMnKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgbG9nLnRyYWNlKFwiZXh0Lm9uQ29ubmVjdCgpIGNvbm5lY3QgZnJvbSBDUyBmcm9tIHRhYlwiLCBwb3J0LnNlbmRlci50YWIpO1xyXG4gICAgICAgICAgICBjb25zdCB0YWIgPSB0YWJzLmdldEJ5SWQocG9ydC5zZW5kZXIudGFiLmlkKTtcclxuICAgICAgICAgICAgdGFiLmFkZFBvcnQocG9ydCk7XHJcbiAgICAgICAgICAgIC8v0L/RgNC4INC+0YLQutGA0YvRgtC40Lgg0L/QvtGA0YLQsCDQvtGC0L/RgNCw0LLQu9GP0LXQvCDRgtC10LrRg9GJ0LXQtSDRgdC+0YHRgtC+0Y/QvdC40LUgc3RvcmFnZSDQsiBjc1xyXG4gICAgICAgICAgICB0YWIuc2VuZCh7YWN0aW9uOiAnc3RvcmFnZScsIHN0b3JhZ2U6IHN0b3JhZ2UuZ2V0QWxsKCl9KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8v0YHQvtC10LTQuNC90LXQvdC40LUg0YEgZXh0ZW5zaW9uJ9C+0LxcclxuICAgICAgICBpZiAocG9ydC5uYW1lID09IFwicG9wdXBcIilcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMucG9wdXBDb25uZWN0aW9uID0gbmV3IHBvcnRDbGFzcygncG9wdXAnLCAnaG9zdCcsIHBvcnQpO1xyXG4gICAgICAgICAgICB0aGlzLnBvcHVwQ29ubmVjdGlvbi5hZGRPbk1lc3NhZ2VDYih0aGlzLm9uUG9wdXBNZXNzYWdlKTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG5cclxuICAgIG9uQ29tbWFuZCA9IGNvbW1hbmQgPT4ge1xyXG4gICAgICAgIGxvZy5kZWJ1ZyhcImV4dC5vbkNvbW1hbmQoKSB3aXRoIGNvbW1hbmQgPCVzPlwiLCBjb21tYW5kKTtcclxuXHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgaWYgKHRhYnMuZ2V0QWN0aXZlVGFiKCkgPT09IGZhbHNlKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBsb2cudHJhY2UoXCJleHQub25Db21tYW5kKCkgdGhlcmUgaXMgbm8gYWN0aXZlIHRhYlwiKTtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoIXRoaXMuY29tbWFuZHNbY29tbWFuZF0pXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGxvZy50cmFjZShcImV4dC5vbkNvbW1hbmQoKSBjb21tYW5kIHVua25vd25cIik7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmICh0aGlzLmNvbW1hbmRzW2NvbW1hbmRdLmNvbmZpcm0gJiYgc3RvcmFnZS5nZXQodGhpcy5jb21tYW5kc1tjb21tYW5kXS5jb25maXJtLnN0b3JhZ2VPcHRpb25OYW1lKSlcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgbG9nLmRlYnVnKFwiZXh0Lm9uQ29tbWFuZCgpIGNvbmZpcm1hdGlvbiBuZWVkZWRcIiwgdGhpcy5jb21tYW5kc1tjb21tYW5kXS5jb25maXJtKTtcclxuICAgICAgICAgICAgICAgIGlmIChub3RpZmljYXRpb25zLm5vdGlmaWNhdGlvbnNHcmFudGVkKVxyXG4gICAgICAgICAgICAgICAgICAgIG5vdGlmaWNhdGlvbnMuY3JlYXRlQ29uZmlybWF0aW9uKHRoaXMuY29tbWFuZHNbY29tbWFuZF0uYWN0aW9uLCAodHlwZW9mIHRoaXMuY29tbWFuZHNbY29tbWFuZF0uY29uZmlybS50aXRsZSA9PSAnZnVuY3Rpb24nID8gdGhpcy5jb21tYW5kc1tjb21tYW5kXS5jb25maXJtLnRpdGxlKCkgOiB0aGlzLmNvbW1hbmRzW2NvbW1hbmRdLmNvbmZpcm0udGl0bGUpLCAodHlwZW9mIHRoaXMuY29tbWFuZHNbY29tbWFuZF0uY29uZmlybS5pY29uID09ICdmdW5jdGlvbicgPyB0aGlzLmNvbW1hbmRzW2NvbW1hbmRdLmNvbmZpcm0uaWNvbigpIDogdGhpcy5jb21tYW5kc1tjb21tYW5kXS5jb25maXJtLmljb24pKTtcclxuICAgICAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBsb2cud2FybihcImV4dC5vbkNvbW1hbmQoKSBjb25maXJtYXRpb24gbm90IGdyYW50ZWQsIGFwcGx5aW5nIGFjdGlvblwiKTtcclxuICAgICAgICAgICAgICAgICAgICB0YWJzLmdldEFjdGl2ZVRhYigpLnNlbmQoe2FjdGlvbjogdGhpcy5jb21tYW5kc1tjb21tYW5kXS5hY3Rpb259KTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAodHlwZW9mIHRoaXMuY29tbWFuZHNbY29tbWFuZF0uYWZ0ZXJDYiA9PSAnZnVuY3Rpb24nKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmNvbW1hbmRzW2NvbW1hbmRdLmFmdGVyQ2IoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIGlmICh0eXBlb2YgdGhpcy5jb21tYW5kc1tjb21tYW5kXS5iZWZvcmVDYiAhPSAnZnVuY3Rpb24nIHx8IHRoaXMuY29tbWFuZHNbY29tbWFuZF0uYmVmb3JlQ2IoKSlcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgbG9nLmRlYnVnKFwiZXh0Lm9uQ29tbWFuZCgpIGNvbmZpcm1hdGlvbiBub3QgbmVlZGVkXCIpO1xyXG4gICAgICAgICAgICAgICAgdGFicy5nZXRBY3RpdmVUYWIoKS5zZW5kKHthY3Rpb246IHRoaXMuY29tbWFuZHNbY29tbWFuZF0uYWN0aW9ufSk7XHJcbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIHRoaXMuY29tbWFuZHNbY29tbWFuZF0uYWZ0ZXJDYiA9PSAnZnVuY3Rpb24nKVxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY29tbWFuZHNbY29tbWFuZF0uYWZ0ZXJDYigpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSBjYXRjaCAoZSkgeyB1dGlscy5lcnJvckhhbmRsZXIoZSk7IH1cclxuICAgIH07XHJcblxyXG4gICAgb25JbnN0YWxsZWQgPSBkZXRhaWxzID0+IHtcclxuICAgICAgICBsb2cudHJhY2UoXCJleHQub25JbnN0YWxsZWQoKVwiKTtcclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAvL9C40L3QuNGG0LjQsNC70LjQt9C40YDRg9C10Lwg0YXRgNCw0L3QuNC70LjRidC1INC90LDRgdGC0YDQvtC10LpcclxuICAgICAgICAgICAgc3RvcmFnZS5pbml0KCk7XHJcblxyXG4gICAgICAgICAgICAvL9GD0YHRgtCw0L3QvtCy0LrQsFxyXG4gICAgICAgICAgICBpZihkZXRhaWxzLnJlYXNvbiA9PSBcImluc3RhbGxcIilcclxuICAgICAgICAgICAgICAgIGdhKCdzZW5kJywgJ2V2ZW50JywgJ2JhY2tncm91bmQnLCAnaW5zdGFsbGVkJywgY2hyb21lLnJ1bnRpbWUuZ2V0TWFuaWZlc3QoKS52ZXJzaW9uKTtcclxuICAgICAgICAgICAgLy/QvtCx0L3QvtCy0LvQtdC90LjQtSAo0L/RgNC4INGD0YHQu9C+0LLQuNC4LCDRh9GC0L4g0LLQtdGA0YHQuNGPINC40LfQvNC10L3QuNC70LDRgdGMKVxyXG4gICAgICAgICAgICBlbHNlIGlmKGRldGFpbHMucmVhc29uID09IFwidXBkYXRlXCIgJiYgZGV0YWlscy5wcmV2aW91c1ZlcnNpb24gIT0gY2hyb21lLnJ1bnRpbWUuZ2V0TWFuaWZlc3QoKS52ZXJzaW9uKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBnYSgnc2VuZCcsICdldmVudCcsICdiYWNrZ3JvdW5kJywgJ3VwZGF0ZWQnLCBgJHtkZXRhaWxzLnByZXZpb3VzVmVyc2lvbn0+JHtjaHJvbWUucnVudGltZS5nZXRNYW5pZmVzdCgpLnZlcnNpb259YCk7XHJcblxyXG4gICAgICAgICAgICAgICAgLy/QtdGB0LvQuCDQsiDQvdCw0YHRgtGA0L7QudC60LDRhSDRgdGC0L7QuNGCINC+0YLQutGA0YvRgtC40LUg0YHRgtGA0LDQvdC40YbRiyDQvdCw0YHRgtGA0L7QtdC6INC90LAg0LLQutC70LDQtNC60LUg0LjRgdGC0L7RgNC40Y8g0LjQt9C80LXQvdC10L3QuNC5INC4INCyINC90L7QstC+0YHRgtGP0YUg0LXRgdGC0Ywg0L7Qv9C40YHQsNC90LjQtVxyXG4gICAgICAgICAgICAgICAgLy/QtNCw0L3QvdC+0Lkg0LLQtdGA0YHQuNC4IC0g0L7RgtC60YDRi9Cy0LDQtdC8INGB0YLRgNCw0L3QuNGG0YMg0L3QsNGB0YLRgNC+0LXQuiDQsNCy0YLQvtC80LDRgtC+0LxcclxuICAgICAgICAgICAgICAgIGlmIChzdG9yYWdlLmdldCgnYXV0b29wZW4nKSAmJiBuZXdzW2Nocm9tZS5ydW50aW1lLmdldE1hbmlmZXN0KCkudmVyc2lvbl0pXHJcbiAgICAgICAgICAgICAgICAgICAgY2hyb21lLnRhYnMuY3JlYXRlKHsgdXJsOiBcIi9vcHRpb25zL2luZGV4Lmh0bWxcIiB9KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0gY2F0Y2ggKGUpIHsgdXRpbHMuZXJyb3JIYW5kbGVyKGUpOyB9XHJcbiAgICB9O1xyXG5cclxuICAgIG9uTWVzc2FnZUV4dGVybmFsID0gKHJlcXVlc3QsIHNlbmRlciwgc2VuZFJlc3BvbnNlKSA9PiB7XHJcbiAgICAgICAgbG9nLnRyYWNlKFwiZXh0Lm9uTWVzc2FnZUV4dGVybmFsKCkgcmVxdWVzdCAlbyBmcm9tIHNlbmRlciAlb1wiLCByZXF1ZXN0LCBzZW5kZXIpO1xyXG4gICAgICAgIGlmIChzZW5kZXIuaWQgIT0gRVhURVJOQUxfRVhURU5TSU9OX0lEKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgbG9nLnRyYWNlKFwiZXh0Lm9uTWVzc2FnZUV4dGVybmFsKCkgbWVzc2FnZSBmcm9tIHVua25vd24gc2VuZGVyLCBza2lwcGVkXCIpO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBsb2cudHJhY2UoXCJleHQub25NZXNzYWdlRXh0ZXJuYWwoKSBtYWtlIHNvbWUgYWN0aW9uXCIpO1xyXG5cclxuICAgIC8vICAgIGlmIChyZXF1ZXN0LmNvbW1hbmQgPT0gJ3N0YXRlJylcclxuICAgIC8vICAgIHtcclxuICAgIC8vICAgICAgICBzZW5kUmVzcG9uc2Uoe3Jlc3VsdDogdHJ1ZSwgc3RhdGU6IGJnLnRhYnMuZ2V0QWN0aXZlVGFiKCkucGxheWVyfSk7XHJcbiAgICAvLyAgICAgICAgcmV0dXJuO1xyXG4gICAgLy8gICAgfVxyXG4gICAgLy9cclxuICAgIC8vICAgIHRoaXMub25Db21tYW5kKFwicGxheWVyX1wiK3JlcXVlc3QuY29tbWFuZCk7XHJcbiAgICAvLyAgICBzZW5kUmVzcG9uc2Uoe3Jlc3VsdDogdHJ1ZX0pO1xyXG4gICAgfTtcclxuXHJcbiAgICBvblBvcHVwRGlzY29ubmVjdCA9ICgpID0+IHtcclxuICAgICAgICBsb2cudHJhY2UoXCJleHQub25Qb3B1cERpc2Nvbm5lY3QoKVwiKTtcclxuICAgICAgICAvL9C00L4g0YDQtdGE0LDQutGC0L7RgNC40L3Qs9CwINCy0L7Qt9C90LjQutCw0LvQsCDQv9GA0L7QsdC70LXQvNCwINC60L7Qs9C00LAg0L/RgNC4INC40LfQvNC10L3QtdC90LjQuCDRg9GA0LvQsCDRgdGC0YDQsNC90LjRhtGLINC90LUg0L/RgNC+0LjRgdGF0L7QtNC40YIg0YHQvtCx0YvRgtC40LUgb251bmxvYWQg0Lgg0Y3RgtC+XHJcbiAgICAgICAgLy/Qv9GA0LjQstC+0LTQuNGCINC6INC+0YjQuNCx0LrQtSwg0L3QviDQt9Cw0YLQviDQv9GA0L7QuNGB0YXQvtC00LjRgiDRgdC+0LHRi9GC0LjQtSBvbkRpc2Nvbm5lY3Qg0YMg0L/QvtGA0YLQsCwg0L/QvtGN0YLQvtC80YMg0LTRg9Cx0LvQuNGA0YPQtdC8INGE0YPQvdC60YbQuNC+0L3QsNC7INC30LDQutGA0YvRgtC40Y9cclxuICAgICAgICAvL9Cy0LrQu9Cw0LTQutC4XHJcbiAgICAgICAgLy90YWJzLnNodXRkb3duKHRoaXMuaWQpO1xyXG4gICAgICAgIC8vdGhpcy5wb3B1cENvbm5lY3Rpb24gPSBudWxsO1xyXG4gICAgfTtcclxuXHJcbiAgICBvblBvcHVwTWVzc2FnZSA9IChtc2csIHBvcnQpID0+IHtcclxuICAgICAgICBsb2cudHJhY2UoXCJleHQub25Qb3B1cE1lc3NhZ2UoKSB3aXRoIG1lc3NhZ2UgJW8gZnJvbSBwb3J0ICVvXCIsIG1zZywgcG9ydCk7XHJcbiAgICAgICAgLy9pZiAoIW1zZy5hY3Rpb24pXHJcbiAgICAgICAgLy97XHJcbiAgICAgICAgLy8gICAgbG9nLnRyYWNlKFwiZXh0Lm9uUG9wdXBNZXNzYWdlKCkgaW52YWxpZCBtZXNzYWdlXCIpO1xyXG4gICAgICAgIC8vICAgIHJldHVybjtcclxuICAgICAgICAvL31cclxuICAgICAgICAvL2NvbnN0IGFjdGlvbkxpc3RlbmVyTmFtZSA9IGBvbiR7bXNnLmFjdGlvbi5jYXBpdGFsaXplKCl9QWN0aW9uYDtcclxuICAgICAgICAvL1xyXG4gICAgICAgIC8vaWYgKCF0aGlzLmhhc093blByb3BlcnR5KGFjdGlvbkxpc3RlbmVyTmFtZSkpXHJcbiAgICAgICAgLy97XHJcbiAgICAgICAgLy8gICAgbG9nLnRyYWNlKFwiZXh0Lm9uUG9wdXBNZXNzYWdlKCkgbGlzdGVuZXIgb2YgYWN0aW9uIDwlcz4gbm90IGRlZmluZWRcIiwgbXNnLmFjdGlvbik7XHJcbiAgICAgICAgLy8gICAgcmV0dXJuO1xyXG4gICAgICAgIC8vfVxyXG4gICAgICAgIC8vXHJcbiAgICAgICAgLy90cnkge1xyXG4gICAgICAgIC8vICAgIGNvbnN0IGlzQWN0aXZlID0gKHRhYnMuZ2V0QWN0aXZlVGFiKCkuaWQgPT0gdGhpcy5pZCk7XHJcbiAgICAgICAgLy8gICAgbG9nLnRyYWNlKFwiZXh0Lm9uUG9wdXBNZXNzYWdlKCkgY2FsbGluZyBhY3Rpb24gbGlzdGVuZXIgPCVzPiwgaXMgYWN0aXZlIHRhYiA8JW8+XCIsIGFjdGlvbkxpc3RlbmVyTmFtZSwgaXNBY3RpdmUpO1xyXG4gICAgICAgIC8vICAgIHRoaXNbYWN0aW9uTGlzdGVuZXJOYW1lXS5jYWxsKHRoaXMsIG1zZywgaXNBY3RpdmUpO1xyXG4gICAgICAgIC8vfVxyXG4gICAgICAgIC8vY2F0Y2ggKGUpIHsgdXRpbHMuZXJyb3JIYW5kbGVyKGUpOyB9XHJcbiAgICB9O1xyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBuZXcgZXh0KCk7IiwiaW1wb3J0IGxvZyBmcm9tICdsb2dsZXZlbCc7XHJcbmltcG9ydCBzdG9yYWdlIGZyb20gJy4vc3RvcmFnZSc7XHJcbmltcG9ydCBqcXVlcnlfZXh0ZW5kIGZyb20gJ2pxdWVyeS1leHRlbmQnO1xyXG5pbXBvcnQgdGFicyBmcm9tICcuL3RhYnMnO1xyXG5pbXBvcnQgdXRpbHMgZnJvbSAnLi4vY29tbW9uL3V0aWxzJztcclxuXHJcbi8v0L/QvtC00YDQsNC30YPQvNC10LLQsNC10YLRgdGPLCDRh9GC0L4g0LIg0L7QtNC40L0g0LzQvtC80LXQvdGCINCy0YDQtdC80LXQvdC4INCy0L7Qt9C80L7QttC90L4g0YLQvtC70YzQutC+INC+0LTQvdC+INGD0LLQtdC00L7QvNC70LXQvdC40LUg0L7RgiDRgNCw0YHRiNC40YDQtdC90LjRj1xyXG5jbGFzcyBub3RpZmljYXRpb25zIHtcclxuICAgIC8v0YHQv9C40YHQvtC6INC00L7RgdGC0YPQv9C90YvRhSDQutC90L7Qv9C+0Log0Lgg0LTQtdC50YHRgtCy0LjQuSDQv9C+INC40YUg0L3QsNC20LDRgtC40Y5cclxuICAgIGJ1dHRvbnMgPSB7XHJcbiAgICAgICAgLy8yINCy0L7Qt9C80L7QttC90YvQtSDQutC90L7Qv9C60Lgg0LIg0YDQtdC20LjQvNC1INC80YPQt9GL0LrQuFxyXG4gICAgICAgIG11c2ljOiBbXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHZhbHVlOiAoKSA9PiBzdG9yYWdlLmdldCgnZGlzbGlrZScpLFxyXG4gICAgICAgICAgICAgICAgYWN0aW9uOiAnZGlzbGlrZScsXHJcbiAgICAgICAgICAgICAgICB0aXRsZTogJ9Cd0LUg0YDQtdC60L7QvNC10L3QtNC+0LLQsNGC0YwnLFxyXG4gICAgICAgICAgICAgICAgaWNvbjogJ2ltYWdlcy9kb250cmVjb21tZW5kLnN2ZycsXHJcbiAgICAgICAgICAgICAgICBjb25maXJtOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGl0bGU6ICfQktGLINGD0LLQtdGA0LXQvdGLINGH0YLQviDRhdC+0YLQuNGC0LUg0L7RgtC80LXRgtC40YLRjCDRgtGA0LXQuiDQutCw0LogXCLQndC1INGA0LXQutC+0LzQtdC90LTQvtCy0LDRgtGMXCI/JyxcclxuICAgICAgICAgICAgICAgICAgICBpY29uOiAnaW1hZ2VzL2RvbnRyZWMtbm90aWYucG5nJyxcclxuICAgICAgICAgICAgICAgICAgICBvcHRpb246ICdtcl9kaXNsaWtlX2FjdGlvbidcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgdmFsdWU6ICgpID0+IHN0b3JhZ2UuZ2V0KCdhZGR0bycpLFxyXG4gICAgICAgICAgICAgICAgYWN0aW9uOiAnbGlrZScsXHJcbiAgICAgICAgICAgICAgICB0aXRsZTogWyfQo9Cx0YDQsNGC0Ywg0LjQtyBcItCc0L7QtdC5INC80YPQt9GL0LrQuFwiJywgJ9CU0L7QsdCw0LLQuNGC0Ywg0LIgXCLQnNC+0Y4g0LzRg9C30YvQutGDXCInXSxcclxuICAgICAgICAgICAgICAgIGljb246IFsnaW1hZ2VzL2xpa2Uuc3ZnJywgJ2ltYWdlcy91bmxpa2Uuc3ZnJ10sXHJcbiAgICAgICAgICAgICAgICBpbnZQYXJhbTogJ2xpa2VkJ1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICB2YWx1ZTogKCkgPT4gc3RvcmFnZS5nZXQoJ25leHQnKSxcclxuICAgICAgICAgICAgICAgIGFjdGlvbjogJ25leHQnLFxyXG4gICAgICAgICAgICAgICAgdGl0bGU6ICfQodC70LXQtNGD0Y7RidC40Lkg0YLRgNC10LonLFxyXG4gICAgICAgICAgICAgICAgaWNvbjogJ2ltYWdlcy95YV9uZXh0LnN2ZydcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIF0sXHJcbiAgICAgICAgLy8zINCy0L7Qt9C80L7QttC90YvQtSDQutC90L7Qv9C60Lgg0LIg0YDQtdC20LjQvNC1INC80YPQt9GL0LrQuC3RgNCw0LTQuNC+XHJcbiAgICAgICAgbXVzaWNyYWRpbzpbXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHZhbHVlOiAoKSA9PiBzdG9yYWdlLmdldCgnbXJfZGlzbGlrZScpLFxyXG4gICAgICAgICAgICAgICAgYWN0aW9uOiAnZGlzbGlrZScsXHJcbiAgICAgICAgICAgICAgICB0aXRsZTogJ9Cd0LUg0L3RgNCw0LLQuNGC0YHRjycsXHJcbiAgICAgICAgICAgICAgICBpY29uOiAnaW1hZ2VzL3JhZGlvX2Rpc2xpa2Uuc3ZnJyxcclxuICAgICAgICAgICAgICAgIGNvbmZpcm06IHtcclxuICAgICAgICAgICAgICAgICAgICB0aXRsZTogJ9CS0Ysg0YPQstC10YDQtdC90Ysg0YfRgtC+INGF0L7RgtC40YLQtSDQvtGC0LzQtdGC0LjRgtGMINGC0YDQtdC6INC60LDQuiBcItCd0LUg0L3RgNCw0LLQuNGC0YHRj1wiPycsXHJcbiAgICAgICAgICAgICAgICAgICAgaWNvbjogJ2ltYWdlcy9kaXNsaWtlLW5vdGlmLnBuZycsXHJcbiAgICAgICAgICAgICAgICAgICAgb3B0aW9uOiAnbXJfZGlzbGlrZV9hY3Rpb24nXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHZhbHVlOiAoKSA9PiBzdG9yYWdlLmdldCgnbXJfYWRkdG8nKSxcclxuICAgICAgICAgICAgICAgIGFjdGlvbjogJ2xpa2UnLFxyXG4gICAgICAgICAgICAgICAgdGl0bGU6IFsn0KPQsdGA0LDRgtGMINC40LcgXCLQnNC+0LXQuSDQvNGD0LfRi9C60LhcIicsICfQlNC+0LHQsNCy0LjRgtGMINCyIFwi0JzQvtGOINC80YPQt9GL0LrRg1wiJ10sXHJcbiAgICAgICAgICAgICAgICBpY29uOiBbJ2ltYWdlcy9saWtlLnN2ZycsICdpbWFnZXMvdW5saWtlLnN2ZyddLFxyXG4gICAgICAgICAgICAgICAgaW52UGFyYW06ICdsaWtlZCdcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgdmFsdWU6ICgpID0+IHN0b3JhZ2UuZ2V0KCdtcl9uZXh0JyksXHJcbiAgICAgICAgICAgICAgICBhY3Rpb246ICduZXh0JyxcclxuICAgICAgICAgICAgICAgIHRpdGxlOiAn0KHQu9C10LTRg9GO0YnQuNC5INGC0YDQtdC6JyxcclxuICAgICAgICAgICAgICAgIGljb246ICdpbWFnZXMveWFfbmV4dC5zdmcnXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICBdLFxyXG4gICAgICAgIC8vMyDQstC+0LfQvNC+0LbQvdGL0LUg0LrQvdC+0L/QutC4INCyINGA0LXQttC40LzQtSDRgNCw0LTQuNC+XHJcbiAgICAgICAgcmFkaW86IFtcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgdmFsdWU6ICgpID0+IHN0b3JhZ2UuZ2V0KCdyYWRpb19kaXNsaWtlJyksXHJcbiAgICAgICAgICAgICAgICBhY3Rpb246ICdkaXNsaWtlJyxcclxuICAgICAgICAgICAgICAgIHRpdGxlOiAn0J3QtSDQvdGA0LDQstC40YLRgdGPJyxcclxuICAgICAgICAgICAgICAgIGljb246ICdpbWFnZXMvcmFkaW9fZGlzbGlrZS5zdmcnLFxyXG4gICAgICAgICAgICAgICAgY29uZmlybToge1xyXG4gICAgICAgICAgICAgICAgICAgIHRpdGxlOiAn0JLRiyDRg9Cy0LXRgNC10L3RiyDRh9GC0L4g0YXQvtGC0LjRgtC1INC+0YLQvNC10YLQuNGC0Ywg0YLRgNC10Log0LrQsNC6IFwi0J3QtSDQvdGA0LDQstC40YLRgdGPXCI/JyxcclxuICAgICAgICAgICAgICAgICAgICBpY29uOiAnaW1hZ2VzL2Rpc2xpa2Utbm90aWYucG5nJyxcclxuICAgICAgICAgICAgICAgICAgICBvcHRpb246ICdyYWRpb19kaXNsaWtlX2FjdGlvbidcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgdmFsdWU6ICgpID0+IHN0b3JhZ2UuZ2V0KCdyYWRpb19saWtlJyksXHJcbiAgICAgICAgICAgICAgICBhY3Rpb246ICdsaWtlJyxcclxuICAgICAgICAgICAgICAgIHRpdGxlOiBbJ9Cj0LHRgNCw0YLRjCDQvtGC0LzQtdGC0LrRgyBcItCd0YDQsNCy0LjRgtGB0Y9cIicsICfQndGA0LDQstC40YLRgdGPJ10sXHJcbiAgICAgICAgICAgICAgICBpY29uOiBbJ2ltYWdlcy9saWtlLnN2ZycsICdpbWFnZXMvcmFkaW9fbGlrZS5zdmcnXSxcclxuICAgICAgICAgICAgICAgIGludlBhcmFtOiAnbGlrZWQnXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHZhbHVlOiAoKSA9PiBzdG9yYWdlLmdldCgncmFkaW9fbmV4dCcpLFxyXG4gICAgICAgICAgICAgICAgYWN0aW9uOiAnbmV4dCcsXHJcbiAgICAgICAgICAgICAgICB0aXRsZTogJ9Ch0LvQtdC00YPRjtGJ0LjQuSDRgtGA0LXQuicsXHJcbiAgICAgICAgICAgICAgICBpY29uOiAnaW1hZ2VzL3lhX25leHQuc3ZnJ1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgXVxyXG4gICAgfTtcclxuICAgIGNvbmZpcm1CdXR0b25zID0gW1xyXG4gICAgICAgIHt0aXRsZTogJ9CU0LAnLCBjb25maXJtOiB0cnVlfSxcclxuICAgICAgICB7dGl0bGU6ICfQndC10YInfVxyXG4gICAgXTtcclxuICAgIGNvbmZpcm1UaW1lb3V0ID0gNTAwMDtcclxuICAgIC8v0YTQu9Cw0LMg0YDQsNC30YDQtdGI0LXQvdC90YvRhSDRg9Cy0LXQtNC+0LzQu9C10L3QuNC5XHJcbiAgICBub3RpZmljYXRpb25zR3JhbnRlZCA9IGZhbHNlO1xyXG4gICAgLy/RgtCw0LnQvNC10YAg0LDQstGC0L7Qt9Cw0LrRgNGL0YLQuNGPINGD0LLQtdC00L7QvNC70LXQvdC40Y9cclxuICAgIGF1dG9DbG9zZVRpbWVyID0gbnVsbDtcclxuICAgIGF1dG9DbG9zZVRpbWVyVG9hc3QgPSBudWxsO1xyXG4gICAgLy/QuNC00LXQvdGC0LjRhNC40LrQsNGC0L7RgFxyXG4gICAgaWQgPSBudWxsO1xyXG4gICAgLy/QuNC00LXQvdGC0LjRhNC40LrQsNGC0L7RgFxyXG4gICAgdG9hc3RJZCA9IG51bGw7XHJcbiAgICAvL9GE0LvQsNCzINC90LDRhdC+0LTQuNGC0YHRjyDQu9C4INGD0LLQtdC00L7QvNC70LXQvdC40LUg0LIg0YHRgtCw0LTQuNC4INC/0L7QtNGC0LLQtdGA0LbQtNC10L3QuNGPXHJcbiAgICBpc0NvbmZpcm0gPSBmYWxzZTtcclxuICAgIC8v0YLQuNC/INC/0LvQtdC10YDQsFxyXG4gICAgcGxheWVyTW9kZSA9IG51bGw7XHJcblxyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgbG9nLmRlYnVnKFwibm90aWZpY2F0aW9ucy5jb25zdHJ1Y3RvcigpXCIpO1xyXG5cclxuICAgICAgICAvL9C/0YDQvtCy0LXRgNC60LAg0L/RgNCw0LIg0L3QsCDRg9Cy0LXQtNC+0LzQu9C10L3QuNGPXHJcbiAgICAgICAgY2hyb21lLm5vdGlmaWNhdGlvbnMuZ2V0UGVybWlzc2lvbkxldmVsKGxldmVsID0+IHtcclxuICAgICAgICAgICAgaWYgKGxldmVsID09ICdncmFudGVkJylcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgbG9nLmRlYnVnKFwibm90aWZpY2F0aW9ucy5jb25zdHJ1Y3RvcigpIG5vdGlmaWNhdGlvbnMgZ3JhbnRlZFwiKTtcclxuICAgICAgICAgICAgICAgIHRoaXMubm90aWZpY2F0aW9uc0dyYW50ZWQgPSB0cnVlO1xyXG5cclxuICAgICAgICAgICAgICAgIC8v0YHQu9GD0YjQsNGC0LXQu9GMINC60LvQuNC60L7QsiDQv9C+INGD0LLQtdC00L7QvNC70LXQvdC40Y5cclxuICAgICAgICAgICAgICAgIGNocm9tZS5ub3RpZmljYXRpb25zLm9uQ2xpY2tlZC5hZGRMaXN0ZW5lcih0aGlzLm9uQ2xpY2tlZCk7XHJcbiAgICAgICAgICAgICAgICAvL9GB0LvRg9GI0LDRgtC10LvRjCDQutC70LjQutC+0LIg0L/QviDQutC90L7Qv9C60LDQvCDRg9Cy0LXQtNC+0LzQu9C10L3QuNGPXHJcbiAgICAgICAgICAgICAgICBjaHJvbWUubm90aWZpY2F0aW9ucy5vbkJ1dHRvbkNsaWNrZWQuYWRkTGlzdGVuZXIodGhpcy5vbkJ1dHRvbkNsaWNrZWQpO1xyXG4gICAgICAgICAgICAgICAgLy/RgdC70YPRiNCw0YLQtdC70Ywg0LfQsNC60YDRi9GC0LjRjyDRg9Cy0LXQtNC+0LzQu9C10L3QuNGPXHJcbiAgICAgICAgICAgICAgICBjaHJvbWUubm90aWZpY2F0aW9ucy5vbkNsb3NlZC5hZGRMaXN0ZW5lcih0aGlzLm9uQ2xvc2VkKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgICAgICBsb2cud2FybihcIm5vdGlmaWNhdGlvbnMuY29uc3RydWN0b3IoKSBub3RpZmljYXRpb25zIGRlbmllZFwiKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgdGhpcy5jcmVhdGUgPSB0aGlzLmNyZWF0ZS5iaW5kKHRoaXMpO1xyXG4gICAgfVxyXG5cclxuICAgIG9uQ2xvc2VkID0gKGlkLCBieVVzZXIpID0+IHtcclxuICAgICAgICBsb2cuZGVidWcoXCJub3RpZmljYXRpb25zLm9uQ2xvc2VkKCkgd2l0aCBpZCA8JXM+LCBieVVzZXIgPCVvPlwiLCBpZCwgYnlVc2VyKTtcclxuICAgICAgICBpZiAodGhpcy5pZCAmJiBpZCA9PSB0aGlzLmlkKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgY2xlYXJUaW1lb3V0KHRoaXMuYXV0b0Nsb3NlVGltZXIpO1xyXG4gICAgICAgICAgICB0aGlzLmlkID0gbnVsbDtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHRoaXMudG9hc3RJZCAmJiBpZCA9PSB0aGlzLnRvYXN0SWQpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBjbGVhclRpbWVvdXQodGhpcy5hdXRvQ2xvc2VUaW1lclRvYXN0KTtcclxuICAgICAgICAgICAgdGhpcy50b2FzdElkID0gbnVsbDtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG5cclxuICAgIGNsZWFyID0gKGlkKSA9PiB7XHJcbiAgICAgICAgbG9nLmRlYnVnKFwibm90aWZpY2F0aW9ucy5jbGVhcigpXCIpO1xyXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XHJcbiAgICAgICAgICAgIGlmICghaWQpXHJcbiAgICAgICAgICAgICAgICByZXNvbHZlKCk7XHJcbiAgICAgICAgICAgIC8v0LLRi9C30L7QstC10YIg0YHQvtCx0YvRgtC40LUgb25DbG9zZWRcclxuICAgICAgICAgICAgY2hyb21lLm5vdGlmaWNhdGlvbnMuY2xlYXIoaWQsICgpID0+IHJlc29sdmUoKSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9O1xyXG5cclxuICAgIF9jcmVhdGVOb3RpZmljYXRpb24oaWNvbiwgbXNnLCBidXR0b25zPVtdLCB0aW1lclZhciwgdGltZXI9c3RvcmFnZS5nZXQoJ3RpbWUnKSAqIDEwMDAsIG5vdGlmSWQ9dXRpbHMuZ3VpZCgpKSB7XHJcbiAgICAgICAgbG9nLmRlYnVnKFwibm90aWZpY2F0aW9ucy5fY3JlYXRlTm90aWZpY2F0aW9uKCkgd2l0aCBtZXNzYWdlIDwlcz4gYW5kIGljb24gPCVzPlwiLCBtc2csIGljb24pO1xyXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XHJcbiAgICAgICAgICAgIGlmICghdGhpcy5ub3RpZmljYXRpb25zR3JhbnRlZClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgbG9nLmRlYnVnKFwibm90aWZpY2F0aW9ucy5fY3JlYXRlTm90aWZpY2F0aW9uKCkgbm90aWZpY2F0aW9ucyBub3QgZ3JhbnRlZFwiKTtcclxuICAgICAgICAgICAgICAgIHJlc29sdmUoKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy/RgdC+0LfQtNCw0LXQvCDRgtC10LvQviDRg9Cy0LXQtNC+0LzQu9C10L3QuNGPXHJcbiAgICAgICAgICAgIGxldCBvcHRpb25zID0ge1xyXG4gICAgICAgICAgICAgICAgdGl0bGU6IG1zZyxcclxuICAgICAgICAgICAgICAgIGljb25Vcmw6IGljb24sXHJcbiAgICAgICAgICAgICAgICB0eXBlOiAnYmFzaWMnLFxyXG4gICAgICAgICAgICAgICAgbWVzc2FnZTogJydcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgaWYgKGJ1dHRvbnMgJiYgYnV0dG9ucy5sZW5ndGgpXHJcbiAgICAgICAgICAgICAgICBvcHRpb25zLmJ1dHRvbnMgPSBidXR0b25zO1xyXG4gICAgICAgICAgICBsb2cuZGVidWcoXCJub3RpZmljYXRpb25zLl9jcmVhdGVOb3RpZmljYXRpb24oKSBjcmVhdGluZyBub3RpZmljYXRpb24sIG9wdGlvbnMgJW9cIiwgb3B0aW9ucyk7XHJcbiAgICAgICAgICAgIGNocm9tZS5ub3RpZmljYXRpb25zLmNyZWF0ZShub3RpZklkLCBvcHRpb25zLCBpZCA9PiB7XHJcbiAgICAgICAgICAgICAgICAvL9C30LDQv9GD0YHQutCw0LXQvCDRgtCw0LnQvNC10YAg0LDQutGC0L7Qt9Cw0LrRgNGL0YLQuNGPINC/0L4g0YLQsNC50LzQtdGA0YNcclxuICAgICAgICAgICAgICAgIHRpbWVyVmFyID0gc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jbGVhcihpZCk7XHJcbiAgICAgICAgICAgICAgICB9LCB0aW1lcik7XHJcblxyXG4gICAgICAgICAgICAgICAgLy/QstC+0LfQstGA0LDRidCw0LXQvCDQuNC00LXQvdGC0LjRhNC40LrQsNGC0L7RgFxyXG4gICAgICAgICAgICAgICAgcmVzb2x2ZShpZCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIGNyZWF0ZShwbGF5ZXIsIHBsYXllck1vZGUpIHtcclxuICAgICAgICBsb2cuZGVidWcoXCJub3RpZmljYXRpb25zLmNyZWF0ZSgpIHdpdGggcGxheWVyICVvIGFuZCBwbGF5ZXJNb2RlIDwlcz5cIiwgcGxheWVyLCBwbGF5ZXJNb2RlKTtcclxuXHJcbiAgICAgICAgLy/Rg9Cx0LjRgNCw0LXQvCDRg9Cy0LXQtNC+0LzQu9C10L3QuNC1INC4INC00LDQu9C10LUg0YHQvtC30LTQsNC10Lwg0L3QvtCy0L7QtVxyXG4gICAgICAgIHRoaXMuY2xlYXIodGhpcy5pZCkudGhlbigoKSA9PiB7XHJcbiAgICAgICAgICAgIC8v0YHQvtC30LTQsNC10Lwg0LrQvdC+0L/QutC4XHJcbiAgICAgICAgICAgIGxldCBidG5zID0gW107XHJcbiAgICAgICAgICAgIHRoaXMuYnV0dG9uc1twbGF5ZXJNb2RlXS5maWx0ZXIoaXRlbSA9PiBpdGVtLnZhbHVlKCkpLmZvckVhY2goaXRlbSA9PiB7XHJcbiAgICAgICAgICAgICAgICBidG5zLnB1c2goe1xyXG4gICAgICAgICAgICAgICAgICAgIHRpdGxlOiAhaXRlbS5pbnZQYXJhbSA/IGl0ZW0udGl0bGUgOiBpdGVtLnRpdGxlW35+IXBsYXllci50cmFja1tpdGVtLmludlBhcmFtXV0sXHJcbiAgICAgICAgICAgICAgICAgICAgaWNvblVybDogIWl0ZW0uaW52UGFyYW0gPyBpdGVtLmljb24gOiBpdGVtLmljb25bfn4hcGxheWVyLnRyYWNrW2l0ZW0uaW52UGFyYW1dXVxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5fY3JlYXRlTm90aWZpY2F0aW9uKFxyXG4gICAgICAgICAgICAgICAgcGxheWVyLmdldENvdmVyVVJMKFwiODB4ODBcIiksXHJcbiAgICAgICAgICAgICAgICBgJHtwbGF5ZXIuZ2V0QXJ0aXN0cygpfSAtICR7cGxheWVyLnRyYWNrLnRpdGxlfWAgKyAoc3RvcmFnZS5nZXQoJ3BvcHVwX3Nob3dfdmVyc2lvbicpICYmIHBsYXllci50cmFjay52ZXJzaW9uID8gYCAoJHtwbGF5ZXIudHJhY2sudmVyc2lvbn0pYCA6ICcnKSxcclxuICAgICAgICAgICAgICAgIGJ0bnMsXHJcbiAgICAgICAgICAgICAgICB0aGlzLmF1dG9DbG9zZVRpbWVyXHJcbiAgICAgICAgICAgICkudGhlbihpZCA9PiB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnBsYXllck1vZGUgPSBwbGF5ZXJNb2RlO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5pc0NvbmZpcm0gPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgIHRoaXMuaWQgPSBpZDtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgY3JlYXRlVG9hc3QoaWNvbiwgbXNnKSB7XHJcbiAgICAgICAgbG9nLmRlYnVnKFwibm90aWZpY2F0aW9ucy5jcmVhdGVUb2FzdCgpIHdpdGggbWVzc2FnZSA8JXM+IGFuZCBpY29uIDwlcz5cIiwgbXNnLCBpY29uKTtcclxuXHJcbiAgICAgICAgLy/Rg9Cx0LjRgNCw0LXQvCDRg9Cy0LXQtNC+0LzQu9C10L3QuNC1INC4INC00LDQu9C10LUg0YHQvtC30LTQsNC10Lwg0L3QvtCy0L7QtVxyXG4gICAgICAgIHRoaXMuY2xlYXIodGhpcy50b2FzdElkKS50aGVuKCgpID0+IHtcclxuICAgICAgICAgICAgdGhpcy5fY3JlYXRlTm90aWZpY2F0aW9uKFxyXG4gICAgICAgICAgICAgICAgaWNvbixcclxuICAgICAgICAgICAgICAgIG1zZyxcclxuICAgICAgICAgICAgICAgIG51bGwsXHJcbiAgICAgICAgICAgICAgICB0aGlzLmF1dG9DbG9zZVRpbWVyVG9hc3RcclxuICAgICAgICAgICAgKS50aGVuKGlkID0+IHtcclxuICAgICAgICAgICAgICAgIHRoaXMudG9hc3RJZCA9IGlkO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBjcmVhdGVDb25maXJtYXRpb24gPSAoYWN0aW9uLCBxdWVzdGlvbiwgaWNvbikgPT4ge1xyXG4gICAgICAgIGxvZy5kZWJ1ZyhcIm5vdGlmaWNhdGlvbnMuY3JlYXRlQ29uZmlybWF0aW9uKCkgd2l0aCBhY3Rpb24gPCVzPiwgcXVlc3Rpb24gPCVzPiwgaWNvbiA8JXM+XCIsIGFjdGlvbiwgcXVlc3Rpb24sIGljb24pO1xyXG5cclxuICAgICAgICBjb25zdCB0YWIgPSB0YWJzLmdldEFjdGl2ZVRhYigpO1xyXG5cclxuICAgICAgICBjbGVhclRpbWVvdXQodGhpcy5hdXRvQ2xvc2VUaW1lcik7XHJcblxyXG4gICAgICAgIGlmICghdGFiKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgbG9nLmRlYnVnKFwibm90aWZpY2F0aW9ucy5jcmVhdGVDb25maXJtYXRpb24oKSB0aGVyZSBpcyBubyBhY3RpdmUgdGFic1wiKTtcclxuICAgICAgICAgICAgdGhpcy5jbGVhcih0aGlzLmlkKTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgbGV0IGJ0bnMgPSBbXTtcclxuICAgICAgICB0aGlzLmNvbmZpcm1CdXR0b25zLmZvckVhY2goYnV0dG9uID0+IHsgYnRucy5wdXNoKHt0aXRsZTogYnV0dG9uLnRpdGxlfSk7IH0pO1xyXG5cclxuICAgICAgICAvL9GD0LHQuNGA0LDQtdC8INGD0LLQtdC00L7QvNC70LXQvdC40LUg0Lgg0LTQsNC70LXQtSDRgdC+0LfQtNCw0LXQvCDQvdC+0LLQvtC1XHJcbiAgICAgICAgdGhpcy5jbGVhcih0aGlzLmlkKS50aGVuKCgpID0+IHtcclxuICAgICAgICAgICAgdGhpcy5fY3JlYXRlTm90aWZpY2F0aW9uKFxyXG4gICAgICAgICAgICAgICAgaWNvbixcclxuICAgICAgICAgICAgICAgIHF1ZXN0aW9uLFxyXG4gICAgICAgICAgICAgICAgYnRucyxcclxuICAgICAgICAgICAgICAgIHRoaXMuYXV0b0Nsb3NlVGltZXIsXHJcbiAgICAgICAgICAgICAgICB0aGlzLmNvbmZpcm1UaW1lb3V0XHJcbiAgICAgICAgICAgICkudGhlbihpZCA9PiB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmNvbmZpcm1BY3Rpb24gPSBhY3Rpb247XHJcbiAgICAgICAgICAgICAgICB0aGlzLmlzQ29uZmlybSA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmlkID0gaWQ7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfTtcclxuXHJcbiAgICBvbkNsaWNrZWQgPSBpZCA9PiB7XHJcbiAgICAgICAgbG9nLnRyYWNlKFwibm90aWZpY2F0aW9ucy5vbkNsaWNrZWQoKSB3aXRoIGlkIDwlcz5cIiwgaWQpO1xyXG4gICAgICAgIGlmICghdGFicy5nZXRBY3RpdmVUYWIoKSlcclxuICAgICAgICAgICAgbG9nLnRyYWNlKFwibm90aWZpY2F0aW9ucy5vbkNsaWNrZWQoKSB0aGVyZSBpcyBubyBhY3RpdmUgdGFic1wiKTtcclxuICAgICAgICBlbHNlIGlmIChzdG9yYWdlLmdldCgnZm9jdXMnKSkgLy9pZiAoaWQuaW5kZXhPZihcImNvbmZpcm1fXCIpICE9PSAwICYmIHN0b3JhZ2UuZ2V0KCdmb2N1cycpKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgbG9nLnRyYWNlKFwibm90aWZpY2F0aW9ucy5vbkNsaWNrZWQoKSBmb2N1c2luZyB3aW5kb3cgYWZ0ZXIgY2xpY2tcIik7XHJcbiAgICAgICAgICAgIGNocm9tZS50YWJzLnVwZGF0ZSh0YWJzLmdldEFjdGl2ZVRhYigpLmlkLCB7YWN0aXZlOiB0cnVlfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuY2xlYXIoaWQpO1xyXG4gICAgfTtcclxuXHJcbiAgICBvbkJ1dHRvbkNsaWNrZWQgPSAoaWQsIGluZGV4KSA9PiB7XHJcbiAgICAgICAgbG9nLmRlYnVnKFwibm90aWZpY2F0aW9ucy5vbkJ1dHRvbkNsaWNrZWQoKSB3aXRoIGlkIDwlcz4sIGluZGV4IDwlZD5cIiwgaWQsIGluZGV4KTtcclxuXHJcbiAgICAgICAgY29uc3QgdGFiID0gdGFicy5nZXRBY3RpdmVUYWIoKTtcclxuICAgICAgICBpZiAoIXRhYilcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGxvZy5kZWJ1ZyhcIm5vdGlmaWNhdGlvbnMub25CdXR0b25DbGlja2VkKCkgdGhlcmUgaXMgbm8gYWN0aXZlIHRhYnNcIik7XHJcbiAgICAgICAgICAgIHRoaXMuY2xlYXIoaWQpO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjbGVhclRpbWVvdXQodGhpcy5hdXRvQ2xvc2VUaW1lcik7XHJcblxyXG4gICAgICAgIGlmICh0aGlzLmlzQ29uZmlybSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGlmICghdGhpcy5jb25maXJtQnV0dG9uc1tpbmRleF0uY29uZmlybSlcclxuICAgICAgICAgICAgICAgIGxvZy5kZWJ1ZyhcIm5vdGlmaWNhdGlvbnMub25CdXR0b25DbGlja2VkKCkgY29uZmlybSBjYW5jZWxlZFwiKTtcclxuICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBsb2cuZGVidWcoXCJub3RpZmljYXRpb25zLm9uQnV0dG9uQ2xpY2tlZCgpIGNvbmZpcm0gYXBwcm92ZWRcIik7XHJcbiAgICAgICAgICAgICAgICB0YWIuc2VuZCh7YWN0aW9uOiB0aGlzLmNvbmZpcm1BY3Rpb259KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBjb25zdCBidXR0b24gPSB0aGlzLmJ1dHRvbnNbdGhpcy5wbGF5ZXJNb2RlXS5maWx0ZXIoaXRlbSA9PiBpdGVtLnZhbHVlKCkpW2luZGV4XTtcclxuXHJcbiAgICAgICAgICAgIGxvZy5kZWJ1ZyhcIm5vdGlmaWNhdGlvbnMub25CdXR0b25DbGlja2VkKCkgcmVndWxhciBidXR0b24gY2xpY2sgb24gYnV0dG9uICVvXCIsIGJ1dHRvbik7XHJcblxyXG4gICAgICAgICAgICBpZiAoYnV0dG9uLmNvbmZpcm0gIT09IHVuZGVmaW5lZCAmJiBzdG9yYWdlLmdldChidXR0b24uY29uZmlybS5vcHRpb24pKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBsb2cuZGVidWcoXCJub3RpZmljYXRpb25zLm9uQnV0dG9uQ2xpY2tlZCgpIGNyZWF0aW5nIGNvbmZpcm1hdGlvbiAlbyBvZiBhY3Rpb24gPCVzPlwiLCBidXR0b24uY29uZmlybSwgYnV0dG9uLmFjdGlvbik7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmNyZWF0ZUNvbmZpcm1hdGlvbihidXR0b24uYWN0aW9uLCBidXR0b24uY29uZmlybS50aXRsZSwgYnV0dG9uLmNvbmZpcm0uaWNvbik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBsb2cuZGVidWcoXCJub3RpZmljYXRpb25zLm9uQnV0dG9uQ2xpY2tlZCgpIHNlbmRpbmcgYWN0aW9uIDwlcz4gdG8gYWN0aXZlIHRhYlwiLCBidXR0b24uYWN0aW9uKTtcclxuICAgICAgICAgICAgICAgIHRhYi5zZW5kKHthY3Rpb246IGJ1dHRvbi5hY3Rpb259KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLmNsZWFyKGlkKTtcclxuICAgIH07XHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IG5ldyBub3RpZmljYXRpb25zKCk7IiwiaW1wb3J0IGxvZyBmcm9tICdsb2dsZXZlbCc7XHJcbmltcG9ydCBqcXVlcnlfZXh0ZW5kIGZyb20gJ2pxdWVyeS1leHRlbmQnO1xyXG5cclxuY2xhc3MgcGxheWVyIHtcclxuICAgIGlzUGxheWluZyA9IGZhbHNlO1xyXG4gICAgaXNBZHZlcnQgPSBmYWxzZTtcclxuICAgIHRyYWNrID0ge1xyXG4gICAgICAgIGFsYnVtOiBudWxsLFxyXG4gICAgICAgIGFydGlzdHM6IG51bGwsXHJcbiAgICAgICAgY292ZXI6IG51bGwsXHJcbiAgICAgICAgZGlzbGlrZWQ6IG51bGwsXHJcbiAgICAgICAgbGlrZWQ6IG51bGwsXHJcbiAgICAgICAgbGluazogbnVsbCxcclxuICAgICAgICB0aXRsZTogbnVsbCxcclxuICAgICAgICB2ZXJzaW9uOiBudWxsXHJcbiAgICB9O1xyXG4gICAgcHJvZ3Jlc3MgPSB7XHJcbiAgICAgICAgcG9zaXRpb246IG51bGwsXHJcbiAgICAgICAgZHVyYXRpb246IG51bGwsXHJcbiAgICAgICAgbG9hZGVkOiBudWxsXHJcbiAgICB9O1xyXG4gICAgc291cmNlID0ge1xyXG4gICAgICAgIHRpdGxlOiBudWxsLFxyXG4gICAgICAgIGxpbms6IG51bGwsXHJcbiAgICAgICAgdHlwZTogbnVsbCxcclxuICAgICAgICBjb3ZlcjogbnVsbCxcclxuICAgICAgICBvd25lcjogbnVsbFxyXG4gICAgfTtcclxuICAgIGNvbnRyb2xzID0ge1xyXG4gICAgICAgIHN0YXRlczoge1xyXG4gICAgICAgICAgICBkaXNsaWtlOiBudWxsLFxyXG4gICAgICAgICAgICBpbmRleDogbnVsbCxcclxuICAgICAgICAgICAgbGlrZTogbnVsbCxcclxuICAgICAgICAgICAgbmV4dDogbnVsbCxcclxuICAgICAgICAgICAgcHJldjogbnVsbCxcclxuICAgICAgICAgICAgcmVwZWF0OiBudWxsLFxyXG4gICAgICAgICAgICBzaHVmZmxlOiBudWxsXHJcbiAgICAgICAgfSxcclxuICAgICAgICBzaHVmZmxlOiBudWxsLFxyXG4gICAgICAgIHJlcGVhdDogbnVsbCxcclxuICAgICAgICB2b2x1bWU6IG51bGxcclxuICAgIH07XHJcbiAgICBwbGF5bGlzdCA9IHtcclxuICAgICAgICBwcmV2OiBudWxsLFxyXG4gICAgICAgIGxpc3Q6IG51bGwsXHJcbiAgICAgICAgaW5kZXg6IG51bGwsXHJcbiAgICAgICAgbmV4dDogbnVsbFxyXG4gICAgfTtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcigpIHt9XHJcblxyXG4gICAgZ2V0QXJ0aXN0cyA9ICgpID0+IHtcclxuICAgICAgICBsb2cudHJhY2UoXCJwbGF5ZXIuZ2V0QXJ0aXN0cygpXCIpO1xyXG4gICAgICAgIHJldHVybiB0aGlzLnRyYWNrLmFydGlzdHNcclxuICAgICAgICAgICAgICAgICAgICA/IHRoaXMudHJhY2suYXJ0aXN0cy5tYXAoKGkpID0+IGkudGl0bGUpLmpvaW4oXCIsIFwiKVxyXG4gICAgICAgICAgICAgICAgICAgIDogbnVsbDtcclxuICAgIH07XHJcblxyXG4gICAgZ2V0Q292ZXJVUkwgPSAoc2l6ZSwgY3R4PXRoaXMpID0+IHtcclxuICAgICAgICBsb2cudHJhY2UoXCJwbGF5ZXIuZ2V0Q292ZXJVUkwoKSB3aXRoIHNpemUgPCVzPlwiLCBzaXplKTtcclxuXHJcbiAgICAgICAgY29uc3QgX2NvdmVyID0gJ2h0dHBzOi8vbXVzaWMueWFuZGV4LnJ1L2Jsb2Nrcy9wbGF5bGlzdC1jb3Zlci1zdGFjay9wbGF5bGlzdC1jb3Zlcl9ub19jb3ZlcjMucG5nJztcclxuICAgICAgICBsZXQgY292ZXIgPSBfY292ZXI7XHJcblxyXG4gICAgICAgIGlmICghY3R4LnRyYWNrKVxyXG4gICAgICAgICAgICByZXR1cm4gX2NvdmVyO1xyXG5cclxuICAgICAgICBpZiAoY3R4LnRyYWNrLmNvdmVyKVxyXG4gICAgICAgICAgICBjb3ZlciA9IGN0eC50cmFjay5jb3ZlcjtcclxuICAgICAgICBlbHNlIGlmIChjdHgudHJhY2suYWxidW0gJiYgY3R4LnRyYWNrLmFsYnVtLmNvdmVyKVxyXG4gICAgICAgICAgICBjb3ZlciA9IGN0eC50cmFjay5hbGJ1bS5jb3ZlcjtcclxuICAgICAgICBlbHNlIGlmIChjdHguc291cmNlLmNvdmVyKVxyXG4gICAgICAgICAgICBjb3ZlciA9IGN0eC5zb3VyY2UuY292ZXI7XHJcblxyXG4gICAgICAgIGlmICh0eXBlb2YgY292ZXIgPT0gJ29iamVjdCcpXHJcbiAgICAgICAgICAgIGNvdmVyID0gY292ZXIubGVuZ3RoID8gY292ZXJbMF0gOiBfY292ZXI7XHJcblxyXG4gICAgICAgIGNvdmVyID0gY292ZXIucmVwbGFjZShcIiUlXCIsIHNpemUpO1xyXG4gICAgICAgIGlmIChjb3Zlci5pbmRleE9mKFwiaHR0cFwiKSA9PSAtMSlcclxuICAgICAgICAgICAgY292ZXIgPSBcImh0dHBzOi8vXCIrY292ZXI7XHJcblxyXG4gICAgICAgIHJldHVybiBjb3ZlcjtcclxuICAgIH07XHJcblxyXG4gICAgdXBkYXRlID0gKGRhdGEsIGRlZXAgPSBmYWxzZSkgPT4ge1xyXG4gICAgICAgIGxvZy50cmFjZShcInBsYXllci51cGRhdGUoKSB3aXRoIGRhdGEgJW9cIiwgZGF0YSk7XHJcbiAgICAgICAgaWYgKGRlZXApXHJcbiAgICAgICAgICAgIGpxdWVyeV9leHRlbmQoZGVlcCwgdGhpcywgZGF0YSk7XHJcbiAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICBPYmplY3Qua2V5cyhkYXRhKS5mb3JFYWNoKGtleSA9PiB7XHJcbiAgICAgICAgICAgICAgICB0aGlzW2tleV0gPSBkYXRhW2tleV07XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIGxvZy50cmFjZShcInBsYXllci51cGRhdGUoKSB1cGRhdGVkIHBsYXllciAlb1wiLCB0aGlzKTtcclxuICAgIH07XHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IHBsYXllcjsiLCJpbXBvcnQgdXRpbHMgZnJvbSAnLi4vY29tbW9uL3V0aWxzJztcclxuXHJcbmNsYXNzIHN0b3JhZ2Uge1xyXG4gICAgZGVmYXVsdHMgPSB7XHJcbiAgICAgICAgYWRkdG86IHRydWUsXHJcbiAgICAgICAgbXJfYWRkdG86IHRydWUsXHJcbiAgICAgICAgcmFkaW9fbGlrZTogdHJ1ZSxcclxuICAgICAgICBkaXNsaWtlOiBmYWxzZSxcclxuICAgICAgICBtcl9kaXNsaWtlOiB0cnVlLFxyXG4gICAgICAgIHJhZGlvX2Rpc2xpa2U6IHRydWUsXHJcbiAgICAgICAgbmV4dDogdHJ1ZSxcclxuICAgICAgICBtcl9uZXh0OiBmYWxzZSxcclxuICAgICAgICByYWRpb19uZXh0OiBmYWxzZSxcclxuICAgICAgICBmb2N1czogdHJ1ZSxcclxuICAgICAgICB0aW1lOiA0LFxyXG4gICAgICAgIHR5cGU6ICdob3RrX3RyJyxcclxuICAgICAgICBhdXRvb3BlbjogdHJ1ZSxcclxuICAgICAgICBob3RrZXlfbGlrZV9hY3Rpb246ICdhc2snLFxyXG4gICAgICAgIGhvdGtleV9kaXNsaWtlX2FjdGlvbjogdHJ1ZSxcclxuICAgICAgICBob3RrZXlfcmVwZWF0X25vdGlmOiBmYWxzZSxcclxuICAgICAgICBtX2Rpc2xpa2VfYWN0aW9uOiB0cnVlLFxyXG4gICAgICAgIG1yX2Rpc2xpa2VfYWN0aW9uOiB0cnVlLFxyXG4gICAgICAgIHJhZGlvX2Rpc2xpa2VfYWN0aW9uOiB0cnVlLFxyXG4gICAgICAgIG5ld190YWJfcGlubmVkOiBmYWxzZSxcclxuICAgICAgICBnbG9iYWxfbW9kZTogJ3BvcHVwJyxcclxuICAgICAgICBwb3B1cF9zaG93X3ZhcjogJ2Z1bGwnLFxyXG4gICAgICAgIHBvcHVwX3Nob3dfdmVyc2lvbjogdHJ1ZSxcclxuICAgICAgICBwb3B1cF9zaG93X3Jfc2g6IHRydWUsXHJcbiAgICAgICAgcG9wdXBfdm9sdW1lX2NsaWNrX3RvZ2dsZTogXCIwXCIsXHJcbiAgICAgICAgY2xvc2VfYWxlcnQ6IHRydWUsXHJcbiAgICAgICAgcHJlbWl1bV9rZXk6IGZhbHNlLFxyXG4gICAgICAgIHVzZXJfaWQ6ICgpID0+IHV0aWxzLmd1aWQoKVxyXG4gICAgfTtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcInN0b3JhZ2VcIiwgdGhpcy5vblN0b3JhZ2VDaGFuZ2UpO1xyXG4gICAgfVxyXG5cclxuICAgIG9uU3RvcmFnZUNoYW5nZSA9IGUgPT4ge1xyXG4gICAgICAgIGlmICh0aGlzLm9uU3RvcmFnZUNoYW5nZUNiKVxyXG4gICAgICAgICAgICB0aGlzLm9uU3RvcmFnZUNoYW5nZUNiKGUpO1xyXG4gICAgfTtcclxuXHJcbiAgICBvblN0b3JhZ2VDaGFuZ2VDYiA9IHJlcXVlc3QgPT4ge307XHJcblxyXG4gICAgYWRkT25TdG9yYWdlQ2hhbmdlQ2IgPSBjYiA9PiB7XHJcbiAgICAgICAgdGhpcy5vblN0b3JhZ2VDaGFuZ2VDYiA9IGNiO1xyXG4gICAgfTtcclxuXHJcbiAgICBnZXRBbGwgPSAocmVtb3ZlUHJlZml4PWZhbHNlKSA9PiB7XHJcbiAgICAgICAgbGV0IGFsbCA9IHt9O1xyXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpPGxvY2FsU3RvcmFnZS5sZW5ndGg7IGkrKylcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGxldCBrZXkgPSBsb2NhbFN0b3JhZ2Uua2V5KGkpO1xyXG4gICAgICAgICAgICBpZiAoa2V5LmluZGV4T2YoXCJzdG9yZS5zZXR0aW5nc1wiKSAhPSAtMSlcclxuICAgICAgICAgICAgICAgIGFsbFsgcmVtb3ZlUHJlZml4ID8ga2V5LnJlcGxhY2UoXCJzdG9yZS5zZXR0aW5ncy5cIixcIlwiKSA6IGtleV0gPSBKU09OLnBhcnNlKGxvY2FsU3RvcmFnZS5nZXRJdGVtKGtleSkpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gYWxsO1xyXG4gICAgfTtcclxuXHJcbiAgICBnZXQgPSBrZXkgPT4ge1xyXG4gICAgICAgIGNvbnN0IHZhbHVlID0gbG9jYWxTdG9yYWdlLmdldEl0ZW0oXCJzdG9yZS5zZXR0aW5ncy5cIiArIGtleSk7XHJcbiAgICAgICAgcmV0dXJuICh2YWx1ZSA9PT0gbnVsbCkgPyB0aGlzLmRlZmF1bHRzW2tleV0gOiBKU09OLnBhcnNlKHZhbHVlKTtcclxuICAgIH07XHJcblxyXG4gICAgc2V0ID0gKGtleSwgdmFsdWUpID0+IHtcclxuICAgICAgICBpZiAoIXRoaXMuZGVmYXVsdHMuaGFzT3duUHJvcGVydHkoa2V5KSkgLy90aGlzLmRlZmF1bHRzW2tleV0gPT09IHVuZGVmaW5lZClcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIHJldHVybiBsb2NhbFN0b3JhZ2Uuc2V0SXRlbShcInN0b3JlLnNldHRpbmdzLlwiICsga2V5LCBKU09OLnN0cmluZ2lmeSh2YWx1ZSkpO1xyXG4gICAgfTtcclxuXHJcbiAgICBpbml0ID0gKCkgPT4ge1xyXG4gICAgICAgIE9iamVjdC5rZXlzKHRoaXMuZGVmYXVsdHMpLmZvckVhY2goa2V5ID0+IHtcclxuICAgICAgICAgICAgaWYgKGxvY2FsU3RvcmFnZS5nZXRJdGVtKFwic3RvcmUuc2V0dGluZ3MuXCIgKyBrZXkpID09PSBudWxsKVxyXG4gICAgICAgICAgICAgICAgdGhpcy5zZXQoa2V5LCB0eXBlb2YgdGhpcy5kZWZhdWx0c1trZXldID09IFwiZnVuY3Rpb25cIiA/IHRoaXMuZGVmYXVsdHNba2V5XSgpIDogdGhpcy5kZWZhdWx0c1trZXldKTtcclxuICAgICAgICB9KTtcclxuICAgIH07XHJcblxyXG4gICAgY2xlYXIgPSAoKSA9PiB7XHJcbiAgICAgICAgbG9jYWxTdG9yYWdlLmNsZWFyKCk7XHJcbiAgICB9O1xyXG59XHJcbmV4cG9ydCBkZWZhdWx0IG5ldyBzdG9yYWdlKCk7IiwiaW1wb3J0IGxvZyBmcm9tICdsb2dsZXZlbCc7XHJcbmltcG9ydCB0YWJzIGZyb20gJy4vdGFicyc7XHJcbmltcG9ydCBwbGF5ZXIgZnJvbSAnLi9wbGF5ZXInO1xyXG5pbXBvcnQgZXh0IGZyb20gJy4uL2JnL2V4dCc7XHJcbmltcG9ydCBicm93c2VyQWN0aW9uIGZyb20gJy4vYnJvd3NlckFjdGlvbic7XHJcbmltcG9ydCBub3RpZmljYXRpb25zIGZyb20gJy4vbm90aWZpY2F0aW9ucyc7XHJcbmltcG9ydCBzdG9yYWdlIGZyb20gJy4vc3RvcmFnZSc7XHJcbmltcG9ydCB1dGlscyBmcm9tICcuLi9jb21tb24vdXRpbHMnO1xyXG5cclxuU3RyaW5nLnByb3RvdHlwZS5jYXBpdGFsaXplID0gZnVuY3Rpb24oKSB7XHJcbiAgICByZXR1cm4gdGhpcy5jaGFyQXQoMCkudG9VcHBlckNhc2UoKSArIHRoaXMuc2xpY2UoMSk7XHJcbn07XHJcbk9iamVjdC5wcm90b3R5cGUuZmlsdGVyID0gZnVuY3Rpb24ocHJlZGljYXRlKSB7XHJcbiAgICBsZXQgcmVzdWx0ID0ge307XHJcbiAgICBmb3IoY29uc3Qga2V5IGluIHRoaXMpXHJcbiAgICAgICAgaWYgKHRoaXMuaGFzT3duUHJvcGVydHkoa2V5KSAmJiBwcmVkaWNhdGUodGhpc1trZXldKSlcclxuICAgICAgICAgICAgcmVzdWx0W2tleV0gPSB0aGlzW2tleV07XHJcbiAgICByZXR1cm4gcmVzdWx0O1xyXG59O1xyXG5cclxuY2xhc3MgdGFiIHtcclxuICAgIC8v0YLQsNC50LzQtdGAINC80L7QvdC40YLQvtGA0Y/RidC40Lkg0LbQuNCy0YPRh9C10YHRgtGMINCy0LrQu9Cw0LTQutC4XHJcbiAgICB0aW1lciA9IG51bGw7XHJcbiAgICAvL9C40LTQtdC90YLQuNGE0LjQutCw0YLQvtGAXHJcbiAgICBpZCA9IG51bGw7XHJcbiAgICAvL9C10YHRgtGMINC70Lgg0YTQvtC60YPRgSDQvdCwINCy0LrQu9Cw0LTQutC1XHJcbiAgICBmb2N1c2VkID0gZmFsc2U7XHJcbiAgICAvL9GC0LjQvyDQstC60LvQsNC00LrQuDog0YDQsNC00LjQviDQuNC70Lgg0LzRg9C30YvQutCwXHJcbiAgICB0eXBlID0gbnVsbDtcclxuICAgIC8v0LLRgNC10LzRjyDRgdC+0LfQtNCw0L3QuNGPINCy0LrQu9Cw0LTQutC4XHJcbiAgICBvcGVuZWRUaW1lID0gbnVsbDtcclxuICAgIC8v0L/Qu9C10LXRgFxyXG4gICAgcGxheWVyID0gbnVsbDtcclxuICAgIC8v0L/QvtGA0YIg0LTQu9GPINGB0LLRj9C30Lgg0YEgQ1Mg0YHQutGA0LjQv9GC0L7QvCDQvdCwINGB0YLRgNCw0L3QuNGG0LUg0LLQutC70LDQtNC60LhcclxuICAgIGNzQ29ubmVjdGlvbiA9IG51bGw7XHJcblxyXG4gICAgY29uc3RydWN0b3IodGFiSWQsIHRhYlR5cGUpIHtcclxuICAgICAgICBsb2cudHJhY2UoXCJ0YWIuY29uc3RydWN0b3IoKSB3aXRoIGlkIDwlZD4gYW5kIHR5cGUgPCVzPlwiLCB0YWJJZCwgdGFiVHlwZSk7XHJcblxyXG4gICAgICAgIHRoaXMuaWQgPSB0YWJJZDtcclxuICAgICAgICB0aGlzLm9wZW5lZFRpbWUgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcclxuICAgICAgICB0aGlzLnR5cGUgPSB0YWJUeXBlO1xyXG4gICAgICAgIC8v0YDQsNC3INCyINGB0LXQutGD0L3QtNGDINC/0YDQvtCy0LXRgNGP0LXQvCDQttC40LLQsCDQu9C4INCy0LrQu9Cw0LTQutCwXHJcbiAgICAgICAgdGhpcy50aW1lciA9IHNldEludGVydmFsKHRoaXMuYWxpdmVDaGVjaywgMTAwMCk7XHJcbiAgICAgICAgLy/QuNC90LjRhtC40LDQu9C40LfQuNGA0YPQtdC8INC/0LvQtdC10YBcclxuICAgICAgICB0aGlzLnBsYXllciA9IG5ldyBwbGF5ZXIoKTtcclxuICAgIH1cclxuXHJcbiAgICBhbGl2ZUNoZWNrID0gKCkgPT4ge1xyXG4gICAgICAgIGxvZy50cmFjZShcInRhYi5hbGl2ZUNoZWNrKClcIik7XHJcblxyXG4gICAgICAgIGNocm9tZS50YWJzLmdldCh0aGlzLmlkLCB0YWIgPT4ge1xyXG4gICAgICAgICAgICBpZiAoY2hyb21lLnJ1bnRpbWUubGFzdEVycm9yKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBsb2cudHJhY2UoXCJ0YWJcIiwgdGhpcy5pZCwgXCJyZW1vdmVkIGR1ZSBpdCdzIHVuYXZhaWxhYmlsaXR5XCIpO1xyXG4gICAgICAgICAgICAgICAgbG9nLmVycm9yKFwiVGFiIGNsb3NlZCB2aWEgaXQncyB1bmF2YWlsYWJpbGl0eSB3aGlsZSBhbGl2ZSBjaGVja1wiKTtcclxuICAgICAgICAgICAgICAgIC8v0LLQutC70LDQtNC60LAg0L3QtSDQvdCw0LnQtNC10L3QsCwg0YPQtNCw0LvRj9C10Lwg0LLQutC70LDQtNC60YMgKNGC0LDQudC80LXRgCDQsdGD0LTQtdGCINC+0YfQuNGJ0LXQvSDQsiDQvNC10YLQvtC00LUgc2h1dGRvd24pXHJcbiAgICAgICAgICAgICAgICB0YWJzLnNodXRkb3duKHRoaXMuaWQpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgLy9UT0RPOiDQvdCw0LTQviDQtNC+0LHQsNCy0LjRgtGMINC90LXQutGD0Y4g0LTQvtC/0L7Qu9C90LjRgtC10LvRjNC90YPRjiDQu9C+0LPQuNC60YMg0L/RgNC+0LLQtdGA0LrQuCDQstC60LvQsNC00LrQuCDQvdCwINC20LjQstGD0YfQtdGB0YLRjCBqc1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9O1xyXG5cclxuICAgIGFkZFBvcnQgPSBwb3J0ID0+IHtcclxuICAgICAgICBsb2cudHJhY2UoXCJ0YWIuYWRkUG9ydCgpIHdpdGggcG9ydCAlb1wiLCBwb3J0KTtcclxuICAgICAgICB0aGlzLmNzQ29ubmVjdGlvbiA9IHBvcnQ7XHJcbiAgICAgICAgdGhpcy5jc0Nvbm5lY3Rpb24ub25NZXNzYWdlLmFkZExpc3RlbmVyKHRoaXMub25NZXNzYWdlKTtcclxuICAgICAgICB0aGlzLmNzQ29ubmVjdGlvbi5vbkRpc2Nvbm5lY3QuYWRkTGlzdGVuZXIodGhpcy5vbkRpc2Nvbm5lY3QpO1xyXG4gICAgfTtcclxuXHJcbiAgICBvbkRpc2Nvbm5lY3QgPSAoKSA9PiB7XHJcbiAgICAgICAgbG9nLnRyYWNlKFwidGFiLm9uRGlzY29ubmVjdCgpXCIpO1xyXG4gICAgICAgIC8v0LTQviDRgNC10YTQsNC60YLQvtGA0LjQvdCz0LAg0LLQvtC30L3QuNC60LDQu9CwINC/0YDQvtCx0LvQtdC80LAg0LrQvtCz0LTQsCDQv9GA0Lgg0LjQt9C80LXQvdC10L3QuNC4INGD0YDQu9CwINGB0YLRgNCw0L3QuNGG0Ysg0L3QtSDQv9GA0L7QuNGB0YXQvtC00LjRgiDRgdC+0LHRi9GC0LjQtSBvbnVubG9hZCDQuCDRjdGC0L5cclxuICAgICAgICAvL9C/0YDQuNCy0L7QtNC40YIg0Log0L7RiNC40LHQutC1LCDQvdC+INC30LDRgtC+INC/0YDQvtC40YHRhdC+0LTQuNGCINGB0L7QsdGL0YLQuNC1IG9uRGlzY29ubmVjdCDRgyDQv9C+0YDRgtCwLCDQv9C+0Y3RgtC+0LzRgyDQtNGD0LHQu9C40YDRg9C10Lwg0YTRg9C90LrRhtC40L7QvdCw0Lsg0LfQsNC60YDRi9GC0LjRj1xyXG4gICAgICAgIC8v0LLQutC70LDQtNC60LhcclxuICAgICAgICBsb2cuZXJyb3IoXCJUYWIgY2xvc2VkIHZpYSBjcyBwb3J0IGRpc2Nvbm5lY3RlZFwiKTtcclxuICAgICAgICB0YWJzLnNodXRkb3duKHRoaXMuaWQpO1xyXG4gICAgICAgIC8vdGhpcy5jc0Nvbm5lY3Rpb24gPSBudWxsO1xyXG4gICAgfTtcclxuXHJcbiAgICBvbk1lc3NhZ2UgPSAobXNnLCBwb3J0KSA9PiB7XHJcbiAgICAgICAgbG9nLnRyYWNlKFwidGFiLm9uTWVzc2FnZSgpIHdpdGggbWVzc2FnZSAlbyBmcm9tIHBvcnQgJW9cIiwgbXNnLCBwb3J0KTtcclxuXHJcbiAgICAgICAgaWYgKCFtc2cuYWN0aW9uKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgbG9nLnRyYWNlKFwidGFiLm9uTWVzc2FnZSgpIGludmFsaWQgbWVzc2FnZVwiKTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjb25zdCBhY3Rpb25MaXN0ZW5lck5hbWUgPSBgb24ke21zZy5hY3Rpb24uY2FwaXRhbGl6ZSgpfUFjdGlvbmA7XHJcblxyXG4gICAgICAgIGlmICghdGhpcy5oYXNPd25Qcm9wZXJ0eShhY3Rpb25MaXN0ZW5lck5hbWUpKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgbG9nLnRyYWNlKFwidGFiLm9uTWVzc2FnZSgpIGxpc3RlbmVyIG9mIGFjdGlvbiA8JXM+IG5vdCBkZWZpbmVkXCIsIG1zZy5hY3Rpb24pO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICBjb25zdCBpc0FjdGl2ZSA9ICh0YWJzLmdldEFjdGl2ZVRhYigpLmlkID09IHRoaXMuaWQpO1xyXG4gICAgICAgICAgICBsb2cudHJhY2UoXCJ0YWIub25NZXNzYWdlKCkgY2FsbGluZyBhY3Rpb24gbGlzdGVuZXIgPCVzPiwgaXMgYWN0aXZlIHRhYiA8JW8+XCIsIGFjdGlvbkxpc3RlbmVyTmFtZSwgaXNBY3RpdmUpO1xyXG4gICAgICAgICAgICB0aGlzW2FjdGlvbkxpc3RlbmVyTmFtZV0uY2FsbCh0aGlzLCBtc2csIGlzQWN0aXZlKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgY2F0Y2ggKGUpIHsgdXRpbHMuZXJyb3JIYW5kbGVyKGUpOyB9XHJcbiAgICB9O1xyXG5cclxuICAgIHNlbmQgPSBkYXRhID0+IHtcclxuICAgICAgICBsb2cudHJhY2UoXCJ0YWIuc2VuZCgpIHdpdGggZGF0YSAlb1wiLCBkYXRhKTtcclxuICAgICAgICBpZiAodGhpcy5jc0Nvbm5lY3Rpb24pXHJcbiAgICAgICAgICAgIHRyeVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmNzQ29ubmVjdGlvbi5wb3N0TWVzc2FnZShkYXRhKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjYXRjaCAoZSlcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgbG9nLmVycm9yKFwidGFiLnNlbmQoKSBlcnJvclwiLCBlKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuY3NDb25uZWN0aW9uID0gbnVsbDtcclxuICAgICAgICAgICAgfVxyXG4gICAgfTtcclxuXHJcbiAgICBvbkZ1bGxzdGF0ZUFjdGlvbiA9IChtc2csIGlzQWN0aXZlKSA9PiB7XHJcbiAgICAgICAgbG9nLnRyYWNlKFwidGFiLm9uRnVsbHN0YXRlKCkgd2l0aCBtZXNzYWdlICVvLCBpcyBhY3RpdmUgdGFiICVvXCIsIG1zZywgaXNBY3RpdmUpO1xyXG5cclxuICAgICAgICBzdG9yYWdlLnNldChcInVzZXJfaWRcIiwgbXNnLnVzZXIudWlkID8gbXNnLnVzZXIudWlkIDogbXNnLnVzZXIuZGlkKTtcclxuXHJcbiAgICAgICAgdGhpcy5wbGF5ZXIudXBkYXRlKHtcclxuICAgICAgICAgICAgJ3RyYWNrJzogbXNnLnRyYWNrLFxyXG4gICAgICAgICAgICAncHJvZ3Jlc3MnOiBtc2cucHJvZ3Jlc3MsXHJcbiAgICAgICAgICAgICdzb3VyY2UnOiBtc2cuc291cmNlLFxyXG4gICAgICAgICAgICAnY29udHJvbHMnOiBtc2cuY29udHJvbHMsXHJcbiAgICAgICAgICAgICdwbGF5bGlzdCc6IG1zZy5wbGF5bGlzdCxcclxuICAgICAgICAgICAgJ2lzUGxheWluZyc6IG1zZy5pc1BsYXlpbmdcclxuICAgICAgICB9KTtcclxuICAgICAgICBpZiAoaXNBY3RpdmUpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICAvL9C+0LHQvdC+0LLQu9GP0LXQvCDQuNC60L7QvdC60YMg0L3QsCDQv9Cw0L3QtdC70Lgg0LHRgNCw0YPQt9C10YDQsFxyXG4gICAgICAgICAgICBicm93c2VyQWN0aW9uLnVwZGF0ZSgpO1xyXG5cclxuICAgICAgICAgICAgaWYgKGV4dC5wb3B1cENvbm5lY3Rpb24pIHtcclxuICAgICAgICAgICAgICAgIC8vb2xkXHJcbiAgICAgICAgICAgICAgICBleHQucG9wdXBDb25uZWN0aW9uLnNlbmQoWyd0cmFjaycsICdwcm9ncmVzcycsICdzb3VyY2UnLCAnY29udHJvbHMnLCAncGxheWxpc3QnLCAnaXNQbGF5aW5nJ10pO1xyXG4gICAgICAgICAgICAgICAgLy9uZXdcclxuICAgICAgICAgICAgICAgIGV4dC5wb3B1cENvbm5lY3Rpb24uc2VuZCh7YWN0aW9uOid0cmFjaycsIHBheWxvYWQ6bXNnLnRyYWNrfSk7XHJcbiAgICAgICAgICAgICAgICBleHQucG9wdXBDb25uZWN0aW9uLnNlbmQoe2FjdGlvbjoncHJvZ3Jlc3MnLCBwYXlsb2FkOm1zZy5wcm9ncmVzc30pO1xyXG4gICAgICAgICAgICAgICAgZXh0LnBvcHVwQ29ubmVjdGlvbi5zZW5kKHthY3Rpb246J3NvdXJjZScsIHBheWxvYWQ6ey4uLm1zZy5zb3VyY2UsIHRhYlR5cGU6IHRoaXMudHlwZX19KTtcclxuICAgICAgICAgICAgICAgIGV4dC5wb3B1cENvbm5lY3Rpb24uc2VuZCh7YWN0aW9uOidjb250cm9scycsIHBheWxvYWQ6bXNnLmNvbnRyb2xzfSk7XHJcbiAgICAgICAgICAgICAgICBleHQucG9wdXBDb25uZWN0aW9uLnNlbmQoe2FjdGlvbjoncGxheWxpc3QnLCBwYXlsb2FkOm1zZy5wbGF5bGlzdH0pO1xyXG4gICAgICAgICAgICAgICAgZXh0LnBvcHVwQ29ubmVjdGlvbi5zZW5kKHthY3Rpb246J2lzUGxheWluZycsIHBheWxvYWQ6bXNnLmlzUGxheWluZ30pO1xyXG4gICAgICAgICAgICAgICAgLy/RjdGC0L7RgiDQv9Cw0YDQsNC80LXRgtGAINC80Ysg0YXRgNCw0L3QuNC8INCyINGB0L7RgdGC0L7Rj9C90LjQuCDRhNC+0L3QvtCy0L7QuSDRgdGC0YDQsNC90LjRhtGLLCDRgi7Qui4g0LrQvtC90YLQtdC90YIt0YHRgtGA0LDQvdC40YbQsCDQvdC1INC40LzQtdC10YIg0LzQtdGC0L7QtNCwLFxyXG4gICAgICAgICAgICAgICAgLy/QstC+0LfQstGA0LDRidCw0Y7RidC10LPQviDRhNC70LDQsyDRgNC10LrQu9Cw0LzQsCDRgdC10LnRh9Cw0YEg0LjQu9C4INC90LXRgiDQuCDQvtCx0L3QvtCy0LvRj9C10YLRgdGPINGC0L7Qu9GM0LrQviDRh9C10YDQtdC3IG9uQWR2ZXJ0QWN0aW9uLCDQv9C+0LvRg9GH0LXQvdC90L7Qs9C+XHJcbiAgICAgICAgICAgICAgICAvL9C+0YIg0LrQvtC90YLQtdC90YIt0YHRgtGA0LDQvdC40YbRiy5cclxuICAgICAgICAgICAgICAgIGV4dC5wb3B1cENvbm5lY3Rpb24uc2VuZCh7YWN0aW9uOidhZHZlcnQnLCBwYXlsb2FkOnRoaXMucGxheWVyLmlzQWR2ZXJ0fSk7XHJcbiAgICAgICAgICAgICAgICBsb2cudHJhY2UoXCJ0YWIub25GdWxsc3RhdGUoKSBldmVudCBzZW50IHRvIHBvcHVwXCIpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuXHJcbiAgICBvblN0YXRlQWN0aW9uID0gKG1zZywgaXNBY3RpdmUpID0+IHtcclxuICAgICAgICBsb2cudHJhY2UoXCJ0YWIub25TdGF0ZSgpIHdpdGggbWVzc2FnZSAlbywgaXMgYWN0aXZlIHRhYiAlb1wiLCBtc2csIGlzQWN0aXZlKTtcclxuICAgICAgICB0aGlzLnBsYXllci51cGRhdGUoeydpc1BsYXlpbmcnOiBtc2cuaXNQbGF5aW5nfSk7XHJcbiAgICAgICAgaWYgKGlzQWN0aXZlKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgLy/QvtCx0L3QvtCy0LvRj9C10Lwg0LjQutC+0L3QutGDINC90LAg0L/QsNC90LXQu9C4INCx0YDQsNGD0LfQtdGA0LBcclxuICAgICAgICAgICAgYnJvd3NlckFjdGlvbi51cGRhdGUoKTtcclxuXHJcbiAgICAgICAgICAgIGlmIChleHQucG9wdXBDb25uZWN0aW9uKSB7XHJcbiAgICAgICAgICAgICAgICAvL29sZFxyXG4gICAgICAgICAgICAgICAgZXh0LnBvcHVwQ29ubmVjdGlvbi5zZW5kKFsnaXNQbGF5aW5nJ10pO1xyXG4gICAgICAgICAgICAgICAgLy9uZXdcclxuICAgICAgICAgICAgICAgIGV4dC5wb3B1cENvbm5lY3Rpb24uc2VuZCh7YWN0aW9uOidpc1BsYXlpbmcnLCBwYXlsb2FkOm1zZy5pc1BsYXlpbmd9KTtcclxuICAgICAgICAgICAgICAgIGxvZy50cmFjZShcInRhYi5vblN0YXRlKCkgZXZlbnQgc2VudCB0byBwb3B1cFwiKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH07XHJcblxyXG4gICAgb25TaHV0ZG93bkFjdGlvbiA9IChtc2csIGlzQWN0aXZlKSA9PiB7XHJcbiAgICAgICAgbG9nLnRyYWNlKFwidGFiLm9uU2h1dGRvd24oKSB3aXRoIG1lc3NhZ2UgJW8sIGlzIGFjdGl2ZSB0YWIgJW9cIiwgbXNnLCBpc0FjdGl2ZSk7XHJcbiAgICAgICAgbG9nLmVycm9yKFwiVGFiIGNsb3NlZCB2aWEgY3Mgc2h1dGRvd24gYWN0aW9uXCIpO1xyXG4gICAgICAgIHRhYnMuc2h1dGRvd24odGhpcy5pZCk7XHJcbiAgICB9O1xyXG5cclxuICAgIG9uRm9jdXNBY3Rpb24gPSAobXNnLCBpc0FjdGl2ZSkgPT4ge1xyXG4gICAgICAgIGxvZy50cmFjZShcInRhYi5vbkZvY3VzKCkgd2l0aCBtZXNzYWdlICVvLCBpcyBhY3RpdmUgdGFiICVvXCIsIG1zZywgaXNBY3RpdmUpO1xyXG4gICAgICAgIHRoaXMuZm9jdXNlZCA9IHRydWU7XHJcbiAgICB9O1xyXG5cclxuICAgIG9uQmx1ckFjdGlvbiA9IChtc2csIGlzQWN0aXZlKSA9PiB7XHJcbiAgICAgICAgbG9nLnRyYWNlKFwidGFiLm9uQmx1cigpIHdpdGggbWVzc2FnZSAlbywgaXMgYWN0aXZlIHRhYiAlb1wiLCBtc2csIGlzQWN0aXZlKTtcclxuICAgICAgICB0aGlzLmZvY3VzZWQgPSBmYWxzZTtcclxuICAgIH07XHJcblxyXG4gICAgb25Wb2x1bWVBY3Rpb24gPSAobXNnLCBpc0FjdGl2ZSkgPT4ge1xyXG4gICAgICAgIGxvZy50cmFjZShcInRhYi5vblZvbHVtZSgpIHdpdGggbWVzc2FnZSAlbywgaXMgYWN0aXZlIHRhYiAlb1wiLCBtc2csIGlzQWN0aXZlKTtcclxuICAgICAgICB0aGlzLnBsYXllci51cGRhdGUoeydjb250cm9scyc6IHt2b2x1bWU6IG1zZy52b2x1bWV9fSwgdHJ1ZSk7XHJcbiAgICAgICAgaWYgKGlzQWN0aXZlICYmIGV4dC5wb3B1cENvbm5lY3Rpb24pXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICAvL29sZFxyXG4gICAgICAgICAgICBleHQucG9wdXBDb25uZWN0aW9uLnNlbmQoWydjb250cm9scyddKTtcclxuICAgICAgICAgICAgLy9uZXdcclxuICAgICAgICAgICAgZXh0LnBvcHVwQ29ubmVjdGlvbi5zZW5kKHthY3Rpb246J3ZvbHVtZScsIHBheWxvYWQ6bXNnLnZvbHVtZX0pO1xyXG4gICAgICAgICAgICBsb2cudHJhY2UoXCJ0YWIub25Wb2x1bWUoKSBldmVudCBzZW50IHRvIHBvcHVwXCIpO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcblxyXG4gICAgb25BZHZlcnRBY3Rpb24gPSAobXNnLCBpc0FjdGl2ZSkgPT4ge1xyXG4gICAgICAgIGxvZy50cmFjZShcInRhYi5vbkFkdmVydEFjdGlvbigpIHdpdGggbWVzc2FnZSAlbywgaXMgYWN0aXZlIHRhYiAlb1wiLCBtc2csIGlzQWN0aXZlKTtcclxuICAgICAgICB0aGlzLnBsYXllci51cGRhdGUoeydpc0FkdmVydCc6IG1zZy5zdGF0ZX0pO1xyXG4gICAgICAgIGlmIChpc0FjdGl2ZSAmJiBleHQucG9wdXBDb25uZWN0aW9uKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgZXh0LnBvcHVwQ29ubmVjdGlvbi5zZW5kKHthY3Rpb246J2FkdmVydCcsIHBheWxvYWQ6bXNnLnN0YXRlfSk7XHJcbiAgICAgICAgICAgIGxvZy50cmFjZShcInRhYi5vbkFkdmVydEFjdGlvbigpIGV2ZW50IHNlbnQgdG8gcG9wdXBcIik7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuXHJcbiAgICBvblByb2dyZXNzQWN0aW9uID0gKG1zZywgaXNBY3RpdmUpID0+IHtcclxuICAgICAgICBsb2cudHJhY2UoXCJ0YWIub25Qcm9ncmVzcygpIHdpdGggbWVzc2FnZSAlbywgaXMgYWN0aXZlIHRhYiAlb1wiLCBtc2csIGlzQWN0aXZlKTtcclxuICAgICAgICB0aGlzLnBsYXllci51cGRhdGUoeydwcm9ncmVzcyc6IG1zZy5wcm9ncmVzc30pO1xyXG4gICAgICAgIGlmIChpc0FjdGl2ZSAmJiBleHQucG9wdXBDb25uZWN0aW9uKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgLy9vbGRcclxuICAgICAgICAgICAgZXh0LnBvcHVwQ29ubmVjdGlvbi5zZW5kKFsncHJvZ3Jlc3MnXSk7XHJcbiAgICAgICAgICAgIC8vbmV3XHJcbiAgICAgICAgICAgIGV4dC5wb3B1cENvbm5lY3Rpb24uc2VuZCh7YWN0aW9uOidwcm9ncmVzcycsIHBheWxvYWQ6bXNnLnByb2dyZXNzfSk7XHJcbiAgICAgICAgICAgIGxvZy50cmFjZShcInRhYi5vblByb2dyZXNzKCkgZXZlbnQgc2VudCB0byBwb3B1cFwiKTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG5cclxuICAgIG9uVHJhY2tzbGlzdEFjdGlvbiA9IChtc2csIGlzQWN0aXZlKSA9PiB7XHJcbiAgICAgICAgbG9nLnRyYWNlKFwidGFiLm9uVHJhY2tzbGlzdCgpIHdpdGggbWVzc2FnZSAlbywgaXMgYWN0aXZlIHRhYiAlb1wiLCBtc2csIGlzQWN0aXZlKTtcclxuXHJcbiAgICAgICAgLy/Qv9C70LXQudC70LjRgdGCINC+0YfQuNGJ0LXQvVxyXG4gICAgICAgIGlmIChtc2cucGxheWxpc3QubGlzdC5sZW5ndGggPT0gMCkge1xyXG4gICAgICAgICAgICBsb2cudHJhY2UoXCJ0YWIub25UcmFja3NsaXN0KCkgcGxheWxpc3QgY2xlYXJlZCwgY2xlYXJpbmcgcGxheWVyXCIpO1xyXG4gICAgICAgICAgICAvL9C/0YDQuCDQvtGH0LjRgdGC0LrQtSDQv9C70LXQtdGA0LAg0YHQvtGF0YDQsNC90Y/QtdC8INC30L3QsNGH0LXQvdC40LUg0LPRgNC+0LzQutC+0YHRgtC4XHJcbiAgICAgICAgICAgIGNvbnN0IGN1clZvbHVtZSA9IHRoaXMucGxheWVyLmNvbnRyb2xzLnZvbHVtZTtcclxuICAgICAgICAgICAgdGhpcy5wbGF5ZXIgPSBuZXcgcGxheWVyKCk7XHJcbiAgICAgICAgICAgIHRoaXMucGxheWVyLnVwZGF0ZSh7J2NvbnRyb2xzJzoge3ZvbHVtZTogY3VyVm9sdW1lfX0sIHRydWUpO1xyXG4gICAgICAgICAgICBpZiAoaXNBY3RpdmUgJiYgZXh0LnBvcHVwQ29ubmVjdGlvbilcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgLy9vbGRcclxuICAgICAgICAgICAgICAgIGV4dC5wb3B1cENvbm5lY3Rpb24uc2VuZChbJ3RyYWNrJywgJ3Byb2dyZXNzJywgJ3NvdXJjZScsICdjb250cm9scycsICdwbGF5bGlzdCcsICdpc1BsYXlpbmcnXSk7XHJcbiAgICAgICAgICAgICAgICAvL25ld1xyXG4gICAgICAgICAgICAgICAgZXh0LnBvcHVwQ29ubmVjdGlvbi5zZW5kKHthY3Rpb246J3RyYWNrJywgcGF5bG9hZDptc2cudHJhY2t9KTtcclxuICAgICAgICAgICAgICAgIGV4dC5wb3B1cENvbm5lY3Rpb24uc2VuZCh7YWN0aW9uOidwcm9ncmVzcycsIHBheWxvYWQ6bXNnLnByb2dyZXNzfSk7XHJcbiAgICAgICAgICAgICAgICBleHQucG9wdXBDb25uZWN0aW9uLnNlbmQoe2FjdGlvbjonc291cmNlJywgcGF5bG9hZDp7Li4ubXNnLnNvdXJjZSwgdGFiVHlwZTogdGhpcy50eXBlfX0pO1xyXG4gICAgICAgICAgICAgICAgZXh0LnBvcHVwQ29ubmVjdGlvbi5zZW5kKHthY3Rpb246J2NvbnRyb2xzJywgcGF5bG9hZDptc2cuY29udHJvbHN9KTtcclxuICAgICAgICAgICAgICAgIGV4dC5wb3B1cENvbm5lY3Rpb24uc2VuZCh7YWN0aW9uOidwbGF5bGlzdCcsIHBheWxvYWQ6bXNnLnBsYXlsaXN0fSk7XHJcbiAgICAgICAgICAgICAgICBleHQucG9wdXBDb25uZWN0aW9uLnNlbmQoe2FjdGlvbjonaXNQbGF5aW5nJywgcGF5bG9hZDptc2cuaXNQbGF5aW5nfSk7XHJcbiAgICAgICAgICAgICAgICBsb2cudHJhY2UoXCJ0YWIub25UcmFja3NsaXN0KCkgYWxsIGV2ZW50cyBzZW50IHRvIHBvcHVwXCIpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIC8v0L7QsdC90L7QstC70Y/QtdC8INC40LrQvtC90LrRgyDQvdCwINC/0LDQvdC10LvQuCDQsdGA0LDRg9C30LXRgNCwXHJcbiAgICAgICAgICAgIGJyb3dzZXJBY3Rpb24udXBkYXRlKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8v0L7QsdC90L7QstC70LXQvdC40LUg0L/Qu9C10LnQu9C40YHRgtCwXHJcbiAgICAgICAgZWxzZVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5wbGF5ZXIudXBkYXRlKHsncGxheWxpc3QnOiBtc2cucGxheWxpc3R9KTtcclxuICAgICAgICAgICAgaWYgKGlzQWN0aXZlICYmIGV4dC5wb3B1cENvbm5lY3Rpb24pIHtcclxuICAgICAgICAgICAgICAgIC8vb2xkXHJcbiAgICAgICAgICAgICAgICBleHQucG9wdXBDb25uZWN0aW9uLnNlbmQoWydwbGF5bGlzdCddKTtcclxuICAgICAgICAgICAgICAgIC8vbmV3XHJcbiAgICAgICAgICAgICAgICBleHQucG9wdXBDb25uZWN0aW9uLnNlbmQoe2FjdGlvbjoncGxheWxpc3QnLCBwYXlsb2FkOm1zZy5wbGF5bGlzdH0pO1xyXG4gICAgICAgICAgICAgICAgbG9nLnRyYWNlKFwidGFiLm9uVHJhY2tzbGlzdCgpIGV2ZW50IHNlbnQgdG8gcG9wdXBcIik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9O1xyXG5cclxuICAgIG9uQ29udHJvbHNBY3Rpb24gPSAobXNnLCBpc0FjdGl2ZSkgPT4ge1xyXG4gICAgICAgIGxvZy50cmFjZShcInRhYi5vbkNvbnRyb2xzKCkgd2l0aCBtZXNzYWdlICVvLCBpcyBhY3RpdmUgdGFiICVvXCIsIG1zZywgaXNBY3RpdmUpO1xyXG4gICAgICAgIHRoaXMucGxheWVyLnVwZGF0ZSh7J2NvbnRyb2xzJzogbXNnLmNvbnRyb2xzfSk7XHJcbiAgICAgICAgaWYgKGlzQWN0aXZlICYmIGV4dC5wb3B1cENvbm5lY3Rpb24pXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICAvL29sZFxyXG4gICAgICAgICAgICBleHQucG9wdXBDb25uZWN0aW9uLnNlbmQoWydjb250cm9scyddKTtcclxuICAgICAgICAgICAgLy9uZXdcclxuICAgICAgICAgICAgZXh0LnBvcHVwQ29ubmVjdGlvbi5zZW5kKHthY3Rpb246J2NvbnRyb2xzJywgcGF5bG9hZDptc2cuY29udHJvbHN9KTtcclxuICAgICAgICAgICAgbG9nLnRyYWNlKFwidGFiLm9uQ29udHJvbHMoKSBldmVudCBzZW50IHRvIHBvcHVwXCIpO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcblxyXG4gICAgb25UcmFja0FjdGlvbiA9IChtc2csIGlzQWN0aXZlKSA9PiB7XHJcbiAgICAgICAgbG9nLnRyYWNlKFwidGFiLm9uVHJhY2soKSB3aXRoIG1lc3NhZ2UgJW8sIGlzIGFjdGl2ZSB0YWIgJW9cIiwgbXNnLCBpc0FjdGl2ZSwgdGhpcy5wbGF5ZXIpO1xyXG4gICAgICAgIGNvbnN0IGlzSW5pdGlhbCA9ICh0aGlzLnBsYXllciA9PT0gbnVsbCk7XHJcblxyXG4gICAgICAgIHRoaXMucGxheWVyLnVwZGF0ZSh7XHJcbiAgICAgICAgICAgICd0cmFjayc6IG1zZy50cmFjayxcclxuICAgICAgICAgICAgJ3Byb2dyZXNzJzogbXNnLnByb2dyZXNzLFxyXG4gICAgICAgICAgICAnc291cmNlJzogbXNnLnNvdXJjZVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIGlmIChpc0FjdGl2ZSAmJiBleHQucG9wdXBDb25uZWN0aW9uKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgLy9vbGRcclxuICAgICAgICAgICAgZXh0LnBvcHVwQ29ubmVjdGlvbi5zZW5kKFsndHJhY2snLCAncHJvZ3Jlc3MnLCAnc291cmNlJ10pO1xyXG4gICAgICAgICAgICAvL25ld1xyXG4gICAgICAgICAgICBleHQucG9wdXBDb25uZWN0aW9uLnNlbmQoe2FjdGlvbjondHJhY2snLCBwYXlsb2FkOm1zZy50cmFja30pO1xyXG4gICAgICAgICAgICBleHQucG9wdXBDb25uZWN0aW9uLnNlbmQoe2FjdGlvbjoncHJvZ3Jlc3MnLCBwYXlsb2FkOm1zZy5wcm9ncmVzc30pO1xyXG4gICAgICAgICAgICBleHQucG9wdXBDb25uZWN0aW9uLnNlbmQoe2FjdGlvbjonc291cmNlJywgcGF5bG9hZDptc2cuc291cmNlfSk7XHJcbiAgICAgICAgICAgIGxvZy50cmFjZShcInRhYi5vblRyYWNrKCkgZXZlbnQgc2VudCB0byBwb3B1cFwiKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKCFpc0FjdGl2ZSkge1xyXG4gICAgICAgICAgICBsb2cudHJhY2UoXCJ0YWIub25UcmFjaygpIHRhYiBpcyBub3QgYWN0aXZlLCBkb24ndCBjcmVhdGUgbm90aWZpY2F0aW9uXCIpO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnN0IHR5cGUgPSBzdG9yYWdlLmdldCgndHlwZScpOyAvL9GA0LXQttC40Lwg0L/QvtC60LDQt9CwINGD0LLQtdC00L7QvNC70LXQvdC40LlcclxuXHJcbiAgICAgICAgaWYgKHR5cGUgPT0gXCJub25lXCIgfHwgdHlwZSA9PSBcImhvdGtcIikge1xyXG4gICAgICAgICAgICBsb2cudHJhY2UoXCJ0YWIub25UcmFjaygpIGRvbid0IGNyZWF0ZSBub3RpZmljYXRpb24gZHVlIHNldHRpbmdzXCIpO1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChpc0luaXRpYWwpIHtcclxuICAgICAgICAgICAgbG9nLmRlYnVnKFwidGFiLm9uVHJhY2soKSBkb24ndCBjcmVhdGUgbm90aWZpY2F0aW9uIG9uIGluaXRpYWxcIik7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKG1zZy5zZWNvbmRhcnkpIHtcclxuICAgICAgICAgICAgbG9nLnRyYWNlKFwidGFiLm9uVHJhY2soKSBkb24ndCBjcmVhdGUgbm90aWZpY2F0aW9uIGR1ZSBzZWNvbmRhcnkgYWN0aW9uXCIpO1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8v0LXRgdC70Lgg0L7RgtC60YDRi9GCINC/0L7Qv9Cw0L8g0LjQu9C4INGE0L7QutGD0YEg0L3QsCDRgtC10LrRg9GJ0LXQuSDQstC60LvQsNC00LrQtSDQv9C70LXQtdGA0LAgLSDQvdC1INC/0L7QutCw0LfRi9Cy0LDQtdC8INC90L7RgtC40YTQuNC60LDRhtGOXHJcbiAgICAgICAgaWYgKGNocm9tZS5leHRlbnNpb24uZ2V0Vmlld3Moe3R5cGU6ICdwb3B1cCd9KS5sZW5ndGggPiAwIHx8IHRhYnMuZ2V0QWN0aXZlVGFiKCkuZm9jdXNlZCkge1xyXG4gICAgICAgICAgICBsb2cudHJhY2UoXCJ0YWIub25UcmFjaygpIGRvbid0IGNyZWF0ZSBub3RpZmljYXRpb24gZHVlIGZvY3VzZWQgb3IgcG9wdXAgb3BlbmVkXCIpO1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBsb2cudHJhY2UoXCJ0YWIub25UcmFjaygpIGNyZWF0aW5nIG5vdGlmaWNhdGlvblwiKTtcclxuICAgICAgICBsZXQgYnV0dG9uc1R5cGUgPSB0aGlzLnR5cGU7XHJcbiAgICAgICAgaWYgKHRoaXMudHlwZSA9PSAnbXVzaWMnICYmIHRoaXMucGxheWVyLnNvdXJjZS50eXBlID09ICdyYWRpbycpXHJcbiAgICAgICAgICAgIGJ1dHRvbnNUeXBlICs9ICdyYWRpbyc7XHJcbiAgICAgICAgbm90aWZpY2F0aW9ucy5jcmVhdGUodGhpcy5wbGF5ZXIsIGJ1dHRvbnNUeXBlKTtcclxuICAgIH07XHJcblxyXG4gICAgb25JbmZvQWN0aW9uID0gKG1zZywgaXNBY3RpdmUpID0+IHtcclxuICAgICAgICBsb2cudHJhY2UoXCJ0YWIub25JbmZvKCkgd2l0aCBtZXNzYWdlICVvLCBpcyBhY3RpdmUgdGFiICVvXCIsIG1zZywgaXNBY3RpdmUpO1xyXG5cclxuICAgICAgICBpZiAoIW1zZy50cmFjaylcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGxvZy50cmFjZShcInRhYi5vbkluZm8oKSBlbXB0eSBkYXRhXCIpO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICghaXNBY3RpdmUpIHtcclxuICAgICAgICAgICAgbG9nLnRyYWNlKFwidGFiLm9uSW5mbygpIHRhYiBpcyBub3QgYWN0aXZlLCBkb24ndCBjcmVhdGUgbm90aWZpY2F0aW9uXCIpO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCB0eXBlID0gc3RvcmFnZS5nZXQoJ3R5cGUnKTsgLy/RgNC10LbQuNC8INC/0L7QutCw0LfQsCDRg9Cy0LXQtNC+0LzQu9C10L3QuNC5XHJcblxyXG4gICAgICAgIGlmICh0eXBlID09IFwibm9uZVwiIHx8IHR5cGUgPT0gXCJ0clwiKSB7XHJcbiAgICAgICAgICAgIGxvZy50cmFjZShcInRhYi5vbkluZm8oKSBkb24ndCBjcmVhdGUgbm90aWZpY2F0aW9uIGR1ZSBzZXR0aW5nc1wiKTtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgbG9nLnRyYWNlKFwidGFiLm9uVHJhY2soKSBjcmVhdGluZyBub3RpZmljYXRpb25cIik7XHJcbiAgICAgICAgbGV0IGJ1dHRvbnNUeXBlID0gdGhpcy50eXBlO1xyXG4gICAgICAgIGlmICh0aGlzLnR5cGUgPT0gJ211c2ljJyAmJiB0aGlzLnBsYXllci5zb3VyY2UudHlwZSA9PSAncmFkaW8nKVxyXG4gICAgICAgICAgICBidXR0b25zVHlwZSArPSAncmFkaW8nO1xyXG4gICAgICAgIG5vdGlmaWNhdGlvbnMuY3JlYXRlKHRoaXMucGxheWVyLCBidXR0b25zVHlwZSk7XHJcbiAgICB9O1xyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCB0YWI7IiwiaW1wb3J0IGV4dCBmcm9tICcuL2V4dCc7XHJcbmltcG9ydCBsb2cgZnJvbSAnbG9nbGV2ZWwnO1xyXG5pbXBvcnQgdXRpbHMgZnJvbSAnLi4vY29tbW9uL3V0aWxzJztcclxuaW1wb3J0IHRhYiBmcm9tICcuL3RhYic7XHJcbmltcG9ydCBicm93c2VyQWN0aW9uIGZyb20gJy4vYnJvd3NlckFjdGlvbic7XHJcblxyXG5jbGFzcyB0YWJzIHtcclxuICAgIGxpc3QgPSB7fTtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICBsb2cudHJhY2UoXCJ0YWJzLmNvbnN0cnVjdG9yKClcIik7XHJcblxyXG4gICAgICAgIC8v0LTQvtCx0LDQstC70Y/QtdC8INGB0LvRg9GI0LDRgtC10LvRjCDQvdCwINC40LfQvNC10L3QtdC90LjRjyBVUkwn0L7QsiDQstC60LvQsNC00L7QulxyXG4gICAgICAgIHRoaXMuYWRkVGFic0xpc3RlbmVycygpO1xyXG4gICAgfVxyXG5cclxuICAgIC8v0LTQvtCx0LDQstC70Y/QtdC8INGB0LvRg9GI0LDRgtC10LvRjCDQvdCwINC40LfQvNC10L3QtdC90LjRjyBVUkwn0L7QsiDQstC60LvQsNC00L7QulxyXG4gICAgYWRkVGFic0xpc3RlbmVycyA9ICgpID0+IHtcclxuICAgICAgICBsb2cudHJhY2UoXCJ0YWJzLmFkZFRhYnNMaXN0ZW5lcnMoKVwiKTtcclxuICAgICAgICAvL9GB0L7QsdGL0YLQuNC1INC+0LHQvdC+0LLQu9C10L3QuNGPINCy0LrQu9Cw0LTQutC4XHJcbiAgICAgICAgY2hyb21lLnRhYnMub25VcGRhdGVkLmFkZExpc3RlbmVyKHRoaXMub25VcGRhdGVkKTtcclxuICAgICAgICAvL9GB0L7QsdGL0YLQuNC1INC30LDQutGA0YvRgtC40Y8g0LLQutC70LDQtNC60LhcclxuICAgICAgICBjaHJvbWUudGFicy5vblJlbW92ZWQuYWRkTGlzdGVuZXIodGhpcy5vblJlbW92ZWQpO1xyXG4gICAgfTtcclxuXHJcbiAgICBvblJlbW92ZWQgPSAodGFiSWQsIHJlbW92ZUluZm8pID0+IHtcclxuICAgICAgICBsb2cudHJhY2UoXCJ0YWJzLm9uUmVtb3ZlZCgpIG9uIHRhYiA8JWQ+LCByZW1vdmVJbmZvICVvXCIsIHRhYklkLCByZW1vdmVJbmZvKTtcclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5nZXRCeUlkKHRhYklkKSlcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgbG9nLnRyYWNlKFwidGFicy5vblJlbW92ZWQoKSByZW1vdmluZyB0YWIgZnJvbSBsaXN0XCIpO1xyXG4gICAgICAgICAgICAgICAgbG9nLmVycm9yKFwiVGFiIGNsb3NlZCB2aWEgdGFicyBvblJlbW92ZWQgZXZlbnRcIik7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNodXRkb3duKHRhYklkKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0gY2F0Y2ggKGUpIHsgdXRpbHMuZXJyb3JIYW5kbGVyKGUpOyB9XHJcbiAgICB9O1xyXG5cclxuICAgIC8v0JIgQ1Mg0L3QsCDRgdGC0YDQsNC90LjRhtGDINCy0LXRiNCw0LXRgtGB0Y8g0L7QsdGA0LDQsdC+0YLRh9C40Log0YHQvtCx0YvRgtC40Y8gb25iZWZvcmV1bmxvYWQsINC60L7RgtC+0YDRi9C5INC/0LXRgNC10LQg0LfQsNC60YDRi9GC0LjQtdC8INC+0LrQvdCwINC/0YDQuNGB0YvQu9Cw0LXRgiDRgdC+0L7QsdGJ0LXQvdC40LVcclxuICAgIC8v0YDQsNGB0YjQuNGA0LXQvdC40Y4g0Lgg0YHQvtC+0YLQstC10YLRgdGC0LLRg9GO0YnQtdC5INCy0LrQu9Cw0LTQutC1INC00LXQu9Cw0LXRgtGB0Y8gc2h1dGRvd24uINCh0LDQvCDRgdC10YDQstC40YEg0Y/QstC70Y/QtdGC0YHRjyBTUEEg0Lgg0L/RgNC4INC90LDQstC40LPQsNGG0LjQuCDRjdGC0L4g0YHQvtCx0YvRgtC40LUg0L3QtVxyXG4gICAgLy/RgdGA0LDQsdCw0YLRi9Cy0LDQtdGCLCDRgtC10Lwg0YHQsNC80YvQvCwg0L3QtSDQvdGD0LbQvdC+INGB0LvQtdC00LjRgtGMINC60YPQtNCwINGD0LbQtSDQt9Cw0LjQvdC20LXQutGC0LjQu9C4INC60L7QtCwg0LAg0LrRg9C00LAg0L3QtdGCLiDQotCw0LrQttC1INC+INC30LDQutGA0YvRgtC40Lgg0L7QutC90LAg0LzQvtC20LXRglxyXG4gICAgLy/Qv9C+0YLQtdC90LXRhtC40LDQu9GM0L3QviDRgdC+0L7QsdGJ0LjRgtGMINGB0L7QsdGL0YLQuNC1IG9uRGlzY29ubmVjdCDRgyDQv9C+0YDRgtCwLCDRh9C10YDQtdC3INC60L7RgtC+0YDRi9C5INC40LTQtdGCINC+0LHQvNC10L0g0YHQvtC+0LHRidC10L3QuNGP0LzQuC5cclxuICAgIG9uVXBkYXRlZCA9ICh0YWJJZCwgY2hhbmdlSW5mbywgdGFiKSA9PiB7XHJcbiAgICAgICAgbG9nLnRyYWNlKFwidGFicy5vblVwZGF0ZWQoKSBvbiB0YWIgPCVkPiwgY2hhbmdlSW5mbyAlbywgdGFiICVvXCIsIHRhYklkLCBjaGFuZ2VJbmZvLCB0YWIpO1xyXG5cclxuICAgICAgICBpZiAoISgnc3RhdHVzJyBpbiBjaGFuZ2VJbmZvIHx8ICd1cmwnIGluIGNoYW5nZUluZm8pKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgbG9nLnRyYWNlKFwib25VcGRhdGVkKCkgbm90IGludGVyZXN0ZWQgY2hhbmdlIGV2ZW50XCIsIGNoYW5nZUluZm8pO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvL9C/0YDQvtCy0LXRgNGP0LXQvCDRgdC+0LLQv9Cw0LTQtdC90LjQtSBVUkwn0LBcclxuICAgICAgICBjb25zdCBVUkwgPSB1dGlscy5pc1VybE1hdGNoKHRhYi51cmwpO1xyXG4gICAgICAgIGxvZy50cmFjZShcInRhYnMub25VcGRhdGVkKCkgVVJMXCIsIFVSTCk7XHJcbiAgICAgICAgaWYgKGNoYW5nZUluZm8uc3RhdHVzICE9ICdjb21wbGV0ZScpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBsb2cudHJhY2UoXCJ0YWJzLm9uVXBkYXRlZCgpIFVSTCBsb2FkaW5nIGlzIG5vdCBjb21wbGV0ZWRcIik7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKFVSTCA9PT0gZmFsc2UpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5nZXRCeUlkKHRhYklkKSlcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgbG9nLmVycm9yKFwidGFicy5vblVwZGF0ZWQoKSBVUkwgY2hhbmdlZCB0byBub24tbWF0Y2hlZCwgcmVtb3ZpbmcgaXQgZnJvbSBsaXN0XCIpO1xyXG4gICAgICAgICAgICAgICAgbG9nLmVycm9yKFwiVGFiIGNsb3NlZCB2aWEgVVJMIGNoYW5nZWQgdG8gbm9uLW1hdGNoZWQgd2hpbGUgdGFicyBvblVwZGF0ZWQgZXZlbnRcIik7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNodXRkb3duKHRhYklkKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvL9C90L7QstCw0Y8g0LLQutC70LDQtNC60LAsINC00L7QsdCw0LLQu9GP0LXQvCDQsiDRgdC/0LjRgdC+0LpcclxuICAgICAgICBpZiAoIXRoaXMuZ2V0QnlJZCh0YWJJZCkpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBsb2cudHJhY2UoXCJ0YWJzLm9uVXBkYXRlZCgpIHRhYiBVUkwgdmFsaWQgYW5kIG5vdCBmb3VuZCBpbiBsaXN0LCBhZGRpbmdcIik7XHJcbiAgICAgICAgICAgIC8v0LTQvtCx0LDQstC70Y/QtdC8INCy0LrQu9Cw0LTQutGDINCyINGB0L/QuNGB0L7QulxyXG4gICAgICAgICAgICB0aGlzLmFkZCh0YWJJZCwgVVJMLmlzTXVzaWMgPyAnbXVzaWMnIDogJ3JhZGlvJyk7XHJcbiAgICAgICAgICAgIC8v0LTQtdC70LDQtdC8INC40L3RitC10LrRhtC40Y5cclxuICAgICAgICAgICAgdXRpbHMuaW5qZWN0U2NyaXB0KHRhYklkLCBcImV4dGVuc2lvbi9jcy5qc1wiKTtcclxuICAgICAgICAgICAgLy/QvtCx0L3QvtCy0LvRj9C10Lwg0LjQutC+0L3QutGDINC90LAg0L/QsNC90LXQu9C4INCx0YDQsNGD0LfQtdGA0LBcclxuICAgICAgICAgICAgYnJvd3NlckFjdGlvbi51cGRhdGUoKTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG5cclxuICAgIHNodXRkb3duID0gdGFiSWQgPT4ge1xyXG4gICAgICAgIGxvZy50cmFjZShcInRhYnMuc2h1dGRvd24oKSBvbiA8JWQ+XCIsIHRhYklkKTtcclxuICAgICAgICAvL9C10YHQu9C4INC30LDQutGA0YvQstCw0LXQvCDRgtC10LrRg9GJ0YPRjiDQstC60LvQsNC00LrRgywg0LfQsNC60YDRi9Cy0LDQtdC8INC/0L7Qv9Cw0L9cclxuICAgICAgICBpZiAodGhpcy5nZXRBY3RpdmVUYWIoKS5pZCA9PSB0YWJJZClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGxvZy50cmFjZShcInRhYnMuc2h1dGRvd24oKSBjbG9zaW5nIHBvcHVwXCIpO1xyXG4gICAgICAgICAgICBicm93c2VyQWN0aW9uLmNsb3NlUG9wdXAoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8v0YPQtNCw0LvRj9C10Lwg0LLQutC70LDQtNC60YNcclxuICAgICAgICBpZiAodGhpcy5saXN0W3RhYklkXSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGxvZy50cmFjZShcInRhYnMuc2h1dGRvd24oKSBjbG9zaW5nIHRhYlwiKTtcclxuICAgICAgICAgICAgLy/Qv9C10YDQtdC0INGD0LTQsNC70LXQvdC40LXQvCDQvtGH0LjRidCw0LXQvCDRgtCw0LnQvNC10YAg0LLQutC70LDQtNC60LgsINC60L7RgtC+0YDRi9C5INC80L7QvdC40YLQvtGA0LjQuyDQtdC1INC20LjQstGD0YfQtdGB0YLRjFxyXG4gICAgICAgICAgICBjbGVhckludGVydmFsKHRoaXMubGlzdFt0YWJJZF0udGltZXIpO1xyXG4gICAgICAgICAgICAvL9GD0LTQsNC70Y/QtdC8XHJcbiAgICAgICAgICAgIGRlbGV0ZSB0aGlzLmxpc3RbdGFiSWRdO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy/QvtCx0L3QvtCy0LvRj9C10Lwg0LjQutC+0L3QutGDINC90LAg0L/QsNC90LXQu9C4INCx0YDQsNGD0LfQtdGA0LBcclxuICAgICAgICBicm93c2VyQWN0aW9uLnVwZGF0ZSgpO1xyXG4gICAgfTtcclxuXHJcbiAgICBnZXRCeUlkID0gdGFiSWQgPT4ge1xyXG4gICAgICAgIGxvZy50cmFjZShcInRhYnMuZ2V0QnlJZCgpIG9uIDwlZD5cIiwgdGFiSWQpO1xyXG5cclxuICAgICAgICBsb2cudHJhY2UoXCJ0YWJzLmdldEJ5SWQoKSByZXR1cm5zICVvXCIsIHRoaXMubGlzdFt0YWJJZF0pO1xyXG4gICAgICAgIHJldHVybiB0aGlzLmxpc3RbdGFiSWRdOyAvL3RhYiBvciB1bmRlZmluZWRcclxuICAgIH07XHJcblxyXG4gICAgZ2V0QWN0aXZlVGFiID0gKCkgPT4ge1xyXG4gICAgICAgIGxvZy50cmFjZShcInRhYnMuZ2V0QWN0aXZlVGFiKCkgZnJvbSBsaXN0ICVvXCIsIHRoaXMubGlzdCk7XHJcblxyXG4gICAgICAgIGlmICh0aGlzLmNvdW50KCkgPT0gMSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGxvZy50cmFjZShcInRhYnMuZ2V0QWN0aXZlVGFiKCkgcmV0dXJucyAlb1wiLCB0aGlzLmxpc3RbT2JqZWN0LmtleXModGhpcy5saXN0KVswXV0pO1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5saXN0W09iamVjdC5rZXlzKHRoaXMubGlzdClbMF1dO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy/QsNC60YLQuNCy0L3QvtC5INGB0YfQuNGC0LDQtdGC0YHRjyDQv9C10YDQstCw0Y8gKNC/0L4g0LLRgNC10LzQtdC90LgpINC+0YLQutGA0YvRgtCw0Y8g0LLQutC70LDQtNC60LAg0LjQtyDRgdC/0LjRgdC60LBcclxuICAgICAgICBjb25zdCBzb3J0ZWRCeVRpbWUgPSBBcnJheS5wcm90b3R5cGUuc29ydC5jYWxsKHRoaXMubGlzdCwgKGEsYikgPT4ge1xyXG4gICAgICAgICAgICBpZiAoYS5vcGVuZWRUaW1lIDwgYi5vcGVuZWRUaW1lKSByZXR1cm4gLTE7XHJcbiAgICAgICAgICAgIGlmIChhLm9wZW5lZFRpbWUgPiBiLm9wZW5lZFRpbWUpIHJldHVybiAxO1xyXG4gICAgICAgICAgICByZXR1cm4gMDtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gT2JqZWN0LmtleXMoc29ydGVkQnlUaW1lKS5sZW5ndGggPyBzb3J0ZWRCeVRpbWVbT2JqZWN0LmtleXMoc29ydGVkQnlUaW1lKVswXV0gOiBmYWxzZTtcclxuICAgICAgICBsb2cudHJhY2UoXCJ0YWJzLmdldEFjdGl2ZVRhYigpIHJldHVybnMgJW9cIiwgcmVzdWx0KTtcclxuICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgfTtcclxuXHJcbiAgICBhZGQgPSAodGFiSWQsIHRhYlR5cGUpID0+IHtcclxuICAgICAgICBsb2cudHJhY2UoXCJ0YWJzLmFkZFRhYigpIG9uIDwlZD4gd2l0aCB0eXBlIDwlcz5cIiwgdGFiSWQsIHRhYlR5cGUpO1xyXG5cclxuICAgICAgICB0aGlzLmxpc3RbdGFiSWRdID0gbmV3IHRhYih0YWJJZCwgdGFiVHlwZSk7XHJcbiAgICB9O1xyXG5cclxuICAgIHVwZGF0ZSA9ICh0YWJJZCwga2V5LCB2YWx1ZSkgPT4ge1xyXG4gICAgICAgIGxvZy50cmFjZShcInRhYnMudXBkYXRlKCkgb24gPCVkPiB3aXRoIGRhdGEgJXMgPT4gJW9cIiwgdGFiSWQsIGtleSwgdmFsdWUpO1xyXG5cclxuICAgICAgICBpZiAoIXRoaXMubGlzdFt0YWJJZF0gfHwgIXRoaXMubGlzdFt0YWJJZF0uaGFzT3duUHJvcGVydHkoa2V5KSkge1xyXG4gICAgICAgICAgICBsb2cudHJhY2UoXCJ0YWJzLnVwZGF0ZSgpIG5vdCB1cGRhdGVkXCIpO1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLmxpc3RbdGFiSWRdW2tleV0gPSB2YWx1ZTtcclxuICAgICAgICBsb2cudHJhY2UoXCJ0YWJzLnVwZGF0ZSgpIHVwZGF0ZWRcIik7XHJcbiAgICB9O1xyXG5cclxuICAgIGNvdW50ID0gKCkgPT4ge1xyXG4gICAgICAgIGxvZy50cmFjZShcInRhYnMuY291bnQoKSByZXR1cm5zIDwlZD5cIiwgT2JqZWN0LmtleXModGhpcy5saXN0KS5sZW5ndGgpO1xyXG4gICAgICAgIHJldHVybiBPYmplY3Qua2V5cyh0aGlzLmxpc3QpLmxlbmd0aDtcclxuICAgIH07XHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IG5ldyB0YWJzKCk7IiwiaW1wb3J0IGxvZyBmcm9tICdsb2dsZXZlbCc7XHJcblxyXG5jbGFzcyBwb3J0IHtcclxuXHJcbiAgICBwb3J0ID0gbnVsbDtcclxuICAgIHBvcnROYW1lID0gbnVsbDtcclxuICAgIHBvcnRUeXBlID0gbnVsbDtcclxuICAgIHRocm90dGxlZCA9IHt9O1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKHBvcnROYW1lLCBwb3J0VHlwZSA9ICdjbGllbnQnLCBjbGllbnRDb25uZWN0ZWRQb3J0ID0gbnVsbCkge1xyXG4gICAgICAgIGxvZy50cmFjZShcInBvcnRbJXNdWyVzXS5jb25zdHJ1Y3RvcigpIHdpdGggcG9ydFR5cGUgPCVzPiBhbmQgY2xpZW50J3MgY29ubmVjdGVkIHBvcnQgJW9cIiwgdGhpcy5wb3J0TmFtZSwgdGhpcy5wb3J0VHlwZSwgcG9ydFR5cGUsIGNsaWVudENvbm5lY3RlZFBvcnQpO1xyXG4gICAgICAgIHRyeVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgaWYgKHBvcnRUeXBlID09ICdjbGllbnQnKSBcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgbG9nLnRyYWNlKFwicG9ydFslc11bJXNdLmNvbnN0cnVjdG9yKCkgcG9ydCBjb25uZWN0aW5nXCIsIHRoaXMucG9ydE5hbWUsIHRoaXMucG9ydFR5cGUpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5wb3J0ID0gY2hyb21lLnJ1bnRpbWUuY29ubmVjdCh7bmFtZTogcG9ydE5hbWV9KTtcclxuICAgICAgICAgICAgICAgIGxvZy50cmFjZShcInBvcnRbJXNdWyVzXS5jb25zdHJ1Y3RvcigpIHBvcnQgY29ubmVjdGVkXCIsIHRoaXMucG9ydE5hbWUsIHRoaXMucG9ydFR5cGUpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2UgaWYgKHBvcnRUeXBlID09ICdob3N0JylcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5wb3J0ID0gY2xpZW50Q29ubmVjdGVkUG9ydDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aGlzLnBvcnQub25EaXNjb25uZWN0LmFkZExpc3RlbmVyKHRoaXMub25EaXNjb25uZWN0KTtcclxuICAgICAgICAgICAgdGhpcy5wb3J0Lm9uTWVzc2FnZS5hZGRMaXN0ZW5lcih0aGlzLm9uTWVzc2FnZSk7XHJcbiAgICAgICAgICAgIHRoaXMucG9ydFR5cGUgPSBwb3J0VHlwZTtcclxuICAgICAgICAgICAgdGhpcy5wb3J0TmFtZSA9IHBvcnROYW1lO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjYXRjaCAoZSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGxvZy50cmFjZShcInBvcnRbJXNdWyVzXS5jb25zdHJ1Y3RvcigpIHBvcnQgY29ubmVjdGlvbiBlcnJvciAlb1wiLCB0aGlzLnBvcnROYW1lLCB0aGlzLnBvcnRUeXBlLCBlKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgb25NZXNzYWdlID0gcmVxdWVzdCA9PiB7XHJcbiAgICAgICAgbG9nLnRyYWNlKFwicG9ydFslc11bJXNdLm9uTWVzc2FnZSgpIHJlcXVlc3QgJW9cIiwgdGhpcy5wb3J0TmFtZSwgdGhpcy5wb3J0VHlwZSwgcmVxdWVzdCk7XHJcbiAgICAgICAgaWYgKHRoaXMub25NZXNzYWdlQ2IpXHJcbiAgICAgICAgICAgIHRoaXMub25NZXNzYWdlQ2IocmVxdWVzdCk7XHJcbiAgICB9O1xyXG5cclxuICAgIG9uTWVzc2FnZUNiID0gcmVxdWVzdCA9PiB7XHJcbiAgICAgICAgbG9nLnRyYWNlKFwicG9ydFslc11bJXNdLm9uTWVzc2FnZUNiKCkgcmVxdWVzdCAlb1wiLCB0aGlzLnBvcnROYW1lLCB0aGlzLnBvcnRUeXBlLCByZXF1ZXN0KTtcclxuICAgIH07XHJcblxyXG4gICAgYWRkT25NZXNzYWdlQ2IgPSBjYiA9PiB7XHJcbiAgICAgICAgbG9nLnRyYWNlKFwicG9ydFslc11bJXNdLmFkZE9uTWVzc2FnZUNiKCkgd2l0aCBjYiAlb1wiLCB0aGlzLnBvcnROYW1lLCB0aGlzLnBvcnRUeXBlLCBjYik7XHJcbiAgICAgICAgdGhpcy5vbk1lc3NhZ2VDYiA9IGNiO1xyXG4gICAgfTtcclxuXHJcbiAgICBvbkRpc2Nvbm5lY3QgPSAoKSA9PiB7XHJcbiAgICAgICAgbG9nLmVycm9yKFwicG9ydFslc11bJXNdLmNvbnN0cnVjdG9yKCkgcG9ydCBkaXNjb25uZWN0ZWQgZnJvbSBvdGhlciBzaWRlXCIsIHRoaXMucG9ydE5hbWUsIHRoaXMucG9ydFR5cGUpO1xyXG4gICAgICAgIHRoaXMucG9ydCA9IG51bGw7XHJcbiAgICB9O1xyXG5cclxuICAgIHNlbmQgPSAoZGF0YSwgdXNlVGhyb3R0bGluZyA9IGZhbHNlLCB0aHJvdHRsaW5nS2V5ID0gbnVsbCwgdGhyb3R0bGVUaW1lID0gMTAwMCkgPT4ge1xyXG4gICAgICAgIGxvZy50cmFjZShcInBvcnRbJXNdWyVzXS5zZW5kKClcIisodXNlVGhyb3R0bGluZyA/IFwiIHRocm90dGxlZFwiIDogXCJcIikrXCIgZGF0YSAlb1wiLCB0aGlzLnBvcnROYW1lLCB0aGlzLnBvcnRUeXBlLCBkYXRhKTtcclxuICAgICAgICBpZiAoIXRoaXMucG9ydClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGxvZy5kZWJ1ZyhcInBvcnRbJXNdWyVzXS5zZW5kKCkgcG9ydCBub3QgY29ubmVjdGVkXCIsIHRoaXMucG9ydE5hbWUsIHRoaXMucG9ydFR5cGUpO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICBsb2cudHJhY2UoXCJwb3J0WyVzXVslc10uc2VuZCgpIHNlbmRpbmdcIiwgdGhpcy5wb3J0TmFtZSwgdGhpcy5wb3J0VHlwZSk7XHJcbiAgICAgICAgICAgIGlmICghdXNlVGhyb3R0bGluZyB8fCBuZXcgRGF0ZSgpLmdldFRpbWUoKSAtIHRocm90dGxlVGltZSA+ICh0aGlzLnRocm90dGxlZFt0aHJvdHRsaW5nS2V5XSB8fCAwKSlcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5wb3J0LnBvc3RNZXNzYWdlKGRhdGEpO1xyXG4gICAgICAgICAgICAgICAgaWYgKHVzZVRocm90dGxpbmcpXHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy50aHJvdHRsZWRbdGhyb3R0bGluZ0tleV0gPSBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcclxuICAgICAgICAgICAgICAgIGxvZy5kZWJ1ZyhcInBvcnRbJXNdWyVzXS5zZW5kKCkgc2VudCBkYXRhICVvXCIsIHRoaXMucG9ydE5hbWUsIHRoaXMucG9ydFR5cGUsIGRhdGEpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgICAgIGxvZy50cmFjZShcInBvcnRbJXNdWyVzXS5zZW5kKCkgc2VuZCBjYW5jZWxlZCBkdWUgdGhyb3R0bGluZyAlZCBtc1wiLCB0aGlzLnBvcnROYW1lLCB0aGlzLnBvcnRUeXBlLCB0aHJvdHRsZVRpbWUpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjYXRjaCAoZSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMucG9ydCA9IG51bGw7XHJcbiAgICAgICAgICAgIGxvZy5lcnJvcihcInBvcnRbJXNdWyVzXS5zZW5kKCkgZXJyb3Igd2hpbGUgc2VuZGluZyAlb1wiLCB0aGlzLnBvcnROYW1lLCB0aGlzLnBvcnRUeXBlLCBlKTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBwb3J0OyIsImltcG9ydCBsb2cgZnJvbSAnbG9nbGV2ZWwnO1xyXG5cclxuY2xhc3MgdXRpbHMge1xyXG4gICAgY29uc3RydWN0b3IoKSB7fVxyXG5cclxuICAgIC8v0L/RgNC+0LLQtdGA0LrQsCBVUkwn0LAg0LLQutC70LDQtNC60Lgg0L3QsCDQv9GA0LXQtNC80LXRgiDQry7QnNGD0LfRi9C60Lgg0LjQu9C4INCvLtCg0LDQtNC40L5cclxuICAgIHN0YXRpYyBpc1VybE1hdGNoKHVybCkge1xyXG4gICAgICAgIGlmICh1cmwubWF0Y2goL15odHRwcz86XFwvXFwvKHJhZGlvfG11c2ljKVxcLnlhbmRleFxcLihydXxieXxrenx1YSlcXC8uKlxcLihnaWZ8cG5nfGpwZ3xzdmd8anN8Y3NzfGljbykkLykpXHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuXHJcbiAgICAgICAgbGV0IGlzUmFkaW8gPSAodXJsLm1hdGNoKC9eaHR0cHM/OlxcL1xcL3JhZGlvXFwueWFuZGV4XFwuKHJ1fGJ5fGt6fHVhKVxcLy4qJC8pICE9PSBudWxsKSxcclxuICAgICAgICAgICAgaXNNdXNpYyA9ICh1cmwubWF0Y2goL15odHRwcz86XFwvXFwvbXVzaWNcXC55YW5kZXhcXC4ocnV8Ynl8a3p8dWEpXFwvLiokLykgIT09IG51bGwpO1xyXG5cclxuICAgICAgICByZXR1cm4gaXNSYWRpbyB8fCBpc011c2ljID8ge2lzUmFkaW86IGlzUmFkaW8sIGlzTXVzaWM6IGlzTXVzaWN9IDogZmFsc2U7XHJcbiAgICB9O1xyXG5cclxuICAgIC8vaW5qZWN0J9C40Lwg0L3QsNGIINC60L7QtCDQsiBjb250ZW50LXNjcmlwdCDQstC60LvQsNC00LrQuFxyXG4gICAgc3RhdGljIGluamVjdFNjcmlwdCh0YWJJZCwgZmlsZSkge1xyXG4gICAgICAgIGNocm9tZS50YWJzLmV4ZWN1dGVTY3JpcHQodGFiSWQsIHtmaWxlOiBmaWxlfSwgKCkgPT4ge1xyXG4gICAgICAgICAgICBpZiAoY2hyb21lLnJ1bnRpbWUubGFzdEVycm9yKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBpZiAoY2hyb21lLnJ1bnRpbWUubGFzdEVycm9yLm1lc3NhZ2UgPT0gJ1RoZSB0YWIgd2FzIGNsb3NlZCcpXHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG5cclxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkluamVjdCBvZiBmaWxlIDxcIitmaWxlK1wiPiBvbiB0YWIgPFwiK3RhYklkK1wiPiBlcnJvcjogXCIrY2hyb21lLnJ1bnRpbWUubGFzdEVycm9yLm1lc3NhZ2UpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9O1xyXG5cclxuICAgIC8vaW5qZWN0INC60L7QtNCwINCyINC/0YDQvtGB0YLRgNCw0L3QvtGB0YLQstC+INGB0YLRgNCw0L3QuNGG0Ysg0LjQtyBDUyDRgdC60YDQuNC/0YLQsCwg0LrQvtGC0L7RgNGL0Lkg0LLRi9C/0L7Qu9C90Y/QtdGC0YHRjyDQsiDQv9C10YHQvtGH0L3QuNGG0LVcclxuICAgIHN0YXRpYyBpbmplY3RDb2RlKGZ1bmMsIC4uLmFyZ3MpIHtcclxuICAgICAgICBsZXQgc2NyaXB0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc2NyaXB0Jyk7XHJcbiAgICAgICAgc2NyaXB0LnRleHRDb250ZW50ID0gJ3RyeSB7KCcgKyBmdW5jICsgJykoJyArIGFyZ3MgKyAnKTsgfSBjYXRjaChlKSB7Y29uc29sZS5lcnJvcihcImluamVjdGVkIGVycm9yXCIsIGUpO307JztcclxuICAgICAgICAoZG9jdW1lbnQuaGVhZCB8fCBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQpLmFwcGVuZENoaWxkKHNjcmlwdCk7XHJcbiAgICAgICAgc2NyaXB0LnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQoc2NyaXB0KTtcclxuICAgIH1cclxuXHJcbiAgICBzdGF0aWMgZ3VpZCgpIHtcclxuICAgICAgICBsZXQgczQgPSBmdW5jdGlvbigpeyByZXR1cm4gTWF0aC5mbG9vcigoMSArIE1hdGgucmFuZG9tKCkpICogMHgxMDAwMCkudG9TdHJpbmcoMTYpLnN1YnN0cmluZygxKTsgfTtcclxuICAgICAgICByZXR1cm4gYCR7czQoKX0ke3M0KCl9LSR7czQoKX0tJHtzNCgpfS0ke3M0KCl9LSR7czQoKX0ke3M0KCl9JHtzNCgpfWA7XHJcbiAgICB9O1xyXG5cclxuICAgIHN0YXRpYyBlcnJvckhhbmRsZXIgPSBlID0+IHtcclxuICAgICAgICBsb2cuZXJyb3IoXCJlcnJvckhhbmRsZXIoKSB3aXRoIGVycm9yXCIsIGUpO1xyXG4gICAgICAgIGdhKCdzZW5kJywgJ2V2ZW50JywgJ2Vycm9yJywgJ2JnJywgXCJ2XCIrY2hyb21lLnJ1bnRpbWUuZ2V0TWFuaWZlc3QoKS52ZXJzaW9uK1wiXFxuXCIrZS5zdGFjayk7XHJcbiAgICB9O1xyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCB1dGlsczsiLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCIuL2xpYi9qcXVlcnlcIikuZXh0ZW5kO1xuIiwiLyohXG4gKiAoZXh0cmFjdGVkIGZyb20pXG4gKiBqUXVlcnkgSmF2YVNjcmlwdCBMaWJyYXJ5IHYyLjAuM1xuICogaHR0cDovL2pxdWVyeS5jb20vXG4gKlxuICogQ29weXJpZ2h0IDIwMDUsIDIwMTMgalF1ZXJ5IEZvdW5kYXRpb24sIEluYy4gYW5kIG90aGVyIGNvbnRyaWJ1dG9yc1xuICogUmVsZWFzZWQgdW5kZXIgdGhlIE1JVCBsaWNlbnNlXG4gKiBodHRwOi8vanF1ZXJ5Lm9yZy9saWNlbnNlXG4gKlxuICogRGF0ZTogMjAxMy0wNy0wM1QxMzozMFpcbiAqL1xudmFyIGNsYXNzMnR5cGUgPSB7XG4gIFwiW29iamVjdCBCb29sZWFuXVwiOiAgIFwiYm9vbGVhblwiLFxuICBcIltvYmplY3QgTnVtYmVyXVwiOiAgICBcIm51bWJlclwiLFxuICBcIltvYmplY3QgU3RyaW5nXVwiOiAgICBcInN0cmluZ1wiLFxuICBcIltvYmplY3QgRnVuY3Rpb25dXCI6ICBcImZ1bmN0aW9uXCIsXG4gIFwiW29iamVjdCBBcnJheV1cIjogICAgIFwiYXJyYXlcIixcbiAgXCJbb2JqZWN0IERhdGVdXCI6ICAgICAgXCJkYXRlXCIsXG4gIFwiW29iamVjdCBSZWdFeHBdXCI6ICAgIFwicmVnZXhwXCIsXG4gIFwiW29iamVjdCBPYmplY3RdXCI6ICAgIFwib2JqZWN0XCIsXG4gIFwiW29iamVjdCBFcnJvcl1cIjogICAgIFwiZXJyb3JcIlxufTtcblxudmFyIGNvcmVfdG9TdHJpbmcgPSBjbGFzczJ0eXBlLnRvU3RyaW5nLFxuICAgIGNvcmVfaGFzT3duICAgPSBjbGFzczJ0eXBlLmhhc093blByb3BlcnR5O1xuXG52YXIgalF1ZXJ5ID0gbW9kdWxlLmV4cG9ydHMgPSB7fTtcblxualF1ZXJ5LmlzRnVuY3Rpb24gPSBmdW5jdGlvbiggb2JqICkge1xuICByZXR1cm4galF1ZXJ5LnR5cGUob2JqKSA9PT0gXCJmdW5jdGlvblwiO1xufTtcblxualF1ZXJ5LmlzQXJyYXkgPSBBcnJheS5pc0FycmF5O1xuXG5qUXVlcnkuaXNXaW5kb3cgPSBmdW5jdGlvbiggb2JqICkge1xuICByZXR1cm4gb2JqICE9IG51bGwgJiYgb2JqID09PSBvYmoud2luZG93O1xufTtcblxualF1ZXJ5LnR5cGUgPSBmdW5jdGlvbiggb2JqICkge1xuICBpZiAoIG9iaiA9PSBudWxsICkge1xuICAgIHJldHVybiBTdHJpbmcoIG9iaiApO1xuICB9XG4gIHJldHVybiB0eXBlb2Ygb2JqID09PSBcIm9iamVjdFwiIHx8IHR5cGVvZiBvYmogPT09IFwiZnVuY3Rpb25cIiA/XG4gICAgY2xhc3MydHlwZVsgY29yZV90b1N0cmluZy5jYWxsKG9iaikgXSB8fCBcIm9iamVjdFwiIDpcbiAgICB0eXBlb2Ygb2JqO1xufTtcblxualF1ZXJ5LmlzUGxhaW5PYmplY3QgPSBmdW5jdGlvbiggb2JqICkge1xuICBpZiAoIGpRdWVyeS50eXBlKCBvYmogKSAhPT0gXCJvYmplY3RcIiB8fCBvYmoubm9kZVR5cGUgfHwgalF1ZXJ5LmlzV2luZG93KCBvYmogKSApIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICB0cnkge1xuICAgIGlmICggb2JqLmNvbnN0cnVjdG9yICYmICFjb3JlX2hhc093bi5jYWxsKCBvYmouY29uc3RydWN0b3IucHJvdG90eXBlLCBcImlzUHJvdG90eXBlT2ZcIiApICkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfSBjYXRjaCAoIGUgKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgcmV0dXJuIHRydWU7XG59O1xuXG5qUXVlcnkuZXh0ZW5kID0gZnVuY3Rpb24oKSB7XG4gIHZhciBvcHRpb25zLFxuICAgICAgbmFtZSxcbiAgICAgIHNyYyxcbiAgICAgIGNvcHksXG4gICAgICBjb3B5SXNBcnJheSxcbiAgICAgIGNsb25lLFxuICAgICAgdGFyZ2V0ID0gYXJndW1lbnRzWzBdIHx8IHt9LFxuICAgICAgaSA9IDEsXG4gICAgICBsZW5ndGggPSBhcmd1bWVudHMubGVuZ3RoLFxuICAgICAgZGVlcCA9IGZhbHNlO1xuXG4gIGlmICggdHlwZW9mIHRhcmdldCA9PT0gXCJib29sZWFuXCIgKSB7XG4gICAgZGVlcCA9IHRhcmdldDtcbiAgICB0YXJnZXQgPSBhcmd1bWVudHNbMV0gfHwge307XG4gICAgaSA9IDI7XG4gIH1cblxuICBpZiAoIHR5cGVvZiB0YXJnZXQgIT09IFwib2JqZWN0XCIgJiYgIWpRdWVyeS5pc0Z1bmN0aW9uKHRhcmdldCkgKSB7XG4gICAgdGFyZ2V0ID0ge307XG4gIH1cblxuICBpZiAoIGxlbmd0aCA9PT0gaSApIHtcbiAgICB0YXJnZXQgPSB0aGlzO1xuICAgIC0taTtcbiAgfVxuXG4gIGZvciAoIDsgaSA8IGxlbmd0aDsgaSsrICkge1xuICAgIGlmICggKG9wdGlvbnMgPSBhcmd1bWVudHNbIGkgXSkgIT0gbnVsbCApIHtcbiAgICAgIGZvciAoIG5hbWUgaW4gb3B0aW9ucyApIHtcbiAgICAgICAgc3JjID0gdGFyZ2V0WyBuYW1lIF07XG4gICAgICAgIGNvcHkgPSBvcHRpb25zWyBuYW1lIF07XG5cbiAgICAgICAgaWYgKCB0YXJnZXQgPT09IGNvcHkgKSB7XG4gICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIGRlZXAgJiYgY29weSAmJiAoIGpRdWVyeS5pc1BsYWluT2JqZWN0KGNvcHkpIHx8IChjb3B5SXNBcnJheSA9IGpRdWVyeS5pc0FycmF5KGNvcHkpKSApICkge1xuICAgICAgICAgIGlmICggY29weUlzQXJyYXkgKSB7XG4gICAgICAgICAgICBjb3B5SXNBcnJheSA9IGZhbHNlO1xuICAgICAgICAgICAgY2xvbmUgPSBzcmMgJiYgalF1ZXJ5LmlzQXJyYXkoc3JjKSA/IHNyYyA6IFtdO1xuXG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNsb25lID0gc3JjICYmIGpRdWVyeS5pc1BsYWluT2JqZWN0KHNyYykgPyBzcmMgOiB7fTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICB0YXJnZXRbIG5hbWUgXSA9IGpRdWVyeS5leHRlbmQoIGRlZXAsIGNsb25lLCBjb3B5ICk7XG5cbiAgICAgICAgfSBlbHNlIGlmICggY29weSAhPT0gdW5kZWZpbmVkICkge1xuICAgICAgICAgIHRhcmdldFsgbmFtZSBdID0gY29weTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiB0YXJnZXQ7XG59O1xuIiwiLypcbiogbG9nbGV2ZWwgLSBodHRwczovL2dpdGh1Yi5jb20vcGltdGVycnkvbG9nbGV2ZWxcbipcbiogQ29weXJpZ2h0IChjKSAyMDEzIFRpbSBQZXJyeVxuKiBMaWNlbnNlZCB1bmRlciB0aGUgTUlUIGxpY2Vuc2UuXG4qL1xuKGZ1bmN0aW9uIChyb290LCBkZWZpbml0aW9uKSB7XG4gICAgXCJ1c2Ugc3RyaWN0XCI7XG4gICAgaWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge1xuICAgICAgICBkZWZpbmUoZGVmaW5pdGlvbik7XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgbW9kdWxlID09PSAnb2JqZWN0JyAmJiBtb2R1bGUuZXhwb3J0cykge1xuICAgICAgICBtb2R1bGUuZXhwb3J0cyA9IGRlZmluaXRpb24oKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICByb290LmxvZyA9IGRlZmluaXRpb24oKTtcbiAgICB9XG59KHRoaXMsIGZ1bmN0aW9uICgpIHtcbiAgICBcInVzZSBzdHJpY3RcIjtcbiAgICB2YXIgbm9vcCA9IGZ1bmN0aW9uKCkge307XG4gICAgdmFyIHVuZGVmaW5lZFR5cGUgPSBcInVuZGVmaW5lZFwiO1xuXG4gICAgZnVuY3Rpb24gcmVhbE1ldGhvZChtZXRob2ROYW1lKSB7XG4gICAgICAgIGlmICh0eXBlb2YgY29uc29sZSA9PT0gdW5kZWZpbmVkVHlwZSkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlOyAvLyBXZSBjYW4ndCBidWlsZCBhIHJlYWwgbWV0aG9kIHdpdGhvdXQgYSBjb25zb2xlIHRvIGxvZyB0b1xuICAgICAgICB9IGVsc2UgaWYgKGNvbnNvbGVbbWV0aG9kTmFtZV0gIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgcmV0dXJuIGJpbmRNZXRob2QoY29uc29sZSwgbWV0aG9kTmFtZSk7XG4gICAgICAgIH0gZWxzZSBpZiAoY29uc29sZS5sb2cgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgcmV0dXJuIGJpbmRNZXRob2QoY29uc29sZSwgJ2xvZycpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIG5vb3A7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBiaW5kTWV0aG9kKG9iaiwgbWV0aG9kTmFtZSkge1xuICAgICAgICB2YXIgbWV0aG9kID0gb2JqW21ldGhvZE5hbWVdO1xuICAgICAgICBpZiAodHlwZW9mIG1ldGhvZC5iaW5kID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICByZXR1cm4gbWV0aG9kLmJpbmQob2JqKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIEZ1bmN0aW9uLnByb3RvdHlwZS5iaW5kLmNhbGwobWV0aG9kLCBvYmopO1xuICAgICAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgIC8vIE1pc3NpbmcgYmluZCBzaGltIG9yIElFOCArIE1vZGVybml6ciwgZmFsbGJhY2sgdG8gd3JhcHBpbmdcbiAgICAgICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBGdW5jdGlvbi5wcm90b3R5cGUuYXBwbHkuYXBwbHkobWV0aG9kLCBbb2JqLCBhcmd1bWVudHNdKTtcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gdGhlc2UgcHJpdmF0ZSBmdW5jdGlvbnMgYWx3YXlzIG5lZWQgYHRoaXNgIHRvIGJlIHNldCBwcm9wZXJseVxuXG4gICAgZnVuY3Rpb24gZW5hYmxlTG9nZ2luZ1doZW5Db25zb2xlQXJyaXZlcyhtZXRob2ROYW1lLCBsZXZlbCwgbG9nZ2VyTmFtZSkge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgaWYgKHR5cGVvZiBjb25zb2xlICE9PSB1bmRlZmluZWRUeXBlKSB7XG4gICAgICAgICAgICAgICAgcmVwbGFjZUxvZ2dpbmdNZXRob2RzLmNhbGwodGhpcywgbGV2ZWwsIGxvZ2dlck5hbWUpO1xuICAgICAgICAgICAgICAgIHRoaXNbbWV0aG9kTmFtZV0uYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiByZXBsYWNlTG9nZ2luZ01ldGhvZHMobGV2ZWwsIGxvZ2dlck5hbWUpIHtcbiAgICAgICAgLypqc2hpbnQgdmFsaWR0aGlzOnRydWUgKi9cbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsb2dNZXRob2RzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICB2YXIgbWV0aG9kTmFtZSA9IGxvZ01ldGhvZHNbaV07XG4gICAgICAgICAgICB0aGlzW21ldGhvZE5hbWVdID0gKGkgPCBsZXZlbCkgP1xuICAgICAgICAgICAgICAgIG5vb3AgOlxuICAgICAgICAgICAgICAgIHRoaXMubWV0aG9kRmFjdG9yeShtZXRob2ROYW1lLCBsZXZlbCwgbG9nZ2VyTmFtZSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBkZWZhdWx0TWV0aG9kRmFjdG9yeShtZXRob2ROYW1lLCBsZXZlbCwgbG9nZ2VyTmFtZSkge1xuICAgICAgICAvKmpzaGludCB2YWxpZHRoaXM6dHJ1ZSAqL1xuICAgICAgICByZXR1cm4gcmVhbE1ldGhvZChtZXRob2ROYW1lKSB8fFxuICAgICAgICAgICAgICAgZW5hYmxlTG9nZ2luZ1doZW5Db25zb2xlQXJyaXZlcy5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIH1cblxuICAgIHZhciBsb2dNZXRob2RzID0gW1xuICAgICAgICBcInRyYWNlXCIsXG4gICAgICAgIFwiZGVidWdcIixcbiAgICAgICAgXCJpbmZvXCIsXG4gICAgICAgIFwid2FyblwiLFxuICAgICAgICBcImVycm9yXCJcbiAgICBdO1xuXG4gICAgZnVuY3Rpb24gTG9nZ2VyKG5hbWUsIGRlZmF1bHRMZXZlbCwgZmFjdG9yeSkge1xuICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgdmFyIGN1cnJlbnRMZXZlbDtcbiAgICAgIHZhciBzdG9yYWdlS2V5ID0gXCJsb2dsZXZlbFwiO1xuICAgICAgaWYgKG5hbWUpIHtcbiAgICAgICAgc3RvcmFnZUtleSArPSBcIjpcIiArIG5hbWU7XG4gICAgICB9XG5cbiAgICAgIGZ1bmN0aW9uIHBlcnNpc3RMZXZlbElmUG9zc2libGUobGV2ZWxOdW0pIHtcbiAgICAgICAgICB2YXIgbGV2ZWxOYW1lID0gKGxvZ01ldGhvZHNbbGV2ZWxOdW1dIHx8ICdzaWxlbnQnKS50b1VwcGVyQ2FzZSgpO1xuXG4gICAgICAgICAgLy8gVXNlIGxvY2FsU3RvcmFnZSBpZiBhdmFpbGFibGVcbiAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICB3aW5kb3cubG9jYWxTdG9yYWdlW3N0b3JhZ2VLZXldID0gbGV2ZWxOYW1lO1xuICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgfSBjYXRjaCAoaWdub3JlKSB7fVxuXG4gICAgICAgICAgLy8gVXNlIHNlc3Npb24gY29va2llIGFzIGZhbGxiYWNrXG4gICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgd2luZG93LmRvY3VtZW50LmNvb2tpZSA9XG4gICAgICAgICAgICAgICAgZW5jb2RlVVJJQ29tcG9uZW50KHN0b3JhZ2VLZXkpICsgXCI9XCIgKyBsZXZlbE5hbWUgKyBcIjtcIjtcbiAgICAgICAgICB9IGNhdGNoIChpZ25vcmUpIHt9XG4gICAgICB9XG5cbiAgICAgIGZ1bmN0aW9uIGdldFBlcnNpc3RlZExldmVsKCkge1xuICAgICAgICAgIHZhciBzdG9yZWRMZXZlbDtcblxuICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgIHN0b3JlZExldmVsID0gd2luZG93LmxvY2FsU3RvcmFnZVtzdG9yYWdlS2V5XTtcbiAgICAgICAgICB9IGNhdGNoIChpZ25vcmUpIHt9XG5cbiAgICAgICAgICBpZiAodHlwZW9mIHN0b3JlZExldmVsID09PSB1bmRlZmluZWRUeXBlKSB7XG4gICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICB2YXIgY29va2llID0gd2luZG93LmRvY3VtZW50LmNvb2tpZTtcbiAgICAgICAgICAgICAgICAgIHZhciBsb2NhdGlvbiA9IGNvb2tpZS5pbmRleE9mKFxuICAgICAgICAgICAgICAgICAgICAgIGVuY29kZVVSSUNvbXBvbmVudChzdG9yYWdlS2V5KSArIFwiPVwiKTtcbiAgICAgICAgICAgICAgICAgIGlmIChsb2NhdGlvbikge1xuICAgICAgICAgICAgICAgICAgICAgIHN0b3JlZExldmVsID0gL14oW147XSspLy5leGVjKGNvb2tpZS5zbGljZShsb2NhdGlvbikpWzFdO1xuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9IGNhdGNoIChpZ25vcmUpIHt9XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8gSWYgdGhlIHN0b3JlZCBsZXZlbCBpcyBub3QgdmFsaWQsIHRyZWF0IGl0IGFzIGlmIG5vdGhpbmcgd2FzIHN0b3JlZC5cbiAgICAgICAgICBpZiAoc2VsZi5sZXZlbHNbc3RvcmVkTGV2ZWxdID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgc3RvcmVkTGV2ZWwgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgcmV0dXJuIHN0b3JlZExldmVsO1xuICAgICAgfVxuXG4gICAgICAvKlxuICAgICAgICpcbiAgICAgICAqIFB1YmxpYyBBUElcbiAgICAgICAqXG4gICAgICAgKi9cblxuICAgICAgc2VsZi5sZXZlbHMgPSB7IFwiVFJBQ0VcIjogMCwgXCJERUJVR1wiOiAxLCBcIklORk9cIjogMiwgXCJXQVJOXCI6IDMsXG4gICAgICAgICAgXCJFUlJPUlwiOiA0LCBcIlNJTEVOVFwiOiA1fTtcblxuICAgICAgc2VsZi5tZXRob2RGYWN0b3J5ID0gZmFjdG9yeSB8fCBkZWZhdWx0TWV0aG9kRmFjdG9yeTtcblxuICAgICAgc2VsZi5nZXRMZXZlbCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICByZXR1cm4gY3VycmVudExldmVsO1xuICAgICAgfTtcblxuICAgICAgc2VsZi5zZXRMZXZlbCA9IGZ1bmN0aW9uIChsZXZlbCwgcGVyc2lzdCkge1xuICAgICAgICAgIGlmICh0eXBlb2YgbGV2ZWwgPT09IFwic3RyaW5nXCIgJiYgc2VsZi5sZXZlbHNbbGV2ZWwudG9VcHBlckNhc2UoKV0gIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICBsZXZlbCA9IHNlbGYubGV2ZWxzW2xldmVsLnRvVXBwZXJDYXNlKCldO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAodHlwZW9mIGxldmVsID09PSBcIm51bWJlclwiICYmIGxldmVsID49IDAgJiYgbGV2ZWwgPD0gc2VsZi5sZXZlbHMuU0lMRU5UKSB7XG4gICAgICAgICAgICAgIGN1cnJlbnRMZXZlbCA9IGxldmVsO1xuICAgICAgICAgICAgICBpZiAocGVyc2lzdCAhPT0gZmFsc2UpIHsgIC8vIGRlZmF1bHRzIHRvIHRydWVcbiAgICAgICAgICAgICAgICAgIHBlcnNpc3RMZXZlbElmUG9zc2libGUobGV2ZWwpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIHJlcGxhY2VMb2dnaW5nTWV0aG9kcy5jYWxsKHNlbGYsIGxldmVsLCBuYW1lKTtcbiAgICAgICAgICAgICAgaWYgKHR5cGVvZiBjb25zb2xlID09PSB1bmRlZmluZWRUeXBlICYmIGxldmVsIDwgc2VsZi5sZXZlbHMuU0lMRU5UKSB7XG4gICAgICAgICAgICAgICAgICByZXR1cm4gXCJObyBjb25zb2xlIGF2YWlsYWJsZSBmb3IgbG9nZ2luZ1wiO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgdGhyb3cgXCJsb2cuc2V0TGV2ZWwoKSBjYWxsZWQgd2l0aCBpbnZhbGlkIGxldmVsOiBcIiArIGxldmVsO1xuICAgICAgICAgIH1cbiAgICAgIH07XG5cbiAgICAgIHNlbGYuc2V0RGVmYXVsdExldmVsID0gZnVuY3Rpb24gKGxldmVsKSB7XG4gICAgICAgICAgaWYgKCFnZXRQZXJzaXN0ZWRMZXZlbCgpKSB7XG4gICAgICAgICAgICAgIHNlbGYuc2V0TGV2ZWwobGV2ZWwsIGZhbHNlKTtcbiAgICAgICAgICB9XG4gICAgICB9O1xuXG4gICAgICBzZWxmLmVuYWJsZUFsbCA9IGZ1bmN0aW9uKHBlcnNpc3QpIHtcbiAgICAgICAgICBzZWxmLnNldExldmVsKHNlbGYubGV2ZWxzLlRSQUNFLCBwZXJzaXN0KTtcbiAgICAgIH07XG5cbiAgICAgIHNlbGYuZGlzYWJsZUFsbCA9IGZ1bmN0aW9uKHBlcnNpc3QpIHtcbiAgICAgICAgICBzZWxmLnNldExldmVsKHNlbGYubGV2ZWxzLlNJTEVOVCwgcGVyc2lzdCk7XG4gICAgICB9O1xuXG4gICAgICAvLyBJbml0aWFsaXplIHdpdGggdGhlIHJpZ2h0IGxldmVsXG4gICAgICB2YXIgaW5pdGlhbExldmVsID0gZ2V0UGVyc2lzdGVkTGV2ZWwoKTtcbiAgICAgIGlmIChpbml0aWFsTGV2ZWwgPT0gbnVsbCkge1xuICAgICAgICAgIGluaXRpYWxMZXZlbCA9IGRlZmF1bHRMZXZlbCA9PSBudWxsID8gXCJXQVJOXCIgOiBkZWZhdWx0TGV2ZWw7XG4gICAgICB9XG4gICAgICBzZWxmLnNldExldmVsKGluaXRpYWxMZXZlbCwgZmFsc2UpO1xuICAgIH1cblxuICAgIC8qXG4gICAgICpcbiAgICAgKiBQYWNrYWdlLWxldmVsIEFQSVxuICAgICAqXG4gICAgICovXG5cbiAgICB2YXIgZGVmYXVsdExvZ2dlciA9IG5ldyBMb2dnZXIoKTtcblxuICAgIHZhciBfbG9nZ2Vyc0J5TmFtZSA9IHt9O1xuICAgIGRlZmF1bHRMb2dnZXIuZ2V0TG9nZ2VyID0gZnVuY3Rpb24gZ2V0TG9nZ2VyKG5hbWUpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBuYW1lICE9PSBcInN0cmluZ1wiIHx8IG5hbWUgPT09IFwiXCIpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiWW91IG11c3Qgc3VwcGx5IGEgbmFtZSB3aGVuIGNyZWF0aW5nIGEgbG9nZ2VyLlwiKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBsb2dnZXIgPSBfbG9nZ2Vyc0J5TmFtZVtuYW1lXTtcbiAgICAgICAgaWYgKCFsb2dnZXIpIHtcbiAgICAgICAgICBsb2dnZXIgPSBfbG9nZ2Vyc0J5TmFtZVtuYW1lXSA9IG5ldyBMb2dnZXIoXG4gICAgICAgICAgICBuYW1lLCBkZWZhdWx0TG9nZ2VyLmdldExldmVsKCksIGRlZmF1bHRMb2dnZXIubWV0aG9kRmFjdG9yeSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGxvZ2dlcjtcbiAgICB9O1xuXG4gICAgLy8gR3JhYiB0aGUgY3VycmVudCBnbG9iYWwgbG9nIHZhcmlhYmxlIGluIGNhc2Ugb2Ygb3ZlcndyaXRlXG4gICAgdmFyIF9sb2cgPSAodHlwZW9mIHdpbmRvdyAhPT0gdW5kZWZpbmVkVHlwZSkgPyB3aW5kb3cubG9nIDogdW5kZWZpbmVkO1xuICAgIGRlZmF1bHRMb2dnZXIubm9Db25mbGljdCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAodHlwZW9mIHdpbmRvdyAhPT0gdW5kZWZpbmVkVHlwZSAmJlxuICAgICAgICAgICAgICAgd2luZG93LmxvZyA9PT0gZGVmYXVsdExvZ2dlcikge1xuICAgICAgICAgICAgd2luZG93LmxvZyA9IF9sb2c7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gZGVmYXVsdExvZ2dlcjtcbiAgICB9O1xuXG4gICAgcmV0dXJuIGRlZmF1bHRMb2dnZXI7XG59KSk7XG4iLCJsZXQgbmV3cyA9IHtcclxuICAgICcxLjcuMScgOiB7XHJcbiAgICAgICAgZGF0ZTogJzE2INGB0LXQvdGC0Y/QsdGA0Y8gMjAxNicsXHJcbiAgICAgICAgdGV4dDogJ9Cf0L7Qu9C90YvQuSDRgNC10YTQsNC60YLQvtGA0LjQvdCzINC+0LrQvdCwINGBINGD0L/RgNCw0LLQu9C10L3QuNC10Lwg0L/Qu9C10LXRgNC+0LwsINC00L7RgNCw0LHQvtGC0LrQsCDQv9C+0LTQtNC10YDQttC60Lgg0YDQtdC60LvQsNC80YssINC60L7RgtC+0YDQvtC5LCDQuiDRgdC+0LbQsNC70LXQvdC40Y4sINC90LAg0YHQsNC50YLQtSDQvdCwINCx0LXRgdC/0LvQsNGC0L3QvtC8INCw0LrQutCw0YPQvdGC0LUg0YHRgtCw0LvQviDQvtGH0LXQvdGMINC80L3QvtCz0L4uJ1xyXG4gICAgfSxcclxuICAgICcxLjcuMCcgOiB7XHJcbiAgICAgICAgZGF0ZTogJzE2INGB0LXQvdGC0Y/QsdGA0Y8gMjAxNicsXHJcbiAgICAgICAgdGV4dDogJ9Cb0LXRgtC+INC/0YDQvtGI0LvQviwg0L3QsNC60L7QvdC10YYg0Y8g0LLQtdGA0L3Rg9C70YHRjyDQuiDQtNC+0YDQsNCx0L7RgtC60LDQvCDRgNCw0YHRiNC40YDQtdC90LjRjy4g0J7RhNC40YbQuNCw0LvRjNC90YvQuSDQv9C70LDQs9C40L0g0L7RgiDQry7QnNGD0LfRi9C60Lgg0L3QtSDQv9C+0LrQsNC30LDQuyDRgtC10YUg0L/QvtC60LDQt9Cw0YLQtdC70LXQuSDQutC+0LvQuNGH0LXRgdGC0LLQsCDQv9C+0LvRjNC30L7QstCw0YLQtdC70LXQuSwg0LrQvtGC0L7RgNGL0LUg0Y8g0L/QtdGH0LDQu9GM0L3QviDQv9GA0LXQtNC/0L7Qu9Cw0LPQsNC7INC4INGN0YLQviDQtNCw0LbQtSDQvdC1INGB0LzQvtGC0YDRjyDQvdCwINGA0LXQutC70LDQvNGDINC/0YDRj9C80L4g0L3QsCDQstC40YLRgNC40L3QtS4g0KLQsNC6INGH0YLQviDQvtCx0L3QvtCy0LvQtdC90LjRjyDQtdGJ0LUg0LHRg9C00YPRgiEg0J/QvtC80L3RjiDQuCDQv9GA0L4g0YLRg9C00YMt0LvQuNGB0YIg0LIg0L7RgtC30YvQstCw0YUgOyknLFxyXG4gICAgICAgIGhpZ2g6IFwidHJ1ZVwiXHJcbiAgICB9LFxyXG4gICAgJzEuNi4xNScgOiB7XHJcbiAgICAgICAgZGF0ZTogJzI0INC80LDRjyAyMDE2JyxcclxuICAgICAgICB0ZXh0OiAn0JTQvtCx0LDQstC40Lsg0LLQvtC30LzQvtC20L3QvtGB0YLRjCDQvtGC0LrQu9GO0YfQtdC90LjRjyDQv9C+0LTRgtCy0LXRgNC20LTQtdC90LjRjyDQv9GA0Lgg0L7RgtC60YDRi9GC0LjQuCDQstC60LvQsNC00LrQuCDRgSDQry7QnNGD0LfRi9C60L7QuSDQstC+INCy0YDQtdC80Y8g0L/RgNC+0LjQs9GA0YvQstCw0L3QuNGPLiDQnNC+0LbQvdC+INCy0YvQutC70Y7Rh9C40YLRjCDQsiDQndCw0YHRgtGA0L7QudC60LggPiDQntCx0YnQtdC1ID4g0J/RgNC+0YfQtdC1J1xyXG4gICAgfSxcclxuICAgICcxLjYuMTQnIDoge1xyXG4gICAgICAgIGRhdGU6ICcyMSDQsNC/0YDQtdC70Y8gMjAxNicsXHJcbiAgICAgICAgdGV4dDogJ9CU0L7QsdCw0LLQuNC7INC/0L7QtNC00LXRgNC20LrRgyDQutC90L7Qv9C60LggXCLQndC1INGA0LXQutC+0LzQtdC90LTQvtCy0LDRgtGMXCIg0LIg0YPQstC10LTQvtC80LvQtdC90LjRjyDQuCDQs9C+0YDRj9GH0LjQtSDQutC70LDQstC40YjQuC4g0KLQsNC60LbQtSDQsdGL0LvQuCDQuNGB0L/RgNCw0LLQu9C10L3RiyDQvdC10LrQvtGC0L7RgNGL0LUg0L7RiNC40LHQutC4LCDQstC+0LfQvdC40LrRiNC40LUg0LjQty3Qt9CwINC90L7QstC+0LPQviDRgNC10LvQuNC30LAg0K8u0JzRg9C30YvQutC4LidcclxuICAgIH0sXHJcbiAgICAnMS42LjExJyA6IHtcclxuICAgICAgICBkYXRlOiAnMDgg0LDQv9GA0LXQu9GPIDIwMTYnLFxyXG4gICAgICAgIHRleHQ6ICfQlNC+0LHQsNCy0LjQuyDQstC+0LfQvNC+0LbQvdC+0YHRgtGMINCyINC90LDRgdGC0YDQvtC50LrQsNGFINCyINGA0LDQt9C00LXQu9C1IFwi0JPQvtGA0Y/Rh9C40LUg0LrQu9Cw0LLQuNGI0LhcIiDQstC60LvRjtGH0LjRgtGMINGD0LLQtdC00L7QvNC70LXQvdC40LUg0L7QsSDQuNC30LzQtdC90LXQvdC40Lgg0YDQtdC20LjQvNCwINC/0L7QstGC0L7RgNCwLidcclxuICAgIH0sXHJcbiAgICAnMS42LjcnIDoge1xyXG4gICAgICAgIGRhdGU6ICcyNiDRhNC10LLRgNCw0LvRjyAyMDE2JyxcclxuICAgICAgICB0ZXh0OiAn0K/QvdC00LXQutGBINC00L7QsdCw0LLQuNC7INC90L7QstGL0Lkg0YTRg9C90LrRhtC40L7QvdCw0Ls6INC00LjQt9C70LDQudC6INGC0YDQtdC60L7Qsiwg0LrQvtGC0L7RgNGL0Lkg0LLQu9C40Y/QtdGCINC90LAg0L/QvtC/0LDQtNCw0L3QuNC1INGC0YDQtdC60L7QsiDQvdCwINGA0LDQtNC40L4g0Lgg0LIg0YDQtdC60L7QvNC10L3QtNCw0YbQuNC4LCDRgdC+0L7RgtCy0LXRgtGB0YLQstC10L3QvdC+LCDQtNC+0LHQsNCy0LjQuyDQv9C+0LTQtNC10YDQttC60YMg0LTQsNC90L3QvtCz0L4g0YTRg9C90LrRhtC40L7QvdCw0LvQsC4g0J3QtdC60L7RgtC+0YDRi9C1INC60L7RgdC80LXRgtC40YfQtdGB0LrQuNC1INC40LfQvNC10L3QtdC90LjRjy4nXHJcbiAgICB9LFxyXG4gICAgJzEuNi40JyA6IHtcclxuICAgICAgICBkYXRlOiAnMjQg0YTQtdCy0YDQsNC70Y8gMjAxNicsXHJcbiAgICAgICAgdGV4dDogJ9CU0L7QsdCw0LLQu9C10L3QsCDQvtC/0YbQuNGPINC/0L4g0YPQv9GA0LDQstC70LXQvdC40Y4g0LPRgNC+0LzQutC+0YHRgtGM0Y46INC70LjQsdC+INC60LDQuiDQsdGL0LvQviDRgNCw0L3QtdC1INCz0YDQvtC80LrQvtGB0YLRjCDQuNC30LzQtdC90Y/QtdGC0YHRjyDQv9C+0LvQt9GD0L3QutC+0Lwg0L/RgNC4INC90LDQstC10LTQtdC90LjQuCDQvNGL0YjQutC4INC90LAg0LjQutC+0L3QutGDLCDQu9C40LHQviDQvdCw0LbQsNGC0LjQtSDQvdCwINC40LrQvtC90LrRgyDQstC60LvRjtGH0LDQtdGCL9Cy0YvQutC70Y7Rh9Cw0LXRgiDQv9C+0LvQvdC+0YHRgtGM0Y4g0LfQstGD0LouINCd0LDRgdGC0YDQsNC40LLQsNC10YLRgdGPINCyINGA0LDQt9C00LXQu9C1IFwi0J7QkdCp0JjQlVwiLiDQotCw0LrQttC1INC40YHQv9GA0LDQstC70LXQvdCwINGA0LDQsdC+0YLQsCDQutC90L7Qv9C60LggcGxheS9wcm9ncmVzcyDQtNC70Y8g0YHRgtGA0LDQvdC40YYsINC40YHQv9C+0LvRjNC30YPRjtGJ0LjRhSDQvNCw0YHRiNGC0LDQsSwg0L7RgtC70LjRh9C90YvQuSDQvtGCIDEwMCUuJ1xyXG4gICAgfSxcclxuICAgICcxLjYuMScgOiB7XHJcbiAgICAgICAgZGF0ZTogJzEyINGE0LXQstGA0LDQu9GPIDIwMTYnLFxyXG4gICAgICAgIHRleHQ6ICfQkdC+0LvRjNGI0L7QtSDQvtCx0L3QvtCy0LvQtdC90LjQtSwg0LrQvtGC0L7RgNC+0LUg0LTQvtCx0LDQstC70Y/QtdGCINCy0L7Qt9C80L7QttC90L7RgdGC0Ywg0LLQuNC00LXRgtGMINC/0LvQtdC50LvQuNGB0YIg0LIg0L7QutC90LUsINC00L7QsdCw0LLQu9C10L3RiyDQutC90L7Qv9C60Lgg0L/QvtCy0YLQvtGA0LAg0Lgg0YjQsNGE0LvQsCwg0LfQsNGA0LDQsdC+0YLQsNC70Lgg0YHRgdGL0LvQutC4INC90LAg0LjRgdC/0L7Qu9C90LjRgtC10LvRjyDQuCDQvdCw0LfQstCw0L3QuNC1INC/0LXRgdC90LgsINC90YMg0Lgg0LzQvdC+0LPQviDRh9C10LPQviDQtdGJ0LUgXCLQv9C+0LQg0LrQsNC/0L7RgtC+0LxcIi4nXHJcbiAgICB9LFxyXG4gICAgJzEuNS4xMic6IHtcclxuICAgICAgICBkYXRlOiAnMiDRhNC10LLRgNCw0LvRjyAyMDE2JyxcclxuICAgICAgICB0ZXh0OiAn0JTQvtCx0LDQstC40Lsg0L7RgtC+0LHRgNCw0LbQtdC90LjQtSDQstC10YDRgdC40Lgg0YLRgNC10LrQsCAo0LzQvtC20L3QviDQstGL0LrQu9GO0YfQuNGC0Ywg0LIg0L3QsNGB0YLRgNC+0LnQutCw0YUpLCDQsCDRgtCw0LrQttC1INC/0L7QtNC00LXRgNC20LrRgyDQvNCw0YHRiNGC0LDQsdCwINCx0YDQsNGD0LfQtdGA0LAg0L/QviDRg9C80L7Qu9GH0LDQvdC40Y4nXHJcbiAgICB9LFxyXG4gICAgJzEuNS4xMSc6e1xyXG4gICAgICAgIGRhdGU6ICcxNyDRj9C90LLQsNGA0Y8gMjAxNicsXHJcbiAgICAgICAgdGV4dDogJ9Cj0LHRgNCw0L3QsCDQvdC+0LLQvtCz0L7QtNC90Y/RjyDRgtC10LzQsCDQuCDQsiDQv9GA0L7RhtC10YHRgdC1INGA0LDQt9GA0LDQsdC+0YLQutC4INCy0L7Qt9C80L7QttC90L7RgdGC0Ywg0YPQtNCw0LvQtdC90L3QvtCz0L4g0YPQv9GA0LDQstC70LXQvdC40Y8g0YEg0L/Qu9Cw0L3RiNC10YLQsC/QvNC+0LHQuNC70YzQvdC+0LPQvidcclxuICAgIH0sXHJcbiAgICAvL3tcclxuICAgIC8vICAgIGRhdGU6ICcyOSDQtNC10LrQsNCx0YDRjyAyMDE1JyxcclxuICAgIC8vICAgIHRleHQ6ICfQpdC+0YfRgyDQv9C+0LfQtNGA0LDQstC40YLRjCDQktCw0YEg0YEg0L3QsNGB0YLRg9C/0LDRjtGJ0LjQvCDQndC+0LLRi9C8INCz0L7QtNC+0Lwg0Lgg0L/QvtC20LXQu9Cw0YLRjCDQstGB0LXQs9C+INGB0LDQvNC+0LPQviDQvdCw0LjQu9GD0YfRiNC10LPQviDQsiAyMDE2LdC8INCz0L7QtNGDISdcclxuICAgIC8vfSxcclxuICAgICcxLjUuOCc6e1xyXG4gICAgICAgIGRhdGU6ICcyOSDQtNC10LrQsNCx0YDRjyAyMDE1JyxcclxuICAgICAgICB0ZXh0OiAn0JjRgdC/0YDQsNCy0LvQtdC90LAg0LjQvdC+0LPQtNCwINCy0L7Qt9C90LjQutCw0Y7RidCw0Y8g0L3QsCDQry7QoNCw0LTQuNC+INC+0YjQuNCx0LrQsC4g0J3QsCDQstGA0LXQvNGPINC90L7QstC+0LPQvtC00L3QuNGFINC/0YDQsNC30LTQvdC40LrQvtCyINC00L7QsdCw0LLQuNC7INGB0L7QvtGC0LLQtdGC0YHRgtCy0YPRjtGJ0YPRjiDRgtC10LzRgyDQtNC70Y8g0L7QutC90LAg0YPQv9GA0LDQstC70LXQvdC40Y8g0Lgg0L3QsNGB0YLRgNC+0LXQuiA6KSdcclxuICAgIH0sXHJcbiAgICAnMS41LjUnOntcclxuICAgICAgICBkYXRlOiAnMTYg0LTQtdC60LDQsdGA0Y8gMjAxNScsXHJcbiAgICAgICAgdGV4dDogJ9CR0LvQsNCz0L7QtNCw0YDRjyDRgNCw0LfRgNCw0LHQvtGC0YfQuNC60LDQvCDQry7QnNGD0LfRi9C60LgsINGA0LDRgdGI0LjRgNC10L3QuNC1INC/0L7Qu9C90L7RgdGC0YzRjiDQv9C10YDQtdCy0LXQtNC90L4g0L3QsCDRgdC/0LXRhtC40LDQu9GM0L3QvtC1IEFQSSDQtNC70Y8g0YDQsNGB0YjQuNGA0LXQvdC40LksINGH0YLQviDQtNC+0LvQttC90L4g0LzQuNC90LjQvNC40LfQuNGA0L7QstCw0YLRjCDQutC+0LvQuNGH0LXRgdGC0LLQviDQvtGI0LjQsdC+0Log0L/RgNC4INC+0LHQvdC+0LLQu9C10L3QuNGP0YUg0LLQuNGC0YDQuNC90Ysg0K8u0JzRg9C30YvQutCwINC40LvQuCDQry7QoNCw0LTQuNC+LiDQotCw0LrQttC1INC/0L7Qu9C90L7RgdGC0YzRjiDQvtCx0L3QvtCy0LvQtdC90LAg0YHRgtGA0LDQvdC40YbQsCDQvdCw0YHRgtGA0L7QtdC6INC4INCy0YHQv9C70YvQstCw0Y7RidC10LUg0L7QutC90L4g0LTQu9GPINGD0L/RgNCw0LLQu9C10L3QuNGPINC/0LvQtdC10YDQvtC8J1xyXG4gICAgfSxcclxuICAgICcxLjQuMTMnOntcclxuICAgICAgICBkYXRlOiBudWxsLFxyXG4gICAgICAgIHRleHQ6IFwi0JIg0L7Rh9C10YDQtdC00L3QvtC5INGA0LDQtyDQv9C10YDQtdGA0LDQsdC+0YLQsNC7INCy0YHRjiDRgdGF0LXQvNGDINC+0YLRgdC70LXQttC40LLQsNC90LjRjyDQstC60LvQsNC00L7Quiwg0LTQvtC70LbQvdC+INGB0YLQsNGC0Ywg0YHRgtCw0LHQuNC70YzQvdC10LU7INCv0L3QtNC10LrRgSDQstC10YDQvdGD0LvQuCDRgNC10LbQuNC8INGA0LDQtNC40L4g0LIg0K8u0JzRg9C30YvQutGDXCJcclxuICAgIH0sXHJcbiAgICAnMS40LjEyJzp7XHJcbiAgICAgICAgZGF0ZTogbnVsbCxcclxuICAgICAgICB0ZXh0OiBcItCY0LfQvNC10L3QtdC90LAg0YDQsNCx0L7RgtCwINC/0LvQsNCz0LjQvdCwINGB0L7Qs9C70LDRgdC90L4g0L7QsdC90L7QstC70LXQvdC40Y4g0YHQtdGA0LLQuNGB0LAg0K8u0JzRg9C30YvQutCwOyDQoNC10LbQuNC8INGA0LDQtNC40L4g0LIg0K8u0JzRg9C30YvQutC1LCDQv9C+0YXQvtC20LUsINGD0LHRgNCw0LvQuCDRgdC+0LLRgdC10LwsINGC0LDQuiDRh9GC0L4g0LXQs9C+INC/0L7QtNC00LXRgNC20LrQsCDQvtGC0LrQu9GO0YfQtdC90LAsINCyINC40YLQvtCz0LUg0L7RgdGC0LDQu9C+0YHRjCDQtNCy0LAg0YDQtdC20LjQvNCwOiDQry7QnNGD0LfRi9C60LAg0Lgg0K8u0KDQsNC00LjQvlwiXHJcbiAgICB9LFxyXG4gICAgJzEuNC4xMSc6e1xyXG4gICAgICAgIGRhdGU6IG51bGwsXHJcbiAgICAgICAgdGV4dDogXCLQmNGB0L/RgNCw0LLQu9C10L3QsCDQvtGI0LjQsdC60LAg0YDQsNCx0L7RgtGLINGB0L4g0LLQutC70LDQtNC60LDQvNC4INC+0YIg0L/RgNC10LTRi9C00YPRidC10LPQviDQvtCx0L3QvtCy0LvQtdC90LjRj1wiXHJcbiAgICB9LFxyXG4gICAgJzEuNC41Jzp7XHJcbiAgICAgICAgZGF0ZTogbnVsbCxcclxuICAgICAgICB0ZXh0OiBcItCe0LHQvdC+0LLQu9C10L0g0LzQtdGF0LDQvdC40LfQvCDRgdC70LXQttC10L3QuNGPINC30LAg0LLQutC70LDQtNC60LDQvNC4INGBINC+0YLQutGA0YvRgtC+0Lkg0K8u0JzRg9C30YvQutC+0Lkv0KDQsNC00LjQviDRgSDRhtC10LvRjNGOINC40YHQutC70Y7Rh9C10L3QuNGPINC30LDQstC40YHQsNC90LjQuSDQstC60LvQsNC00LrQuFwiXHJcbiAgICB9LFxyXG4gICAgJzEuNC4zJzp7XHJcbiAgICAgICAgZGF0ZTogbnVsbCxcclxuICAgICAgICB0ZXh0OiAn0JIg0L3QsNGB0YLRgNC+0LnQutCw0YUg0LTQvtCx0LDQstC70LXQvSDQvdC+0LLRi9C5INC/0YPQvdC60YIgXCLQntCx0YnQuNC1XCIsINCz0LTQtSDQvNC+0LbQvdC+INCy0YvQsdGA0LDRgtGMINGA0LXQttC40Lwg0YDQsNCx0L7RgtGLINGA0LDRgdGI0LjRgNC10L3QuNGPOiDRgSDQvtC60L3QvtC8INGD0L/RgNCw0LLQu9C10L3QuNGPINC40LvQuCDQsdC10LcsINCwINGC0LDQutC20LUg0L3QsNGB0YLRgNC+0LjRgtGMINGN0LvQtdC80LXQvdGC0Ysg0L7QutC90LAg0YPQv9GA0LDQstC70LXQvdC40Y8nXHJcbiAgICB9LFxyXG4gICAgJzEuNC4xJzp7XHJcbiAgICAgICAgZGF0ZTogbnVsbCxcclxuICAgICAgICB0ZXh0OiAn0JjRgdC/0YDQsNCy0LvQtdC90LAg0L7RiNC40LHQutCwINGBINC60L3QvtC/0LrQvtC5IFwi0J3RgNCw0LLQuNGC0YHRj1wiINCyINGD0LLQtdC00L7QvNC70LXQvdC40Lgg0LIg0YDQtdC20LjQvNC1INCvLtCg0LDQtNC40L4nXHJcbiAgICB9LFxyXG4gICAgJzEuNC4wJzp7XHJcbiAgICAgICAgZGF0ZTogbnVsbCxcclxuICAgICAgICB0ZXh0OiAn0JjQt9C80LXQvdC10L3QsCDRgNCw0LHQvtGC0LAg0YHQviDQstC60LvQsNC00LrQsNC80Lg6INGA0LDRgdGI0LjRgNC10L3QuNC1INGC0LXQv9C10YDRjCDRgNCw0LHQvtGC0LDQtdGCINGBINC/0LXRgNCy0L7QuSDQvtGC0LrRgNGL0YLQvtC5INCy0LrQu9Cw0LTQutC+0Lkg0Lgg0L7RgtC60YDRi9GC0LjQtSDQtNGA0YPQs9C40YUg0LLQutC70LDQtNC+0Log0Y8g0K8u0JzRg9C30YvQutC+0Lkg0LjQu9C4INCvLtCg0LDQtNC40L4g0LHQvtC70YzRiNC1INC90LjQutCw0Log0L3QtSDQstC70LjRj9C10YIgKNC90LDQv9GA0LjQvNC10YAsINGB0LvRg9GI0LDRjyDQsiDQvtC00L3QvtC5INCy0LrQu9Cw0LTQutC1LCDQvNC+0LbQvdC+INCyINC00YDRg9Cz0L7QuSDQv9C+0YHQvNC+0YLRgNC10YLRjCDQutCw0LrQvtC5LdGC0L4g0L/Qu9C10LnQu9C40YHRgiDQuNC70Lgg0LTQsNC90L3Ri9C1INC+0LEg0LjRgdC/0L7Qu9C90LjRgtC10LvQtSDQuCDRjdGC0L4g0L3QtSDQv9GA0LXRgNCy0LXRgiDRgNCw0LHQvtGC0YMg0YDQsNGB0YjQuNGA0LXQvdC40Y8pLiDQn9C+0YHQu9C1INGC0L7Qs9C+INC60LDQuiDQv9C10YDQstCw0Y8gXCLRgNCw0LHQvtGH0LDRj1wiINCy0LrQu9Cw0LTQutCwINCx0YPQtNC10YIg0LfQsNC60YDRi9GC0LAsINGA0LDRgdGI0LjRgNC10L3QuNC1INCw0LLRgtC+0LzQsNGC0L7QvCDQv9C10YDQtdC60LvRjtGH0LjRgtGB0Y8g0L3QsCDRgdC70LXQtNGD0Y7RidGOLCDQtdGB0LvQuCDRgtCw0LrQvtCy0LDRjyDQsdGD0LTQtdGCINCw0LrRgtC40LLQvdCwJ1xyXG4gICAgfSxcclxuICAgICcxLjMuMTgnOntcclxuICAgICAgICBkYXRlOiBudWxsLFxyXG4gICAgICAgIHRleHQ6IFwi0JjQt9C80LXQvdC10L3QviDQstGB0L/Qu9GL0LLQsNGO0YnQtdC1INC+0LrQvdC+INCy0L4g0LLRgdC10YUg0YDQtdC20LjQvNCw0YUuINCk0YPQvdC60YbQuNGPINC/0LXRgNC10LzQvtGC0LrQuCDRgtC10L/QtdGA0Ywg0L7RgdGD0YnQtdGB0YLQstC70Y/QtdGC0YHRjyDQv9GA0Lgg0LrQu9C40LrQtSDQv9C+INC60YDQsNGOINC60L3QvtC/0LrQuCBwbGF5LCDQs9C00LUg0L7RgtC+0LHRgNCw0LbQsNC10YLRgdGPINGC0LXQutGD0YnQsNGPINC/0L7Qt9C40YbQuNGPINC/0YDQvtC40LPRgNGL0LLQsNC90LjRj1wiXHJcbiAgICB9LFxyXG4gICAgJzEuMy4wJzp7XHJcbiAgICAgICAgZGF0ZTogbnVsbCxcclxuICAgICAgICB0ZXh0OiAn0JTQvtCx0LDQstC70LXQvdCwINC/0L7QtNC00LXRgNC20LrQsCDRgdC10YDQstC40YHQsCDQr9C90LTQtdC60YEu0KDQsNC00LjQvi4g0J/QvtC80LjQvNC+INGN0YLQvtCz0L4g0LHRi9C7INGD0LHRgNCw0L3QsCDQstC+0LfQvNC+0LbQvdC+0YHRgtGMINGB0LrQsNGH0LjQstCw0L3QuNGPINC80L8zLdGE0LDQudC70L7Qsiwg0L4g0YfQtdC8INC90LDQv9C40YHQsNC90L4g0LIg0YDQsNC30LTQtdC70LUgXCLQn9C+0LzQvtGJ0YxcIidcclxuICAgIH1cclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IG5ld3M7IiwiaW1wb3J0IGxvZyBmcm9tICdsb2dsZXZlbCc7XHJcbmltcG9ydCB1dGlscyBmcm9tICcuL2NvbW1vbi91dGlscyc7XHJcblxyXG5sb2cuc2V0TGV2ZWwoXCJJTkZPXCIpOyAvL1wiVFJBQ0VcIiA+IFwiREVCVUdcIiA+IFwiSU5GT1wiID4gXCJXQVJOXCIgPiBcIkVSUk9SXCIgPiBcIlNJTEVOVFwiXHJcbi8vZm9yIGRlYnVnOlxyXG4vL3dpbmRvdy5sb2dnZXIgPSBsb2c7XHJcblxyXG5pbXBvcnQgZXh0IGZyb20gJy4vYmcvZXh0JztcclxuXHJcbi8vVE9ETzog0LLRgNC10LzQtdC90L3QvtC1INGA0LXRiNC10L3QuNC1INC00LvRjyBwb3B1cCfQsCwg0LIg0LjQtNC10LDQu9C1INC90LDQtNC+INGH0LXRgNC10LcgcG9ydCDQs9C+0L3Rj9GC0Ywg0LLRgdGOINC40L3RhNGDXHJcbmltcG9ydCB0YWJzIGZyb20gJy4vYmcvdGFicyc7XHJcbndpbmRvdy50YWJzID0gdGFicztcclxuXHJcbi8qKiogR0EgKioqL1xyXG4oZnVuY3Rpb24oaSxzLG8sZyxyLGEsbSl7aVsnR29vZ2xlQW5hbHl0aWNzT2JqZWN0J109cjtpW3JdPWlbcl18fGZ1bmN0aW9uKCl7KGlbcl0ucT1pW3JdLnF8fFtdKS5wdXNoKGFyZ3VtZW50cyl9LGlbcl0ubD0xKm5ldyBEYXRlKCk7YT1zLmNyZWF0ZUVsZW1lbnQobyksbT1zLmdldEVsZW1lbnRzQnlUYWdOYW1lKG8pWzBdO2EuYXN5bmM9MTthLnNyYz1nO20ucGFyZW50Tm9kZS5pbnNlcnRCZWZvcmUoYSxtKX0pKHdpbmRvdyxkb2N1bWVudCwnc2NyaXB0JywnaHR0cHM6Ly9zc2wuZ29vZ2xlLWFuYWx5dGljcy5jb20vYW5hbHl0aWNzLmpzJywnZ2EnKTtcclxuZ2EoJ2NyZWF0ZScsICdVQS01NjkyNzc2MC0xJyk7XHJcbmdhKCdzZXQnLCAnY2hlY2tQcm90b2NvbFRhc2snLCBmdW5jdGlvbigpe30pO1xyXG4vKioqIEdBIGVuZHMgKioqL1xyXG5cclxudHJ5IHsgZXh0LmluaXQoKTsgfSBjYXRjaCAoZSkgeyB1dGlscy5lcnJvckhhbmRsZXIoZSk7IH0iXX0=
