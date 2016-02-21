$(document).ready(getNotice)

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

function zhihuLinkHead() {

}

function getNotice() {
    var timestamp = new Date().getTime();
    var argument = { r: timestamp };
    var targetLink_default = "https://www.zhihu.com/noti7/stack/default";
    var targetLink_follow = "https://www.zhihu.com/noti7/stack/follow";
    var targetLink_vote_thank = "https://www.zhihu.com/noti7/stack/vote_thank";

    var msgCnt = 0

    myCORS_get(targetLink_default, argument, function(responseText) {
        var resultJSON = JSON.parse(responseText);
        msgCnt += resultJSON['r'];
        var noticeHTML = jQuery.parseHTML(resultJSON['msg']);

        $("a.zg-link", noticeHTML).each(function() {
            rawLink = $(this).attr('href')
            $(this).attr('href', 'https://www.zhihu.com' + rawLink);
            // console.log(rawLink)
        });

        $("a.question_link", noticeHTML).each(function() {
            rawLink = $(this).attr('href')
            $(this).attr('href', 'https://www.zhihu.com' + rawLink);
            // console.log(rawLink)
        });
        // console.log(resultJSON['msg']);
        $("div#notice").html(noticeHTML);
    });

    myCORS_get(targetLink_follow, argument, function(responseText) {
        var resultJSON = JSON.parse(responseText);
        msgCnt += resultJSON['r'];
        // console.log(resultJSON['msg']);
        $("div#follow").html(resultJSON['msg']);
    });

    myCORS_get(targetLink_vote_thank, argument, function(responseText) {
        var resultJSON = JSON.parse(responseText);
        msgCnt += resultJSON['r'];
        // console.log(resultJSON['msg']);
        $("div#vote_thank").html(resultJSON['msg']);
    });


    if (msgCnt > 0) {
        console.log("new message", msgCnt);
    }
}
