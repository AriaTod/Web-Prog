'use strict';

document.addEventListener('DOMContentLoaded', function () {
  const locationSection = document.getElementById('current-location');
  const locationTitle = locationSection.querySelector('h2');
  const forecastSection = document.getElementById('forecast');
  const loadingElement = document.getElementById('loading');
  const errorElement = document.getElementById('error');
  const cityFormSection = document.getElementById('city-form-section');

  showElement(cityFormSection);
  showElement(loadingElement);

  requestGeolocation(
    async function (coords) {
      try {
        const query = `${coords.latitude},${coords.longitude}`;
        const data = await getForecast(query);

        hideElement(loadingElement);
        hideElement(errorElement);

        showElement(locationSection);
        showElement(forecastSection);

        // Передаем текущий город в cities.js как основной
        addCity(data.location.name);
      } catch (err) {
        hideElement(loadingElement);
        errorElement.textContent = 'Не удалось загрузить данные о погоде по вашему местоположению';
        showElement(errorElement);
        console.error('Ошибка при запросе погоды:', err);
      }
    },
    function (geoErrorMessage) {
      hideElement(loadingElement);
      errorElement.textContent = geoErrorMessage;
      showElement(errorElement);
      console.log('Геолокация отклонена — ожидание ввода города через форму');
    }
  );
});
