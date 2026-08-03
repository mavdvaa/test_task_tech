import "dotenv/config";

import fs from "fs";
import csv from "csv-parser";
import { client } from "./db.js";

async function main() {

    await client.connect();

    await client.query("TRUNCATE TABLE review_import");

    const rows: any[] = [];

    await new Promise<void>((resolve, reject) => {
        fs.createReadStream("./data/review.csv")
            .pipe(csv())
            .on("data", (row) => rows.push(row))
            .on("end", resolve)
            .on("error", reject);
    });

    for (const row of rows) {
        await client.query(
            `
      INSERT INTO review_import (
        id,
        name,
        category,
        city,
        address,
        rating,
        reviews_count,
        site,
        phone
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
      `,
            [
                row.id,
                row.name,
                row.category,
                row.city,
                row.address,
                row.rating,
                row.reviews_count,
                row.site,
                row.phone,
            ]
        );
    }

    console.log(`Imported ${rows.length} rows\n`);

    // --------------------------
    // Компании, которых нет в основной базе
    // --------------------------

    const missingCount = await client.query(`
    SELECT COUNT(*) AS count
    FROM review_import r
    LEFT JOIN companies c
      ON r.id = c.id
    WHERE c.id IS NULL
  `);

    console.log(
        `Companies missing in main database: ${missingCount.rows[0].count}`
    );

    const missingExamples = await client.query(`
    SELECT r.id
    FROM review_import r
    LEFT JOIN companies c
      ON r.id = c.id
    WHERE c.id IS NULL
    LIMIT 5
  `);

    console.table(missingExamples.rows);

    // --------------------------
    // Некорректный рейтинг
    // --------------------------

    const invalidRatings = await client.query(`
SELECT id, rating
FROM review_import
WHERE rating <> ''
  AND rating !~ '^[0-5](\\.[0-9]+)?$';
`);

    console.log(`Invalid ratings: ${invalidRatings.rowCount}`);

    console.table(invalidRatings.rows);

    // --------------------------
    // Некорректный телефон
    // --------------------------

    const invalidPhones = await client.query(`
    SELECT id, phone
FROM review_import
WHERE phone IS NOT NULL
  AND phone <> ''
  AND phone !~ '^\\+7 \\([0-9]{3}\\) [0-9]{3}-[0-9]{2}-[0-9]{2}$';
  `);

    console.log(`Invalid phones: ${invalidPhones.rowCount}`);

    console.table(invalidPhones.rows);

    // --------------------------
    // Опечатка в городе
    // --------------------------

    const unknownCities = await client.query(`
  SELECT r.id, r.city
FROM review_import r
LEFT JOIN (
    SELECT DISTINCT city
    FROM companies
) c
ON r.city = c.city
WHERE c.city IS NULL;
`);

    console.log("Unknown cities:");
    console.table(unknownCities.rows);

    // --------------------------
    // Пустой сайт
    // --------------------------

    const emptySites = await client.query(`
    SELECT COUNT(*) AS count
    FROM review_import
    WHERE site IS NULL
       OR site = ''
  `);

    console.log(`Rows without site: ${emptySites.rows[0].count}`);

    // --------------------------
    // Пустой телефон
    // --------------------------

    const emptyPhones = await client.query(`
    SELECT COUNT(*) AS count
    FROM review_import
    WHERE phone IS NULL
       OR phone = ''
  `);

    console.log(`Rows without phone: ${emptyPhones.rows[0].count}`);

    // --------------------------
    // Пустой рейтинг
    // --------------------------

    const emptyRatings = await client.query(`
    SELECT COUNT(*) AS count
    FROM review_import
    WHERE rating IS NULL
       OR rating = ''
  `);

    console.log(`Rows without rating: ${emptyRatings.rows[0].count}`);

    await client.end();
}

main().catch(async (err) => {
    console.error(err);
    await client.end();
});