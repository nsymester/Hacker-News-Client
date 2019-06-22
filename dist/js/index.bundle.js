(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.LoadComments = LoadComments;

var _Utils = require("./Utils");

function LoadComments() {
  var acc = document.querySelectorAll('.accordion');

  for (var i = 0; i < acc.length; i++) {
    acc[i].addEventListener('click', LoadCommentsHandler);
  }
}

function LoadCommentsHandler(evt) {
  var commentIds = evt.currentTarget.dataset.comments.split(',');
  var panel = evt.target.parentNode.nextElementSibling;
  evt.target.parentNode.nextElementSibling.classList.toggle('active');
  var tHTML = '';

  if (!panel.innerHTML.trim()) {
    Promise.all( // get all the comments
    commentIds.map(function (commentId) {
      return (0, _Utils.getJSON)("https://hacker-news.firebaseio.com/v0/item/".concat(commentId, ".json"));
    }) // map
    ).then(function (response) {
      console.log(response);
      panel.innerHTML = response.reduce(function (prevVal, elem) {
        return prevVal + elem.id + ' >> ' + elem.text + '<hr />';
      }, 0); // now show the panel

      showPanel(panel);
    });
  } else {
    showPanel(panel);
  }
}

function showPanel(panelElement) {
  // now show the panel
  if (panelElement.style.maxHeight) {
    panelElement.style.maxHeight = null;
  } else {
    panelElement.style.maxHeight = panelElement.scrollHeight + 'px';
  }
}

function GetComments(commentId, url, cb, commentContainer) {
  console.log(commentContainer.parentNode.nextElementSibling);

  if (!loadedComments.includes(commentId)) {
    loadedComments.push(commentId);
    (0, _Utils.getJSON)(url.replace('url', commentId)).then(function (response) {
      commentContainer.parentNode.nextElementSibling.innerHTML += commentId + ' >> ' + response.text;
    });
  }

  cb();
}

},{"./Utils":3}],2:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.GetNewsIds = GetNewsIds;
exports.LoadMoreNewsItems = LoadMoreNewsItems;
exports.GetMoreNewsItems = GetMoreNewsItems;
exports.buildUI = buildUI;
exports.appendNewsToUI = appendNewsToUI;

var _NewsComments = require("./NewsComments");

var _utils = require("./utils");

var loadedComments = [];

function GetNewsIds(url) {
  (0, _utils.getJSON)(url).then(function (response) {
    // returns a JSON structure so no need to conver it
    buildUI(response);
  }).catch(function (e) {
    throw Error('Search Request Error');
  });
}

function GetMoreNewsItems(cb) {
  cb();
}

function buildUI(newsItems) {
  // build the news component for the first 10 itemss
  for (var i = 0; i < 10; i = i + 1) {
    // console.log(newsItems[i]);
    (0, _utils.getJSON)("https://hacker-news.firebaseio.com/v0/item/".concat(newsItems[i], ".json")).then(function (response) {
      // returns a JSON structure so no need to conver it
      appendNewsToUI(response);
    }).catch(function (e) {
      throw Error('Search Request Error');
    });
  }
}

function appendNewsToUI(newsItem) {
  var newsItemsElem = document.querySelector('.newsItems'); // calculate date difference

  var dateFromAPI = newsItem.time;
  var now = new Date();
  var datefromAPITimeStamp = new Date(dateFromAPI * 1000).getTime();
  var nowTimeStamp = now.getTime();
  var microSecondsDiff = Math.abs(datefromAPITimeStamp - nowTimeStamp); // Number of milliseconds per day =
  //   24 hrs/day * 60 minutes/hour * 60 seconds/minute * 1000 msecs/second

  var hoursDiff = Math.floor(microSecondsDiff / (1000 * 60 * 60));
  var comments = newsItem.kids != null ? newsItem.kids.length : 0;
  var newsItemContent = "\n  <li class=\"moreBox blogBox\">\n    <h4>".concat(newsItem.title, " <small>(").concat(newsItem.by, ")</small></h4>\n    <p><span>").concat(newsItem.score, " points by (viewer) ").concat(hoursDiff, " hours ago</span> <a class=\"accordion\" data-comments=\"").concat(newsItem.kids, "\">").concat(comments, " comments</a></p>\n    <div class=\"panel\">\n\n    </div>\n  </li>\n  ");
  newsItemsElem.innerHTML += newsItemContent; // console.log(newsItem);

  (0, _NewsComments.LoadComments)();
  LoadMoreNewsItems();
}

