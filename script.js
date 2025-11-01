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

// ====================
// ЛОГИКА ДОБАВЛЕНИЯ И УПРАВЛЕНИЯ ЗАДАЧАМИ
// ====================

// Массив для хранения задач (пока в памяти)
let tasks = [];

// Функция отрисовки задач на странице
function renderTasks() {
  // Очищаем текущий список
  taskList.innerHTML = "";

  // Перебираем все задачи и создаём элементы
  tasks.forEach((task, index) => {
    const li = document.createElement("li");
    li.className = "task-item";
    if (task.completed) li.classList.add("completed");

    // Текст задачи
    const textSpan = document.createElement("span");
    textSpan.textContent = task.title;
    textSpan.className = "task-title";

    // Дата задачи
    const dateSpan = document.createElement("span");
    dateSpan.textContent = task.date || "Без даты";
    dateSpan.className = "task-date-display";

    // Кнопка "удалить"
    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Удалить";
    deleteBtn.className = "delete-btn";
    deleteBtn.addEventListener("click", () => {
      tasks.splice(index, 1); // удаляем из массива
      renderTasks(); // перерисовываем список
    });

    // Кнопка "редактировать"
    const editBtn = document.createElement("button");
    editBtn.textContent = "Редактировать";
    editBtn.className = "edit-btn";
    editBtn.addEventListener("click", () => {
      const newTitle = prompt("Редактировать задачу:", task.title);
      if (newTitle !== null && newTitle.trim() !== "") {
        task.title = newTitle.trim();
      }
      const newDate = prompt("Редактировать дату (YYYY-MM-DD):", task.date || "");
      if (newDate !== null) {
        task.date = newDate;
      }
      renderTasks();
    });

    // Кнопка "выполнено/не выполнено"
    const toggleBtn = document.createElement("button");
    toggleBtn.textContent = task.completed ? "Снять отметку" : "Выполнено";
    toggleBtn.className = "toggle-btn";
    toggleBtn.addEventListener("click", () => {
      task.completed = !task.completed;
      renderTasks();
    });

    // Собираем элементы в li
    li.append(textSpan, dateSpan, editBtn, deleteBtn, toggleBtn);
    taskList.appendChild(li);
  });
}

// ====================
// СОБЫТИЕ ДОБАВЛЕНИЯ ЗАДАЧИ
// ====================
form.addEventListener("submit", (e) => {
  e.preventDefault(); // предотвращаем перезагрузку страницы
  const title = inputTitle.value.trim();
  const date = inputDate.value;

  if (title === "") {
    alert("Пожалуйста, введите название задачи!");
    return;
  }

  // Добавляем задачу в массив
  tasks.push({
    title: title,
    date: date || null,
    completed: false
  });

  // Очищаем поля формы
  inputTitle.value = "";
  inputDate.value = "";

  // Перерисовываем список
  renderTasks();
});

// ====================
// ИНИЦИАЛИЗАЦИЯ ПРИЛОЖЕНИЯ
// ====================
renderTasks(); // Отображаем пустой список при загрузке
console.log("Логика добавления, удаления, редактирования и отметки задач подключена!");
console.log("Приложение полностью готово к работе!");