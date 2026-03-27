class Registry {
  constructor(userId) {
    this.userId = userId;
    this.tasks = {};
    this.locks = new Set();
    this.strategyAttempts = [];
  }
  registerTask(name) { this.tasks[name] = Date.now(); }
  completeTask(name) { this.tasks[name + '_done'] = Date.now(); }
  recordStrategyAttempt({ service, strategy, step }) {
    this.strategyAttempts.push({
      service,
      strategy,
      step,
      startedAt: new Date().toISOString(),
      status: 'started'
    });
  }
  recordStrategyOutcome({ service, strategy, status, reason = null }) {
    const lastMatch = [...this.strategyAttempts].reverse().find((attempt) =>
      attempt.service === service && attempt.strategy === strategy && attempt.status === 'started'
    );

    if (lastMatch) {
      lastMatch.status = status;
      lastMatch.reason = reason;
      lastMatch.finishedAt = new Date().toISOString();
      return;
    }

    this.strategyAttempts.push({
      service,
      strategy,
      step: null,
      startedAt: null,
      status,
      reason,
      finishedAt: new Date().toISOString()
    });
  }
  getStatus() {
    return {
      ...this.tasks,
      strategyAttempts: this.strategyAttempts
    };
  }
}

module.exports = { Registry };
