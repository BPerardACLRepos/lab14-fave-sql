const client = require('../lib/client');
// import our seed data:
const favorites = require('./favorites.js');
const usersData = require('./users.js');
const { getEmoji } = require('../lib/emoji.js');

run();

async function run() {

  try {
    await client.connect();

    await Promise.all(
      usersData.map(user => {
        return client.query(`
                      INSERT INTO users (email, hash)
                      VALUES ($1, $2)
                      RETURNING *;
                  `,
          [user.email, user.hash]);
      })
    );

    await Promise.all(
      favorites.map(favorite => {
        return client.query(`
                    INSERT INTO favorites (fact_api_id, fact, pic_url, owner_id)
                    VALUES ($1, $2, $3, $4);
                `,
          [favorite.fact_api_id, favorite.fact, favorite.pic_url, favorite.owner_id]);
      })
    );


    console.log('seed data load complete', getEmoji(), getEmoji(), getEmoji());
  }
  catch (err) {
    console.log(err);
  }
  finally {
    client.end();
  }

}
