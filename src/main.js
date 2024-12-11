$(document).ready(function () {
  function loadTasks() {
    const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    tasks.sort((a, b) => sortByPriorityAndDate(a, b)); // Sort by priority and date
    $("#task-list").empty(); // Clear current list
    tasks.forEach((task, index) => displayTask(task, index));
  }

  function saveTasks(tasks) {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }

  function renderTasks(filteredTasks) {
    $("#task-list").empty(); // Clear existing tasks
    filteredTasks.forEach((task, index) => displayTask(task, index));
  }

  function filterTasks() {
    const selectedPriority = $("#priorityFilter").val();
    const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    let filteredTasks = tasks;

    if (selectedPriority !== "all") {
      filteredTasks = tasks.filter(task => task.priority === selectedPriority);
    }

    // Sort tasks by priority and date
    filteredTasks.sort((a, b) => sortByPriorityAndDate(a, b));

    renderTasks(filteredTasks);
  }

  function sortByPriorityAndDate(a, b) {
    const priorityOrder = { high: 1, medium: 2, low: 3 };
    const dateDifference = new Date(a.date) - new Date(b.date); // Sort by date first
    if (dateDifference !== 0) return dateDifference;
    return priorityOrder[a.priority] - priorityOrder[b.priority]; // Then by priority
  }
  

  function displayTask(task, index) {
    const taskDiv = $(`
      <div class="task" data-index="${index}">
        <div class="task-header">
          <span><strong>${task.title}</strong></span>
          <div>
            <button class="edit-task">Edit</button>
            <button class="remove-task">Remove</button>
          </div>
        </div>
        <div class="task-details">${task.details}</div>
        <div class="task-details">${task.date}</div>
        <div class="task-details">${task.priority}</div>
      </div>
    `);

    taskDiv.find(".edit-task").on("click", () => editTask(index));
    taskDiv.find(".remove-task").on("click", () => removeTask(index));

    $("#task-list").append(taskDiv);
  }

  $("#priorityFilter").on("change", filterTasks);

  // Add task
  $("#add-task").on("click", function () {
    const title = $("#task-title").val().trim();
    const details = $("#task-details").val().trim();
    const date = $("#Date").val();
    const priority = $("#priority").val();

    if (!title || !details || !date || !priority) {
      $("#error-message").text("All fields are required!").show();
      return;
    }

    const today = new Date().setHours(0, 0, 0, 0);
    const selectedDate = new Date(date).setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      $("#error-message").text("Cannot add tasks for past dates!").show();
      return;
    }

    $("#error-message").hide(); // Hide error message on successful validation

    const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    tasks.push({ title, details, date, priority });
    saveTasks(tasks);
    loadTasks();

    // Clear input fields
    $("#task-title").val("");
    $("#task-details").val("");
    $("#Date").val("");
    $("#priority").val("");
  });

  // Edit task
  function editTask(index) {
    const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    const task = tasks[index];

    const newTitle = prompt("Edit task title:", task.title);
    const newDetails = prompt("Edit task details:", task.details);

    if (newTitle !== null && newTitle.trim() !== "") {
      task.title = newTitle.trim();
    }
    if (newDetails !== null && newDetails.trim() !== "") {
      task.details = newDetails.trim();
    }

    tasks[index] = task;
    saveTasks(tasks);
    loadTasks();
  }

  // Remove task
  function removeTask(index) {
    const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    tasks.splice(index, 1);
    saveTasks(tasks);
    loadTasks();
  }

  loadTasks();
});
