// 🔥 Firewall Simulation + Admin Controls + Visitor Logging

// === CONFIG ===
const ADMIN_IP = "104.28.212.247"; // Replace with your real IP
const staticBlocked = ["192.168.1.1", "103.21.244.0", "45.90.0.1"];
const suspiciousRanges = [/^45\.90\./, /^103\.21\./];

// Storage keys
const LS_DYNAMIC = "dynamicBlocked";
const LS_LOGS = "firewallLogs";
const LS_VISITORS = "visitorList";
const LS_CURRENT = "currentIP";

// === MAIN ===
(async function init() {
  try {
    const ipRes = await fetch("https://api.ipify.org?format=json");
    const { ip } = await ipRes.json();
    localStorage.setItem(LS_CURRENT, ip);
    console.log("Detected public IP:", ip);

    logVisitor(ip); // ✅ Log every visitor automatically

    // Show admin button if IP matches
    const unlock = document.getElementById("unlockAdmin");
    if (ip === ADMIN_IP && unlock) {
      unlock.style.display = "block";
      unlock.addEventListener("click", toggleAdminPanel);
      showToast(`👑 Admin access granted (${ip})`, "green");
    } else {
      showToast(`🌐 Visitor: ${ip}`, "blue");
    }

    // Check blocks
    const dynamic = JSON.parse(localStorage.getItem(LS_DYNAMIC)) || [];
    const allBlocked = [...staticBlocked, ...dynamic];
    const isBlocked =
      (allBlocked.includes(ip) || suspiciousRanges.some(r => r.test(ip))) &&
      ip !== ADMIN_IP;

    if (isBlocked) {
      addLog(ip);
      playAlertSound();
      showBlockOverlay(ip);
      showToast(`🚫 IP Blocked: ${ip}`, "red");
    }
  } catch (err) {
    console.warn("IP check failed:", err);
  }
})();

// === VISITOR LOGGER ===
function logVisitor(ip) {
  let visitors = JSON.parse(localStorage.getItem(LS_VISITORS)) || [];
  const exists = visitors.find(v => v.ip === ip);
  if (!exists) {
    visitors.push({ ip, time: new Date().toLocaleString() });
    localStorage.setItem(LS_VISITORS, JSON.stringify(visitors));
  }
}

// === ADMIN PANEL TOGGLE ===
function toggleAdminPanel() {
  const panel = document.getElementById("adminPanel");
  if (!panel) return;
  panel.style.display = "block"; // Always visible once opened
  renderAdmin();
  showToast("🛠 Admin panel opened", "green");
}

// === ADMIN RENDERING ===
function renderAdmin() {
  renderBlockedList();
  renderLogs();
  renderVisitors();
  renderButtons();
}

// === Blocked List ===
function renderBlockedList() {
  const container = document.getElementById("blockedList");
  if (!container) return;
  container.innerHTML = "";

  const dynamic = JSON.parse(localStorage.getItem(LS_DYNAMIC)) || [];
  container.innerHTML += `<em style="color:#ffb0a0;">Static rules:</em><br>`;
  staticBlocked.forEach(ip => {
    container.innerHTML += `<div style="color:#ff6b6b;">${ip}</div>`;
  });

  if (dynamic.length > 0) {
    container.innerHTML += `<br><em style="color:#ffd8b0;">Dynamic rules:</em><br>`;
    dynamic.forEach(ip => {
      container.innerHTML += `
        <div style="display:flex;justify-content:space-between;margin:4px 0;">
          <span>${ip}</span>
          <button class="unblockBtn" data-ip="${ip}" style="background:#444;color:#fff;border:none;padding:3px 6px;border-radius:5px;">Unblock</button>
        </div>`;
    });
  } else {
    container.innerHTML += `<div style="color:#aaa;">No dynamic IPs.</div>`;
  }

  document.querySelectorAll(".unblockBtn").forEach(btn => {
    btn.addEventListener("click", e => {
      const ip = e.target.dataset.ip;
      removeDynamicIP(ip);
      showToast(`✅ Unblocked ${ip}`, "green");
      renderAdmin();
    });
  });
}

// === Logs ===
function renderLogs() {
  const logs = JSON.parse(localStorage.getItem(LS_LOGS)) || [];
  const container = document.getElementById("logsList");
  if (!container) return;
  container.innerHTML = logs.length
    ? logs
        .slice(-20)
        .reverse()
        .map(
          log => `<div>${log.ip}<br><small>${log.time}</small></div>`
        )
        .join("")
    : "<div style='color:#aaa;'>No logs yet.</div>";
}

