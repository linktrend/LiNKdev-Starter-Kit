import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";

// Mock Next.js dynamic imports and modules
vi.mock("next/dynamic", () => ({
  default: (fn: () => Promise<any>) => {
    const Component = fn();
    return Component;
  },
}));

// Mock Supabase
vi.mock("@/lib/supabase/client", () => ({
  createClient: vi.fn(() => ({
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
    },
  })),
}));

// Mock tRPC
vi.mock("@/trpc/react", () => ({
  api: {
    useQuery: vi.fn().mockReturnValue({
      data: undefined,
      isLoading: false,
      error: null,
    }),
  },
}));

describe("App Smoke Tests", () => {
  it("renders marketing page without crashing", async () => {
    // Dynamically import the marketing page to avoid importing billing page
    const { default: SimpleHomepage } = await import("@/app/(marketing)/page");
    
    render(<SimpleHomepage />);
    
    // Check for key elements that should be present
    expect(screen.getByText("LTM Starter Kit")).toBeTruthy();
    expect(screen.getByText(/A complete & open-source Next.js 14 SaaS template/)).toBeTruthy();
    expect(screen.getByText("Pricing")).toBeTruthy();
  });

  it("renders pricing section with expected tiers", async () => {
    const { default: SimpleHomepage } = await import("@/app/(marketing)/page");
    
    render(<SimpleHomepage />);
    
    // Check for pricing tiers
    expect(screen.getByText("Starter")).toBeTruthy();
    expect(screen.getByText("Pro")).toBeTruthy();
    expect(screen.getByText("Enterprise")).toBeTruthy();
    
    // Check for pricing amounts
    expect(screen.getByText("$9")).toBeTruthy();
    expect(screen.getByText("$99")).toBeTruthy();
    expect(screen.getByText("$999")).toBeTruthy();
  });
});
