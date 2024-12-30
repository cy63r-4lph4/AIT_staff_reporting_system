<?php
if (session_status() == PHP_SESSION_NONE) {
  session_start();
}
if ($_SESSION['role'] != 3 && $_SESSION['role'] != 2) {
  header('location: pagenotfound.html');
  exit();
}
?>


<div class="bg-white flex items-center justify-center min-h-screen overflow-y-auto">
  <div class="bg-white lg:p-8 p-2 rounded-lg shadow-lg w-full max-w-5xl ">
    <div class="text-center text-blue-800 lg:text-2xl text-xl font-bold mb-6">
      MY REPORT
    </div>
    <form class="space-y-6" action="submitForm.php" method="post" enctype="multipart/form-data">
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <label for="start_date" class="block text-sm font-medium text-gray-700">Start Date:</label>
          <input type="date" id="start_date" name="start_date" class="border border-gray-300 p-2 rounded" required />
        </div>
        <div>
          <label for="end_date" class="block text-sm font-medium text-gray-700">End Date:</label>
          <input type="date" id="end_date" name="end_date" class="border border-gray-300 p-2 rounded" required />
        </div>
      </div>

      <h2 class="lg:text-lg text-base font-medium text-blue-800 text-center">REPORT DETAILS</h2>
      <div class="overflow-x-auto">
        <table id="activityTable" class="w-full lg:text-lg md:text-base text-sm  rounded bg-white shadow-md mt-4">
          <thead>
            <tr>
              <th scope="col" class="border px-4 py-2 text-left ">Activity</th>
              <th scope="col" class="border px-4 py-2 text-left ">Task</th>
              <th scope="col" class="border px-4 py-2 text-left ">Details or Attachment</th>
              <th scope="col" class="border px-4 py-2 text-left ">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr id=0>
              <td class="px-4 py-2 border">
                <select name="activities[0][activity]" class="activity-select border  p-2 rounded text-wrap max-w-sm overflow-hidden text-ellipsis" required>
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
                  <input type="checkbox" class="toggleDetails p-2 rounded mr-2 text-lg" />
                  <span class="text-base">Use Attachment</span>
                </div>
                <textarea name="activities[0][details]" class="border  p-2 rounded detailsField self-center" rows="8" cols="40"></textarea>
                <input type="file" name="activities[0][attachment]" class="hidden attachmentField w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
              </td>
              <td class="px-6 py-4 border text-center">
                <button id="delRow" type="button" class="text-red-600 hover:text-red-900">
                  Delete
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="flex justify-between">
        <button id="addRow" type="button" class="text-white bg-green-600 hover:bg-green-700 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-base px-5 py-2.5">
          Add
        </button>
        <button type="submit" class="text-white bg-purple-700 hover:bg-purple-800 focus:ring-4 focus:ring-purple-300 font-medium rounded-lg text-base px-5 py-2.5">
          Submit
        </button>
      </div>
    </form>

    <div>
      <div class="mb-20"></div>
      <div id="myReports"></div>
      <div class="lg:hidden text-lg mb-5 font-medium text-blue-800 text-center">Submitted</div>
      <div id="reportTableContainer" class="overflow-auto"></div>
    </div>
  </div>