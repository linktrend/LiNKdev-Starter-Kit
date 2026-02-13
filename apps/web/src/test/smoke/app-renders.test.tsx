import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
}));

// Mock Supabase
vi.mock("@/lib/supabase/client", () => ({
  createClient: vi.fn(() => ({
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
    },
  })),
}));

describe("App Smoke Tests", () => {
  it("renders login page without crashing", async () => {
    const { default: LoginPage } = await import("@/app/[locale]/(auth_forms)/login/page");

    render(<LoginPage params={{ locale: "en" }} />);

    expect(screen.getByText(/Welcome to LiNKdev Starter Kit/i)).toBeTruthy();
    expect(screen.getByText(/Log in to your account/i)).toBeTruthy();
  });
});
