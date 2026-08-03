import { readdir, readFile } from "fs/promises";
import { client } from "./db.js";

interface Company {
  id: string;
  name: string;
  category: string;
  city: string;
  address: string;
  rating: number | null;
  reviews_count: number;
  site: string | null;
  phone: string | null;
}

interface Page {
  page: number;
  per_page: number;
  total: number;
  items: Company[];
}

async function main() {
  await client.connect();

  const files = (await readdir("./data"))
    .filter((file) => file.endsWith(".json"))
    .sort();

  let inserted = 0;

  for (const file of files) {
    console.log(`Loading ${file}...`);

    const content = await readFile(`./data/${file}`, "utf8");
    const page: Page = JSON.parse(content);

    console.log(`Companies in file: ${page.items.length}`);

    for (const company of page.items) {
      try {
        const result = await client.query(
          `
          INSERT INTO companies (
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
          ON CONFLICT (id) DO NOTHING;
          `,
          [
            company.id,
            company.name,
            company.category,
            company.city,
            company.address,
            company.rating,
            company.reviews_count,
            company.site,
            company.phone,
          ]
        );

        if (result.rowCount === 1) {
          inserted++;
        }
      } catch (err) {
        console.error(`Ошибка при вставке ${company.id}:`, err);
      }
    }
  }

  console.log(`Inserted ${inserted} companies`);

  await client.end();
}

main().catch(async (err) => {
  console.error(err);
  await client.end();
});