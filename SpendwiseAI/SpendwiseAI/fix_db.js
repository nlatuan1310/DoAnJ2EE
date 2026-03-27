const { Client } = require('pg');

async function fix() {
  const client = new Client({
    connectionString: "postgres://neondb_owner:npg_J9jBKen3LdYa@ep-summer-base-a1afj85t-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"
  });

  try {
    await client.connect();
    console.log("Connected to Neon DB!");
    
    let res1 = await client.query("UPDATE danh_muc SET loai = 'chi' WHERE loai = 'expense'");
    console.log(`Updated ${res1.rowCount} categories from 'expense' to 'chi'.`);
    
    let res2 = await client.query("UPDATE danh_muc SET loai = 'thu' WHERE loai = 'income'");
    console.log(`Updated ${res2.rowCount} categories from 'income' to 'thu'.`);
    
  } catch(e) {
    console.error(e);
  } finally {
    await client.end();
  }
}

fix();
