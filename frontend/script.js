const container = document.getElementById("entries_container");
//API
async function saveEntry(entryData) {
  try {
    const res = await fetch('/entries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(entryData),
    });
    if (!res.ok) throw new Error('Failed to save entry');
    const data = await res.json();
    console.log(data.message); 
    return true;
  } catch (err) {
    console.error('Save entry error:', err);
    return false;
  }
}
async function fetchEntryById(id) {
  try {
    const res = await fetch(`/entries/${id}`);
    if (res.status === 404) {
      console.warn('Entry not found');
      return null;
    }
    if (!res.ok) throw new Error('Fetch error');
    return await res.json();
  } catch (err) {
    console.error('Fetch entry error:', err);
    return null;
  }
}
async function deleteEntryFromDB(id) {
  const response = await fetch(`/entries/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    throw new Error("Failed to delete entry from server");
  }
}

async function updateEntryInDB(id, updatedEntry) {
  const response = await fetch(`/entries/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updatedEntry),
  });
  if (!response.ok) {
    throw new Error("Failed to update entry on server");
  }
}

// add entry
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
container.addEventListener("click", async (e) => {
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

  const entryId = newEntry.dataset.id || `entry_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  // make object to backend
  const entryData = {
    _id: entryId,
    title: newTitle,
    artist: newArtist,
    year: newYear,
    date: newDate,
    text: newText,
    genre,
    type,
    format,
    icon: newIconSrc,
    rating,
  };

  // backend
  try {
    const success = await saveEntry(entryData);
    if (!success) {
      alert("⚠️ Could not save entry.");
      return;
    }
  } catch (err) {
    console.error("❌ Unexpected error saving entry:", err);
    alert("⚠️ Something broke while saving. Try again.");
    return;
  }

  // clone template and insert into DOM
  const template = document.getElementById("saved_entry_template");
  const savedEntryClone = template.content.cloneNode(true);
  const savedEntry = savedEntryClone.querySelector(".saved_entry");
  savedEntry.dataset.id = entryId;

  setupStarRatingGroup(savedEntryClone);

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
  const newEntry = clone.querySelector(".new_entry");

  // preserve the original ID
  newEntry.dataset.id = savedEntry.dataset.id;

  // copy input fields
  newEntry.querySelector(".new_title").value =
    savedEntry.querySelector(".saved_title").value;
  newEntry.querySelector(".new_artist").value =
    savedEntry.querySelector(".saved_artist").value;
  newEntry.querySelector(".new_year").value =
    savedEntry.querySelector(".saved_year").value;
  newEntry.querySelector(".new_date").value =
    savedEntry.querySelector(".saved_date").value;
  newEntry.querySelector(".new_textarea").value =
    savedEntry.querySelector(".saved_textarea").value;

  // copy icon
  const savedIcon = savedEntry.querySelector(".current_icon")?.src;
  const newIcon = newEntry.querySelector(".new_current_icon");
  if (savedIcon && newIcon) {
    newIcon.src = savedIcon;
  }

  // copy star rating
  const savedChecked = savedEntry.querySelector(
    ".saved_star_rating input[type='radio']:checked"
  );
  const newStars = newEntry.querySelectorAll(
    ".new_star_rating input[type='radio']"
  );
  if (savedChecked) {
    newStars.forEach((star) => {
      if (star.value === savedChecked.value) {
        star.checked = true;
      }
    });
  }

  // copy genre/type/format detail summaries
  const newDetails = newEntry.querySelectorAll(".new_detail_entry");
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

  savedEntry.replaceWith(clone);

  initDetailEntries(container);
  updateStatistics();
});

// delete entry
container.addEventListener("click", (e) => {
  if (!e.target.classList.contains("delete_button")) return;

  const entry = e.target.closest(".new_entry, .saved_entry");
  if (!entry) return;

  const id = entry.dataset.id;

  // remove from DOM
  entry.remove();
  updateStatistics();

  if (id) {
    deleteEntryFromDB(id).catch((err) => {
      console.error("Failed to delete entry from DB:", err);
    });
  }
});

// scroll to top
document.getElementById("top_button").addEventListener("click", () => {
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
});

window.addEventListener('DOMContentLoaded', () => {
  loadEntries().catch(console.error);
});
