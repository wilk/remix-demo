import jwt from "jsonwebtoken";

import { config } from "./config";
import dayjs from "dayjs";
import { accessTokenMap } from "./token.cache";

type AccessTokenPayload = {
  credentialsId: string;
  type: string;
  expiresAt: string;
};

export const verifyAccessToken = (token: string) => {
  try {
    const decodedToken = jwt.verify(
      token,
      config.JWT_SECRET
    ) as AccessTokenPayload;

    if (decodedToken.type !== "access_token") {
      return false;
    }

    if (dayjs(decodedToken.expiresAt).isBefore(dayjs())) {
      return false;
    }

    return accessTokenMap.get(decodedToken.credentialsId) === token;
  } catch (err) {
    return false;
  }
};
