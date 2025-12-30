'use strict';

/**
 * Создание DOM-элемента с текстом и классами
 * @param {string} tag
 * @param {string} text
 * @param {string[]} classNames
 * @returns {HTMLElement}
 */
function createElement(tag, text = '', classNames = []) {
  const element = document.createElement(tag);

  if (text) {
    element.textContent = text;
  }

  if (classNames.length > 0) {
    classNames.forEach(className => {
      element.classList.add(className);
    });
  }

  return element;
}

/**
 * Показ элемента
 * @param {HTMLElement} element
 */
function showElement(element) {
  element.hidden = false;
}

/**
 * Скрытие элемента
 * @param {HTMLElement} element
 */
function hideElement(element) {
  element.hidden = true;
}
