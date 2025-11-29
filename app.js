const areas = {
  "Ground floor": ["Δ1", "Δ2", "Δ3", "Δ4", "ΛΕΥ", "AC1", "AC2", "ΕΙΚ", "ΚΜ", "ΣΟ1", "ΣΟ2", "PC"],
  Outside: [
    "Α1",
    "Α2",
    "Α3",
    "Α4",
    "Α5",
    "Α6",
    "ΚΔ",
    "ΔΕ1",
    "ΔΕ2",
    "ΔΕ3",
    "ΔΕ4",
    "ΑΠ0",
    "ΑΠ1",
    "ΑΠ2",
    "ΑΠ3",
    "ΑΠ4",
    "ΑΠ5",
    "ΑΠ6",
    "ΑΠ7",
    "ΚΕ1",
    "ΚΕ2",
    "Κ3",
  ],
  "1st floor": ["Ο1", "Ο2", "Ο3", "Ο4", "Ο5", "Ο6", "Ο7", "Ο8", "Ο9"],
};

const dom = {
  areaSelect: document.querySelector("#area-select"),
  tableSelect: document.querySelector("#table-select"),
  tableBadges: document.querySelector("#table-badges"),
  reservationList: document.querySelector("#reservation-list"),
  filterDate: document.querySelector("#filter-date"),
  searchBox: document.querySelector("#search-name"),
  form: document.querySelector("#reservation-form"),
  feedback: document.querySelector("#form-feedback"),
  clearFormBtn: document.querySelector("#clear-form"),
  clearStorageBtn: document.querySelector("#clear-storage"),
  metricToday: document.querySelector("#metric-today"),
  metricNext: document.querySelector("#metric-next"),
  dateTimeInput: document.querySelector("#reservation-datetime"),
};

const STORAGE_KEY = "milos-reservations";

let storageAvailable = true;
const safeLoadReservations = () => {
  try {
    const raw = window.localStorage ? localStorage.getItem(STORAGE_KEY) : null;
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    storageAvailable = false;
    return [];
  }
};

const reservations = safeLoadReservations();

const toIsoLocal = (date = new Date()) => {
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 16);
};

const todayStr = () => new Date().toISOString().split("T")[0];

const persist = () => {
  if (!storageAvailable) return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reservations));
  } catch (e) {
    storageAvailable = false;
  }
};

const showMessage = (text = "", tone = "") => {
  dom.feedback.textContent = text;
  dom.feedback.className = tone ? tone : "";
};

const populateAreaOptions = () => {
  Object.keys(areas).forEach((area) => {
    const option = document.createElement("option");
    option.value = area;
    option.textContent = area;
    dom.areaSelect.appendChild(option);
  });
};

const populateTables = (area) => {
  dom.tableSelect.innerHTML = "";
  areas[area].forEach((table) => {
    const option = document.createElement("option");
    option.value = table;
    option.textContent = table;
    dom.tableSelect.appendChild(option);
  });
};

const renderTableBadges = () => {
  const selectedArea = dom.areaSelect.value;
  const selectedDate = dom.filterDate.value;
  dom.tableBadges.innerHTML = "";

  areas[selectedArea].forEach((table) => {
    const booking = reservations.find(
      (res) => res.table === table && (!selectedDate || res.date === selectedDate)
    );
    const badge = document.createElement("div");
    badge.className = `table-badge ${booking ? "reserved" : "available"}`;
    badge.innerHTML = booking
      ? `${table}<span>${booking.time} • ${booking.customerName}</span>`
      : `${table}<span>Available</span>`;
    dom.tableBadges.appendChild(badge);
  });
};

const formatTime = (isoString) => {
  const date = new Date(isoString);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

const formatDate = (isoString) => {
  const date = new Date(isoString);
  return date.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" });
};

const getFilteredReservations = () => {
  const term = dom.searchBox.value.trim().toLowerCase();
  const day = dom.filterDate.value;
  return reservations
    .filter((res) => (!day || res.date === day))
    .filter(
      (res) =>
        res.customerName.toLowerCase().includes(term) ||
        res.table.toLowerCase().includes(term) ||
        res.area.toLowerCase().includes(term)
    )
    .sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime));
};

