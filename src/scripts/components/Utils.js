function Ready(fn) {
  if (
    document.attachEvent
      ? document.readyState === 'complete'
      : document.readyState !== 'loading'
  ) {
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
  return get(url).then(function(response) {
    return response.json();
  });
}

export { Ready, getJSON };
