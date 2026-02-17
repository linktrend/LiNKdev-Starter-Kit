import fs from "node:fs";
import path from "node:path";

describe("Tokens Screen", () => {
  it("uses design token classes", () => {
    const tokensPath = path.resolve(__dirname, "..", "app", "tokens.tsx");
    const source = fs.readFileSync(tokensPath, "utf8");

    expect(source).toContain("bg-background");
    expect(source).toContain("text-foreground");
    expect(source).toContain("bg-primary");
    expect(source).toContain("text-primary-foreground");
  });
});