const renderReservationList = () => {
  const data = getFilteredReservations();
  dom.reservationList.innerHTML = "";

  if (!data.length) {
    const empty = document.createElement("li");
    empty.className = "empty-state";
    empty.textContent = "No reservations for the selected day.";
    dom.reservationList.appendChild(empty);
    return;
  }

  data.forEach((res) => {
    const item = document.createElement("li");
    item.className = "reservation-row";
    item.dataset.id = res.id;
    item.innerHTML = `
      <div>
        <strong>${formatTime(res.dateTime)}</strong>
        <p class="row-meta">${formatDate(res.dateTime)}</p>
      </div>
      <div>
        <strong>${res.customerName}</strong>
        <p class="row-meta">${res.phone || "No phone"}</p>
      </div>
      <div>
        <p class="row-meta">${res.notes || "—"}</p>
      </div>
      <div class="tag">${res.area} • ${res.table}</div>
      <button type="button" data-action="cancel">Cancel</button>
    `;
    dom.reservationList.appendChild(item);
  });
};

const renderMetrics = () => {
  const today = todayStr();
  const todaysReservations = reservations.filter((res) => res.date === today);
  dom.metricToday.textContent = todaysReservations.length;

  if (!reservations.length) {
    dom.metricNext.textContent = "–";
    return;
  }

  const upcoming = [...reservations]
    .filter((res) => new Date(res.dateTime) >= new Date())
    .sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime));

  dom.metricNext.textContent = upcoming.length
    ? `${formatTime(upcoming[0].dateTime)} • ${upcoming[0].table}`
    : "–";
};

const refreshUI = () => {
  renderReservationList();
  renderTableBadges();
  renderMetrics();
};

const resetForm = () => {
  dom.form.reset();
  dom.areaSelect.value = Object.keys(areas)[0];
  populateTables(dom.areaSelect.value);
  dom.dateTimeInput.value = toIsoLocal();
  showMessage("");
};

const detectConflict = (newReservation) => {
  const windowMinutes = 90;
  const targetTime = new Date(newReservation.dateTime).getTime();
  return reservations.find((existing) => {
    if (existing.table !== newReservation.table) return false;
    const delta = Math.abs(new Date(existing.dateTime).getTime() - targetTime);
    return delta < windowMinutes * 60 * 1000;
  });
};

const handleSubmit = (event) => {
  event.preventDefault();
  const formData = new FormData(dom.form);
  const dateTime = formData.get("dateTime");

  if (!dateTime) {
    showMessage("Please select a date and time.", "warning");
    return;
  }

  const [date, time] = dateTime.split("T");

  const supportsRandomUUID =
    typeof crypto !== "undefined" && typeof crypto.randomUUID === "function";

  const reservation = {
    id: supportsRandomUUID ? crypto.randomUUID() : String(Date.now()),
    customerName: formData.get("customerName").trim(),
    phone: formData.get("phone").trim(),
    partySize: Number(formData.get("partySize")),
    area: formData.get("area"),
    table: formData.get("table"),
    notes: formData.get("notes").trim(),
    date,
    time,
    dateTime,
    createdAt: new Date().toISOString(),
  };

  if (!reservation.customerName || !reservation.phone || !reservation.partySize) {
    showMessage("Name, phone, party size, and time are required.", "warning");
    return;
  }

  const conflict = detectConflict(reservation);
  if (conflict) {
    showMessage(
      `Heads up: ${reservation.table} is already booked at ${conflict.time} for ${conflict.customerName}.`,
      "warning"
    );
    return;
  }

  reservations.push(reservation);
  persist();
  refreshUI();
  showMessage("Reservation saved.", "success");
  dom.form.reset();
  dom.areaSelect.value = reservation.area;
  populateTables(reservation.area);
  dom.tableSelect.value = reservation.table;
  dom.dateTimeInput.value = toIsoLocal(new Date(dateTime));
};

const handleListClick = (event) => {
  if (event.target.dataset.action !== "cancel") return;
  const id = event.target.closest("li")?.dataset.id;
  if (!id) return;
  const idx = reservations.findIndex((res) => res.id === id);
  if (idx === -1) return;
  reservations.splice(idx, 1);
  persist();
  refreshUI();
};

const clearStorage = () => {
  if (!reservations.length) return;
  if (!confirm("Clear all saved reservations from this device?")) return;
  reservations.splice(0, reservations.length);
  persist();
  refreshUI();
};

const init = () => {
  populateAreaOptions();
  dom.areaSelect.value = Object.keys(areas)[0];
  populateTables(dom.areaSelect.value);
  dom.dateTimeInput.value = toIsoLocal();
  dom.filterDate.value = todayStr();

  dom.form.addEventListener("submit", handleSubmit);
  dom.areaSelect.addEventListener("change", () => {
    populateTables(dom.areaSelect.value);
    renderTableBadges();
  });
  dom.filterDate.addEventListener("change", refreshUI);
  dom.searchBox.addEventListener("input", renderReservationList);
  dom.clearFormBtn.addEventListener("click", resetForm);
  dom.reservationList.addEventListener("click", handleListClick);
  dom.clearStorageBtn.addEventListener("click", clearStorage);

  refreshUI();
};

init();

