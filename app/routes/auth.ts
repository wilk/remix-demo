import { json, type ActionFunctionArgs } from "@remix-run/node";
import { issueTokensByCredentials } from "~/credentials.service";

export type AuthActionResponse = typeof action;

export const action = async ({ request }: ActionFunctionArgs) => {
  const data = await request.formData();
  const clientId = String(data.get("clientId") ?? "");
  const clientSecret = String(data.get("clientSecret") ?? "");
  const tokens = await issueTokensByCredentials(clientId, clientSecret);
  if (!tokens) {
    return json(
      { error: "Invalid or revoked client ID or secret" },
      { status: 400 }
    );
  }
  return json(tokens);
};
