// add entry
const container = document.getElementById("entries_container");

document.getElementById("add_entry_button").addEventListener("click", () => {
  if (document.querySelector(".new_entry")) return; // ChatGPT

  const template = document.getElementById("new_entry_template");
  const clone = template.content.cloneNode(true); // ChatGPT

  container.insertBefore(clone, container.firstChild);

  initDetailEntries(container); // ChatGPT
});

// detail update
function initDetailEntries(scope = document) {
  // ChatGPT
  scope.querySelectorAll(".new_detail_entry").forEach((details) => {
    const radios = details.querySelectorAll("input[type='radio']");
    const summary = details.querySelector("summary");

    radios.forEach((radio) => {
      radio.addEventListener("change", () => {
        const label = radio.closest("label");
        if (radio.checked && label) {
          summary.textContent = label.textContent.trim(); // ChatGPT
          details.removeAttribute("open");
        }
      });
    });
  });
}

// icon selection
let currentNewIcon = null;

document.addEventListener("click", function (e) {
  if (e.target.classList.contains("new_current_icon")) {
    currentNewIcon = e.target;
    document.querySelector(".modal").style.display = "block"; //ChatGPT
  }
});

function closeModal() {
  document.querySelector(".modal").style.display = "none"; //ChatGPT
}

function selectIcon(src) {
  if (currentNewIcon) {
    currentNewIcon.src = src;
  }
  closeModal();
}

