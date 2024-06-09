const listRef = document.querySelector('.coins-list');
const inputRef = document.querySelector('.search_input');
const searchButtonRef = document.querySelector('.search_button');
const favoriteButtonRef = document.querySelector('.favorite_button');
const allButtonRef = document.querySelector('.allCoins_btn');
const searchContainerRef = document.querySelector('.search_container');
const clearIconRef = document.querySelector('.clear-icon');

let jsonData = [];
let favoriteCoins = [];

searchButtonRef.addEventListener('click', toggleSearchContainer);
allButtonRef.addEventListener('click', function () {
  if (!allButtonRef.classList.contains('active')) {
    setActiveButton(allButtonRef, favoriteButtonRef);
    handler();
  }
});
inputRef.addEventListener('input', _.debounce(onInputChange, 500));
listRef.addEventListener('change', addToFavorites);
favoriteButtonRef.addEventListener('click', function () {
  setActiveButton(favoriteButtonRef, allButtonRef);
  displayFavorites();
});

document.addEventListener('keydown', handleEscKey);
document.addEventListener('click', handleClickOutside);

loadFavoritesFromLocalStorage();

async function loadJson() {
  try {
    // const response = await fetch('https://api-eu.okotoki.com/coins');
    const response = await fetch('../assets/coins.json');
    if (!response.ok) {
      throw new Error('Мережева відповідь була некоректною');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Помилка при завантаженні JSON:', error);
    return null;
  }
}

async function handler() {
  const data = await loadJson();
  if (data) {
    jsonData = data;
    const coinsMarkup = createMarkup(data);
    listRef.innerHTML = coinsMarkup;
    listRef.style.display = 'block';
    listRef.style.overflowY = 'auto';
  } else {
    console.error('Не вдалося завантажити дані');
  }
}

function onInputChange(evt) {
  const filter = evt.target.value.toLowerCase();
  const fuse = new Fuse(jsonData, { keys: ['name'] });
  const activeCoins = favoriteButtonRef.classList.contains('active')
    ? jsonData.filter(item => favoriteCoins.includes(item))
    : jsonData;
  const filteredItems = filter
    ? fuse.search(filter).map(result => result.item)
    : activeCoins;
  listRef.innerHTML = createMarkup(filteredItems);
}

function createMarkup(coinsArr) {
  return coinsArr
    .map(name => {
      const checked = favoriteCoins.includes(name) ? 'checked' : '';
      return `<li class="coins-item">
        <input type="checkbox" name="coin-check" id="${name}" ${checked} />
        <label class="custom-checkbox" for="${name}"></label>
        <p>${name}</p>
      </li>`;
    })
    .join('');
}

function addToFavorites(evt) {
  const coinName = evt.target.id;
  if (evt.target.checked) {
    favoriteCoins.push(coinName);
  } else {
    const index = favoriteCoins.indexOf(coinName);
    if (index !== -1) {
      favoriteCoins.splice(index, 1);
    }
  }
  saveFavoritesToLocalStorage();
  if (favoriteButtonRef.classList.contains('active')) {
    displayFavorites();
  }
}

function setActiveButton(buttonToActivate, buttonToDeactivate) {
  buttonToActivate.classList.add('active');
  buttonToDeactivate.classList.remove('active');
}

function displayFavorites() {
  const filteredItems = jsonData.filter(item => favoriteCoins.includes(item));
  const markup = createMarkup(filteredItems);
  listRef.innerHTML = markup;
  listRef.style.display = 'block';
  listRef.style.overflowY = 'auto';
}

function clearInput(event) {
  inputRef.value = '';
  clearIconRef.style.display = 'none';
  listRef.style.display = 'none';
  event.stopPropagation();
}

inputRef.addEventListener('input', function () {
  if (inputRef.value) {
    clearIconRef.style.display = 'block';
  } else {
    clearIconRef.style.display = 'none';
  }
});

function handleEscKey(event) {
  if (event.key === 'Escape') {
    hideSearchContainer();
  }
}

function handleClickOutside(event) {
  const isInput = event.target === inputRef;
  const isList = event.target === listRef;
  const isListContainer = listRef.contains(event.target);
  const isFavoriteButton = event.target === favoriteButtonRef;
  const isAllButton = event.target === allButtonRef;
  const isSearchButton = event.target === searchButtonRef;
  const isClearIcon = event.target.classList.contains('clear-icon');
  if (
    !isInput &&
    !isList &&
    !isListContainer &&
    !isFavoriteButton &&
    !isAllButton &&
    !isSearchButton &&
    !isClearIcon
  ) {
    hideSearchContainer();
  }
}

function loadFavoritesFromLocalStorage() {
  const savedFavorites = localStorage.getItem('favoriteCoins');
  if (savedFavorites) {
    favoriteCoins = JSON.parse(savedFavorites);
  }
}

function saveFavoritesToLocalStorage() {
  localStorage.setItem('favoriteCoins', JSON.stringify(favoriteCoins));
}

function toggleSearchContainer() {
  if (
    searchContainerRef.style.display === 'none' ||
    !searchContainerRef.style.display
  ) {
    searchContainerRef.style.display = 'flex';
    handler();
  } else {
    hideSearchContainer();
  }
}

function hideSearchContainer() {
  searchContainerRef.style.display = 'none';
  listRef.style.display = 'none';
}
