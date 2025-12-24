const searchInput = document.getElementById("search");
const results = document.getElementById("results");

const nameInput = document.getElementById("name");
const keyInput = document.getElementById("key");
const urlInput = document.getElementById("url");

const saveBtn = document.getElementById("save");
const deleteBtn = document.getElementById("delete");
const status = document.getElementById("status");

let editingKey = null;

/* ---------- SEARCH BY NAME ---------- */

searchInput.addEventListener("input", async () => {
  const query = searchInput.value.toLowerCase().trim();
  results.innerHTML = "";
  if (!query) return;

  const { sites = [] } = await browser.storage.sync.get("sites");

  sites
    .filter(site => site.name.toLowerCase().startsWith(query))
    .forEach(site => {
      const li = document.createElement("li");
      li.textContent = `${site.name} [${site.key}]`;

      li.onclick = () => {
        nameInput.value = site.name;
        keyInput.value = site.key;
        urlInput.value = site.url;

        editingKey = site.key;
        deleteBtn.disabled = false;
        status.textContent = "Editing";
      };

      results.appendChild(li);
    });
});

/* ---------- POPUP KEYBOARD SHORTCUT ---------- */

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

  if (!name || !key || !url) {
    status.textContent = "All fields required";
    return;
  }

  if (key.length !== 1) {
    status.textContent = "Key must be one character";
    return;
  }

  const { sites = [] } = await browser.storage.sync.get("sites");

  const keyUsed = sites.find(
    s => s.key === key && s.key !== editingKey
  );

  if (keyUsed) {
    status.textContent = "Key already in use";
    return;
  }

  if (editingKey) {
    const idx = sites.findIndex(s => s.key === editingKey);
    sites[idx] = { name, key, url };
  } else {
    sites.push({ name, key, url });
  }

  await browser.storage.sync.set({ sites });

  resetForm("Saved");
});

/* ---------- DELETE ---------- */

deleteBtn.addEventListener("click", async () => {
  if (!editingKey) return;

  const { sites = [] } = await browser.storage.sync.get("sites");
  const filtered = sites.filter(s => s.key !== editingKey);

  await browser.storage.sync.set({ sites: filtered });

  resetForm("Deleted");
});

/* ---------- HELPERS ---------- */

function resetForm(msg = "") {
  nameInput.value = "";
  keyInput.value = "";
  urlInput.value = "";

  editingKey = null;
  deleteBtn.disabled = true;
  status.textContent = msg;
}
