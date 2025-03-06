import express from "express";
import fs from "fs";
import path from "path";
import hbs from "handlebars";
import puppeteer from "puppeteer";

const router = express.Router();

router.post("/generate", async (req: any, res: any) => {
  try {
    const requestData = req.body;
    // console.log("Request Data:", requestData);

    if (!requestData || !Array.isArray(requestData) || requestData.length === 0) {
      return res.status(400).send("Invalid data provided. Expected an array of objects.");
    }

    const pdf = await generatePdf(requestData);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=generated.pdf");
    res.status(200).end(pdf);

  } catch (error) {
    console.error("Error in PDF generation route:", error);

    if (!res.headersSent) {
      res.status(500).send((error as Error).message || "Internal Server Error");
    }
  }
});

async function generatePdf(data: any[]) {
  try {
    const templateData = { pdfData: data };

    // Load and compile Handlebars template
    const templatePath = path.join(process.cwd(), "src/template", "demoPdf.html");
    const templateContent = await fs.promises.readFile(templatePath, "utf8");

    const template = hbs.compile(templateContent);
    const finalHtml = template(templateData);

    if (!finalHtml) {
      throw new Error("Failed to compile HTML from template");
    }

    // console.log("Generated HTML:", finalHtml);

    // Launch Puppeteer
    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
      executablePath: puppeteer.executablePath(),
      dumpio: true, // Enable browser logs for debugging
    });

    const page = await browser.newPage();

    // Capture console messages from the page
    page.on("console", (msg) => console.log("PAGE LOG:", msg.text()));

    // Set HTML content
    await page.setContent(finalHtml, { waitUntil: "networkidle2" }).catch((e) => {
      console.error("Error setting page content:", e);
      throw new Error("Failed to load HTML content into Puppeteer");
    });

    // Wait for rendering stability using a simple delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Generate PDF
    const pdfResponse = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: 10, bottom: 10, left: 10, right: 10 },
    });

    await browser.close();
    return pdfResponse;

  } catch (error) {
    console.error("Error generating PDF:", error);
    throw new Error("Failed to generate PDF");
  }
}

export default router;
