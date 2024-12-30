document.addEventListener("DOMContentLoaded", function () {
  const userName_Field = document.getElementById("userName");
  const profileButton = document.getElementById("profile");
  const reportButton = document.getElementById("report");
  const logoutButton = document.getElementById("logout");
  const chpasswdButton = document.getElementById("chpasswd");
  const activitiesButton = document.getElementById("activities");
  const mainContent = document.getElementById("content");
  const ham = document.getElementById("ham");

  let allTasksArray = [];

  function fetchActivities(row) {
    fetch("user.php?a=getActivities")
      .then((response) => response.json())
      .then((data) => {
        if (data.error) {
          return;
        }
        const activitySelect = document.querySelector(
          `select[name='activities[${row}][activity]']`
        );
        activitySelect.innerHTML =
          '<option value="">Select an activity</option>';
        data.forEach((item) => {
          const option = document.createElement("option");
          option.value = item.activity_id;
          option.textContent = item.activity_name;
          activitySelect.appendChild(option);
        });
      })
      .catch((error) => {
        console.error("Error fetching activities:", error);
      });
  }

  function updateTasksInput() {
    let tasksInput = document.querySelector('input[name="tasks[]"]');
    if (!tasksInput) {
      tasksInput = document.createElement("input");
      tasksInput.type = "hidden";
      tasksInput.name = "tasks[]";
      document.querySelector("form").appendChild(tasksInput);
    }
    tasksInput.value = JSON.stringify(allTasksArray);
  }

  document.addEventListener("change", function (event) {
    if (event.target.classList.contains("activity-select")) {
      const activityId = event.target.value;
      const row = event.target.closest("tr");
      const rowindex = row.id;
      fetchTasks(activityId, row, rowindex);
    }
  });

  function fetchTasks(activityId, row, rowIndex) {
    fetch(`user.php?a=getTasks&activity_id=${activityId}`)
      .then((response) => response.json())
      .then((data) => {
        const taskContainer = row.querySelector(".taskOptions");
        taskContainer.innerHTML = "";
        function notApplicable() {
          const NotapplicCheckbox = document.createElement("input");
          NotapplicCheckbox.type = "checkbox";
          NotapplicCheckbox.value = "Not Applicable";
          NotapplicCheckbox.name = `activities[${rowIndex}][other_task][]`;

          NotapplicCheckbox.classList.add("mr-2", "not-applicable");
          const label = document.createElement("label");
          label.classList.add("block", "mb-2");
          label.textContent = "Not Applicable";
          label.prepend(NotapplicCheckbox);
          taskContainer.prepend(label);
          NotapplicCheckbox.addEventListener("change", function () {
            if (this.checked) {
              taskContainer.innerHTML = "";
              notApplicable();
              document.querySelector(".not-applicable").checked = true;
            } else {
              fetchTasks(activityId, row, rowIndex);
            }
          });
        }
        if (data.length > 0) {
          notApplicable();
          data.forEach((item) => {
            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.value = item.task_id;
            checkbox.name = `activities[${rowIndex}][tasks][]`;
            checkbox.classList.add("mr-2");

            const label = document.createElement("label");
            label.classList.add("block", "mb-2");
            label.textContent = item.task_name;
            label.prepend(checkbox);

            taskContainer.appendChild(label);
          });

          // Handle 'Other' task input
          const otherLabel = document.createElement("label");
          otherLabel.classList.add("block", "mt-4");

          const otherCheckbox = document.createElement("input");
          otherCheckbox.type = "checkbox";
          otherCheckbox.classList.add("mr-2");

          const otherText = document.createElement("span");
          otherText.textContent = "Other";

          const otherInput = document.createElement("input");
          otherInput.type = "text";
          otherInput.name = `activities[${rowIndex}][other_task][]`;
          otherInput.classList.add(
            "border",
            "border-gray-300",
            "p-2",
            "rounded",
            "mt-2",
            "w-full",
            "hidden"
          );

          const addButton = document.createElement("button");
          addButton.type = "button";
          addButton.classList.add(
            "bg-blue-500",
            "text-white",
            "px-4",
            "py-2",
            "rounded",
            "mt-2",
            "hidden"
          );
          addButton.textContent = "Add Task";

          otherLabel.appendChild(otherCheckbox);
          otherLabel.appendChild(otherText);
          otherLabel.appendChild(otherInput);
          otherLabel.appendChild(addButton);

          taskContainer.appendChild(otherLabel);

          otherCheckbox.addEventListener("change", function () {
            if (this.checked) {
              otherInput.classList.remove("hidden");
              addButton.classList.remove("hidden");
            } else {
              otherInput.classList.add("hidden");
              addButton.classList.add("hidden");
            }
          });

          // Add event listener to handle adding new task
          addButton.addEventListener("click", function () {
            const newTaskName = otherInput.value.trim();
            if (newTaskName) {
              const newCheckbox = document.createElement("input");
              newCheckbox.type = "checkbox";
              newCheckbox.value = newTaskName;
              newCheckbox.name = `activities[${rowIndex}][other_task][]`;
              newCheckbox.classList.add("mr-2");
              newCheckbox.checked = true;

              const newLabel = document.createElement("label");
              newLabel.classList.add("block", "mb-2");
              newLabel.textContent = newTaskName;
              newLabel.prepend(newCheckbox);

              taskContainer.insertBefore(newLabel, otherLabel);

              otherInput.value = "";
              otherInput.classList.add("hidden");
              addButton.classList.add("hidden");
              otherCheckbox.checked = false;

              updateTasksInput();
            }
          });
        } else {
          taskContainer.innerHTML = "No tasks available for this activity.";
        }
      })
      .catch((error) => console.error("Error fetching tasks:", error));
  }

  function addRow() {
    const tableBody = document.querySelector("#activityTable tbody");
    const rowcount = tableBody.rows.length;
    const newRow = document.createElement("tr");
    newRow.classList.add("bg-white", "border-b");
    newRow.id = rowcount;
    newRow.innerHTML = `
      <td class="px-4 py-4 border">
        <select name="activities[${rowcount}][activity]" class="activity-select border  p-2 rounded text-wrap max-w-sm overflow-hidden text-ellipsis" required>
          <option value="">Loading...</option>
        </select>
      </td>
      <td class="px-6 py-4 border">
        <div class="taskOptions">
          Loading...
        </div>
      </td>
      <td class="px-4 py-2 border">
        <div class="flex items-center">
          <input type="checkbox" class="toggleDetails p-2 rounded mr-2" />
          <span class="text-base">Use Attachment</span>
        </div>
        <textarea name="activities[${rowcount}][details]" class="border p-2 rounded detailsField" rows="8" cols="40"></textarea>
        <input type="file" name="activities[${rowcount}][attachment]" class="hidden attachmentField block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
      </td>
      <td class="px-6 py-4 border text-center">
        <button type="button" class="delRow text-red-600 hover:text-red-900">Delete</button>
      </td>
    `;
    tableBody.appendChild(newRow);

    fetchActivities(rowcount);
    toggleDetailsOrAttachment();

    // Reattach event listener to new row's delete button
    newRow.querySelector(".delRow").addEventListener("click", function (e) {
      deleteRow(e.target);
    });
  }

  function deleteRow(button) {
    const row = button.closest("tr");
    row.remove();
  }

  function toggleDetailsOrAttachment() {
    const table = document.querySelector("#activityTable");
    table.addEventListener("change", function (e) {
      if (e.target.classList.contains("toggleDetails")) {
        const detailsField = e.target
          .closest("td")
          .querySelector(".detailsField");
        const attachmentField = e.target
          .closest("td")
          .querySelector(".attachmentField");

        if (e.target.checked) {
          detailsField.classList.remove("block");
          detailsField.classList.add("hidden");
          attachmentField.classList.remove("hidden");
          attachmentField.classList.add("block");
        } else {
          detailsField.classList.remove("hidden");
          detailsField.classList.add("block");
          attachmentField.classList.add("hidden");
          attachmentField.classList.remove("block");
        }
      }
    });
  }

  function getUserDetails() {
    fetch(`user.php?a=getDet`)
      .then((response) => response.json())
      .then((data) => {
        userName_Field.innerHTML = data.user_name;
      })
      .catch((error) => console.error("Error fetching user details:", error));
  }

  function setActive(element) {
    document.querySelectorAll(".actions ul li").forEach((item) => {
      item.classList.remove("bg-gray-300", "text-blue-600");
      item.classList.add("text-white", "bg-gray-700");
    });
    element.classList.remove("bg-gray-700", "text-white");
    element.classList.add("bg-gray-300", "text-blue-600");
  }
  function changePasswd(e) {
    e.preventDefault();

    const currentPassword = document.getElementById("currentPassword").value;
    const newPassword = document.getElementById("newPassword").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    if (newPassword !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    const formData = new FormData();
    formData.append("currentPassword", currentPassword);
    formData.append("newPassword", newPassword);

    fetch("crud.php?action=changePasswd", {
      method: "POST",
      body: formData,
    })
      .then((response) => response.json())
      .then((message) => {
        alert(message.message);
        if (message.status === "success") {
          window.location.href = "login.php";
        }
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  }
  let nextSibling = null;
  function hideMenu(icon) {
    icon.innerHTML = `
        <svg id="bars" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.0" stroke="currentColor" class="size-6">
        <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
      </svg>
    `;
    document.getElementById("bars").addEventListener("click", function () {
      showMenu(icon);
    });

    const sideMenu = document.getElementById("sideMenu");

    if (sideMenu) {
      sideMenu.classList.toggle("hidden");

      const wrapper = document.querySelector(".wrapper");
      if (wrapper && sideMenu.classList.contains("hidden")) {
        wrapper.parentNode.insertBefore(sideMenu, nextSibling);
        wrapper.parentNode.removeChild(wrapper);
      }
      sideMenu.classList.remove("sm:w-3/4", "flex");
      sideMenu.classList.add("w-1/4");
    }
  }

  function showMenu(icon) {
    icon.innerHTML = `
        <svg id="x" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.0" stroke="currentColor" class="size-6">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
    `;

    document.getElementById("x").addEventListener("click", function () {
      hideMenu(icon);
    });

    const sideMenu = document.getElementById("sideMenu");
    nextSibling = sideMenu.nextSibling;

    if (!document.querySelector(".wrapper")) {
      const wrapper = document.createElement("div");
      wrapper.classList.add(
        "w-full",
        "h-full",
        "bg-black",
        "bg-opacity-50",
        "z-10",
        "fixed",
        "wrapper"
      );

      sideMenu.parentNode.insertBefore(wrapper, sideMenu);
      wrapper.appendChild(sideMenu);

      sideMenu.classList.toggle("hidden");

      wrapper.addEventListener("click", function (event) {
        hideMenu(icon);
      });

      sideMenu.classList.add("sm:w-3/4", "flex");
      sideMenu.classList.remove("w-1/4");
    }
  }
  async function loadContent(page, id = null) {
    try {
      const response = await fetch(page);
      const html = await response.text();
      mainContent.innerHTML = html;

      if (page === "repindex.php") {
        fetchActivities(0);
        toggleDetailsOrAttachment();
        document.getElementById("addRow").addEventListener("click", addRow);
        fetchReport();
      } else if (page === "changePasswd.html") {
        document
          .getElementById("changePasswordForm")
          .addEventListener("submit", changePasswd);
      } else if (page === "myActivities.html") {
        const activityTable = document.getElementById("activityTable");

        fetch(`user.php?a=myAct`)
          .then((response_1) => response_1.json())
          .then((data_1) => {
            tableFromJson(data_1, activityTable);
          });
      }
    } catch (error) {
      console.error("Error loading content:", error);
    }
  }
  function tableFromJson(jsonData, container, id = null) {
    if (jsonData.length === 0) {
      container.innerHTML = `<div class="text-center m-10">No Record Found<div>`;
      return;
    }
    const table = document.createElement("table");
    table.classList.add("w-full", "bg-white", "rounded", "shadow-md", "mt-4");

    if (container.id === "activityTable") {
      const thead = document.createElement("thead");
      const headerRow = document.createElement("tr");
      const headers = ["Activity", "Role"];

      headers.forEach((headerText) => {
        const th = document.createElement("th");
        th.classList.add("border", "px-4", "py-2", "text-left");
        th.textContent = headerText;
        headerRow.appendChild(th);
      });

      thead.appendChild(headerRow);
      table.appendChild(thead);

      const tbody = document.createElement("tbody");
      jsonData.forEach((rowdata) => {
        const row = document.createElement("tr");
        Object.values(rowdata).forEach((data) => {
          const td = document.createElement("td");
          td.classList.add("border", "px-4", "py-2", "max-w-lg");
          td.textContent = data;
          row.appendChild(td);
        });

        tbody.appendChild(row);
      });

      table.appendChild(tbody);

      container.innerHTML = "";
      container.appendChild(table);
    }
  }
  function handleFormSubmit(e) {
    e.preventDefault();

    const target = e.target;

    const formData = new FormData(target);

    if (
      target.action.split("/")[target.action.split("/").length - 1] ===
      "submitForm.php"
    ) {
      fetch(target.action, {
        method: target.method,
        body: formData,
      })
        .then((response) => response.json())
        .then((message) => {
          alert(message.message);
          loadContent("repindex.php");
        })
        .catch((error) => {
          console.error("Error submitting form:", error);
        });
    }
  }

  function fetchReport() {
    fetch("user.php?a=getReport")
      .then((response) => response.json())
      .then((data) => {
        displayReport(data);
      })
      .catch((error) => {
        console.error("Error fetching report:", error);
      });
  }

  function displayReport(data) {
    const tableContainer = document.getElementById("reportTableContainer");
    if (data.length === 0) {
      tableContainer.innerHTML = `<div class="text-lg text-center">You do not have any reports submitted yet</div>`;
      return;
    }
    tableContainer.innerHTML = "";
    const headers = [
      "Start Date",
      "End Date",
      "Activity",
      "Tasks",
      "Description",
      "Attachment",
      "Action",
    ];

    const table = document.createElement("table");
    table.classList.add(
      "min-w-full",
      "bg-white",
      "border-collapse",
      "overflow-auto"
    );

    const thead = document.createElement("thead");
    const headerRow = document.createElement("tr");

    headers.forEach((headerText) => {
      const th = document.createElement("th");
      th.classList.add(
        "border",
        "px-4",
        "py-2",
        "text-left",
        "bg-gray-100",
        "font-semibold",
        "text-lg"
      );
      th.textContent = headerText;
      headerRow.appendChild(th);
    });

    thead.appendChild(headerRow);
    table.appendChild(thead);

    const tbody = document.createElement("tbody");
    data.forEach((rowData) => {
      const row = document.createElement("tr");

      headers.forEach((header) => {
        const td = document.createElement("td");
        td.classList.add("border", "px-4", "py-2");

        if (header === "Tasks" && rowData.tasks) {
          const taskList = document.createElement("ul");
          taskList.classList.add("list-disc", "list-inside");
          const tasks = rowData.tasks.split(",");
          tasks.forEach((task) => {
            const li = document.createElement("li");
            li.textContent = task.trim();
            taskList.appendChild(li);
          });
          td.appendChild(taskList);
        } else if (header === "Attachment" && rowData.attachment) {
          const a = document.createElement("a");
          a.href = rowData.attachment;
          a.textContent = "Download";
          a.classList.add("text-blue-500", "hover:underline");
          td.appendChild(a);
        } else if (header === "Activity") {
          td.textContent = rowData["activity_name"];
        } else if (header === "Attachment" && !rowData["attachment"]) {
          td.textContent = "No Attachment";
        } else if (header === "Description" && !rowData["attachment"]) {
          td.textContent = "No Description";
        } else if (header === "Action") {
          // Create Delete and Edit buttons inside the Action column
          const deleteButton = document.createElement("button");
          deleteButton.textContent = "Delete";
          deleteButton.classList.add(
            "delete-report-button",
            "text-red-600",
            "hover:text-red-900",
            "mr-2"
          );
          deleteButton.setAttribute("data-report-id", rowData.report_id);

          const editButton = document.createElement("button");
          editButton.textContent = "Edit";
          editButton.classList.add(
            "edit-report-button",
            "text-blue-600",
            "hover:text-blue-900"
          );
          editButton.setAttribute("data-report-id", rowData.report_id);

          // Append both buttons to the Action cell
          td.appendChild(deleteButton);
          td.appendChild(editButton);
        } else {
          td.textContent = rowData[header.replace(/ /g, "_").toLowerCase()];
        }

        row.appendChild(td);
      });

      tbody.appendChild(row);
    });

    table.appendChild(tbody);
    tableContainer.appendChild(table);

    // Attach event listeners to both delete and edit buttons
    document
      .querySelectorAll("button.delete-report-button")
      .forEach((button) => {
        button.addEventListener("click", function () {
          const reportId = this.getAttribute("data-report-id");
          deleteReport(reportId);
        });
      });

    document.querySelectorAll("button.edit-report-button").forEach((button) => {
      button.addEventListener("click", function () {
        const reportId = this.getAttribute("data-report-id");
        editReport(reportId);
      });
    });
  }

  function deleteReport(reportId) {
    if (confirm("Are you sure you want to delete this report?")) {
      fetch(`user.php?a=deleteReport&report_id=${reportId}`, {
        method: "DELETE",
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.status === "success") {
            alert("Report deleted successfully");
            fetchReport(); // Refresh the report table
          } else {
            alert("Error deleting report: " + data.message);
          }
        })
        .catch((error) => {
          console.error("Error deleting report:", error);
        });
    }
  }

  activitiesButton.addEventListener("click", function (e) {
    e.preventDefault();
    loadContent("myActivities.html");
    setActive(this);
  });

  logoutButton.addEventListener("click", function (e) {
    e.preventDefault();
    if (confirm("Are you sure you want to logout?")) {
      fetch(`crud.php?action=logout`)
        .then((response) => {
          if (response.ok) {
            console.log("Logout successful");
            window.location.href = "login.php";
          } else {
            console.error("Logout failed");
          }
        })
        .catch((error) => {
          console.error("Error during logout:", error);
        });
    }
  });

  profileButton.addEventListener("click", function (e) {
    e.preventDefault();
    mainContent.innerHTML = "";
    loadContent("profile.html");
    setActive(this);
  });

  reportButton.addEventListener("click", function (e) {
    e.preventDefault();
    mainContent.innerHTML = "";
    loadContent("repindex.php");
    setActive(this);
  });

  chpasswdButton.addEventListener("click", function (e) {
    e.preventDefault();
    mainContent.innerHTML = "";

    loadContent("changePasswd.html");
    setActive(this);
  });
  ham.addEventListener("click", function (e) {
    menu_icon = document.getElementById("menu_icon");
    showMenu(menu_icon);
  });

  mainContent.addEventListener("submit", handleFormSubmit);

  getUserDetails();
  // loadContent("profile.html");
  reportButton.click();
});
