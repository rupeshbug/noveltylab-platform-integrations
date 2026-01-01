import { expect, test } from "vitest";
import { FacebookMessengerSDK } from "../src/facebook-messenger";

const fb = new FacebookMessengerSDK({
  pageAccessToken: "random",
});

const invalidPayload = { name: "dsasda" };

const validGetFaceboookMessagePayload = {
  object: "page",
  entry: [
    {
      time: 1766502836038,
      id: "436899702836492", // id of the page itself
      messaging: [
        {
          sender: {
            id: "25253244094345190", // person sending the message to the page
          },
          recipient: {
            id: "436899702836492", // id of the page itself
          },
          timestamp: 1766502835295,
          message: {
            mid: "m_NxsI9usMBgX9Q7-vCGTVwR0rJynMTjNQoFFj79sadlNUbSbin0ExrRnk0EIRJlW1WMB8NOShQsPBYRcL1pjTCQ",
            text: "hello",
          },
        },
      ],
    },
  ],
};

const validSendFacebookMessagePayload = {
  pageAccessToken: "dsadsadsa",
  recipientId: "dasdsa",
  message: "dsadsadas",
};

test("getFacebookMessage: fails for invalid payload", async () => {
  const response = await fb.getFacebookMessage(invalidPayload);
  expect(response.success).toBe(false);
});

test("getFacebookMessage: returns success for valid payload", async () => {
  const response = await fb.getFacebookMessage(validGetFaceboookMessagePayload);
  expect(response.success).toBe(true);
});

test("validateSendFacebookMessage: fails for invalid payload", async () => {
  const response = await fb.sendFacebookMessage(invalidPayload);
  expect(response.success).toBe(false);
});

test("validateSendFacebookMessage: returns success for valid payload", async () => {
  const response = await fb.sendFacebookMessage(
    validSendFacebookMessagePayload
  );
  expect(response.recipientId).toBeDefined();
});
