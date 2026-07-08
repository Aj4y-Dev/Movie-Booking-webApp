import { createHmac } from "node:crypto";

const SECRET_KEY = "8gBm/:&EnhH.1/q";

// from payment/initiate response
const transaction_uuid = "6a4d11864d9ba97c86dd7a77-1783436230412";
const total_amount = "680";
const transaction_code = "0007HBE";
const status = "COMPLETE";
const signed_field_names =
  "transaction_uuid,status,total_amount,transaction_code";

const signedValues = `transaction_uuid=${transaction_uuid},status=${status},total_amount=${total_amount},transaction_code=${transaction_code}`;

const signature = createHmac("sha256", SECRET_KEY)
  .update(signedValues)
  .digest("base64");

const payload = {
  transaction_uuid,
  status,
  total_amount,
  transaction_code,
  signed_field_names,
  signature,
};

const encoded = Buffer.from(JSON.stringify(payload)).toString("base64");
console.log("\n Hit this URL in Postman:");
console.log(
  `\nGET http://localhost:4000/api/v1/payment/esewa/success?data=${encoded}`,
);
