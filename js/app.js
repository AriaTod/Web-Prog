'use strict';

document.addEventListener('DOMContentLoaded', function () {
  const locationSection = document.getElementById('current-location');
  const locationTitle = locationSection.querySelector('h2');
  const forecastSection = document.getElementById('forecast');
  const loadingElement = document.getElementById('loading');
  const errorElement = document.getElementById('error');
  const cityFormSection = document.getElementById('city-form-section');

  // Форма добавления города всегда видима — не скрываем её ни при каких условиях
  showElement(cityFormSection);

  // Показываем индикатор загрузки при старте
  showElement(loadingElement);

  // Запрашиваем геолокацию
  requestGeolocation(
    function (coords) {
      // Геолокация разрешена — загружаем прогноз по координатам как основную локацию
      locationTitle.textContent = 'Текущее местоположение';

      const query = `${coords.latitude},${coords.longitude}`;

      getForecast(query)
        .then(function (data) {
          hideElement(loadingElement);
          hideElement(errorElement);

          showElement(locationSection);
          showElement(forecastSection);

          // Отрисовываем прогноз для основной локации
          renderForecast(data.forecast.forecastday);

          // Обновляем заголовок на реальное название города
          if (data.location && data.location.name) {
            locationTitle.textContent = `${data.location.name}, ${data.location.country}`;
          }
        })
        .catch(function (err) {
          hideElement(loadingElement);
          errorElement.textContent = 'Не удалось загрузить данные о погоде по вашему местоположению';
          showElement(errorElement);
          console.error('Ошибка геолокации + API:', err);
        });
    },

    function (geoErrorMessage) {
      // Геолокация отклонена или недоступна
      hideElement(loadingElement);
      errorElement.textContent = geoErrorMessage;
      showElement(errorElement);

      // Форма уже видима — пользователь может ввести город вручную
      // Никаких дополнительных действий не требуется
      console.log('Геолокация отклонена — ожидание ввода города через форму');
    }
  );
});

/**
 * Отрисовка прогноза погоды на 3 дня в основной блок
 * @param {Array} forecastDays — массив из трёх объектов с данными за день
 */
function renderForecast(forecastDays) {
  const forecastList = document.querySelector('#forecast .forecast-list');

  // Очищаем предыдущий прогноз
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