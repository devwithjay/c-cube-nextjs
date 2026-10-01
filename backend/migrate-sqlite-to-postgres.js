import sqlite3 from "sqlite3";
import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pg;

const SQLITE_PATH = "./data/c-cube.db";

/*
|--------------------------------------------------------------------------
| PostgreSQL Pool
|--------------------------------------------------------------------------
*/

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});


/*
|--------------------------------------------------------------------------
| SQLite Connection
|--------------------------------------------------------------------------
*/

const sqlite =
  new sqlite3.Database(
    SQLITE_PATH,
    (error) => {

      if (error) {

        console.error(
          "❌ Failed to open SQLite database:",
          error
        );

      }

    }
  );


/*
|--------------------------------------------------------------------------
| SQLite Helper
|--------------------------------------------------------------------------
*/

function sqliteAll(
  sql,
  params = []
) {

  return new Promise(
    (resolve, reject) => {

      sqlite.all(
        sql,
        params,
        (error, rows) => {

          if (error) {

            reject(error);

            return;

          }

          resolve(rows);

        }
      );

    }
  );

}


/*
|--------------------------------------------------------------------------
| Tables
|--------------------------------------------------------------------------
|
| Parent tables are migrated before child tables.
|--------------------------------------------------------------------------
*/

const tables = [

  "club_info",

  "objectives",

  "faculty_mentor",

  "team_members",

  "events",

  "event_glimpses",

  "gallery",

  "contacts",

  "admin_users",

  "three_q_tests",

  "three_q_sections",

  "three_q_questions",

  "three_q_options",

  "three_q_participants",

  "three_q_sessions",

  "three_q_answers",

  "three_q_results"

];


/*
|--------------------------------------------------------------------------
| Get PostgreSQL Column Information
|--------------------------------------------------------------------------
*/

async function getPostgresColumns(
  client,
  tableName
) {

  const result =
    await client.query(
      `
      SELECT
        column_name,
        data_type
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = $1
      ORDER BY ordinal_position
      `,
      [tableName]
    );


  return result.rows;

}


/*
|--------------------------------------------------------------------------
| Get SQLite Columns
|--------------------------------------------------------------------------
*/

async function getSQLiteColumns(
  tableName
) {

  const rows =
    await sqliteAll(
      `PRAGMA table_info("${tableName}")`
    );


  return rows.map(
    row => row.name
  );

}


/*
|--------------------------------------------------------------------------
| Normalize Values
|--------------------------------------------------------------------------
|
| Converts SQLite values to PostgreSQL-compatible values.
|--------------------------------------------------------------------------
*/

function normalizeValue(
  tableName,
  columnName,
  value,
  postgresColumnType
) {

  /*
  |--------------------------------------------------------------------------
  | NULL
  |--------------------------------------------------------------------------
  */

  if (
    value === null ||
    value === undefined
  ) {

    return null;

  }


  /*
  |--------------------------------------------------------------------------
  | PostgreSQL BOOLEAN
  |--------------------------------------------------------------------------
  */

  if (
    postgresColumnType === "boolean"
  ) {

    if (
      value === true ||
      value === 1 ||
      value === "1" ||
      value === "true"
    ) {

      return true;

    }


    if (
      value === false ||
      value === 0 ||
      value === "0" ||
      value === "false"
    ) {

      return false;

    }

  }


  /*
  |--------------------------------------------------------------------------
  | PostgreSQL INTEGER
  |--------------------------------------------------------------------------
  |
  | SQLite may contain:
  |
  | true
  | false
  |
  | PostgreSQL INTEGER needs:
  |
  | 1
  | 0
  |--------------------------------------------------------------------------
  */

  if (
    postgresColumnType === "integer" ||
    postgresColumnType === "bigint" ||
    postgresColumnType === "smallint"
  ) {

    if (
      value === true ||
      value === "true"
    ) {

      return 1;

    }


    if (
      value === false ||
      value === "false"
    ) {

      return 0;

    }

  }


  return value;

}


/*
|--------------------------------------------------------------------------
| Reset PostgreSQL SERIAL Sequence
|--------------------------------------------------------------------------
*/

