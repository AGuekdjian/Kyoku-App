import ExcelJS from "exceljs";
import { APP_NAME } from "@/lib/brand";
export type ExportRegistration = {
  snapshot: {
    fullName: string;
    birthDate: Date;
    age: number;
    weight?: number;
    height?: number;
    gradeName: string;
  };
};
export async function tournamentWorkbook(input: {
  dojoName: string;
  tournamentName: string;
  date: Date;
  registrations: ExportRegistration[];
}) {
  const book = new ExcelJS.Workbook();
  book.creator = APP_NAME;
  const sheet = book.addWorksheet("Inscripciones", {
    pageSetup: {
      orientation: "landscape",
      fitToPage: true,
      fitToWidth: 1,
      fitToHeight: 0,
      paperSize: 9,
    },
  });
  sheet.mergeCells("A1:G1");
  sheet.getCell("A1").value = input.dojoName;
  sheet.getCell("A1").font = {
    bold: true,
    size: 18,
    color: { argb: "FFFFFFFF" },
  };
  sheet.getCell("A1").fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF1D4ED8" },
  };
  sheet.getCell("A1").alignment = { horizontal: "center" };
  sheet.mergeCells("A2:G2");
  sheet.getCell("A2").value =
    `${input.tournamentName} · ${input.date.toLocaleDateString("es-UY")}`;
  sheet.getCell("A2").alignment = { horizontal: "center" };
  sheet.addRow([]);
  const header = sheet.addRow([
    "N.º",
    "Nombre y apellido",
    "Fecha nacimiento",
    "Edad",
    "Peso (kg)",
    "Altura (cm)",
    "Grado",
  ]);
  header.font = { bold: true, color: { argb: "FFFFFFFF" } };
  header.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF172033" },
  };
  input.registrations.forEach((r, i) =>
    sheet.addRow([
      i + 1,
      r.snapshot.fullName,
      r.snapshot.birthDate,
      r.snapshot.age,
      r.snapshot.weight ?? "",
      r.snapshot.height ?? "",
      r.snapshot.gradeName,
    ]),
  );
  sheet.getColumn(3).numFmt = "dd/mm/yyyy";
  [8, 32, 18, 10, 14, 14, 18].forEach(
    (width, i) => (sheet.getColumn(i + 1).width = width),
  );
  sheet.views = [{ state: "frozen", ySplit: 4 }];
  sheet.autoFilter = "A4:G4";
  sheet.getRows(4, sheet.rowCount - 3)?.forEach((row) => {
    row.height = 22;
    row.eachCell((cell) => {
      cell.alignment = {
        vertical: "middle",
        horizontal: Number(cell.col) === 2 ? "left" : "center",
      };
      cell.border = {
        top: { style: "thin", color: { argb: "FFD9D9D2" } },
        left: { style: "thin", color: { argb: "FFD9D9D2" } },
        bottom: { style: "thin", color: { argb: "FFD9D9D2" } },
        right: { style: "thin", color: { argb: "FFD9D9D2" } },
      };
    });
  });
  sheet.pageSetup.printTitlesRow = "1:4";
  sheet.headerFooter.oddFooter = "Página &P de &N";
  return Buffer.from(await book.xlsx.writeBuffer());
}
