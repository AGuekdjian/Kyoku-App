import ExcelJS from "exceljs";
import { describe, expect, it } from "vitest";
import { tournamentWorkbook } from "./tournament";

describe("tournament workbook", () => {
  it("creates a blue, styled xlsx with historical values", async () => {
    const buffer = await tournamentWorkbook({
      dojoName: "Kyoku",
      tournamentName: "Copa",
      date: new Date("2026-10-01"),
      registrations: [
        {
          snapshot: {
            fullName: "Ana Demo",
            birthDate: new Date("2012-02-01"),
            age: 14,
            weight: 50,
            height: 160,
            gradeName: "7.º Kyu",
          },
        },
      ],
    });
    const book = new ExcelJS.Workbook();
    await book.xlsx.load(buffer as unknown as ExcelJS.Buffer);
    const sheet = book.getWorksheet("Inscripciones");
    expect(sheet?.getCell("B5").value).toBe("Ana Demo");
    expect(sheet?.getCell("A1").fill).toMatchObject({
      fgColor: { argb: "FF1D4ED8" },
    });
    expect(sheet?.views[0]).toMatchObject({ state: "frozen", ySplit: 4 });
  });
});
