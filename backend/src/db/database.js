import pg from "pg";
import { AsyncLocalStorage } from "node:async_hooks";
import { env } from "../config/env.js";

const { Pool, types } = pg;

types.setTypeParser(20, (value) => Number(value));
types.setTypeParser(23, (value) => Number(value));
types.setTypeParser(1700, (value) => Number(value));

/*
|--------------------------------------------------------------------------
| DATABASE CONFIGURATION
|--------------------------------------------------------------------------
*/

const databaseConfig = env.database || {};

const databaseUrl =
  databaseConfig.url ||
  process.env.DATABASE_URL ||
  env.databaseUrl ||
  undefined;

/*
|--------------------------------------------------------------------------
| SAFE NUMBER PARSER
|--------------------------------------------------------------------------
*/

function toPositiveNumber(value, fallback) {
  const parsed = Number(value);

  return Number.isFinite(parsed) && parsed > 0
    ? parsed
    : fallback;
}

/*
|--------------------------------------------------------------------------
| CONNECTION POOL SETTINGS
|--------------------------------------------------------------------------
|
| IMPORTANT:
|
| 5000 users do NOT require 5000 PostgreSQL connections.
|
| Example:
|
| 5000 users
|      ↓
| Render Node.js instance
|      ↓
| connection pool
|      ↓
| PostgreSQL
|
| The pool controls how many DB operations can execute
| concurrently.
|
|--------------------------------------------------------------------------
*/

const poolMax = toPositiveNumber(
  databaseConfig.poolMax ||
    process.env.DB_POOL_MAX,
  60
);

const poolMin = Math.max(
  0,
  Number(
    databaseConfig.poolMin ||
      process.env.DB_POOL_MIN ||
      5
  )
);

const poolIdleTimeoutMs = toPositiveNumber(
  databaseConfig.poolIdleTimeoutMs ||
    process.env.DB_POOL_IDLE_TIMEOUT_MS,
  10000
);

const poolConnectionTimeoutMs = toPositiveNumber(
  databaseConfig.poolConnectionTimeoutMs ||
    process.env.DB_POOL_CONNECTION_TIMEOUT_MS,
  12000
);

const statementTimeoutMs = toPositiveNumber(
  databaseConfig.statementTimeoutMs ||
    process.env.DB_STATEMENT_TIMEOUT_MS,
  30000
);

const queryTimeoutMs = toPositiveNumber(
  databaseConfig.queryTimeoutMs ||
    process.env.DB_QUERY_TIMEOUT_MS,
  30000
);

/*
|--------------------------------------------------------------------------
| SSL
|--------------------------------------------------------------------------
|
| Render PostgreSQL commonly requires SSL depending on the
| connection URL/environment.
|
| DB_SSL=true
| DB_SSL_REJECT_UNAUTHORIZED=false
|
| can be configured on Render when required.
|--------------------------------------------------------------------------
*/

const sslEnabled =
  databaseConfig.ssl === true ||
  String(
    process.env.DB_SSL || ""
  ).toLowerCase() === "true";

const rejectUnauthorized =
  databaseConfig.rejectUnauthorized !== false &&
  String(
    process.env.DB_SSL_REJECT_UNAUTHORIZED ??
      "true"
  ).toLowerCase() !== "false";

/*
|--------------------------------------------------------------------------
| POOL CONFIGURATION
|--------------------------------------------------------------------------
*/

const poolConfig = databaseUrl
  ? {
      connectionString: databaseUrl,

      max: poolMax,

      min: poolMin,

      idleTimeoutMillis:
        poolIdleTimeoutMs,

      connectionTimeoutMillis:
        poolConnectionTimeoutMs,

      statement_timeout:
        statementTimeoutMs,

      query_timeout:
        queryTimeoutMs,

      keepAlive: true,

      keepAliveInitialDelayMillis:
        10000,

      ssl: sslEnabled
        ? {
            rejectUnauthorized
          }
        : undefined
    }
  : {
      host:
        databaseConfig.host ||
        process.env.DB_HOST ||
        "localhost",

      port: Number(
        databaseConfig.port ||
          process.env.DB_PORT ||
          5432
      ),

      database:
        databaseConfig.name ||
        process.env.DB_NAME ||
        "c_cube",

      user:
        databaseConfig.user ||
        process.env.DB_USER ||
        "postgres",

      password:
        databaseConfig.password ||
        process.env.DB_PASSWORD ||
        "",

      max: poolMax,

      min: poolMin,

      idleTimeoutMillis:
        poolIdleTimeoutMs,

      connectionTimeoutMillis:
        poolConnectionTimeoutMs,

      statement_timeout:
        statementTimeoutMs,

      query_timeout:
        queryTimeoutMs,

      keepAlive: true,

      keepAliveInitialDelayMillis:
        10000,

      ssl: sslEnabled
        ? {
            rejectUnauthorized
          }
        : undefined
    };

