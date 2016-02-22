chrome.runtime.onStartup.addListener(function() {
    console.log("zhihu message started")
    onInit()
})

chrome.runtime.onInstalled.addListener(onInit);
chrome.alarms.onAlarm.addListener(onAlarm);

function onInit() {
    // 5 分钟查一次
    chrome.alarms.create("zhihuMessage", { when: Date.now(), periodInMinutes: 1 });
}

function onAlarm(alarm) {
    console.log('Got alarm', alarm);
    if (alarm && alarm.name == "zhihuMessage") {
        parseZhihuMessage();
    }
}

function parseZhihuMessage(alarm) {
    console.log('Got alarm', alarm);
    // 这是单独的消息计数接口
    var targetLink_new = "https://www.zhihu.com/noti7/new"
    var argument = { r: new Date().getTime() };

    // 获取消息计数
    myCORS_get(targetLink_new, argument, function(responseText) {
        var resultJSON = JSON.parse(responseText);
        // console.log(resultJSON[0])
        // 回复报文的第二个对象是消息计数
        var msgCnt = resultJSON[1]
        var msgCntSum = msgCnt.reduce(function(previous, current, index, array) {
            return previous + current;
        });

        // 有新消息
        if (msgCntSum > 0) {
            chrome.browserAction.setIcon({path: "./newMessageIcon19.png"})
        } else {
            chrome.browserAction.setIcon({path: "./icon19.png"})
        }
    });
}

function createCORSRequest(method, url) {
    var xhr = new XMLHttpRequest();
    if ("withCredentials" in xhr) {
        // Check if the XMLHttpRequest object has a "withCredentials" property.
        // "withCredentials" only exists on XMLHTTPRequest2 objects.
        xhr.open(method, url, true);
    } else if (typeof XDomainRequest != "undefined") {
        // Otherwise, check if XDomainRequest.
        // XDomainRequest only exists in IE, and is IE's way of making CORS requests.
        xhr = new XDomainRequest();
        xhr.open(method, url);
    } else {
        // Otherwise, CORS is not supported by the browser.
        xhr = null;
    }
    return xhr;
}

function myCORS_get(url, argument, func) {
    var xhr = createCORSRequest('GET', url);
    if (!xhr) {
        throw new Error('CORS not supported');
    }

    xhr.onload = function() {
        func(xhr.responseText)
    }

    xhr.onerror = function() {
        console.log('There was an error!');
    };

    xhr.withCredentials = true;

    xhr.send(argument);
}
