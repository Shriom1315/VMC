import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import PartyRegistrationPage from "./PartyRegistrationPage";

describe("PartyRegistrationPage Component", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it("should render page title, subtitle, and table data after loading", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [
        {
          id: 1,
          name: "Acme Industrial Ltd",
          contact: "9876543210",
          gst_type: "CGST/SGST",
          billing_firm: "Vikramaditya Calibration",
        },
      ],
    } as Response);

    render(
      <MemoryRouter>
        <PartyRegistrationPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Party Registration")).toBeInTheDocument();
      expect(screen.getByText("Manage client and party records")).toBeInTheDocument();
      expect(screen.getByText("Acme Industrial Ltd")).toBeInTheDocument();
    });
  });
});
