import type { Prisma } from "@prisma/client";
import { db } from "./database";

export const getCredentials = () => db.credential.findMany();

export const getCredentialsByClientIdAndClientSecret = (
  clientId: string,
  clientSecret: string
) => db.credential.findFirst({ where: { clientId, clientSecret } });

export const createCredentials = (
  data: Prisma.CredentialUncheckedCreateInput
) => db.credential.create({ data });

export const updateCredentialsById = (
  credentialsId: string,
  data: Prisma.CredentialUncheckedUpdateInput
) => db.credential.update({ where: { id: credentialsId }, data });
