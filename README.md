# Northstar Athletic

<p align="center"><strong>RUN YOUR CLUB. OWN YOUR SEASON.</strong></p>

Northstar is a sports-club management dashboard for keeping athlete rosters, team details, fixtures, and club finances in one clear, matchday-ready workspace.

<p align="center">
  <a href="https://northstar-sports-management-h8ol.vercel.app/"><strong>Open the live app</strong></a>
  &nbsp;·&nbsp;
  <a href="https://github.com/AshutoshJha2310/northstar-sports-management">View the source</a>
</p>

![React](https://img.shields.io/badge/React-19-149eca?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-6-646cff?logo=vite&logoColor=white)

## What you can do

| Area | Features |
| --- | --- |
| **Overview** | See roster and team totals, the next seven days of events, average roster attendance, and upcoming fixtures. Export a club report as CSV. |
| **Athletes** | Add and remove athletes, search by name or position, and filter by sport. |
| **Schedule** | Browse weeks, add games, practices, meets, or tournaments, and export the selected week as CSV. |
| **Teams** | Create squads with a sport and coach; view team details and sample season records. |
| **Finance** | Record money in and money out, review net cash flow and recent activity, and export transactions as CSV. |

The interface adapts to mobile screens and includes seeded sample records so the dashboard is useful on first launch.

## Run it locally

**Requirements:** Node.js 20 or newer and npm.

```bash
git clone https://github.com/AshutoshJha2310/northstar-sports-management.git
cd northstar-sports-management
npm install
npm run dev
```

Open the local URL printed by Vite. In Windows PowerShell, if script execution blocks `npm`, use `npm.cmd` instead. On Windows, `start.bat` can install dependencies when needed and start the development server for you.

## Build and preview

```bash
npm run build
npm run preview
```

The build runs the TypeScript check before creating the optimized site in `dist/`. The preview command serves that production build locally.

## Data and privacy

This is a **front-end prototype**. Records are stored in the browser's `localStorage` under the current site origin:

| Record type | Storage key |
| --- | --- |
| Athletes | `northstar-athletes` |
| Events | `northstar-events` |
| Teams | `northstar-teams` |
| Transactions | `northstar-transactions` |

Data stays in that browser profile; it is not sent to a shared database and does not sync across devices or users. Clearing site data removes saved records. The live demo therefore gives each visitor their own workspace. Sample attendance, team records, and starting finance transactions are demonstration data, not verified club records. New athletes start at 0% attendance; attendance-session tracking is not currently included.

## Project structure

```text
src/
  App.tsx       Main screens, sample data, forms, and workflows
  main.tsx      React application entry point
  storage.ts    Validated localStorage read/write helpers
  styles.css    Clubhouse-inspired responsive styles
index.html      Page metadata and font setup
start.bat       Windows development launcher
```

## Tech stack

- React 19 and TypeScript
- Vite 6
- Lucide React icons
- CSS and browser `localStorage` (no server or external database)

## Deployment

The app is hosted on Vercel and connected to this GitHub repository. The production site is available at [northstar-sports-management-h8ol.vercel.app](https://northstar-sports-management-h8ol.vercel.app/); pushes to `main` are intended to publish updates through the linked Vercel project.

## Current scope

Northstar demonstrates core club workflows without account sign-in, permissions, server-side storage, payment processing, or multi-user collaboration. Add those services before using it for real club operations or sensitive records.
