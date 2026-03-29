const API_KEY = '007a14919c874f55848180505253012';
const BASE_URL = 'https://api.weatherapi.com/v1';

/**
 * Универсальная функция для запросов к WeatherAPI
 */
async function request(endpoint, params = {}) {
  const url = new URL(`${BASE_URL}/${endpoint}.json`); // добавил .json, как требует WeatherAPI

  url.searchParams.set('key', API_KEY);

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      url.searchParams.set(key, value);
    }
  });

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Ошибка HTTP: ${response.status}`);
  }

  return response.json();
}

/**
 * Получение прогноза погоды на 3 дня
 * @param {string} query - город или координаты "lat,lon"
 */
async function getForecast(query) {
  return request('forecast', {
    q: query,
    days: 3,
    lang: 'ru'
  });
}

/**
 * Поиск города по названию (для подсказок)
 * @param {string} city
 */
async function searchCity(city) {
  return request('search', {
    q: city
  });
}

// Функции доступны глобально
window.getForecast = getForecast;
window.searchCity = searchCity;