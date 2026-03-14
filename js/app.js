// Productivity Dashboard Application

/**
 * StorageService - Utility class for Local Storage operations
 * Provides abstraction over localStorage with JSON serialization and error handling
 */
class StorageService {
  /**
   * Retrieves and parses JSON data from Local Storage
   * @param {string} key - The storage key to retrieve
   * @returns {any|null} Parsed data or null if missing/corrupted
   */
  static get(key) {
    try {
      const item = localStorage.getItem(key);
      if (item === null) {
        return null;
      }
      return JSON.parse(item);
    } catch (error) {
      // Handle JSON parse errors for corrupted data
      console.error(`StorageService: Failed to parse data for key "${key}"`, error);
      this.notifyUser('Data corruption detected. Starting with fresh data.', 'warning');
      return null;
    }
  }

  /**
   * Serializes and stores data in Local Storage
   * @param {string} key - The storage key
   * @param {any} value - The value to store (will be JSON serialized)
   * @returns {boolean} True if successful, false if quota exceeded or other error
   */
  static set(key, value) {
    try {
      const serialized = JSON.stringify(value);
      localStorage.setItem(key, serialized);
      return true;
    } catch (error) {
      // Handle quota exceeded errors
      if (error.name === 'QuotaExceededError') {
        console.error('StorageService: Storage quota exceeded', error);
        this.notifyUser('Storage quota exceeded. Your data may not be saved. Please clear some browser data.', 'error');
      } else {
        console.error(`StorageService: Failed to store data for key "${key}"`, error);
        this.notifyUser('Failed to save data. Your changes may not persist.', 'error');
      }
      return false;
    }
  }

