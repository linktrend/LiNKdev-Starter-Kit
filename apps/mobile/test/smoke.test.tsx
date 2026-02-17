import fs from "node:fs";
import path from "node:path";

describe("Mobile baseline", () => {
  it("contains required route files", () => {
    const root = path.resolve(__dirname, "..", "app");
    const required = ["_layout.tsx", "index.tsx", "smoke.tsx", "tokens.tsx"];
    for (const file of required) {
      expect(fs.existsSync(path.join(root, file))).toBe(true);
    }
  });

  it("keeps expected home screen marker", () => {
    const indexPath = path.resolve(__dirname, "..", "app", "index.tsx");
    const source = fs.readFileSync(indexPath, "utf8");
    expect(source).toContain("Mobile Home");
  });
});
