const express = require("express");

const db = require("../db");
const router = new express.Router();

const { NotFoundError, BadRequestError } = require("../expressError");

/** GET /users: get list of companies*/
router.get("/", async function (req, res, next) {

    const results = await db.query(
        `SELECT code, name from companies`
    );
    const companies = results.rows;
    return res.json({companies: companies});
});

router.post("/", async function (req, res, next) {
    const {code, name, description } = req.body;

    const results = await db.query(
        `INSERT INTO companies (code, name, description)
            values ($1, $2, $3)
            RETURNING code, name, description`, [code, name, description]
    )
    const company = results.rows[0];
    if (!company) {
        //throw 400 error instead
        return next(new NotFoundError())
    }

    return res.json({company});
});


router.get("/:code", async function (req, res, next) {

    const results = await db.query(
        `SELECT code, name, description, i.id FROM companies as c
        JOIN invoices AS i ON c.code = i.comp_code
         WHERE code = $1`, [req.params.code]
    );

    const companyResults = results.rows;
    console.log(companyResults)
    //ASK ABOUT THIS
    if (companyResults.length === 0) {
        return next(new BadRequestError())
    }
    let invoices = [];
    companyResults.forEach(c => {
        invoices.push(c.id)
    })
    const {code, name, description} = companyResults[0]
    
    return res.json({company: {code, name, description, invoices: invoices}});
  });

router.put("/:code", async function (req, res, next) {
    const {name, description } = req.body;

    const result = await db.query(
        `UPDATE companies
        SET name = $1,
        description = $2
        WHERE code = $3
        RETURNING code, name, description
        `, [name, description, req.params.code]
    )
    const updatedComp = result.rows[0]
    if (!updatedComp) {
        return next(new NotFoundError())
    }
    return res.json({company: updatedComp});
});

router.delete("/:code", async function (req, res, next) {

    const result = await db.query(
        `DELETE FROM companies
        WHERE code = $1`, [req.params.code]
    )
    console.log(result)
    if (result.rowCount == 0) {
        return next(new NotFoundError())
    }

    return res.json({ status: "Deleted" });
});

module.exports = router;