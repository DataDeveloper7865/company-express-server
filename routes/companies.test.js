// npm packages
const request = require("supertest");

// app imports
const app = require("../app");
const db = require("../db");

let testCompany;

beforeEach(async function () {
  await db.query("DELETE FROM companies");
  let result = await db.query(`
    INSERT INTO companies (code, name, description)
    VALUES ('Google', 'Google', 'internet comp')
    RETURNING code, name, description`);
  testCompany = result.rows[0];
});


/** GET /cats - returns `{cats: [cat, ...]}` */

describe("GET /company", function () {
  test("Gets a list of companies", async function () {
    const resp = await request(app).get(`/companies`);
    console.log(resp.body);
    expect(resp.body.companies[0].code).toEqual(
      'Google'
    );
  });
});
// end


/** GET /cats/[id] - return data about one cat: `{cat: cat}` */

describe("GET /comapny/:code", function () {
  test("Gets a company", async function () {
    const resp = await request(app).get(`/companies/${testCompany.code}`);
    console.log(resp.body);
    expect(resp.body.companies).toEqual( testCompany.description );
  });

//   test("Respond with 404 if not found", async function () {
//     const resp = await request(app).get(`/cats/0`);
//     expect(resp.statusCode).toEqual(404);
//   });
});
// end


// /** POST /cats - create cat from data; return `{cat: cat}` */

// describe("POST /cats", function () {
//   test("Create new cat", async function () {
//     const resp = await request(app)
//         .post(`/cats`)
//         .send({ name: "Ezra" });
//     expect(resp.statusCode).toEqual(201);
//     expect(resp.body).toEqual({
//       cat: { id: expect.any(Number), name: "Ezra" },
//     });
//   });
// });
// // end


// /** PATCH /cats/[id] - update cat; return `{cat: cat}` */

// describe("PATCH /cats/:id", function () {
//   test("Update a single cat", async function () {
//     const resp = await request(app)
//         .patch(`/cats/${testCat.id}`)
//         .send({ name: "Troll" });
//     expect(resp.statusCode).toEqual(200);
//     expect(resp.body).toEqual({
//       cat: { id: testCat.id, name: "Troll" },
//     });
//   });

//   test("Respond with 404 if nout found", async function () {
//     const resp = await request(app).patch(`/cats/0`);
//     expect(resp.statusCode).toEqual(404);
//   });
// });
// // end


// /** DELETE /cats/[id] - delete cat,
//  *  return `{message: "Cat deleted"}` */

// describe("DELETE /cats/:id", function () {
//   test("Delete single a cat", async function () {
//     const resp = await request(app)
//         .delete(`/cats/${testCat.id}`);
//     expect(resp.statusCode).toEqual(200);
//     expect(resp.body).toEqual({ message: "Cat deleted" });
//   });
// });
// end


afterAll(async function () {
  // close db connection --- if you forget this, Jest will hang
  await db.end();
});
