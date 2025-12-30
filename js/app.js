'use strict';

document.addEventListener('DOMContentLoaded', function () {
  const locationSection = document.getElementById('current-location');
  const locationTitle = locationSection.querySelector('h2'); // для изменения названия места
  const forecastSection = document.getElementById('forecast');
  const loadingElement = document.getElementById('loading');
  const errorElement = document.getElementById('error');
  const cityFormSection = document.getElementById('city-form-section');

  // Показываем загрузку при запуске приложения
  showElement(loadingElement);

  // Запрашиваем геолокацию у пользователя
  requestGeolocation(
    function (coords) {
      // Геолокация разрешена — скрываем форму ручного ввода
      hideElement(cityFormSection);

      // Устанавливаем заголовок
      locationTitle.textContent = 'Текущее местоположение';

      // Формируем строку запроса: lat,lon
      const query = `${coords.latitude},${coords.longitude}`;

      getForecast(query)
        .then(function (data) {
          hideElement(loadingElement);
          hideElement(errorElement);

          showElement(locationSection);
          showElement(forecastSection);

          // Отрисовываем прогноз на 3 дня
          renderForecast(data.forecast.forecastday);

          // Обновляем заголовок реальным названием города (если есть)
          if (data.location && data.location.name) {
            locationTitle.textContent = `${data.location.name}, ${data.location.country}`;
          }
        })
        .catch(function (err) {
          hideElement(loadingElement);
          errorElement.textContent = 'Не удалось загрузить данные о погоде';
          showElement(errorElement);
          console.error('Ошибка загрузки погоды:', err); // для отладки
        });
    },

    function (geoErrorMessage) {
      // Геолокация отклонена или недоступна
      hideElement(loadingElement);
      errorElement.textContent = geoErrorMessage;
      showElement(errorElement);

      // Показываем форму для ручного ввода города как основной локации
      showElement(cityFormSection);
    }
  );
});

/**
 * Отрисовка прогноза погоды на 3 дня
 * @param {Array} forecastDays — массив из трёх объектов с данными за день
 */
function renderForecast(forecastDays) {
  const forecastList = document.querySelector('.forecast-list');

  // Очищаем старый прогноз
  while (forecastList.firstChild) {
    forecastList.removeChild(forecastList.firstChild);
  }

  forecastDays.forEach(function (day, index) {
    const dayElement = document.createElement('div');
    dayElement.classList.add('forecast-day');

    const dateText =
      index === 0 ? 'Сегодня' : index === 1 ? 'Завтра' : 'Послезавтра';

    const date = createElement('p', dateText, ['date']);
    const temp = createElement(
      'p',
      `${Math.round(day.day.avgtemp_c)} °C`,
      ['temp']
    );
    const condition = createElement(
      'p',
      day.day.condition.text,
      ['condition']
    );

    dayElement.append(date, temp, condition);
    forecastList.appendChild(dayElement);
  });
}

/* ==================================================================
   Обработка формы добавления города (когда геолокация отклонена)
   ================================================================== */

const cityForm = document.getElementById('city-form');
const cityInput = document.getElementById('city-input');
const cityError = document.getElementById('city-error');

// Повторно получаем элементы, которые нужны в обработчике
const loadingElementGlobal = document.getElementById('loading');
const errorElementGlobal = document.getElementById('error');
const locationSectionGlobal = document.getElementById('current-location');
const locationTitleGlobal = locationSectionGlobal.querySelector('h2');
const forecastSectionGlobal = document.getElementById('forecast');
const cityFormSectionGlobal = document.getElementById('city-form-section');

if (cityForm) {
  cityForm.addEventListener('submit', function (event) {
    event.preventDefault(); // Останавливаем перезагрузку страницы

    const cityName = cityInput.value.trim();

    if (!cityName) {
      cityError.textContent = 'Введите название города';
      showElement(cityError);
      return;
    }

    // Скрываем предыдущие ошибки и показываем загрузку
    hideElement(cityError);
    showElement(loadingElementGlobal);

    // Запрашиваем погоду по названию города
    getForecast(cityName)
      .then(function (data) {
        hideElement(loadingElementGlobal);
        hideElement(errorElementGlobal);

        // Показываем блоки с погодой
        showElement(locationSectionGlobal);
        showElement(forecastSectionGlobal);

        // Скрываем форму (больше не нужна для текущей локации)
        hideElement(cityFormSectionGlobal);

        // Обновляем заголовок
        locationTitleGlobal.textContent = `${data.location.name}, ${data.location.country}`;

        // Отрисовываем прогноз
        renderForecast(data.forecast.forecastday);
      })
      .catch(function (err) {
        hideElement(loadingElementGlobal);
        cityError.textContent = 'Город не найден или ошибка сети';
        showElement(cityError);
        console.error('Ошибка при поиске города:', err);
      });

    // Очищаем поле ввода
    cityInput.value = '';
  });
}