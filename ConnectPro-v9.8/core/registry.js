class Registry {
  constructor(userId) {
    this.userId = userId;
    this.tasks = {};
    this.locks = new Set();
  }
  registerTask(name) { this.tasks[name] = Date.now(); }
  completeTask(name) { this.tasks[name + '_done'] = Date.now(); }
  getStatus() { return this.tasks; }
}

module.exports = { Registry };
