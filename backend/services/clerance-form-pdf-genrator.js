import { ROOT_PATH } from "../server.js";
import PDFDocument from "pdfkit";
import fs from "fs";

// move elements down
function jumpLine(doc, lines) {
  for (let index = 0; index < lines; index++) {
    doc.moveDown();
  }
}

async function generateClearanceForm(data, fileName) {
  const doc = new PDFDocument({
    layout: "landscape",
    size: "A4",
  });
  doc.pipe(fs.createWriteStream(`${ROOT_PATH}/documents/${fileName}`));
  /* ################### ADD MARGIN IN PAGES ##################### */
  const distanceMargin = 10;
  doc
    .fillAndStroke("#4cceac")
    .lineWidth(10)
    .lineJoin("round")
    .rect(
      distanceMargin,
      distanceMargin,
      doc.page.width - distanceMargin * 2,
      doc.page.height - distanceMargin * 2
    )
    .stroke();
  /* ################### LOGO ##################### */
  const maxWidth = 140;
  const maxHeight = 70;
  doc.image(
    `${ROOT_PATH}/public/images/logo.png`,
    doc.page.width / 2 - maxWidth / 2,
    60,
    {
      fit: [maxWidth, maxHeight],
      align: "center",
    }
  );
  jumpLine(doc, 5);

  /* ################### TEXT ##################### */
  doc.fontSize(10).fill("#021c27").text("Govt. Graduate College, Jhelum", {
    align: "center",
  });
  jumpLine(doc, 1);

  doc.fontSize(20).text("STUDENT CLEARANCE FORM", {
    align: "center",
  });
  jumpLine(doc, 1);

  doc.fontSize(10).fill("#021c27").text(`CLEARANCE REQUEST ID : ${data?._id}`, {
    align: "center",
  });

  jumpLine(doc, 1);

  doc
    .fontSize(10)
    .text(
      `This is to certify that ${data?.studentName} (${data?.studentRollNumber}) has successfully met all academic and administrative requirements at Govt.Graduate College, Jhelum. The requested clearance for Graduation has been approved by Librarian, HOD and Clerk.`,
      {
        align: "center",
      }
    );

  /* SIGNATURES */
  const lineSize = 174;
  const signatureHeight = 390;

  doc.fillAndStroke("#021c27");
  doc.strokeOpacity(0.2);

  const startLine1 = 128;
  const endLine1 = 128 + lineSize;
  doc
    .moveTo(startLine1, signatureHeight)
    .lineTo(endLine1, signatureHeight)
    .stroke();

  const startLine2 = endLine1 + 32;
  const endLine2 = startLine2 + lineSize;
  doc
    .moveTo(startLine2, signatureHeight)
    .lineTo(endLine2, signatureHeight)
    .stroke();

  const startLine3 = endLine2 + 32;
  const endLine3 = startLine3 + lineSize;
  doc
    .moveTo(startLine3, signatureHeight)
    .lineTo(endLine3, signatureHeight)
    .stroke();

  doc
    .fontSize(10)
    .fill("#021c27")
    .text("John Doe", startLine1, signatureHeight + 10, {
      columns: 1,
      columnGap: 0,
      height: 40,
      width: lineSize,
      align: "center",
    });

  doc
    .fontSize(10)
    .fill("#021c27")
    .text("Associate Professor", startLine1, signatureHeight + 25, {
      columns: 1,
      columnGap: 0,
      height: 40,
      width: lineSize,
      align: "center",
    });

  doc
    .fontSize(10)
    .fill("#021c27")
    .text("Student Name", startLine2, signatureHeight + 10, {
      columns: 1,
      columnGap: 0,
      height: 40,
      width: lineSize,
      align: "center",
    });

  doc
    .fontSize(10)
    .fill("#021c27")
    .text("Student", startLine2, signatureHeight + 25, {
      columns: 1,
      columnGap: 0,
      height: 40,
      width: lineSize,
      align: "center",
    });

  doc
    .fontSize(10)
    .fill("#021c27")
    .text("Jane Doe", startLine3, signatureHeight + 10, {
      columns: 1,
      columnGap: 0,
      height: 40,
      width: lineSize,
      align: "center",
    });

  doc
    .fontSize(10)
    .fill("#021c27")
    .text("Director", startLine3, signatureHeight + 25, {
      columns: 1,
      columnGap: 0,
      height: 40,
      width: lineSize,
      align: "center",
    });

  // End and save the PDF
  doc.end();
}

// Usage example:
// Define the data and specify the output path for the generated PDF

export default generateClearanceForm;
