# CutStack planner

Link to the tool: [CutStack Planner](https://rectangle-pwa.vercel.app/)

CutStack Planner is a Progressive Web App (PWA) for optimizing rectangular cuts from sheet materials such as plywood, MDF, and particle board.

The app is designed for workshop use: import a part list from CSV, configure sheet + kerf, run packing, and review visual cutting layouts.

## Features

- CSV import with validation (required columns: `Qty`, `Width`, `Height`; optional `Name`)
- Flexible delimiter detection (comma, semicolon, tab)
- Sheet and tool configuration (`width`, `height`, `kerf`, optional part rotation)
- Multi-strategy guillotine solver flow with ranked results
- Advanced and simple result views
- Per-sheet visualization, utilization stats, and unplaced parts summary
- Local cut history
- PWA support with service worker and manifest
- No authentication and no server-side persistence

## Data and Privacy

- All computation runs client-side in the browser.
- Imported input is stored in `sessionStorage`.
- Saved history is stored in browser `localStorage`.
- No backend database and no external data service are used by this app.

## CSV Format

Expected columns:

- `Qty` or `Quantity` (positive integer)
- `Width` (positive number)
- `Height` (positive number)
- `Name` (optional)

Additional columns are ignored.

Example:

```csv
Name,Qty,Width,Height
Side panel,4,400,300
Shelf,6,380,280
Back panel,2,800,500
```

## License

This project is licensed under the terms in [LICENSE](./LICENSE).

Summary:

- Free to use (including commercial workshop/business usage of the app).
- Commercial resale/hosting/distribution of the source code is not allowed without separate written permission.
