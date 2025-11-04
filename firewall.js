// ==========================
// 🔥 FIREWALL SECURITY SCRIPT
// ==========================

fetch("https://api.ipify.org?format=json")
  .then(res => res.json())
  .then(data => {
    const userIP = data.ip;
    console.log("User IP detected:", userIP);

    // 🧱 Static Blocked IPs
    const staticBlocked = [
      "45.90.0.1",
      "103.21.244.0",
      "117.240.136.4" // Blocked as requested
    ];

    // 🧱 Dynamic Blocked IPs (stored locally)
    const dynamicBlocked = JSON.parse(localStorage.getItem("blockedIPs") || "[]");
    const allBlocked = [...new Set([...staticBlocked, ...dynamicBlocked])];

    // 🚫 Redirect Blocked Users to blocked.html
    if (allBlocked.includes(userIP)) {
      console.warn(`⛔ Firewall: ${userIP} is blocked. Redirecting...`);
      window.location.href = "blocked.html";
      return; // Stop script execution
    }

    // ✅ Continue firewall setup for allowed users
    initFirewall(userIP);
  })
  .catch(err => console.warn("Firewall check failed:", err));

// ==========================
// 🔐 Initialize Firewall Logic
// ==========================
function initFirewall(userIP) {
  const adminIP = "104.28.212.247"; // Your IP for admin control
  const unlockAdmin = document.getElementById("unlockAdmin");
  const adminPanel = document.getElementById("adminPanel");

  // 🎛️ Show Admin Button Only for Admin IP
  fetch("https://api.ipify.org?format=json")
    .then(res => res.json())
    .then(ipData => {
      if (ipData.ip === adminIP && unlockAdmin) {
        unlockAdmin.style.display = "block";
      }
    });

  if (unlockAdmin) {
    unlockAdmin.addEventListener("click", () => {
      adminPanel.style.display = "block";
    });
  }

  // 🔔 Play alert sound
  function playAlertSound() {
    const audio = new Audio("alert.mp3");
    audio.volume = 0.7;
    audio.play().catch(() => {});
  }

  // 🧾 Log blocked IPs
  function logBlockedIP(ip) {
    const logs = JSON.parse(localStorage.getItem("firewallLogs") || "[]");
    logs.push({ ip, time: new Date().toLocaleString() });
    localStorage.setItem("firewallLogs", JSON.stringify(logs));
  }

  // 🚫 Dynamically block IP
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

  // 🧠 Admin Controls
  document.getElementById("refreshAdmin")?.addEventListener("click", refreshAdminPanel);
  document.getElementById("clearDynamic")?.addEventListener("click", () => {
    localStorage.removeItem("blockedIPs");
    localStorage.removeItem("firewallLogs");
    alert("🧹 Dynamic blocks and logs cleared!");
    refreshAdminPanel();
  });

  document.getElementById("addIPBtn")?.addEventListener("click", () => {
    const ip = document.getElementById("addIP").value.trim();
    blockIP(ip);
  });

  document.getElementById("removeIPBtn")?.addEventListener("click", () => {
    const ip = document.getElementById("addIP").value.trim();
    unblockIP(ip);
  });

  document.getElementById("testFirewall")?.addEventListener("click", () => {
    blockIP(userIP);
  });

  // 🔁 Refresh Admin Panel UI
  function refreshAdminPanel() {
    const blockedList = document.getElementById("blockedList");
    const logsList = document.getElementById("logsList");

    const blocked = JSON.parse(localStorage.getItem("blockedIPs") || "[]");
    const logs = JSON.parse(localStorage.getItem("firewallLogs") || "[]");

    if (blockedList)
      blockedList.innerHTML = blocked.length
        ? blocked.map(ip => `🔒 ${ip}`).join("<br>")
        : "<i>No blocked IPs</i>";

    if (logsList)
      logsList.innerHTML = logs.length
        ? logs.slice(-5).map(l => `${l.ip} — ${l.time}`).join("<br>")
        : "<i>No logs yet</i>";
  }

  refreshAdminPanel();
}
