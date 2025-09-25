import Tokens from "../app/tokens";

describe("Tokens Screen", () => {
  it("exports Tokens component", () => {
    expect(Tokens).toBeDefined();
    expect(typeof Tokens).toBe("function");
  });
});
