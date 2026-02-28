// Hamburger toggle
const menu = document.getElementById("adminMenu");
document.getElementById("hamburgerBtn").addEventListener("click", () => {
  menu.classList.toggle("open");
});
document.getElementById("menuCloseBtn").addEventListener("click", () => {
  menu.classList.remove("open");
});

// Admin login
const adminLoginBtn = document.getElementById("adminLoginBtn");
const adminPasswordInput = document.getElementById("adminPasswordInput");
const adminPanel = document.getElementById("adminPanel");
adminLoginBtn.addEventListener("click", () => {
  const input = adminPasswordInput.value;
  const saved = localStorage.getItem("adminPassword");
  if (!saved) {
    localStorage.setItem("adminPassword", input);
    localStorage.setItem("isAdmin", "true");
    alert("Wachtwoord aangemaakt en ingelogd");
    menu.classList.remove("open");
    loadAdminPanel();
  } else if (input === saved) {
    localStorage.setItem("isAdmin", "true");
    alert("Ingelogd");
    menu.classList.remove("open");
    loadAdminPanel();
  } else {
    alert("Verkeerd wachtwoord");
  }
});

function loadAdminPanel() {
  adminPanel.style.display = "flex";
  startPage.style.display = "none";
  renderAdminPlaylists();
}

// Logout
document.getElementById("logoutBtn").addEventListener("click", () => {
  localStorage.removeItem("isAdmin");
  adminPanel.style.display = "none";
  startPage.style.display = "block";
});

// Playlists opslaan
let allowedPlaylists = JSON.parse(localStorage.getItem("allowedPlaylists") || "[]");

// Admin playlist beheer
const addPlaylistBtn = document.getElementById("addPlaylistBtn");
const newPlaylistInput = document.getElementById("newPlaylistInput");
const playlistsList = document.getElementById("playlistsList");

addPlaylistBtn.addEventListener("click", () => {
  const input = newPlaylistInput.value.trim();
  const id = extractPlaylistId(input);
  if (id && !allowedPlaylists.includes(id)) {
    allowedPlaylists.push(id);
    localStorage.setItem("allowedPlaylists", JSON.stringify(allowedPlaylists));
    newPlaylistInput.value = "";
    renderAdminPlaylists();
    renderStartPage();
  } else {
    alert("Ongeldige of bestaande playlist");
  }
});

function extractPlaylistId(input) {
  const match = input.match(/playlist\/([a-zA-Z0-9]+)/);
  if (match) return match[1];
  const uriMatch = input.match(/spotify:playlist:([a-zA-Z0-9]+)/);
  if (uriMatch) return uriMatch[1];
  return null;
}

// Admin render met titels en delete
function renderAdminPlaylists() {
  playlistsList.innerHTML = "";

  allowedPlaylists.forEach((id) => {
    const div = document.createElement("div");
    div.style.display = "flex";
    div.style.alignItems = "center";
    div.style.justifyContent = "space-between";
    div.style.padding = "0.5rem 0";

    // Titel placeholder
    const titleNode = document.createElement("span");
    titleNode.textContent = "Loading…";

    // Delete button
    const deleteBtn = document.createElement("span");
    deleteBtn.className = "deleteBtn";
    deleteBtn.textContent = "✖";
    deleteBtn.style.cursor = "pointer";
    deleteBtn.addEventListener("click", () => {
      allowedPlaylists = allowedPlaylists.filter(pid => pid !== id);
      localStorage.setItem("allowedPlaylists", JSON.stringify(allowedPlaylists));
      renderAdminPlaylists();
      renderStartPage();
    });

    // Voeg alles toe aan de div
    div.appendChild(titleNode);
    div.appendChild(deleteBtn);
    playlistsList.appendChild(div);

    // Haal playlist titel op via oEmbed
    fetch(`https://open.spotify.com/oembed?url=https://open.spotify.com/playlist/${id}`)
      .then(res => res.json())
      .then(data => {
        titleNode.textContent = data.title;
      })
      .catch(() => {
        titleNode.textContent = `Playlist ${id}`;
      });
  });
}

// Startpagina render met covers via oEmbed
const playlistsGrid = document.getElementById("playlistsGrid");
const startPage = document.getElementById("startPage");
const playlistScreen = document.getElementById("playlistScreen");
const playlistContainer = document.getElementById("playlistContainer");
const backBtn = document.getElementById("backBtn");

function renderStartPage() {
  playlistsGrid.innerHTML = "";
  allowedPlaylists.forEach(id => {
    const card = document.createElement("div");
    card.className = "playlistCard";

    fetch(`https://open.spotify.com/oembed?url=https://open.spotify.com/playlist/${id}`)
      .then(res => res.json())
      .then(data => {
        card.innerHTML = `<img src="${data.thumbnail_url}" alt="${data.title}"><p>${data.title}</p>`;
      })
      .catch(() => {
        card.innerHTML = `<img src="https://i.scdn.co/image/${id}" alt="playlist"><p>Playlist ${id}</p>`;
      });

    card.addEventListener("click", () => openPlaylist(id));
    playlistsGrid.appendChild(card);
  });
}

// Fullscreen playlist
function openPlaylist(id) {
  startPage.style.display = "none";
  playlistScreen.style.display = "flex";
  playlistContainer.innerHTML = `<iframe src="https://open.spotify.com/embed/playlist/${id}" allow="encrypted-media"></iframe>`;
}

// Terug-knop
backBtn.addEventListener("click", () => {
  playlistScreen.style.display = "none";
  startPage.style.display = "block";
  playlistContainer.innerHTML = "";
});

// Init
playlistScreen.style.display = "none";
renderStartPage();
if (localStorage.getItem("isAdmin") === "true") loadAdminPanel();