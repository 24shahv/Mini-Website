// 🔥 Firewall Simulation - admin panel shows blocked IPs & logs (client-only)

// === CONFIG ===
// Replace with your actual public IP so only you see the Admin button
const ADMIN_IP = "REPLACE_WITH_YOUR_PUBLIC_IP";

// Static blocklist (display-only)
const staticBlocked = ["192.168.1.1", "103.21.244.0", "45.90.0.1"];
const suspiciousRanges = [/^45\.90\./, /^103\.21\./]; // range patterns

// Utility: read/write localStorage keys
const LS_DYNAMIC = "dynamicBlocked";
const LS_LOGS = "firewallLogs";
const LS_CURRENT = "currentIP";

// Fetch public IP and run firewall checks
(async function init() {
  try {
    const ipRes = await fetch("https://api.ipify.org?format=json");
    const ipJson = await ipRes.json();
    const userIP = ipJson.ip;
    console.log("Detected public IP:", userIP);
    localStorage.setItem(LS_CURRENT, userIP);

    // If admin -> show admin unlock button
    if (userIP === ADMIN_IP) {
      const unlock = document.getElementById("unlockAdmin");
      if (unlock) unlock.style.display = "block";
      // when clicked, reveal panel (permanent)
      unlock?.addEventListener("click", () => {
        document.getElementById("adminPanel").style.display = "block";
        renderAdmin(); // initial render
      });
    }

    // Compose full blocklist
    const dynamic = JSON.parse(localStorage.getItem(LS_DYNAMIC)) || [];
    const allBlocked = [...staticBlocked, ...dynamic];

    const isBlocked = (allBlocked.includes(userIP) || suspiciousRanges.some(r => r.test(userIP))) && userIP !== ADMIN_IP;

    if (isBlocked) {
      playAlertSound();
      addLog(userIP);
      showBlockOverlay(userIP);
    } else {
      console.log("Access granted.");
    }
  } catch (e) {
    console.warn("IP detection failed:", e);
  }
})();

// ---------------- admin rendering & actions ----------------

function renderAdmin() {
  renderBlockedList();
  renderLogs();
}

function renderBlockedList() {
  const container = document.getElementById("blockedList");
  if (!container) return;
  container.innerHTML = "";

  const dynamic = JSON.parse(localStorage.getItem(LS_DYNAMIC)) || [];

  // show static blocked (labelled)
  const staticTitle = document.createElement("div");
  staticTitle.style.opacity = "0.9";
  staticTitle.style.marginBottom = "6px";
  staticTitle.innerHTML = "<em style='color:#ffb0a0;'>Static rules:</em>";
  container.appendChild(staticTitle);

  staticBlocked.forEach(ip => {
    const row = document.createElement("div");
    row.style.display = "flex";
    row.style.justifyContent = "space-between";
    row.style.alignItems = "center";
    row.style.marginBottom = "6px";
    row.innerHTML = `<span style="color:#ff6b6b">${ip}</span><small style="opacity:0.75">static</small>`;
    container.appendChild(row);
  });

  // show dynamic list with remove button
  if (dynamic.length === 0) {
    const none = document.createElement("div");
    none.style.color = "#9aa";
    none.style.marginTop = "8px";
    none.textContent = "No dynamic blocked IPs.";
    container.appendChild(none);
  } else {
    const dynTitle = document.createElement("div");
    dynTitle.style.marginTop = "8px";
    dynTitle.style.opacity = "0.9";
    dynTitle.innerHTML = "<em style='color:#ffd8b0;'>Dynamic blocks:</em>";
    container.appendChild(dynTitle);

    dynamic.forEach(ip => {
      const row = document.createElement("div");
      row.style.display = "flex";
      row.style.justifyContent = "space-between";
      row.style.alignItems = "center";
      row.style.marginTop = "6px";

      const left = document.createElement("span");
      left.style.color = "#fff";
      left.style.fontFamily = "monospace";
      left.textContent = ip;

      const btn = document.createElement("button");
      btn.textContent = "Unblock";
      btn.style.background = "#444";
      btn.style.color = "#fff";
      btn.style.border = "none";
      btn.style.padding = "4px 8px";
      btn.style.borderRadius = "6px";
      btn.style.cursor = "pointer";

      btn.addEventListener("click", () => {
        removeDynamicIP(ip);
        renderBlockedList();
        renderLogs();
      });

      row.appendChild(left);
      row.appendChild(btn);
      container.appendChild(row);
    });
  }
}