function LoadMoreNewsItems() {
  // hide all news items
  var blogBox = Array.from(document.querySelectorAll('.blogBox')).map(function (hiddenBlog) {
    return hiddenBlog.style.display = 'none';
  });
  var loadMore = document.querySelector('.load-more'); // show the 1st 3 news items

  Array.from(document.querySelectorAll('.moreBox')).slice(0, 3).map(function (element) {
    return element.style.display = 'block';
  });

  if (blogBox.length != 0) {
    loadMore.style.display = 'block';
  }

  loadMore.addEventListener('click', function (evt) {
    evt.preventDefault();
    evt.stopImmediatePropagation();
    Array.from(document.querySelectorAll('.blogBox')).filter(function (hiddenBlog) {
      return hiddenBlog.style.display === 'none';
    }).slice(0, 3).map(function (element) {
      return element.style.display = 'block';
    });

    if (Array.from(document.querySelectorAll('.blogBox')).filter(function (hiddenBlog) {
      return hiddenBlog.style.display === 'none';
    }).length === 0) {
      loadMore.style.display = 'none';
    }
  });
}

function load(url, cb) {
  var request = new XMLHttpRequest(); // request type, the server, async

  request.open('GET', url, true);

  request.onload = function () {
    if (request.status >= 200 && request.status < 400) {
      // Success!
      var data = JSON.parse(request.responseText);
      cb(data);
    } else {
      console.error('Target server reached, but it returned an error');
    }
  };

  request.onerror = function () {
    console.error('There was a connection error of some sort');
  };

  request.send();
}

},{"./NewsComments":1,"./utils":4}],3:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Ready = Ready;
exports.getJSON = getJSON;

function Ready(fn) {
  if (document.attachEvent ? document.readyState === 'complete' : document.readyState !== 'loading') {
    fn();
  } else {
    document.addEventListener('DOMContentLoaded', fn);
  }
}
/**
 * XHR wrapped in a promise
 * @param  {String} url - The URL to fetch.
 * @return {Promise}    - A Promise that resolves when the XHR succeeds and fails otherwise.
 */


function get(url) {
  return fetch(url, {
    method: 'get'
  });
}
/**
 * Performs an XHR for a JSON and returns a parsed JSON response.
 * @param  {String} url - The JSON URL to fetch.
 * @return {Promise}    - A promise that passes the parsed JSON response.
 */


function getJSON(url) {
  return get(url).then(function (response) {
    return response.json();
  });
}

},{}],4:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Ready = Ready;
exports.getJSON = getJSON;

function Ready(fn) {
  if (document.attachEvent ? document.readyState === 'complete' : document.readyState !== 'loading') {
    fn();
  } else {
    document.addEventListener('DOMContentLoaded', fn);
  }
}
/**
 * XHR wrapped in a promise
 * @param  {String} url - The URL to fetch.
 * @return {Promise}    - A Promise that resolves when the XHR succeeds and fails otherwise.
 */


function get(url) {
  return fetch(url, {
    method: 'get'
  });
}
/**
 * Performs an XHR for a JSON and returns a parsed JSON response.
 * @param  {String} url - The JSON URL to fetch.
 * @return {Promise}    - A promise that passes the parsed JSON response.
 */


