/* ============================================================
   BOYD AUTOMOTIVE — Live stock loader
   Pulls car listings from a published Google Sheet (CSV) and
   renders them into #car-listings. Add as many rows as you like
   in the sheet — there's no limit on the number of cars.

   ---------------------------------------------------------------
   HOW TO ADD A CAR (for BOYD Automotive — no coding needed)
   ---------------------------------------------------------------
   Open the Google Sheet and add one row per car, with these columns:

     Photo | Name | Price | Link

   PHOTO — paste a Google Drive share link:
     1. Upload the car photo to Google Drive
     2. Right-click the file → Share → change access to
        "Anyone with the link" (viewer is fine)
     3. Click "Copy link" and paste that link straight into the
        Photo column — the site converts it automatically, no
        extra steps needed.

   NAME — e.g.  Ford Focus 1.0 EcoBoost 2019

   PRICE — e.g.  £8,995

   LINK — the AutoTrader (or other marketplace) listing URL

   Capitalisation of the column headers doesn't matter.
   Save the sheet — new rows appear on the site automatically
   the next time someone loads the page. Nothing else to do.
   ---------------------------------------------------------------
*/

(function () {
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

  // Converts a normal Google Drive "share" link into a direct image
  // URL that can be used in an <img src>. Works with any of the
  // common Drive link formats people end up copying:
  //   https://drive.google.com/file/d/FILE_ID/view?usp=sharing
  //   https://drive.google.com/open?id=FILE_ID
  //   https://drive.google.com/uc?id=FILE_ID
  // Non-Drive links (e.g. a normal https:// image URL, or a path
  // like cars/focus.jpg) are returned unchanged.
  function resolveImageUrl(rawUrl) {
    if (!rawUrl) return "";
    if (rawUrl.indexOf("drive.google.com") === -1) return rawUrl;

    let fileId = "";
    const fileMatch = rawUrl.match(/\/file\/d\/([^/]+)/);
    if (fileMatch) {
      fileId = fileMatch[1];
    } else {
      const idMatch = rawUrl.match(/[?&]id=([^&]+)/);
      if (idMatch) fileId = idMatch[1];
    }

    if (!fileId) return rawUrl;
    return "https://lh3.googleusercontent.com/d/" + fileId;
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
      const photo = resolveImageUrl((car.photo || "").trim());
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
    skipEmptyLines: "greedy",
    complete: function (results) {
      renderCars(results.data || []);
    },
    error: function () {
      showStatus("Couldn't load car listings right now — message us on WhatsApp to ask what's in stock.");
    },
  });
})();
