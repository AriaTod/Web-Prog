'use strict';

// Элементы
const citiesList = document.getElementById('cities-list');
const cityForm = document.getElementById('city-form');
const cityInput = document.getElementById('city-input');
const cityError = document.getElementById('city-error');
const suggestionsList = document.getElementById('city-suggestions');

// Для основной локации
const locationSection = document.getElementById('current-location');
const locationTitle = locationSection.querySelector('h2');
const forecastContainer = document.querySelector('#forecast .forecast-list');

// Хранилища
let currentLocation = null; // null — если ещё не установлена основная
const addedCities = []; // имена в lowerCase для проверки дубликатов

/**
 * Отрисовка прогноза в указанный контейнер
 */
function renderForecastTo(container, forecastDays) {
  while (container.firstChild) {
    container.removeChild(container.firstChild);
  }

  forecastDays.forEach((day, index) => {
    const dayElement = document.createElement('div');
    dayElement.classList.add('forecast-day');

    const dateText = index === 0 ? 'Сегодня' : index === 1 ? 'Завтра' : 'Послезавтра';

    const date = createElement('p', dateText, ['date']);
    const temp = createElement('p', `${Math.round(day.day.avgtemp_c)} °C`, ['temp']);
    const condition = createElement('p', day.day.condition.text, ['condition']);

    dayElement.append(date, temp, condition);
    container.appendChild(dayElement);
  });
}

/**
 * Добавление города (основного или дополнительного)
 */
async function addCity(cityName) {
  if (!cityName.trim()) {
    cityError.textContent = 'Введите название города';
    showElement(cityError);
    return;
  }

  const normalizedName = cityName.toLowerCase();

  // Проверка дубликатов
  if (addedCities.includes(normalizedName) || (currentLocation && currentLocation.name.toLowerCase() === normalizedName)) {
    cityError.textContent = 'Город уже добавлен';
    showElement(cityError);
    return;
  }

  hideElement(cityError);

  try {
    const data = await getForecast(cityName);

    const fullName = `${data.location.name}, ${data.location.country}`;

    // Если основной локации ещё нет — делаем этот город основным
    if (!currentLocation) {
      currentLocation = { name: data.location.name, country: data.location.country };
      locationTitle.textContent = fullName;
      showElement(locationSection);
      showElement(document.getElementById('forecast'));
      renderForecastTo(forecastContainer, data.forecast.forecastday);
    } else {
      // Иначе — добавляем как дополнительный
      addedCities.push(normalizedName);

      const li = document.createElement('li');
      li.classList.add('city-block');

      const title = createElement('h4', fullName);
      const forecastDiv = document.createElement('div');
      forecastDiv.classList.add('forecast-list');

      renderForecastTo(forecastDiv, data.forecast.forecastday);

      li.append(title, forecastDiv);
      citiesList.appendChild(li);
    }

    cityInput.value = '';
    hideElement(suggestionsList);

  } catch (err) {
    cityError.textContent = 'Город не найден';
    showElement(cityError);
  }
}

/* Автодополнение (выпадающий список) */

let debounceTimer;

cityInput.addEventListener('input', () => {
  clearTimeout(debounceTimer);
  const query = cityInput.value.trim();

  // Очищаем старые подсказки
  suggestionsList.innerHTML = '';
  hideElement(suggestionsList);

  if (query.length < 2) return;

  debounceTimer = setTimeout(async () => {
    try {
      const results = await searchCity(query);
      if (results.length === 0) return;

      results.slice(0, 5).forEach(item => {
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

      showElement(suggestionsList);
    } catch (err) {
      // Тихо игнорируем ошибки поиска
    }
  }, 300);
});

// Клик вне списка — скрыть
document.addEventListener('click', (e) => {
  if (!cityForm.contains(e.target)) {
    hideElement(suggestionsList);
  }
});

// Обработка submit формы
cityForm.addEventListener('submit', (e) => {
  e.preventDefault();
  addCity(cityInput.value.trim());
});