function getJSON(url) {
  return get(url).then(function (response) {
    return response.json();
  });
}

},{}],5:[function(require,module,exports){
"use strict";

var _Utils = require("./components/Utils");

var _NewsItems = require("./components/NewsItems");

function Start() {
  var app = document.querySelector('#app');
  (0, _NewsItems.GetNewsIds)('https://hacker-news.firebaseio.com/v0/topstories.json', _NewsItems.buildUI);
}

(0, _Utils.Ready)(Start);

},{"./components/NewsItems":2,"./components/Utils":3}]},{},[5])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvc2NyaXB0cy9jb21wb25lbnRzL05ld3NDb21tZW50cy5qcyIsInNyYy9zY3JpcHRzL2NvbXBvbmVudHMvTmV3c0l0ZW1zLmpzIiwic3JjL3NjcmlwdHMvY29tcG9uZW50cy9VdGlscy5qcyIsInNyYy9zY3JpcHRzL2NvbXBvbmVudHMvdXRpbHMuanMiLCJzcmMvc2NyaXB0cy9pbmRleC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7QUNBQTs7QUFFQSxTQUFTLFlBQVQsR0FBd0I7QUFDdEIsTUFBTSxHQUFHLEdBQUcsUUFBUSxDQUFDLGdCQUFULENBQTBCLFlBQTFCLENBQVo7O0FBRUEsT0FBSyxJQUFJLENBQUMsR0FBRyxDQUFiLEVBQWdCLENBQUMsR0FBRyxHQUFHLENBQUMsTUFBeEIsRUFBZ0MsQ0FBQyxFQUFqQyxFQUFxQztBQUNuQyxJQUFBLEdBQUcsQ0FBQyxDQUFELENBQUgsQ0FBTyxnQkFBUCxDQUF3QixPQUF4QixFQUFpQyxtQkFBakM7QUFDRDtBQUNGOztBQUVELFNBQVMsbUJBQVQsQ0FBNkIsR0FBN0IsRUFBa0M7QUFDaEMsTUFBSSxVQUFVLEdBQUcsR0FBRyxDQUFDLGFBQUosQ0FBa0IsT0FBbEIsQ0FBMEIsUUFBMUIsQ0FBbUMsS0FBbkMsQ0FBeUMsR0FBekMsQ0FBakI7QUFDQSxNQUFJLEtBQUssR0FBRyxHQUFHLENBQUMsTUFBSixDQUFXLFVBQVgsQ0FBc0Isa0JBQWxDO0FBQ0EsRUFBQSxHQUFHLENBQUMsTUFBSixDQUFXLFVBQVgsQ0FBc0Isa0JBQXRCLENBQXlDLFNBQXpDLENBQW1ELE1BQW5ELENBQTBELFFBQTFEO0FBQ0EsTUFBSSxLQUFLLEdBQUcsRUFBWjs7QUFFQSxNQUFJLENBQUMsS0FBSyxDQUFDLFNBQU4sQ0FBZ0IsSUFBaEIsRUFBTCxFQUE2QjtBQUMzQixJQUFBLE9BQU8sQ0FBQyxHQUFSLEVBQ0U7QUFDQSxJQUFB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Z2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIHIoZSxuLHQpe2Z1bmN0aW9uIG8oaSxmKXtpZighbltpXSl7aWYoIWVbaV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2krXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxpPTA7aTx0Lmxlbmd0aDtpKyspbyh0W2ldKTtyZXR1cm4gb31yZXR1cm4gcn0pKCkiLCJpbXBvcnQgeyBnZXRKU09OIH0gZnJvbSAnLi9VdGlscyc7XG5cbmZ1bmN0aW9uIExvYWRDb21tZW50cygpIHtcbiAgY29uc3QgYWNjID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLmFjY29yZGlvbicpO1xuXG4gIGZvciAobGV0IGkgPSAwOyBpIDwgYWNjLmxlbmd0aDsgaSsrKSB7XG4gICAgYWNjW2ldLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgTG9hZENvbW1lbnRzSGFuZGxlcik7XG4gIH1cbn1cblxuZnVuY3Rpb24gTG9hZENvbW1lbnRzSGFuZGxlcihldnQpIHtcbiAgbGV0IGNvbW1lbnRJZHMgPSBldnQuY3VycmVudFRhcmdldC5kYXRhc2V0LmNvbW1lbnRzLnNwbGl0KCcsJyk7XG4gIGxldCBwYW5lbCA9IGV2dC50YXJnZXQucGFyZW50Tm9kZS5uZXh0RWxlbWVudFNpYmxpbmc7XG4gIGV2dC50YXJnZXQucGFyZW50Tm9kZS5uZXh0RWxlbWVudFNpYmxpbmcuY2xhc3NMaXN0LnRvZ2dsZSgnYWN0aXZlJyk7XG4gIGxldCB0SFRNTCA9ICcnO1xuXG4gIGlmICghcGFuZWwuaW5uZXJIVE1MLnRyaW0oKSkge1xuICAgIFByb21pc2UuYWxsKFxuICAgICAgLy8gZ2V0IGFsbCB0aGUgY29tbWVudHNcbiAgICAgIGNvbW1lbnRJZHMubWFwKGNvbW1lbnRJZCA9PiB7XG4gICAgICAgIHJldHVybiBnZXRKU09OKFxuICAgICAgICAgIGBodHRwczovL2hhY2tlci1uZXdzLmZpcmViYXNlaW8uY29tL3YwL2l0ZW0vJHtjb21tZW50SWR9Lmpzb25gXG4gICAgICAgICk7XG4gICAgICB9KSAvLyBtYXBcbiAgICApLnRoZW4ocmVzcG9uc2UgPT4ge1xuICAgICAgY29uc29sZS5sb2cocmVzcG9uc2UpO1xuICAgICAgcGFuZWwuaW5uZXJIVE1MID0gcmVzcG9uc2UucmVkdWNlKChwcmV2VmFsLCBlbGVtKSA9PiB7XG4gICAgICAgIHJldHVybiBwcmV2VmFsICsgZWxlbS5pZCArICcgPj4gJyArIGVsZW0udGV4dCArICc8aHIgLz4nO1xuICAgICAgfSwgMCk7XG4gICAgICAvLyBub3cgc2hvdyB0aGUgcGFuZWxcbiAgICAgIHNob3dQYW5lbChwYW5lbCk7XG4gICAgfSk7XG4gIH0gZWxzZSB7XG4gICAgc2hvd1BhbmVsKHBhbmVsKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBzaG93UGFuZWwocGFuZWxFbGVtZW50KSB7XG4gIC8vIG5vdyBzaG93IHRoZSBwYW5lbFxuICBpZiAocGFuZWxFbGVtZW50LnN0eWxlLm1heEhlaWdodCkge1xuICAgIHBhbmVsRWxlbWVudC5zdHlsZS5tYXhIZWlnaHQgPSBudWxsO1xuICB9IGVsc2Uge1xuICAgIHBhbmVsRWxlbWVudC5zdHlsZS5tYXhIZWlnaHQgPSBwYW5lbEVsZW1lbnQuc2Nyb2xsSGVpZ2h0ICsgJ3B4JztcbiAgfVxufVxuXG5mdW5jdGlvbiBHZXRDb21tZW50cyhjb21tZW50SWQsIHVybCwgY2IsIGNvbW1lbnRDb250YWluZXIpIHtcbiAgY29uc29sZS5sb2coY29tbWVudENvbnRhaW5lci5wYXJlbnROb2RlLm5leHRFbGVtZW50U2libGluZyk7XG4gIGlmICghbG9hZGVkQ29tbWVudHMuaW5jbHVkZXMoY29tbWVudElkKSkge1xuICAgIGxvYWRlZENvbW1lbnRzLnB1c2goY29tbWVudElkKTtcbiAgICBnZXRKU09OKHVybC5yZXBsYWNlKCd1cmwnLCBjb21tZW50SWQpKS50aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKSB7XG4gICAgICBjb21tZW50Q29udGFpbmVyLnBhcmVudE5vZGUubmV4dEVsZW1lbnRTaWJsaW5nLmlubmVySFRNTCArPVxuICAgICAgICBjb21tZW50SWQgKyAnID4+ICcgKyByZXNwb25zZS50ZXh0O1xuICAgIH0pO1xuICB9XG4gIGNiKCk7XG59XG5cbmV4cG9ydCB7IExvYWRDb21tZW50cyB9O1xuIiwiaW1wb3J0IHsgTG9hZENvbW1lbnRzIH0gZnJvbSAnLi9OZXdzQ29tbWVudHMnO1xuaW1wb3J0IHsgZ2V0SlNPTiB9IGZyb20gJy4vdXRpbHMnO1xuXG5sZXQgbG9hZGVkQ29tbWVudHMgPSBbXTtcblxuZnVuY3Rpb24gR2V0TmV3c0lkcyh1cmwpIHtcbiAgZ2V0SlNPTih1cmwpXG4gICAgLnRoZW4oZnVuY3Rpb24ocmVzcG9uc2UpIHtcbiAgICAgIC8vIHJldHVybnMgYSBKU09OIHN0cnVjdHVyZSBzbyBubyBuZWVkIHRvIGNvbnZlciBpdFxuICAgICAgYnVpbGRVSShyZXNwb25zZSk7XG4gICAgfSlcbiAgICAuY2F0Y2goZnVuY3Rpb24oZSkge1xuICAgICAgdGhyb3cgRXJyb3IoJ1NlYXJjaCBSZXF1ZXN0IEVycm9yJyk7XG4gICAgfSk7XG59XG5cbmZ1bmN0aW9uIEdldE1vcmVOZXdzSXRlbXMoY2IpIHtcbiAgY2IoKTtcbn1cblxuZnVuY3Rpb24gYnVpbGRVSShuZXdzSXRlbXMpIHtcbiAgLy8gYnVpbGQgdGhlIG5ld3MgY29tcG9uZW50IGZvciB0aGUgZmlyc3QgMTAgaXRlbXNzXG4gIGZvciAobGV0IGkgPSAwOyBpIDwgMTA7IGkgPSBpICsgMSkge1xuICAgIC8vIGNvbnNvbGUubG9nKG5ld3NJdGVtc1tpXSk7XG4gICAgZ2V0SlNPTihgaHR0cHM6Ly9oYWNrZXItbmV3cy5maXJlYmFzZWlvLmNvbS92MC9pdGVtLyR7bmV3c0l0ZW1zW2ldfS5qc29uYClcbiAgICAgIC50aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKSB7XG4gICAgICAgIC8vIHJldHVybnMgYSBKU09OIHN0cnVjdHVyZSBzbyBubyBuZWVkIHRvIGNvbnZlciBpdFxuICAgICAgICBhcHBlbmROZXdzVG9VSShyZXNwb25zZSk7XG4gICAgICB9KVxuICAgICAgLmNhdGNoKGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgdGhyb3cgRXJyb3IoJ1NlYXJjaCBSZXF1ZXN0IEVycm9yJyk7XG4gICAgICB9KTtcbiAgfVxufVxuXG5mdW5jdGlvbiBhcHBlbmROZXdzVG9VSShuZXdzSXRlbSkge1xuICBjb25zdCBuZXdzSXRlbXNFbGVtID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLm5ld3NJdGVtcycpO1xuXG4gIC8vIGNhbGN1bGF0ZSBkYXRlIGRpZmZlcmVuY2VcbiAgdmFyIGRhdGVGcm9tQVBJID0gbmV3c0l0ZW0udGltZTtcblxuICB2YXIgbm93ID0gbmV3IERhdGUoKTtcbiAgdmFyIGRhdGVmcm9tQVBJVGltZVN0YW1wID0gbmV3IERhdGUoZGF0ZUZyb21BUEkgKiAxMDAwKS5nZXRUaW1lKCk7XG4gIHZhciBub3dUaW1lU3RhbXAgPSBub3cuZ2V0VGltZSgpO1xuXG4gIHZhciBtaWNyb1NlY29uZHNEaWZmID0gTWF0aC5hYnMoZGF0ZWZyb21BUElUaW1lU3RhbXAgLSBub3dUaW1lU3RhbXApO1xuICAvLyBOdW1iZXIgb2YgbWlsbGlzZWNvbmRzIHBlciBkYXkgPVxuICAvLyAgIDI0IGhycy9kYXkgKiA2MCBtaW51dGVzL2hvdXIgKiA2MCBzZWNvbmRzL21pbnV0ZSAqIDEwMDAgbXNlY3Mvc2Vjb25kXG4gIHZhciBob3Vyc0RpZmYgPSBNYXRoLmZsb29yKG1pY3JvU2Vjb25kc0RpZmYgLyAoMTAwMCAqIDYwICogNjApKTtcblxuICBsZXQgY29tbWVudHMgPSBuZXdzSXRlbS5raWRzICE9IG51bGwgPyBuZXdzSXRlbS5raWRzLmxlbmd0aCA6IDA7XG5cbiAgbGV0IG5ld3NJdGVtQ29udGVudCA9IGBcbiAgPGxpIGNsYXNzPVwibW9yZUJveCBibG9nQm94XCI+XG4gICAgPGg0PiR7bmV3c0l0ZW0udGl0bGV9IDxzbWFsbD4oJHtuZXdzSXRlbS5ieX0pPC9zbWFsbD48L2g0PlxuICAgIDxwPjxzcGFuPiR7XG4gICAgICBuZXdzSXRlbS5zY29yZVxuICAgIH0gcG9pbnRzIGJ5ICh2aWV3ZXIpICR7aG91cnNEaWZmfSBob3VycyBhZ288L3NwYW4+IDxhIGNsYXNzPVwiYWNjb3JkaW9uXCIgZGF0YS1jb21tZW50cz1cIiR7XG4gICAgbmV3c0l0ZW0ua2lkc1xuICB9XCI+JHtjb21tZW50c30gY29tbWVudHM8L2E+PC9wPlxuICAgIDxkaXYgY2xhc3M9XCJwYW5lbFwiPlxuXG4gICAgPC9kaXY+XG4gIDwvbGk+XG4gIGA7XG4gIG5ld3NJdGVtc0VsZW0uaW5uZXJIVE1MICs9IG5ld3NJdGVtQ29udGVudDtcbiAgLy8gY29uc29sZS5sb2cobmV3c0l0ZW0pO1xuICBMb2FkQ29tbWVudHMoKTtcbiAgTG9hZE1vcmVOZXdzSXRlbXMoKTtcbn1cblxuZnVuY3Rpb24gTG9hZE1vcmVOZXdzSXRlbXMoKSB7XG4gIC8vIGhpZGUgYWxsIG5ld3MgaXRlbXNcbiAgbGV0IGJsb2dCb3ggPSBBcnJheS5mcm9tKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5ibG9nQm94JykpLm1hcChmdW5jdGlvbihcbiAgICBoaWRkZW5CbG9nXG4gICkge1xuICAgIHJldHVybiAoaGlkZGVuQmxvZy5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnKTtcbiAgfSk7XG5cbiAgY29uc3QgbG9hZE1vcmUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcubG9hZC1tb3JlJyk7XG5cbiAgLy8gc2hvdyB0aGUgMXN0IDMgbmV3cyBpdGVtc1xuICBBcnJheS5mcm9tKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5tb3JlQm94JykpXG4gICAgLnNsaWNlKDAsIDMpXG4gICAgLm1hcChmdW5jdGlvbihlbGVtZW50KSB7XG4gICAgICByZXR1cm4gKGVsZW1lbnQuc3R5bGUuZGlzcGxheSA9ICdibG9jaycpO1xuICAgIH0pO1xuXG4gIGlmIChibG9nQm94Lmxlbmd0aCAhPSAwKSB7XG4gICAgbG9hZE1vcmUuc3R5bGUuZGlzcGxheSA9ICdibG9jayc7XG4gIH1cblxuICBsb2FkTW9yZS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uKGV2dCkge1xuICAgIGV2dC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIGV2dC5zdG9wSW1tZWRpYXRlUHJvcGFnYXRpb24oKTtcblxuICAgIEFycmF5LmZyb20oZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLmJsb2dCb3gnKSlcbiAgICAgIC5maWx0ZXIoZnVuY3Rpb24oaGlkZGVuQmxvZykge1xuICAgICAgICByZXR1cm4gaGlkZGVuQmxvZy5zdHlsZS5kaXNwbGF5ID09PSAnbm9uZSc7XG4gICAgICB9KVxuICAgICAgLnNsaWNlKDAsIDMpXG4gICAgICAubWFwKGZ1bmN0aW9uKGVsZW1lbnQpIHtcbiAgICAgICAgcmV0dXJuIChlbGVtZW50LnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snKTtcbiAgICAgIH0pO1xuXG4gICAgaWYgKFxuICAgICAgQXJyYXkuZnJvbShkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuYmxvZ0JveCcpKS5maWx0ZXIoZnVuY3Rpb24oXG4gICAgICAgIGhpZGRlbkJsb2dcbiAgICAgICkge1xuICAgICAgICByZXR1cm4gaGlkZGVuQmxvZy5zdHlsZS5kaXNwbGF5ID09PSAnbm9uZSc7XG4gICAgICB9KS5sZW5ndGggPT09IDBcbiAgICApIHtcbiAgICAgIGxvYWRNb3JlLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG4gICAgfVxuICB9KTtcbn1cblxuZnVuY3Rpb24gbG9hZCh1cmwsIGNiKSB7XG4gIGNvbnN0IHJlcXVlc3QgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcblxuICAvLyByZXF1ZXN0IHR5cGUsIHRoZSBzZXJ2ZXIsIGFzeW5jXG4gIHJlcXVlc3Qub3BlbignR0VUJywgdXJsLCB0cnVlKTtcblxuICByZXF1ZXN0Lm9ubG9hZCA9ICgpID0+IHtcbiAgICBpZiAocmVxdWVzdC5zdGF0dXMgPj0gMjAwICYmIHJlcXVlc3Quc3RhdHVzIDwgNDAwKSB7XG4gICAgICAvLyBTdWNjZXNzIVxuICAgICAgbGV0IGRhdGEgPSBKU09OLnBhcnNlKHJlcXVlc3QucmVzcG9uc2VUZXh0KTtcbiAgICAgIGNiKGRhdGEpO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zb2xlLmVycm9yKCdUYXJnZXQgc2VydmVyIHJlYWNoZWQsIGJ1dCBpdCByZXR1cm5lZCBhbiBlcnJvcicpO1xuICAgIH1cbiAgfTtcblxuICByZXF1ZXN0Lm9uZXJyb3IgPSAoKSA9PiB7XG4gICAgY29uc29sZS5lcnJvcignVGhlcmUgd2FzIGEgY29ubmVjdGlvbiBlcnJvciBvZiBzb21lIHNvcnQnKTtcbiAgfTtcblxuICByZXF1ZXN0LnNlbmQoKTtcbn1cblxuZXhwb3J0IHtcbiAgR2V0TmV3c0lkcyxcbiAgTG9hZE1vcmVOZXdzSXRlbXMsXG4gIEdldE1vcmVOZXdzSXRlbXMsXG4gIGJ1aWxkVUksXG4gIGFwcGVuZE5ld3NUb1VJXG59O1xuIiwiZnVuY3Rpb24gUmVhZHkoZm4pIHtcbiAgaWYgKFxuICAgIGRvY3VtZW50LmF0dGFjaEV2ZW50XG4gICAgICA/IGRvY3VtZW50LnJlYWR5U3RhdGUgPT09ICdjb21wbGV0ZSdcbiAgICAgIDogZG9jdW1lbnQucmVhZHlTdGF0ZSAhPT0gJ2xvYWRpbmcnXG4gICkge1xuICAgIGZuKCk7XG4gIH0gZWxzZSB7XG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignRE9NQ29udGVudExvYWRlZCcsIGZuKTtcbiAgfVxufVxuXG4vKipcbiAqIFhIUiB3cmFwcGVkIGluIGEgcHJvbWlzZVxuICogQHBhcmFtICB7U3RyaW5nfSB1cmwgLSBUaGUgVVJMIHRvIGZldGNoLlxuICogQHJldHVybiB7UHJvbWlzZX0gICAgLSBBIFByb21pc2UgdGhhdCByZXNvbHZlcyB3aGVuIHRoZSBYSFIgc3VjY2VlZHMgYW5kIGZhaWxzIG90aGVyd2lzZS5cbiAqL1xuZnVuY3Rpb24gZ2V0KHVybCkge1xuICByZXR1cm4gZmV0Y2godXJsLCB7XG4gICAgbWV0aG9kOiAnZ2V0J1xuICB9KTtcbn1cblxuLyoqXG4gKiBQZXJmb3JtcyBhbiBYSFIgZm9yIGEgSlNPTiBhbmQgcmV0dXJucyBhIHBhcnNlZCBKU09OIHJlc3BvbnNlLlxuICogQHBhcmFtICB7U3RyaW5nfSB1cmwgLSBUaGUgSlNPTiBVUkwgdG8gZmV0Y2guXG4gKiBAcmV0dXJuIHtQcm9taXNlfSAgICAtIEEgcHJvbWlzZSB0aGF0IHBhc3NlcyB0aGUgcGFyc2VkIEpTT04gcmVzcG9uc2UuXG4gKi9cbmZ1bmN0aW9uIGdldEpTT04odXJsKSB7XG4gIHJldHVybiBnZXQodXJsKS50aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKSB7XG4gICAgcmV0dXJuIHJlc3BvbnNlLmpzb24oKTtcbiAgfSk7XG59XG5cbmV4cG9ydCB7IFJlYWR5LCBnZXRKU09OIH07XG4iLCJmdW5jdGlvbiBSZWFkeShmbikge1xuICBpZiAoXG4gICAgZG9jdW1lbnQuYXR0YWNoRXZlbnRcbiAgICAgID8gZG9jdW1lbnQucmVhZHlTdGF0ZSA9PT0gJ2NvbXBsZXRlJ1xuICAgICAgOiBkb2N1bWVudC5yZWFkeVN0YXRlICE9PSAnbG9hZGluZydcbiAgKSB7XG4gICAgZm4oKTtcbiAgfSBlbHNlIHtcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdET01Db250ZW50TG9hZGVkJywgZm4pO1xuICB9XG59XG5cbi8qKlxuICogWEhSIHdyYXBwZWQgaW4gYSBwcm9taXNlXG4gKiBAcGFyYW0gIHtTdHJpbmd9IHVybCAtIFRoZSBVUkwgdG8gZmV0Y2guXG4gKiBAcmV0dXJuIHtQcm9taXNlfSAgICAtIEEgUHJvbWlzZSB0aGF0IHJlc29sdmVzIHdoZW4gdGhlIFhIUiBzdWNjZWVkcyBhbmQgZmFpbHMgb3RoZXJ3aXNlLlxuICovXG5mdW5jdGlvbiBnZXQodXJsKSB7XG4gIHJldHVybiBmZXRjaCh1cmwsIHtcbiAgICBtZXRob2Q6ICdnZXQnXG4gIH0pO1xufVxuXG4vKipcbiAqIFBlcmZvcm1zIGFuIFhIUiBmb3IgYSBKU09OIGFuZCByZXR1cm5zIGEgcGFyc2VkIEpTT04gcmVzcG9uc2UuXG4gKiBAcGFyYW0gIHtTdHJpbmd9IHVybCAtIFRoZSBKU09OIFVSTCB0byBmZXRjaC5cbiAqIEByZXR1cm4ge1Byb21pc2V9ICAgIC0gQSBwcm9taXNlIHRoYXQgcGFzc2VzIHRoZSBwYXJzZWQgSlNPTiByZXNwb25zZS5cbiAqL1xuZnVuY3Rpb24gZ2V0SlNPTih1cmwpIHtcbiAgcmV0dXJuIGdldCh1cmwpLnRoZW4oZnVuY3Rpb24ocmVzcG9uc2UpIHtcbiAgICByZXR1cm4gcmVzcG9uc2UuanNvbigpO1xuICB9KTtcbn1cblxuZXhwb3J0IHsgUmVhZHksIGdldEpTT04gfTtcbiIsImltcG9ydCB7IFJlYWR5IH0gZnJvbSAnLi9jb21wb25lbnRzL1V0aWxzJztcbmltcG9ydCB7IGJ1aWxkVUkgfSBmcm9tICcuL2NvbXBvbmVudHMvTmV3c0l0ZW1zJztcbmltcG9ydCB7IEdldE5ld3NJZHMgfSBmcm9tICcuL2NvbXBvbmVudHMvTmV3c0l0ZW1zJztcblxuZnVuY3Rpb24gU3RhcnQoKSB7XG4gIGNvbnN0IGFwcCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNhcHAnKTtcblxuICBHZXROZXdzSWRzKCdodHRwczovL2hhY2tlci1uZXdzLmZpcmViYXNlaW8uY29tL3YwL3RvcHN0b3JpZXMuanNvbicsIGJ1aWxkVUkpO1xufVxuXG5SZWFkeShTdGFydCk7XG4iXX0=
