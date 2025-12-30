'use strict';
document.addEventListener('DOMContentLoaded', function () {
  const loadingElement = document.getElementById('loading');
  const errorElement = document.getElementById('error');

  // Показываем форму добавления города
  showElement(document.getElementById('city-form-section'));

  // Загружаем сохранённые данные (единственный вызов!)
  loadFromLocalStorage();

  // Показываем индикатор загрузки только если нет сохранённой основной локации
  if (!localStorage.getItem('mainLocation')) {
    showElement(loadingElement);
  }

  // Геолокация — только если ещё нет основной локации
  if (!localStorage.getItem('mainLocation')) {
    requestGeolocation(
      async function (coords) {
        try {
          const query = `${coords.latitude},${coords.longitude}`;
          const data = await getForecast(query);
          hideElement(loadingElement);
          hideElement(errorElement);
          // Используем addCity, чтобы всё прошло через единую логику
          await addCity(data.location.name);
        } catch (err) {
          hideElement(loadingElement);
          errorElement.textContent = 'Ошибка при получении погоды по геолокации';
          showElement(errorElement);
          console.error('Ошибка:', err);
        }
      },
      function (geoErrorMessage) {
        hideElement(loadingElement);
        errorElement.textContent = geoErrorMessage;
        showElement(errorElement);
      }
    );
  }
});