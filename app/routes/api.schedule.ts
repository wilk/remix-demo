import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import dayjs from "dayjs";
import { verifyAccessToken } from "~/token.service";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const token = request.headers.get("Authorization")?.split(" ")[1];
  if (!token) {
    return json({ message: "No token provided" }, 400);
  }
  const isTokenValid = verifyAccessToken(token);
  if (!isTokenValid) {
    return json({ message: "Invalid token" }, 400);
  }

  return json([
    {
      id: 1,
      eta: dayjs().toISOString(),
      etd: dayjs().add(2, "hour").toISOString(),
    },
    {
      id: 2,
      eta: dayjs().add(4, "hour").toISOString(),
      etd: dayjs().add(6, "hour").toISOString(),
    },
    {
      id: 3,
      eta: dayjs().add(8, "hour").toISOString(),
      etd: dayjs().add(10, "hour").toISOString(),
    },
  ]);
};
