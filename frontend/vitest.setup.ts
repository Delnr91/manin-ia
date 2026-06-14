import "@testing-library/jest-dom/vitest";
import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

// Limpia el DOM y el localStorage tras cada test para aislarlos.
afterEach(() => {
  cleanup();
  localStorage.clear();
});
