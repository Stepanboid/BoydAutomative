/* ============================================================
   BOYD AUTOMOTIVE — Live stock loader
   Pulls car listings from a published Google Sheet (CSV) and
   renders them into #car-listings. Add as many rows as you like
   in the sheet — there's no limit on the number of cars.

   ---------------------------------------------------------------
   HOW TO SET THIS UP (one-time, takes about 5 minutes)
   ---------------------------------------------------------------
   1. Create a new Google Sheet with this header row in row 1:
        Photo | Name | Price | Link
      (capitalization doesn't matter — "photo", "Photo" and "PHOTO" all work)
      Example row 2:
        cars/ford-focus.jpg | Ford Focus 1.0 EcoBoost 2019 | £8,995 | https://www.autotrader.co.uk/car-details/xxxxx

   2. In Google Sheets: File → Share → Publish to web
        - Under "Link", choose the correct sheet tab (not "Entire document" if you have multiple tabs)
        - Under format, choose "Comma-separated values (.csv)"
        - Click Publish, then copy the link it gives you

   3. Paste that link below, replacing SHEET_CSV_URL.

   4. For photos: the simplest way is to upload your car photos into
      a folder called "cars" right next to these site files (in the
      same GitHub repo), then just type the filename in the Photo
      column, e.g.  cars/ford-focus.jpg
      (You can also paste a full https:// image link instead, from
      anywhere that hosts images publicly.)

   That's it — every new row you add to the sheet appears on the
   site automatically next time someone loads the page. No coding,
   no re-uploading files needed.
   ---------------------------------------------------------------
*/

(function () {
  // 🔧 PASTE YOUR PUBLISHED GOOGLE SHEET CSV LINK BETWEEN THE QUOTES BELOW:
  const SHEET_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRRB5CDE-57pInW3oSGc6zI3XTBU8zcX_qFKgmvN604LzRDShhifWJ97PE7107-RLwnzw1Q8lISIc6G/pub?gid=0&single=true&output=csv";

  const grid = document.getElementById("car-listings");
  if (!grid) return;

  const status = document.createElement("div");
  status.className = "car-listings-status";
  status.textContent = "Loading current stock…";
  grid.replaceWith(status);

  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str == null ? "" : String(str);
    return div.innerHTML;
  }

  function showStatus(message) {
    status.textContent = message;
  }

  function normalizeRow(row) {
    // Makes column lookups case-insensitive, so "Link", "link" or "LINK"
    // in the sheet header all work the same way.
    const normalized = {};
    Object.keys(row).forEach(function (key) {
      normalized[key.trim().toLowerCase()] = row[key];
    });
    return normalized;
  }

  function renderCars(cars) {
    const rows = cars.map(normalizeRow);
    const validCars = rows.filter(function (row) {
      return row.name && row.name.trim();
    });

    if (!validCars.length) {
      showStatus("No cars listed right now — message us on WhatsApp to ask what's in stock.");
      return;
    }

    const newGrid = document.createElement("div");
    newGrid.id = "car-listings";
    newGrid.className = "car-grid";

    validCars.forEach(function (car) {
      const photo = (car.photo || "").trim();
      const name = (car.name || "").trim();
      const price = (car.price || "").trim();
      const link = (car.link || "").trim();

      const card = document.createElement("div");
      card.className = "car-card";

      let html = "";
      if (photo) {
        html += '<div class="car-card-photo"><img src="' + escapeHtml(photo) + '" alt="' + escapeHtml(name) + '" loading="lazy"></div>';
      }
      html += '<div class="car-card-body">';
      html += "<h3>" + escapeHtml(name) + "</h3>";
      if (price) {
        html += '<span class="plate">' + escapeHtml(price) + "</span>";
      }
      if (link) {
        html += '<p style="margin-top:14px;"><a href="' + escapeHtml(link) + '" target="_blank" rel="noopener" class="btn btn-outline btn-sm btn-block">View Listing ↗</a></p>';
      }
      html += "</div>";

      card.innerHTML = html;
      newGrid.appendChild(card);
    });

    status.replaceWith(newGrid);
  }

  if (!SHEET_CSV_URL) {
    showStatus("Car listings aren't connected yet — message us on WhatsApp to ask what's in stock.");
    return;
  }

  if (typeof Papa === "undefined") {
    showStatus("Couldn't load car listings right now — message us on WhatsApp to ask what's in stock.");
    return;
  }

  Papa.parse(SHEET_CSV_URL, {
    download: true,
    header: true,
    skipEmptyLines: true,
    complete: function (results) {
      renderCars(results.data || []);
    },
    error: function () {
      showStatus("Couldn't load car listings right now — message us on WhatsApp to ask what's in stock.");
    },
  });
})();
