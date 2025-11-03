// 🔥 Advanced Firewall Simulation Script (with Admin Mode + Sound Effects)

// === CONFIG ===
const ADMIN_IP = "104.28.244.253"; // 👈 Replace this with *your actual IP* (from console)
const ALERT_SOUND = "alert.mp3"; // must be in same folder

// === Live IP Fetch ===
fetch("https://api.ipify.org?format=json")
  .then(res => res.json())
  .then(data => {
    const userIP = data.ip;
    console.log("User IP detected:", userIP);

    // 🔐 Show test button only if admin
    if (userIP === ADMIN_IP) {
      document.getElementById("testFirewall").style.display = "block";
      console.log("Admin detected — firewall test access granted.");
      setupAdminButton();
    }

    // Simulate blocked IPs or suspicious patterns
    const blockedIPs = ["192.168.1.1", "103.21.244.0", "45.90.0.1", "103.220.82.74"];
    const suspiciousRanges = [/^45\.90\./, /^103\.21\./]; // regex for IP ranges

    let blocked = false;

    if (blockedIPs.includes(userIP)) blocked = true;
    else if (suspiciousRanges.some((r) => r.test(userIP))) blocked = true;

    // 🚫 If IP is blocked
    if (blocked) {
      playAlertSound();
      logBlockedIP(userIP);
      showBlockOverlay(userIP);
    } else {
      console.log("✅ Access granted — Firewall clear");
    }
  })
  .catch(err => {
    console.error("IP check failed:", err);
  });

// === Store blocked IPs (simulated) ===
function logBlockedIP(ip) {
  let logs = JSON.parse(localStorage.getItem("firewallLogs")) || [];
  logs.push({ ip, time: new Date().toLocaleString() });
  localStorage.setItem("firewallLogs", JSON.stringify(logs));
}

// === Play alert sound ===
function playAlertSound() {
  const audio = new Audio(ALERT_SOUND);
  audio.volume = 0.7;
  audio.play().catch(err => console.warn("Audio play blocked by browser:", err));
}

// === Show block overlay ===
function showBlockOverlay(ip) {
  const overlay = document.createElement("div");
  overlay.style = `
    position: fixed; top: 0; left: 0; width: 100%; height: 100%;
    background-color: rgba(0,0,0,0.95);
    display: flex; flex-direction: column;
    justify-content: center; align-items: center;
    color: #ff3b3b; font-family: 'Courier New', monospace;
    z-index: 9999; transition: opacity 1s ease;
  `;

  overlay.innerHTML = `
    <h1 style="font-size:2.5rem;">🚨 Access Denied</h1>
    <p>Your IP <b>${ip}</b> has been blocked by the firewall.</p>
    <p>Reason: Suspicious or restricted access attempt.</p>
    <button id="view-logs" style="margin-top:20px;padding:8px 20px;border:none;border-radius:8px;background:#ff3b3b;color:#fff;cursor:pointer;">View Logs</button>
  `;

  document.body.appendChild(overlay);
  setTimeout(() => (overlay.style.opacity = 1), 100);

  document.getElementById("view-logs").addEventListener("click", () => {
    window.location.href = "blocked.html";
  });
}

// === Admin Button Functionality ===
function setupAdminButton() {
  const btn = document.getElementById("testFirewall");
  if (!btn) return;

  btn.addEventListener("click", () => {
    playAlertSound();
    showBlockOverlay("Simulated Admin Test IP");
  });
}
