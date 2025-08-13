const ExcelJS = require("exceljs");

const exportToExcel = async (req, res, next) => {
  try {
    const { data, fileName, sheetName } = res.locals.exportData;

    if (!data || !Array.isArray(data) || data.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No data provided for export",
      });
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(sheetName || "Sheet1");

    // ✅ Define only required columns in correct order
    worksheet.columns = [
      { header: "Date", key: "date", width: 15 },
      { header: "Category", key: "category", width: 20 },
      { header: "Item", key: "item", width: 25 },
      { header: "Amount", key: "amount", width: 15 },
      { header: "GST", key: "gst", width: 10 },
      { header: "Payment Mode", key: "paymentMode", width: 20 },
    ];

    // ✅ Add only relevant keys from each row
    data.forEach((item) => {       
        
      worksheet.addRow({
        date: item.Date || item.date || "",
        category: item.Category || item.category || "",
        item: item.Item || item.item || "",
        amount: item.Amount || item.amount || "",
        gst: item.GST || item.gst || "",
        paymentMode: item["PaymentMode"] || item.PaymentMode || "",
      });
    });

    // Set headers for file download
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=${fileName || "data"}.xlsx`
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error("Export error:", error);
    res.status(500).json({
      success: false,
      message: "Error exporting data",
      error: error.message,
    });
  }
};

module.exports = exportToExcel;
