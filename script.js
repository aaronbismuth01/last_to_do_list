const taskInput = document.getElementById("taskInput");
const dateInput = document.getElementById("dateInput");
const addBtn = document.getElementById("addBtn");
const taskList = document.getElementById("taskList");
const filterButtons = document.querySelectorAll("[data-filter]");
const sortBtn = document.getElementById("sortBtn");

let tasks = [];
let currentFilter = "all";


// ===================
// LocalStorage
// ===================

function saveTasks() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
}

function loadTasks() {
    const data = localStorage.getItem("tasks");
    return data ? JSON.parse(data) : [];
}


// ===================
// Render
// ===================

function renderTasks() {
    taskList.innerHTML = "";

    let filtered = tasks;

    if (currentFilter === "active") {
        filtered = tasks.filter(t => !t.completed);
    }

    if (currentFilter === "completed") {
        filtered = tasks.filter(t => t.completed);
    }

    filtered.forEach(task => {
        const li = document.createElement("li");
        if (task.completed) li.classList.add("completed");

        li.innerHTML = `
            <div class="task-info">
                <input type="text" value="${task.text}" data-id="${task.id}" class="editText">
                <input type="date" value="${task.dueDate}" data-id="${task.id}" class="editDate">
            </div>
            <div>
                <button data-id="${task.id}" class="completeBtn">V</button>
                <button data-id="${task.id}" class="deleteBtn">X</button>
            </div>
        `;

        taskList.appendChild(li);
    });
}


// ===================
// Add
// ===================

function addTask() {
    const text = taskInput.value.trim();
    const date = dateInput.value;

    if (!text || !date) {
        alert("Texte et date obligatoires !");
        return;
    }

    tasks.push({
        id: Date.now(),
        text,
        dueDate: date,
        completed: false
    });

    saveTasks();
    renderTasks();

    taskInput.value = "";
    dateInput.value = "";
}


// ===================
// Edit
// ===================

function updateTask(id, field, value) {
    tasks = tasks.map(task => {
        if (task.id == id) {
            task[field] = value;
        }
        return task;
    });
    saveTasks();
}


// ===================
// Delete
// ===================

function deleteTask(id) {
    tasks = tasks.filter(task => task.id != id);
    saveTasks();
    renderTasks();
}


// ===================
// Complete
// ===================

function toggleComplete(id) {
    tasks = tasks.map(task => {
        if (task.id == id) {
            task.completed = !task.completed;
        }
        return task;
    });
    saveTasks();
    renderTasks();
}


// ===================
// Sort
// ===================

function sortTasks() {
    tasks.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
    saveTasks();
    renderTasks();
}


// ===================
// API
// ===================

async function fetchInitialTasks() {
    try {
        const response = await fetch("https://jsonplaceholder.typicode.com/todos?_limit=5");
        const data = await response.json();

        const today = new Date().toISOString().split("T")[0];

        tasks = data.map(todo => ({
            id: Date.now() + Math.random(),
            text: todo.title,
            dueDate: today,
            completed: todo.completed
        }));

        saveTasks();
        renderTasks();
    } catch (error) {
        console.error("Erreur API", error);
    }
}


// ===================
// Events
// ===================

addBtn.addEventListener("click", addTask);

taskList.addEventListener("click", e => {
    const id = e.target.dataset.id;

    if (e.target.classList.contains("deleteBtn")) {
        deleteTask(id);
    }

    if (e.target.classList.contains("completeBtn")) {
        toggleComplete(id);
    }
});

taskList.addEventListener("input", e => {
    const id = e.target.dataset.id;

    if (e.target.classList.contains("editText")) {
        updateTask(id, "text", e.target.value);
    }

    if (e.target.classList.contains("editDate")) {
        updateTask(id, "dueDate", e.target.value);
    }
});

filterButtons.forEach(btn => {
    btn.addEventListener("click", () => {
        currentFilter = btn.dataset.filter;
        renderTasks();
    });
});

sortBtn.addEventListener("click", sortTasks);


// ===================
// Init
// ===================

document.addEventListener("DOMContentLoaded", () => {
    tasks = loadTasks();

    if (tasks.length === 0) {
        fetchInitialTasks();
    } else {
        renderTasks();
    }
});