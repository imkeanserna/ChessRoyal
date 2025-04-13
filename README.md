<p align="center"> <img src="https://github.com/user-attachments/assets/a9ed434c-b1de-4bdc-8693-ddddd2eca59d" alt="Chess Royal Logo" width="200"/> </p> <p align="center"> Real-Time Chess Battles. Multiplayer. Competitive. Lightning-Fast. </p> <p> <strong>Chess Royal</strong> is a multiplayer chess platform built with a modern web stack. It offers real-time gameplay, seamless matchmaking, and a powerful UI designed to create a fair, competitive experience for all skill levels. </p>

<h3 name="core-features">♟️  Core Features</h3>
<h2 name="multiplayer">🎯  Real-Time Multiplayer Gameplay</h2>
<ul>
  <li>Challenge players from around the globe in live chess matches.</li>
  <li>Enjoy smooth, instant move synchronization powered by WebSocket technology.</li>
</ul>

<h2 name="competitive-play">⚔️ Competitive Play</h2>
<ul>
  <li>Designed with fairness and integrity in mind.</li>
  <li>Built-in validation using chess.js to ensure legal moves.</li>
</ul>

<h2 name="stack">🚀 Fast & Performant Stack</h2>
<ul>
  <li><b>Next.js</b> frontend for fast loading and responsive design.</li>
  <li><b>WebSocket Server</b> for low-latency communication.</li>
  <li><b>Redis Worker</b> for scalable background job processing.</li>
  <li><b>Prisma ORM</b> for efficient database access.</li>
</ul>

<h2 name="multiplayer">🗂  Monorepo Structure</h2>
<p>Chess Royal follows a monorepo architecture managed by <code>Turbo</code>. It promotes efficient development by sharing code across apps and packages.</p>

<details> <summary><h3> 📂 <code>apps/</code> – Main Applications</h3></summary>
  <li><code>socket-server/</code> – WebSocket server handling real-time communication.</li>
  <li><code>web/</code> – Next.js frontend application with modern UI/UX.</li>
  <li><code>redis-worker/</code> – Redis-based job handler using BullMQ for queues.</li>
</details>

<details> <summary><h3> 📦 <code>packages/</code> – Shared Packages</h3></summary>
  <li><code>chess/</code> – Shared chess logic and utilities.</li>
  <li><code>prisma-db/</code> – Database schema, migrations, and Prisma client.</li>
  <li><code>store/</code> – Global state management (e.g. Recoil atoms/selectors).</li>
  <li><code>ui/</code> – Reusable UI components and design system.</li>
  <li><code>eslint-config/</code> – Shared ESLint rules for consistent linting.</li>
  <li><code>typescript-config/</code> – Shared tsconfig base for all packages/apps.</li>
</details>

<h3 name="tech-stack">🛠  Tech Stack</h3>
<ul>
  <li><b>Frontend:</b> Next.js, React, TailwindCSS, Recoil</li>
  <li><b>Backend:</b> Node.js, WebSockets (ws), Express, BullMQ</li>
  <li><b>Database:</b> PostgreSQL (via Prisma ORM)</li>
  <li><b>Caching & Jobs</b> Redis, Upstash</li>
  <li><b>Monorepo Tools:</b> Turborepo, pnpm</li>
</ul>

<h3 name="tech-stack">🤝 Contributing</h3>
Contributions are welcome! Whether it’s a bug fix, feature suggestion, or documentation improvement, feel free to open an issue or submit a PR.