/*
|--------------------------------------------------------------------------
| POSTGRESQL POOL
|--------------------------------------------------------------------------
*/

export const db =
  new Pool(poolConfig);

/*
|--------------------------------------------------------------------------
| POOL EVENTS
|--------------------------------------------------------------------------
*/

db.on("connect", () => {
  if (
    env.nodeEnv !==
    "production"
  ) {
    console.log(
      "✅ PostgreSQL connection established"
    );
  }
});

db.on("acquire", () => {
  if (
    env.nodeEnv ===
    "development"
  ) {
    // Useful while testing locally.
    // Avoid logging this in production.
  }
});

db.on("remove", () => {
  if (
    env.nodeEnv ===
    "development"
  ) {
    // Connection removed from pool.
  }
});

db.on("error", (error) => {
  console.error(
    "Unexpected PostgreSQL pool error:",
    error
  );
});

/*
|--------------------------------------------------------------------------
| TRANSACTION CONTEXT
|--------------------------------------------------------------------------
*/

const transactionStorage =
  new AsyncLocalStorage();

/*
|--------------------------------------------------------------------------
| GET CURRENT DATABASE EXECUTOR
|--------------------------------------------------------------------------
*/

function getExecutor() {
  const store =
    transactionStorage.getStore();

  if (
    store?.client
  ) {
    return store.client;
  }

  return db;
}

/*
|--------------------------------------------------------------------------
| NORMALIZE ? PARAMETERS
|--------------------------------------------------------------------------
|
| Existing project queries use:
|
| WHERE id = ?
|
| PostgreSQL requires:
|
| WHERE id = $1
|
|--------------------------------------------------------------------------
*/

function normalizeQuery(
  sql,
  params = []
) {
  let placeholderIndex = 1;

  let result = "";

  let inSingleQuote = false;
  let inDoubleQuote = false;

  for (
    let i = 0;
    i < sql.length;
    i++
  ) {
    const char =
      sql[i];

    const nextChar =
      sql[i + 1];

    /*
    |--------------------------------------------------------------------------
    | Handle single quote
    |--------------------------------------------------------------------------
    */

    if (
      char === "'" &&
      !inDoubleQuote
    ) {
      result += char;

      if (
        inSingleQuote &&
        nextChar === "'"
      ) {
        result += nextChar;
        i++;
        continue;
      }

      inSingleQuote =
        !inSingleQuote;

      continue;
    }

    /*
    |--------------------------------------------------------------------------
    | Handle double quote
    |--------------------------------------------------------------------------
    */

    if (
      char === '"' &&
      !inSingleQuote
    ) {
      result += char;

      if (
        inDoubleQuote &&
        nextChar === '"'
      ) {
        result += nextChar;
        i++;
        continue;
      }

      inDoubleQuote =
        !inDoubleQuote;

      continue;
    }

    /*
    |--------------------------------------------------------------------------
    | Convert parameter placeholder
    |--------------------------------------------------------------------------
    */

    if (
      char === "?" &&
      !inSingleQuote &&
      !inDoubleQuote
    ) {
      result +=
        `$${placeholderIndex++}`;

      continue;
    }

    result += char;
  }

  return {
    sql: result,
    params
  };
}

/*
|--------------------------------------------------------------------------
| ENSURE INSERT RETURNING ID
|--------------------------------------------------------------------------
|
| Existing repository code expects:
|
| result.id
|
| PostgreSQL INSERT does not return the ID automatically.
|--------------------------------------------------------------------------
*/

