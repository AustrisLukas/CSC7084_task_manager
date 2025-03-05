const path = require("path");
const { format, isAfter, differenceInCalendarDays } = require("date-fns");
const { formatDisplayDate, limitTextLength, formatDate, formatDateforHTML, getStarUrl, getCardStyle, logMessage } = require("../utils/homeUtils");
const { getCheckboxState } = require(path.join(__dirname, "/..", "/utils/filterSortUtils.js"));
const axios = require("axios");


/**
 * Renders the home page with user-specific tasks, categories and sort preferences.
 * If category and sort preferance not available - page rendered with default settings.
 * Redirects to the login page if the user is not authenticated.
 *
 * @param {Object} req - Express request object.
 * @param {Object} req.session - User session data.
 * @param {Object} req.session.user - The logged-in user's session details.
 * @param {number} req.session.user.user_id - The ID of the logged-in user.
 * @param {Object} req.session.views - User's session-based UI preferences.
 * @param {string} [req.session.views.sort_by] - Sorting preference for tasks.
 * @param {string[]} [req.session.views.selected_category] - User-selected categories.
 * @param {string} [req.session.views.show_completed] - Whether to show completed tasks.
 * @param {Object} res - Express response object.
 *
 * @returns {void}
 */
exports.renderHome = async (req, res) => {
  logMessage("Executing renderHome");

  const { user_id } = req.session.user;
  const sort_by = req.session.views?.sort_by ?? undefined;
  const show_completed = req.session.views?.show_completed ?? "off";
  const endpoint_userCategories = process.env.API_ENDPOINT + `/user/categories/${user_id}`;
  const endpoint_userTasks = process.env.API_ENDPOINT + `/user/tasks`;
  const endpoint_tasksOpenCompleteSummary = process.env.API_ENDPOINT + `/stats/getopencompletesummary/${user_id}`;
  const endpoint_tasksUrgencySummary = process.env.API_ENDPOINT + `/stats/geturgencysummary/${user_id}`;
  const endpoint_tasksDueSummary = process.env.API_ENDPOINT + `/stats/getduesummary/${user_id}`;
  

  // code bellow provides res.render with user selected categories from session.views.selected_category.
  // if no session.views.selected_category is not available, ALL user-defined categories will be rendered.
  try {

    //SIDE STATS PANEL -> Open-complete summary
    const taskOpenCompleteSummary = await axios.get(endpoint_tasksOpenCompleteSummary);
    //SIDE STATS PANEL -> Urgency summary
    const taskUrgencySummary = await axios.get(endpoint_tasksUrgencySummary);
    //SIDE STATS PANEL -> taskDueSummary
    const tasksDueSummary = await axios.get(endpoint_tasksDueSummary);

    const userCategories = await axios.get(endpoint_userCategories);
    // extract values from .json object
    const categoryArray = Object.values(userCategories.data);
    // put values in a string array
    const selectAllCategories = categoryArray.map((item) => item.category_name);
    const selected_category = req.session.views?.selected_category ?? selectAllCategories;

    // retrieve userTask with filter and sort options in req.body
    const userTasks = await axios.post(endpoint_userTasks, {
      selected_category: selected_category,
      show_completed: show_completed,
      user_id: user_id,
      sort_by: sort_by,
    });
    return res.render("home", {
      elements: userTasks.data,
      format,
      isAfter,
      differenceInCalendarDays,
      user_categories: userCategories.data,
      selected_categories: selected_category,
      getCheckboxState,
      show_completed,
      getStarUrl,
      getCardStyle,
      formatDisplayDate,
      limitTextLength,
      formatDateforHTML,
      taskOpenCompleteSummary: taskOpenCompleteSummary.data,
      taskUrgencySummary: taskUrgencySummary.data,
      tasksDueSummary: JSON.stringify(tasksDueSummary.data)
    });
  } catch (error) {
    console.error("Error fetching user categories:", error.message);
  }
};