  /**
   * Removes an item from Local Storage
   * @param {string} key - The storage key to remove
   */
  static remove(key) {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`StorageService: Failed to remove key "${key}"`, error);
    }
  }

  /**
   * Clears all data from Local Storage
   */
  static clear() {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('StorageService: Failed to clear storage', error);
    }
  }

  /**
   * Checks if Local Storage is available
   * @returns {boolean} True if available, false otherwise
   */
  static isAvailable() {
    try {
      const testKey = '__storage_test__';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Displays a notification to the user about storage issues
   * @param {string} message - The message to display
   * @param {string} type - The notification type ('error', 'warning', 'info')
   */
  static notifyUser(message, type = 'info') {
    const notification = document.getElementById('storage-notification');
    if (notification) {
      notification.textContent = message;
      notification.className = `storage-notification ${type}`;
      notification.style.display = 'block';
      
      // Auto-hide after 5 seconds for non-error messages
      if (type !== 'error') {
        setTimeout(() => {
          notification.style.display = 'none';
        }, 5000);
      }
    }
  }
}

/**
 * GreetingDisplay - Component for displaying time, date, and time-based greeting
 * Updates every second to show current time and appropriate greeting message
 */
class GreetingDisplay {
  /**
   * Creates a new GreetingDisplay instance
   * @param {HTMLElement} containerElement - The DOM element to bind to
   */
  constructor(containerElement) {
    if (!containerElement) {
      throw new Error('GreetingDisplay: Container element is required');
    }
    
    this.element = containerElement;
    this.intervalId = null;
    
    // Get references to child elements
    this.timeDisplay = this.element.querySelector('.time-display');
    this.dateDisplay = this.element.querySelector('.date-display');
    this.greetingMessage = this.element.querySelector('.greeting-message');
    
    if (!this.timeDisplay || !this.dateDisplay || !this.greetingMessage) {
      throw new Error('GreetingDisplay: Required child elements not found');
    }
  }

  /**
   * Initializes the component and starts the update interval
   */
  init() {
    // Display immediately
    this.updateDisplay();
    
    // Update every second
    this.intervalId = setInterval(() => {
      this.updateDisplay();
    }, 1000);
  }

  /**
   * Updates the DOM with current time, date, and greeting
   */
  updateDisplay() {
    const now = new Date();
    
    this.timeDisplay.textContent = this.formatTime(now);
    this.dateDisplay.textContent = this.formatDate(now);
    this.greetingMessage.textContent = this.getGreeting(now.getHours());
  }

  /**
   * Formats a date object to 12-hour time format with AM/PM
   * @param {Date} date - The date to format
   * @returns {string} Time string in format "HH:MM AM/PM"
   */
  formatTime(date) {
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    
    // Convert to 12-hour format
    hours = hours % 12;
    hours = hours === 0 ? 12 : hours; // 0 should be 12
    
    // Pad minutes with leading zero
    const minutesStr = minutes.toString().padStart(2, '0');
    
    // Pad hours with leading zero for consistency
    const hoursStr = hours.toString().padStart(2, '0');
    
    return `${hoursStr}:${minutesStr} ${ampm}`;
  }

  /**
   * Formats a date object to show day of week, month, and day
   * @param {Date} date - The date to format
   * @returns {string} Date string in format "DayOfWeek, Month Day"
   */
  formatDate(date) {
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                    'July', 'August', 'September', 'October', 'November', 'December'];
    
    const dayOfWeek = daysOfWeek[date.getDay()];
    const month = months[date.getMonth()];
    const day = date.getDate();
    
    return `${dayOfWeek}, ${month} ${day}`;
  }

  /**
   * Returns appropriate greeting based on the hour of day
   * @param {number} hour - Hour in 24-hour format (0-23)
   * @returns {string} Greeting message
   */
  getGreeting(hour) {
    if (hour >= 5 && hour <= 11) {
      return 'Good morning';
    } else if (hour >= 12 && hour <= 16) {
      return 'Good afternoon';
    } else if (hour >= 17 && hour <= 20) {
      return 'Good evening';
    } else {
      // 21-23 and 0-4
      return 'Good night';
    }
  }

  /**
   * Cleans up the component by clearing the update interval
   */
  destroy() {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
}

/**
 * FocusTimer - Component for managing a 25-minute Pomodoro countdown timer
 * Provides start, stop, and reset controls with completion notification
 */
class FocusTimer {
  /**
   * Creates a new FocusTimer instance
   * @param {HTMLElement} containerElement - The DOM element to bind to
   */
  constructor(containerElement) {
    if (!containerElement) {
      throw new Error('FocusTimer: Container element is required');
    }
    
    this.element = containerElement;
    this.totalSeconds = 1500; // 25 minutes in seconds
    this.remainingSeconds = 1500;
    this.isRunning = false;
    this.intervalId = null;
    
    // Get references to child elements
    this.timerDisplay = this.element.querySelector('.timer-display');
    this.timerNotification = this.element.querySelector('.timer-notification');
    this.startButton = this.element.querySelector('[data-action="start"]');
    this.stopButton = this.element.querySelector('[data-action="stop"]');
    this.resetButton = this.element.querySelector('[data-action="reset"]');
    
    if (!this.timerDisplay || !this.timerNotification) {
      throw new Error('FocusTimer: Required child elements not found');
    }
  }

  /**
   * Initializes the component and sets up event listeners
   */
  init() {
    // Set up event listeners for buttons
    if (this.startButton) {
      this.startButton.addEventListener('click', () => this.start());
    }
    if (this.stopButton) {
      this.stopButton.addEventListener('click', () => this.stop());
    }
    if (this.resetButton) {
      this.resetButton.addEventListener('click', () => this.reset());
    }
    
    // Display initial time
    this.updateDisplay();
  }

  /**
   * Starts the countdown timer from current remaining time
   */
  start() {
    // Ignore if already running (handle multiple start clicks)
    if (this.isRunning) {
      return;
    }
    
    // Only start if there's time remaining
    if (this.remainingSeconds > 0) {
      this.isRunning = true;
      
      // Hide notification if visible
      if (this.timerNotification) {
        this.timerNotification.style.display = 'none';
      }
      
      // Set up interval to tick every second
      this.intervalId = setInterval(() => {
        this.tick();
      }, 1000);
    }
  }

  /**
   * Stops the countdown timer and preserves remaining time
   */
  stop() {
    // No-op if not running
    if (!this.isRunning) {
      return;
    }
    
    this.isRunning = false;
    
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  /**
   * Resets the timer to 25 minutes and stops if running
   */
  reset() {
    // Stop timer if running
    if (this.isRunning) {
      this.stop();
    }
    
    // Reset to initial duration
    this.remainingSeconds = this.totalSeconds;
    this.isRunning = false;
    
    // Hide notification
    if (this.timerNotification) {
      this.timerNotification.style.display = 'none';
    }
    
    // Update display
    this.updateDisplay();
  }

  /**
   * Decrements time by 1 second and checks for completion
   */
  tick() {
    if (this.remainingSeconds > 0) {
      this.remainingSeconds--;
      this.updateDisplay();
      
      // Check if timer completed
      if (this.remainingSeconds === 0) {
        this.stop();
        this.notifyComplete();
      }
    }
  }

  /**
   * Formats seconds to MM:SS display format
   * @param {number} seconds - Total seconds to format
   * @returns {string} Time string in format "MM:SS"
   */
  formatTime(seconds) {
    // Ensure non-negative
    const totalSeconds = Math.max(0, Math.floor(seconds));
    
    const minutes = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    
    // Pad with leading zeros
    const minutesStr = minutes.toString().padStart(2, '0');
    const secsStr = secs.toString().padStart(2, '0');
    
    return `${minutesStr}:${secsStr}`;
  }

  /**
   * Displays completion notification when timer reaches zero
   */
  notifyComplete() {
    if (this.timerNotification) {
      this.timerNotification.textContent = 'Focus session complete! Time for a break.';
      this.timerNotification.style.display = 'block';
    }
  }

  /**
   * Updates the timer display with current remaining time
   */
  updateDisplay() {
    if (this.timerDisplay) {
      this.timerDisplay.textContent = this.formatTime(this.remainingSeconds);
    }
  }

  /**
   * Cleans up the component by clearing the interval
   */
  destroy() {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
  }
}

/**
 * TaskManager - Component for managing task CRUD operations and persistence
 * Handles creating, editing, toggling, and deleting tasks with Local Storage persistence
 */
class TaskManager {
  /**
   * Creates a new TaskManager instance
   * @param {HTMLElement} containerElement - The DOM element to bind to
   * @param {StorageService} storageService - Reference to StorageService for persistence
   */
  constructor(containerElement, storageService) {
    if (!containerElement) {
      throw new Error('TaskManager: Container element is required');
    }
    
    this.element = containerElement;
    this.storageService = storageService || StorageService;
    this.tasks = [];
    
    // Get references to child elements
    this.taskInput = this.element.querySelector('#task-input');
    this.addButton = this.element.querySelector('[data-action="add-task"]');
    this.taskList = this.element.querySelector('.task-list');
    this.errorMessage = this.element.querySelector('#task-error');
    
    if (!this.taskInput || !this.addButton || !this.taskList) {
      throw new Error('TaskManager: Required child elements not found');
    }
  }

  /**
   * Initializes the component, loads tasks, and sets up event listeners
   */
  init() {
    // Load tasks from storage
    this.loadTasks();
    
    // Set up event listener for add button
    this.addButton.addEventListener('click', () => {
      const text = this.taskInput.value.trim();
      if (text) {
        this.addTask(text);
        this.taskInput.value = ''; // Clear input
        this.hideError();
      } else {
        this.showError('Task cannot be empty. Please enter a task description.');
      }
    });
    
    // Set up event listener for Enter key in input
    this.taskInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        const text = this.taskInput.value.trim();
        if (text) {
          this.addTask(text);
          this.taskInput.value = ''; // Clear input
          this.hideError();
        } else {
          this.showError('Task cannot be empty. Please enter a task description.');
        }
      }
    });
    
    // Clear error message when user starts typing
    this.taskInput.addEventListener('input', () => {
      if (this.taskInput.value.trim()) {
        this.hideError();
      }
    });
    
    // Set up event delegation for task interactions
    this.taskList.addEventListener('click', (e) => {
      const taskItem = e.target.closest('[data-task-id]');
      if (!taskItem) return;
      
      const taskId = taskItem.dataset.taskId;
      const action = e.target.dataset.action;
      
      if (action === 'toggle') {
        this.toggleTask(taskId);
      } else if (action === 'delete') {
        this.deleteTask(taskId);
      } else if (action === 'edit') {
        this.startEdit(taskId, taskItem);
      }
    });
    
    // Initial render
    this.render();
  }

  /**
   * Loads tasks from Local Storage
   */
  loadTasks() {
    const storedTasks = this.storageService.get('tasks');
    this.tasks = Array.isArray(storedTasks) ? storedTasks : [];
  }

  /**
   * Adds a new task with unique ID and validation
   * @param {string} text - The task text
   * @returns {Object|null} The created task object or null if validation fails
   */
  addTask(text) {
    // Validate text
    const trimmedText = text.trim();
    if (!trimmedText) {
      console.warn('TaskManager: Cannot add task with empty text');
      return null;
    }
    
    // Create new task with unique ID
    const task = {
      id: `task_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
      text: trimmedText,
      completed: false,
      createdAt: Date.now()
    };
    
    // Add to tasks array
    this.tasks.push(task);
    
    // Persist and render
    this.saveTasks();
    this.render();
    
    return task;
  }

  /**
   * Updates task text for a given ID
   * @param {string} id - The task ID
   * @param {string} newText - The new task text
   * @returns {boolean} True if successful, false if task not found or validation fails
   */
  editTask(id, newText) {
    // Validate text
    const trimmedText = newText.trim();
    if (!trimmedText) {
      console.warn('TaskManager: Cannot update task with empty text');
      return false;
    }
    
    // Find task by ID
    const task = this.tasks.find(t => t.id === id);
    if (!task) {
      console.warn(`TaskManager: Task with id "${id}" not found`);
      return false;
    }
    
    // Update text
    task.text = trimmedText;
    
    // Persist and render
    this.saveTasks();
    this.render();
    
    return true;
  }

  /**
   * Toggles the completion status of a task
   * @param {string} id - The task ID
   * @returns {boolean} True if successful, false if task not found
   */
  toggleTask(id) {
    // Find task by ID
    const task = this.tasks.find(t => t.id === id);
    if (!task) {
      console.warn(`TaskManager: Task with id "${id}" not found`);
      return false;
    }
    
    // Toggle completed status
    task.completed = !task.completed;
    
    // Persist and render
    this.saveTasks();
    this.render();
    
    return true;
  }

  /**
   * Removes a task from the collection
   * @param {string} id - The task ID
   * @returns {boolean} True if successful, false if task not found
   */
  deleteTask(id) {
    // Find task index
    const index = this.tasks.findIndex(t => t.id === id);
    if (index === -1) {
      console.warn(`TaskManager: Task with id "${id}" not found`);
      return false;
    }
    
    // Remove from array
    this.tasks.splice(index, 1);
    
    // Persist and render
    this.saveTasks();
    this.render();
    
    return true;
  }

  /**
   * Persists current task collection to Local Storage
   */
  saveTasks() {
    this.storageService.set('tasks', this.tasks);
  }

  /**
   * Updates DOM to reflect current task state
   */
  render() {
    // Clear current list
    this.taskList.innerHTML = '';
    
    // Render each task
    this.tasks.forEach(task => {
      const li = document.createElement('li');
      li.className = 'task-item';
      li.dataset.taskId = task.id;
      
      // Add completed class if task is completed
      if (task.completed) {
        li.classList.add('completed');
      }
      
      // Create checkbox for toggle
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.checked = task.completed;
      checkbox.dataset.action = 'toggle';
      checkbox.className = 'task-checkbox';
      
      // Create text span
      const textSpan = document.createElement('span');
      textSpan.className = 'task-text';
      if (task.completed) {
        textSpan.classList.add('completed');
      }
      textSpan.textContent = task.text;
      
      // Create edit button
      const editButton = document.createElement('button');
      editButton.textContent = 'Edit';
      editButton.dataset.action = 'edit';
      editButton.className = 'task-edit-btn';
      
      // Create delete button
      const deleteButton = document.createElement('button');
      deleteButton.textContent = 'Delete';
      deleteButton.dataset.action = 'delete';
      deleteButton.className = 'task-delete-btn';
      
      // Append elements
      li.appendChild(checkbox);
      li.appendChild(textSpan);
      li.appendChild(editButton);
      li.appendChild(deleteButton);
      
      this.taskList.appendChild(li);
    });
  }

  /**
   * Starts inline editing for a task
   * @param {string} id - The task ID
   * @param {HTMLElement} taskItem - The task list item element
   */
  startEdit(id, taskItem) {
    const task = this.tasks.find(t => t.id === id);
    if (!task) return;
    
    const textSpan = taskItem.querySelector('.task-text');
    const currentText = task.text;
    
    // Create input for editing
    const input = document.createElement('input');
    input.type = 'text';
    input.value = currentText;
    input.className = 'task-edit-input';
    
    // Replace text span with input
    textSpan.replaceWith(input);
    input.focus();
    input.select();
    
    // Handle save on Enter or blur
    const saveEdit = () => {
      const newText = input.value.trim();
      if (newText && newText !== currentText) {
        this.editTask(id, newText);
      } else if (!newText) {
        // Show error for empty text
        this.showError('Task cannot be empty. Edit cancelled.');
        this.render();
      } else {
        // Restore original if unchanged
        this.render();
      }
    };
    
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        saveEdit();
      }
    });
    
    input.addEventListener('blur', saveEdit);
    
    // Handle cancel on Escape
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.render(); // Restore without saving
      }
    });
  }

  /**
   * Shows an error message to the user
   * @param {string} message - The error message to display
   */
  showError(message) {
    if (this.errorMessage) {
      this.errorMessage.textContent = message;
      this.errorMessage.style.display = 'block';
    }
  }

  /**
   * Hides the error message
   */
  hideError() {
    if (this.errorMessage) {
      this.errorMessage.style.display = 'none';
    }
  }

  /**
   * Cleans up the component
   */
  destroy() {
    // No intervals to clear, but method provided for consistency
    this.tasks = [];
  }
}

/**
 * LinkManager Component
 * Manages CRUD operations for quick links with Local Storage persistence
 */
class LinkManager {
  /**
   * Creates a new LinkManager instance
   * @param {HTMLElement} containerElement - The DOM element to bind to
   * @param {StorageService} storageService - Reference to StorageService for persistence
   */
  constructor(containerElement, storageService) {
    if (!containerElement) {
      throw new Error('LinkManager: Container element is required');
    }
    
    this.element = containerElement;
    this.storageService = storageService || StorageService;
    this.links = [];
    
    // Get references to child elements
    this.urlInput = this.element.querySelector('#link-url');
    this.nameInput = this.element.querySelector('#link-name');
    this.addButton = this.element.querySelector('[data-action="add-link"]');
    this.linkList = this.element.querySelector('.link-list');
    this.errorMessage = this.element.querySelector('#link-error');
    
    if (!this.urlInput || !this.nameInput || !this.addButton || !this.linkList) {
      throw new Error('LinkManager: Required child elements not found');
    }
  }

  /**
   * Initializes the component, loads links, and sets up event listeners
   */
  init() {
    // Load links from storage
    this.loadLinks();
    
    // Set up event listener for add button
    this.addButton.addEventListener('click', () => {
      this.handleAddLink();
    });
    
    // Set up event listener for Enter key in inputs
    const handleEnter = (e) => {
      if (e.key === 'Enter') {
        this.handleAddLink();
      }
    };
    
    this.urlInput.addEventListener('keypress', handleEnter);
    this.nameInput.addEventListener('keypress', handleEnter);
    
    // Clear error message when user starts typing
    this.urlInput.addEventListener('input', () => {
      if (this.urlInput.value.trim() && this.nameInput.value.trim()) {
        this.hideError();
      }
    });
    
    this.nameInput.addEventListener('input', () => {
      if (this.urlInput.value.trim() && this.nameInput.value.trim()) {
        this.hideError();
      }
    });
    
    // Set up event delegation for link interactions
    this.linkList.addEventListener('click', (e) => {
      const linkItem = e.target.closest('[data-link-id]');
      if (!linkItem) return;
      
      const linkId = linkItem.dataset.linkId;
      const action = e.target.dataset.action;
      
      if (action === 'delete') {
        this.deleteLink(linkId);
      } else if (action === 'open') {
        // Open link in new tab
        const link = this.links.find(l => l.id === linkId);
        if (link) {
          window.open(link.url, '_blank');
        }
      }
    });
    
    // Initial render
    this.render();
  }

  /**
   * Handles adding a new link with validation
   */
  handleAddLink() {
    const url = this.urlInput.value.trim();
    const displayName = this.nameInput.value.trim();
    
    if (!url && !displayName) {
      this.showError('Both URL and display name are required.');
      return;
    }
    
    if (!url) {
      this.showError('URL is required. Please enter a valid URL.');
      return;
    }
    
    if (!displayName) {
      this.showError('Display name is required. Please enter a name for the link.');
      return;
    }
    
    // Basic URL validation
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      this.showError('Please enter a valid URL starting with http:// or https://');
      return;
    }
    
    this.addLink(url, displayName);
    this.urlInput.value = ''; // Clear inputs
    this.nameInput.value = '';
    this.hideError();
  }

  /**
   * Loads links from Local Storage
   */
  loadLinks() {
    const storedLinks = this.storageService.get('links');
    this.links = Array.isArray(storedLinks) ? storedLinks : [];
  }

  /**
   * Adds a new link with unique ID and validation
   * @param {string} url - The link URL
   * @param {string} displayName - The display name for the link
   * @returns {Object|null} The created link object or null if validation fails
   */
  addLink(url, displayName) {
    // Validate inputs
    const trimmedUrl = url.trim();
    const trimmedName = displayName.trim();
    
    if (!trimmedUrl) {
      console.warn('LinkManager: Cannot add link with empty URL');
      return null;
    }
    
    if (!trimmedName) {
      console.warn('LinkManager: Cannot add link with empty display name');
      return null;
    }
    
    // Create new link with unique ID
    const link = {
      id: `link_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
      url: trimmedUrl,
      displayName: trimmedName,
      createdAt: Date.now()
    };
    
    // Add to links array
    this.links.push(link);
    
    // Persist and render
    this.saveLinks();
    this.render();
    
    return link;
  }

  /**
   * Removes a link from the collection
   * @param {string} id - The link ID
   * @returns {boolean} True if successful, false if link not found
   */
  deleteLink(id) {
    // Find link index
    const index = this.links.findIndex(l => l.id === id);
    if (index === -1) {
      console.warn(`LinkManager: Link with id "${id}" not found`);
      return false;
    }
    
    // Remove from array
    this.links.splice(index, 1);
    
    // Persist and render
    this.saveLinks();
    this.render();
    
    return true;
  }

  /**
   * Persists current link collection to Local Storage
   */
  saveLinks() {
    this.storageService.set('links', this.links);
  }

  /**
   * Updates DOM to reflect current links
   */
  render() {
    // Clear current list
    this.linkList.innerHTML = '';
    
    // Render each link
    this.links.forEach(link => {
      const li = document.createElement('li');
      li.className = 'link-item';
      li.dataset.linkId = link.id;
      
      // Create link anchor
      const anchor = document.createElement('a');
      anchor.href = link.url;
      anchor.textContent = link.displayName;
      anchor.className = 'link-anchor';
      anchor.dataset.action = 'open';
      anchor.target = '_blank';
      anchor.rel = 'noopener noreferrer';
      
      // Prevent default and use event delegation instead
      anchor.addEventListener('click', (e) => {
        e.preventDefault();
        window.open(link.url, '_blank');
      });
      
      // Create delete button
      const deleteButton = document.createElement('button');
      deleteButton.textContent = 'Delete';
      deleteButton.dataset.action = 'delete';
      deleteButton.className = 'link-delete-btn';
      
      // Append elements
      li.appendChild(anchor);
      li.appendChild(deleteButton);
      
      this.linkList.appendChild(li);
    });
  }

  /**
   * Shows an error message to the user
   * @param {string} message - The error message to display
   */
  showError(message) {
    if (this.errorMessage) {
      this.errorMessage.textContent = message;
      this.errorMessage.style.display = 'block';
    }
  }

  /**
   * Hides the error message
   */
  hideError() {
    if (this.errorMessage) {
      this.errorMessage.style.display = 'none';
    }
  }

  /**
   * Cleans up the component
   */
  destroy() {
    // No intervals to clear, but method provided for consistency
    this.links = [];
  }
}

