'use strict';

// DOM
const cityForm = document.getElementById('city-form');
const cityInput = document.getElementById('city-input');
const cityError = document.getElementById('city-error');
const suggestionsList = document.getElementById('city-suggestions');
const citiesContainer = document.getElementById('cities-cards');

const mainLocationTitle = document.querySelector('#current-location h2');
const mainForecastContainer = document.querySelector('#forecast');

let mainLocation = null; // основной город
const addedCities = new Set();

/**
 * Отрисовка прогноза в любой контейнер
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
 * @param {string} cityName
 * @param {boolean} isMain
 */
async function addCity(cityName, isMain = false) {
  const trimmed = cityName.trim();
  if (!trimmed) {
    cityError.textContent = 'Введите название города';
    showElement(cityError);
    return;
  }

  const normalized = trimmed.toLowerCase();

  if (addedCities.has(normalized) || (mainLocation && mainLocation.normalized === normalized)) {
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

    if (isMain || !mainLocation) {
      mainLocation = {
        name: data.location.name,
        country: data.location.country,
        normalized: normalizedName,
        forecast: data.forecast.forecastday
      };

      mainLocationTitle.textContent = fullName;
      renderForecast(mainForecastContainer, mainLocation.forecast);
    } else {
      addedCities.add(normalizedName);

      const card = document.createElement('div');
      card.classList.add('city-card');

      const header = document.createElement('div');
      header.classList.add('added-city-header');

      const title = createElement('h4', fullName);
      const deleteBtn = createElement('button', 'Удалить');
      deleteBtn.classList.add('delete-city-btn');
      deleteBtn.onclick = () => {
        card.remove();
        addedCities.delete(normalizedName);
      };

      header.append(title, deleteBtn);

      const forecastDiv = document.createElement('div');
      forecastDiv.classList.add('forecast-list');
      renderForecast(forecastDiv, data.forecast.forecastday);

      card.append(header, forecastDiv);
      citiesContainer.appendChild(card);
    }

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
      if (!results.length) return;

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

      showElement(suggestionsList);
    } catch {}
  }, 300);
});

document.addEventListener('click', (e) => {
  if (!cityForm.contains(e.target)) hideElement(suggestionsList);
});

cityForm.addEventListener('submit', (e) => {
  e.preventDefault();
  addCity(cityInput.value);
});
