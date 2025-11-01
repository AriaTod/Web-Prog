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
let draggedTaskId = null; // id перетаскиваемой задачи

// Генерация уникального ID
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// ====================
// LOCALSTORAGE
// ====================

function saveTasks() {
  localStorage.setItem("todoTasks", JSON.stringify(tasks));
}

function loadTasks() {
  const saved = localStorage.getItem("todoTasks");
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      tasks = parsed.map(task => ({
        id: task.id || generateId(),
        title: task.title || "",
        date: task.date || null,
        completed: !!task.completed
      }));
    } catch (e) {
      console.error("Ошибка загрузки задач из localStorage:", e);
      tasks = [];
    }
  }
}

// ====================
// УНИВЕРСАЛЬНАЯ ФУНКЦИЯ РЕНДЕРА
// ====================

function renderTasks(displayTasks = tasks) {
  taskList.innerHTML = "";
  draggedTaskId = null; // сброс при перерисовке

  displayTasks.forEach(task => {
    const li = document.createElement("li");
    li.className = "task-item";
    li.draggable = true;
    if (task.completed) li.classList.add("completed");

    const textSpan = document.createElement("span");
    textSpan.textContent = task.title;
    textSpan.className = "task-title";

    const dateSpan = document.createElement("span");
    dateSpan.textContent = task.date || "Без даты";
    dateSpan.className = "task-date-display";

    // Кнопка удаления
    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Удалить";
    deleteBtn.className = "delete-btn";
    deleteBtn.addEventListener("click", () => {
      tasks = tasks.filter(t => t.id !== task.id);
      saveTasks();
      renderTasks();
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
        task.date = newDate.trim() || null;
      }
      saveTasks();
      renderTasks();
    });

    // Кнопка выполнения
    const toggleBtn = document.createElement("button");
    toggleBtn.textContent = task.completed ? "Снять отметку" : "Выполнено";
    toggleBtn.className = "toggle-btn";
    toggleBtn.addEventListener("click", () => {
      task.completed = !task.completed;
      saveTasks();
      renderTasks();
    });

    // ====================
    // DRAG-AND-DROP
    // ====================
    li.addEventListener("dragstart", (e) => {
      draggedTaskId = task.id;
      li.classList.add("dragging");
      e.dataTransfer.effectAllowed = "move";
    });

    li.addEventListener("dragover", (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
      li.classList.add("drag-over");
    });

    li.addEventListener("dragleave", () => {
      li.classList.remove("drag-over");
    });

    li.addEventListener("drop", (e) => {
      e.preventDefault();
      li.classList.remove("drag-over");

      if (!draggedTaskId || draggedTaskId === task.id) return;

      const draggedTask = tasks.find(t => t.id === draggedTaskId);
      const targetIndex = tasks.findIndex(t => t.id === task.id);

      // Удаляем из старого места
      tasks = tasks.filter(t => t.id !== draggedTaskId);
      // Вставляем в новое
      tasks.splice(targetIndex, 0, draggedTask);

      saveTasks();
      renderTasks();
    });

    li.addEventListener("dragend", () => {
      li.classList.remove("dragging");
      document.querySelectorAll(".drag-over").forEach(el => el.classList.remove("drag-over"));
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
    id: generateId(),
    title,
    date: date || null,
    completed: false
  });

  inputTitle.value = "";
  inputDate.value = "";

  saveTasks();
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

loadTasks(); // загрузка из LocalStorage
renderTasks(); // отображение
console.log("Приложение полностью готово к работе! Drag & Drop включён!");