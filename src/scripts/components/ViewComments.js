import { GetComments } from './NewsItems';

function ViewComments() {
  const acc = document.querySelectorAll('.accordion');

  for (let i = 0; i < acc.length; i++) {
    acc[i].addEventListener('click', function(evt) {
      // console.log(acc[i].dataset.comments.split(','));

      acc[i].dataset.comments.split(',').forEach(function(commentId) {
        GetComments(
          commentId,
          `https://hacker-news.firebaseio.com/v0/item/url.json`,
          openComments,
          evt.target
        );
      });

      function openComments(comment) {
        console.log(
          'toggling panel: ',
          evt.target.parentNode.nextElementSibling
        );

        // put this in a call back
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
  }
}

export { ViewComments };
