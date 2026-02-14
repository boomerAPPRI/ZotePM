# Admin Management Guide

## How to Make a User an Admin

To grant admin privileges to a user, you must update their role in the database directly.

### 1. Get the Database IP Address
Run the following command to find the public IPv4 address of the Cloud SQL instance:

```powershell
gcloud sql instances describe appri-db-2 --format="value(ipAddresses[0].ipAddress)"
```
*Example Output:* `34.58.119.156`

### 2. Connect and Update Role
Use `psql` to connect to the database host and run the update query.

**Command Template:**
```powershell
psql "host=[DB_IP] user=postgres password=SecureP@ssw0rd2025! dbname=appri" -c "UPDATE users SET role = 'admin' WHERE email = '[USER_EMAIL]';"
```

**Example:**
```powershell
psql "host=34.58.119.156 user=postgres password=SecureP@ssw0rd2025! dbname=appri" -c "UPDATE users SET role = 'admin' WHERE email = 'dennis.weng@asiapacificpeace.org';"
```

### 3. Verification
You should see `UPDATE 1` as the output, indicating one user was updated.

---

## Troubleshooting Connectivity

### "Connection Refused" or Timeout
*   **Cause**: Your IP address is not authorized to connect to the Cloud SQL instance.
*   **Fix**: Go to the Google Cloud Console -> SQL -> `appri-db-2` -> Connections -> Networking, and add your current public IP to the "Authorized networks".

### "Password Authentication Failed"
*   **Cause**: Incorrect password in the command.
*   **Fix**: Verify the password in `server/app.yaml` or reset it in the Google Cloud Console.
