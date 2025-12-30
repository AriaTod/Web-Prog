'use strict';

document.addEventListener('DOMContentLoaded', function () {
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

        // Добавляем основную локацию
        addCity(data.location.name, true); // true = основной город

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
