# GCP Deployment Guide

This repo is best deployed on a small `Compute Engine` VM with `Secret Manager`.

Reason:

- the app persists content in `SQLite`
- the admin uploads images to the local filesystem
- a VM keeps both behaviors simple and durable for an assignment/demo deployment

If you later want autoscaling containers, move the database to Cloud SQL and the uploads to object storage first.

## 1. Create or select a GCP project

```bash
gcloud config set project YOUR_PROJECT_ID
```

## 2. Enable the required APIs

```bash
gcloud services enable \
  compute.googleapis.com \
  secretmanager.googleapis.com
```

## 3. Create the secrets

Required:

```bash
printf '%s' "$(openssl rand -hex 32)" | \
  gcloud secrets create davidbinneundev-app-session-secret --data-file=-
```

Optional SMTP secrets:

```bash
printf '%s' 'smtp.example.com' | \
  gcloud secrets create davidbinneundev-smtp-host --data-file=-

printf '%s' '587' | \
  gcloud secrets create davidbinneundev-smtp-port --data-file=-

printf '%s' 'smtp-user' | \
  gcloud secrets create davidbinneundev-smtp-user --data-file=-

printf '%s' 'smtp-password' | \
  gcloud secrets create davidbinneundev-smtp-pass --data-file=-

printf '%s' 'noreply@example.com' | \
  gcloud secrets create davidbinneundev-email-from --data-file=-
```

If you already created the secret names and only need a new value, use:

```bash
printf '%s' 'new-value' | gcloud secrets versions add SECRET_NAME --data-file=-
```

## 4. Create the VM

Example:

```bash
gcloud compute instances create davidbinneundev-vm \
  --zone=us-central1-a \
  --machine-type=e2-micro \
  --tags=http-server,https-server \
  --scopes=https://www.googleapis.com/auth/cloud-platform
```

The VM needs a service account with permission to read the secrets.

Minimum IAM role:

- `roles/secretmanager.secretAccessor`

## 5. Install Docker, Git, and gcloud on the VM

SSH into the VM:

```bash
gcloud compute ssh davidbinneundev-vm --zone=us-central1-a
```

Then install the basics:

```bash
sudo apt-get update
sudo apt-get install -y docker.io git apt-transport-https ca-certificates gnupg curl
curl https://packages.cloud.google.com/apt/doc/apt-key.gpg | sudo gpg --dearmor -o /usr/share/keyrings/cloud.google.gpg
echo "deb [signed-by=/usr/share/keyrings/cloud.google.gpg] https://packages.cloud.google.com/apt cloud-sdk main" | sudo tee /etc/apt/sources.list.d/google-cloud-sdk.list
sudo apt-get update
sudo apt-get install -y google-cloud-cli
sudo systemctl enable --now docker
sudo usermod -aG docker "$USER"
newgrp docker
```

## 6. Clone the repo

```bash
git clone YOUR_REPO_URL /opt/davidbinneundev
cd /opt/davidbinneundev
```

## 7. Deploy

Run:

```bash
./infra/gce/deploy.sh
```

What the script does:

- reads secrets from Secret Manager
- writes a local `.env`
- builds the Docker image
- starts the app container
- mounts persistent host folders for:
  - `/app/data`
  - `/app/uploads`

Because the database folder is mounted from the VM host, the site data survives container restarts.

On the first boot, the app imports the Base44 CSV export automatically.

## 8. Open the site

Find the public IP:

```bash
gcloud compute instances describe davidbinneundev-vm \
  --zone=us-central1-a \
  --format='get(networkInterfaces[0].accessConfigs[0].natIP)'
```

Then open:

```text
http://VM_PUBLIC_IP/
```

Admin login:

```text
http://VM_PUBLIC_IP/admin/login
```

## Notes

- If SMTP secrets are missing, contact messages are stored but not emailed.
- If you later attach a custom domain, point it to the VM IP and place Nginx or Caddy in front of the container for TLS.
- This deployment path is chosen to preserve the current SQLite + local-uploads behavior exactly, which is useful for the assignment.
