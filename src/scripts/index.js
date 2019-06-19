import { Ready } from './components/Utils';
import { buildUI } from './components/NewsItems';
import { GetNewsIds } from './components/NewsItems';

function Start() {
  const app = document.querySelector('#app');

  GetNewsIds('https://hacker-news.firebaseio.com/v0/topstories.json', buildUI);
}

Ready(Start);