/**
 * Applies user-selected filters (category, sorting, and completed tasks visibility)
 * and stores them in the session. Redirects to the home page after applying filters.
 *
 * @param {Object} req - Express request object.
 * @param {Object} req.body - Request body containing filter options.
 * @param {string[]} req.body.selected_category - Array of selected category names.
 * @param {string} req.body.sort_by - Sorting preference for tasks.
 * @param {string} req.body.show_completed - Whether to show completed tasks ("on" or "off").
 * @param {Object} req.session - User session object.
 * @param {Object} res - Express response object.
 *
 * @returns {void}
 */
exports.applyFilters = async (req, res) => {
  logMessage("Executing applyFilters");
  const { selected_category, sort_by, show_completed } = req.body;
  req.session.views = {
    selected_category: selected_category,
    sort_by: sort_by,
    show_completed: show_completed,
  };
  return res.redirect("/");
};

/**
 * Renders the "newTask" page with user-specific categories.
 *
 * @async
 * @function renderNewTask
 * @param {Object} req - Express request object.
 * @param {Object} req.session - Session data.
 * @param {Object} req.session.user - User session object.
 * @param {number} req.session.user.user_id - ID of the logged-in user.
 * @param {Object} res - Express response object.
 * @returns {Promise<void>} Sends the rendered "newTask" page or an error response.
 */
exports.renderNewTask = async (req, res) => {
  logMessage("Executing renderNewTask");

  const { user_id } = req.session.user;
  const message = req.body.message || "";
  const warning = req.body.warning || "";
  const endpoint_userCategories = process.env.API_ENDPOINT + `/user/categories/${user_id}`;

  try {
    const user_categories = await axios.get(endpoint_userCategories);
    return res.render("newTask", { getStarUrl, user_categories: user_categories.data, message, warning });
  } catch (err) {
    console.log(err);
    return res.status(500).send("Internal Server Error");
  }
};

/**
 * Renders a 404 error page.
 *
 * @function renderError
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @returns {void} Sends a 404 error response as HTML.
 */
exports.renderError = (req, res) => {
  logMessage("Executing renderError");
  //console.log(req)

  return res.send(`<h1>Error 404</h1> \n <p>${req.url}</p> <p>Page not found</p>`);
};

exports.processNewTask = async (req, res) => {
  logMessage("Executing processNewTask");
  console.log(req.body);
  //console.log(req.session);

  const endpoint_processNewTask = process.env.API_ENDPOINT + `/newtask`;

  try {
    const response = await axios.post(endpoint_processNewTask, {
      ...req.body,
      user_id: req.session.user.user_id,
    });

    req.body.message = response.data.message;
    return this.renderNewTask(req, res);
  } catch (err) {
    req.body.warning = err.response.data.message;
    return this.renderNewTask(req, res);
  }
};

exports.logout = (req, res) => {
  logMessage(`Executing logout for user_id =  ${req.session.user.user_id}`);
  req.session.destroy();
  res.redirect("/");
};

exports.updateTask = async (req, res) => {
  logMessage("Executing updateTask");

  const endpoint_updateTask = process.env.API_ENDPOINT + `/update`;

  try {
    const response = await axios.put(endpoint_updateTask, req.body);
    logMessage(response.data.message);
    return res.redirect("/");
  } catch (err) {
    logMessage(err.response.data.message);
    return res.redirect("/");
  }
};

exports.deleteTask = async (req, res) => {
  logMessage(`Executing deleteTask for task_id ${req.params.id}`);

  const endpoint_deleteTask = process.env.API_ENDPOINT + `/delete/${req.params.id}`;
  try {
    const response = await axios.delete(endpoint_deleteTask);
    logMessage(response.data.message);
    return res.redirect("/");
  } catch (err) {
    logMessage(err.response.data.message);
    return res.redirect("/");
  }
};

exports.completeTask = async (req, res) => {
  logMessage(`Executing completeTask for task_id ${req.params.id}`);

  const endpoint_completeTask = process.env.API_ENDPOINT + `/complete/${req.params.id}`;

  try {
    response = await axios.patch(endpoint_completeTask);
    logMessage(response.data.message);
    return res.redirect("/");
  } catch (err) {
    logMessage(err.response.data.message);
    return res.redirect("/");
  }
};

