// ==========================
// 🔥 FIREWALL SECURITY SCRIPT
// ==========================

// Fetch user's public IP
fetch("https://api.ipify.org?format=json")
  .then(res => res.json())
  .then(data => {
    const userIP = data.ip;
    console.log("User IP detected:", userIP);

    const staticBlocked = ["45.90.0.1", "103.21.244.0"]; // Predefined blocked IPs
    const dynamicBlocked = JSON.parse(localStorage.getItem("blockedIPs") || "[]");
    const isBlocked = staticBlocked.includes(userIP) || dynamicBlocked.includes(userIP);

    // If blocked, show Access Denied screen
    if (isBlocked) {
      document.body.innerHTML = `
        <div style="
          display:flex;
          flex-direction:column;
          justify-content:center;
          align-items:center;
          height:100vh;
          background:#000;
          color:#ff3b3b;
          font-family:monospace;
          text-align:center;">
          <h1>🚫 ACCESS DENIED</h1>
          <p>Your IP: <b>${userIP}</b> has been blocked by the firewall.</p>
          <p>Reason: Suspicious or restricted access attempt.</p>
        </div>
      `;
      throw new Error("Access denied by firewall");
    }

    // ✅ Continue if not blocked
    initFirewall(userIP);
  })
  .catch(err => console.warn("Firewall check failed:", err));

// ==========================
// MAIN FIREWALL FUNCTION
// ==========================
function initFirewall(userIP) {
  const adminIP = "104.28.212.247"; // Replace this with your actual IP
  const unlockAdmin = document.getElementById("unlockAdmin");
  const adminPanel = document.getElementById("adminPanel");

  // Show admin button only for your IP
  fetch("https://api.ipify.org?format=json")
    .then(res => res.json())
    .then(ipData => {
      if (ipData.ip === adminIP) {
        unlockAdmin.style.display = "block";
      }
    });

  // Admin panel unlock
  unlockAdmin.addEventListener("click", () => {
    adminPanel.style.display = "block";
  });

  // --- Helper Functions ---

  // 🔔 Sound Alert
  function playAlertSound() {
    const audio = new Audio("alert.mp3");
    audio.volume = 0.6;
    audio.play().catch(err => console.warn("Sound blocked:", err));
  }

  // 🧾 Log Blocked IPs
  function logBlockedIP(ip) {
    let logs = JSON.parse(localStorage.getItem("firewallLogs") || "[]");
    logs.push({ ip, time: new Date().toLocaleString() });
    localStorage.setItem("firewallLogs", JSON.stringify(logs));
  }

  // 🚫 Block IP Dynamically
  function blockIP(ip) {
    let blocked = JSON.parse(localStorage.getItem("blockedIPs") || "[]");
    if (!blocked.includes(ip)) {
      blocked.push(ip);
      localStorage.setItem("blockedIPs", JSON.stringify(blocked));
      logBlockedIP(ip);
      playAlertSound();
      refreshAdminPanel();
    }
  }

  // 🔁 Refresh Admin Panel Data
  function refreshAdminPanel() {
    const blockedList = document.getElementById("blockedList");
    const logsList = document.getElementById("logsList");

    const blocked = JSON.parse(localStorage.getItem("blockedIPs") || "[]");
    const logs = JSON.parse(localStorage.getItem("firewallLogs") || "[]");

    blockedList.innerHTML = blocked.length
      ? blocked.map(ip => `🔒 ${ip}`).join("<br>")
      : "<i>No blocked IPs</i>";

    logsList.innerHTML = logs.length
      ? logs
          .slice(-8)
          .reverse()
          .map(l => `<div>${l.ip} — <small>${l.time}</small></div>`)
          .join("")
      : "<i>No logs yet</i>";
  }

  // 🧹 Clear Dynamic Blocks
  document.getElementById("clearDynamic").addEventListener("click", () => {
    localStorage.removeItem("blockedIPs");
    alert("✅ Dynamic blocks cleared.");
    refreshAdminPanel();
  });

  // 🔁 Refresh Button
  document.getElementById("refreshAdmin").addEventListener("click", refreshAdminPanel);

  // 🧪 Optional: Simulate Firewall Test (if test button exists)
  const testBtn = document.getElementById("testFirewall");
  if (testBtn) {
    testBtn.addEventListener("click", () => {
      alert("Simulating firewall block for your IP!");
      blockIP(userIP);
    });
  }

  // Initialize panel view
  refreshAdminPanel();
}
