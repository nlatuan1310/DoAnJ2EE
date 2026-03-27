const { Client } = require('pg');

async function check() {
  const client = new Client({
    connectionString: "postgres://neondb_owner:npg_J9jBKen3LdYa@ep-summer-base-a1afj85t-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"
  });

  try {
    await client.connect();
    let res = await client.query("SELECT loai, count(*) FROM danh_muc GROUP BY loai");
    console.log("Category counts by type:", res.rows);
  } catch(e) {
    console.error(e);
  } finally {
    await client.end();
  }
}

check();
