# Reservations Console

Lightweight browser-based console for Milos waiters to book reservations while speaking with guests over the phone.

## Features

- Preloaded dining areas (Ground floor, Outside, 1st floor) with all table codes.
- Fast booking form captures guest name, phone, party size, notes, and `datetime-local` calendar input.
- Live availability panel shows which tables are already booked on the selected day.
- Conflict detection blocks double booking within a 90-minute window per table.
- Searchable list of upcoming reservations with cancel action.
- LocalStorage persistence so data stays on the device between shifts; reset available.

## Getting Started

1. Open `index.html` in any modern browser (Chrome, Edge).
2. Adjust the booking date/time, area, and table.
3. Fill guest details and save. Entries appear in the Upcoming list and table map.
4. Use the search and date filter to quickly find bookings; cancel as needed.

No build step or backend is required. All data lives in the browser. For production use, connect the form submission to an API or database of your choice.

