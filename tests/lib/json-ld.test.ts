import { describe, expect, it } from "vitest";
import { serializeJsonLd } from "@/lib/json-ld";

describe("serializeJsonLd", () => {
  it("escapes characters that can break out of a script tag", () => {
    const serialized = serializeJsonLd({
      name: '</script><script>alert("xss")</script>',
      description: "Rock & Roll > Jazz < Metal",
    });

    expect(serialized).not.toContain("</script>");
    expect(serialized).toContain("\\u003c/script\\u003e");
    expect(serialized).toContain("\\u0026");
    expect(serialized).toContain("\\u003e");
  });

  it("escapes unicode line separator characters", () => {
    const serialized = serializeJsonLd({
      value: "line\u2028separator and paragraph\u2029separator",
    });

    expect(serialized).toContain("\\u2028");
    expect(serialized).toContain("\\u2029");
  });
});
