// Create a utility function for exporting data to CSV
import csv from "fast-csv";
import fs from "fs";
import { ROOT_PATH } from "../server.js";
import { BASE_URL } from "../config/index.js";

function exportToCSV(data, columns, fileName, res) {
  const filePath = `${ROOT_PATH}/public/files/export/${fileName}`;
  const csvStream = csv.format({ headers: true });
  const writablestream = fs.createWriteStream(filePath);
  csvStream.pipe(writablestream);

  writablestream.on("finish", function () {
    res.json({
      downloadUrl: `${BASE_URL}/public/files/export/${fileName}`,
    });
  });

  if (data.length > 0) {
    data.forEach((item, index) => {
      const csvData = {};
      csvData["SNo."] = index + 1;
      columns.forEach((column) => {
        // Use the column key to map to the corresponding data property
        csvData[column.header] = item[column.key];
      });
      csvStream.write(csvData);
    });
  }

  csvStream.end();
  writablestream.end();
}

export default exportToCSV;
