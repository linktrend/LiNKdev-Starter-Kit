import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Button } from '@/components/ui/button';

describe("Primitive Import Tests", () => {
  it("renders Button component from local UI components", () => {
    render(<Button>Test Button</Button>);
    
    const button = screen.getByRole("button", { name: "Test Button" });
    expect(button).toBeTruthy();
    expect(button.textContent).toBe("Test Button");
  });

  it("Button accepts and renders children correctly", () => {
    const testText = "Click me!";
    render(<Button>{testText}</Button>);
    
    expect(screen.getByText(testText)).toBeTruthy();
  });

  it("Button has expected CSS classes", () => {
    render(<Button>Styled Button</Button>);
    
    const button = screen.getByRole("button");
    expect(button.className).toContain("inline-flex");
    expect(button.className).toContain("items-center");
    expect(button.className).toContain("rounded-md");
  });
});
