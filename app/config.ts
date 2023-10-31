// Required
if (!process.env.JWT_SECRET) {
  throw new Error("Missing JWT_SECRET environment variable");
}

const JWT_SECRET = String(process.env.JWT_SECRET);

export const config = {
  JWT_SECRET,
};
