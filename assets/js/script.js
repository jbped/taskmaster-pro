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

  // check due date
  auditTask(taskLi);

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

$("#modalDueDate").datepicker({
  minDate: 0
});


// move cards
$(".card .list-group").sortable({
  connectWith: $(".card .list-group"),
  scroll: false,
  tolerance: "pointer",
  helper: "clone",
  activate: function(event, ui) {
    console.log("activate", ui);
  },
  deactivate: function(event, ui) {
    console.log("deactivate", ui);
  },
  over: function(event) {
    console.log("over", event);
  },
  out: function(event) {
    console.log("out", event);
  },
  update: function() {

    var tempArr = [];

    $(this)
      .children()
        .each(function() {      
      // add task data to the temp array as an object
      tempArr.push({
        text: $(this)
        .find("p")
        .text()
        .trim(),
        date: $(this)
        .find("span")
        .text()
        .trim()
      });
    });

    // trim down list's ID to match object property
    var arrName = $(this)
      .attr("id")
      .replace("list-","");
    // update array on tasks object and save 
    tasks[arrName] = tempArr;
    saveTasks();

    console.log(tempArr)
  }
});

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
  dateInput.datepicker({
    minDate: 0,
    onClose: function() {
      // when calendar is closed, force a change event
      $(this).trigger("change");
    }
  });
  // automatically bring up the calendar
  dateInput.trigger("focus");
});

// On change update date
$(".list-group").on("change", "input[type='text']", function() {
  // get current text
  var date = $(this)
    .val()
    .trim();
    console.log("date this", this)

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

  // Pass task's li element into auditTask() to check new due date 
  auditTask($(taskSpan).closest("list-group-item"));
});

// delete cards
$("#trash").droppable({
  accept: ".card .list-group-item",
  tolerance: "touch",
  drop: function(event, ui) {
    console.log("drop");
    ui.draggable.remove();
  },
  over: function(event,ui) {
    console.log("over");
  },
  out: function(event, ui) {
    console.log("out");
  }
})

var auditTask = function(taskEl) {
  console.log(taskEl);
  var date = $(taskEl)
    .find("span")
    .text()
    .trim();

    // create moment object date in local format, and set the hour to 1700hrs
  var time = moment(date, "L").set("hour", 17);

  // remove old classes
  $(taskEl).removeClass("list-group-item-warning list-group-item-danger");

  // apply new class if task is near/over due date
  if(moment().isAfter(time)){
    $(taskEl).addClass("list-group-item-danger");
    // else if moment is greater than or equal to two days add warning class
  } else if (Math.abs(moment().diff(time, "days"))<= 2){
    $(taskEl).addClass("list-group-item-warning")
  }
};

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


