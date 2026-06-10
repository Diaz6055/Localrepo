# Premium HVAC Replicable Template System

This repository is a premium, high-performance, responsive static HVAC website designed to be configured once and resold/deployed to different clients in seconds. 

By separating the **common layouts** (headers, footers, meta tags) and **business details** (phone numbers, addresses, colors) from the page structures, you can generate a complete new client website in under 5 minutes without writing a single line of HTML.

---

## Folder Structure

```
├── config.json       # Central client details config (Edit this!)
├── build.js          # Zero-dependency build script
├── src/              # Source templates and components
│   ├── assets/       # Static CSS and JS assets
│   ├── components/   # Shared layout pieces (header, footer, etc.)
│   └── pages/        # HTML page templates (index, about, services, etc.)
└── dist/             # Compiled output website (Deploy this!)
```

---

## How to Customize for a Client

### Step 1: Update the Business Details
Open [config.json](file:///Users/diazjensen/.gemini/antigravity/worktrees/Localrepo/explore-codebase-functionality/config.json) at the root of the project. It contains all the variables used across the site:

```json
{
  "business_name": "Phoenix AC & Heating Experts",
  "phone_number": "(602) 773-5522",
  "phone_raw": "+16027735522",
  "email": "info@phoenixacexperts.com",
  "address": "18631 N 19th Ave #158",
  "city": "Phoenix",
  "state": "AZ",
  "zip": "85027",
  "year_founded": "2002",
  "years_experience": "23",
  "tuneup_price": "$89",
  "primary_color": "#ff6a2c",
  "primary_deep": "#e84f12",
  "primary_soft": "#fff1ea",
  "cool_color": "#1cb6c9",
  "cool_deep": "#0e8a9a",
  "service_areas": [
    { "city": "Phoenix", "zip": "85027 · 85021 · 85051" },
    ...
  ]
}
```

* Simply change these fields to match your new client. 
* To change the color scheme (e.g. from Orange/Teal to Blue/Teal), change the Hex codes under `primary_color` and `cool_color` fields.

### Step 2: Compile the Website
Run the compile script using Node.js:

```bash
node build.js
```

This will automatically:
1. Embed the header, footer, topbar, and head components into every page.
2. Replace variables like `@@business_name` and `@@phone_number` in all content areas, headings, meta tags, and JSON-LD schemas.
3. Dynamically resolve relative asset paths depending on subdirectories.
4. Programmatically construct the **Service Areas Grid** using the array from `config.json`.
5. Inject the custom colors directly into the CSS stylesheet variables.
6. Generate a deployment-ready folder inside [dist/](file:///Users/diazjensen/.gemini/antigravity/worktrees/Localrepo/explore-codebase-functionality/dist).

### Step 3: Deploy
Upload the contents of the `dist/` directory to any hosting provider (cPanel, Netlify, Vercel, Github Pages, etc.).

---

## Editing Templates and Layouts

* If you need to make changes to the layout or structure, edit the files inside `src/`.
* **Common Elements**: Edit files in `src/components/` (e.g. `header.html`, `footer.html`). Any changes here will instantly sync to all pages upon running `node build.js`.
* **Assets**: Edit stylesheet in `src/assets/css/styles.css` or Javascript in `src/assets/js/main.js`.
* **Subdirectory Resolver**: Use `@@root_path` for paths (e.g., `href="@@root_path/index.html"` or `href="@@root_path/assets/css/styles.css"`). This resolves dynamically to `.` or `..` so your links and assets never break in service subfolders.