// ==========================
// 🔥 FIREWALL SECURITY SCRIPT
// ==========================

// 1️⃣ EARLY BLOCK CHECK
fetch("https://api.ipify.org?format=json")
  .then(res => res.json())
  .then(data => {
    const userIP = data.ip;
    console.log("User IP detected:", userIP);

    // Static and dynamic block lists
    const staticBlocked = ["45.90.0.1", "103.21.244.0"]; // manual
    const dynamicBlocked = JSON.parse(localStorage.getItem("blockedIPs") || "[]");

    // Combined check
    const isBlocked = staticBlocked.includes(userIP) || dynamicBlocked.includes(userIP);

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
          <h1>🚫 Access Denied</h1>
          <p>Your IP: <b>${userIP}</b> has been blocked by the firewall.</p>
          <p>Reason: Suspicious or restricted access attempt.</p>
        </div>
      `;
      throw new Error("Access denied by firewall");
    }

    // ✅ If not blocked, continue normal logic
    initFirewall(userIP);
  })
  .catch(err => console.warn("Firewall check failed:", err));


// 2️⃣ MAIN FIREWALL FUNCTION
function initFirewall(userIP) {
  const adminIP = "104.28.212.247"; // Replace with your own public IP
  const unlockAdmin = document.getElementById("unlockAdmin");
  const adminPanel = document.getElementById("adminPanel");

  // Show Admin Button only to admin
  fetch("https://api.ipify.org?format=json")
    .then(res => res.json())
    .then(ipData => {
      if (ipData.ip === adminIP) {
        unlockAdmin.style.display = "block";
      }
    });

  unlockAdmin.addEventListener("click", () => {
    adminPanel.style.display = "block";
  });

  // Sound Alert function
  function playAlertSound() {
    const audio = new Audio("alert.mp3");
    audio.volume = 0.7;
    audio.play().catch(err => console.warn("Sound blocked:", err));
  }

  // Log Blocked IPs
  function logBlockedIP(ip) {
    let logs = JSON.parse(localStorage.getItem("firewallLogs") || "[]");
    logs.push({ ip, time: new Date().toLocaleString() });
    localStorage.setItem("firewallLogs", JSON.stringify(logs));
  }

  // Add Dynamic Block
  function blockIP(ip) {
    let blocked = JSON.parse(localStorage.getItem("blockedIPs") || "[]");
    if (!blocked.includes(ip)) blocked.push(ip);
    localStorage.setItem("blockedIPs", JSON.stringify(blocked));
    logBlockedIP(ip);
    playAlertSound();
    refreshAdminPanel();
  }

  // Admin Controls
  document.getElementById("testFirewall").addEventListener("click", () => {
    alert("Simulating Firewall Block on your IP!");
    blockIP(userIP);
  });

  document.getElementById("refreshAdmin").addEventListener("click", refreshAdminPanel);

  document.getElementById("clearDynamic").addEventListener("click", () => {
    localStorage.removeItem("blockedIPs");
    alert("Dynamic blocks cleared.");
    refreshAdminPanel();
  });

  // Refresh Admin Panel Info
  function refreshAdminPanel() {
    const blockedList = document.getElementById("blockedList");
    const logsList = document.getElementById("logsList");

    const blocked = JSON.parse(localStorage.getItem("blockedIPs") || "[]");
    const logs = JSON.parse(localStorage.getItem("firewallLogs") || "[]");

    blockedList.innerHTML = blocked.length
      ? blocked.map(ip => `🔒 ${ip}`).join("<br>")
      : "<i>No blocked IPs</i>";

    logsList.innerHTML = logs.length
      ? logs.slice(-5).map(l => `${l.ip} — ${l.time}`).join("<br>")
      : "<i>No logs yet</i>";
  }

  refreshAdminPanel();
}
