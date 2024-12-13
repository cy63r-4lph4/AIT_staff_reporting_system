document.addEventListener("DOMContentLoaded", function () {
  const usersButton = document.getElementById("users");
  const logoutButton = document.getElementById("logout");
  const chpasswdButton = document.getElementById("chpasswd");
  const activitiesButton = document.getElementById("activities");
  const reportButton = document.getElementById("report");
  const tasksButton = document.getElementById("tasks");
  const rolesButton = document.getElementById("roles");
  const mainContent = document.getElementById("mainContent");
  const hamIcon = document.getElementById("ham");

  async function loadContent(page, id = null) {
    return fetch(page)
      .then((response) => response.text())
      .then((html) => {
        mainContent.innerHTML = html;
        const modalButton = document.getElementById("openModal");

        if (page === "users.html") {
          const userModal = document.getElementById("userModal");
          modalButton.addEventListener("click", function () {
            setupModal(this, userModal, "user_modalForm.html");
          });
          fetchdata("users");
          return setupModal(modalButton, userModal, "user_modalForm.html");
        } else if (page === "activities.html") {
          const activityModal = document.getElementById("activityModal");
          modalButton.addEventListener("click", function () {
            setupModal(this, activityModal, "activity_modalForm.html");
          });
          fetchdata("activities");
          return setupModal(
            modalButton,
            activityModal,
            "activity_modalForm.html"
          );
        } else if (page === "roles.html") {
          const roleModal = document.getElementById("roleModal");
          modalButton.addEventListener("click", function () {
            setupModal(this, roleModal, "role_modalForm.html");
          });
          fetchdata("roles");
          return setupModal(modalButton, roleModal, "role_modalForm.html");
        } else if (page === "tasks.html") {
          const taskModal = document.getElementById("taskModal");
          modalButton.addEventListener("click", function () {
            setupModal(this, taskModal, "task_modalForm.html");
          });
          fetchdata("tasks");
          return setupModal(modalButton, taskModal, "task_modalForm.html");
        } else if (page === "user_activity.html") {
          const userActivityModal =
            document.getElementById("userActivityModal");
          modalButton.addEventListener("click", function () {
            setupModal(this, userActivityModal, "userActivityModalForm.html");
          });
          fetchdata("user_activity", id);
          return setupModal(
            modalButton,
            userActivityModal,
            "userActivityModalForm.html"
          ).then(() => {
            document.getElementById("userForm").dataset.ID = id;
          });
        } else if (page === "activity_role.html") {
          const activity_RoleModal =
            document.getElementById("activityRoleModal");
          modalButton.addEventListener("click", function () {
            setupModal(this, activity_RoleModal, "activity_RoleModal.html", id);
          });
          fetchdata("activityRole", id);
          return setupModal(
            modalButton,
            activity_RoleModal,
            "activity_RoleModal.html",
            id
          );
        } else if (page == "report.html") {
          document
            .getElementById("myportal")
            .addEventListener("click", function () {
              redirecto("userDashboard.php");
            });
        }
      })
      .catch((error) => {
        console.error("Error loading content:", error);
      });
  }
  function redirecto(url) {
    window.location.href = url;
  }
  async function setupModal(button = null, modal, modalFormUrl, id = null) {
    try {
      const response = await fetch(modalFormUrl);
      if (!response.ok) {
        throw new Error(`Failed to load modal form from ${modalFormUrl}`);
      }
      const html = await response.text();
      modal.innerHTML = html;

      const closeModalButton = document.getElementById("closeModal");

      if (closeModalButton) {
        closeModalButton.addEventListener("click", () => {
          modal.classList.remove("flex");
          modal.classList.add("hidden");
          modal.innerHTML = "";
        });
      }

      if (button) {
        button.addEventListener("click", () => {
          modal.classList.remove("hidden");
          modal.classList.add("flex");
        });
      }
      if (modalFormUrl === "activity_RoleModal.html") {
        prepActRole();

        document.getElementById("task-form").dataset.ID = id;
      } else if (modalFormUrl === "userActivityModalForm.html") {
        fetchActivities();
        fetchRoles();
      }
    } catch (error) {
      console.error("Error setting up modal:", error);
    }
  }

  function fetchdata(t, id = null) {
    if (t === "user_activity") {
      t = "useractivity";
    }
    fetch(`crud.php?action=read&table=${t}&id=${id}`)
      .then((response) => response.json())
      .then((data) => {
        if (data.status === "success") {
          if (t === "users") {
            const userTable = document.getElementById("userTable");
            tableFromJson(data.data, userTable);
          } else if (t === "activities") {
            const activityTable = document.getElementById("activityTable");
            tableFromJson(data.data, activityTable);
          } else if (t === "roles") {
            const roleTable = document.getElementById("roleTable");
            tableFromJson(data.data, roleTable);
          } else if (t === "tasks") {
            const taskTable = document.getElementById("taskTable");

            tableFromJson(data.data, taskTable);
          } else if (t === "useractivity") {
            const userActTable = document.getElementById("userActTable");

            tableFromJson(data.data, userActTable, id);
          } else if (t === "activityRole") {
            const actRoleTable = document.getElementById("actRoleTable");

            tableFromJson(data.data, actRoleTable, id);
          }
        }
      });
  }
  function handleFormSubmit(e) {
    e.preventDefault();

    const target = e.target;

    const formData = new FormData(target);

    if (
      target.action.split("/")[target.action.split("/").length - 1] ===
      "crud.php"
    ) {
      if (target.dataset.table === "users" && target.dataset.cmd === "create") {
        const userformData = new FormData();
        userformData.append("email", target.email.value);
        userformData.append("name", target.name.value);

        userformData.append("role", target.role.value);

        fetch(`crud.php?table=users&action=create`, {
          method: target.method,
          body: userformData,
        })
          .then((response) => response.json())
          .then((data) => {
            if (data.status === "success") {
              refreshData("users");

              alert("Record Added Successfully");
            } else {
              alert(data.message);
            }
          });
      } else if (
        target.dataset.table === "users" &&
        target.dataset.cmd === "update"
      ) {
        const userformData = new FormData();
        userformData.append("email", target.email.value);
        userformData.append("name", target.name.value);

        userformData.append("role", target.role.value);

        fetch(`crud.php?table=users&action=update&id=${target.dataset.oldId}`, {
          method: target.method,
          body: userformData,
        })
          .then((response) => response.json())
          .then((data) => {
            if (data.status === "success") {
              const updateModal = document.getElementById("userEditModal");
              updateModal.innerHTML = "";
              updateModal.classList.toggle("hidden");
              refreshData("users");

              alert("Record Updated Successfully");
            } else {
              alert(data.message);
            }
          });
      } else if (
        target.dataset.table === "activities" &&
        target.dataset.cmd === "create"
      ) {
        // const activityformData = new FormData();

        // activityformData.append("activity", target.activity.value);

        // activityformData.append("details", target.details.value);
        // activityformData.append("attachment", target.attachment.value);

        fetch(`crud.php?table=activities&action=create`, {
          method: target.method,
          body: formData,
        })
          .then((response) => response.json())
          .then((data) => {
            if (data.status === "success") {
              refreshData("activities");

              alert("Record Added Successfully");
            } else {
              alert(data.message);
            }
          });
      } else if (
        target.dataset.table === "activities" &&
        target.dataset.cmd === "update"
      ) {
        fetch(
          `crud.php?table=activities&action=update&id=${target.dataset.oldId}`,
          {
            method: target.method,
            body: formData,
          }
        )
          .then((response) => response.json())
          .then((data) => {
            if (data.status === "success") {
              refreshData("activities");

              alert("Record Updated Successfully");
            } else {
              alert(data.message);
            }
          });
      } else if (
        target.dataset.table === "roles" &&
        target.dataset.cmd === "create"
      ) {
        fetch(`crud.php?table=roles&action=create`, {
          method: target.method,
          body: formData,
        })
          .then((response) => response.json())
          .then((data) => {
            if (data.status === "success") {
              refreshData("roles");

              alert("Record Updated Successfully");
            } else {
              alert(data.message);
            }
          });
      } else if (
        target.dataset.table === "roles" &&
        target.dataset.cmd === "update"
      ) {
        fetch(`crud.php?table=roles&action=update&id=${target.dataset.oldId}`, {
          method: target.method,
          body: formData,
        })
          .then((response) => response.json())
          .then((data) => {
            if (data.status === "success") {
              refreshData("roles");

              alert("Record Updated Successfully");
            } else {
              alert(data.message);
            }
          });
      } else if (
        target.dataset.table === "tasks" &&
        target.dataset.cmd === "create"
      ) {
        fetch(`crud.php?table=tasks&action=create`, {
          method: target.method,
          body: formData,
        })
          .then((response) => response.json())
          .then((data) => {
            if (data.status === "success") {
              refreshData("useractivity");

              alert("Record Updated Successfully");
            } else {
              alert(data.message);
            }
          });
      } else if (
        target.dataset.table === "useractivity" &&
        target.dataset.cmd === "create"
      ) {
        fetch(
          `crud.php?table=useractivity&action=create&id=${target.dataset.ID}`,
          {
            method: target.method,
            body: formData,
          }
        )
          .then((response) => response.json())
          .then((data) => {
            if (data.status === "success") {
              refreshData("useractivity", target.dataset.ID);

              alert("Record Updated Successfully");
            } else {
              alert(data.message);
            }
          });
      } else if (
        target.dataset.table === "useractivity" &&
        target.dataset.cmd === "update"
      ) {
        fetch(
          `crud.php?table=useractivity&action=update&id=${target.dataset.ID}`,
          {
            method: target.method,
            body: formData,
          }
        )
          .then((response) => response.json())
          .then((data) => {
            if (data.status === "success") {
              const EditModal = document.getElementById("userActivityModal");
              EditModal.innerHTML = "";
              EditModal.classList.toggle("hidden");
              refreshData("useractivity", target.dataset.ID);

              alert("Record Updated Successfully");
            } else {
              alert(data.message);
            }
          });
      } else if (
        target.dataset.table === "tasks" &&
        target.dataset.cmd === "update"
      ) {
        fetch(`crud.php?table=tasks&action=update&id=${target.dataset.oldId}`, {
          method: target.method,
          body: formData,
        })
          .then((response) => response.json())
          .then((data) => {
            if (data.status === "success") {
              const updateModal = document.getElementById("taskEditModal");
              updateModal.innerHTML = "";
              updateModal.classList.toggle("hidden");
              refreshData("tasks");

              alert("Record Updated Successfully");
            } else {
              alert(data.message);
              const updateModal = document.getElementById("taskEditModal");
              updateModal.innerHTML = "";
              updateModal.classList.toggle("hidden");
              refreshData("tasks");
            }
          });
      } else if (
        target.dataset.table === "activityRole" &&
        target.dataset.cmd === "createOupdate"
      ) {
        const selectedTasks = Array.from(
          document.querySelectorAll(".task-checkbox:checked")
        ).map((task) => task.value);
        const selectedRole = document.getElementById("role_select").value;
        const formData = {
          role: selectedRole,
          tasks: selectedTasks,
        };

        fetch(`crud.php?action=createOupdate&table=activityRole`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: target.dataset.ID,
            role: formData.role,
            tasks: formData.tasks,
          }),
        })
          .then((response) => response.json())
          .then((data) => {
            if (data.status === "success") {
              alert("Record submitted successfully!");
              refreshData("activityRole", target.dataset.ID);
            } else {
              alert("An error occurred: " + data.message);
            }
          })
          .catch((error) => {
            console.error("Error submitting form:", error);
          });
      }
    } else if (
      target.action.split("/")[target.action.split("/").length - 1] ===
      "FetchReport.php"
    ) {
      fetch(target.action, {
        method: target.method,
        body: new FormData(target),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.status === "success") {
            const reportTable = document.getElementById("reportTable");
            let reportType;
            if (target.elements["report_type"].value === "monthly") {
              reportType = "monthlyReport";
            } else if (target.elements["report_type"].value === "activity") {
              reportType = "activityReport";
            } else if (target.elements["report_type"].value === "weekly") {
              reportType = "weeklyReport";
            } else {
              reportType = "userReport";
            }

            generateReportTable(reportTable, reportType, data.data);
          } else {
            alert("Failed to fetch the report. Please try again.");
          }
        })
        .catch((error) => {
          console.error("Error fetching report:", error);
          alert(
            "An error occurred while fetching the report. Please try again."
          );
        });
    }

    if (
      target.action.split("/")[target.action.split("/").length - 1] ===
      "changepass"
    ) {
      changePasswd(e);
    }
  }
  const reportHeaders = {
    activityReport: [
      "Start Date",
      "End Date",
      "User Name",
      "Tasks",
      "Description",
      "Attachment",
    ],
    monthlyReport: [
      "Start Date",
      "End Date",
      "User Name",
      "Activity",
      "Tasks",
      "Description",
      "Attachment",
    ],
    userReport: [
      "Start Date",
      "End Date",
      "Activity",
      "Tasks",
      "Description",
      "Attachment",
    ],
    weeklyReport: [
      "Start Date",
      "End Date",
      "User Name",
      "Activity",
      "Tasks",
      "Description",
      "Attachment",
    ],
  };

  function generateReportTable(container, reportType, jsonData) {
    const myportal = document.getElementById("myportal");
    if (!myportal.classList.contains("hidden")) {
      myportal.classList.add("hidden");
    }

    container.innerHTML = "";

    if (jsonData.length === 0) {
      container.innerHTML = `<div class="text-center m-10">No Record Found<div>`;
      return;
    }

    const headers = reportHeaders[reportType] || [];

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
    jsonData.forEach((rowData) => {
      const row = document.createElement("tr");

      headers.forEach((header, index) => {
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
        } else if (header === "Description" && !rowData["description"]) {
          td.textContent = "No Description";
        } else {
          td.textContent = rowData[header.replace(/ /g, "_").toLowerCase()];
        }

        row.appendChild(td);
      });

      tbody.appendChild(row);
    });

    table.appendChild(tbody);
    container.appendChild(table);

    const downloadButton = document.createElement("button");
    downloadButton.textContent = "Download CSV";
    downloadButton.classList.add(
      "mt-4",
      "px-4",
      "py-2",
      "bg-blue-500",
      "text-white",
      "rounded",
      "hover:bg-blue-700",
      "focus:outline-none",
      "focus:shadow-outline"
    );

    downloadButton.addEventListener("click", () => {
      downloadCSV(jsonData, reportType);
    });

    container.appendChild(downloadButton);
  }

  function downloadCSV(jsonData, reportType) {
    const csvContent = [];

    const headers = reportHeaders[reportType] || [];
    csvContent.push(headers.join(","));

    jsonData.forEach((rowData) => {
      const row = headers.map((header) => {
        if (header === "Tasks" && rowData.tasks) {
          return `"${rowData.tasks}"`;
        } else if (header === "Attachment" && rowData.attachment) {
          return `"${rowData.attachment}"`;
        } else if (header === "Activity") {
          return `"${rowData["activity_name"]}"`;
        } else {
          return `"${rowData[header.replace(/ /g, "_").toLowerCase()] || ""}"`;
        }
      });
      csvContent.push(row.join(","));
    });

    const csvBlob = new Blob([csvContent.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(csvBlob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `${reportType}_report.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  function tableFromJson(jsonData, container, id = null) {
    if (jsonData.length === 0) {
      container.innerHTML = `<div class="text-center m-10">No Record Found<div>`;
      return;
    }
    const table = document.createElement("table");
    table.classList.add(
      "w-full",
      "bg-white",
      "rounded",
      "shadow-md",
      "mt-4",
      "overflow-auto"
    );
    if (container.id === "userTable") {
      const thead = document.createElement("thead");
      const headerRow = document.createElement("tr");
      const headers = ["Email", "Name", "Actions"];

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
          if (typeof data == "number" || !isNaN(data)) {
            return;
          }
          const td = document.createElement("td");
          td.classList.add("border", "px-4", "py-2", "cursor-pointer");
          td.textContent = data;
          td.addEventListener("click", () => manageUser(rowdata.email));
          row.appendChild(td);
        });

        const actionTd = document.createElement("td");
        actionTd.classList.add("border", "px-4", "py-2", "flex", "gap-2");

        const createIcon = (pathData, clickHandler) => {
          const icon = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "svg"
          );
          icon.setAttribute("fill", "none");
          icon.setAttribute("viewBox", "0 0 24 24");
          icon.setAttribute("stroke-width", "1");
          icon.setAttribute("stroke", "currentColor");
          icon.classList.add("size-5", "cursor-pointer");
          icon.addEventListener("click", clickHandler);

          const path = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "path"
          );
          path.setAttribute("stroke-linecap", "round");
          path.setAttribute("stroke-linejoin", "round");
          path.setAttribute("d", pathData);

          icon.appendChild(path);
          return icon;
        };

        const deleteIcon = createIcon(
          "M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0",
          () => deletUser(rowdata.email)
        );

        const editIcon = createIcon(
          "M16.862 4.487l1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125",
          () => editUser(rowdata.email)
        );

        const resetIcon = createIcon(
          "M11.42 15.17L17.25 21A2.652 2.652 0 0 0 21 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 1 1-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 0 0 4.486-6.336l-3.276 3.277a3.004 3.004 0 0 1-2.25-2.25l3.276-3.276a4.5 4.5 0 0 0-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437 1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008Z",
          () => resetPasswd(rowdata.email)
        );

        actionTd.appendChild(deleteIcon);
        actionTd.appendChild(editIcon);
        actionTd.appendChild(resetIcon);

        row.appendChild(actionTd);
        tbody.appendChild(row);
      });

      table.appendChild(tbody);

      container.innerHTML = "";
      container.appendChild(table);
    } else if (container.id === "activityTable") {
      const thead = document.createElement("thead");
      const headerRow = document.createElement("tr");
      const headers = ["Activity", "Description", "Attachment", "Actions"];

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
          td.classList.add("border", "px-4", "py-2", "cursor-pointer");
          td.addEventListener("click", () =>
            manageActivity(rowdata.activity_id)
          );
          if (data === "") {
            td.textContent = "N/A";
          } else if (typeof data == "number" || !isNaN(data)) {
            return;
          } else if (
            data &&
            typeof data === "string" &&
            data.startsWith("uploads/")
          ) {
            const a = document.createElement("a");
            a.href = data;
            a.textContent = "Download";
            td.appendChild(a);
          } else {
            td.textContent = data;
          }

          row.appendChild(td);
        });

        const actionTd = document.createElement("td");
        actionTd.classList.add("border", "px-4", "py-2", "flex", "gap-2");

        const createIcon = (pathData, clickHandler) => {
          const icon = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "svg"
          );
          icon.setAttribute("fill", "none");
          icon.setAttribute("viewBox", "0 0 24 24");
          icon.setAttribute("stroke-width", "1");
          icon.setAttribute("stroke", "currentColor");
          icon.classList.add("size-5", "cursor-pointer");
          icon.addEventListener("click", clickHandler);

          const path = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "path"
          );
          path.setAttribute("stroke-linecap", "round");
          path.setAttribute("stroke-linejoin", "round");
          path.setAttribute("d", pathData);

          icon.appendChild(path);
          return icon;
        };

        const deleteIcon = createIcon(
          "M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0",
          () => deleteActivity(rowdata.activity_id)
        );

        const editIcon = createIcon(
          "M16.862 4.487l1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125",
          () => editActivity(rowdata.activity_id)
        );

        actionTd.appendChild(deleteIcon);
        actionTd.appendChild(editIcon);

        row.appendChild(actionTd);
        tbody.appendChild(row);
      });

      table.appendChild(tbody);

      container.innerHTML = "";
      container.appendChild(table);
    } else if (container.id === "roleTable") {
      const thead = document.createElement("thead");
      const headerRow = document.createElement("tr");
      const headers = ["Role", "Actions"];

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
          if (typeof data == "number" || !isNaN(data)) {
            return;
          }
          const td = document.createElement("td");
          td.classList.add("border", "px-4", "py-2");

          td.textContent = data;
          row.appendChild(td);
        });

        const actionTd = document.createElement("td");
        actionTd.classList.add("border", "px-4", "py-2", "flex", "gap-2");

        const deleteIcon = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "svg"
        );
        deleteIcon.setAttribute("fill", "none");
        deleteIcon.setAttribute("viewBox", "0 0 24 24");
        deleteIcon.setAttribute("stroke-width", "1");
        deleteIcon.setAttribute("stroke", "currentColor");
        deleteIcon.classList.add("size-5", "cursor-pointer");
        deleteIcon.addEventListener("click", function () {
          deleteRole(rowdata.role_id);
        });
        const deletePath = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "path"
        );
        deletePath.setAttribute("stroke-linecap", "round");
        deletePath.setAttribute("stroke-linejoin", "round");
        deletePath.setAttribute(
          "d",
          "M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
        );
        deleteIcon.appendChild(deletePath);
        actionTd.appendChild(deleteIcon);

        // Edit icon
        const editIcon = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "svg"
        );
        editIcon.setAttribute("fill", "none");
        editIcon.setAttribute("viewBox", "0 0 24 24");
        editIcon.setAttribute("stroke-width", "1");
        editIcon.setAttribute("stroke", "currentColor");
        editIcon.classList.add("size-5", "cursor-pointer");
        editIcon.addEventListener("click", function () {
          editRole(rowdata.role_id);
        });
        const editPath = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "path"
        );
        editPath.setAttribute("stroke-linecap", "round");
        editPath.setAttribute("stroke-linejoin", "round");
        editPath.setAttribute(
          "d",
          "M16.862 4.487l1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125"
        );
        editIcon.appendChild(editPath);
        actionTd.appendChild(editIcon);

        row.appendChild(actionTd);
        tbody.appendChild(row);
      });
      table.appendChild(tbody);

      container.innerHTML = "";
      container.appendChild(table);
    } else if (container.id === "taskTable") {
      const thead = document.createElement("thead");
      const headerRow = document.createElement("tr");
      const headers = ["Task Name", "Actions"];

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
          if (typeof data == "number" || !isNaN(data)) {
            return;
          }
          const td = document.createElement("td");
          td.classList.add("border", "px-4", "py-2");

          td.textContent = data;

          row.appendChild(td);
        });

        const actionTd = document.createElement("td");
        actionTd.classList.add("border", "px-4", "py-2", "flex", "gap-2");

        const deleteIcon = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "svg"
        );
        deleteIcon.setAttribute("fill", "none");
        deleteIcon.setAttribute("viewBox", "0 0 24 24");
        deleteIcon.setAttribute("stroke-width", "1");
        deleteIcon.setAttribute("stroke", "currentColor");
        deleteIcon.classList.add("size-5", "cursor-pointer");
        deleteIcon.addEventListener("click", function () {
          deleteTask(rowdata.task_id);
        });
        const deletePath = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "path"
        );
        deletePath.setAttribute("stroke-linecap", "round");
        deletePath.setAttribute("stroke-linejoin", "round");
        deletePath.setAttribute(
          "d",
          "M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
        );
        deleteIcon.appendChild(deletePath);
        actionTd.appendChild(deleteIcon);

        // Edit icon
        const editIcon = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "svg"
        );
        editIcon.setAttribute("fill", "none");
        editIcon.setAttribute("viewBox", "0 0 24 24");
        editIcon.setAttribute("stroke-width", "1");
        editIcon.setAttribute("stroke", "currentColor");
        editIcon.classList.add("size-5", "cursor-pointer");
        editIcon.addEventListener("click", function () {
          editTask(rowdata.task_id);
        });
        const editPath = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "path"
        );
        editPath.setAttribute("stroke-linecap", "round");
        editPath.setAttribute("stroke-linejoin", "round");
        editPath.setAttribute(
          "d",
          "M16.862 4.487l1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125"
        );
        editIcon.appendChild(editPath);
        actionTd.appendChild(editIcon);

        row.appendChild(actionTd);
        tbody.appendChild(row);
      });
      table.appendChild(tbody);

      container.innerHTML = "";
      container.appendChild(table);
    } else if (container.id === "userActTable") {
      const thead = document.createElement("thead");
      const headerRow = document.createElement("tr");
      const headers = ["Activity", "Role", "Actions"];

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
          td.classList.add("border", "px-4", "py-2");
          td.textContent = data;
          row.appendChild(td);
        });

        const actionTd = document.createElement("td");
        actionTd.classList.add("border", "px-4", "py-2", "flex", "gap-2");

        const createIcon = (pathData, clickHandler) => {
          const icon = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "svg"
          );
          icon.setAttribute("fill", "none");
          icon.setAttribute("viewBox", "0 0 24 24");
          icon.setAttribute("stroke-width", "1");
          icon.setAttribute("stroke", "currentColor");
          icon.classList.add("size-5", "cursor-pointer");
          icon.addEventListener("click", clickHandler);

          const path = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "path"
          );
          path.setAttribute("stroke-linecap", "round");
          path.setAttribute("stroke-linejoin", "round");
          path.setAttribute("d", pathData);

          icon.appendChild(path);
          return icon;
        };

        const deleteIcon = createIcon(
          "M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0",
          () => deleteUserAct(id, rowdata.activity_name)
        );

        const editIcon = createIcon(
          "M16.862 4.487l1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125",
          () => editUserAct(id, rowdata.activity_name)
        );

        actionTd.appendChild(deleteIcon);
        actionTd.appendChild(editIcon);

        row.appendChild(actionTd);
        tbody.appendChild(row);
      });

      table.appendChild(tbody);

      container.innerHTML = "";
      container.appendChild(table);
    } else if (container.id === "actRoleTable") {
      const thead = document.createElement("thead");
      const headerRow = document.createElement("tr");
      const headers = ["Role", "Tasks", "Actions"];

      headers.forEach((headerText) => {
        const th = document.createElement("th");
        th.classList.add("border", "px-4", "py-2", "text-left");
        th.textContent = headerText;
        headerRow.appendChild(th);
      });

      thead.appendChild(headerRow);
      table.appendChild(thead);

      const tbody = document.createElement("tbody");

      Object.keys(jsonData).forEach((roleName) => {
        const row = document.createElement("tr");

        const roleTd = document.createElement("td");
        roleTd.classList.add("border", "px-4", "py-2");
        roleTd.textContent = roleName;
        row.appendChild(roleTd);

        const tasksTd = document.createElement("td");
        tasksTd.classList.add("border", "px-4", "py-2");

        const tasksList = document.createElement("ul");
        jsonData[roleName].forEach((task) => {
          const taskItem = document.createElement("li");
          taskItem.textContent = task;
          tasksList.appendChild(taskItem);
        });

        tasksTd.appendChild(tasksList);
        row.appendChild(tasksTd);

        const actionTd = document.createElement("td");
        actionTd.classList.add("border", "px-4", "py-2", "flex", "gap-2");

        const createIcon = (pathData, clickHandler) => {
          const icon = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "svg"
          );
          icon.setAttribute("fill", "none");
          icon.setAttribute("viewBox", "0 0 24 24");
          icon.setAttribute("stroke-width", "1");
          icon.setAttribute("stroke", "currentColor");
          icon.classList.add("size-5", "cursor-pointer");
          icon.addEventListener("click", clickHandler);

          const path = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "path"
          );
          path.setAttribute("stroke-linecap", "round");
          path.setAttribute("stroke-linejoin", "round");
          path.setAttribute("d", pathData);

          icon.appendChild(path);
          return icon;
        };

        const editIcon = createIcon(
          "M16.862 4.487l1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125",
          () => editRoleTask(id, roleName)
        );

        const deleteIcon = createIcon(
          "M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0",
          () => deleteRoleTask(id, roleName)
        );
        actionTd.appendChild(editIcon);
        actionTd.appendChild(deleteIcon);

        row.appendChild(actionTd);
        tbody.appendChild(row);
      });

      table.appendChild(tbody);

      container.innerHTML = "";
      container.appendChild(table);
    }
  }

  function refreshData(content, id = null) {
    if (content === "users") {
      fetchdata(content);
      userModal = document.getElementById("userModal");
      userModal.classList.remove("flex");
      userModal.classList.add("hidden");
    } else if (content === "activities") {
      fetchdata(content);
      activityModal = document.getElementById("activityModal");
      activityModal.classList.remove("flex");
      activityModal.classList.add("hidden");
    } else if (content === "roles") {
      fetchdata(content);
      roleModal = document.getElementById("roleModal");
      roleModal.classList.remove("flex");
      roleModal.classList.add("hidden");
    } else if (content === "tasks") {
      fetchdata(content);
      taskModal = document.getElementById("taskModal");
      taskModal.classList.remove("flex");
      taskModal.classList.add("hidden");
    } else if (content === "activityRole") {
      fetchdata(content, id);
      actRoleModal = document.getElementById("activityRoleModal");
      actRoleModal.classList.remove("flex");
      actRoleModal.classList.add("hidden");
    } else if (content === "useractivity") {
      fetchdata(content, id);
      useractModal = document.getElementById("userActivityModal");
      useractModal.classList.remove("flex");
      useractModal.classList.add("hidden");
    }
  }
  function setActive(element) {
    document.querySelectorAll(".actions ul li").forEach((item) => {
      item.classList.remove("bg-gray-300", "text-blue-600");
      item.classList.add("text-white", "bg-gray-700");
    });
    element.classList.remove("bg-gray-700", "text-white");
    element.classList.add("bg-gray-300", "text-blue-600");
  }
  function updateFormFields() {
    const myportal = document.getElementById("myportal");
    if (myportal.classList.contains("hidden")) {
      myportal.classList.remove("hidden");
    }
    reportTable = document.getElementById("reportTable");
    reportTable.innerHTML = "";
    var reportType = document.querySelector(
      'input[name="report_type"]:checked'
    ).value;

    function display(repType) {
      document.getElementById("repcontainer").innerHTML = fetch(repType)
        .then((response) => response.text())
        .then((html) => {
          document.getElementById("repcontainer").innerHTML = html;
        });
    }

    switch (reportType) {
      case "activity":
        display("activity_based_fields.html");
        fetchActivities();
        break;
      case "weekly":
        display("weekly_fields.html");
        break;
      case "monthly":
        display("monthly_fields.html");
        break;
      case "user":
        display("user_rep_fields.html");
        fetchNames();
        break;
    }
  }
  function deletUser(userId) {
    if (confirm("Are you sure you want to delete this user?")) {
      fetch(`crud.php?action=delete&table=users&id=${userId}`, {
        method: "POST",
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.status === "success") {
            alert(data.message);
            refreshData("users");
          } else {
            alert("ERROR: Unable to delete user");
          }
        });
    }
  }
  function deleteUserAct(ActId, ActName) {
    if (confirm("Are you sure you want to delete this user activity?")) {
      fetch(
        `crud.php?action=delete&table=useractivity&id=${ActId}&activity=${ActName}`,
        {
          method: "POST",
        }
      )
        .then((response) => response.json())
        .then((data) => {
          if (data.status === "success") {
            alert(data.message);
            refreshData("useractivity", ActId);
          } else {
            alert("ERROR: Unable to delete Activity");
          }
        });
    }
  }
  function deleteRoleTask(ActId, RoleName) {
    if (confirm("Are you sure you want to delete this role-task?")) {
      fetch(
        `crud.php?action=delete&table=roletask&id=${ActId}&role=${RoleName}`,
        {
          method: "POST",
        }
      )
        .then((response) => response.json())
        .then((data) => {
          if (data.status === "success") {
            alert(data.message);
            refreshData("activityRole", ActId);
          } else {
            alert("ERROR: Unable to delete Activity");
          }
        });
    }
  }

  function deleteRole(roleId) {
    if (confirm("Are you sure you want to delete this role?")) {
      fetch(`crud.php?action=delete&table=roles&id=${roleId}`, {
        method: "POST",
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.status === "success") {
            refreshData("roles");
          } else {
            alert("ERROR: Unable to delete role");
          }
        });
    }
  }
  function deleteTask(taskId) {
    if (confirm("Are you sure you want to delete this task?")) {
      fetch(`crud.php?action=delete&table=tasks&id=${taskId}`, {
        method: "POST",
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.status === "success") {
            refreshData("tasks");
          } else {
            alert("ERROR: Unable to delete task");
          }
        });
    }
  }
  function deleteActivity(activityId) {
    if (confirm("Are you sure you want to delete this activity?")) {
      fetch(`crud.php?action=delete&table=activities&id=${activityId}`, {
        method: "POST",
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.status === "success") {
            refreshData("activities");
          } else {
            alert("ERROR: Unable to delete activity");
          }
        });
    }
  }
  function resetPasswd(userId) {
    if (confirm("Are you sure you want to reset the password for this user?")) {
      fetch(`crud.php?action=resetPasswd&table=users&id=${userId}`, {
        method: "POST",
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.status === "success") {
            alert("Password has been reset successfully.");
          } else {
            alert("ERROR: Unable to reset password");
          }
        });
    }
  }
  function editUser(userId) {
    document.getElementById("userModal").innerHTML = "";
    const EditModal = document.getElementById("userEditModal");

    const id = userId;
    let role;

    fetch(`crud.php?action=getObj&table=users&id=${userId}`)
      .then((response) => response.json())
      .then((data) => {
        if (data.status === "success") {
          const name = data.data.user_name;
          if (data.data.dbRole == "2") {
            role = "admin";
          } else if (data.data.dbRole == "1") {
            role = "moderator";
          } else {
            role = "user";
          }

          fetch("user_modalForm.html")
            .then((response) => response.text())
            .then((html) => {
              EditModal.innerHTML = html;
              EditModal.classList.remove("hidden");
              EditModal.classList.add("flex");

              const nameField = EditModal.querySelector("[name='name']");
              const emailField = EditModal.querySelector("[name='email']");
              const roleField = EditModal.querySelector("[name='role']");
              const form = document.getElementById("userForm");
              form.dataset.cmd = "update";
              form.dataset.oldId = userId;
              const updateButton = document.querySelector(
                "#userEditModal .bg-white #userForm #add"
              );

              updateButton.textContent = "Update";

              emailField.value = id;
              nameField.value = name;

              roleField.value = role;

              const closeModalButton = document.querySelector(
                "#userEditModal .bg-white .flex #closeModal"
              );
              closeModalButton.addEventListener("click", () => {
                EditModal.classList.remove("flex");
                EditModal.classList.add("hidden");
              });
            });
        } else {
          console.error("Failed to fetch user data");
        }
      })
      .catch((error) => {
        console.error("Error fetching user data:", error);
      });
  }
  function editActivity(actId) {
    document.getElementById("activityModal").innerHTML = "";

    const EditModal = document.getElementById("activityEditModal");

    fetch(`crud.php?action=getObj&table=activities&id=${actId}`)
      .then((response) => response.json())
      .then((data) => {
        if (data.status === "success") {
          const name = data.data.activity_name;
          const details = data.data.details;

          fetch("activity_modalForm.html")
            .then((response) => response.text())
            .then((html) => {
              EditModal.innerHTML = html;
              EditModal.classList.remove("hidden");
              EditModal.classList.add("flex");

              const nameField = EditModal.querySelector("[name='activity']");
              const detailsField = EditModal.querySelector("[name='details']");
              const form = document.getElementById("activityForm");
              form.dataset.cmd = "update";
              form.dataset.oldId = actId;
              const updateButton = document.querySelector(
                "#activityEditModal .bg-white #activityForm #add"
              );

              updateButton.textContent = "Update";

              detailsField.value = details;
              nameField.value = name;

              const closeModalButton = document.querySelector(
                "#activityEditModal .bg-white .flex #closeModal"
              );
              closeModalButton.addEventListener("click", () => {
                EditModal.classList.remove("flex");
                EditModal.classList.add("hidden");
              });
            });
        } else {
          console.error("Failed to fetch activity data");
        }
      })
      .catch((error) => {
        console.error("Error fetching activity data:", error);
      });
  }
  function editUserAct(userId, ActName) {
    const EditModal = document.getElementById("userActivityModal");

    fetch(
      `crud.php?action=getObj&table=useractivity&id=${userId}&activity=${ActName}`
    )
      .then((response) => response.json())
      .then((data) => {
        if (data.status === "success") {
          fetch("userActivityModalForm.html")
            .then((response) => response.text())
            .then((html) => {
              EditModal.innerHTML = html;
              EditModal.classList.remove("hidden");
              EditModal.classList.add("flex");

              const form = document.getElementById("userForm");

              const activityField =
                EditModal.querySelector("[name='activity']");
              activityField.innerHTML = `<option value="${ActName}">${ActName}</option>`;
              activityField.classList.add("hidden");
              EditModal.querySelector(`[for='activity']`).classList.add(
                "hidden"
              );
              form.dataset.cmd = "update";
              form.dataset.ID = userId;
              const updateButton = document.querySelector(
                "#userActivityModal .bg-white #userForm #add"
              );

              updateButton.textContent = "Update";

              // Create a new div for the activity name
              const actFieldContainer =
                document.querySelector(".mb-4:nth-child(1)");
              actFieldContainer.innerHTML = `<div class=" border-gray-300 p-2 rounded text-center">${ActName}</div>`;

              fetchRoles(data.data.role_name);

              const closeModalButton = document.querySelector(
                "#userActivityModal .bg-white .flex #closeModal"
              );
              closeModalButton.addEventListener("click", () => {
                EditModal.classList.remove("flex");
                EditModal.classList.add("hidden");
              });
            });
        } else {
          console.error("Failed to fetch activity data");
        }
      })
      .catch((error) => {
        console.error("Error fetching user data:", error);
      });
  }
  function editRoleTask(ActId, RoleName) {
    const EditModal = document.getElementById("activityRoleModal");

    fetch(`crud.php?action=getObj&table=roletask&id=${ActId}&role=${RoleName}`)
      .then((response) => response.json())
      .then((data) => {
        if (data.status === "success") {
          fetch("activity_RoleModal.html")
            .then((response) => response.text())
            .then((html) => {
              EditModal.innerHTML = html;
              EditModal.classList.remove("hidden");
              EditModal.classList.add("flex");

              const form = document.getElementById("task-form");
              prepActRole(true);

              const rolefield = document.getElementById("role_select");
              // Set the role value and disable the dropdown
              rolefield.innerHTML = `<option value="${RoleName}" selected>${RoleName}</option>`;
              rolefield.setAttribute("disabled", "disabled"); // Disable the select

              // Add a hidden input to submit the role value
              const hiddenRoleInput = document.createElement("input");
              hiddenRoleInput.setAttribute("type", "hidden");
              hiddenRoleInput.setAttribute("name", "role");
              hiddenRoleInput.setAttribute("value", RoleName);
              form.appendChild(hiddenRoleInput);

              form.dataset.ID = ActId;
              const updateButton = document.getElementById("submit-t");
              updateButton.textContent = "Update";

              const actFieldContainer =
                document.querySelector(".mb-4:nth-child(1)");
              if (actFieldContainer) {
                actFieldContainer.innerHTML = `<div class="border-gray-300 p-2 rounded text-center">${RoleName}</div>`;
              }

              fetchRoles(data.data.role_name);

              const closeModalButton = document.getElementById("closeModal");
              closeModalButton.addEventListener("click", () => {
                EditModal.classList.remove("flex");
                EditModal.classList.add("hidden");
              });
            })
            .catch((error) => {
              console.error("Error loading modal content:", error);
            });
        } else {
          console.error("Failed to fetch role data");
        }
      })
      .catch((error) => {
        console.error("Error fetching user data:", error);
      });
  }

  function editRole(roleId) {
    const roleModal = document.getElementById("roleModal");

    fetch(`crud.php?action=getObj&table=roles&id=${roleId}`)
      .then((response) => response.json())
      .then((data) => {
        if (data.status === "success") {
          const name = data.data.role_name;

          fetch("role_modalForm.html")
            .then((response) => response.text())
            .then((html) => {
              roleModal.innerHTML = html;
              roleModal.classList.remove("hidden");
              roleModal.classList.add("flex");

              const nameField = roleModal.querySelector("[name='role']");

              const form = document.getElementById("roleForm");
              form.dataset.cmd = "update";
              form.dataset.oldId = roleId;
              const updateButton = document.getElementById("add");
              updateButton.textContent = "Update";

              nameField.value = name;

              const closeModalButton = document.getElementById("closeModal");
              closeModalButton.addEventListener("click", () => {
                roleModal.classList.remove("flex");
                roleModal.classList.add("hidden");
              });
            });
        } else {
          console.error("Failed to fetch activity data");
        }
      })
      .catch((error) => {
        console.error("Error fetching user data:", error);
      });
  }
  function editTask(taskId) {
    document.getElementById("taskModal").innerHTML = "";

    const EditModal = document.getElementById("taskEditModal");

    fetch(`crud.php?action=getObj&table=tasks&id=${taskId}`)
      .then((response) => response.json())
      .then((data) => {
        if (data.status === "success") {
          const name = data.data.task_name;

          fetch("task_modalForm.html")
            .then((response) => response.text())
            .then((html) => {
              EditModal.innerHTML = html;
              EditModal.classList.remove("hidden");
              EditModal.classList.add("flex");

              const nameField = EditModal.querySelector("[name='task']");

              const form = document.getElementById("taskForm");
              form.dataset.cmd = "update";
              form.dataset.oldId = taskId;
              const updateButton = document.getElementById("add");
              updateButton.textContent = "Update";

              nameField.value = name;

              const closeModalButton = document.getElementById("closeModal");
              closeModalButton.addEventListener("click", () => {
                EditModal.classList.remove("flex");
                EditModal.classList.add("hidden");
              });
            });
        } else {
          console.error("Failed to fetch task data");
        }
      })
      .catch((error) => {
        console.error("Error fetching task data:", error);
      });
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
  function fetchNames() {
    fetch("crud.php?action=read&table=users")
      .then((response) => response.json())
      .then((data) => {
        const select = document.getElementById("name");

        select.innerHTML = '<option value="">Select a name</option>';
        if (data.status == "success") {
          data.data.forEach((item) => {
            const option = document.createElement("option");
            option.value = item.email;
            option.textContent = item.user_name;
            select.appendChild(option);
          });
        }
      })
      .catch((error) => {
        console.error("Error fetching names:", error);
      });
  }
  function fetchActivities() {
    fetch("crud.php?action=read&table=activities")
      .then((response) => response.json())
      .then((data) => {
        const select = document.getElementById("activity");

        select.innerHTML = '<option value="">Select an activity</option>';
        if (data.status == "success") {
          data.data.forEach((item) => {
            const option = document.createElement("option");
            option.value = item.activity_id;
            option.textContent = item.activity_name;
            select.appendChild(option);
          });
        }
      })
      .catch((error) => {
        console.error("Error fetching names:", error);
      });
  }
  function fetchRoles(selected = null) {
    fetch("crud.php?action=read&table=roles")
      .then((response) => response.json())
      .then((data) => {
        const select = document.getElementById("role_select");
        select.innerHTML = '<option value="">Select a role</option>';
        if (data.status === "success") {
          data.data.forEach((item) => {
            const option = document.createElement("option");
            option.value = item.role_id;
            option.textContent = item.role_name;
            if (item.role_name === selected) {
              option.selected = true;
            }
            select.appendChild(option);
          });
        }
      })
      .catch((error) => {
        console.error("Error fetching names:", error);
      });
  }

  async function manageUser(id) {
    try {
      const response = await fetch(
        `crud.php?action=getObj&table=users&id=${id}`
      );
      const data = await response.json();

      if (data.status === "success") {
        const user = data.data;
        const username = user.user_name;
        await loadContent("user_activity.html", id);

        const usernameField = document.getElementById("header");

        if (usernameField) {
          usernameField.innerHTML = username;
        } else {
          console.error("Username field not found");
        }
      } else {
        console.error(
          "Failed to fetch user data:",
          data.message || "Unknown error"
        );
      }
    } catch (error) {
      console.error("Error:", error);
    }
  }
  function prepActRole(edit = false) {
    if (!edit) {
      fetchRoles();
    }
    fetchTasks();

    const tasksContainer = document.getElementById("tasks-container");
    const selectedTasksContainer = document.getElementById("selected-tasks");

    function fetchTasks() {
      fetch("crud.php?action=read&table=tasks")
        .then((response) => response.json())
        .then((data) => {
          tasksContainer.innerHTML = "";

          data.data.forEach((item) => {
            const taskCheckbox = document.createElement("input");
            taskCheckbox.type = "checkbox";
            taskCheckbox.value = item.task_name;
            taskCheckbox.id = `task-${item.task_id}`;
            taskCheckbox.className = "task-checkbox";

            const taskLabel = document.createElement("label");
            taskLabel.textContent = item.task_name;

            taskLabel.setAttribute("for", `task-${item.task_id}`);
            taskLabel.className = "ml-2";

            const taskWrapper = document.createElement("div");
            taskWrapper.className = "mb-2 flex items-center";
            taskWrapper.appendChild(taskCheckbox);
            taskWrapper.appendChild(taskLabel);

            tasksContainer.appendChild(taskWrapper);

            taskCheckbox.addEventListener("change", updateSelectedTasks);
          });
        })
        .catch((error) => {
          console.error("Error fetching tasks:", error);
        });
    }

    function updateSelectedTasks() {
      selectedTasksContainer.innerHTML = "";
      document.querySelectorAll(".task-checkbox:checked").forEach((task) => {
        const listItem = document.createElement("li");
        listItem.textContent = task.value;
        selectedTasksContainer.appendChild(listItem);
      });
    }

    document
      .getElementById("add-new-task-btn")
      .addEventListener("click", function () {
        const newTaskName = prompt("Enter the new task name:");
        if (newTaskName) {
          const taskId = `task-new-${Date.now()}`;
          const taskCheckbox = document.createElement("input");
          taskCheckbox.type = "checkbox";
          taskCheckbox.value = newTaskName;
          taskCheckbox.id = taskId;
          taskCheckbox.className = "task-checkbox";

          const taskLabel = document.createElement("label");
          taskLabel.textContent = newTaskName;
          taskLabel.setAttribute("for", taskId);
          taskLabel.className = "ml-2";

          const taskWrapper = document.createElement("div");
          taskWrapper.className = "mb-2 flex items-center";
          taskWrapper.appendChild(taskCheckbox);
          taskWrapper.appendChild(taskLabel);

          tasksContainer.appendChild(taskWrapper);

          taskCheckbox.addEventListener("change", updateSelectedTasks);
        }
      });
  }
  async function manageActivity(id) {
    try {
      const response = await fetch(
        `crud.php?action=getObj&table=activities&id=${id}`
      );
      const data = await response.json();

      if (data.status === "success") {
        const activity = data.data;
        const activityName = activity.activity_name;
        await loadContent("activity_role.html", id);

        const activityNameField = document.getElementById("heading");

        if (activityNameField) {
          activityNameField.innerHTML = activityName;
        } else {
          console.error("header cannot be found");
        }
      } else {
        console.error(
          "Failed to fetch activity data:",
          data.message || "Unknown error"
        );
      }
    } catch (error) {
      console.error("Error:", error);
    }
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

  usersButton.addEventListener("click", function (e) {
    e.preventDefault();
    mainContent.innerHTML = "";

    loadContent("users.html");
    setActive(this);
    fetchdata("users");
  });

  activitiesButton.addEventListener("click", function (e) {
    e.preventDefault();
    mainContent.innerHTML = "";
    loadContent("activities.html");
    setActive(this);
  });

  reportButton.addEventListener("click", function (e) {
    e.preventDefault();
    loadContent("report.html");
    setActive(this);
  });
  tasksButton.addEventListener("click", function (e) {
    mainContent.innerHTML = "";

    e.preventDefault();
    loadContent("tasks.html");
    setActive(this);
  });
  rolesButton.addEventListener("click", function (e) {
    e.preventDefault();
    mainContent.innerHTML = "";
    loadContent("roles.html");
    setActive(this);
  });
  chpasswdButton.addEventListener("click", function (e) {
    e.preventDefault();
    mainContent.innerHTML = "";
    loadContent("changePasswd.html");
    setActive(this);
  });
  logoutButton.addEventListener("click", function (e) {
    e.preventDefault();
    if (confirm("Are you sure you want to logout")) {
      fetch(`crud.php?action=logout`)
        .then((response) => {
          if (response.ok) {
            console.log("Logout successful");
            window.location.href = "login.php"; // Redirect to login page
          } else {
            console.error("Logout failed");
          }
        })
        .catch((error) => {
          console.error("Error during logout:", error);
        });
    }
  });
  mainContent.addEventListener("click", function (event) {
    if (event.target && event.target.name === "report_type") {
      updateFormFields();
    }
  });
  mainContent.addEventListener("submit", handleFormSubmit);
  hamIcon.addEventListener("click", function () {
    menu_icon = document.getElementById("menu_icon");
    showMenu(menu_icon);
  });

  loadContent("users.html");
});
