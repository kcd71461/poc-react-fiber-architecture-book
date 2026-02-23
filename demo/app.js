const BUDGET_MS = 5;
const MAX_LOG = 240;

const elements = {
  addUrgent: document.getElementById("add-urgent"),
  addNormal: document.getElementById("add-normal"),
  addLong: document.getElementById("add-long"),
  mode: document.getElementById("mode"),
  start: document.getElementById("start"),
  stop: document.getElementById("stop"),
  clear: document.getElementById("clear"),
  autoInject: document.getElementById("auto-inject"),
  stats: document.getElementById("stats"),
  budgetFill: document.getElementById("budget-fill"),
  queue: document.getElementById("queue"),
  log: document.getElementById("log"),
  currentTree: document.getElementById("current-tree"),
  wipTree: document.getElementById("wip-tree"),
};

function createBaseTree() {
  return {
    name: "App",
    meta: {
      commits: 0,
      lastTask: "-",
    },
    children: [
      { name: "Header", children: [] },
      {
        name: "Main",
        children: [
          { name: "List", children: [] },
          { name: "Sidebar", children: [] },
        ],
      },
    ],
  };
}

function deepClone(value) {
  return JSON.parse(JSON.stringify(value));
}

function createInitialStats() {
  return {
    phase: "idle",
    activeTask: "-",
    queueSize: 0,
    completedTasks: 0,
    renderUnits: 0,
    yieldCount: 0,
    commitCount: 0,
    swapCount: 0,
    lastSliceMs: 0,
    longestSliceMs: 0,
    lastCommitMs: 0,
    budgetUsage: 0,
    fps: 0,
  };
}

const state = {
  mode: "fiber",
  queue: [],
  logs: [],
  running: false,
  scheduled: false,
  nextTaskId: 1,
  autoTimerId: null,
  maintenanceQueued: false,
  root: {
    current: createBaseTree(),
    workInProgress: null,
  },
  stats: createInitialStats(),
};

state.root.workInProgress = deepClone(state.root.current);

const channel = new MessageChannel();
channel.port1.onmessage = performWorkUntilDeadline;

function nowLabel() {
  return `${(performance.now() / 1000).toFixed(3)}s`;
}

function logPhase(tag, message) {
  state.logs.unshift(`[${nowLabel()}] ${tag} ${message}`);
  if (state.logs.length > MAX_LOG * 2) {
    queueIdleMaintenance();
  }
}

function queueIdleMaintenance() {
  if (state.maintenanceQueued) {
    return;
  }

  state.maintenanceQueued = true;
  requestIdle(
    (deadline) => {
      while (state.logs.length > MAX_LOG && deadline.timeRemaining() > 0) {
        state.logs.pop();
      }
      state.maintenanceQueued = false;
    },
    { timeout: 80 }
  );
}

function requestIdle(callback, options) {
  if ("requestIdleCallback" in window) {
    window.requestIdleCallback(callback, options);
  } else {
    setTimeout(() => {
      callback({
        didTimeout: true,
        timeRemaining: () => 0,
      });
    }, options?.timeout ?? 50);
  }
}

function priorityName(priority) {
  if (priority === 1) return "urgent";
  if (priority === 2) return "normal";
  return "low";
}

function unitCost(priority) {
  if (priority === 1) return 0.14;
  if (priority === 2) return 0.2;
  return 0.26;
}

function busyWait(ms) {
  const end = performance.now() + ms;
  while (performance.now() < end) {
    // CPU work simulation
  }
}

function addTask(priority, label, units) {
  const task = {
    id: state.nextTaskId++,
    priority,
    label,
    totalUnits: units,
    remainingUnits: units,
    createdAt: performance.now(),
  };

  state.queue.push(task);
  state.stats.queueSize = state.queue.length;
  logPhase("Queue", `add #${task.id} (${label}) p${priority} units=${units}`);

  if (state.running) {
    scheduleHostCallback();
  }
}

function pickTaskIndex() {
  let index = 0;
  for (let i = 1; i < state.queue.length; i += 1) {
    const current = state.queue[i];
    const chosen = state.queue[index];
    const higherPriority = current.priority < chosen.priority;
    const samePriorityOlder =
      current.priority === chosen.priority && current.createdAt < chosen.createdAt;

    if (higherPriority || samePriorityOlder) {
      index = i;
    }
  }
  return index;
}

