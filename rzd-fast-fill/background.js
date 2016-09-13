chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if (request.action == "fillContextMenu") {
            fillContextMenu(request.contextData);
        }
});

chrome.contextMenus.onClicked.addListener(contextMenuClick);

function sendMessage(data) {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, data);
    });
}

function fillContextMenu(contextData) {
    chrome.contextMenus.removeAll(function() {
        if (chrome.extension.lastError) console.log("Unable to remove all from context menu: " + chrome.extension.lastError.message);
    });

    contextData.forEach(function(pass) {
        var userId = pass.userId;
        var firstName = pass.firstName;
        var lastName = pass.lastName;

        chrome.contextMenus.create({"id": "PASS_LOAD" + userId, "title": firstName + " " + lastName, "contexts":["editable"], "documentUrlPatterns": ["*://pass.rzd.ru/ticket/secure/*"]}, function() {
            if (chrome.extension.lastError) console.log("Unable to add passenger to context menu: " + chrome.extension.lastError.message);
        });
    });

    chrome.contextMenus.create({"id": "PASS_ADD", "title": "Сохранить пассажира", "contexts":["editable"], "documentUrlPatterns": ["*://pass.rzd.ru/ticket/secure/*"]}, function() {
        if (chrome.extension.lastError) console.log("Unable to add passenger save to context menu: " + chrome.extension.lastError.message);
    });

    if (contextData.length > 0) {
        chrome.contextMenus.create({"id": "PASS_REMOVE", "title": "Удалить пассажира", "contexts":["editable"], "documentUrlPatterns": ["*://pass.rzd.ru/ticket/secure/*"]}, function() {
            if (chrome.extension.lastError) console.log("Unable to add passenger remove to context menu: " + chrome.extension.lastError.message);
        });
    }

    contextData.forEach(function(pass) {
        var userId = pass.userId;
        var firstName = pass.firstName;
        var lastName = pass.lastName;

        chrome.contextMenus.create({"id": "PASS_REMOVE" + userId, "parentId": "PASS_REMOVE", "title": firstName + " " + lastName, "contexts":["editable"], "documentUrlPatterns": ["*://pass.rzd.ru/ticket/secure/*"]}, function() {
            if (chrome.extension.lastError) console.log("Unable to add passenger remove item to context menu: " + chrome.extension.lastError.message);
        });
    });
}

function contextMenuClick(info) {
    if (info.menuItemId.indexOf("PASS_LOAD") == 0) {
        var userId = info.menuItemId.substr(9);
        sendMessage({"action": "loadUser", "userId": userId});
    } else if (info.menuItemId.indexOf("PASS_ADD") == 0) {
        sendMessage({"action": "saveUser"});
    } else if (info.menuItemId.indexOf("PASS_REMOVE") == 0) {
        var userId = info.menuItemId.substr(11);
        sendMessage({"action": "removeUser", "userId": userId});

        chrome.contextMenus.remove(info.menuItemId, function() {
            if (chrome.extension.lastError) console.log("Unable to remove item from context menu: " + chrome.extension.lastError.message);
        });

        chrome.contextMenus.remove("PASS_LOAD" + userId, function() {
            if (chrome.extension.lastError) console.log("Unable to remove item from context menu: " + chrome.extension.lastError.message);
        });
    }
}
