import { getItem, setItem } from "./storage";


export default class {
    static #todoList = getItem("todoList") || {};

    static #projectAlreadyExists(name) {
        for (const key in this.#todoList) {
            if (this.#todoList[key].name === name) return true;
        }

        return false;
    }

    static #taskAlreadyExists(projectID, title) {
        for (const key in this.#todoList[projectID].tasks) {
            if (this.#todoList[projectID].tasks[key].title === title) return true;
        }

        return false;
    }

    // Creates a new project and returns the id.
    static createProject() {
        let projectID = 0;

        const LIMIT = 10;
    
        while (true) {
            // Make sure number of projects doesn't exceed the limit.
            if (projectID === LIMIT) return -1;
    
            // Check for free spot.
            if (!this.#todoList.hasOwnProperty(projectID)) {
                let count = projectID + 1;

                while (true) {
                    let newProjectName = "Project" + count;

                    // Check if newname exists.
                    if (!this.#projectAlreadyExists(newProjectName)) {
                        // Add new project.
                        this.#todoList[projectID] = {
                            name: newProjectName,
                            tasks: {}
                        };
                        
                        // Save todoList to local storage
                        setItem("todoList", this.#todoList);
            
                        return projectID;   
                    }
                    
                    count++;
                }
            }
    
            projectID++;
        }
    }
    
    // Saves edits to project.
    static editProject(projectID, newname) {
        // Check if newname already exists.
        if (this.#projectAlreadyExists(newname) && newname !== this.#todoList[projectID].name) return false;
    
        this.#todoList[projectID].name = newname;
    
        setItem("todoList", this.#todoList);
    
        return true;
    }
    
    // Deletes project.
    static deleteProject(projectID) {
        delete this.#todoList[projectID];
    
        setItem("todoList", this.#todoList);
    }
    
    // Creates a new task and returns the id.
    static createTask(projectID) {
        let taskID = 0;
    
        const LIMIT = 10;

        while (true) {
            if (taskID === LIMIT) return -1;

            if (this.#todoList.hasOwnProperty(projectID) && !this.#todoList[projectID].tasks.hasOwnProperty(taskID)) {
                let count = taskID + 1;
                
                while (true) {
                    let newTaskName = "Task" + count;

                    if (!this.#taskAlreadyExists(projectID, newTaskName)) {
                        this.#todoList[projectID].tasks[taskID] = {
                            title: newTaskName,
                            description: "",
                            date: null,
                            priority: "low",
                            completed: false,
                            projectID: projectID
                        };
            
                        setItem("todoList", this.#todoList);
            
                        return taskID;       
                    }

                    count++
                }
            }
    
            taskID++;
        }
    }
    
    // Saves edits to task.
    static editTask(title, description, date, priority, projectID, taskID) {
        if (this.#taskAlreadyExists(projectID, title) && title !== this.#todoList[projectID].tasks[taskID].title) return false;

        const task = this.#todoList[projectID].tasks[taskID];
        task.title = title;
        task.description = description;
        task.date = date;
        task.priority = priority;
    
        setItem("todoList", this.#todoList);

        return true;
    }
    
    // Checks the task.
    static checkTask(projectID, taskID, value) {
        const task = this.#todoList[projectID].tasks[taskID];
        
        task.completed = value;
    
        setItem("todoList", this.#todoList);
    }
    
    // Deletes task.
    static deleteTask(projectID, taskID) {
        delete this.#todoList[projectID].tasks[taskID];
    
        setItem("todoList", this.#todoList);
    }
    
    // Returns object of project names in the form of {projectID: name}.
    static getProjects() {
        const projects = {};
    
        for (const key in this.#todoList) projects[key] = this.#todoList[key].name;
    
        return projects;
    }
    
    // Returns project name.
    static getProjectName(projectID) {
        return this.#todoList[projectID].name;
    }
    
    // Returns all tasks of a specific project.
    static getTasks(projectID) {
        return this.#todoList[projectID].tasks;
    }

    // Returns a task.
    static getTask(projectID, taskID) {
        return this.#todoList[projectID].tasks[taskID];
    }
}