function applyTaskToWip(task) {
  const wip = state.root.workInProgress;
  wip.meta.commits += 1;
  wip.meta.lastTask = `#${task.id} ${task.label}`;

  const main = wip.children[1];
  const dynamicChild = {
    name: `Task-${task.id}`,
    meta: {
      priority: priorityName(task.priority),
      units: task.totalUnits,
    },
    children: [],
  };

  main.children.push(dynamicChild);

  // Keep recent task nodes bounded for readability.
  if (main.children.length > 10) {
    main.children.splice(2, main.children.length - 10);
  }
}

function commitTask(task) {
  state.stats.phase = "commit";
  const commitStart = performance.now();

  applyTaskToWip(task);
  busyWait(0.38);

  state.root.current = deepClone(state.root.workInProgress);
  state.root.workInProgress = deepClone(state.root.current);

  state.stats.commitCount += 1;
  state.stats.swapCount += 1;
  state.stats.completedTasks += 1;
  state.stats.lastCommitMs = performance.now() - commitStart;

  logPhase(
    "Commit",
    `task #${task.id} complete; swapped current <-> workInProgress`
  );

  state.stats.phase = "render";
}

function performRenderUnit(task) {
  state.stats.phase = "render";
  state.stats.activeTask = `#${task.id} ${task.label}`;

  busyWait(unitCost(task.priority));

  task.remainingUnits -= 1;
  state.stats.renderUnits += 1;

  if (task.remainingUnits > 0 && task.remainingUnits % 40 === 0) {
    logPhase(
      "Render",
      `task #${task.id} progressing (${task.remainingUnits} unit(s) left)`
    );
  }
}

function scheduleHostCallback() {
  if (!state.running || state.scheduled) {
    return;
  }
  state.scheduled = true;
  channel.port2.postMessage(null);
}

function processNextTaskUnit() {
  const taskIndex = pickTaskIndex();
  const task = state.queue[taskIndex];

  performRenderUnit(task);

  if (task.remainingUnits <= 0) {
    state.queue.splice(taskIndex, 1);
    commitTask(task);
  }
}

function performWorkUntilDeadline() {
  state.scheduled = false;
  if (!state.running) {
    return;
  }

  const start = performance.now();
  let yielded = false;
  if (state.mode === "fiber") {
    const deadline = start + BUDGET_MS;
    while (state.queue.length > 0 && performance.now() < deadline) {
      processNextTaskUnit();
    }

    if (state.queue.length > 0) {
      yielded = true;
      state.stats.yieldCount += 1;
      scheduleHostCallback();
    } else {
      state.stats.phase = "idle";
      state.stats.activeTask = "-";
    }
  } else {
    // Stack mode intentionally blocks until all pending work is done.
    while (state.queue.length > 0) {
      processNextTaskUnit();
    }
    state.stats.phase = "idle";
    state.stats.activeTask = "-";
  }

  const elapsed = performance.now() - start;
  state.stats.lastSliceMs = elapsed;
  state.stats.longestSliceMs = Math.max(state.stats.longestSliceMs, elapsed);
  state.stats.budgetUsage = (elapsed / BUDGET_MS) * 100;
  state.stats.queueSize = state.queue.length;

  if (yielded) {
    logPhase("Yield", `remaining queue=${state.queue.length}; hand back to browser`);
  }
}

function startScheduler() {
  if (state.running) {
    return;
  }
  state.running = true;
  state.stats.phase = "render";
  logPhase("System", `scheduler started (mode=${state.mode})`);
  scheduleHostCallback();
}

function stopScheduler() {
  if (!state.running) {
    return;
  }
  state.running = false;
  state.scheduled = false;
  state.stats.phase = "idle";
  state.stats.activeTask = "-";
  logPhase("System", "scheduler stopped");
}

function clearAll() {
  stopScheduler();
  state.queue = [];
  state.logs = [];
  state.nextTaskId = 1;
  state.root.current = createBaseTree();
  state.root.workInProgress = deepClone(state.root.current);
  state.stats = createInitialStats();
}

function setMode(mode) {
  if (mode !== "fiber" && mode !== "stack") {
    return;
  }
  state.mode = mode;
  logPhase("System", `comparison mode -> ${mode}`);
  if (state.running) {
    scheduleHostCallback();
  }
}

