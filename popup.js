chrome.storage.local.get("usage", (data) => {
    const statsDiv = document.getElementById("stats");
    const usage = data.usage || {};
    for (let site in usage) {
      const seconds = Math.round(usage[site] / 1000);
      statsDiv.innerHTML += `<p><strong>${site}:</strong> ${seconds}s</p>`;
    }
  });
  