async function resetSequence(
  client,
  tableName
) {

  const columns =
    await getPostgresColumns(
      client,
      tableName
    );


  const hasIdColumn =
    columns.some(
      column =>
        column.column_name === "id"
    );


  if (!hasIdColumn) {

    return;

  }


  /*
  |--------------------------------------------------------------------------
  | Check whether PostgreSQL has a sequence for this ID
  |--------------------------------------------------------------------------
  */

  const sequenceResult =
    await client.query(
      `
      SELECT pg_get_serial_sequence(
        $1,
        'id'
      ) AS sequence_name
      `,
      [
        `public.${tableName}`
      ]
    );


  const sequenceName =
    sequenceResult.rows[0]
      ?.sequence_name;


  if (!sequenceName) {

    return;

  }


  /*
  |--------------------------------------------------------------------------
  | Check whether table contains rows
  |--------------------------------------------------------------------------
  */

  const maxResult =
    await client.query(
      `
      SELECT MAX(id) AS max_id
      FROM "${tableName}"
      `
    );


  const maxId =
    maxResult.rows[0]?.max_id;


  if (
    maxId === null ||
    maxId === undefined
  ) {

    return;

  }


  /*
  |--------------------------------------------------------------------------
  | Set sequence to latest ID
  |--------------------------------------------------------------------------
  */

  await client.query(
    `
    SELECT setval(
      $1,
      $2,
      true
    )
    `,
    [
      sequenceName,
      Number(maxId)
    ]
  );


  console.log(
    `🔄 Sequence reset: ${tableName} → ${maxId}`
  );

}


/*
|--------------------------------------------------------------------------
| Migrate One Table
|--------------------------------------------------------------------------
*/

async function migrateTable(
  client,
  tableName
) {

  console.log(
    `\n📦 Migrating ${tableName}...`
  );


  /*
  |--------------------------------------------------------------------------
  | Get SQLite columns
  |--------------------------------------------------------------------------
  */

  const sqliteColumns =
    await getSQLiteColumns(
      tableName
    );


  /*
  |--------------------------------------------------------------------------
  | Get PostgreSQL columns + types
  |--------------------------------------------------------------------------
  */

  const postgresColumnInfo =
    await getPostgresColumns(
      client,
      tableName
    );


  /*
  |--------------------------------------------------------------------------
  | PostgreSQL column names
  |--------------------------------------------------------------------------
  */

  const postgresColumns =
    postgresColumnInfo.map(
      column =>
        column.column_name
    );


  /*
  |--------------------------------------------------------------------------
  | Find common columns
  |--------------------------------------------------------------------------
  */

  const columns =
    sqliteColumns.filter(
      column =>
        postgresColumns.includes(
          column
        )
    );


  if (
    columns.length === 0
  ) {

    console.log(
      `⚠️ No matching columns for ${tableName}`
    );

    return;

  }


  /*
  |--------------------------------------------------------------------------
  | Read SQLite rows
  |--------------------------------------------------------------------------
  */

  const rows =
    await sqliteAll(
      `SELECT * FROM "${tableName}"`
    );


  if (
    rows.length === 0
  ) {

    console.log(
      `ℹ️ ${tableName}: 0 rows`
    );

    return;

  }


  /*
  |--------------------------------------------------------------------------
  | PostgreSQL column list
  |--------------------------------------------------------------------------
  */

  const columnList =
    columns
      .map(
        column =>
          `"${column}"`
      )
      .join(", ");


  /*
  |--------------------------------------------------------------------------
  | PostgreSQL placeholders
  |--------------------------------------------------------------------------
  */

  const placeholders =
    columns
      .map(
        (_, index) =>
          `$${index + 1}`
      )
      .join(", ");


  /*
  |--------------------------------------------------------------------------
  | INSERT query
  |--------------------------------------------------------------------------
  */

  const insertSql = `
    INSERT INTO "${tableName}"
    (${columnList})
    VALUES (${placeholders})
  `;


  let inserted = 0;


  /*
  |--------------------------------------------------------------------------
  | Insert each row
  |--------------------------------------------------------------------------
  */

  for (
    const row
    of rows
  ) {

    const values =
      columns.map(
        column => {

          const columnInfo =
            postgresColumnInfo.find(
              item =>
                item.column_name ===
                column
            );


          return normalizeValue(
            tableName,
            column,
            row[column],
            columnInfo?.data_type
          );

        }
      );


    try {

      await client.query(
        insertSql,
        values
      );


      inserted++;

    }
    catch (error) {

      /*
      |--------------------------------------------------------------------------
      | Duplicate
      |--------------------------------------------------------------------------
      */

      if (
        error.code === "23505"
      ) {

        console.log(
          `⚠️ Duplicate skipped in ${tableName}`
        );

        continue;

      }


      throw error;

    }

  }


  console.log(
    `✅ ${tableName}: ${inserted}/${rows.length} rows migrated`
  );

}


