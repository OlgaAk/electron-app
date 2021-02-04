const electon = require("electron");
const { ipcRenderer } = electon;

const { PDFDocument, StandardFonts, rgb } = require("pdf-lib");
const fs = require("fs");
const ExcelJS = require("exceljs");

const SOURCE_PDF_PATH = "./1.pdf"; //get path from user
const OUTPUT_PDF_PATH = "./test.pdf"; //get path from user
const SOURCE_EXCEL_PATH = "22.xlsx"; //get path from user
const TEXT_COLOR = rgb(0.41, 0.48, 0.74); //make user define
const TEXT_SIZE = 15; //make user define
const COLUMN = "D"; // make user define
const START_ROW = 10; //make user define

const pdfFileNameText = document.getElementById("pdfFileName");
pdfFileNameText.innerHTML = SOURCE_PDF_PATH;

const addButton = document.getElementById("addToPDF");
addButton.addEventListener("click", openAlert);

function openAlert(event) {
  console.log(event);
  ipcRenderer.send("openAlert", "test msg");
}

//addExcelDataToPdf().catch((err) => console.log(err));

async function addExcelDataToPdf() {
  readExcel()
    .then((data) => {
      if (data) {
        writeToPdf(data);
      } else {
        console.log("no data from excel");
      }
    })
    .catch((err) => console.log(err));
}

async function writeToPdf(excelData) {
  // Create a new document and add a new page
  try {
    const [doc, font, pages] = await setUpPDF();
    checkInputData(excelData, pages);
    pages.forEach((page, index) => {
      // checking to avoid out of index exception
      if (excelData.length > index) {
        drawTextOnPdf(page, index, excelData, font, TEXT_SIZE, TEXT_COLOR);
      }
    });
    fs.writeFileSync(OUTPUT_PDF_PATH, await doc.save());
  } catch (err) {
    if (err.code == "ENOENT") {
      console.log("Error opening PDF file. Please try another file.");
    }
  }
}

async function readExcel() {
  const sheet = await loadExcelSheet();
  try {
    const cellValues = getCellValues(sheet, START_ROW, COLUMN);
    return cellValues;
  } catch (err) {}
}

function drawTextOnPdf(page, index, data, font, size, color) {
  page.drawText(`B#${index + 1} ${data[index]}`, {
    x: 15,
    y: page.getHeight() - 25,
    size: size,
    font: font,
    color: color,
  });
}

function checkInputData(excelData, pages) {
  if (excelData.length > pages.length) {
    console.log(
      `You have more data in excel than pdf pages (${
        excelData.length - pages.length
      } cell(s)). This information will be missing.`
    );
  } else if (excelData.length < pages.length) {
    console.log(`Excell data provided is not sufficient for all PDF pages. 
  ${pages.length - excelData.length} page(s) remaind untouched.`);
  }
}

async function loadExcelSheet() {
  const workbook = new ExcelJS.Workbook();
  try {
    await workbook.xlsx.readFile(SOURCE_EXCEL_PATH);
    return (sheet = workbook.worksheets[0]); // make user define
  } catch (err) {
    if (err.message.includes("File not found")) {
      console.log("Error opening EXCEL file. Please try another file.");
    }
  }
}

function getCellValues(sheet, startRow, column) {
  let excelValues = [];
  while (true) {
    let cell = sheet.getCell(`${column}${startRow}`);
    if (cell.value == "" || cell.value == "Total:") break; // make user define
    excelValues.push(cell.value);
    startRow++;
  }
  return excelValues;
}

async function setUpPDF() {
  const doc = await PDFDocument.load(fs.readFileSync(SOURCE_PDF_PATH));
  const font = await doc.embedFont(StandardFonts.CourierOblique);
  const pages = await doc.getPages();
  return [doc, font, pages];
}
