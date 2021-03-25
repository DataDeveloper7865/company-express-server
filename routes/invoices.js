const express = require("express");

const db = require("../db");
const router = new express.Router();

const { NotFoundError, BadRequestError } = require("../expressError");

router.get("/", async function (req, res, next) {

    const results = await db.query(
        `SELECT id, comp_code from invoices`
    );
    const invoices = results.rows;
    return res.json({invoices});
});

router.post("/", async function (req, res, next) {
    const { comp_code, amt } = req.body;

    const results = await db.query(
        `INSERT INTO invoices (comp_code, amt)
            values ($1, $2)
            RETURNING id, comp_code, amt, paid, add_date, paid_date`, [comp_code, amt]
    )
    const invoice = results.rows[0];
    console.log(results)
    if (!invoice) {
        //ASK WHY THIS GOES TO 404
        return next(new BadRequestError())
    }

    return res.json({invoice});
});


router.get("/:id", async function (req, res, next) {

    const results = await db.query(
        `SELECT
            i.id, i.amt, i.paid, i.add_date, i.paid_date, c.code, c.name, c.description
        FROM invoices AS i
        JOIN companies AS c on c.code = i.comp_code
         WHERE i.id = $1`, [req.params.id]
    );
    const invoiceData = results.rows[0];
    if (!invoiceData) {
      //throw 400 error instead
      return next(new BadRequestError())
  }
    const {id, amt, paid, add_date, paid_date, code, name, description } = invoiceData;
    
    return res.json({invoice: {id, amt, paid, add_date, paid_date, company: {code, name, description}}});
  });

router.put("/:id", async function (req, res, next) {
    const { amt } = req.body;

    const result = await db.query(
        `UPDATE invoices
        SET amt = $1
        WHERE id = $2
        RETURNING id, comp_code, amt, paid, add_date, paid_date
        `, [amt, req.params.id]
    )
    const invoice = result.rows[0]
    if (!invoice) {
        return next(new NotFoundError())
    }
    return res.json({invoice});
});

router.delete("/:id", async function (req, res, next) {

    const result = await db.query(
        `DELETE FROM invoices
          WHERE id = $1`, [req.params.id]
    )
    if (result.rowCount == 0) {
        return next(new NotFoundError())
    }

    return res.json({ status: "Deleted" });
});

module.exports = router;