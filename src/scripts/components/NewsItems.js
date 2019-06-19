import { ViewComments } from './ViewComments';

let loadedComments = [];

function LoadMoreNewsItems() {
  // hide all news items
  let blogBox = Array.from(document.querySelectorAll('.blogBox')).map(function(
    hiddenBlog
  ) {
    return (hiddenBlog.style.display = 'none');
  });

  const loadMore = document.querySelector('.load-more');

  // show the 1st 3 news items
  Array.from(document.querySelectorAll('.moreBox'))
    .slice(0, 3)
    .map(function(element) {
      return (element.style.display = 'block');
    });

  if (blogBox.length != 0) {
    loadMore.style.display = 'block';
  }

  loadMore.addEventListener('click', function(evt) {
    evt.preventDefault();
    evt.stopImmediatePropagation();

    Array.from(document.querySelectorAll('.blogBox'))
      .filter(function(hiddenBlog) {
        return hiddenBlog.style.display === 'none';
      })
      .slice(0, 3)
      .map(function(element) {
        return (element.style.display = 'block');
      });

    if (
      Array.from(document.querySelectorAll('.blogBox')).filter(function(
        hiddenBlog
      ) {
        return hiddenBlog.style.display === 'none';
      }).length === 0
    ) {
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
    load(url.replace('url', commentId), function(element) {
      commentContainer.parentNode.nextElementSibling.innerHTML +=
        commentId + ' >> ' + element.text;
    });
  }
  cb();
}

function load(url, cb) {
  const request = new XMLHttpRequest();

  // request type, the server, async
  request.open('GET', url, true);

  request.onload = () => {
    if (request.status >= 200 && request.status < 400) {
      // Success!
      let data = JSON.parse(request.responseText);
      cb(data);
    } else {
      console.error('Target server reached, but it returned an error');
    }
  };

  request.onerror = () => {
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
  for (let i = 0; i < 10; i = i + 1) {
    // console.log(newsItems[i]);
    GetNewsItem(
      `https://hacker-news.firebaseio.com/v0/item/${newsItems[i]}.json`,
      appendNewsToUI
    );
  }
}

function appendNewsToUI(newsItem) {
  const newsItemsElem = document.querySelector('.newsItems');

  // calculate date difference
  var dateFromAPI = newsItem.time;

  var now = new Date();
  var datefromAPITimeStamp = new Date(dateFromAPI * 1000).getTime();
  var nowTimeStamp = now.getTime();

  var microSecondsDiff = Math.abs(datefromAPITimeStamp - nowTimeStamp);
  // Number of milliseconds per day =
  //   24 hrs/day * 60 minutes/hour * 60 seconds/minute * 1000 msecs/second
  var hoursDiff = Math.floor(microSecondsDiff / (1000 * 60 * 60));

  let comments = newsItem.kids != null ? newsItem.kids.length : 0;

  let newsItemContent = `
  <li class="moreBox blogBox">
    <h4>${newsItem.title} <small>(${newsItem.by})</small></h4>
    <p><span>${
      newsItem.score
    } points by (viewer) ${hoursDiff} hours ago</span> <a class="accordion" data-comments="${
    newsItem.kids
  }">${comments} comments</a></p>
    <div class="panel">

    </div>
  </li>
  `;
  newsItemsElem.innerHTML += newsItemContent;
  // console.log(newsItem);
  // ViewComments();
  LoadMoreNewsItems();
}

export {
  GetNewsIds,
  LoadMoreNewsItems,
  GetNewsItem,
  GetMoreNewsItems,
  GetComments,
  buildUI,
  appendNewsToUI
};
