// 🔥 Firewall Simulation Script (Admin Unlock + Sound + IP Blocking)

// 👑 Replace this with YOUR real IP (admin access)
const ADMIN_IP = "104.28.244.253";

// Static + dynamic blocklists
const staticBlocked = ["192.168.1.1", "103.21.244.0", "45.90.0.1"];
const suspiciousRanges = [/^45\.90\./, /^103\.21\./];

// Fetch current user's IP
fetch("https://api.ipify.org?format=json")
  .then(res => res.json())
  .then(data => {
    const userIP = data.ip;
    console.log("Detected IP:", userIP);

    // Save current IP to localStorage
    localStorage.setItem("currentIP", userIP);

    // If admin IP → enable hidden unlock button
    if (userIP === ADMIN_IP) {
      document.getElementById("unlockAdmin").style.display = "block";
      console.log("✅ Admin detected");
    }

    // Combine all blocklists
    const dynamicBlocked = JSON.parse(localStorage.getItem("dynamicBlocked")) || [];
    const allBlocked = [...staticBlocked, ...dynamicBlocked];

    // Check if user is blocked
    const isBlocked =
      (allBlocked.includes(userIP) ||
        suspiciousRanges.some(r => r.test(userIP))) &&
      userIP !== ADMIN_IP;

    if (isBlocked) {
      playAlertSound();
      logBlockedIP(userIP);
      showBlockOverlay(userIP);
    } else {
      console.log("✅ Access granted");
    }
  })
  .catch(err => console.error("IP detection failed:", err));

// 🎛️ Admin unlock system
document.getElementById("unlockAdmin").addEventListener("click", () => {
  const userIP = localStorage.getItem("currentIP");
  if (userIP === ADMIN_IP) {
    document.getElementById("adminControls").style.display = "block";
    alert("🧠 Admin panel unlocked!");
  } else {
    alert("❌ Unauthorized: Only admin can unlock this panel.");
  }
});

// 🧱 Add dynamic block
document.addEventListener("DOMContentLoaded", () => {
  const addBtn = document.getElementById("addBlockedIP");
  if (!addBtn) return;

  addBtn.addEventListener("click", () => {
    const ip = prompt("Enter IP to block:");
    if (!ip) return alert("Enter a valid IP address.");
    let dynamicBlocked = JSON.parse(localStorage.getItem("dynamicBlocked")) || [];
    if (!dynamicBlocked.includes(ip)) {
      dynamicBlocked.push(ip);
      localStorage.setItem("dynamicBlocked", JSON.stringify(dynamicBlocked));
      alert(`🚫 IP ${ip} added to blocklist!`);
    } else {
      alert(`⚠️ IP ${ip} already blocked.`);
    }
  });

  // Test Firewall button
  const testBtn = document.getElementById("testFirewall");
  if (testBtn) {
    testBtn.addEventListener("click", () => {
      playAlertSound();
      showBlockOverlay("Simulated-Blocked-IP");
    });
  }
});

// 🧠 Logging system
function logBlockedIP(ip) {
  let logs = JSON.parse(localStorage.getItem("firewallLogs")) || [];
  logs.push({ ip, time: new Date().toLocaleString() });
  localStorage.setItem("firewallLogs", JSON.stringify(logs));
}

// 🔊 Sound alert
function playAlertSound() {
  const audio = new Audio("alert.mp3");
  audio.volume = 0.7;
  audio.play().catch(() => console.warn("🔇 Autoplay blocked"));
}

// 🚫 Overlay Display
function showBlockOverlay(ip) {
  const overlay = document.createElement("div");
  overlay.style = `
    position:fixed;top:0;left:0;width:100%;height:100%;
    background:black;color:#ff3b3b;
    display:flex;flex-direction:column;justify-content:center;align-items:center;
    font-family:'Courier New',monospace;z-index:9999;
  `;
  overlay.innerHTML = `
    <h1 style="font-size:2.5rem;">🚨 Access Denied</h1>
    <p>Your IP <b>${ip}</b> has been blocked by the firewall.</p>
    <p>Reason: Suspicious or restricted access attempt.</p>
    <button id="viewLogs" style="margin-top:20px;padding:10px 20px;border:none;border-radius:8px;background:#ff3b3b;color:#fff;cursor:pointer;">View Logs</button>
  `;
  document.body.appendChild(overlay);

  document.getElementById("viewLogs").addEventListener("click", () => {
    window.location.href = "blocked.html";
  });
}
