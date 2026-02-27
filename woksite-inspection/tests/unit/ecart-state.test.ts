import { describe, it, expect } from "vitest";
import {
  isValidTransition,
  getAvailableTransitions,
} from "@/lib/utils/ecart-state";

describe("ecart-state machine", () => {
  describe("isValidTransition", () => {
    // Transitions valides depuis a_corriger
    it("a_corriger → stop_danger (escalade)", () => {
      expect(isValidTransition("a_corriger", "stop_danger")).toBe(true);
    });

    it("a_corriger → resolu (resolution)", () => {
      expect(isValidTransition("a_corriger", "resolu")).toBe(true);
    });

    // Transitions valides depuis stop_danger
    it("stop_danger → a_corriger (de-escalade)", () => {
      expect(isValidTransition("stop_danger", "a_corriger")).toBe(true);
    });

    it("stop_danger → resolu (resolution directe)", () => {
      expect(isValidTransition("stop_danger", "resolu")).toBe(true);
    });

    // Transitions invalides depuis resolu (état terminal)
    it("resolu → a_corriger (invalide)", () => {
      expect(isValidTransition("resolu", "a_corriger")).toBe(false);
    });

    it("resolu → stop_danger (invalide)", () => {
      expect(isValidTransition("resolu", "stop_danger")).toBe(false);
    });

    it("resolu → resolu (invalide, identité)", () => {
      expect(isValidTransition("resolu", "resolu")).toBe(false);
    });

    // Transitions identité invalides
    it("a_corriger → a_corriger (invalide, identité)", () => {
      expect(isValidTransition("a_corriger", "a_corriger")).toBe(false);
    });

    it("stop_danger → stop_danger (invalide, identité)", () => {
      expect(isValidTransition("stop_danger", "stop_danger")).toBe(false);
    });
  });

  describe("getAvailableTransitions", () => {
    it("a_corriger peut escalader ou résoudre", () => {
      const transitions = getAvailableTransitions("a_corriger");
      expect(transitions).toContain("stop_danger");
      expect(transitions).toContain("resolu");
      expect(transitions).toHaveLength(2);
    });

    it("stop_danger peut dé-escalader ou résoudre", () => {
      const transitions = getAvailableTransitions("stop_danger");
      expect(transitions).toContain("a_corriger");
      expect(transitions).toContain("resolu");
      expect(transitions).toHaveLength(2);
    });

    it("resolu est un état terminal (aucune transition)", () => {
      const transitions = getAvailableTransitions("resolu");
      expect(transitions).toHaveLength(0);
    });
  });
});
