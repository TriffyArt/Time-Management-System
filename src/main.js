window.addEventListener('load', () => {
  const personalisation = document.querySelector('#switch');
  let day;

  // Get the current day
  switch (new Date().getDay()) {
    case 0: day = "Sunday"; break;
    case 1: day = "Monday"; break;
    case 2: day = "Tuesday"; break;
    case 3: day = "Wednesday"; break;
    case 4: day = "Thursday"; break;
    case 5: day = "Friday"; break;
    case 6: day = "Saturday"; break;
  }

  personalisation.innerHTML = "Magandang " + day + " Sayo!";

  const form = document.querySelector('#task-form');
  const input = document.querySelector('#task-input');
  const list_el = document.querySelector('#tasks');
  const dailyChartCtx = document.getElementById('daily-summary-chart').getContext('2d');
  const weeklyChartCtx = document.getElementById('weekly-summary-chart').getContext('2d');

  let tasksFromStorage = JSON.parse(localStorage.getItem('tasks')) || [];
  let taskTimes = JSON.parse(localStorage.getItem('taskTimes')) || {}; // To track task times

  // Initialize Chart.js charts
  const dailyChart = new Chart(dailyChartCtx, {
    type: 'bar',
    data: {
      labels: [], // Task names
      datasets: [{
        label: 'Time Spent (hrs)',
        data: [], // Time spent (in hours)
        backgroundColor: 'rgba(255, 124, 47, 0.5)',
        borderColor: 'rgba(255, 124, 47, 1)',
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true,
        }
      }
    }
  });

  const weeklyChart = new Chart(weeklyChartCtx, {
    type: 'line',
    data: {
      labels: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'], // Days of the week
      datasets: [{
        label: 'Time Spent (hrs)',
        data: [], // Weekly time data
        backgroundColor: 'rgba(255, 124, 47, 0.5)',
        borderColor: 'rgba(255, 124, 47, 1)',
        fill: false,
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true,
        }
      }
    }
  });

  // Load saved tasks and times
  tasksFromStorage.forEach(task => {
    createTask(task.name, task.time);
  });

  // Handle form submission
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const task = capitalise(input.value);
    if (!task) {
      alert("Please add a task");
      return;
    }

    createTask(task, "00:00:00");

    tasksFromStorage.push({ name: task, time: "00:00:00" });
    localStorage.setItem('tasks', JSON.stringify(tasksFromStorage));

    // Initialize daily and weekly data for the new task
    taskTimes[task] = { daily: {}, weekly: {} };
    localStorage.setItem('taskTimes', JSON.stringify(taskTimes));

    input.value = "";
  });

  // Capitalize task name
  function capitalise(str) {
    return str[0].toUpperCase() + str.slice(1);
  }

  // Create a task element
  function createTask(task, time) {
    const task_el = document.createElement('div');
    task_el.classList.add('task');
    list_el.appendChild(task_el);

    const content_el = document.createElement('div');
    content_el.classList.add('content');
    task_el.appendChild(content_el);

    const input_el = document.createElement('input');
    input_el.classList.add('text');
    input_el.type = 'text';
    input_el.value = task;
    input_el.setAttribute('readonly', 'readonly');
    content_el.appendChild(input_el);

    const counter_el = document.createElement('div');
    counter_el.classList.add('counter');
    task_el.appendChild(counter_el);

    const time_el = document.createElement('div');
    time_el.classList.add('time');
    time_el.innerText = time;
    counter_el.appendChild(time_el);

    const controls_el = document.createElement('div');
    controls_el.classList.add('controls');
    counter_el.appendChild(controls_el);

    const start_btn = document.createElement('button');
    start_btn.classList.add('start');
    start_btn.innerText = "Start";

    const stop_btn = document.createElement('button');
    stop_btn.classList.add('stop');
    stop_btn.innerText = "Stop";

    const reset_btn = document.createElement('button');
    reset_btn.classList.add('reset');
    reset_btn.innerText = "Reset";

    controls_el.appendChild(start_btn);
    controls_el.appendChild(stop_btn);
    controls_el.appendChild(reset_btn);

    const actions_el = document.createElement('div');
    actions_el.classList.add('actions');
    task_el.appendChild(actions_el);

    const edit_btn = document.createElement('button');
    edit_btn.classList.add('edit');
    edit_btn.innerText = "Edit Task";

    const delete_btn = document.createElement('button');
    delete_btn.classList.add('delete');
    delete_btn.innerText = "Delete Task";

    actions_el.appendChild(edit_btn);
    actions_el.appendChild(delete_btn);

    let seconds = 0;
    let interval = null;

    start_btn.addEventListener('click', start);
    stop_btn.addEventListener('click', stop);
    reset_btn.addEventListener('click', reset);

    // Timer function to update task time
    function timer() {
      seconds++;
      let hrs = Math.floor(seconds / 3600);
      let mins = Math.floor((seconds - (hrs * 3600)) / 60);
      let secs = seconds % 60;
      if (secs < 10) secs = '0' + secs;
      if (mins < 10) mins = '0' + mins;
      if (hrs < 10) hrs = '0' + hrs;
      time_el.innerText = `${hrs}:${mins}:${secs}`;
    }

    // Start timer
    function start() {
      if (interval) {
        return;
      }
      interval = setInterval(timer, 1000);
    }

    // Stop timer and save time
    function stop() {
      clearInterval(interval);
      interval = null;

      // Save the time spent for the task
      const timeSpent = seconds / 3600; // convert to hours
      const taskName = input_el.value;
      taskTimes[taskName].daily[day] = timeSpent;
      taskTimes[taskName].weekly[day] = timeSpent;
      localStorage.setItem('taskTimes', JSON.stringify(taskTimes));

      // Update the daily and weekly charts
      updateDailyChart();
      updateWeeklyChart();
    }

    // Reset timer
    function reset() {
      stop();
      seconds = 0;
      time_el.innerText = "00:00:00";
    }

    // Edit task
    edit_btn.addEventListener('click', () => {
      if (edit_btn.innerText.toLowerCase() == 'edit task') {
        input_el.removeAttribute('readonly');
        input_el.focus();
        edit_btn.innerText = "Save";
      } else {
        input_el.setAttribute('readonly', 'readonly');
        edit_btn.innerText = "Edit Task";

        const taskIndex = tasksFromStorage.findIndex(task => task.name === input_el.value);
        tasksFromStorage[taskIndex].name = input_el.value;
        localStorage.setItem('tasks', JSON.stringify(tasksFromStorage));
      }
    });

    // Delete task
    delete_btn.addEventListener('click', () => {
      list_el.removeChild(task_el);

      const taskIndex = tasksFromStorage.findIndex(task => task.name === input_el.value);
      tasksFromStorage.splice(taskIndex, 1);
      localStorage.setItem('tasks', JSON.stringify(tasksFromStorage));

      delete taskTimes[input_el.value];
      localStorage.setItem('taskTimes', JSON.stringify(taskTimes));
    });
  }

  // Update daily chart with task data
  function updateDailyChart() {
    const taskNames = Object.keys(taskTimes);
    const timeData = taskNames.map(taskName => {
      return taskTimes[taskName].daily[day] || 0; // Get daily time for each task
    });

    dailyChart.data.labels = taskNames;
    dailyChart.data.datasets[0].data = timeData;
    dailyChart.update();
  }

  // Update weekly chart with task data
  function updateWeeklyChart() {
    const taskNames = Object.keys(taskTimes);
    const weeklyData = taskNames.map(taskName => {
      return Object.values(taskTimes[taskName].weekly).reduce((sum, time) => sum + time, 0);
    });

    weeklyChart.data.datasets[0].data = weeklyData;
    weeklyChart.update();
  }
});
