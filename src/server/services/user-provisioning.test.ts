import assert from "node:assert/strict";
import { test } from "node:test";

import { getEarlyUserBadgeId } from "./user-provisioning";

void test("selects exactly one early-user badge at each boundary", () => {
  assert.equal(getEarlyUserBadgeId(1), "0-10th_user");
  assert.equal(getEarlyUserBadgeId(10), "0-10th_user");
  assert.equal(getEarlyUserBadgeId(11), "11-50th_user");
  assert.equal(getEarlyUserBadgeId(51), "51-100th_user");
  assert.equal(getEarlyUserBadgeId(101), "101-500th_user");
  assert.equal(getEarlyUserBadgeId(501), "501-1000th_user");
  assert.equal(getEarlyUserBadgeId(1001), null);
});
