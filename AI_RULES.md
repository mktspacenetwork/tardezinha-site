# AI Studio Application Rules

This document outlines the technical stack and coding guidelines for the "Tardezinha da Space" application. These rules are designed to ensure consistency, maintainability, and efficient development.

## Tech Stack Overview

The application is built using the following core technologies:

*   **React (with TypeScript)**: The primary library for building the user interface, ensuring type safety and robust component development.
*   **Vite**: Used as the build tool, providing a fast development experience and optimized production builds.
*   **Tailwind CSS**: The exclusive utility-first CSS framework for all styling, promoting rapid and consistent UI development.
*   **Local Storage**: Utilized for client-side data persistence, such as user confirmations in the `Checkin` and `Admin` components.
*   **Conditional Rendering for Routing**: Top-level navigation (e.g., Admin view, Rules view) is currently handled via React's conditional rendering logic within `App.tsx`.
*   **Shadcn/ui**: A collection of re-usable components built with Radix UI and Tailwind CSS, available for use but not yet integrated into existing components.
*   **Radix UI**: Provides unstyled, accessible components, serving as the foundation for shadcn/ui.
*   **Lucide React**: An icon library available for use, offering a wide range of customizable SVG icons.

## Library Usage Rules

To maintain a clean and consistent codebase, please adhere to the following guidelines when developing new features or modifying existing ones:

*   **React & TypeScript**: All new components, hooks, and application logic must be written using React with TypeScript.
*   **Styling**:
    *   **Exclusively Tailwind CSS**: All styling must be applied using Tailwind CSS utility classes. Avoid custom `.css` files or inline styles unless absolutely necessary for dynamic values.
    *   **Responsive Design**: Always prioritize responsive design using Tailwind's responsive prefixes (e.g., `sm:`, `md:`, `lg:`).
*   **Components**:
    *   **New Files**: Every new component or hook must reside in its own dedicated file within the `src/components/` directory.
    *   **Shadcn/ui Preference**: For common UI elements (buttons, forms, dialogs, etc.), prefer using components from the shadcn/ui library. If a shadcn/ui component doesn't perfectly fit, create a new custom component with Tailwind CSS.
    *   **Size**: Aim for small, focused components, ideally under 100 lines of code. Refactor larger components into smaller, more manageable pieces.
*   **Pages**: New top-level views or sections should be created in the `src/pages/` directory.
*   **Routing**:
    *   The current top-level routing in `App.tsx` uses conditional rendering.
    *   For more complex client-side routing within the application, `react-router-dom` should be used, and its routes should be defined in `src/App.tsx`.
*   **Icons**: Use icons from the `lucide-react` package.
*   **State Management**: Utilize React's built-in hooks (`useState`, `useEffect`, `useRef`, `useCallback`, etc.) for component-level and local state management.
*   **Data Persistence**:
    *   For simple client-side data storage, `localStorage` is acceptable.
    *   For backend data, authentication, or server-side functions, the recommended integration is **Supabase**.
*   **Toast Notifications**: If toast notifications are required to inform users about events (e.g., success, error messages), use the `react-hot-toast` library.
*   **File Structure**:
    *   Directory names must be all lowercase (e.g., `src/pages`, `src/components`).
    *   File names may use mixed-case (e.g., `Navbar.tsx`, `EventDetails.tsx`).
*   **Simplicity**: Prioritize simple and elegant solutions. Avoid over-engineering with complex error handling or fallback mechanisms unless specifically requested.