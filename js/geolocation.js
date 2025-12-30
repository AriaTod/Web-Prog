'use strict';

/**
 * Запрос геолокации пользователя
 * @param {Function} onSuccess
 * @param {Function} onError
 */
function requestGeolocation(onSuccess, onError) {
  if (!navigator.geolocation) {
    onError('Геолокация не поддерживается браузером');
    return;
  }

  navigator.geolocation.getCurrentPosition(
    function (position) {
      onSuccess(position.coords);
    },
    function () {
      onError('Доступ к геолокации отклонён пользователем');
    }
  );
}
