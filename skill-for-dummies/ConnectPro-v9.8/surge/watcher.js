class SurgeWatcher {
  constructor(
    userId,
    {
      intervalMs = 60000,
      autoStart = true,
      validateEachTask = true,
      now = () => new Date()
    } = {}
  ) {
    this.userId = userId;
    this.intervalMs = intervalMs;
    this.autoStart = autoStart;
    this.validateEachTask = validateEachTask;
    this.now = now;
    this.timer = null;
    this.mcp = null;
    this.lastReport = null;
    this.sprint = null;
  }

  monitor(mcp) {
    this.mcp = mcp;
    this.lastReport = this.checkNow(mcp);

    if (this.autoStart) {
      this.start();
    }

    return this.lastReport;
  }

  beginSprint({ sprintId = null, tasks = null, context = null } = {}) {
    this.sprint = {
      id: sprintId || `sprint_${Date.now()}`,
      startedAt: this.now().toISOString(),
      tasks: Array.isArray(tasks) ? tasks.slice() : null,
      context: context || null,
      taskReports: [],
      sprintReports: []
    };
    return this.sprint;
  }

  onTaskComplete(
    taskName,
    { registryStatus = null, mcp = this.mcp, rawProvision = null, validation = null, security = null } = {}
  ) {
    if (!this.validateEachTask) return null;
    if (!this.sprint) this.beginSprint();

    const health = this.checkNow(mcp);
    const checks = [...health.checks];
    const issues = [...health.issues];

    const strategyAttempts = Array.isArray(registryStatus?.strategyAttempts)
      ? registryStatus.strategyAttempts
      : [];

    const failedAttempts = strategyAttempts.filter((attempt) => attempt?.status === 'failed');
    checks.push({
      name: 'strategy_failures',
      passed: failedAttempts.length === 0,
      count: failedAttempts.length
    });
    if (failedAttempts.length > 0) {
      issues.push({ code: 'strategy_failures_present', severity: 'warning', count: failedAttempts.length });
    }

    const provisioned = Array.isArray(rawProvision?.services) ? rawProvision.services : null;
    if (provisioned) {
      const missingProxy = provisioned.filter((service) => !service?.proxyKey);
      checks.push({
        name: 'raw_provision_proxy_keys',
        passed: missingProxy.length === 0,
        count: missingProxy.length
      });
      if (missingProxy.length > 0) {
        issues.push({ code: 'missing_proxy_key_in_provision', severity: 'critical', count: missingProxy.length });
      }
    }

    if (security) {
      checks.push({ name: 'security_passed', passed: Boolean(security.passed) });
      if (!security.passed) {
        issues.push({ code: 'security_failed', severity: 'critical' });
      }
    }

    if (validation) {
      checks.push({ name: 'validation_passed', passed: Boolean(validation.valid) });
      if (!validation.valid) {
        issues.push({ code: 'validation_failed', severity: 'critical', error: validation.error || null });
      }
    }

    const score = this.scoreFromIssues(issues);
    const report = {
      type: 'task_validation',
      task: taskName,
      checkedAt: this.now().toISOString(),
      healthy: issues.every((issue) => issue.severity !== 'critical'),
      score,
      checks,
      issues
    };

    this.sprint.taskReports.push(report);
    this.lastReport = report;
    return report;
  }

  endSprint({ mcp = this.mcp } = {}) {
    if (!this.sprint) return null;

    const report = this.checkNow(mcp);
    const issues = [...report.issues];
    const score = this.scoreFromIssues(issues);

    const sprintReport = {
      type: 'sprint_validation',
      sprintId: this.sprint.id,
      startedAt: this.sprint.startedAt,
      endedAt: this.now().toISOString(),
      healthy: issues.every((issue) => issue.severity !== 'critical'),
      score,
      checks: report.checks,
      issues,
      taskReports: this.sprint.taskReports
    };

    this.sprint.sprintReports.push(sprintReport);
    return sprintReport;
  }

  start() {
    if (this.timer) return;

    this.timer = setInterval(() => {
      this.lastReport = this.checkNow();
    }, this.intervalMs);

    if (typeof this.timer.unref === 'function') {
      this.timer.unref();
    }
  }

  stop() {
    if (!this.timer) return;
    clearInterval(this.timer);
    this.timer = null;
  }

  scoreFromIssues(issues) {
    let score = 10;
    for (const issue of issues || []) {
      if (issue.severity === 'critical') score -= 2;
      if (issue.severity === 'warning') score -= 1;
    }
    if (score < 0) score = 0;
    return score;
  }

  checkNow(mcp = this.mcp) {
    const checks = [];
    const issues = [];
    const checkedAt = this.now().toISOString();

    if (!mcp?.id) {
      issues.push({ code: 'missing_mcp_id', severity: 'critical' });
    }

    checks.push({
      name: 'mcp_status',
      passed: mcp?.status === 'active',
      value: mcp?.status || null
    });
    if (mcp?.status !== 'active') {
      issues.push({ code: 'mcp_not_active', severity: 'critical', value: mcp?.status || null });
    }

    const proxyCredentials = Array.isArray(mcp?.proxyCredentials) ? mcp.proxyCredentials : [];
    const hasProxyCredentials = proxyCredentials.length > 0 && proxyCredentials.every((entry) => entry?.proxyKey);
    checks.push({
      name: 'proxy_credentials',
      passed: hasProxyCredentials,
      count: proxyCredentials.length
    });
    if (!hasProxyCredentials) {
      issues.push({ code: 'missing_proxy_credentials', severity: 'critical' });
    }

    const expired = proxyCredentials.filter((entry) =>
      entry?.expiresAt && new Date(entry.expiresAt).getTime() <= this.now().getTime()
    );
    checks.push({
      name: 'credential_expiration',
      passed: expired.length === 0,
      count: expired.length
    });
    for (const entry of expired) {
      issues.push({
        code: 'expired_credential',
        severity: 'critical',
        service: entry.service || null
      });
    }

    const envVars = Array.isArray(mcp?.envFile?.variables) ? mcp.envFile.variables : [];
    checks.push({
      name: 'env_handoff',
      passed: envVars.length > 0,
      count: envVars.length,
      path: mcp?.envFile?.path || null
    });
    if (envVars.length === 0) {
      issues.push({ code: 'missing_env_handoff', severity: 'warning' });
    }

    return {
      userId: this.userId,
      mcpId: mcp?.id || null,
      checkedAt,
      healthy: issues.every((issue) => issue.severity !== 'critical'),
      checks,
      issues
    };
  }
}

module.exports = SurgeWatcher;