// === Visitors ===
function renderVisitors() {
  const container = document.getElementById("visitorList");
  if (!container) return;
  const visitors = JSON.parse(localStorage.getItem(LS_VISITORS)) || [];
  if (visitors.length === 0) {
    container.innerHTML = "<div style='color:#aaa;'>No visitors yet.</div>";
    return;
  }
  container.innerHTML = visitors
    .slice(-50)
    .reverse()
    .map(
      v => `<div style="margin:3px 0;">${v.ip}<br><small>${v.time}</small></div>`
    )
    .join("");
}

// === Buttons ===
function renderButtons() {
  const panel = document.getElementById("adminPanel");
  if (!panel.querySelector("#adminTools")) {
    const div = document.createElement("div");
    div.id = "adminTools";
    div.style.marginTop = "10px";
    div.innerHTML = `
      <button id="testFirewallBtn" style="background:#ff3b3b;color:#fff;border:none;padding:6px 10px;border-radius:6px;cursor:pointer;">Test Firewall 🚨</button>
      <button id="blockIPBtn" style="background:#666;color:#fff;border:none;padding:6px 10px;border-radius:6px;cursor:pointer;margin-left:6px;">Block IP ➕</button>
    `;
    panel.appendChild(div);

    document.getElementById("testFirewallBtn").addEventListener("click", () => {
      playAlertSound();
      showBlockOverlay("TEST-IP");
      showToast("⚡ Firewall test triggered", "yellow");
    });

    document.getElementById("blockIPBtn").addEventListener("click", () => {
      const ip = prompt("Enter IP to block:");
      if (ip) {
        addDynamicIP(ip);
        showToast(`🚫 Blocked ${ip}`, "red");
        renderAdmin();
      }
    });
  }
}

// === Data Functions ===
function addDynamicIP(ip) {
  const data = JSON.parse(localStorage.getItem(LS_DYNAMIC)) || [];
  if (!data.includes(ip)) {
    data.push(ip);
    localStorage.setItem(LS_DYNAMIC, JSON.stringify(data));
  }
}
function removeDynamicIP(ip) {
  const data = JSON.parse(localStorage.getItem(LS_DYNAMIC)) || [];
  const updated = data.filter(x => x !== ip);
  localStorage.setItem(LS_DYNAMIC, JSON.stringify(updated));
}
function addLog(ip) {
  const logs = JSON.parse(localStorage.getItem(LS_LOGS)) || [];
  logs.push({ ip, time: new Date().toLocaleString() });
  localStorage.setItem(LS_LOGS, JSON.stringify(logs));
}

// === Alert + UI ===
function playAlertSound() {
  const audio = new Audio("alert.mp3");
  audio.volume = 0.7;
  audio.play().catch(() => {});
}

function showBlockOverlay(ip) {
  const overlay = document.createElement("div");
  Object.assign(overlay.style, {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    background: "rgba(0,0,0,0.95)",
    color: "#ff4d4d",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
    fontFamily: "monospace",
  });
  overlay.innerHTML = `
    <h1>🚫 Access Denied</h1>
    <p>Your IP: <b style="color:white;">${ip}</b></p>
    <button onclick="location.href='blocked.html'" style="background:#ff3b3b;color:#fff;border:none;padding:8px 14px;border-radius:6px;">View Logs</button>
  `;
  document.body.appendChild(overlay);
}

// === Toasts ===
function showToast(msg, color = "gray") {
  const toast = document.createElement("div");
  toast.textContent = msg;
  Object.assign(toast.style, {
    position: "fixed",
    bottom: "20px",
    right: "20px",
    background:
      color === "red"
        ? "#ff4d4d"
        : color === "green"
        ? "#4caf50"
        : color === "blue"
        ? "#2196f3"
        : color === "yellow"
        ? "#ff9800"
        : "#555",
    color: "#fff",
    padding: "10px 15px",
    borderRadius: "8px",
    boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
    zIndex: "999999",
    fontFamily: "monospace",
    opacity: "0",
    transition: "opacity 0.4s ease",
  });
  document.body.appendChild(toast);
  setTimeout(() => (toast.style.opacity = "1"), 50);
  setTimeout(() => {
    toast.style.opacity = "0";
    setTimeout(() => toast.remove(), 400);
  }, 4000);
}
