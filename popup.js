const searchInput = document.getElementById("search");
const results = document.getElementById("results");

const editModeCheckbox = document.getElementById("editMode");

const nameInput = document.getElementById("name");
const keyInput = document.getElementById("key");
const urlInput = document.getElementById("url");

const saveBtn = document.getElementById("save");
const deleteBtn = document.getElementById("delete");
const status = document.getElementById("status");

let editingKey = null;
let lastResults = [];

/* ---------- SEARCH ---------- */

searchInput.addEventListener("input", async () => {
  const query = searchInput.value.toLowerCase().trim();
  results.innerHTML = "";
  lastResults = [];

  if (!query) return;

  const { sites = [] } = await browser.storage.sync.get("sites");

  lastResults = sites.filter(site =>
    site.name.toLowerCase().startsWith(query)
  );

  lastResults.forEach(site => {
    const li = document.createElement("li");
    li.textContent = `${site.name}${site.key ? ` [${site.key}]` : ""}`;

    li.onclick = () => {
      if (editModeCheckbox.checked) {
        loadForEdit(site);
      } else {
        browser.tabs.create({ url: site.url });
      }
    };

    results.appendChild(li);
  });
});

/* ---------- ENTER → OPEN FIRST RESULT ---------- */

searchInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && lastResults.length > 0) {
    browser.tabs.create({ url: lastResults[0].url });
  }
});

/* ---------- POPUP SHORTCUT KEYS ---------- */

document.addEventListener("keydown", async (e) => {
  if (e.target.tagName === "INPUT") return;

  const key = e.key.toLowerCase();
  if (key.length !== 1) return;

  const { sites = [] } = await browser.storage.sync.get("sites");
  const site = sites.find(s => s.key === key);

  if (site) {
    browser.tabs.create({ url: site.url });
  }
});

/* ---------- SAVE ---------- */

saveBtn.addEventListener("click", async () => {
  status.textContent = "";

  const name = nameInput.value.trim();
  const key = keyInput.value.trim().toLowerCase();
  const url = urlInput.value.trim();

  if (!name || !url) {
    status.textContent = "Name and URL are required";
    return;
  }

  if (key && key.length !== 1) {
    status.textContent = "Shortcut key must be one character";
    return;
  }

  const { sites = [] } = await browser.storage.sync.get("sites");

  if (key) {
    const conflict = sites.find(
      s => s.key === key && s.key !== editingKey
    );
    if (conflict) {
      status.textContent = "Shortcut key already in use";
      return;
    }
  }

  if (editingKey !== null) {
    const idx = sites.findIndex(s => s.key === editingKey);
    sites[idx] = { name, key: key || null, url };
  } else {
    sites.push({ name, key: key || null, url });
  }

  await browser.storage.sync.set({ sites });
  resetForm("Saved");
});

/* ---------- DELETE ---------- */

deleteBtn.addEventListener("click", async () => {
  if (editingKey === null) return;

  const { sites = [] } = await browser.storage.sync.get("sites");
  const filtered = sites.filter(s => s.key !== editingKey);

  await browser.storage.sync.set({ sites: filtered });
  resetForm("Deleted");
});

/* ---------- HELPERS ---------- */

function loadForEdit(site) {
  nameInput.value = site.name;
  keyInput.value = site.key || "";
  urlInput.value = site.url;

  editingKey = site.key;
  deleteBtn.disabled = false;
  status.textContent = "Editing";
}

function resetForm(msg = "") {
  nameInput.value = "";
  keyInput.value = "";
  urlInput.value = "";
  editingKey = null;
  deleteBtn.disabled = true;
  status.textContent = msg;
}
