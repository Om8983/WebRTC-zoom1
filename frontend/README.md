# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(["dist"]),
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ["./tsconfig.node.json", "./tsconfig.app.json"],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
]);
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from "eslint-plugin-react-x";
import reactDom from "eslint-plugin-react-dom";

export default defineConfig([
  globalIgnores(["dist"]),
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs["recommended-typescript"],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ["./tsconfig.node.json", "./tsconfig.app.json"],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
]);
```

`REQUIREMENT GATHERING`

1.  login
2.  logout
3.  jwt session management

`BEFORE JOINING MEETING`

1.  create meeting
2.  JOIN MEETING code / link / email (optional)
3.  Audio preview
4.  Video preview
5.  Device selection
6.  cancel joining

`AFTER JOINING MEETING`

7.  Joining meeting after it has been successfully created ( i.e adding participants in an already created p2p meeting conversation)
8.  Leave meeting
9.  End Meeting (HOST ONLY. Completely disconnects the communication between the users)
10. View participants
11. Mute / unmute and Video / no-video functionality
12. Participants join and leave events

`COMMUNICATION`

13. audio calling
14. video calling
15. group chat
16. screen sharing

17. `Mesh connection` i.e connecting 4-6 users on a p2p network

`RESOURCES REQUIRED`
`BACKEND`


1. Prisma + PostgreqSQL
   For storing the user information
2. `ws` lib for websocket connection in signaling server
3. `express` as framework for backend
4. `jwt` for session management

5. A `TURN` server for the backup

`FRONTEND`

1. React + TS
2. RTCPeerconnection and Websocket webAPI's

`Main Challenge`

1. Reconnection after Refresh
2. network interruption handling especially for rooms having more that one user
3. Connecting 4-6 users on a p2p connection and sharing the SDP and ICE candidates to each user
4. enumerating that is adding devices and participants one by one as per the demands
