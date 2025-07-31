const XLSX = require("xlsx");
const path = require("path");
const fs = require("fs");
const models = require("../utils/schemaMap");

module.exports = async function excelParser(req, res, next) {
  try {
    const schemaName = req.body.schema;
    const Model = models[schemaName];

    if (!Model) {
      return res.status(400).json({ error: "Invalid schema name" });
    }

    const filePath = path.join(__dirname, "..", req.file.path);
    const fileExt = path.extname(req.file.originalname).toLowerCase();

    const allowedExtensions = [".xlsx", ".csv"];
    if (!allowedExtensions.includes(fileExt)) {
      fs.unlinkSync(filePath); // cleanup
      return res.status(400).json({ error: "Only .csv and .xlsx files are allowed" });
    }

    const workbook = XLSX.readFile(filePath, { raw: true });
    const sheetName = workbook.SheetNames[0];
    const jsonData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

    fs.unlinkSync(filePath); // remove temp file

    if (jsonData.length === 0) {
      return res.status(400).json({ error: "Excel/CSV file is empty" });
    }

    const store_id = req.body.store_id;
    const storeProfile_id = req.body.storeProfile_id;

    const enrichedData = jsonData.map(row => ({
      ...row,
      store_id,
      storeProfile_id,
    }));

    req.Model = Model;
    req.excelData = enrichedData;
    next();
  } catch (error) {
    console.error("Excel Parse Error:", error);
    return res.status(500).json({ error: "Failed to parse Excel/CSV file" });
  }
};
