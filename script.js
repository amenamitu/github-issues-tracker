// Login
if(document.getElementById("loginForm")){
  document.getElementById("loginForm").addEventListener("submit", e => {
    e.preventDefault();
    const user = document.getElementById("username").value;
    const pass = document.getElementById("password").value;
    if(user === "admin" && pass === "admin123"){
       window.location.href = "main.html";
      loadIssues();
    } else {
      alert("Invalid credentials");
    }
  });
}

// Issues API
const url = "https://phi-lab-server.vercel.app/api/v1/lab/issues";

// Load Issues
async function loadIssues(filter="all"){
  const grid = document.getElementById("issuesGrid");
  if(!grid) return;
  grid.innerHTML = "<p>Loading...</p>";

  const res = await fetch(url);
  const result = await res.json();
  const issues = result.data; 

  let filtered = issues;
  if(filter === "open") filtered = issues.filter(i => i.status === "open");
  if(filter === "closed") filtered = issues.filter(i => i.status === "closed");

  updateSummary(filtered);
  renderIssues(filtered);
}

// Summary update
function updateSummary(issues){
  const issueCount = document.getElementById("issueCount");
  if(issueCount){
    issueCount.textContent = `${issues.length} Issues`;
  }
}

// Render Issue Cards
function renderIssues(issues){
  const grid = document.getElementById("issuesGrid");
  grid.innerHTML = "";
  issues.forEach(issue => {
    const card = document.createElement("div");
    card.className = "issue-card";
    card.style.borderTop = issue.status === "open" ? "4px solid green" : "4px solid purple";

    const labelsHTML = issue.labels?.map(label => label).join(", ") || "None";
    const createdDate = issue.createdAt ? new Date(issue.createdAt).toLocaleDateString() : "N/A";

    card.innerHTML = `
      <h3>${issue.title || "No Title"}</h3>
      <p>${issue.description || "No Description"}</p>
      <p><strong>Status:</strong> ${issue.status || "N/A"}</p>
      <p><strong>Author:</strong> ${issue.author || "Unknown"}</p>
      <p><strong>Priority:</strong> ${issue.priority || "N/A"}</p>
      <p><strong>Labels:</strong> ${labelsHTML}</p>
      <div class="card-footer">
        <small>Created: ${createdDate}</small>
      </div>
    `;
    card.onclick = () => openModal(issue.id);
    grid.appendChild(card);
  });
}

// Modal
async function openModal(id){
  const res = await fetch(`https://phi-lab-server.vercel.app/api/v1/lab/issue/${id}`);
  const result = await res.json();
  const issue = result.data;  

  const labelsHTML = issue.labels?.map(label => label).join(", ") || "None";
  const createdDate = issue.createdAt ? new Date(issue.createdAt).toLocaleDateString() : "N/A";
  const updatedDate = issue.updatedAt ? new Date(issue.updatedAt).toLocaleDateString() : "N/A";

  document.getElementById("modalContent").innerHTML = `
    <h2>${issue.title || "No Title"}</h2>
    <p>${issue.description || "No Description"}</p>
    <p><strong>Status:</strong> ${issue.status || "N/A"}</p>
    <p><strong>Author:</strong> ${issue.author || "Unknown"}</p>
    <p><strong>Priority:</strong> ${issue.priority || "N/A"}</p>
    <p><strong>Labels:</strong> ${labelsHTML}</p>
    <p><strong>Created:</strong> ${createdDate}</p>
    <p><strong>Updated:</strong> ${updatedDate}</p>
  `;
  document.getElementById("modal").classList.remove("hidden");
}

// Close Modal
document.getElementById("closeModal")?.addEventListener("click", () => {
  document.getElementById("modal").classList.add("hidden");
});

// Tabs with Active Highlight
function setActiveTab(activeId){
  document.querySelectorAll(".tabs button").forEach(btn => btn.classList.remove("active"));
  document.getElementById(activeId).classList.add("active");
}

document.getElementById("allBtn")?.addEventListener("click", () => {
  setActiveTab("allBtn");
  loadIssues("all");
});
document.getElementById("openBtn")?.addEventListener("click", () => {
  setActiveTab("openBtn");
  loadIssues("open");
});
document.getElementById("closedBtn")?.addEventListener("click", () => {
  setActiveTab("closedBtn");
  loadIssues("closed");
});

// Search
document.getElementById("searchBtn")?.addEventListener("click", async () => {
  const q = document.getElementById("searchInput").value;
  const res = await fetch(`https://phi-lab-server.vercel.app/api/v1/lab/issues/search?q=${q}`);
  const result = await res.json();
  renderIssues(result.data);
  updateSummary(result.data);
});

// Initial load
loadIssues();
