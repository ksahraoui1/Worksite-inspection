"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import type { Chantier } from "@/types/database";

interface StopModalProps {
  open: boolean;
  onClose: () => void;
}

export function StopModal({ open, onClose }: StopModalProps) {
  const [chantiers, setChantiers] = useState<Pick<Chantier, "id" | "nom">[]>([]);
  const [chantierId, setChantierId] = useState("");
  const [constat, setConstat] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    async function loadChantiers() {
      const supabase = createClient();
      const { data } = await supabase
        .from("chantier")
        .select("id, nom")
        .is("deleted_at", null)
        .eq("statut", "actif")
        .order("nom");
      setChantiers(data ?? []);
    }
    loadChantiers();
  }, [open]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!chantierId || !constat.trim()) return;

    setSending(true);
    setError(null);
    try {
      const res = await fetch("/api/ecarts/stop-danger", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chantier_id: chantierId,
          constat: constat.trim(),
        }),
      });

      if (res.ok) {
        setSent(true);
        setTimeout(() => {
          setSent(false);
          setConstat("");
          setChantierId("");
          onClose();
        }, 2000);
      } else {
        const data = await res.json();
        setError(data.error || "Erreur lors de l'envoi");
      }
    } catch {
      setError("Erreur réseau");
    } finally {
      setSending(false);
    }
  }

  if (sent) {
    return (
      <Modal open={open} onClose={onClose} title="STOP Danger">
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">⚠️</span>
          </div>
          <p className="font-semibold text-lg">STOP Danger enregistré</p>
          <p className="text-sm text-gray-500 mt-1">
            Le responsable sécurité a été notifié.
          </p>
        </div>
      </Modal>
    );
  }

  return (
    <Modal open={open} onClose={onClose} title="⚠️ STOP EN CAS DE DANGER">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-red-700 text-sm">
            {error}
          </div>
        )}
        <div>
          <label
            htmlFor="stop-chantier"
            className="block text-sm font-medium mb-1.5"
          >
            Chantier *
          </label>
          <select
            id="stop-chantier"
            value={chantierId}
            onChange={(e) => setChantierId(e.target.value)}
            required
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm min-h-[44px] focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="">— Sélectionner un chantier —</option>
            {chantiers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nom}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="stop-constat"
            className="block text-sm font-medium mb-1.5"
          >
            Description du danger *
          </label>
          <textarea
            id="stop-constat"
            value={constat}
            onChange={(e) => setConstat(e.target.value)}
            placeholder="Décrivez le danger immédiat..."
            rows={3}
            required
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>

        <Button
          type="submit"
          variant="danger"
          className="w-full text-base font-bold"
          disabled={sending}
        >
          {sending ? "Envoi en cours..." : "⚠️ DÉCLENCHER STOP DANGER"}
        </Button>
      </form>
    </Modal>
  );
}
