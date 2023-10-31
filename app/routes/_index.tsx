import {
  Box,
  Button,
  Container,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import type { ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import {
  Form,
  useActionData,
  useFetcher,
  useLoaderData,
  useNavigation,
} from "@remix-run/react";
import { useState } from "react";
import {
  generateCredentials,
  listCredentials,
  revokeCredentialsById,
} from "~/credentials.service";
import type { AuthActionResponse } from "./auth";
import { CopyToClipboardButton } from "~/CopyToClipboardButton";

const CREATE_CREDENTIALS_ACTION = "create_credentials";
const REVOKE_CREDENTIALS_ACTION = "revoke_credentials";

export const loader = async () => {
  const credentials = await listCredentials();

  return json({ credentials });
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const action = String(formData.get("action") ?? "");

  switch (action) {
    case CREATE_CREDENTIALS_ACTION:
      const name = String(formData.get("name") ?? "");
      if (name === "wilk") {
        return json(
          { errorFields: { name: "This name is forbidden, bitch" } },
          { status: 400 }
        );
      }
      const newCredentials = await generateCredentials(name);
      return json({ credentials: newCredentials });
    case REVOKE_CREDENTIALS_ACTION:
      const credentialsId = String(formData.get("credentialsId") ?? "");
      const updatedCredentials = await revokeCredentialsById(credentialsId);
      return json({ credentials: updatedCredentials });
    default:
      return json({ error: "Invalid action" }, { status: 400 });
  }
};

export default function Index() {
  const { credentials } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const revoker = useFetcher();
  const tokensIssuer = useFetcher<AuthActionResponse>();
  const [token, setToken] = useState("");
  const [loadingSchedule, setLoadingSchedule] = useState(false);
  const [schedule, setSchedule] = useState([]);
  const [scheduleError, setScheduleError] = useState("");
  const [clientId, setClientId] = useState("");
  const [clientSecret, setClientSecret] = useState("");

  const revokeCredentials = (credentialsId: string) => {
    revoker.submit(
      { credentialsId, action: REVOKE_CREDENTIALS_ACTION },
      { method: "post" }
    );
  };

  const isCredentialsRevoking = (credentialsId: string) =>
    revoker.state === "submitting" &&
    revoker.formData?.get("credentialsId") === credentialsId;

  const issueTokens = async (clientId: string, clientSecret: string) => {
    tokensIssuer.submit(
      {
        clientId,
        clientSecret,
      },
      { method: "post", action: "/auth" }
    );
  };

  const testToken = async (token: string) => {
    try {
      setLoadingSchedule(true);
      const res = await fetch("/api/schedule", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const schedule = await res.json();

      if (!res.ok) {
        setScheduleError(schedule.message);
        setSchedule([]);
      } else {
        setScheduleError("");
        setSchedule(schedule);
      }
    } catch (err: any) {
      console.error(err);
      setScheduleError(err.message);
    } finally {
      setLoadingSchedule(false);
    }
  };

  return (
    <Container>
      <Box>
        <Typography variant="h2" color="primary">
          API Dashboard
        </Typography>
        <Typography variant="h5">
          Welcome to the API Dashboard. In this area you can manage your API
          credentials.
        </Typography>
      </Box>
      <Box>
        <Form method="post">
          <TextField
            sx={{ display: "none" }}
            value={CREATE_CREDENTIALS_ACTION}
            name="action"
          />
          <TextField
            margin="normal"
            sx={{
              mr: 2,
              minWidth: 300,
            }}
            error={!!actionData?.errorFields?.name}
            helperText={actionData?.errorFields?.name}
            required
            label="Name"
            name="name"
            type="text"
            autoComplete="name"
            autoFocus
          />
          <Button
            type="submit"
            variant="contained"
            disabled={navigation.state === "submitting"}
            sx={{ mt: 3, mb: 2 }}
          >
            {navigation.state === "submitting" && "Creating..."}
            {navigation.state !== "submitting" && "New Credentials"}
          </Button>
        </Form>
      </Box>
      {credentials.length > 0 && (
        <TableContainer component={Paper}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Client ID</TableCell>
                <TableCell>Client Secret</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {credentials.map((credential) => (
                <TableRow hover key={credential.id}>
                  <TableCell>{credential.name}</TableCell>
                  <TableCell>
                    <CopyToClipboardButton text={credential.clientId} />
                    {credential.clientId}
                  </TableCell>
                  <TableCell>
                    <CopyToClipboardButton text={credential.clientSecret} />
                    {credential.clientSecret}
                  </TableCell>
                  <TableCell>{credential.status}</TableCell>
                  <TableCell>
                    {credential.status !== "revoked" && (
                      <Button
                        disabled={isCredentialsRevoking(credential.id)}
                        onClick={() => revokeCredentials(credential.id)}
                      >
                        {isCredentialsRevoking(credential.id)
                          ? "Revoking..."
                          : "Revoke"}
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      <Box sx={{ mt: 2 }}>
        <Typography variant="h5">Issue tokens</Typography>
        <TextField
          margin="normal"
          sx={{
            mr: 2,
            minWidth: 300,
          }}
          required
          label="Client ID"
          name="clientId"
          type="text"
          autoComplete="Client ID"
          autoFocus
          value={clientId}
          onChange={(e) => setClientId(e.target.value)}
        />
        <TextField
          margin="normal"
          required
          sx={{
            mr: 2,
            minWidth: 300,
          }}
          label="Client Secret"
          name="clientSecret"
          type="text"
          autoComplete="Client Secret"
          autoFocus
          value={clientSecret}
          onChange={(e) => setClientSecret(e.target.value)}
        />
        <Button
          onClick={() => issueTokens(clientId, clientSecret)}
          variant="contained"
          disabled={tokensIssuer.state === "submitting"}
          sx={{ mt: 3, mb: 2 }}
        >
          {tokensIssuer.state === "submitting" && "Issuing..."}
          {tokensIssuer.state !== "submitting" && "Issue tokens"}
        </Button>
      </Box>
      {tokensIssuer.data?.accessToken && tokensIssuer.data?.refreshToken && (
        <Box>
          <Typography variant="h6">Tokens</Typography>
          <Typography>Access token</Typography>
          <Typography
            sx={{
              whiteSpace: "nowrap",
              textOverflow: "ellipsis",
              overflow: "hidden",
            }}
          >
            <CopyToClipboardButton text={tokensIssuer.data.accessToken} />
            {tokensIssuer.data.accessToken}
          </Typography>
          <Typography>Refresh token</Typography>
          <Typography
            sx={{
              whiteSpace: "nowrap",
              textOverflow: "ellipsis",
              overflow: "hidden",
            }}
          >
            <CopyToClipboardButton text={tokensIssuer.data.refreshToken} />
            {tokensIssuer.data.refreshToken}
          </Typography>
        </Box>
      )}
      {tokensIssuer.data?.error && (
        <Box>
          <Typography variant="h6" color="error">
            Error
          </Typography>
          <Typography color="error">{tokensIssuer.data.error}</Typography>
        </Box>
      )}

      <Box sx={{ mt: 2 }}>
        <Typography variant="h5">Test your API token</Typography>
        <TextField
          margin="normal"
          sx={{
            mr: 2,
            minWidth: 300,
          }}
          required
          label="Token"
          name="token"
          type="text"
          autoComplete="token"
          autoFocus
          value={token}
          onChange={(e) => setToken(e.target.value)}
        />
        <Button
          onClick={() => testToken(token)}
          variant="contained"
          disabled={loadingSchedule}
          sx={{ mt: 3, mb: 2 }}
        >
          {loadingSchedule && "Testing..."}
          {!loadingSchedule && "Test token"}
        </Button>
      </Box>
      {schedule.length > 0 && (
        <Box>
          <Typography variant="h6">Test result</Typography>
          <Typography>{JSON.stringify(schedule)}</Typography>
        </Box>
      )}
      {scheduleError && (
        <Box>
          <Typography variant="h6" color="error">
            Error
          </Typography>
          <Typography color="error">{scheduleError}</Typography>
        </Box>
      )}
    </Container>
  );
}