/**
 * App - Main application controller
 * Initializes and coordinates all components when DOM is ready
 */
class App {
  /**
   * Creates a new App instance
   */
  constructor() {
    this.greetingDisplay = null;
    this.focusTimer = null;
    this.taskManager = null;
    this.linkManager = null;
  }

  /**
   * Initializes all components in the correct order
   */
  init() {
    // Check if Local Storage is available
    if (!StorageService.isAvailable()) {
      StorageService.notifyUser(
        'Local Storage is unavailable. Your data will not be saved between sessions.',
        'warning'
      );
    }

    // Get DOM elements for each component
    const greetingElement = document.getElementById('greeting-display');
    const timerElement = document.getElementById('focus-timer');
    const taskElement = document.getElementById('task-manager');
    const linkElement = document.getElementById('link-manager');

    // Initialize components
    if (greetingElement) {
      this.greetingDisplay = new GreetingDisplay(greetingElement);
      this.greetingDisplay.init();
    }

    if (timerElement) {
      this.focusTimer = new FocusTimer(timerElement);
      this.focusTimer.init();
    }

    if (taskElement) {
      this.taskManager = new TaskManager(taskElement, StorageService);
      this.taskManager.init();
    }

    if (linkElement) {
      this.linkManager = new LinkManager(linkElement, StorageService);
      this.linkManager.init();
    }
  }

  /**
   * Cleans up all components
   */
  destroy() {
    if (this.greetingDisplay) {
      this.greetingDisplay.destroy();
      this.greetingDisplay = null;
    }

    if (this.focusTimer) {
      this.focusTimer.destroy();
      this.focusTimer = null;
    }

    if (this.taskManager) {
      this.taskManager.destroy();
      this.taskManager = null;
    }

    if (this.linkManager) {
      this.linkManager.destroy();
      this.linkManager = null;
    }
  }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const app = new App();
  app.init();
});
