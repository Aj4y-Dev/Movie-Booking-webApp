import { createHmac } from "node:crypto";

const ESEWA_SECRET_KEY = process.env.ESEWA_SECRET_KEY!;
const ESEWA_PRODUCT_CODE = process.env.ESEWA_PRODUCT_CODE!;

const ESEWA_VERIFY_URL =
  process.env.NODE_ENV === "production"
    ? "https://epay.esewa.com.np/api/epay/transaction/status/"
    : "https://rc-epay.esewa.com.np/api/epay/transaction/status/";

export const ESEWA_PAYMENT_URL =
  process.env.NODE_ENV === "production"
    ? "https://epay.esewa.com.np/api/epay/main/v2/form"
    : "https://rc-epay.esewa.com.np/api/epay/main/v2/form";

// generate payment hash for eSewa form submission
export const getEsewaPaymentHash = ({
  amount,
  transaction_uuid,
}: {
  amount: number;
  transaction_uuid: string;
}) => {
  const message = `total_amount=${amount},transaction_uuid=${transaction_uuid},product_code=${ESEWA_PRODUCT_CODE}`;
  const signature = createHmac("sha256", ESEWA_SECRET_KEY) //HMAC (Hash-based Message Authentication Code) kind of digital signature
    .update(message)
    .digest("base64");

  return {
    amount,
    tax_amount: 0,
    total_amount: amount,
    transaction_uuid,
    product_code: ESEWA_PRODUCT_CODE,
    product_service_charge: 0,
    product_delivery_charge: 0,
    success_url: `${process.env.BACKEND_URL}/api/v1/payment/esewa/success`,
    failure_url: `${process.env.BACKEND_URL}/api/v1/payment/esewa/failure`,
    signed_field_names: "total_amount,transaction_uuid,product_code",
    signature,
  };
};

// verify signature from eSewa callback
const verifySignature = (decodedData: Record<string, string>): boolean => {
  const { signed_field_names, signature } = decodedData;
  const signedFields = signed_field_names.split(",");
  const signedValues = signedFields
    .map((field) => `${field}=${decodedData[field]}`)
    .join(",");

  const expectedSignature = createHmac("sha256", ESEWA_SECRET_KEY)
    .update(signedValues)
    .digest("base64");

  return expectedSignature === signature;
};

// decode and verify eSewa success callback
export const verifyEsewaPayment = async (data: string) => {
  // decode base64 response from eSewa
  const decodedData = JSON.parse(
    Buffer.from(data, "base64").toString("utf-8"),
  ) as Record<string, string>;

  if (!verifySignature(decodedData))
    throw new Error("Invalid payment signature");

  if (decodedData.status !== "COMPLETE")
    throw new Error("Payment not completed");

  // double verify with eSewa status API
  const url = new URL(ESEWA_VERIFY_URL);
  url.searchParams.set("product_code", ESEWA_PRODUCT_CODE);
  url.searchParams.set("transaction_uuid", decodedData.transaction_uuid);
  url.searchParams.set("total_amount", decodedData.total_amount);

  const response = await fetch(url.toString());

  if (!response.ok) throw new Error("eSewa verification API failed");

  const responseData = (await response.json()) as { status: string };

  if (responseData.status !== "COMPLETE")
    throw new Error("Payment verification failed with eSewa");

  return { decodedData, response: responseData };
};

// decode eSewa failure callback
export const verifyEsewaPaymentFailure = (data: string) => {
  const decodedData = JSON.parse(
    Buffer.from(data, "base64").toString("utf-8"),
  ) as Record<string, string>;
  return { decodedData };
};