function ensureInsertReturning(
  sql
) {
  const trimmedSql =
    sql.trim();

  if (
    !/^INSERT\s+/i.test(
      trimmedSql
    )
  ) {
    return trimmedSql;
  }

  if (
    /\bRETURNING\b/i.test(
      trimmedSql
    )
  ) {
    return trimmedSql;
  }

  return `${trimmedSql} RETURNING id`;
}

/*
|--------------------------------------------------------------------------
| SPLIT SQL STATEMENTS
|--------------------------------------------------------------------------
*/

function splitStatements(
  sql
) {
  const statements = [];

  let current = "";

  let inSingleQuote =
    false;

  let inDoubleQuote =
    false;

  for (
    let index = 0;
    index < sql.length;
    index++
  ) {
    const char =
      sql[index];

    const nextChar =
      sql[index + 1];

    /*
    |--------------------------------------------------------------------------
    | Single quote
    |--------------------------------------------------------------------------
    */

    if (
      char === "'" &&
      !inDoubleQuote
    ) {
      if (
        inSingleQuote &&
        nextChar === "'"
      ) {
        current += char;
        current += nextChar;

        index++;

        continue;
      }

      inSingleQuote =
        !inSingleQuote;

      current += char;

      continue;
    }

    /*
    |--------------------------------------------------------------------------
    | Double quote
    |--------------------------------------------------------------------------
    */

    if (
      char === '"' &&
      !inSingleQuote
    ) {
      if (
        inDoubleQuote &&
        nextChar === '"'
      ) {
        current += char;
        current += nextChar;

        index++;

        continue;
      }

      inDoubleQuote =
        !inDoubleQuote;

      current += char;

      continue;
    }

    /*
    |--------------------------------------------------------------------------
    | Statement separator
    |--------------------------------------------------------------------------
    */

    if (
      char === ";" &&
      !inSingleQuote &&
      !inDoubleQuote
    ) {
      const statement =
        current.trim();

      if (statement) {
        statements.push(
          statement
        );
      }

      current = "";

      continue;
    }

    current += char;
  }

  const finalStatement =
    current.trim();

  if (
    finalStatement
  ) {
    statements.push(
      finalStatement
    );
  }

  return statements;
}

/*
|--------------------------------------------------------------------------
| RUN
|--------------------------------------------------------------------------
*/

export async function run(
  sql,
  params = []
) {
  const queryText =
    ensureInsertReturning(
      sql
    );

  const {
    sql: normalizedSql,
    params: normalizedParams
  } =
    normalizeQuery(
      queryText,
      params
    );

  const executor =
    getExecutor();

  const result =
    await executor.query(
      normalizedSql,
      normalizedParams
    );

  return {
    id:
      result.rows[0]?.id ??
      null,

    changes:
      result.rowCount ?? 0
  };
}

/*
|--------------------------------------------------------------------------
| GET
|--------------------------------------------------------------------------
*/

export async function get(
  sql,
  params = []
) {
  const {
    sql: normalizedSql,
    params: normalizedParams
  } =
    normalizeQuery(
      sql,
      params
    );

  const executor =
    getExecutor();

  const result =
    await executor.query(
      normalizedSql,
      normalizedParams
    );

  return (
    result.rows[0] ??
    null
  );
}

/*
|--------------------------------------------------------------------------
| ALL
|--------------------------------------------------------------------------
*/

export async function all(
  sql,
  params = []
) {
  const {
    sql: normalizedSql,
    params: normalizedParams
  } =
    normalizeQuery(
      sql,
      params
    );

  const executor =
    getExecutor();

  const result =
    await executor.query(
      normalizedSql,
      normalizedParams
    );

  return result.rows;
}

/*
|--------------------------------------------------------------------------
| EXEC
|--------------------------------------------------------------------------
|
| Used for database initialization.
|--------------------------------------------------------------------------
*/

export async function exec(
  sql
) {
  const statements =
    splitStatements(
      sql
    );

  const executor =
    getExecutor();

  for (
    const statement
    of statements
  ) {
    const {
      sql: normalizedSql
    } =
      normalizeQuery(
        statement,
        []
      );

    await executor.query(
      normalizedSql
    );
  }
}