function renderLogs() {
  const container = document.getElementById("logsList");
  if (!container) return;
  container.innerHTML = "";

  const logs = JSON.parse(localStorage.getItem(LS_LOGS)) || [];
  if (logs.length === 0) {
    container.innerHTML = "<div style='color:#9aa'>No blocked logs yet.</div>";
    return;
  }

  // show up to 30 recent logs (newest first)
  const recent = logs.slice(-30).reverse();
  recent.forEach(entry => {
    const row = document.createElement("div");
    row.style.display = "flex";
    row.style.justifyContent = "space-between";
    row.style.marginTop = "6px";
    row.style.alignItems = "center";

    const left = document.createElement("div");
    left.style.fontFamily = "monospace";
    left.style.fontSize = "13px";
    left.style.color = "#fff";
    left.innerHTML = `<div style="color:#ff8b8b">${entry.ip}</div><div style="opacity:0.7;font-size:12px">${entry.time}</div>`;

    const btns = document.createElement("div");

    const removeBtn = document.createElement("button");
    removeBtn.textContent = "Remove";
    removeBtn.style.marginRight = "6px";
    removeBtn.style.background = "#444";
    removeBtn.style.color = "#fff";
    removeBtn.style.border = "none";
    removeBtn.style.padding = "4px 8px";
    removeBtn.style.borderRadius = "6px";
    removeBtn.style.cursor = "pointer";
    removeBtn.addEventListener("click", () => {
      removeLog(entry.ip, entry.time);
      renderLogs();
    });

    btns.appendChild(removeBtn);
    row.appendChild(left);
    row.appendChild(btns);
    container.appendChild(row);
  });
}

// ---------------- admin helper actions ----------------

function addDynamicIP(ip) {
  if (!ip) return;
  const dynamic = JSON.parse(localStorage.getItem(LS_DYNAMIC)) || [];
  if (!dynamic.includes(ip)) {
    dynamic.push(ip);
    localStorage.setItem(LS_DYNAMIC, JSON.stringify(dynamic));
  }
}

function removeDynamicIP(ip) {
  let dynamic = JSON.parse(localStorage.getItem(LS_DYNAMIC)) || [];
  dynamic = dynamic.filter(i => i !== ip);
  localStorage.setItem(LS_DYNAMIC, JSON.stringify(dynamic));
}

function addLog(ip) {
  if (!ip) return;
  const logs = JSON.parse(localStorage.getItem(LS_LOGS)) || [];
  logs.push({ ip, time: new Date().toLocaleString() });
  localStorage.setItem(LS_LOGS, JSON.stringify(logs));
}

function removeLog(ip, time) {
  let logs = JSON.parse(localStorage.getItem(LS_LOGS)) || [];
  logs = logs.filter(l => !(l.ip === ip && l.time === time));
  localStorage.setItem(LS_LOGS, JSON.stringify(logs));
}

// ---------------- event bindings for admin controls ----------------
document.addEventListener("click", (e) => {
  // refresh button
  if (e.target && e.target.id === "refreshAdmin") {
    renderAdmin();
  }
  // clear dynamic
  if (e.target && e.target.id === "clearDynamic") {
    if (confirm("Clear all dynamic blocked IPs?")) {
      localStorage.removeItem(LS_DYNAMIC);
      renderBlockedList();
      alert("Dynamic blocklist cleared.");
    }
  }
  // block via prompt (admin panel UI does not include input to preserve old style) — you can still add via prompt if needed
  if (e.target && e.target.id === "blockIPBtn") {
    const ip = prompt("Enter IP to block:");
    if (ip) {
      addDynamicIP(ip);
      renderBlockedList();
      alert(`IP ${ip} added to dynamic blocklist.`);
    }
  }
  // Test-firewall button logic (if you used test button)
  if (e.target && e.target.id === "testFirewallBtn") {
    playAlertSound();
    showBlockOverlay("Test-Blocked-IP");
  }
});

// ---------------- UI: blocking overlay & sound ----------------
function playAlertSound() {
  const audio = new Audio("alert.mp3");
  audio.volume = 0.7;
  audio.play().catch(() => {});
}

function showBlockOverlay(ip) {
  // if overlay already exists, remove then recreate to ensure behavior
  const existing = document.getElementById("__fw_overlay");
  if (existing) existing.remove();

  const overlay = document.createElement("div");
  overlay.id = "__fw_overlay";
  overlay.style.position = "fixed";
  overlay.style.top = "0";
  overlay.style.left = "0";
  overlay.style.width = "100%";
  overlay.style.height = "100%";
  overlay.style.background = "rgba(0,0,0,0.96)";
  overlay.style.display = "flex";
  overlay.style.flexDirection = "column";
  overlay.style.justifyContent = "center";
  overlay.style.alignItems = "center";
  overlay.style.color = "#ff4d4d";
  overlay.style.fontFamily = "Courier New, monospace";
  overlay.style.zIndex = "99999";
  overlay.style.textAlign = "center";
  overlay.innerHTML = `
    <h1 style="font-size:2.4rem;margin-bottom:10px;">🚨 Access Denied</h1>
    <div style="font-family:monospace;color:#fff;margin-bottom:6px;">IP: <strong style="color:#ff8b8b">${ip}</strong></div>
    <div style="opacity:0.8;margin-bottom:14px;">Reason: Suspicious or restricted access attempt.</div>
    <button id="viewLogsBtn_overlay" style="padding:8px 14px;border-radius:8px;border:none;background:#ff3b3b;color:#fff;cursor:pointer;">View Logs</button>
  `;
  document.body.appendChild(overlay);

  document.getElementById("viewLogsBtn_overlay").addEventListener("click", () => {
    // open blocked.html in same tab
    window.location.href = "blocked.html";
  });
}

// ---------------- convenience: expose small API on window for debug ----------------
window.__firewall = {
  addDynamicIP,
  removeDynamicIP,
  addLog,
  renderAdmin,
  renderBlockedList,
  renderLogs
};