/*
|--------------------------------------------------------------------------
| Main Migration
|--------------------------------------------------------------------------
*/

async function migrate() {

  let client = null;


  try {

    /*
    |--------------------------------------------------------------------------
    | PostgreSQL connection
    |--------------------------------------------------------------------------
    */

    client =
      await pool.connect();


    console.log(
      "\n🚀 Starting SQLite → PostgreSQL migration..."
    );


    console.log(
      `📁 SQLite: ${SQLITE_PATH}`
    );


    /*
    |--------------------------------------------------------------------------
    | Hide password in output
    |--------------------------------------------------------------------------
    */

    const safeDatabaseUrl =
      process.env.DATABASE_URL
        ? process.env.DATABASE_URL.replace(
            /:\/\/([^:]+):[^@]+@/,
            "://$1:****@"
          )
        : "DATABASE_URL not set";


    console.log(
      `🗄️ PostgreSQL: ${safeDatabaseUrl}`
    );


    /*
    |--------------------------------------------------------------------------
    | Start transaction
    |--------------------------------------------------------------------------
    */

    await client.query(
      "BEGIN"
    );


    /*
    |--------------------------------------------------------------------------
    | Migrate tables
    |--------------------------------------------------------------------------
    */

    for (
      const table
      of tables
    ) {

      await migrateTable(
        client,
        table
      );

    }


    /*
    |--------------------------------------------------------------------------
    | Reset SERIAL sequences
    |--------------------------------------------------------------------------
    */

    console.log(
      "\n🔄 Resetting PostgreSQL sequences..."
    );


    for (
      const table
      of tables
    ) {

      await resetSequence(
        client,
        table
      );

    }


    /*
    |--------------------------------------------------------------------------
    | Commit
    |--------------------------------------------------------------------------
    */

    await client.query(
      "COMMIT"
    );


    console.log(
      "\n========================================"
    );


    console.log(
      "🎉 MIGRATION COMPLETED SUCCESSFULLY!"
    );


    console.log(
      "========================================"
    );

  }
  catch (error) {

    /*
    |--------------------------------------------------------------------------
    | Rollback
    |--------------------------------------------------------------------------
    */

    if (client) {

      try {

        await client.query(
          "ROLLBACK"
        );

        console.log(
          "↩️ PostgreSQL transaction rolled back."
        );

      }
      catch (rollbackError) {

        console.error(
          "❌ Rollback failed:",
          rollbackError
        );

      }

    }


    console.error(
      "\n❌ MIGRATION FAILED"
    );


    console.error(
      error
    );


    process.exitCode = 1;

  }
  finally {

    /*
    |--------------------------------------------------------------------------
    | Release PostgreSQL client
    |--------------------------------------------------------------------------
    */

    if (client) {

      client.release();

    }


    /*
    |--------------------------------------------------------------------------
    | Close PostgreSQL pool
    |--------------------------------------------------------------------------
    */

    await pool.end();


    /*
    |--------------------------------------------------------------------------
    | Close SQLite
    |--------------------------------------------------------------------------
    */

    sqlite.close();

  }

}


/*
|--------------------------------------------------------------------------
| Start Migration
|--------------------------------------------------------------------------
*/

migrate();