/*
|--------------------------------------------------------------------------
| BEGIN TRANSACTION
|--------------------------------------------------------------------------
|
| Legacy/manual transaction API.
|
| Prefer withTransaction() for new code.
|--------------------------------------------------------------------------
*/

export async function beginTransaction() {
  const existingStore =
    transactionStorage.getStore();

  if (
    existingStore?.client
  ) {
    return existingStore.client;
  }

  const client =
    await db.connect();

  try {
    await client.query(
      "BEGIN"
    );

    transactionStorage.enterWith({
      client
    });

    return client;
  } catch (error) {
    client.release();

    throw error;
  }
}

/*
|--------------------------------------------------------------------------
| COMMIT TRANSACTION
|--------------------------------------------------------------------------
*/

export async function commitTransaction() {
  const store =
    transactionStorage.getStore();

  if (
    !store?.client
  ) {
    const error =
      new Error(
        "No active database transaction to commit."
      );

    error.statusCode = 400;

    throw error;
  }

  const client =
    store.client;

  try {
    await client.query(
      "COMMIT"
    );
  } finally {
    client.release();
  }
}

/*
|--------------------------------------------------------------------------
| ROLLBACK TRANSACTION
|--------------------------------------------------------------------------
*/

export async function rollbackTransaction() {
  const store =
    transactionStorage.getStore();

  if (
    !store?.client
  ) {
    return;
  }

  const client =
    store.client;

  try {
    await client.query(
      "ROLLBACK"
    );
  } catch (rollbackError) {
    console.error(
      "Rollback failed:",
      rollbackError
    );
  } finally {
    client.release();
  }
}

/*
|--------------------------------------------------------------------------
| WITH TRANSACTION
|--------------------------------------------------------------------------
|
| Recommended transaction API.
|
| Every query inside callback uses the SAME
| PostgreSQL connection.
|--------------------------------------------------------------------------
*/

export async function withTransaction(
  callback
) {
  const client =
    await db.connect();

  try {
    /*
    |--------------------------------------------------------------------------
    | BEGIN
    |--------------------------------------------------------------------------
    */

    await client.query(
      "BEGIN"
    );

    /*
    |--------------------------------------------------------------------------
    | TRANSACTION CONTEXT
    |--------------------------------------------------------------------------
    */

    const result =
      await transactionStorage.run(
        { client },
        callback
      );

    /*
    |--------------------------------------------------------------------------
    | COMMIT
    |--------------------------------------------------------------------------
    */

    await client.query(
      "COMMIT"
    );

    return result;

  } catch (error) {
    /*
    |--------------------------------------------------------------------------
    | ROLLBACK
    |--------------------------------------------------------------------------
    */

    try {
      await client.query(
        "ROLLBACK"
      );
    } catch (
      rollbackError
    ) {
      console.error(
        "Rollback failed:",
        rollbackError
      );
    }

    throw error;

  } finally {
    /*
    |--------------------------------------------------------------------------
    | RELEASE CONNECTION
    |--------------------------------------------------------------------------
    */

    client.release();
  }
}

/*
|--------------------------------------------------------------------------
| DATABASE HEALTH CHECK
|--------------------------------------------------------------------------
*/

export async function checkDatabaseHealth() {
  const start =
    Date.now();

  try {
    await db.query(
      "SELECT 1"
    );

    return {
      healthy: true,

      latencyMs:
        Date.now() - start,

      pool: {
        total:
          db.totalCount,

        idle:
          db.idleCount,

        waiting:
          db.waitingCount
      }
    };

  } catch (error) {
    return {
      healthy: false,

      latencyMs:
        Date.now() - start,

      error:
        error.message,

      pool: {
        total:
          db.totalCount,

        idle:
          db.idleCount,

        waiting:
          db.waitingCount
      }
    };
  }
}

/*
|--------------------------------------------------------------------------
| CLOSE DATABASE
|--------------------------------------------------------------------------
|
| Used during graceful shutdown.
|--------------------------------------------------------------------------
*/

export async function closeDatabase() {
  try {
    await db.end();

    console.log(
      "PostgreSQL pool closed"
    );

  } catch (error) {
    console.error(
      "Failed to close PostgreSQL pool:",
      error
    );

    throw error;
  }
}