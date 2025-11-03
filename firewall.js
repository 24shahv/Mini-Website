// 🔥 Advanced Firewall Simulation Script (with Admin Access Button + Sound)

// CONFIG
const ADMIN_IP = "104.28.244.253"; // 👈 replace this with your actual IP
const staticBlocked = ["192.168.1.1", "103.21.244.0", "45.90.0.1"];
const suspiciousRanges = [/^45\.90\./, /^103\.21\./];

// Fetch current IP
fetch("https://api.ipify.org?format=json")
  .then(res => res.json())
  .then(data => {
    const userIP = data.ip;
    console.log("User IP detected:", userIP);

    // Allow admin access
    if (userIP === ADMIN_IP) {
      const unlockBtn = document.getElementById("unlockAdmin");
      unlockBtn.style.display = "block";

      unlockBtn.addEventListener("click", () => {
        unlockBtn.style.display = "none";
        document.getElementById("adminPanel").style.display = "block";
      });
    }

    const dynamicBlocked = JSON.parse(localStorage.getItem("dynamicBlocked")) || [];
    const allBlocked = [...staticBlocked, ...dynamicBlocked];

    let blocked = allBlocked.includes(userIP) || suspiciousRanges.some(r => r.test(userIP));

    if (blocked && userIP !== ADMIN_IP) {
      playAlertSound();
      logBlockedIP(userIP);
      showBlockOverlay(userIP);
    } else {
      console.log("✅ Access granted");
    }
  })
  .catch(err => console.error("IP check failed:", err));

// 🧱 Add dynamic block
document.addEventListener("DOMContentLoaded", () => {
  const blockBtn = document.getElementById("blockIPBtn");
  const input = document.getElementById("blockIPInput");

  if (blockBtn) {
    blockBtn.addEventListener("click", () => {
      const ip = input.value.trim();
      if (!ip) return alert("Enter a valid IP!");
      let dynamicBlocked = JSON.parse(localStorage.getItem("dynamicBlocked")) || [];
      if (!dynamicBlocked.includes(ip)) {
        dynamicBlocked.push(ip);
        localStorage.setItem("dynamicBlocked", JSON.stringify(dynamicBlocked));
        alert(`✅ IP ${ip} added to blocklist`);
        input.value = "";
      } else {
        alert(`⚠️ IP ${ip} already blocked`);
      }
    });
  }
});

// 🧾 Log blocked IPs
function logBlockedIP(ip) {
  let logs = JSON.parse(localStorage.getItem("firewallLogs")) || [];
  logs.push({ ip, time: new Date().toLocaleString() });
  localStorage.setItem("firewallLogs", JSON.stringify(logs));
}

// 🔊 Sound alert
function playAlertSound() {
  const audio = new Audio("alert.mp3");
  audio.volume = 0.7;
  audio.play().catch(err => console.warn("Audio play blocked:", err));
}

// 🚫 Overlay
function showBlockOverlay(ip) {
  const overlay = document.createElement("div");
  overlay.style = `
    position:fixed;top:0;left:0;width:100%;height:100%;
    background:black;display:flex;flex-direction:column;
    justify-content:center;align-items:center;color:#ff3b3b;
    font-family:Courier New,monospace;z-index:9999;
  `;
  overlay.innerHTML = `
    <h1 style="font-size:2.5rem;">🚨 Access Denied</h1>
    <p>Your IP <b>${ip}</b> has been blocked by the firewall.</p>
    <p>Reason: Suspicious or restricted access attempt.</p>
    <button id="view-logs" style="margin-top:20px;padding:8px 20px;border:none;border-radius:8px;background:#ff3b3b;color:#fff;cursor:pointer;">View Logs</button>
  `;
  document.body.appendChild(overlay);
  document.getElementById("view-logs").addEventListener("click", () => {
    window.location.href = "blocked.html";
  });
}
