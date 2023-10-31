import crypto from "crypto";
import jwt from "jsonwebtoken";
import {
  createCredentials,
  getCredentials,
  getCredentialsByClientIdAndClientSecret,
  updateCredentialsById,
} from "./credentials.repo";
import { config } from "./config";
import dayjs from "dayjs";
import { accessTokenMap } from "./token.cache";

export const listCredentials = () => getCredentials();

export const generateCredentials = async (name: string) => {
  const clientId = crypto.randomBytes(8).toString("hex");
  const clientSecret = crypto.randomBytes(16).toString("hex");
  return createCredentials({
    name,
    clientId,
    clientSecret,
    status: "active",
  });
};

export const revokeCredentialsById = async (credentialsId: string) => {
  const updatedCredentials = await updateCredentialsById(credentialsId, {
    status: "revoked",
  });

  accessTokenMap.delete(credentialsId);

  return updatedCredentials;
};

export const issueTokensByCredentials = async (
  clientId: string,
  clientSecret: string
) => {
  const credentials = await getCredentialsByClientIdAndClientSecret(
    clientId,
    clientSecret
  );
  if (!credentials) {
    return null;
  }

  if (credentials.status !== "active") {
    return null;
  }

  const accessToken = jwt.sign(
    {
      credentialsId: credentials.id,
      type: "access_token",
      expiresAt: dayjs().add(3, "hours").toISOString(),
    },
    config.JWT_SECRET
  );

  const refreshToken = jwt.sign(
    { credentialsId: credentials.id, type: "refresh_token" },
    config.JWT_SECRET,
    {
      expiresIn: "3w",
    }
  );

  accessTokenMap.set(credentials.id, accessToken);

  return {
    accessToken,
    refreshToken,
  };
};
