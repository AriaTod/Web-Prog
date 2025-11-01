// Проверка подключения
console.log("Скрипт подключен и работает!");

// ====================
// СОЗДАНИЕ ОСНОВНОЙ СТРУКТУРЫ
// ====================

const app = document.createElement("div");
app.className = "app-container";
document.body.appendChild(app);

const header = document.createElement("header");
const title = document.createElement("h1");
title.textContent = "Мой ToDo-лист";
header.appendChild(title);
app.appendChild(header);

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

const inputTitle = document.createElement("input");
inputTitle.type = "text";
inputTitle.placeholder = "Введите задачу...";
inputTitle.className = "task-input";
inputTitle.required = true;

// Исправлено: класс для inputDate
const inputDate = document.createElement("input");
inputDate.type = "date";
inputDate.className = "task-date";

const addButton = document.createElement("button");
addButton.type = "submit";
addButton.textContent = "Добавить";
addButton.className = "add-btn";

form.append(inputTitle, inputDate, addButton);
formSection.appendChild(form);
main.appendChild(formSection);

// --------------------
// ПАНЕЛЬ ФИЛЬТРОВ И ПОИСК
// --------------------
const controlPanel = document.createElement("section");
controlPanel.className = "control-panel";

const filterSelect = document.createElement("select");
filterSelect.className = "filter-select";
["Все задачи", "Выполненные", "Невыполненные"].forEach(text => {
  const opt = document.createElement("option");
  opt.textContent = text;
  filterSelect.appendChild(opt);
});

const sortButton = document.createElement("button");
sortButton.textContent = "Сортировать по дате";
sortButton.className = "sort-btn";

const searchInput = document.createElement("input");
searchInput.type = "text";
searchInput.placeholder = "Поиск по названию...";
searchInput.className = "search-input";

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

console.log("Структура страницы успешно создана!");

// ====================
// ЛОГИКА ДОБАВЛЕНИЯ И УПРАВЛЕНИЯ ЗАДАЧАМИ
// ====================

let tasks = [];

// Универсальная функция рендера
function renderTasks(displayTasks = tasks) {
  taskList.innerHTML = "";

  displayTasks.forEach((task, indexInDisplay) => {
    const originalIndex = tasks.indexOf(task);

    const li = document.createElement("li");
    li.className = "task-item";
    if (task.completed) li.classList.add("completed");

    const textSpan = document.createElement("span");
    textSpan.textContent = task.title;
    textSpan.className = "task-title";

    // Исправлено: dateSpan.textContent
    const dateSpan = document.createElement("span");
    dateSpan.textContent = task.date || "Без даты";
    dateSpan.className = "task-date-display";

    // Кнопка удаления
    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Удалить";
    deleteBtn.className = "delete-btn";
    deleteBtn.addEventListener("click", () => {
      tasks.splice(originalIndex, 1);
      renderTasks(); // Перерендер с учётом текущего фильтра
    });

    // Кнопка редактирования
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
        task.date = newDate.trim(); // + добавлен trim()
      }
      renderTasks();
    });

    // Кнопка выполнения
    const toggleBtn = document.createElement("button");
    toggleBtn.textContent = task.completed ? "Снять отметку" : "Выполнено";
    toggleBtn.className = "toggle-btn";
    toggleBtn.addEventListener("click", () => {
      task.completed = !task.completed;
      renderTasks();
    });

    li.append(textSpan, dateSpan, editBtn, deleteBtn, toggleBtn);
    taskList.appendChild(li);
  });
}

// ====================
// СОБЫТИЕ ДОБАВЛЕНИЯ ЗАДАЧИ
// ====================
form.addEventListener("submit", (e) => {
  e.preventDefault();
  const title = inputTitle.value.trim();
  const date = inputDate.value;

  if (title === "") {
    alert("Пожалуйста, введите название задачи!");
    return;
  }

  tasks.push({
    title,
    date: date || null,
    completed: false
  });

  inputTitle.value = "";
  inputDate.value = "";
  renderTasks();
});

// ====================
// ФИЛЬТРАЦИЯ, СОРТИРОВКА И ПОИСК
// ====================

filterSelect.addEventListener("change", () => {
  const filter = filterSelect.value;
  let filtered = [...tasks];

  if (filter === "Выполненные") {
    filtered = filtered.filter(t => t.completed);
  } else if (filter === "Невыполненные") {
    filtered = filtered.filter(t => !t.completed);
  }
  renderTasks(filtered);
});

sortButton.addEventListener("click", () => {
  const sorted = [...tasks].sort((a, b) => {
    if (!a.date) return 1;
    if (!b.date) return -1;
    return new Date(a.date) - new Date(b.date);
  });
  renderTasks(sorted);
});

searchInput.addEventListener("input", () => {
  const query = searchInput.value.trim().toLowerCase();
  const searched = tasks.filter(t => t.title.toLowerCase().includes(query));
  renderTasks(searched);
});

console.log("Фильтрация, сортировка и поиск подключены!");

// ====================
// ИНИЦИАЛИЗАЦИЯ ПРИЛОЖЕНИЯ
// ====================
renderTasks();
console.log("Приложение полностью готово к работе!");