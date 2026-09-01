// @vitest-environment jsdom

import { describe, expect, it } from "vitest";
import { formPayload, type Field } from "./resource-form";

describe("formPayload", () => {
  it("omits blank optional numbers instead of sending invalid strings", () => {
    const form = document.createElement("form");
    form.innerHTML = `
      <input name="firstName" value="Ana" />
      <input name="weight" type="number" value="" />
      <input name="height" type="number" value="165" />
    `;
    const fields: Field[] = [
      { name: "firstName", label: "Nombre", required: true },
      { name: "weight", label: "Peso", type: "number" },
      { name: "height", label: "Altura", type: "number" },
    ];

    expect(formPayload(form, fields)).toEqual({
      firstName: "Ana",
      height: 165,
    });
  });
});
