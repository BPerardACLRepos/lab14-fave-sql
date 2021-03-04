require('dotenv').config();

const { execSync } = require('child_process');

const fakeRequest = require('supertest');
const app = require('../lib/app');
const client = require('../lib/client');

describe('app routes', () => {
  describe('routes', () => {
    let token;

    beforeAll(async done => {
      execSync('npm run setup-db');

      client.connect();

      const signInData = await fakeRequest(app)
        .post('/auth/signup')
        .send({
          email: 'jon@user.com',
          password: '1234'
        });

      token = signInData.body.token; // eslint-disable-line

      return done();
    });

    afterAll(done => {
      return client.end(done);
    });

    test('returns object with id, email, and token on sign up and sign in', async () => {

      const signUpResponse = await fakeRequest(app)
        .post('/auth/signup')
        .send({
          email: 'fancyfe@st.com',
          password: 'cats'
        });

      const expectation = {
        id: 3,
        email: 'fancyfe@st.com',
        token: signUpResponse.body.token,
      }

      expect(signUpResponse.body).toEqual(expectation);

      const signInResponse = await fakeRequest(app)
        .post('/auth/signin')
        .send({
          email: 'fancyfe@st.com',
          password: 'cats'
        });

      const expectationSignIn = {
        id: 3,
        email: 'fancyfe@st.com',
        token: signInResponse.body.token,
      }

      expect(signInResponse.body).toEqual(expectationSignIn);
    });

    test('posts new cat fact object and returns array containing it', async () => {

      const fact = {
        fact_api_id: "caturday",
        fact: "Cats lost the ability to fart when they tricked a genie into giving them nine lives.",
        pic_url: "gassycat.jpg",
      };

      const expectation = [
        {
          ...fact,
          id: 5,
          owner_id: 2,
        }
      ];
      const response = await fakeRequest(app)
        .post('/api/favorites')
        .set('Authorization', token)
        .send(fact)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toEqual(expectation);
    });

    test('returns an array of user favorites objects', async () => {

      const expectation = [
        {
          fact_api_id: "caturday",
          fact: "Cats lost the ability to fart when they tricked a genie into giving them nine lives.",
          pic_url: "gassycat.jpg",
          id: 5,
          owner_id: 2,
        }
      ];

      const response = await fakeRequest(app)
        .get('/api/favorites')
        .set('Authorization', token)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toEqual(expectation);
    });

    test('deletes favorite with :id and responds with the object', async () => {

      const expectation = [
        {
          fact_api_id: "caturday",
          fact: "Cats lost the ability to fart when they tricked a genie into giving them nine lives.",
          pic_url: "gassycat.jpg",
          id: 5,
          owner_id: 2,
        }
      ];

      const response = await fakeRequest(app)
        .delete('/api/favorites/5')
        .set('Authorization', token)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toEqual(expectation);

      const expectationBlank = [];

      const data = await fakeRequest(app)
        .get('/api/favorites')
        .set('Authorization', token)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(expectationBlank);
    });

  });
});
