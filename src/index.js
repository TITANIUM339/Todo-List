import { isToday, isThisWeek, format } from "date-fns";
import TodoList from "./todo_list";


const hamburgerButton = (function () {
    const sidebar = document.querySelector(".sidebar");
    const bars = document.querySelectorAll(".bar");
    const classNames = ["bar1-active", "bar2-active", "bar3-active"];

    // Extends/Retracts the sidebar/menu.
    function openMenu() {
        bars.forEach((element, index) => {
            element.classList.toggle(classNames[index]);
        });

        sidebar.classList.toggle("sidebar-active");  
    }

    return {openMenu};
})();


const tasks = (function () {
    const tasksContainer = document.querySelector(".tasks");
    const textContainer = document.querySelector(".content>.text");

    // Loads the tasks contained in provided argument "tasksObject" in the form of {projectID: {taskID: {}}}.
    function loadTasks(tasksObject, message) {
        tasksContainer.innerHTML = "";

        textContainer.innerText = message;
        for (const projectID in tasksObject) {
            for (const taskID in tasksObject[projectID]) {
                let title = tasksObject[projectID][taskID].title;
                let description = tasksObject[projectID][taskID].description;
                let date = tasksObject[projectID][taskID].date;
                let priority = tasksObject[projectID][taskID].priority;
                let completed = tasksObject[projectID][taskID].completed;
                let projectName = TodoList.getProjectName(projectID);
    
                // Append task to the DOM.
                tasksContainer.innerHTML += `
                    <div class="task ${priority} ${completed? "checked":""}" data-project-id="${projectID}" data-task-id="${taskID}">
                        <div class="info">
                            <div class="container">
                                <input type="checkbox" name="check" ${completed? "checked":""}>
                                <div class="task-title">${title}</div>
                            </div>
                            <div class="button-container">
                                <div class="save-delete">
                                    <button class="save-task"></button>
                                    <button class="delete-task"></button>
                                </div>
                                <div>
                                    <button class="edit-task ${navigation.getSelectedProject() === null? "edit-task-hidden":""}"></button>
                                    <button class="collapse-panel"></button>
                                </div>
                            </div>
                        </div>
                        <div class="panel">
                            <div class="description">
                                ${description}
                            </div>
                            <div class="details">
                                <div class="task-project">
                                    <h5>Project:</h5>
                                    <div>${projectName}</div>
                                </div>
                                <div class="due-date">
                                    <h5>Due date:</h5>
                                    <div>${date? format(new Date(date), "PPPP"):"N/A"}</div>
                                </div>
                                <div class="priority">
                                    <h5>Priority:</h5>
                                    <div>${priority.charAt(0).toUpperCase() + priority.slice(1)}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            }
        }

        // Adding event-listeners to task buttons.
        document.querySelectorAll(".task").forEach(element => {
            element.querySelector(".collapse-panel").addEventListener("click", () => {
                task.collapse(element);
            });
    
            element.querySelector(".edit-task").addEventListener("click", () => {
                task.edit(element);
            });

            element.querySelector(".save-task").addEventListener("click", () => {
                task.save(element);
            });

            element.querySelector(".delete-task").addEventListener("click", () => {
                task.remove(element);
            });

            element.querySelector('input[type="checkbox"]').addEventListener("click", () => {
                task.check(element);
            });
        });
    }

    return {loadTasks};
})();


const task = (function () {
    // Checks/Unchecks the task.
    function check(element) {
        const checkboxValue = element.querySelector('input[type="checkbox"]').checked;

        element.classList.toggle("checked");

        TodoList.checkTask(element.dataset.projectId, element.dataset.taskId, checkboxValue);
    }

    // Collapses/Un-collapses the task.
    function collapse(element) {
        const collapsible = element.querySelector(`.collapse-panel`);
        const panel = element.querySelector(`.panel`);

        collapsible.classList.toggle("collapsible-active");
        panel.classList.toggle("panel-active");
    }

    const priorities = ["high", "medium", "low"];

    // Sets task to an editable/uneditable state.
    function edit(element) {
        const titleContainer = element.querySelector(".task-title");
        const descriptionContainer = element.querySelector(".description");
        const dateContainer = element.querySelector(".due-date>div");
        const priorityContainer = element.querySelector(".priority>div");
        const buttonContainer = element.querySelector(".save-delete");
        const checkbox =  element.querySelector('input[type="checkbox"]');
        const thisTask = TodoList.getTask(element.dataset.projectId, element.dataset.taskId);

        // Makes task editable.
        if (buttonContainer.classList.toggle("edit")) {
            // Title input.
            const inputText = document.createElement("input");
            inputText.name = "title";
            inputText.placeholder = "Title";
            inputText.maxLength = 20;
            inputText.value = thisTask.title;
            inputText.onclick = function () {this.select()};
            titleContainer.innerHTML = "";
            titleContainer.appendChild(inputText);
            
            // Description input.
            const textArea = document.createElement("textarea");
            textArea.name = "description";
            textArea.placeholder = "Description";
            textArea.maxLength = 200;
            textArea.innerText = thisTask.description;
            textArea.onclick = function () {this.select()};
            descriptionContainer.innerHTML = "";
            descriptionContainer.appendChild(textArea);

            // Date input.
            const inputDate = document.createElement("input");
            inputDate.type = "date";
            inputDate.name = "date";
            inputDate.value = thisTask.date;
            dateContainer.innerHTML = "";
            dateContainer.appendChild(inputDate);

            // Priority input.
            const selectPriority = document.createElement("select");
            selectPriority.name = "priority";
            for (let i = 0; i < priorities.length; i++) {
                let option = document.createElement("option");
                option.value = priorities[i];
                if (priorities[i] === thisTask.priority) option.selected = true;
                option.innerText = priorities[i].charAt(0).toUpperCase() + priorities[i].slice(1);
                selectPriority.appendChild(option);
            }
            priorityContainer.innerHTML = "";
            priorityContainer.appendChild(selectPriority);

            checkbox.disabled = true;
        // Makes task uneditable.
        } else {
            const title = thisTask.title;
            const description = thisTask.description;
            const date = thisTask.date? format(new Date(thisTask.date), "PPPP"):"N/A";
            const priority = thisTask.priority;

            for (let i = 0; i < priorities.length; i++) {
                element.classList.remove(priorities[i]);
            }
            element.classList.add(priority);

            titleContainer.innerText = title;
            descriptionContainer.innerText = description;
            dateContainer.innerText = date;
            priorityContainer.innerText = priority.charAt(0).toUpperCase() + priority.slice(1);

            checkbox.disabled = false;
        }
    }

    // Saves changes made to task in the editable state.
    function save(element) {
        const title = element.querySelector(".task-title>input").value.trim();
        const description = element.querySelector(".description>textarea").value.trim();
        const date = element.querySelector(".due-date>div>input").value;
        const priority = element.querySelector(".priority>div>select").value;

        // Checks for empty title or duplicate title.
        if (title && TodoList.editTask(title, description, date, priority, element.dataset.projectId, element.dataset.taskId)) {
            edit(element);

            return;
        };

        // Error messages.
        if (title) {
            alert("You can't have 2 tasks with the same title.");
        } else {
            alert("You're task can't have an empty title.");
        }
    }

    // Removes task.
    function remove(element) {
        TodoList.deleteTask(element.dataset.projectId, element.dataset.taskId);

        // Removes task from the DOM.
        element.remove();
    }

    return {check, collapse, edit, save, remove};
})();


const addTaskButton = (function () {
    function addNewTask(projectID) {
        const taskID = TodoList.createTask(projectID);

        // Checks if number of tasks didn't exceed 10.
        if (taskID !== -1) {
            const tasksObject = {};
            tasksObject[projectID] = TodoList.getTasks(projectID);

            tasks.loadTasks(tasksObject, TodoList.getProjectName(projectID));

            const element = document.querySelector(`.task[data-task-id="${taskID}"]`);
            task.edit(element);
            task.collapse(element);

            return;
        }

        // Error message.
        alert("You have reached the limit of 10 tasks.");
    }

    return {addNewTask};
})();


const projects = (function () {
    const projectsContainer = document.querySelector("ul");

    function loadProjects() {
        projectsContainer.innerHTML = "";
        
        const allProjects = TodoList.getProjects();

        for (const key in allProjects) {
            // Append project to the DOM.
            projectsContainer.innerHTML += `
                <li class="project navigation ${navigation.getSelectedProject() === key? "navigation-active":""}" data-id="${key}">
                    <button class="project-info">
                        <div></div>
                        <div class="project-title">${allProjects[key]}</div>
                    </button>
                    <button class="edit-project"></button>
                    <div class="panel">
                        <button class="save-project">Save</button>
                        <button class="delete-project">Delete</button>
                    </div>
                </li>
            `;
        }

        // Adds event-listeners to project buttons.
        document.querySelectorAll(".project").forEach(element => {
            element.querySelector(".edit-project").addEventListener("click", () => {
                project.edit(element);
            });

            element.querySelector(".project-info").addEventListener("click", () => {
                navigation.loadTasksOfProject(element);
            });

            element.querySelector(".delete-project").addEventListener("click", () => {
                project.remove(element);
            });

            element.querySelector(".save-project").addEventListener("click", () => {
                project.save(element);
            });
        });
    }

    return {loadProjects};
})();


const project = (function () {
    // Sets project to an editable/uneditable state.
    function edit(element) {
        const panel = element.querySelector(".panel");
        const title = element.querySelector(".project-title");
        const thisProject = TodoList.getProjectName(element.dataset.id);

        element.classList.toggle("project-highlight");

        // Makes project editable.
        if (panel.classList.toggle("panel-active")) {
            const input = document.createElement("input");
            input.type = "text";
            input.name = "title";
            input.placeholder = thisProject;
            input.value = thisProject;
            input.onclick = function () {this.select()};
            input.maxLength = 10;

            title.innerHTML = "";
            title.appendChild(input);
        // Makes project uneditable.
        } else {
            title.innerText = thisProject;
        }
    }

    // Saves changes made to project in the editable state.
    function save(element) {
        const name = element.querySelector("input").value.trim();

        // Checks for empty name or duplicate name.
        if (name && TodoList.editProject(element.dataset.id, name)) {
            // Load tasks of saved project if it is selected.
            if (navigation.getSelectedProject() === element.dataset.id) {
                const tasksObject = {};
                tasksObject[element.dataset.id] = TodoList.getTasks(element.dataset.id);

                tasks.loadTasks(tasksObject, name);
            // Load tasks from the selected navigation tab.
            } else {
                switch (navigation.getSelectedNavigationTab()) {
                    case "today":
                        navigation.loadToday();
                        
                        break;
                    case "this-week":
                        navigation.loadThisWeek();
                        
                        break;
                    case "all":
                        navigation.loadAll();
                        
                        break;
                    default:
                        break;
                }
            }

            edit(element);

            return;
        }

        // Error messages.
        if (name) {
            alert("You can't have 2 projects with the same name.");
        } else {
            alert("You're project can't have an empty name.");
        }
    }

    // Removes project.
    function remove(element) {
        TodoList.deleteProject(element.dataset.id);

        let selectedTab = navigation.getSelectedNavigationTab();

        // if removed project is selected or if selectedTab is today load today page (default page).
        if (element.dataset.id === navigation.getSelectedProject() || selectedTab === "today") {
            navigation.loadToday();
        }

        // Load page of selected tab.
        if (selectedTab !== null) {
            switch (selectedTab) {
                case "this-week":
                    navigation.loadThisWeek();
                    
                    break;
                case "all":
                    navigation.loadAll();
                    
                    break;
                default:
                    break;
            }
        }

        // Remove element from the DOM.
        element.remove();
    }
    
    return {edit, save, remove};
})();


const addProjectButton = (function () {
    function addNewProject() {
        const projectID = TodoList.createProject();

        // Checks if number of projects didn't exceed 10.
        if (projectID !== -1) {
            projects.loadProjects();

            project.edit(document.querySelector(`.project[data-id="${projectID}"]`));

            return;
        }

        // Error message.
        alert("You have reached the limit of 10 projects.");
    }

    return {addNewProject};
})();


const navigation = (function () {
    const tasksContainer = document.querySelector(".tasks");

    // Filters tasks by a date function given as an argument.
    function getTasksByDate(dateFunction) {
        tasksContainer.innerHTML = "";

        const allProjects = TodoList.getProjects();
        const tasksObject = {};

        for (const projectID in allProjects) {
            let allTasks = TodoList.getTasks(projectID);

            tasksObject[projectID] = {};

            for (const taskID in allTasks) {
                let date = allTasks[taskID].date;

                if (dateFunction(new Date(date))) {
                    tasksObject[projectID][taskID] = allTasks[taskID];
                }
            }
        }

        return tasksObject;
    }

    // Highlight a navigation element.
    function highlight(element) {
        document.querySelectorAll(".navigation").forEach(element => {
            element.classList.remove("navigation-active");
        });

        element.classList.add("navigation-active");
    }

    function isTasksObjectEmpty(tasksObject) {
        for (const key in tasksObject) {
            if (Object.keys(tasksObject[key]).length) return false;
        }

        return true;
    }

    const button = document.querySelector(".add-task");

    let selectedProject = null;
    let selectedNavigationTab = null;

    function getSelectedProject() {
        return selectedProject;
    }

    function getSelectedNavigationTab() {
        return selectedNavigationTab;
    }
    
    function loadTasksOfProject(element) {
        selectedProject = element.dataset.id;
        selectedNavigationTab = null;

        const tasksObject = {};
        tasksObject[element.dataset.id] = TodoList.getTasks(element.dataset.id);

        highlight(element);

        button.classList.remove("add-task-hidden");

        tasks.loadTasks(tasksObject, TodoList.getProjectName(element.dataset.id));
    }

    // Loads tasks from today (default).
    function loadToday() {
        selectedProject = null;
        selectedNavigationTab = "today";

        highlight(document.querySelector(".today"));

        button.classList.add("add-task-hidden");
        
        const tasksObject = getTasksByDate(isToday);

        tasks.loadTasks(tasksObject, isTasksObjectEmpty(tasksObject)? "You have no tasks for today 😎":"Tasks for today");
    }

    // Loads tasks from this week.
    function loadThisWeek() {
        selectedProject = null;
        selectedNavigationTab = "this-week";

        highlight(document.querySelector(".this-week"));

        button.classList.add("add-task-hidden");

        const tasksObject = getTasksByDate(isThisWeek);

        tasks.loadTasks(tasksObject, isTasksObjectEmpty(tasksObject)? "You have no tasks for this week 😎":"Tasks for this week");
    }

    // Loads all tasks.
    function loadAll() {
        selectedProject = null;
        selectedNavigationTab = "all";

        highlight(document.querySelector(".all"));

        button.classList.add("add-task-hidden");

        const tasksObject = getTasksByDate(() => {return true});

        tasks.loadTasks(tasksObject, isTasksObjectEmpty(tasksObject)? "You have no tasks 😎":"All tasks");
    }

    return {loadToday, loadThisWeek, loadAll, loadTasksOfProject, getSelectedProject, getSelectedNavigationTab};
})();


projects.loadProjects();

navigation.loadToday();

document.querySelector(".today").addEventListener("click", () => {
    navigation.loadToday();
});

document.querySelector(".this-week").addEventListener("click", () => {
    navigation.loadThisWeek();
});

document.querySelector(".all").addEventListener("click", () => {
    navigation.loadAll();
});

document.querySelector(".add-task").addEventListener("click", () => {
    addTaskButton.addNewTask(navigation.getSelectedProject());
});

document.querySelector(".add-project").addEventListener("click", () => {
    addProjectButton.addNewProject();
});

document.querySelector(".hamburger-button").addEventListener("click", () => {
    hamburgerButton.openMenu();
});
