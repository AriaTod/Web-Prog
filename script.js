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
inputDate.type = "text";
inputDate.placeholder = "ДД.ММ.ГГГГ";
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

// ====================
// ЛОГИКА ДОБАВЛЕНИЯ И УПРАВЛЕНИЯ ЗАДАЧАМИ
// ====================

let tasks = [];
let draggedTaskId = null;

// Генерация уникального ID
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// ====================
// ВАЛИДАЦИЯ ДАТЫ (ДД.ММ.ГГГГ)
// ====================
function isValidDisplayDate(dateStr) {
  if (!dateStr) return true; // пусто — разрешено
  const regex = /^(\d{1,2})\.(\d{1,2})\.(\d{4})$/;
  if (!regex.test(dateStr)) return false;

  const [, day, month, year] = dateStr.match(regex);
  const d = parseInt(day, 10);
  const m = parseInt(month, 10);
  const y = parseInt(year, 10);

  if (m < 1 || m > 12) return false;
  if (d < 1 || d > 31) return false;

  const date = new Date(y, m - 1, d);
  return date.getFullYear() === y && date.getMonth() === m - 1 && date.getDate() === d;
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
// РЕДАКТИРОВАНИЕ ЗАДАЧИ (contentEditable вместо prompt)
// ====================
function editTask(task) {
  const taskLi = [...taskList.children].find(li => li.querySelector(".task-title").textContent === task.title);
  if (!taskLi) return;

  const titleSpan = taskLi.querySelector(".task-title");
  titleSpan.contentEditable = true;
  titleSpan.focus();

  const dateSpan = taskLi.querySelector(".task-date-display");
  dateSpan.contentEditable = true;

  titleSpan.addEventListener("blur", () => {
    const trimmedTitle = titleSpan.textContent.trim();
    if (trimmedTitle !== "") task.title = trimmedTitle;
    titleSpan.contentEditable = false;
    saveTasks();
    renderTasks();
  });

  dateSpan.addEventListener("blur", () => {
    const trimmedDate = dateSpan.textContent.trim();
    if (trimmedDate === "" || isValidDisplayDate(trimmedDate)) {
      task.date = trimmedDate || null;
    }
    dateSpan.contentEditable = false;
    saveTasks();
    renderTasks();
  });
}

// ====================
// УНИВЕРСАЛЬНАЯ ФУНКЦИЯ РЕНДЕРА
// ====================
function renderTasks(displayTasks = tasks) {
  while (taskList.firstChild) {
    taskList.removeChild(taskList.firstChild);
  }
  draggedTaskId = null;

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
    editBtn.addEventListener("click", () => editTask(task));

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

      tasks = tasks.filter(t => t.id !== draggedTaskId);
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
  const dateInput = inputDate.value.trim();

  if (title === "") return;
  if (dateInput !== "" && !isValidDisplayDate(dateInput)) return;

  tasks.push({
    id: generateId(),
    title,
    date: dateInput || null,
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

  if (filter === "Выполненные") filtered = filtered.filter(t => t.completed);
  else if (filter === "Невыполненные") filtered = filtered.filter(t => !t.completed);

  renderTasks(filtered);
});

sortButton.addEventListener("click", () => {
  const sorted = [...tasks].sort((a, b) => {
    if (!a.date) return 1;
    if (!b.date) return -1;
    const [da, ma, ya] = a.date.split(".");
    const [db, mb, yb] = b.date.split(".");
    return new Date(ya, ma - 1, da) - new Date(yb, mb - 1, db);
  });
  renderTasks(sorted);
});

searchInput.addEventListener("input", () => {
  const query = searchInput.value.trim().toLowerCase();
  const searched = tasks.filter(t => t.title.toLowerCase().includes(query));
  renderTasks(searched);
});

// ====================
// ИНИЦИАЛИЗАЦИЯ ПРИЛОЖЕНИЯ
// ====================
loadTasks(); // загрузка из LocalStorage
renderTasks(); // отображение
