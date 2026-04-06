import { describe, it, expect, vi, beforeEach } from "vitest";

const mockSend = vi.fn().mockResolvedValue({ error: null });

vi.mock("resend", () => ({
  Resend: class {
    emails = { send: mockSend };
  },
}));

describe("STOP Danger integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSend.mockResolvedValue({ error: null });
  });

  it("sendStopDangerEmail envoie un email formaté", async () => {
    const { sendStopDangerEmail } = await import(
      "@/lib/notifications/email"
    );

    const result = await sendStopDangerEmail(
      "responsable@test.ch",
      "Chantier Test",
      "Échafaudage instable sur la façade nord"
    );

    expect(result).toBe(true);
    expect(mockSend).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "responsable@test.ch",
        subject: expect.stringContaining("STOP DANGER"),
      })
    );
  });

  it("isValidTransition protège l'état terminal resolu", async () => {
    const { isValidTransition } = await import("@/lib/utils/ecart-state");
    expect(isValidTransition("resolu", "stop_danger")).toBe(false);
    expect(isValidTransition("resolu", "a_corriger")).toBe(false);
  });

  it("STOP Danger peut être résolu directement", async () => {
    const { isValidTransition } = await import("@/lib/utils/ecart-state");
    expect(isValidTransition("stop_danger", "resolu")).toBe(true);
  });

  it("un écart peut être escaladé vers STOP Danger", async () => {
    const { isValidTransition } = await import("@/lib/utils/ecart-state");
    expect(isValidTransition("a_corriger", "stop_danger")).toBe(true);
  });
});
