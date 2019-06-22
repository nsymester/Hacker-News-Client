import { getJSON } from './Utils';

function LoadComments() {
  const acc = document.querySelectorAll('.accordion');

  for (let i = 0; i < acc.length; i++) {
    acc[i].addEventListener('click', LoadCommentsHandler);
  }
}

function LoadCommentsHandler(evt) {
  let commentIds = evt.currentTarget.dataset.comments.split(',');
  let panel = evt.target.parentNode.nextElementSibling;
  evt.target.parentNode.nextElementSibling.classList.toggle('active');
  let tHTML = '';

  if (!panel.innerHTML.trim()) {
    Promise.all(
      // get all the comments
      commentIds.map(commentId => {
        return getJSON(
          `https://hacker-news.firebaseio.com/v0/item/${commentId}.json`
        );
      }) // map
    ).then(response => {
      console.log(response);
      panel.innerHTML = response.reduce((prevVal, elem) => {
        return prevVal + elem.id + ' >> ' + elem.text + '<hr />';
      }, 0);
      // now show the panel
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
    getJSON(url.replace('url', commentId)).then(function(response) {
      commentContainer.parentNode.nextElementSibling.innerHTML +=
        commentId + ' >> ' + response.text;
    });
  }
  cb();
}

export { LoadComments };
