(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.GetNewsIds = GetNewsIds;
exports.LoadMoreNewsItems = LoadMoreNewsItems;
exports.GetNewsItem = GetNewsItem;
exports.GetMoreNewsItems = GetMoreNewsItems;
exports.GetComments = GetComments;
exports.buildUI = buildUI;
exports.appendNewsToUI = appendNewsToUI;

var _ViewComments = require("./ViewComments");

var loadedComments = [];

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

function GetNewsIds(url, cb) {
  load(url, cb);
}

function GetNewsItem(url, cb) {
  load(url, cb);
}

function GetComments(commentId, url, cb, commentContainer) {
  console.log(commentContainer.parentNode.nextElementSibling);

  if (!loadedComments.includes(commentId)) {
    loadedComments.push(commentId);
    load(url.replace('url', commentId), function (element) {
      commentContainer.parentNode.nextElementSibling.innerHTML += commentId + ' >> ' + element.text;
    });
  }

  cb();
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

function GetMoreNewsItems(cb) {
  cb();
}

function buildUI(newsItems) {
  // console.log(newsItems.length);
  // build the news component for the first 10 itemss
  for (var i = 0; i < 10; i = i + 1) {
    // console.log(newsItems[i]);
    GetNewsItem("https://hacker-news.firebaseio.com/v0/item/".concat(newsItems[i], ".json"), appendNewsToUI);
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
  // ViewComments();

  LoadMoreNewsItems();
}

},{"./ViewComments":3}],2:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Ready = Ready;

function Ready(fn) {
  if (document.attachEvent ? document.readyState === 'complete' : document.readyState !== 'loading') {
    fn();
  } else {
    document.addEventListener('DOMContentLoaded', fn);
  }
}

},{}],3:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ViewComments = ViewComments;

var _NewsItems = require("./NewsItems");

