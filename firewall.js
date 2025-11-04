// ==========================
// 🔥 FIREWALL SECURITY SCRIPT
// ==========================

fetch("https://api.ipify.org?format=json")
  .then(res => res.json())
  .then(data => {
    const userIP = data.ip;
    console.log("User IP detected:", userIP);

    const staticBlocked = ["45.90.0.1", "103.21.244.0"];
    const dynamicBlocked = JSON.parse(localStorage.getItem("blockedIPs") || "[]");
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
          <h1>🚫 ACCESS DENIED</h1>
          <p>Your IP: <b>${userIP}</b> has been blocked by the firewall.</p>
          <p>Reason: Suspicious or restricted access attempt.</p>
        </div>
      `;
      throw new Error("Access denied by firewall");
    }

    initFirewall(userIP);
  })
  .catch(err => console.warn("Firewall check failed:", err));

function initFirewall(userIP) {
  const adminIP = "104.28.212.247"; // Change to your IP
  const unlockAdmin = document.getElementById("unlockAdmin");
  const adminPanel = document.getElementById("adminPanel");

  fetch("https://api.ipify.org?format=json")
    .then(res => res.json())
    .then(ipData => {
      if (ipData.ip === adminIP) unlockAdmin.style.display = "block";
    });

  unlockAdmin.addEventListener("click", () => {
    adminPanel.style.display = "block";
  });

  function playAlertSound() {
    const audio = new Audio("alert.mp3");
    audio.volume = 0.5;
    audio.play().catch(() => {});
  }

  function logBlockedIP(ip) {
    let logs = JSON.parse(localStorage.getItem("firewallLogs") || "[]");
    logs.push({ ip, time: new Date().toLocaleString() });
    localStorage.setItem("firewallLogs", JSON.stringify(logs));
  }

  function blockIP(ip) {
    if (!ip) return alert("Enter a valid IP address!");
    let blocked = JSON.parse(localStorage.getItem("blockedIPs") || "[]");
    if (!blocked.includes(ip)) {
      blocked.push(ip);
      localStorage.setItem("blockedIPs", JSON.stringify(blocked));
      logBlockedIP(ip);
      playAlertSound();
      refreshAdminPanel();
      alert(`✅ IP ${ip} added to block list.`);
    } else {
      alert("⚠️ IP is already blocked.");
    }
  }

  function unblockIP(ip) {
    let blocked = JSON.parse(localStorage.getItem("blockedIPs") || "[]");
    blocked = blocked.filter(b => b !== ip);
    localStorage.setItem("blockedIPs", JSON.stringify(blocked));
    refreshAdminPanel();
    alert(`🟢 IP ${ip} removed from block list.`);
  }

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

  document.getElementById("clearDynamic").addEventListener("click", () => {
    localStorage.removeItem("blockedIPs");
    refreshAdminPanel();
    alert("✅ Dynamic blocks cleared.");
  });

  document.getElementById("refreshAdmin").addEventListener("click", refreshAdminPanel);

  // ✅ Add IP
  document.getElementById("addIPBtn").addEventListener("click", () => {
    const ip = document.getElementById("addIP").value.trim();
    blockIP(ip);
  });

  // ✅ Remove IP
  document.getElementById("removeIPBtn").addEventListener("click", () => {
    const ip = document.getElementById("addIP").value.trim();
    unblockIP(ip);
  });

  // ✅ Test Firewall
  document.getElementById("testFirewall").addEventListener("click", () => {
    alert("⚠️ Simulating block for your IP...");
    blockIP(userIP);
  });

  refreshAdminPanel();
}
