// firewall.js
// Simple client-side firewall simulation (safe for static hosting)

document.addEventListener("DOMContentLoaded", () => {
  const blockedWords = ["DROP", "SELECT", "HACK", "SCRIPT"];
  const blockedIPs = ["45.12.23.9"]; // fake blocked IPs

  // Simulate user IP (random demo)
  const userIP = "192.168.1.101"; // safe local IP placeholder

  // Check if IP is in blocklist
  if (blockedIPs.includes(userIP)) {
    document.body.innerHTML = `
      <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;background:black;color:#ff5555;font-family:sans-serif;">
        <h1>🚫 Access Blocked by FirewallShield</h1>
        <p>Your IP (${userIP}) has been restricted by the Firewall.</p>
      </div>`;
    return;
  }

  // Block suspicious URL queries
  const query = window.location.search.toUpperCase();
  for (const word of blockedWords) {
    if (query.includes(word)) {
      document.body.innerHTML = `
        <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;background:black;color:#ff5555;font-family:sans-serif;">
          <h1>⚠️ Suspicious Activity Detected</h1>
          <p>Blocked due to suspicious query in URL.</p>
        </div>`;
      return;
    }
  }

  console.log("✅ Firewall check passed – site loaded safely");
});
