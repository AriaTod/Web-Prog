'use strict';

document.addEventListener('DOMContentLoaded', function () {
  const locationSection = document.getElementById('current-location');
  const cityFormSection = document.getElementById('city-form-section');
  const loadingElement = document.getElementById('loading');
  const errorElement = document.getElementById('error');

  showElement(loadingElement);

  requestGeolocation(
    function () {
      hideElement(loadingElement);
      hideElement(errorElement);

      showElement(locationSection);
      hideElement(cityFormSection);
    },
    function (errorMessage) {
      hideElement(loadingElement);

      errorElement.textContent = errorMessage;
      showElement(errorElement);

      hideElement(locationSection);
      showElement(cityFormSection);
    }
  );
});
