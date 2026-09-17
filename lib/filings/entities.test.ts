import { describe, expect, it } from "vitest";
import { decodeEntities } from "./entities";

describe("character references in a filing", () => {
  it("turns the codes filings use into the characters they name", () => {
    // Apple's trademarks, a risk-factor bullet, NVIDIA's copyright line.
    expect(decodeEntities("iPhone&#174; and iPhone Air&#8482;")).toBe("iPhone® and iPhone Air™");
    expect(decodeEntities("&#8226; our ability")).toBe("• our ability");
    expect(decodeEntities("&#169; 2026 NVIDIA")).toBe("© 2026 NVIDIA");
    expect(decodeEntities("&reg; &trade; &bull; &sect;")).toBe("® ™ • §");
    expect(decodeEntities("&#xAE; &#x2122;")).toBe("® ™");
  });

  it("keeps quotes and dashes plain, as search and kept passages expect", () => {
    expect(decodeEntities("Company&#8217;s &#8220;risk&#8221; &#8212; cost&#8211;of&#8211;sales")).toBe(`Company's "risk" - cost-of-sales`);
    expect(decodeEntities("a&nbsp;b&#160;c")).toBe("a b c");
  });

  it("decodes once, so an escaped code stays as written", () => {
    expect(decodeEntities("&amp;#174; &amp;amp; &lt;b&gt;")).toBe("&#174; &amp; <b>");
  });

  it("leaves what it does not recognise alone, and drops invisible printing marks", () => {
    expect(decodeEntities("&notathing; &#0; &#xD800;")).toBe("&notathing; &#0; &#xD800;");
    expect(decodeEntities("hy&shy;phen&#8203;ated")).toBe("hyphenated");
  });
});
