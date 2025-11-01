// Проверка подключения
console.log("Скрипт подключен и работает!");

// ====================
// СОЗДАНИЕ ОСНОВНОЙ СТРУКТУРЫ
// ====================

// Создаём главный контейнер
const app = document.createElement("div");
app.className = "app-container";
document.body.appendChild(app);

// Заголовок
const header = document.createElement("header");
const title = document.createElement("h1");
title.textContent = "Мой ToDo-лист";
header.appendChild(title);
app.appendChild(header);

// Основная часть
const main = document.createElement("main");
main.className = "main-content";
app.appendChild(main);

// --------------------
// ФОРМА ДОБАВЛЕНИЯ ЗАДАЧ
// --------------------
const formSection = document.createElement("section");
formSection.className = "form-section";

const form = document.createElement("form");
form.className = "task-form";

// Поле для названия задачи
const inputTitle = document.createElement("input");
inputTitle.type = "text";
inputTitle.placeholder = "Введите задачу...";
inputTitle.className = "task-input";
inputTitle.required = true;

// Поле для даты
const inputDate = document.createElement("input");
inputDate.type = "date";
inputDate.className = "task-date";

// Кнопка добавления
const addButton = document.createElement("button");
addButton.type = "submit";
addButton.textContent = "Добавить";
addButton.className = "add-btn";

// Добавляем элементы формы
form.append(inputTitle, inputDate, addButton);
formSection.appendChild(form);
main.appendChild(formSection);

// --------------------
// ПАНЕЛЬ ФИЛЬТРОВ И ПОИСК
// --------------------
const controlPanel = document.createElement("section");
controlPanel.className = "control-panel";

// Фильтр статуса
const filterSelect = document.createElement("select");
filterSelect.className = "filter-select";
["Все задачи", "Выполненные", "Невыполненные"].forEach(optionText => {
  const option = document.createElement("option");
  option.textContent = optionText;
  filterSelect.appendChild(option);
});

// Кнопки сортировки
const sortButton = document.createElement("button");
sortButton.textContent = "Сортировать по дате";
sortButton.className = "sort-btn";

// Поле поиска
const searchInput = document.createElement("input");
searchInput.type = "text";
searchInput.placeholder = "Поиск по названию...";
searchInput.className = "search-input";

// Добавляем элементы панели
controlPanel.append(filterSelect, sortButton, searchInput);
main.appendChild(controlPanel);

// --------------------
// СПИСОК ЗАДАЧ
// --------------------
const tasksSection = document.createElement("section");
tasksSection.className = "tasks-section";

const taskList = document.createElement("ul");
taskList.className = "task-list";
tasksSection.appendChild(taskList);

main.appendChild(tasksSection);

// --------------------
// ФУТЕР
// --------------------
const footer = document.createElement("footer");
footer.textContent = "© 2025 My ToDo App";
app.appendChild(footer);

// Проверка
console.log("Структура страницы успешно создана!");
