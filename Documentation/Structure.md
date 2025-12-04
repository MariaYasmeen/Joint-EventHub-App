# Event App Structure

## Overview
The application is a React (Vite) web app with Firebase authentication and Firestore integration. Routing is handled by `react-router-dom`, and the UI is organized around a fixed top navbar and fixed sidebars.

## Folders
- `code/firebase-app/src/components`: Shared UI components (`Navbar`, `Layout`, `SidebarLeft`, `SidebarRight`).
- `code/firebase-app/src/screens`: Feature pages for auth, student, manager, and common.
- `code/firebase-app/src/firebase`: Firebase configuration and helpers.
- `code/firebase-app/src/assets`: Static assets.

## Global Layout
- `Navbar` remains visible across authenticated pages.
- `Layout` renders fixed left and right sidebars and positions page content in the center feed.

## Pages
- Common: `AllEvents`, `EventDescription`.
- Student: `MyRegistrations`, `MySavedEvents`, `Profile`, `Settings`.
- Manager: `CreateEvent`, `Analytics`, `MyCreatedEvents`.
- Auth: `Login`, `Register`.

## Styling
- White + dark green palette with soft UI/neumorphism.
- Event cards styled as Instagram-like posts: taller card, narrower width, icon row (`Like`, `Comment`, `Share`, `Save`), title and 300-char description under icons, clickable to the description page.

## Notes
- No changes were made to authentication, database logic, routing, or event handlers.
- Shared components should be imported from `src/components`.

