import "dotenv/config";
import { getBank } from "open-banking-chile";
import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";

// ─── Config ───────────────────────────────────────────────────────────────────

const BANK_ID = process.env.BANK || "santander";
const FROM_DATE = process.env.FROM_DATE ? new Date(process.env.FROM_DATE) : new Date("2024-01-01");
const TO_DATE = process.env.TO_DATE ? new Date(process.env.TO_DATE) : new Date();

// Mapa de variables de entorno por banco
const CREDENTIALS = {
  santander:   { rut: process.env.SANTANDER_RUT,   password: process.env.SANTANDER_PASS },
  bchile:      { rut: process.env.BANCOCHILE_RUT,  password: process.env.BANCOCHILE_PASS },
  bci:         { rut: process.env.BCI_RUT,          password: process.env.BCI_PASS },
  bestado:     { rut: process.env.BESTADO_RUT,      password: process.env.BESTADO_PASS },
  itau:        { rut: process.env.ITAU_RUT,         password: process.env.ITAU_PASS },
  scotiabank:  { rut: process.env.SCOTIABANK_RUT,   password: process.env.SCOTIABANK_PASS },
  bice:        { rut: process.env.BICE_RUT,         password: process.env.BICE_PASS },
  falabella:   { rut: process.env.FALABELLA_RUT,    password: process.env.FALABELLA_PASS },
  edwards:     { rut: process.env.EDWARDS_RUT,      password: process.env.EDWARDS_PASS },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

// Convierte "dd-mm-yyyy" → Date
function parseMovDate(str) {
  const [d, m, y] = str.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function filterByDateRange(movements) {
  return movements.filter((m) => {
    const d = parseMovDate(m.date);
    return d >= FROM_DATE && d <= TO_DATE;
  });
}

function toCSV(movements) {
  const header = "fecha,descripcion,monto,saldo,tipo,titular,tarjeta,cuotas,monto_total";
  const rows = movements.map((m) =>
    [
      m.date,
      `"${m.description.replace(/"/g, '""')}"`,
      m.amount,
      m.balance ?? "",
      m.source,
      m.owner ?? "",
      m.card ?? "",
      m.installments ?? "",
      m.totalAmount ?? "",
    ].join(",")
  );
  return [header, ...rows].join("\n");
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const creds = CREDENTIALS[BANK_ID];

  if (!creds?.rut || !creds?.password) {
    console.error(`\n❌ Credenciales faltantes para "${BANK_ID}".`);
    console.error(`   Revisa tu .env y asegúrate de tener ${BANK_ID.toUpperCase()}_RUT y ${BANK_ID.toUpperCase()}_PASS.\n`);
    process.exit(1);
  }

  const bank = getBank(BANK_ID);
  if (!bank) {
    console.error(`\n❌ Banco "${BANK_ID}" no encontrado. Opciones: santander, bchile, bci, bestado, itau, scotiabank, bice, falabella, edwards\n`);
    process.exit(1);
  }

  console.log(`\n🏦 Conectando a ${BANK_ID} (${creds.rut})...`);
  console.log(`📅 Rango: ${FROM_DATE.toLocaleDateString("es-CL")} → ${TO_DATE.toLocaleDateString("es-CL")}\n`);

  let result;
  try {
    result = await bank.scrape({
      rut: creds.rut,
      password: creds.password,
      chromePath: process.env.CHROME_PATH,
      extraArgs: ["--ignore-certificate-errors"],
      onProgress: (msg) => console.log(`  ⏳ ${msg}`),
    });
  } catch (err) {
    console.error(`\n❌ Error al conectar con el banco: ${err.message}\n`);
    process.exit(1);
  }

  if (!result.success) {
    console.error(`\n❌ El scraper reportó error. Resultado:\n`, JSON.stringify(result, null, 2));
    process.exit(1);
  }

  // Normalizar: v2 usa result.movements (plano), v1 también
  const allMovements = result.movements ?? [];
  const filtered = filterByDateRange(allMovements);

  console.log(`\n✅ Total movimientos obtenidos: ${allMovements.length}`);
  console.log(`📊 Movimientos en rango (${FROM_DATE.toLocaleDateString("es-CL")} – ${TO_DATE.toLocaleDateString("es-CL")}): ${filtered.length}`);

  if (filtered.length === 0) {
    console.warn("\n⚠️  Sin movimientos en el rango solicitado.");
    console.warn("   El banco puede tener un límite de historial en su portal web.");
    console.warn("   Considera consultar directamente en la sucursal o exportar por períodos.\n");
  }

  // Ordenar por fecha descendente
  filtered.sort((a, b) => parseMovDate(b.date) - parseMovDate(a.date));

  // Guardar resultados
  mkdirSync("output", { recursive: true });
  const timestamp = new Date().toISOString().slice(0, 10);
  const jsonPath = join("output", `movimientos_${BANK_ID}_${timestamp}.json`);
  const csvPath  = join("output", `movimientos_${BANK_ID}_${timestamp}.csv`);

  writeFileSync(jsonPath, JSON.stringify(filtered, null, 2), "utf-8");
  writeFileSync(csvPath, toCSV(filtered), "utf-8");

  console.log(`\n💾 Archivos guardados:`);
  console.log(`   JSON → ${jsonPath}`);
  console.log(`   CSV  → ${csvPath}`);

  // Resumen por año/mes
  const resumen = {};
  for (const m of filtered) {
    const [d, mo, y] = m.date.split("-");
    const key = `${y}-${mo}`;
    resumen[key] = (resumen[key] ?? 0) + 1;
  }

  console.log("\n📈 Resumen por mes:");
  for (const [mes, count] of Object.entries(resumen).sort()) {
    console.log(`   ${mes}: ${count} movimientos`);
  }
  console.log();
}

main();
