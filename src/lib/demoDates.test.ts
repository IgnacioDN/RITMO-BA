import { describe, expect, it } from "vitest";
import { rollStartsAt } from "./demoDates";

// Martes 17/11/2026, 10:00 en Buenos Aires.
const TUESDAY = new Date("2026-11-17T13:00:00Z");

describe("rollStartsAt", () => {
  it("lleva un viernes al próximo viernes y conserva la hora", () => {
    expect(rollStartsAt("2026-10-09T21:00:00-03:00", 0, TUESDAY)).toBe("2026-11-20T21:00:00-03:00");
  });

  it("suma las semanas pedidas", () => {
    expect(rollStartsAt("2026-10-09T21:00:00-03:00", 2, TUESDAY)).toBe("2026-12-04T21:00:00-03:00");
  });

  it("si el evento cae el día de hoy, pasa a la semana próxima (nunca hoy)", () => {
    expect(rollStartsAt("2026-10-13T20:00:00-03:00", 0, TUESDAY)).toBe("2026-11-24T20:00:00-03:00");
  });

  it("usa la fecha de Buenos Aires, no la del servidor (UTC)", () => {
    // 01:00 UTC del miércoles 18 son las 22:00 del martes 17 en Buenos Aires.
    const lateTuesdayBA = new Date("2026-11-18T01:00:00Z");
    expect(rollStartsAt("2026-10-09T21:00:00-03:00", 0, lateTuesdayBA)).toBe("2026-11-20T21:00:00-03:00");
  });

  it("deja igual un valor que no es una fecha", () => {
    expect(rollStartsAt("no-es-fecha", 1, TUESDAY)).toBe("no-es-fecha");
  });
});
