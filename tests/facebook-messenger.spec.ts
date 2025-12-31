import { expect, test } from "vitest";
import { getFacebookMessage } from "../src";

test("getFacebookMessage: fails for invalid payload", async () => {
  const response = await getFacebookMessage({ name: "dsasda" });
  expect(response.success).toBe(false);
});
