---

## Update (Timestamp: 2024-09-06)

*   **Implemented "Forgot Password":** Added functionality to `app/app/(auth)/login.tsx`. Uses `Alert.prompt` to get the user's email and calls `resetPassword` from `AuthContext`.
*   **Configured Custom Font Loading:**
    *   Installed `expo-font`, `expo-splash-screen`, `@expo-google-fonts/roboto`.
    *   Modified `app/app/_layout.tsx` to use `useFonts` to load Roboto fonts (Regular, Medium, Bold).
    *   Integrated `expo-splash-screen` to prevent auto-hiding and hide splash only when fonts are loaded/failed. 