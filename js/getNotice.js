$(document).ready(getNotice)

$("#mail").bind("click", function() {
    var createProperties = new Object();;
    createProperties.url = "https://www.zhihu.com/inbox";
    chrome.tabs.create(createProperties);
})

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

// 为消息中的链接完善地址
function zhihuLinkHead(htmlDOM, option) {
    $(option, htmlDOM).each(function() {
        var rawLink = $(this).attr('href')
        var newLink = 'https://www.zhihu.com' + rawLink
        $(this).attr('href', newLink);
        $(this).bind("click", function() {
                var createProperties = new Object();;
                createProperties.url = newLink;
                chrome.tabs.create(createProperties);
            })
            // console.log(rawLink)
    });
}

function parseZhihuNotice(htmlDOM) {
    zhihuLinkHead(htmlDOM, "a.zg-link")
    zhihuLinkHead(htmlDOM, "a.question_link")

    // 取出数据中有用的 span 信息
    divs = []
    $(htmlDOM).each(function(i, dv) {
        divs[i] = dv
    })

    // console.log(divs)

    // 创建对象
    $("section#noticeSection").html("")

    for (var i = 0; i < divs.length; i += 2) {
        $("section#noticeSection").append($("<div>", {
            class: "item"
        }).append($("<div>", {
            class: "item-content"
        }).append($("<div>", {
            class: "text"
        }).append(divs[i]))))
    }

    return htmlDOM
}

function parseZhihuFollow(htmlDOM) {
    zhihuLinkHead(htmlDOM, "a.zm-item-link-avatar")

    // 取出数据中有用的 span 信息
    divs = []
    $(htmlDOM).each(function(i, dv) {
        divs[i] = dv
    })

    links = []
    $("a.zm-item-link-avatar", htmlDOM).each(function(i, link) {
        links[i] = link
    })

    // console.log(links)

    // 创建对象

    for (var i = 0, j = 0; i < divs.length; i += 2, ++j) {
        $("section#followSection").append($("<div>", {
            class: "item"
        }).append($("<div>", {
            class: "item-content"
        }).append($("<div>", {
            class: "media pull-left"
        }).html(links[j]), $("<div>", {
            class: "text"
        }).append(divs[i]))))
    }

    return htmlDOM
}

function parseZhihuVoteThank(htmlDOM) {
    zhihuLinkHead(htmlDOM, "a.zg-link")
    zhihuLinkHead(htmlDOM, "a.question_link")

    // 取出数据中有用的 span 信息
    divs = []
    $(htmlDOM).each(function(i, div) {
        divs[i] = div
    })

    // console.log(divs)

    // 创建对象

    for (var i = 0; i < divs.length; i += 2) {
        $("section#voteThankSection").append($("<div>", {
            class: "item"
        }).append($("<div>", {
            class: "item-content"
        }).append($("<div>", {
            class: "text"
        }).append(divs[i]))))
    }

    return htmlDOM
}

// 向 zhihu.com 发送请求，获取信息的主函数
function getNotice() {
    console.log("contentMe: piratf.me@gmail.com")
    var timestamp = new Date().getTime();
    var argument = { r: timestamp };
    var targetLink_default = "https://www.zhihu.com/noti7/stack/default";
    var targetLink_follow = "https://www.zhihu.com/noti7/stack/follow";
    var targetLink_vote_thank = "https://www.zhihu.com/noti7/stack/vote_thank";

    // 获取普通消息
    myCORS_get(targetLink_default, argument, function(responseText) {
        var resultJSON = JSON.parse(responseText);
        var noticeHTML = jQuery.parseHTML(resultJSON['msg']);
        parseZhihuNotice(noticeHTML)
    });

    // 获取关注消息
    myCORS_get(targetLink_follow, argument, function(responseText) {
        var resultJSON = JSON.parse(responseText);
        var followHTML = jQuery.parseHTML(resultJSON['msg']);
        parseZhihuFollow(followHTML)
    });

    // 获取点赞消息
    myCORS_get(targetLink_vote_thank, argument, function(responseText) {
        var resultJSON = JSON.parse(responseText);
        var voteThankHTML = jQuery.parseHTML(resultJSON['msg']);
        parseZhihuVoteThank(voteThankHTML)
    });
}
