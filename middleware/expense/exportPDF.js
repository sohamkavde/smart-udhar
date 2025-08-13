const PDFDocument = require("pdfkit-table");

const exportToPDF = async (req, res, next) => {
  try {
    const { data, fileName } = res.locals.exportData;

    if (!data || !Array.isArray(data) || data.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No data provided for export",
      });
    }

    const doc = new PDFDocument({ margin: 30, size: "A4" });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=${fileName || "data"}.pdf`
    );

    doc.pipe(res);

    // Title
    doc.fontSize(18).fillColor("#000000").text(fileName || "Exported Data", {
      align: "center",
    });
    doc.moveDown(1);

    // Prepare table data
    const table = {
      headers: [
        { label: "Date", property: "date", width: 80 },
        { label: "Category", property: "category", width: 100 },
        { label: "Item", property: "item", width: 120 },
        { label: "Amount", property: "amount", width: 80 },
        { label: "GST", property: "gst", width: 60 },
        { label: "Payment Mode", property: "paymentMode", width: 100 },
      ],
      datas: data.map((item) => ({
        date: item.Date || item.date || "",
        category: item.Category || item.category || "",
        item: item.Item || item.item || "",
        amount: item.Amount || item.amount || "",
        gst: item.GST || item.gst || "",
        paymentMode: item.PaymentMode || item.paymentMode || "",
      })),
    };

    // Draw table with style (black text only)
    await doc.table(table, {
      prepareHeader: () => doc.font("Helvetica-Bold").fontSize(12).fillColor("#000000"),
      prepareRow: () => {
        doc.font("Helvetica").fontSize(10).fillColor("#000000");
      },
      columnsSize: [80, 100, 120, 80, 60, 100],
      padding: 5,
      headerBackground: "#FFFFFF", // White background for header
    });

    doc.end();
  } catch (error) {
    console.error("Export PDF error:", error);
    res.status(500).json({
      success: false,
      message: "Error exporting PDF",
      error: error.message,
    });
  }
};

module.exports = exportToPDF;