function ViewComments() {
  var acc = document.querySelectorAll('.accordion');

  var _loop = function _loop(i) {
    acc[i].addEventListener('click', function (evt) {
      // console.log(acc[i].dataset.comments.split(','));
      acc[i].dataset.comments.split(',').forEach(function (commentId) {
        (0, _NewsItems.GetComments)(commentId, "https://hacker-news.firebaseio.com/v0/item/url.json", openComments, evt.target);
      });

      function openComments(comment) {
        console.log('toggling panel: ', evt.target.parentNode.nextElementSibling); // put this in a call back

        evt.target.parentNode.nextElementSibling.classList.toggle('active');
        var panel = evt.target.parentNode.nextElementSibling;
        console.log(panel.style.maxHeight);

        if (panel.style.maxHeight) {
          panel.style.maxHeight = null;
        } else {
          panel.style.maxHeight = panel.scrollHeight + 'px';
        }
      }
    });
  };

  for (var i = 0; i < acc.length; i++) {
    _loop(i);
  }
}

},{"./NewsItems":1}],4:[function(require,module,exports){
"use strict";

var _Utils = require("./components/Utils");

var _NewsItems = require("./components/NewsItems");

function Start() {
  var app = document.querySelector('#app');
  (0, _NewsItems.GetNewsIds)('https://hacker-news.firebaseio.com/v0/topstories.json', _NewsItems.buildUI);
}

(0, _Utils.Ready)(Start);

},{"./components/NewsItems":1,"./components/Utils":2}]},{},[4])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvc2NyaXB0cy9jb21wb25lbnRzL05ld3NJdGVtcy5qcyIsInNyYy9zY3JpcHRzL2NvbXBvbmVudHMvVXRpbHMuanMiLCJzcmMvc2NyaXB0cy9jb21wb25lbnRzL1ZpZXdDb21tZW50cy5qcyIsInNyYy9zY3JpcHRzL2luZGV4LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7Ozs7Ozs7OztBQ0FBOztBQUVBLElBQUksY0FBYyxHQUFHLEVBQXJCOztBQUVBLFNBQVMsaUJBQVQsR0FBNkI7QUFDM0I7QUFDQSxNQUFJLE9BQU8sR0FBRyxLQUFLLENBQUMsSUFBTixDQUFXLFFBQVEsQ0FBQyxnQkFBVCxDQUEwQixVQUExQixDQUFYLEVBQWtELEdBQWxELENBQXNELFVBQ2xFLFVBRGtFLEVBRWxFO0FBQ0EsV0FBUSxVQUFVLENBQUMsS0FBWCxDQUFpQixPQUFqQixHQUEyQixNQUFuQztBQUNELEdBSmEsQ0FBZDtBQU1BLE1BQU0sUUFBUSxHQUFHLFFBQVEsQ0FBQyxhQUFULENBQXVCLFlBQXZCLENBQWpCLENBUjJCLENBVTNCOztBQUNBLEVBQUEsS0FBSyxDQUFDLElBQU4sQ0FBVyxRQUFRLENBQUMsZ0JBQVQsQ0FBMEIsVUFBMUIsQ0FBWCxFQUNHLEtBREgsQ0FDUyxDQURULEVBQ1ksQ0FEWixFQUVHLEdBRkgsQ0FFTyxVQUFTLE9BQVQsRUFBa0I7QUFDckIsV0FBUSxPQUFPLENBQUMsS0FBUixDQUFjLE9BQWQsR0FBd0IsT0FBaEM7QUFDRCxHQUpIOztBQU1BLE1BQUksT0FBTyxDQUFDLE1BQVIsSUFBa0IsQ0FBdEIsRUFBeUI7QUFDdkIsSUFBQSxRQUFRLENBQUMsS0FBVCxDQUFlLE9BQWYsR0FBeUIsT0FBekI7QUFDRDs7QUFFRCxFQUFBLFFBQVEsQ0FBQyxnQkFBVCxDQUEwQixPQUExQixFQUFtQyxVQUFTLEdBQVQsRUFBYztBQUMvQyxJQUFBLEdBQUcsQ0FB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QUFsQztBQUVBLFFBQUEsT0FBTyxDQUFDLEdBQVIsQ0FBWSxLQUFLLENBQUMsS0FBTixDQUFZLFNBQXhCOztBQUVBLFlBQUksS0FBSyxDQUFDLEtBQU4sQ0FBWSxTQUFoQixFQUEyQjtBQUN6QixVQUFBLEtBQUssQ0FBQyxLQUFOLENBQVksU0FBWixHQUF3QixJQUF4QjtBQUNELFNBRkQsTUFFTztBQUNMLFVBQUEsS0FBSyxDQUFDLEtBQU4sQ0FBWSxTQUFaLEdBQXdCLEtBQUssQ0FBQyxZQUFOLEdBQXFCLElBQTdDO0FBQ0Q7QUFDRjtBQUNGLEtBOUJEO0FBSm9COztBQUd0QixPQUFLLElBQUksQ0FBQyxHQUFHLENBQWIsRUFBZ0IsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxNQUF4QixFQUFnQyxDQUFDLEVBQWpDLEVBQXFDO0FBQUEsVUFBNUIsQ0FBNEI7QUFnQ3BDO0FBQ0Y7Ozs7O0FDdENEOztBQUNBOztBQUdBLFNBQVMsS0FBVCxHQUFpQjtBQUNmLE1BQU0sR0FBRyxHQUFHLFFBQVEsQ0FBQyxhQUFULENBQXVCLE1BQXZCLENBQVo7QUFFQSw2QkFBVyx1REFBWCxFQUFvRSxrQkFBcEU7QUFDRDs7QUFFRCxrQkFBTSxLQUFOIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwiaW1wb3J0IHsgVmlld0NvbW1lbnRzIH0gZnJvbSAnLi9WaWV3Q29tbWVudHMnO1xuXG5sZXQgbG9hZGVkQ29tbWVudHMgPSBbXTtcblxuZnVuY3Rpb24gTG9hZE1vcmVOZXdzSXRlbXMoKSB7XG4gIC8vIGhpZGUgYWxsIG5ld3MgaXRlbXNcbiAgbGV0IGJsb2dCb3ggPSBBcnJheS5mcm9tKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5ibG9nQm94JykpLm1hcChmdW5jdGlvbihcbiAgICBoaWRkZW5CbG9nXG4gICkge1xuICAgIHJldHVybiAoaGlkZGVuQmxvZy5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnKTtcbiAgfSk7XG5cbiAgY29uc3QgbG9hZE1vcmUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcubG9hZC1tb3JlJyk7XG5cbiAgLy8gc2hvdyB0aGUgMXN0IDMgbmV3cyBpdGVtc1xuICBBcnJheS5mcm9tKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5tb3JlQm94JykpXG4gICAgLnNsaWNlKDAsIDMpXG4gICAgLm1hcChmdW5jdGlvbihlbGVtZW50KSB7XG4gICAgICByZXR1cm4gKGVsZW1lbnQuc3R5bGUuZGlzcGxheSA9ICdibG9jaycpO1xuICAgIH0pO1xuXG4gIGlmIChibG9nQm94Lmxlbmd0aCAhPSAwKSB7XG4gICAgbG9hZE1vcmUuc3R5bGUuZGlzcGxheSA9ICdibG9jayc7XG4gIH1cblxuICBsb2FkTW9yZS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uKGV2dCkge1xuICAgIGV2dC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIGV2dC5zdG9wSW1tZWRpYXRlUHJvcGFnYXRpb24oKTtcblxuICAgIEFycmF5LmZyb20oZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLmJsb2dCb3gnKSlcbiAgICAgIC5maWx0ZXIoZnVuY3Rpb24oaGlkZGVuQmxvZykge1xuICAgICAgICByZXR1cm4gaGlkZGVuQmxvZy5zdHlsZS5kaXNwbGF5ID09PSAnbm9uZSc7XG4gICAgICB9KVxuICAgICAgLnNsaWNlKDAsIDMpXG4gICAgICAubWFwKGZ1bmN0aW9uKGVsZW1lbnQpIHtcbiAgICAgICAgcmV0dXJuIChlbGVtZW50LnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snKTtcbiAgICAgIH0pO1xuXG4gICAgaWYgKFxuICAgICAgQXJyYXkuZnJvbShkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuYmxvZ0JveCcpKS5maWx0ZXIoZnVuY3Rpb24oXG4gICAgICAgIGhpZGRlbkJsb2dcbiAgICAgICkge1xuICAgICAgICByZXR1cm4gaGlkZGVuQmxvZy5zdHlsZS5kaXNwbGF5ID09PSAnbm9uZSc7XG4gICAgICB9KS5sZW5ndGggPT09IDBcbiAgICApIHtcbiAgICAgIGxvYWRNb3JlLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG4gICAgfVxuICB9KTtcbn1cblxuZnVuY3Rpb24gR2V0TmV3c0lkcyh1cmwsIGNiKSB7XG4gIGxvYWQodXJsLCBjYik7XG59XG5cbmZ1bmN0aW9uIEdldE5ld3NJdGVtKHVybCwgY2IpIHtcbiAgbG9hZCh1cmwsIGNiKTtcbn1cblxuZnVuY3Rpb24gR2V0Q29tbWVudHMoY29tbWVudElkLCB1cmwsIGNiLCBjb21tZW50Q29udGFpbmVyKSB7XG4gIGNvbnNvbGUubG9nKGNvbW1lbnRDb250YWluZXIucGFyZW50Tm9kZS5uZXh0RWxlbWVudFNpYmxpbmcpO1xuICBpZiAoIWxvYWRlZENvbW1lbnRzLmluY2x1ZGVzKGNvbW1lbnRJZCkpIHtcbiAgICBsb2FkZWRDb21tZW50cy5wdXNoKGNvbW1lbnRJZCk7XG4gICAgbG9hZCh1cmwucmVwbGFjZSgndXJsJywgY29tbWVudElkKSwgZnVuY3Rpb24oZWxlbWVudCkge1xuICAgICAgY29tbWVudENvbnRhaW5lci5wYXJlbnROb2RlLm5leHRFbGVtZW50U2libGluZy5pbm5lckhUTUwgKz1cbiAgICAgICAgY29tbWVudElkICsgJyA+PiAnICsgZWxlbWVudC50ZXh0O1xuICAgIH0pO1xuICB9XG4gIGNiKCk7XG59XG5cbmZ1bmN0aW9uIGxvYWQodXJsLCBjYikge1xuICBjb25zdCByZXF1ZXN0ID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XG5cbiAgLy8gcmVxdWVzdCB0eXBlLCB0aGUgc2VydmVyLCBhc3luY1xuICByZXF1ZXN0Lm9wZW4oJ0dFVCcsIHVybCwgdHJ1ZSk7XG5cbiAgcmVxdWVzdC5vbmxvYWQgPSAoKSA9PiB7XG4gICAgaWYgKHJlcXVlc3Quc3RhdHVzID49IDIwMCAmJiByZXF1ZXN0LnN0YXR1cyA8IDQwMCkge1xuICAgICAgLy8gU3VjY2VzcyFcbiAgICAgIGxldCBkYXRhID0gSlNPTi5wYXJzZShyZXF1ZXN0LnJlc3BvbnNlVGV4dCk7XG4gICAgICBjYihkYXRhKTtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc29sZS5lcnJvcignVGFyZ2V0IHNlcnZlciByZWFjaGVkLCBidXQgaXQgcmV0dXJuZWQgYW4gZXJyb3InKTtcbiAgICB9XG4gIH07XG5cbiAgcmVxdWVzdC5vbmVycm9yID0gKCkgPT4ge1xuICAgIGNvbnNvbGUuZXJyb3IoJ1RoZXJlIHdhcyBhIGNvbm5lY3Rpb24gZXJyb3Igb2Ygc29tZSBzb3J0Jyk7XG4gIH07XG5cbiAgcmVxdWVzdC5zZW5kKCk7XG59XG5cbmZ1bmN0aW9uIEdldE1vcmVOZXdzSXRlbXMoY2IpIHtcbiAgY2IoKTtcbn1cblxuZnVuY3Rpb24gYnVpbGRVSShuZXdzSXRlbXMpIHtcbiAgLy8gY29uc29sZS5sb2cobmV3c0l0ZW1zLmxlbmd0aCk7XG4gIC8vIGJ1aWxkIHRoZSBuZXdzIGNvbXBvbmVudCBmb3IgdGhlIGZpcnN0IDEwIGl0ZW1zc1xuICBmb3IgKGxldCBpID0gMDsgaSA8IDEwOyBpID0gaSArIDEpIHtcbiAgICAvLyBjb25zb2xlLmxvZyhuZXdzSXRlbXNbaV0pO1xuICAgIEdldE5ld3NJdGVtKFxuICAgICAgYGh0dHBzOi8vaGFja2VyLW5ld3MuZmlyZWJhc2Vpby5jb20vdjAvaXRlbS8ke25ld3NJdGVtc1tpXX0uanNvbmAsXG4gICAgICBhcHBlbmROZXdzVG9VSVxuICAgICk7XG4gIH1cbn1cblxuZnVuY3Rpb24gYXBwZW5kTmV3c1RvVUkobmV3c0l0ZW0pIHtcbiAgY29uc3QgbmV3c0l0ZW1zRWxlbSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5uZXdzSXRlbXMnKTtcblxuICAvLyBjYWxjdWxhdGUgZGF0ZSBkaWZmZXJlbmNlXG4gIHZhciBkYXRlRnJvbUFQSSA9IG5ld3NJdGVtLnRpbWU7XG5cbiAgdmFyIG5vdyA9IG5ldyBEYXRlKCk7XG4gIHZhciBkYXRlZnJvbUFQSVRpbWVTdGFtcCA9IG5ldyBEYXRlKGRhdGVGcm9tQVBJICogMTAwMCkuZ2V0VGltZSgpO1xuICB2YXIgbm93VGltZVN0YW1wID0gbm93LmdldFRpbWUoKTtcblxuICB2YXIgbWljcm9TZWNvbmRzRGlmZiA9IE1hdGguYWJzKGRhdGVmcm9tQVBJVGltZVN0YW1wIC0gbm93VGltZVN0YW1wKTtcbiAgLy8gTnVtYmVyIG9mIG1pbGxpc2Vjb25kcyBwZXIgZGF5ID1cbiAgLy8gICAyNCBocnMvZGF5ICogNjAgbWludXRlcy9ob3VyICogNjAgc2Vjb25kcy9taW51dGUgKiAxMDAwIG1zZWNzL3NlY29uZFxuICB2YXIgaG91cnNEaWZmID0gTWF0aC5mbG9vcihtaWNyb1NlY29uZHNEaWZmIC8gKDEwMDAgKiA2MCAqIDYwKSk7XG5cbiAgbGV0IGNvbW1lbnRzID0gbmV3c0l0ZW0ua2lkcyAhPSBudWxsID8gbmV3c0l0ZW0ua2lkcy5sZW5ndGggOiAwO1xuXG4gIGxldCBuZXdzSXRlbUNvbnRlbnQgPSBgXG4gIDxsaSBjbGFzcz1cIm1vcmVCb3ggYmxvZ0JveFwiPlxuICAgIDxoND4ke25ld3NJdGVtLnRpdGxlfSA8c21hbGw+KCR7bmV3c0l0ZW0uYnl9KTwvc21hbGw+PC9oND5cbiAgICA8cD48c3Bhbj4ke1xuICAgICAgbmV3c0l0ZW0uc2NvcmVcbiAgICB9IHBvaW50cyBieSAodmlld2VyKSAke2hvdXJzRGlmZn0gaG91cnMgYWdvPC9zcGFuPiA8YSBjbGFzcz1cImFjY29yZGlvblwiIGRhdGEtY29tbWVudHM9XCIke1xuICAgIG5ld3NJdGVtLmtpZHNcbiAgfVwiPiR7Y29tbWVudHN9IGNvbW1lbnRzPC9hPjwvcD5cbiAgICA8ZGl2IGNsYXNzPVwicGFuZWxcIj5cblxuICAgIDwvZGl2PlxuICA8L2xpPlxuICBgO1xuICBuZXdzSXRlbXNFbGVtLmlubmVySFRNTCArPSBuZXdzSXRlbUNvbnRlbnQ7XG4gIC8vIGNvbnNvbGUubG9nKG5ld3NJdGVtKTtcbiAgLy8gVmlld0NvbW1lbnRzKCk7XG4gIExvYWRNb3JlTmV3c0l0ZW1zKCk7XG59XG5cbmV4cG9ydCB7XG4gIEdldE5ld3NJZHMsXG4gIExvYWRNb3JlTmV3c0l0ZW1zLFxuICBHZXROZXdzSXRlbSxcbiAgR2V0TW9yZU5ld3NJdGVtcyxcbiAgR2V0Q29tbWVudHMsXG4gIGJ1aWxkVUksXG4gIGFwcGVuZE5ld3NUb1VJXG59O1xuIiwiZnVuY3Rpb24gUmVhZHkoZm4pIHtcbiAgaWYgKFxuICAgIGRvY3VtZW50LmF0dGFjaEV2ZW50XG4gICAgICA/IGRvY3VtZW50LnJlYWR5U3RhdGUgPT09ICdjb21wbGV0ZSdcbiAgICAgIDogZG9jdW1lbnQucmVhZHlTdGF0ZSAhPT0gJ2xvYWRpbmcnXG4gICkge1xuICAgIGZuKCk7XG4gIH0gZWxzZSB7XG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignRE9NQ29udGVudExvYWRlZCcsIGZuKTtcbiAgfVxufVxuXG5leHBvcnQgeyBSZWFkeSB9O1xuIiwiaW1wb3J0IHsgR2V0Q29tbWVudHMgfSBmcm9tICcuL05ld3NJdGVtcyc7XG5cbmZ1bmN0aW9uIFZpZXdDb21tZW50cygpIHtcbiAgY29uc3QgYWNjID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLmFjY29yZGlvbicpO1xuXG4gIGZvciAobGV0IGkgPSAwOyBpIDwgYWNjLmxlbmd0aDsgaSsrKSB7XG4gICAgYWNjW2ldLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZnVuY3Rpb24oZXZ0KSB7XG4gICAgICAvLyBjb25zb2xlLmxvZyhhY2NbaV0uZGF0YXNldC5jb21tZW50cy5zcGxpdCgnLCcpKTtcblxuICAgICAgYWNjW2ldLmRhdGFzZXQuY29tbWVudHMuc3BsaXQoJywnKS5mb3JFYWNoKGZ1bmN0aW9uKGNvbW1lbnRJZCkge1xuICAgICAgICBHZXRDb21tZW50cyhcbiAgICAgICAgICBjb21tZW50SWQsXG4gICAgICAgICAgYGh0dHBzOi8vaGFja2VyLW5ld3MuZmlyZWJhc2Vpby5jb20vdjAvaXRlbS91cmwuanNvbmAsXG4gICAgICAgICAgb3BlbkNvbW1lbnRzLFxuICAgICAgICAgIGV2dC50YXJnZXRcbiAgICAgICAgKTtcbiAgICAgIH0pO1xuXG4gICAgICBmdW5jdGlvbiBvcGVuQ29tbWVudHMoY29tbWVudCkge1xuICAgICAgICBjb25zb2xlLmxvZyhcbiAgICAgICAgICAndG9nZ2xpbmcgcGFuZWw6ICcsXG4gICAgICAgICAgZXZ0LnRhcmdldC5wYXJlbnROb2RlLm5leHRFbGVtZW50U2libGluZ1xuICAgICAgICApO1xuXG4gICAgICAgIC8vIHB1dCB0aGlzIGluIGEgY2FsbCBiYWNrXG4gICAgICAgIGV2dC50YXJnZXQucGFyZW50Tm9kZS5uZXh0RWxlbWVudFNpYmxpbmcuY2xhc3NMaXN0LnRvZ2dsZSgnYWN0aXZlJyk7XG4gICAgICAgIHZhciBwYW5lbCA9IGV2dC50YXJnZXQucGFyZW50Tm9kZS5uZXh0RWxlbWVudFNpYmxpbmc7XG5cbiAgICAgICAgY29uc29sZS5sb2cocGFuZWwuc3R5bGUubWF4SGVpZ2h0KTtcblxuICAgICAgICBpZiAocGFuZWwuc3R5bGUubWF4SGVpZ2h0KSB7XG4gICAgICAgICAgcGFuZWwuc3R5bGUubWF4SGVpZ2h0ID0gbnVsbDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBwYW5lbC5zdHlsZS5tYXhIZWlnaHQgPSBwYW5lbC5zY3JvbGxIZWlnaHQgKyAncHgnO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSk7XG4gIH1cbn1cblxuZXhwb3J0IHsgVmlld0NvbW1lbnRzIH07XG4iLCJpbXBvcnQgeyBSZWFkeSB9IGZyb20gJy4vY29tcG9uZW50cy9VdGlscyc7XG5pbXBvcnQgeyBidWlsZFVJIH0gZnJvbSAnLi9jb21wb25lbnRzL05ld3NJdGVtcyc7XG5pbXBvcnQgeyBHZXROZXdzSWRzIH0gZnJvbSAnLi9jb21wb25lbnRzL05ld3NJdGVtcyc7XG5cbmZ1bmN0aW9uIFN0YXJ0KCkge1xuICBjb25zdCBhcHAgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjYXBwJyk7XG5cbiAgR2V0TmV3c0lkcygnaHR0cHM6Ly9oYWNrZXItbmV3cy5maXJlYmFzZWlvLmNvbS92MC90b3BzdG9yaWVzLmpzb24nLCBidWlsZFVJKTtcbn1cblxuUmVhZHkoU3RhcnQpO1xuIl19
