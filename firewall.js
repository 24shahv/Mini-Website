// ==========================
// 🔥 FIREWALL SECURITY SCRIPT
// ==========================

// Step 1️⃣ — Detect User IP and Block if Needed
fetch("https://api.ipify.org?format=json")
  .then(res => res.json())
  .then(data => {
    const userIP = data.ip;
    console.log("User IP detected:", userIP);

    const staticBlocked = ["45.90.0.1", "103.21.244.0"]; // Static rules
    const dynamicBlocked = JSON.parse(localStorage.getItem("blockedIPs") || "[]");
    const allBlocked = [...new Set([...staticBlocked, ...dynamicBlocked])];

    if (allBlocked.includes(userIP)) {
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
          <p>Your IP <b>${userIP}</b> has been blocked by the firewall.</p>
          <p>Reason: Suspicious or restricted access attempt.</p>
        </div>
      `;
      throw new Error("Access denied by firewall");
    }

    // ✅ Continue Normal Site Logic
    initFirewall(userIP);
  })
  .catch(err => console.warn("Firewall check failed:", err));


// Step 2️⃣ — Firewall Core
function initFirewall(userIP) {
  const adminIP = "104.28.212.247"; // Replace with your own IP
  const unlockAdmin = document.getElementById("unlockAdmin");
  const adminPanel = document.getElementById("adminPanel");

  // Show Admin Button Only for Admin IP
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

  // 🔔 Sound Alert
  function playAlertSound() {
    const audio = new Audio("alert.mp3");
    audio.volume = 0.7;
    audio.play().catch(() => {});
  }

  // 🧾 Log Blocked IP
  function logBlockedIP(ip) {
    const logs = JSON.parse(localStorage.getItem("firewallLogs") || "[]");
    logs.push({ ip, time: new Date().toLocaleString() });
    localStorage.setItem("firewallLogs", JSON.stringify(logs));
  }

  // 🚫 Block IP Dynamically
  function blockIP(ip) {
    if (!ip) return alert("Please enter an IP!");
    let blocked = JSON.parse(localStorage.getItem("blockedIPs") || "[]");
    if (!blocked.includes(ip)) {
      blocked.push(ip);
      localStorage.setItem("blockedIPs", JSON.stringify(blocked));
      logBlockedIP(ip);
      playAlertSound();
      alert(`✅ IP ${ip} has been blocked.`);
      refreshAdminPanel();
    } else {
      alert("IP is already blocked!");
    }
  }

  // 🔓 Unblock IP
  function unblockIP(ip) {
    let blocked = JSON.parse(localStorage.getItem("blockedIPs") || "[]");
    if (!blocked.includes(ip)) return alert("IP not found in block list!");
    blocked = blocked.filter(b => b !== ip);
    localStorage.setItem("blockedIPs", JSON.stringify(blocked));
    alert(`🟢 IP ${ip} has been unblocked.`);
    refreshAdminPanel();
  }

  // 🧠 Admin Actions
  document.getElementById("refreshAdmin").addEventListener("click", refreshAdminPanel);
  document.getElementById("clearDynamic").addEventListener("click", () => {
    localStorage.removeItem("blockedIPs");
    localStorage.removeItem("firewallLogs");
    alert("🧹 Dynamic blocks and logs cleared!");
    refreshAdminPanel();
  });

  // ➕ Add IP to Block
  document.getElementById("addIPBtn").addEventListener("click", () => {
    const ip = document.getElementById("addIP").value.trim();
    blockIP(ip);
  });

  // ➖ Remove IP
  document.getElementById("removeIPBtn").addEventListener("click", () => {
    const ip = document.getElementById("addIP").value.trim();
    unblockIP(ip);
  });

  // 🧪 Test Firewall on Your Own IP
  document.getElementById("testFirewall").addEventListener("click", () => {
    blockIP(userIP);
  });

  // 🔁 Refresh Admin Panel
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