exports.renderPersonalise = async (req, res) => {
  logMessage("Executing renderPersonalise");

  const { user_id } = req.session.user;
  const endpoint_userCategories = process.env.API_ENDPOINT + `/user/categories/${user_id}`;
  const endpoint_availableColours = process.env.API_ENDPOINT + `/getcolours`;

  try {
    const result = await axios.get(endpoint_userCategories);
    const availableColours = await axios.get(endpoint_availableColours);

    res.render("personalise", {
      elements: result.data,
      availableColours: availableColours.data,
      error: "",
      success: "",
    });
  } catch (err) {
    console.log(err);
  }
};

exports.updatePersonalise = async (req, res) => {
  logMessage("Executing updatePersonalise");

  const endpoint_updateCategories = process.env.API_ENDPOINT + `/updatecategories`;
  const { user_id } = req.session.user;
  const endpoint_userCategories = process.env.API_ENDPOINT + `/user/categories/${user_id}`;
  const endpoint_availableColours = process.env.API_ENDPOINT + `/getcolours`;

  try {
    const response = await axios.patch(endpoint_updateCategories, req.body);
    const userCategories = await axios.get(endpoint_userCategories);
    const availableColours = await axios.get(endpoint_availableColours);

    return res.render("personalise", {
      elements: userCategories.data,
      availableColours: availableColours.data,
      error: "",
      success: response.data.message,
    });
  } catch (err) {
    return res.render("personalise", {
      elements: userCategories.data,
      availableColours: availableColours.data,
      error: response.err.message,
      success: "",
    });
  }
};

exports.addNewCategory = async (req, res) => {
  logMessage("Executing addNewCategory");
  const endpoint_addNewCategory = process.env.API_ENDPOINT + `/addnewcategory`;
  const { user_id } = req.session.user;
  const endpoint_userCategories = process.env.API_ENDPOINT + `/user/categories/${user_id}`;
  const endpoint_availableColours = process.env.API_ENDPOINT + `/getcolours`;
  // console.log(req.body);

  try {
    const response = await axios.post(endpoint_addNewCategory, {
      ...req.body,
      user_id: req.session.user.user_id,
    });

    const userCategories = await axios.get(endpoint_userCategories);
    const availableColours = await axios.get(endpoint_availableColours);
    return res.render("personalise", {
      elements: userCategories.data,
      availableColours: availableColours.data,
      error: "",
      success: response.data.message,
    });
  } catch (err) {
    console.log(err);
  }
};

exports.renderStatistics = async (req, res) => {
  logMessage("Executing renderStatistics");

  const id = req.session.user.user_id;
  const endpoint_tasksPerCategory = process.env.API_ENDPOINT + `/stats/taskspercategory/${id}`;
  const endpoint_tasksDueSummary = process.env.API_ENDPOINT + `/stats/getduesummary/${id}`;
  const endpoint_tasksOpenCompleteSummary = process.env.API_ENDPOINT + `/stats/getopencompletesummary/${id}`;
  const endpoint_tasksUrgencySummary = process.env.API_ENDPOINT + `/stats/geturgencysummary/${id}`;


  try {
    //tasksPerCategory data
    const tasksPerCategory = await axios.get(endpoint_tasksPerCategory);
    const categoriesXaxis = tasksPerCategory.data.map((element) => element.category_name);
    const categoriesYaxis = tasksPerCategory.data.map((element) => element.count);
    const chartDataTaskPerCategory = {
      labels: categoriesXaxis,
      values: categoriesYaxis,
    };

    //taskDueSummary
    const tasksDueSummary = await axios.get(endpoint_tasksDueSummary);
    //Open-complete summary
    const taskOpenCompleteSummary = await axios.get(endpoint_tasksOpenCompleteSummary);
    //Urgency summary
    const taskUrgencySummary = await axios.get(endpoint_tasksUrgencySummary);

    res.render("statistics", {
      getStarUrl,
      chartData: JSON.stringify(chartDataTaskPerCategory),
      tasksDueSummary: JSON.stringify(tasksDueSummary.data),
      taskOpenCompleteSummary: taskOpenCompleteSummary.data,
      taskUrgencySummary: taskUrgencySummary.data,
      
      
    });
  } catch (err) {
    console.log(err);
  }
};
