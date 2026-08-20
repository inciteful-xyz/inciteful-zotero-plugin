import { assert } from "chai";
import { config } from "../package.json";

describe("startup", function () {
  it("should have plugin instance defined", function () {
    assert.isNotEmpty(
      (Zotero as unknown as Record<string, unknown>)[config.addonInstance],
    );
  });
});
