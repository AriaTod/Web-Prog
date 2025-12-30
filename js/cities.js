'use strict';

// Элементы DOM
const cityForm = document.getElementById('city-form');
const cityInput = document.getElementById('city-input');
const cityError = document.getElementById('city-error');
const suggestionsList = document.getElementById('city-suggestions');
const citiesList = document.getElementById('cities-cards'); // изменено на section для карточек

// Для основной локации
const mainLocationTitle = document.querySelector('#current-location h2');
const mainForecastContainer = document.querySelector('#forecast');

// Хранилища
let mainLocation = null; // основной город
const addedCities = new Set(); // для проверки дубликатов
const citiesData = []; // хранение всех добавленных городов с прогнозом

/**
 * Сохранение в localStorage
 */
function saveToLocalStorage() {
  const data = {
    mainLocation,
    citiesData
  };
  localStorage.setItem('weatherAppData', JSON.stringify(data));
}

/**
 * Восстановление из localStorage
 */
function loadFromLocalStorage() {
  const data = localStorage.getItem('weatherAppData');
  if (!data) return;

  const parsed = JSON.parse(data);

  if (parsed.mainLocation) {
    mainLocation = parsed.mainLocation;
    mainLocationTitle.textContent = `${mainLocation.name}, ${mainLocation.country}`;
    renderForecast(mainForecastContainer, mainLocation.forecast);
  }

  if (parsed.citiesData && parsed.citiesData.length > 0) {
    parsed.citiesData.forEach(city => {
      addedCities.add(city.name.toLowerCase());
      citiesData.push(city);
      createCityCard(city);
    });
  }
}

/**
 * Универсальная отрисовка прогноза на 3 дня
 */
function renderForecast(container, forecastDays) {
  container.innerHTML = '';

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
 * Создание карточки города
 */
function createCityCard(cityObj) {
  const card = document.createElement('div');
  card.classList.add('city-card');

  const header = document.createElement('h4');
  header.textContent = `${cityObj.name}, ${cityObj.country}`;

  const forecastDiv = document.createElement('div');
  forecastDiv.classList.add('forecast-list');
  renderForecast(forecastDiv, cityObj.forecast);

  // При клике — обновляем основную карточку
  card.addEventListener('click', () => {
    mainLocationTitle.textContent = `${cityObj.name}, ${cityObj.country}`;
    renderForecast(mainForecastContainer, cityObj.forecast);
  });

  card.append(header, forecastDiv);
  citiesList.appendChild(card);
}

/**
 * Добавление города
 */
async function addCity(cityName) {
  const trimmed = cityName.trim();
  if (!trimmed) {
    cityError.textContent = 'Введите название города';
    showElement(cityError);
    return;
  }

  const normalized = trimmed.toLowerCase();

  // Проверка дубликатов
  if (mainLocation && normalized === mainLocation.name.toLowerCase()) {
    cityError.textContent = 'Город уже добавлен как основная локация';
    showElement(cityError);
    return;
  }

  if (addedCities.has(normalized)) {
    cityError.textContent = 'Город уже добавлен';
    showElement(cityError);
    return;
  }

  hideElement(cityError);
  cityInput.disabled = true;

  try {
    const data = await getForecast(trimmed);
    const fullName = `${data.location.name}, ${data.location.country}`;
    const normalizedName = data.location.name.toLowerCase();

    if (!mainLocation) {
      // Основная локация
      mainLocation = {
        name: data.location.name,
        country: data.location.country,
        forecast: data.forecast.forecastday
      };
      mainLocationTitle.textContent = fullName;
      renderForecast(mainForecastContainer, mainLocation.forecast);
    } else {
      // Дополнительный город
      addedCities.add(normalizedName);
      const cityObj = {
        name: data.location.name,
        country: data.location.country,
        forecast: data.forecast.forecastday
      };
      citiesData.push(cityObj);

      createCityCard(cityObj);
    }

    saveToLocalStorage();
    cityInput.value = '';
    hideElement(suggestionsList);
  } catch (err) {
    cityError.textContent = 'Город не найден';
    showElement(cityError);
  } finally {
    cityInput.disabled = false;
    cityInput.focus();
  }
}

/* Автодополнение */
let debounceTimer;

cityInput.addEventListener('input', () => {
  clearTimeout(debounceTimer);
  const query = cityInput.value.trim();

  suggestionsList.innerHTML = '';
  hideElement(suggestionsList);

  if (query.length < 2) return;

  debounceTimer = setTimeout(async () => {
    try {
      const results = await searchCity(query);
      if (!results || results.length === 0) return;

      results.slice(0, 6).forEach(item => {
        const li = document.createElement('li');
        li.textContent = `${item.name}, ${item.country}`;
        li.style.cursor = 'pointer';
        li.addEventListener('click', () => {
          cityInput.value = `${item.name}, ${item.country}`; // передаем полное имя
          hideElement(suggestionsList);
          addCity(`${item.name}, ${item.country}`);
        });
        suggestionsList.appendChild(li);
      });

      showElement(suggestionsList);
    } catch (err) {
      console.error('Ошибка автодополнения:', err);
    }
  }, 300);
});

// Скрытие подсказок при клике вне
document.addEventListener('click', (e) => {
  if (!cityForm.contains(e.target)) {
    hideElement(suggestionsList);
  }
});

// Submit формы
cityForm.addEventListener('submit', (e) => {
  e.preventDefault();
  addCity(cityInput.value);
});

// Загружаем из localStorage при старте
loadFromLocalStorage();
