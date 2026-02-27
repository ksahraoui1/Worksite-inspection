import type { EcartStatut } from "@/types/database";

const VALID_TRANSITIONS: Record<EcartStatut, EcartStatut[]> = {
  a_corriger: ["stop_danger", "resolu"],
  stop_danger: ["a_corriger", "resolu"],
  resolu: [], // état terminal
};

export function isValidTransition(
  current: EcartStatut,
  target: EcartStatut
): boolean {
  return VALID_TRANSITIONS[current].includes(target);
}

export function getAvailableTransitions(current: EcartStatut): EcartStatut[] {
  return VALID_TRANSITIONS[current];
}
