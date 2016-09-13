function loadAndSetValue(userId, passIndex, fieldName) {
    var fieldValue = localStorage["pass" + userId + fieldName];
    if (fieldValue) {
        document.getElementsByName(fieldName)[passIndex].value = fieldValue;
    }
}

function saveValue(userId, passIndex, fieldName) {
    var fieldValue = document.getElementsByName(fieldName)[passIndex].value;
    localStorage["pass" + userId + fieldName] = fieldValue;
}

function loadAndSetAll(userId, passIndex, fields) {
    fields.forEach(function(field) {
        loadAndSetValue(userId, passIndex, field);
    });
}

function saveAll(userId, passIndex, fields) {
    fields.forEach(function(field) {
        saveValue(userId, passIndex, field);
    });
}

function removeAll(userId, fields) {
    fields.forEach(function(field) {
        delete localStorage["pass" + userId + field];
    });
}

function loadAndSetCheckbox(userId, passIndex, fieldName) {
    var fieldValue = localStorage["pass" + userId + fieldName];
    if (fieldValue === "false" || fieldValue === "true") {
        document.getElementsByName(fieldName)[passIndex].checked = JSON.parse(fieldValue);
    }
}

function saveCheckbox(userId, passIndex, fieldName) {
    var fieldValue = document.getElementsByName(fieldName)[passIndex].checked;
    localStorage["pass" + userId + fieldName] = fieldValue;
}

function fireChangeEvent(node) {
    var changeEvent = document.createEvent("HTMLEvents");
    changeEvent.initEvent("change", true, true);
    node.dispatchEvent(changeEvent);
}

function loadUser(userId, passIndex) {
    loadAndSetAll(userId, passIndex, ["lastName", "firstName", "midName", "tariff", "docType", "docNumber", "gender", "country", "birthdate"]);
    loadAndSetCheckbox(userId, passIndex, "insCheck");
    loadAndSetCheckbox(userId, 0, "plBedding");

    fireChangeEvent(document.getElementsByName('lastName')[passIndex]);
    fireChangeEvent(document.getElementsByName('plBedding')[0]);
}

function getNextUserId() {
    var passList = getPassList();
    return (!passList || !Array.isArray(passList) || passList.length == 0) ? 0 : Math.max.apply(null, passList) + 1;
}

function saveUser(passIndex) {
    var userId = getNextUserId();

    saveAll(userId, passIndex, ["lastName", "firstName", "midName", "tariff", "docType", "docNumber", "gender", "country", "birthdate"]);
    saveCheckbox(userId, passIndex, "insCheck");
    saveCheckbox(userId, 0, "plBedding");

    var passList = getPassList();
    passList.push(userId);
    localStorage["passidslist"] = JSON.stringify(passList);
}

function removeUser(userId) {
    removeAll(userId, ["lastName", "firstName", "midName", "tariff", "docType", "docNumber", "gender", "country", "birthdate", 'insCheck', 'plBedding']);

    var passList = getPassList();
    var toRemove = passList.indexOf(parseInt(userId));
    if (toRemove > -1) {
        passList.splice(toRemove, 1);
    }
    localStorage["passidslist"] = JSON.stringify(passList);
}

function fillContextMenu() {
    var contextMenuData = [];
    var passList = getPassList();

    passList.forEach(function(userId) {
        var firstName = localStorage["pass" + userId + "firstName"];
        var lastName = localStorage["pass" + userId + "lastName"];
        contextMenuData.push({"userId": userId, "firstName": firstName, "lastName": lastName});
    });

    chrome.runtime.sendMessage({"action": "fillContextMenu", "contextData": contextMenuData});
}

function getPassIndex() {
    var passIndex = -1;

    if (lastRightClickNode) {
        var index = parseInt(lastRightClickNode.parentNode.parentNode.parentNode.parentNode.getAttribute('data-index'));
        if (isNaN(index) || index < 0 || index > 3) {
            index = parseInt(lastRightClickNode.parentNode.parentNode.parentNode.parentNode.parentNode.getAttribute('data-index'));
        }
        if (isNaN(index) || index < 0 || index > 3) {
            index = parseInt(lastRightClickNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.getAttribute('data-index'));
        }
        if (!isNaN(index) && index >= 0 && index < 4) {
            passIndex = index;
        }
    }

    return passIndex;
}

function getPassList() {
    var rawValue = localStorage['passidslist'];
    var passList = [];
    if (rawValue) {
        passList = JSON.parse(rawValue);
    }
    return Array.isArray(passList) ? passList : [];
}

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        var passIndex = getPassIndex();
        if (passIndex == -1) {
            console.log("Problem searching for pass index");
            return;
        }

        if (request.action == "loadUser") {
            loadUser(request.userId, passIndex);
        } else if (request.action == "saveUser") {
            saveUser(passIndex);
            fillContextMenu();
        } else if (request.action == "removeUser") {
            removeUser(request.userId);
        }
});

var lastRightClickNode = null;
document.addEventListener("mousedown", function(event) {
    if (event.button == 2) {
        lastRightClickNode = event.target;
    }
}, true);

fillContextMenu();