// save entry
container.addEventListener("click", (e) => {
  if (!e.target.classList.contains("save_button")) return;

  const newEntry = e.target.closest(".new_entry");

  // get input
  const newTitle = newEntry.querySelector(".new_title")?.value || "";
  const newArtist = newEntry.querySelector(".new_artist")?.value || "";
  const newYear = newEntry.querySelector(".new_year")?.value || "";
  const newDate = newEntry.querySelector(".new_date")?.value || "";
  const newText = newEntry.querySelector(".new_textarea")?.value || "";

  const genre = newEntry.querySelector("input[name='genre']:checked")?.value || "";
  const type = newEntry.querySelector("input[name='type']:checked")?.value || "";
  const format = newEntry.querySelector("input[name='format']:checked")?.value || "";

  const newIconSrc = newEntry.querySelector(".new_current_icon")?.src || "";

  const checkedStar = newEntry.querySelector(".new_star_rating input[type='radio']:checked");
  const rating = checkedStar ? parseInt(checkedStar.value) : 0;

  // clone
  const template = document.getElementById("saved_entry_template");
  const savedEntryClone = template.content.cloneNode(true);
  const savedEntry = savedEntryClone.querySelector(".saved_entry");

  // give ID
  savedEntry.dataset.id =
    newEntry.dataset.id || `entry_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  // unique star rating
  setupStarRatingGroup(savedEntryClone);

  // fill in content
  savedEntry.querySelector(".saved_title").value = newTitle;
  savedEntry.querySelector(".saved_artist").value = newArtist;
  savedEntry.querySelector(".saved_year").value = newYear;
  savedEntry.querySelector(".saved_date").value = newDate;
  savedEntry.querySelector(".saved_textarea").value = newText;

  const genreSummary = savedEntry.querySelector(".saved_detail_entry:nth-child(1) summary");
  const typeSummary = savedEntry.querySelector(".saved_detail_entry:nth-child(2) summary");
  const formatSummary = savedEntry.querySelector(".saved_detail_entry:nth-child(3) summary");

  genreSummary.textContent = genre || "Genre";
  typeSummary.textContent = type || "Type";
  formatSummary.textContent = format || "Format";

  const iconImg = savedEntry.querySelector(".current_icon");
  if (iconImg && newIconSrc) iconImg.src = newIconSrc;

  const savedStarInputs = savedEntry.querySelectorAll(".saved_star_rating input[type='radio']");
  savedStarInputs.forEach((input) => {
    if (parseInt(input.value) === rating) {
      input.checked = true;
    }
  });

  newEntry.remove();

  const entriesContainer = document.getElementById("entries_container");
  entriesContainer.appendChild(savedEntry);

  sortEntriesByDate(entriesContainer);
  saveEntries().catch(console.error);
});

// sort function
function sortEntriesByDate(container) {
  // ChatGPT
  const entries = Array.from(container.querySelectorAll(".saved_entry"));
  entries.sort((a, b) => {
    const dateA = new Date(
      a.querySelector(".saved_date")?.value || "1900-01-01"
    );
    const dateB = new Date(
      b.querySelector(".saved_date")?.value || "1900-01-01"
    );
    return dateB - dateA;
  });

  entries.forEach((entry) => container.appendChild(entry));
}

// unique star id/name
function setupStarRatingGroup(container) {
  // ChatGPT
  const starContainer = container.querySelector(".new_star_rating");
  if (!starContainer) return;

  const uniqueName = `star_group_${Date.now()}_${Math.random()
    .toString(36)
    .slice(2, 8)}`;
  const inputs = starContainer.querySelectorAll("input[type='radio']");
  const labels = starContainer.querySelectorAll("label");

  inputs.forEach((input, i) => {
    const val = input.value;
    const id = `${uniqueName}_${val}`;
    input.name = uniqueName;
    input.id = id;

    if (labels[i]) {
      labels[i].setAttribute("for", id);
    }
  });
}

// statistics
function updateStatistics() {
  const container = document.getElementById("entries_container");

  const entries = Array.from(container.querySelectorAll(".saved_entry")); // ChatGPT

  // 1. total entries
  document.getElementById("total_entries").textContent = entries.length;

  // 2. year range
  let years = entries // ChatGPT
    .map((entry) => parseInt(entry.querySelector(".saved_year").value))
    .filter((y) => !isNaN(y));

  if (years.length === 0) {
    document.getElementById("year_range").textContent = "0000 - 0000";
  } else {
    const minYear = Math.min(...years);
    const maxYear = Math.max(...years);
    document.getElementById(
      "year_range"
    ).textContent = `${minYear} - ${maxYear}`;
  }

  // 3. top artist // ChatGPT
  const artistCount = {};
  let topArtist = "---";
  entries.forEach((entry) => {
    const artist = entry.querySelector(".saved_artist").value;
    artistCount[artist] = (artistCount[artist] || 0) + 1;
  });
  const sortedArtists = Object.entries(artistCount).sort((a, b) => b[1] - a[1]);
  if (sortedArtists.length > 0) {
    topArtist = sortedArtists[0][0];
  }
  document.getElementById("top_artist").textContent = topArtist;

  // 4. average rating
  let totalRating = 0;
  let ratingCount = 0;
  entries.forEach((entry) => {
    const rating = parseInt(
      entry.querySelector(".saved_star_rating input[type='radio']:checked")
        ?.value || 0
    );
    if (rating > 0) {
      totalRating += rating;
      ratingCount++;
    }
  });
  const avgRating =
    ratingCount > 0 ? (totalRating / ratingCount).toFixed(1) : 0;
  updateAvgRating(avgRating);
}

// update star average
function updateAvgRating(avgRating) {
  const avgRatingElement = document.getElementById("avg_rating");
  const stars = avgRatingElement.querySelectorAll("input[type='radio']");

  stars.forEach((star) => {
    star.checked = parseInt(star.value) <= avgRating;
  });
}

// update stats after save
container.addEventListener("click", (e) => {
  if (
    e.target.classList.contains("save_button") ||
    e.target.textContent === "Save"
  ) {
    updateStatistics();
  }
});

// edit entry
container.addEventListener("click", (e) => {
  if (!e.target.classList.contains("edit_button")) return;

  const savedEntry = e.target.closest(".saved_entry");
  const template = document.getElementById("new_entry_template");
  const clone = template.content.cloneNode(true);

  // copy input
  clone.querySelector(".new_title").value =
    savedEntry.querySelector(".saved_title").value;
  clone.querySelector(".new_artist").value =
    savedEntry.querySelector(".saved_artist").value;
  clone.querySelector(".new_year").value =
    savedEntry.querySelector(".saved_year").value;
  clone.querySelector(".new_date").value =
    savedEntry.querySelector(".saved_date").value;
  clone.querySelector(".new_textarea").value =
    savedEntry.querySelector(".saved_textarea").value;

  const savedIcon = savedEntry.querySelector(".current_icon")?.src;
  const newIcon = clone.querySelector(".new_current_icon");
  if (savedIcon && newIcon) {
    newIcon.src = savedIcon;
  }

  const savedChecked = savedEntry.querySelector(
    ".saved_star_rating input[type='radio']:checked"
  );
  const newStars = clone.querySelectorAll(
    ".new_star_rating input[type='radio']"
  );
  if (savedChecked) {
    newStars.forEach((star) => {
      if (star.value === savedChecked.value) {
        star.checked = true;
      }
    });
  }

  const newDetails = clone.querySelectorAll(".new_detail_entry");
  newDetails.forEach((detailsGroup, index) => {
    const summary = detailsGroup.querySelector("summary");
    const type = detailsGroup.dataset.type;

    const savedDetailsGroup = savedEntry.querySelectorAll(
      ".saved_detail_entry"
    )[index];
    const savedText = savedDetailsGroup
      ?.querySelector("summary")
      ?.textContent.trim();

    if (savedText) {
      // ChatGPT
      const matchingRadio = [...detailsGroup.querySelectorAll("label")].find(
        (label) => label.textContent.trim() === savedText
      );

      if (matchingRadio) {
        const radio = matchingRadio.querySelector("input");
        if (radio) {
          radio.checked = true;
          summary.textContent = savedText;
          detailsGroup.removeAttribute("open");
        }
      }
    }
  });

  // replace
  savedEntry.replaceWith(clone); // ChatGPT

  initDetailEntries(container); // ChatGPT

  updateStatistics();

  saveEntries().catch(console.error);
});

// delete entry
container.addEventListener("click", (e) => {
  if (!e.target.classList.contains("delete_button")) return;

  const entry = e.target.closest(".new_entry, .saved_entry");
  if (!entry) return;

  const id = entry.dataset.id;

  // direkt aus dem DOM schmeißen
  entry.remove();
  updateStatistics();

  if (id) {
    deleteEntryFromDB(id).catch(console.error);
  } else {
    saveEntries().catch(console.error);
  }
});

// scroll to top
document.getElementById("top_button").addEventListener("click", () => {
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
});

// storage (save)
async function saveEntries() {
  const entries = Array.from(document.querySelectorAll(".saved_entry"));
  const data = entries.map((entry) => ({
    title: entry.querySelector(".saved_title").value,
    artist: entry.querySelector(".saved_artist").value,
    year: entry.querySelector(".saved_year").value,
    date: entry.querySelector(".saved_date").value,
    text: entry.querySelector(".saved_textarea").value,
    genre: entry
      .querySelector(".saved_detail_entry:nth-child(1) summary")
      .textContent.trim(),
    type: entry
      .querySelector(".saved_detail_entry:nth-child(2) summary")
      .textContent.trim(),
    format: entry
      .querySelector(".saved_detail_entry:nth-child(3) summary")
      .textContent.trim(),
    icon: entry.querySelector(".current_icon")?.src || "",
    rating: parseInt(
      entry.querySelector(".saved_star_rating input[type='radio']:checked")
        ?.value || 0
    ),
  }));

  localStorage.setItem("discdiaryentries", JSON.stringify(data));

  try {
    const res = await fetch("/api/entries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Server save failed");
  } catch (e) {
    console.warn("Failed to save to server, saved locally only.", e);
  }
}

// storage (load)
async function loadEntries() {
  let data = [];
  try {
    const res = await fetch("/api/entries");
    if (res.ok) {
      data = await res.json();
    } else {
      throw new Error("Server responded not OK");
    }
  } catch {
    // fallback localStorage (ChatGPT)
    data = JSON.parse(localStorage.getItem("discdiaryentries") || "[]");
  }

  const template = document.getElementById("saved_entry_template");
  const container = document.getElementById("entries_container");

  container.innerHTML = "";

  data.forEach((entryData) => {
    const clone = template.content.cloneNode(true);

    clone.querySelector(".saved_title").value = entryData.title;
    clone.querySelector(".saved_artist").value = entryData.artist;
    clone.querySelector(".saved_year").value = entryData.year;
    clone.querySelector(".saved_date").value = entryData.date;
    clone.querySelector(".saved_textarea").value = entryData.text;

    clone.querySelector(
      ".saved_detail_entry:nth-child(1) summary"
    ).textContent = entryData.genre || "Genre";
    clone.querySelector(
      ".saved_detail_entry:nth-child(2) summary"
    ).textContent = entryData.type || "Type";
    clone.querySelector(
      ".saved_detail_entry:nth-child(3) summary"
    ).textContent = entryData.format || "Format";

    const iconImg = clone.querySelector(".current_icon");
    if (iconImg && entryData.icon) iconImg.src = entryData.icon;

    const stars = clone.querySelectorAll(
      ".saved_star_rating input[type='radio']"
    );
    stars.forEach((input) => {
      if (parseInt(input.value) === entryData.rating) input.checked = true;
    });

    setupStarRatingGroup(clone);

    container.appendChild(clone);
  });

  sortEntriesByDate(container);
  updateStatistics();
}

// 4 server.js
async function deleteEntryFromDB(id) {
  const response = await fetch(`/api/entries/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    throw new Error("Failed to delete entry from server");
  }
}

async function updateEntryInDB(id, updatedEntry) {
  const response = await fetch(`/api/entries/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updatedEntry),
  });
  if (!response.ok) {
    throw new Error("Failed to update entry on server");
  }
}

loadEntries().catch(console.error);
