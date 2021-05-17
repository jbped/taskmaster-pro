var tasks = {};

var createTask = function(taskText, taskDate, taskList) {
  // create elements that make up a task item
  var taskLi = $("<li>").addClass("list-group-item");
  var taskSpan = $("<span>")
    .addClass("badge badge-primary badge-pill")
    .text(taskDate);
  var taskP = $("<p>")
    .addClass("m-1")
    .text(taskText);

  // append span and p element to parent li
  taskLi.append(taskSpan, taskP);


  // append to ul list on the page
  $("#list-" + taskList).append(taskLi);
};

var loadTasks = function() {
  tasks = JSON.parse(localStorage.getItem("tasks"));

  // if nothing in localStorage, create a new object to track all task status arrays
  if (!tasks) {
    tasks = {
      toDo: [],
      inProgress: [],
      inReview: [],
      done: []
    };
  }

  // loop over object properties
  $.each(tasks, function(list, arr) {
    // then loop over sub-array
    arr.forEach(function(task) {
      createTask(task.text, task.date, list);
    });
  });
};

var saveTasks = function() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
};

// Select element with .list-group, on click initiate function within p element
$(".list-group").on("click", "p", function() {
  // Assign text this (event.target)
  var text = $(this)
    // Get innerText
    .text()
    // remove whitespace
    .trim();
  // "textarea" selects those elements "<textarea>" creates the element
  var textInput = $("<textarea>")
    // Add class to new textarea element
    .addClass("form-control")
    // Assign HTML syntax value
    .val("text");
    console.log(text);
  // Replace p with passed through textInput
  $(this).replaceWith(textInput);
  // On click of this focus textInput (cursor has selected the input and user can now type into the textarea)
  textInput.trigger("focus");
});

$(".list-group").on("blur", "textarea", function(){
  // Get textareas current value
  var text = $(this)
  .val()
  .trim();

  // Get parent ul's id
  var status = $(this)
    .closest(".list-group")
    .attr("id")
    .replace("list-", "");

  // get the tasks's postion in the list of other li elements
  var index = $(this)
    .closest(".list-group-item")
    .index();
  
  tasks[status][index].text = text;
  saveTasks();

  // Create the p element
  var taskP = $("<p>")
  // Add appropriate class
  .addClass("m-1")
  // Set innerText to text from this
  .text(text);

  // Replace this with p element generated above. Replace does not clone, but moves the element
  $(this).replaceWith(taskP);
})

// due date was clicked
$(".list-group").on("click", "span", function() {
  // get current text
  var date = $(this)
  .text()
  .trim();

  // create new element for input
  var dateInput = $("<input>")
    // with two arguments it sets an attribute. the first is the attribute and the second is att value
    .attr("type", "text")
    .addClass("form-control")
    .val(date);
  
  // swap elements
  $(this).replaceWith(dateInput);

  // Focus element on click
  dateInput.trigger("focus");
});

// On blur update date
$(".list-group").on("blur", "input[type='text']", function() {
  // get current text
  var date = $(this)
    .val()
    .trim();

  // get the parent ul's id attribute
  var status = $(this)
  .closest(".list-group")
  .attr("id")
  .replace("list-","");

  // get the task's position in th elist of outher li elements
  var index = $(this)
    .closest(".list-group-item")
    .index();

  // update task in array an re-save to localstorage
  tasks[status][index].date = date;
  saveTasks();

  // recreate span element with bootstrap classes
  var taskSpan = $("<span>")
    .addClass("badge badge-primary badge-pill")
    .text(date);

  // replace input
  $(this).replaceWith(taskSpan);
});


// modal was triggered
$("#task-form-modal").on("show.bs.modal", function() {
  // clear values
  $("#modalTaskDescription, #modalDueDate").val("");
});

// modal is fully visible
$("#task-form-modal").on("shown.bs.modal", function() {
  // highlight textarea
  $("#modalTaskDescription").trigger("focus");
});

// save button in modal was clicked
$("#task-form-modal .btn-primary").click(function() {
  // get form values
  var taskText = $("#modalTaskDescription").val();
  var taskDate = $("#modalDueDate").val();

  if (taskText && taskDate) {
    createTask(taskText, taskDate, "toDo");

    // close modal
    $("#task-form-modal").modal("hide");

    // save in tasks array
    tasks.toDo.push({
      text: taskText,
      date: taskDate
    });
    saveTasks();
  }
});

// remove all tasks
$("#remove-tasks").on("click", function() {
  for (var key in tasks) {
    tasks[key].length = 0;
    $("#list-" + key).empty();
  }
  saveTasks();
});

// load tasks for the first time
loadTasks();


