# ToDo App

A React + Vite task manager for creating, organizing, reviewing, completing, and recycling tasks.

## Features

- Five routed pages: Home, Calendar, Create Task, Recycling Bin, and About.
- Create, edit, delete, restore, and permanently delete tasks.
- Track completion status by category.
- Filter tasks by category and search text.
- Schedule tasks by starting date/time and optional ending date/time.
- Review tasks by day in Home and Calendar.
- Move completed or deleted tasks to the Recycling Bin.
- Persist tasks in the browser with `localStorage`.
- Responsive layout for desktop and mobile.

## Tech Stack

- React
- React Router
- Vite
- CSS modules by page/component files
- Browser `localStorage` for persistence

## Project Structure

```text
src/
  assets/       Image and icon assets
  components/   Shared UI components
  context/      Global task state with React Context
  pages/        Routed pages and page-specific styles
  utils/        Shared date, task, and form helpers
```

## Getting Started

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

Run lint checks:

```bash
npm run lint
```

## Notes

- Task data is saved in the browser, so it remains after refresh.
- Clearing browser storage will remove saved tasks.
- The app uses React Context for global task data and React hooks such as `useState` and `useEffect` for component state and side effects.
