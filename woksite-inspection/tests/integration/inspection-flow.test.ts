import { describe, it, expect, vi, beforeEach } from "vitest";

const mockInsert = vi.fn();
const mockUpdate = vi.fn();
const mockUpsert = vi.fn();

function createChain() {
  const chain: Record<string, unknown> = {};
  chain.select = vi.fn().mockReturnValue(chain);
  chain.insert = (data: unknown) => {
    mockInsert((chain as { __table: string }).__table, data);
    return chain;
  };
  chain.update = (data: unknown) => {
    mockUpdate((chain as { __table: string }).__table, data);
    return chain;
  };
  chain.upsert = (data: unknown, opts?: unknown) => {
    mockUpsert((chain as { __table: string }).__table, data, opts);
    return chain;
  };
  chain.eq = vi.fn().mockReturnValue(chain);
  chain.is = vi.fn().mockReturnValue(chain);
  chain.order = vi.fn().mockReturnValue(chain);
  chain.single = vi.fn().mockResolvedValue({ data: { id: "visite-1" } });
  return chain;
}

vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    from: (table: string) => {
      const chain = createChain();
      (chain as { __table: string }).__table = table;
      return chain;
    },
    storage: {
      from: () => ({
        upload: vi.fn().mockResolvedValue({ error: null }),
        getPublicUrl: () => ({
          data: { publicUrl: "https://test.com/photo.jpg" },
        }),
      }),
    },
  }),
}));

describe("Inspection flow integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("crée une visite", async () => {
    const { createClient } = await import("@/lib/supabase/client");
    const supabase = createClient();

    await supabase
      .from("visite")
      .insert({
        chantier_id: "chantier-1",
        phase_id: "phase-1",
        inspecteur_nom: "Test Inspector",
      })
      .select()
      .single();

    expect(mockInsert).toHaveBeenCalledWith("visite", {
      chantier_id: "chantier-1",
      phase_id: "phase-1",
      inspecteur_nom: "Test Inspector",
    });
  });

  it("sauvegarde une réponse via upsert", async () => {
    const { createClient } = await import("@/lib/supabase/client");
    const supabase = createClient();

    await supabase.from("reponse_visite").upsert(
      {
        visite_id: "visite-1",
        checklist_item_id: "item-1",
        resultat: "conforme",
      },
      { onConflict: "visite_id,checklist_item_id" }
    );

    expect(mockUpsert).toHaveBeenCalledWith(
      "reponse_visite",
      {
        visite_id: "visite-1",
        checklist_item_id: "item-1",
        resultat: "conforme",
      },
      { onConflict: "visite_id,checklist_item_id" }
    );
  });

  it("crée un écart pour un point non conforme", async () => {
    const { createClient } = await import("@/lib/supabase/client");
    const supabase = createClient();

    await supabase.from("ecart").insert({
      visite_id: "visite-1",
      checklist_item_id: "item-1",
      constat: "Garde-corps manquant",
      severite: "a_corriger",
      statut: "a_corriger",
    });

    expect(mockInsert).toHaveBeenCalledWith("ecart", {
      visite_id: "visite-1",
      checklist_item_id: "item-1",
      constat: "Garde-corps manquant",
      severite: "a_corriger",
      statut: "a_corriger",
    });
  });

  it("termine une visite", async () => {
    const { createClient } = await import("@/lib/supabase/client");
    const supabase = createClient();

    await supabase
      .from("visite")
      .update({ statut: "terminee" })
      .eq("id", "visite-1");

    expect(mockUpdate).toHaveBeenCalledWith("visite", { statut: "terminee" });
  });
});
