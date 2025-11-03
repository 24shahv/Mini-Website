// 🔥 Advanced Firewall Simulation Script (with Sound Effects)

// Live IP Fetch
fetch("https://api.ipify.org?format=json")
  .then(res => res.json())
  .then(data => {
    const userIP = data.ip;
    console.log("User IP detected:", userIP);

    // Simulate blocked IPs or suspicious patterns
    const blockedIPs = ["192.168.1.1", "103.21.244.0", "45.90.0.1"];
    const suspiciousRanges = [/^45\.90\./, /^103\.21\./]; // regex match for ranges

    let blocked = false;

    if (blockedIPs.includes(userIP)) blocked = true;
    else if (suspiciousRanges.some((r) => r.test(userIP))) blocked = true;

    // If IP is blocked
    if (blocked) {
      playAlertSound(); // 🔊 play alert sound
      logBlockedIP(userIP);
      showBlockOverlay(userIP);
    } else {
      console.log("Access granted ✅");
    }
  })
  .catch(err => {
    console.error("IP check failed:", err);
  });

// 🧠 Store blocked IPs (simulated)
function logBlockedIP(ip) {
  let logs = JSON.parse(localStorage.getItem("firewallLogs")) || [];
  logs.push({ ip, time: new Date().toLocaleString() });
  localStorage.setItem("firewallLogs", JSON.stringify(logs));
}

// 🎵 Play alert sound
function playAlertSound() {
  const audio = new Audio("alert.mp3"); // sound file (place it in same folder)
  audio.volume = 0.7;
  audio.play().catch((err) => console.warn("Audio play blocked by browser:", err));
}

// 🚫 Animated block overlay
function showBlockOverlay(ip) {
  const overlay = document.createElement("div");
  overlay.style.position = "fixed";
  overlay.style.top = 0;
  overlay.style.left = 0;
  overlay.style.width = "100%";
  overlay.style.height = "100%";
  overlay.style.backgroundColor = "rgba(0, 0, 0, 0.95)";
  overlay.style.display = "flex";
  overlay.style.flexDirection = "column";
  overlay.style.justifyContent = "center";
  overlay.style.alignItems = "center";
  overlay.style.color = "#ff3b3b";
  overlay.style.fontFamily = "Courier New, monospace";
  overlay.style.zIndex = 9999;
  overlay.style.transition = "opacity 1s ease";

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