function setAutoInject(enabled) {
  if (enabled) {
    if (state.autoTimerId !== null) {
      return;
    }

    state.autoTimerId = setInterval(() => {
      const roll = Math.random();
      if (roll < 0.2) {
        addTask(1, "urgent-input", 16);
      } else if (roll < 0.7) {
        addTask(2, "normal-update", 42);
      } else {
        addTask(3, "low-priority-list", 90);
      }
    }, 600);
    logPhase("System", "auto inject enabled");
  } else if (state.autoTimerId !== null) {
    clearInterval(state.autoTimerId);
    state.autoTimerId = null;
    logPhase("System", "auto inject disabled");
  }
}

function updateStatsUI() {
  const rows = [
    ["Mode", state.mode],
    ["Phase", state.stats.phase],
    ["Active Task", state.stats.activeTask],
    ["Queue Size", String(state.stats.queueSize)],
    ["Render Units", String(state.stats.renderUnits)],
    ["Completed", String(state.stats.completedTasks)],
    ["Yields", String(state.stats.yieldCount)],
    ["Commits", String(state.stats.commitCount)],
    ["Swaps", String(state.stats.swapCount)],
    ["Last Slice", `${state.stats.lastSliceMs.toFixed(2)}ms`],
    ["Longest Slice", `${state.stats.longestSliceMs.toFixed(2)}ms`],
    ["Last Commit", `${state.stats.lastCommitMs.toFixed(2)}ms`],
    ["FPS", state.stats.fps.toFixed(1)],
  ];

  elements.stats.innerHTML = rows
    .map(([k, v]) => `<dt>${k}</dt><dd>${v}</dd>`)
    .join("");

  elements.budgetFill.style.width = `${Math.min(state.stats.budgetUsage, 100)}%`;
}

function updateQueueUI() {
  if (state.queue.length === 0) {
    elements.queue.innerHTML = "<li>Queue is empty</li>";
    return;
  }

  const sorted = [...state.queue].sort((a, b) => {
    if (a.priority !== b.priority) {
      return a.priority - b.priority;
    }
    return a.createdAt - b.createdAt;
  });

  elements.queue.innerHTML = sorted
    .map((task) => {
      const name = priorityName(task.priority);
      return `<li>
        <span class="badge ${name}">${name.toUpperCase()}</span>
        #${task.id} ${task.label}<br />
        remaining ${task.remainingUnits}/${task.totalUnits}
      </li>`;
    })
    .join("");
}

function updateLogUI() {
  const visible = state.logs.slice(0, 80);
  if (visible.length === 0) {
    elements.log.innerHTML = "<li>No log yet</li>";
    return;
  }

  elements.log.innerHTML = visible.map((line) => `<li>${line}</li>`).join("");
}

function updateTreeUI() {
  elements.currentTree.textContent = JSON.stringify(state.root.current, null, 2);
  elements.wipTree.textContent = JSON.stringify(state.root.workInProgress, null, 2);
}

let lastFrameTime = performance.now();
function renderFrame(ts) {
  const delta = ts - lastFrameTime;
  if (delta > 0) {
    const fpsInstant = 1000 / delta;
    state.stats.fps = state.stats.fps === 0 ? fpsInstant : state.stats.fps * 0.85 + fpsInstant * 0.15;
  }
  lastFrameTime = ts;

  updateStatsUI();
  updateQueueUI();
  updateLogUI();
  updateTreeUI();

  requestAnimationFrame(renderFrame);
}

function bindEvents() {
  elements.addUrgent.addEventListener("click", () => addTask(1, "urgent-input", 18));
  elements.addNormal.addEventListener("click", () => addTask(2, "normal-render", 52));
  elements.addLong.addEventListener("click", () => addTask(3, "low-priority-list", 120));
  elements.mode.addEventListener("change", (event) => setMode(event.target.value));
  elements.start.addEventListener("click", startScheduler);
  elements.stop.addEventListener("click", stopScheduler);
  elements.clear.addEventListener("click", clearAll);

  elements.autoInject.addEventListener("change", (event) => {
    const checked = event.target.checked;
    setAutoInject(checked);
  });
}

bindEvents();
requestAnimationFrame(renderFrame);
setMode(elements.mode.value);
logPhase("System", "ready");
