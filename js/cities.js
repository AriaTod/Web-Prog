'use strict';
// Элементы
const cityForm = document.getElementById('city-form');
const cityInput = document.getElementById('city-input');
const cityError = document.getElementById('city-error');
const suggestionsList = document.getElementById('city-suggestions');
const citiesList = document.getElementById('cities-list');
const loadingElement = document.getElementById('loading');
const errorElement = document.getElementById('error');
const mainLocationSection = document.getElementById('current-location');
const mainLocationTitle = mainLocationSection.querySelector('h2');
const mainForecastContainer = document.getElementById('main-forecast');

// Хранилища
let mainLocation = null; // нормализованное имя основной локации
const addedCities = []; // массив нормализованных имён дополнительных городов

/**
 * Отрисовка прогноза
 */
function renderForecast(container, forecastDays) {
  container.innerHTML = '';
  forecastDays.forEach((day, index) => {
    const dayEl = document.createElement('div');
    dayEl.classList.add('forecast-day');
    const dateText = index === 0 ? 'Сегодня' : index === 1 ? 'Завтра' : 'Послезавтра';
    const date = createElement('p', dateText, ['date']);
    const temp = createElement('p', `${Math.round(day.day.avgtemp_c)} °C`, ['temp']);
    const condition = createElement('p', day.day.condition.text, ['condition']);
    dayEl.append(date, temp, condition);
    container.appendChild(dayEl);
  });
}

/**
 * Добавление города
 */
async function addCity(cityName) {
  if (!cityName.trim()) return;

  showElement(loadingElement);
  hideElement(cityError);
  hideElement(errorElement);

  try {
    const data = await getForecast(cityName);
    const fullName = `${data.location.name}, ${data.location.country}`;
    const normalized = data.location.name.toLowerCase();

    // Проверка на дубликат
    if (addedCities.includes(normalized) || (mainLocation && mainLocation === normalized)) {
      throw new Error('Город уже добавлен');
    }

    if (!mainLocation) {
      // Это первая (основная) локация
      mainLocation = normalized;
      mainLocationTitle.textContent = fullName;
      showElement(mainLocationSection);
      renderForecast(mainForecastContainer, data.forecast.forecastday);
    } else {
      // Дополнительный город
      addedCities.push(normalized);
      createCityCard(fullName, normalized, data.forecast.forecastday);
    }

    saveToLocalStorage();
  } catch (err) {
    // Локальная ошибка под полем ввода
    cityError.textContent = err.message.includes('already') || err.message.includes('добавлен')
      ? 'Город уже добавлен'
      : 'Город не найден';
    showElement(cityError);
  } finally {
    hideElement(loadingElement);
    cityInput.value = '';
    hideElement(suggestionsList);
  }
}

/**
 * Создание карточки города
 */
function createCityCard(fullName, normalized, forecastDays) {
  const card = document.createElement('div');
  card.classList.add('city-card');

  const header = document.createElement('div');
  header.classList.add('city-header');
  const title = createElement('h4', fullName);
  const deleteBtn = createElement('button', 'Удалить', ['delete-btn']);
  deleteBtn.onclick = () => {
    card.remove();
    addedCities.splice(addedCities.indexOf(normalized), 1);
    saveToLocalStorage();
  };
  header.append(title, deleteBtn);

  const forecastDiv = document.createElement('div');
  forecastDiv.classList.add('forecast-list');
  renderForecast(forecastDiv, forecastDays);

  card.append(header, forecastDiv);
  citiesList.appendChild(card);
}

/**
 * Обновление всех данных
 */
async function refreshAll() {
  showElement(loadingElement);
  hideElement(errorElement);
  hideElement(cityError);

  try {
    if (mainLocation) {
      const data = await getForecast(mainLocation);
      mainLocationTitle.textContent = `${data.location.name}, ${data.location.country}`;
      renderForecast(mainForecastContainer, data.forecast.forecastday);
    }

    // Перерисовываем все дополнительные города
    citiesList.innerHTML = '';
    for (const city of addedCities) {
      const data = await getForecast(city);
      const fullName = `${data.location.name}, ${data.location.country}`;
      createCityCard(fullName, city, data.forecast.forecastday);
    }
  } catch (err) {
    errorElement.textContent = 'Ошибка при обновлении данных';
    showElement(errorElement);
  } finally {
    hideElement(loadingElement);
  }
}

/**
 * LocalStorage
 */
function saveToLocalStorage() {
  localStorage.setItem('mainLocation', mainLocation);
  localStorage.setItem('addedCities', JSON.stringify(addedCities));
}

async function loadFromLocalStorage() {
  const savedMain = localStorage.getItem('mainLocation');
  const savedAdded = JSON.parse(localStorage.getItem('addedCities') || '[]');

  hideElement(errorElement);
  hideElement(cityError);

  if (savedMain) {
    try {
      mainLocation = savedMain;
      const data = await getForecast(savedMain);
      mainLocationTitle.textContent = `${data.location.name}, ${data.location.country}`;
      showElement(mainLocationSection);
      renderForecast(mainForecastContainer, data.forecast.forecastday);
    } catch (err) {
      errorElement.textContent = 'Ошибка загрузки основной локации';
      showElement(errorElement);
    }
  }

  for (const city of savedAdded) {
    try {
      addedCities.push(city);
      const data = await getForecast(city);
      const fullName = `${data.location.name}, ${data.location.country}`;
      createCityCard(fullName, city, data.forecast.forecastday);
    } catch (err) {
      console.error(`Не удалось загрузить город: ${city}`);
    }
  }
}

/* Автодополнение */
let debounceTimer;
cityInput.addEventListener('input', () => {
  clearTimeout(debounceTimer);
  const query = cityInput.value.trim();
  suggestionsList.innerHTML = '';
  hideElement(suggestionsList);
  hideElement(cityError);

  if (query.length < 2) return;

  debounceTimer = setTimeout(async () => {
    try {
      const results = await searchCity(query);
      results.slice(0, 6).forEach(item => {
        const li = document.createElement('li');
        li.textContent = `${item.name}, ${item.country}`;
        li.style.cursor = 'pointer';
        li.addEventListener('click', () => {
          cityInput.value = item.name;
          hideElement(suggestionsList);
          addCity(item.name);
        });
        suggestionsList.appendChild(li);
      });
      if (results.length > 0) showElement(suggestionsList);
    } catch (err) {
      // Игнорируем ошибки поиска подсказок
    }
  }, 300);
});

document.addEventListener('click', (e) => {
  if (!cityForm.contains(e.target)) hideElement(suggestionsList);
});

cityForm.addEventListener('submit', (e) => {
  e.preventDefault();
  addCity(cityInput.value.trim());
});

// Кнопка "Обновить погоду"
document.getElementById('refresh-btn').addEventListener('click', refreshAll);

// Кнопка "Начать заново"
document.getElementById('reset-btn').addEventListener('click', () => {
  // Сбрасываем сохраненные данные приложения
  localStorage.removeItem('mainLocation');
  localStorage.removeItem('addedCities');

  // Перезагружаем страницу
  location.reload();
});


// Экспортируем для app.js
window.loadFromLocalStorage = loadFromLocalStorage;