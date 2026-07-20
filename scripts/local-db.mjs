// Postgres local para desarrollo, sin Homebrew/Docker/sudo: descarga un binario
// real de Postgres (via embedded-postgres) y lo corre desde el propio proyecto.
// Uso: `npm run db:start` / `npm run db:stop`.
import EmbeddedPostgres from "embedded-postgres";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const databaseDir = path.join(__dirname, "..", ".pgdata");

const pg = new EmbeddedPostgres({
  databaseDir,
  user: "postgres",
  password: "localdev",
  port: 5433,
  persistent: true,
});

const command = process.argv[2];

if (command === "start") {
  try {
    await pg.initialise();
  } catch (e) {
    console.log("El directorio de la base de datos ya existe o no está vacío. Continuando...");
  }
  await pg.start();
  await pg.createDatabase("scoutline").catch(() => {});
  console.log("Postgres local corriendo en postgresql://postgres:localdev@localhost:5433/scoutline");
} else if (command === "stop") {
  await pg.stop();
  console.log("Postgres local detenido.");
} else {
  console.error("Uso: node scripts/local-db.mjs [start|stop]");
  process.exit(1);
}
