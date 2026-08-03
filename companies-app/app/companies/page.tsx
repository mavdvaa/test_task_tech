import { db } from "@/db";

interface Props {
  searchParams: Promise<{
    search?: string;
    city?: string;
  }>;
}

const thStyle = {
  padding: "12px",
  textAlign: "left" as const,
  backgroundColor: "#f5f5f5",
  borderBottom: "2px solid #ddd",
};

const tdStyle = {
  padding: "10px",
  borderBottom: "1px solid #eee",
};

export default async function CompaniesPage({ searchParams }: Props) {
  const { search = "", city = "" } = await searchParams;

  const result = await db.query(
    `
    SELECT
      id,
      name,
      category,
      city,
      rating
    FROM companies
    WHERE
      ($1 = '' OR name ILIKE '%' || $1 || '%')
      AND
      ($2 = '' OR city ILIKE '%' || $2 || '%')
    ORDER BY name;
    `,
    [search, city]
  );

  const companies = result.rows;

  return (
    <main
      style={{
        maxWidth: "1200px",
        margin: "40px auto",
        padding: "0 20px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h1 style={{ marginBottom: "20px" }}>Компании</h1>

      <form
        style={{
          display: "flex",
          gap: "12px",
          flexWrap: "wrap",
          marginBottom: "20px",
          alignItems: "center",
        }}
      >
        <input
          type="text"
          name="search"
          placeholder="Поиск по названию"
          defaultValue={search}
          style={{
            padding: "10px",
            width: "280px",
            border: "1px solid #ccc",
            borderRadius: "6px",
          }}
        />

        <input
          type="text"
          name="city"
          placeholder="Город"
          defaultValue={city}
          style={{
            padding: "10px",
            width: "180px",
            border: "1px solid #ccc",
            borderRadius: "6px",
          }}
        />

        <button
          type="submit"
          style={{
            padding: "10px 18px",
            border: "none",
            borderRadius: "6px",
            backgroundColor: "#0070f3",
            color: "#fff",
            cursor: "pointer",
          }}
        >
          Найти
        </button>
      </form>

      <p style={{ marginBottom: "15px", color: "#555" }}>
        Найдено компаний: <strong>{companies.length}</strong>
      </p>

      <div style={{ overflowX: "auto" }}>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            backgroundColor: "#fff",
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          }}
        >
          <thead>
            <tr>
              <th style={thStyle}>Название</th>
              <th style={thStyle}>Категория</th>
              <th style={thStyle}>Город</th>
              <th style={thStyle}>Рейтинг</th>
            </tr>
          </thead>

          <tbody>
            {companies.map((company) => (
              <tr key={company.id}>
                <td style={tdStyle}>{company.name}</td>
                <td style={tdStyle}>{company.category}</td>
                <td style={tdStyle}>{company.city}</td>
                <td style={tdStyle}>
                  {company.rating ? `${company.rating}` : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}