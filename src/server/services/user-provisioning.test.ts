import { expect, test } from "vitest";

import { getEarlyUserBadgeId } from "./user-provisioning";

void test("selects exactly one early-user badge at each boundary", () => {
  expect(getEarlyUserBadgeId(0)).toBeNull();
  expect(getEarlyUserBadgeId(1)).toBe("0-10th_user");
  expect(getEarlyUserBadgeId(10)).toBe("0-10th_user");
  expect(getEarlyUserBadgeId(11)).toBe("11-50th_user");
  expect(getEarlyUserBadgeId(51)).toBe("51-100th_user");
  expect(getEarlyUserBadgeId(101)).toBe("101-500th_user");
  expect(getEarlyUserBadgeId(501)).toBe("501-1000th_user");
  expect(getEarlyUserBadgeId(1001)).toBeNull();
});
