const { Client } = require('pg');
const client = new Client({
  connectionString: 'postgresql://postgres.douqqlwazrbnvnzpngmt:%^7Localman35yRYU@aws-1-eu-west-1.pooler.supabase.com:5432/postgres'
});
client.connect()
  .then(() => {
    console.log('Connected to direct url successfully');
    return client.query('SELECT NOW()');
  })
  .then(res => {
    console.log(res.rows);
    client.end();
  })
  .catch(err => {
    console.error('Connection error', err.stack);
    client.end();
  });

const client2 = new Client({
  connectionString: 'postgresql://postgres.douqqlwazrbnvnzpngmt:%^7Localman35yRYU@aws-1-eu-west-1.pooler.supabase.com:6543/postgres'
});
client2.connect()
  .then(() => {
    console.log('Connected to pooler url successfully');
    return client2.query('SELECT NOW()');
  })
  .then(res => {
    console.log(res.rows);
    client2.end();
  })
  .catch(err => {
    console.error('Connection error', err.stack);
    client2.end();
  });
