import fs from "node:fs";
import path from "node:path";

describe("Native component wrappers", () => {
  const source = fs.readFileSync(
    path.resolve(__dirname, "..", "app", "native-components.tsx"),
    "utf8"
  );

  it("defines all wrapper components with display names", () => {
    expect(source).toContain('Button.displayName = "Button"');
    expect(source).toContain('Text.displayName = "Text"');
    expect(source).toContain('Input.displayName = "Input"');
    expect(source).toContain('Card.displayName = "Card"');
  });

  it("keeps forwardRef wrappers in place", () => {
    expect(source).toContain("export const Button = React.forwardRef");
    expect(source).toContain("export const Text = React.forwardRef");
    expect(source).toContain("export const Input = React.forwardRef");
    expect(source).toContain("export const Card = React.forwardRef");
  });
});
