-- 1. Топ-5 категорий по количеству компаний

SELECT
    category,
    COUNT(*) AS company_count
FROM companies
GROUP BY category
ORDER BY company_count DESC
LIMIT 5;


-- 2. Средний рейтинг по городам среди компаний с 10+ отзывами

SELECT
    city,
    ROUND(AVG(rating), 2) AS average_rating
FROM companies
WHERE reviews_count >= 10
  AND rating IS NOT NULL
GROUP BY city
ORDER BY average_rating DESC;


-- 3. Доля компаний с сайтом по категориям

SELECT
    category,
    ROUND(
        COUNT(site) * 100.0 / COUNT(*),
        2
    ) AS website_percent
FROM companies
GROUP BY category
ORDER BY website_percent DESC;