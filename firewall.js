// 🔥 Firewall Simulation + Admin Controls + Toast Notifications

// === CONFIG ===
const ADMIN_IP = "104.28.198.185"; // ← replace with your actual public IP

// Static blocked IPs
const staticBlocked = ["192.168.1.1", "103.21.244.0", "45.90.0.1"];
const suspiciousRanges = [/^45\.90\./, /^103\.21\./];

// Storage keys
const LS_DYNAMIC = "dynamicBlocked";
const LS_LOGS = "firewallLogs";
const LS_CURRENT = "currentIP";

// === MAIN ===
(async function init() {
  try {
    const ipRes = await fetch("https://api.ipify.org?format=json");
    const { ip } = await ipRes.json();
    console.log("Detected public IP:", ip);
    localStorage.setItem(LS_CURRENT, ip);

    // Show admin button if IP matches
    if (ip === ADMIN_IP) {
      const unlock = document.getElementById("unlockAdmin");
      unlock.style.display = "block";
      unlock.addEventListener("click", toggleAdminPanel);
      showToast(`👑 Admin access granted (${ip})`, "green");
    } else {
      showToast(`🌐 Visitor IP detected: ${ip}`, "blue");
    }

    // Check firewall blocks
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

// === ADMIN PANEL TOGGLE ===
function toggleAdminPanel() {
  const panel = document.getElementById("adminPanel");
  if (panel.style.display === "none" || !panel.style.display) {
    panel.style.display = "block";
    renderAdmin();
    showToast("🛠 Admin panel opened", "green");
  } else {
    panel.style.display = "none";
    showToast("❌ Admin panel closed", "gray");
  }
}

// === ADMIN RENDERING ===
function renderAdmin() {
  renderBlockedList();
  renderLogs();
  renderButtons();
}

function renderBlockedList() {
  const container = document.getElementById("blockedList");
  container.innerHTML = "";

  const dynamic = JSON.parse(localStorage.getItem(LS_DYNAMIC)) || [];

  container.innerHTML += `<em style="color:#ffb0a0;">Static rules:</em><br>`;
  staticBlocked.forEach(ip => {
    container.innerHTML += `<div style="color:#ff6b6b; margin:4px 0;">${ip} <small style="opacity:0.6;">(static)</small></div>`;
  });

  if (dynamic.length > 0) {
    container.innerHTML += `<br><em style="color:#ffd8b0;">Dynamic rules:</em><br>`;
    dynamic.forEach(ip => {
      container.innerHTML += `
        <div style="margin:4px 0; display:flex; justify-content:space-between;">
          <span>${ip}</span>
          <button class="unblockBtn" data-ip="${ip}" style="background:#444; color:#fff; border:none; padding:3px 6px; border-radius:5px; cursor:pointer;">Unblock</button>
        </div>`;
    });
  } else {
    container.innerHTML += `<div style="color:#aaa; margin-top:8px;">No dynamic IPs.</div>`;
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

function renderLogs() {
  const logs = JSON.parse(localStorage.getItem(LS_LOGS)) || [];
  const container = document.getElementById("logsList");
  container.innerHTML = "";

  if (logs.length === 0) {
    container.innerHTML = "<div style='color:#aaa;'>No logs yet.</div>";
    return;
  }

  logs.slice(-30).reverse().forEach(log => {
    container.innerHTML += `
      <div style="margin:4px 0; display:flex; justify-content:space-between;">
        <div>${log.ip}<br><small style="opacity:0.6;">${log.time}</small></div>
        <button class="removeLogBtn" data-ip="${log.ip}" data-time="${log.time}" style="background:#333; color:#fff; border:none; padding:3px 6px; border-radius:5px;">X</button>
      </div>`;
  });

  document.querySelectorAll(".removeLogBtn").forEach(btn => {
    btn.addEventListener("click", e => {
      removeLog(e.target.dataset.ip, e.target.dataset.time);
      showToast(`🗑 Log removed`, "gray");
      renderAdmin();
    });
  });
}

function renderButtons() {
  const panel = document.getElementById("adminPanel");
  if (!panel.querySelector("#adminTools")) {
    const div = document.createElement("div");
    div.id = "adminTools";
    div.style.marginTop = "12px";
    div.innerHTML = `
      <button id="testFirewallBtn" style="background:#ff3b3b; color:#fff; border:none; padding:6px 10px; border-radius:6px; cursor:pointer;">Test Firewall 🚨</button>
      <button id="blockIPBtn" style="background:#666; color:#fff; border:none; padding:6px 10px; border-radius:6px; cursor:pointer; margin-left:6px;">Block IP ➕</button>
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

// === DATA HANDLERS ===
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

function removeLog(ip, time) {
  let logs = JSON.parse(localStorage.getItem(LS_LOGS)) || [];
  logs = logs.filter(l => !(l.ip === ip && l.time === time));
  localStorage.setItem(LS_LOGS, JSON.stringify(logs));
}

// === ALERT UI ===
function playAlertSound() {
  const audio = new Audio("alert.mp3");
  audio.volume = 0.7;
  audio.play().catch(() => {});
}

function showBlockOverlay(ip) {
  const overlay = document.createElement("div");
  overlay.style.position = "fixed";
  overlay.style.top = "0";
  overlay.style.left = "0";
  overlay.style.width = "100%";
  overlay.style.height = "100%";
  overlay.style.background = "rgba(0,0,0,0.95)";
  overlay.style.display = "flex";
  overlay.style.flexDirection = "column";
  overlay.style.justifyContent = "center";
  overlay.style.alignItems = "center";
  overlay.style.zIndex = "9999";
  overlay.style.color = "#ff4d4d";
  overlay.style.fontFamily = "monospace";
  overlay.innerHTML = `
    <h1>🚫 Access Denied</h1>
    <p>Your IP: <strong style="color:#fff;">${ip}</strong></p>
    <button onclick="location.href='blocked.html'" style="background:#ff3b3b; color:#fff; border:none; padding:8px 14px; border-radius:6px; margin-top:10px;">View Logs</button>
  `;
  document.body.appendChild(overlay);
}

// === TOAST NOTIFICATIONS ===
function showToast(msg, color = "gray") {
  const toast = document.createElement("div");
  toast.textContent = msg;
  toast.style.position = "fixed";
  toast.style.bottom = "20px";
  toast.style.right = "20px";
  toast.style.background =
    color === "red" ? "#ff4d4d" :
    color === "green" ? "#4caf50" :
    color === "blue" ? "#2196f3" :
    color === "yellow" ? "#ff9800" : "#555";
  toast.style.color = "#fff";
  toast.style.padding = "10px 15px";
  toast.style.borderRadius = "8px";
  toast.style.boxShadow = "0 2px 6px rgba(0,0,0,0.3)";
  toast.style.zIndex = "999999";
  toast.style.fontFamily = "monospace";
  toast.style.opacity = "0";
  toast.style.transition = "opacity 0.4s ease";

  document.body.appendChild(toast);
  setTimeout(() => (toast.style.opacity = "1"), 50);
  setTimeout(() => {
    toast.style.opacity = "0";
    setTimeout(() => toast.remove(), 400);
  }, 4000);
}

// === EXPORT ===
window.__firewall = { addDynamicIP, removeDynamicIP, renderAdmin, showToast };
