# Panduan Deployment & Simulasi Cloud Computing (AWS & Docker)
## MotoRent Cloud — CAK3EAB3 Komputasi Awan dan Terdistribusi
### Institut Teknologi Telkom Purwokerto (Telkom University Purwokerto)

---

## 1. Arsitektur Cloud & Distributed Computing

MotoRent Cloud dirancang dengan arsitektur terdistribusi *decoupled* (Frontend & Backend terpisah) yang siap di-deploy pada infrastruktur **Amazon Web Services (AWS)** dengan prinsip High Availability (HA) dan Fault Tolerance.

```
                         [ Pengguna / Web Browser ]
                                     |
               +---------------------+---------------------+
               |                                           |
      (Static Assets: /*)                         (REST API: /api/*)
               |                                           |
               v                                           v
     +-------------------+                     +-----------------------+
     |   Amazon S3 +     |                     |    AWS Application    |
     | Amazon CloudFront |                     |  Load Balancer (ALB)  |
     | (Frontend React)  |                     +-----------+-----------+
     +-------------------+                                 |
                                             +-------------+-------------+
                               (Round-Robin) |                           |
                                             v                           v
                                  +---------------------+     +---------------------+
                                  |   AWS EC2 Node 1    |     |   AWS EC2 Node 2    |
                                  | (AZ: ap-southeast-3a) |   | (AZ: ap-southeast-3b) |
                                  |   FastAPI + Store   |     |   FastAPI + Store   |
                                  |  ID: ec2-node1      |     |  ID: ec2-node2      |
                                  +---------------------+     +---------------------+
```

### Komponen Arsitektur:
1. **Frontend Hosting (S3 + CloudFront CDN)**:
   - React 18 SPA dibuild menjadi file statis (`HTML`, `CSS`, `JS`).
   - Disajikan secara global melalui AWS CloudFront dengan latensi rendah dan caching edge.
2. **Reverse Proxy & Load Balancer (AWS ALB / Nginx)**:
   - Menerima request ke endpoint `/api/*`.
   - Mendistribusikan beban trafik secara merata menggunakan algoritma **Round-Robin** ke beberapa instance backend.
   - Melakukan *Health Check* berkala ke endpoint `/api/info`.
3. **Backend Compute Nodes (AWS EC2 / Docker Containers)**:
   - Berjalan pada beberapa Availability Zone (Multi-AZ) untuk menjamin *Fault Tolerance*.
   - Setiap instance menyematkan identitas uniknya (`X-Instance-Id`) ke setiap response HTTP untuk pembuktian *load distribution*.
4. **In-Memory Thread-Safe Persistence**:
   - Sesuai batasan proyek kuliah (tanpa database eksternal SQL/NoSQL), data disimpan dalam memori Python dengan sinkronisasi thread-safe berkala ke `store.json`.

---

## 2. Pengujian & Demonstrasi Lokal (Docker Compose)

Untuk keperluan pengujian, penilaian dosen/asisten, atau simulasi di lingkungan lokal tanpa biaya AWS, proyek ini dilengkapi dengan arsitektur multi-node menggunakan **Docker Compose** dan **Nginx Load Balancer**.

### A. Prasyarat
- Docker Desktop aktif.
- Node.js (>= 18) untuk build frontend.

### B. Langkah Menjalankan Simulasi
1. Build aset frontend produksi:
   ```bash
   cd frontend
   npm install
   npm run build
   cd ..
   ```

2. Jalankan kluster multi-node dan Load Balancer:
   ```bash
   docker compose up --build
   ```

3. Periksa layanan yang aktif:
   - **Load Balancer (Nginx)**: `http://localhost:8080`
   - **Backend Node 1**: `http://localhost:8001` (`INSTANCE_ID=ec2-ap-southeast-3a-node1`)
   - **Backend Node 2**: `http://localhost:8002` (`INSTANCE_ID=ec2-ap-southeast-3b-node2`)

### C. Pembuktian Load Balancing (Round-Robin)
Buka terminal baru dan jalankan pengujian loop curl untuk melihat rotasi instance secara langsung:

**Linux / macOS / Git Bash:**
```bash
for i in {1..6}; do
  curl -sI http://localhost:8080/api/info | grep -i x-instance-id
done
```

**PowerShell (Windows):**
```powershell
1..6 | ForEach-Object {
    (Invoke-WebRequest -Uri "http://localhost:8080/api/info" -Method Head).Headers["X-Instance-Id"]
}
```

**Hasil Ekspektasi Output:**
```text
ec2-ap-southeast-3a-node1
ec2-ap-southeast-3b-node2
ec2-ap-southeast-3a-node1
ec2-ap-southeast-3b-node2
ec2-ap-southeast-3a-node1
ec2-ap-southeast-3b-node2
```
*Output di atas membuktikan bahwa request didistribusikan secara bergantian 50:50 (Round-Robin) oleh Load Balancer.*

Pada antarmuka Web (`http://localhost:8080`), perhatikan badge **Node** di sudut kanan atas navbar. Badge tersebut akan menampilkan instance ID node yang memproses request telemetry Anda secara dinamis.

---

## 3. Langkah Deployment Produksi ke AWS

Jika ingin men-deploy sistem secara riil ke cloud publik AWS (Jakarta Region: `ap-southeast-3`), ikuti panduan langkah demi langkah berikut:

### Bagian 1: Deployment Backend ke AWS EC2 (Multi-Instance)

1. **Buat Security Group (`motorent-backend-sg`)**:
   - Inbound Rule 1: SSH (Port 22) dari IP Anda.
   - Inbound Rule 2: Custom TCP (Port 8000) dari Security Group ALB.

2. **Luncurkan EC2 Instance 1 (AZ: `ap-southeast-3a`)**:
   - AMI: Ubuntu Server 22.04 LTS (HVM), SSD Volume Type.
   - Instance Type: `t3.micro` (Free Tier eligible).
   - Subnet: Public Subnet AZ `ap-southeast-3a`.
   - Masukkan script berikut ke dalam **User Data (Advanced Details)** saat peluncuran:

   ```bash
   #!/bin/bash
   apt-get update -y
   apt-get install -y python3-pip python3-venv git

   # Setup direktori aplikasi
   mkdir -p /opt/motorent
   cd /opt/motorent
   git clone https://github.com/Pongo/MotoRent-Cloud.git .
   cd backend

   # Setup Python virtualenv
   python3 -m venv .venv
   source .venv/bin/activate
   pip install --upgrade pip
   pip install -r requirements.txt

   # Buat systemd service
   cat << 'EOF' > /etc/systemd/system/motorent.service
   [Unit]
   Description=MotoRent Cloud FastAPI Backend
   After=network.target

   [Service]
   User=ubuntu
   WorkingDirectory=/opt/motorent/backend
   Environment="PATH=/opt/motorent/backend/.venv/bin"
   Environment="INSTANCE_ID=ec2-ap-southeast-3a-node1"
   Environment="ALLOWED_ORIGINS=*"
   ExecStart=/opt/motorent/backend/.venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8000 --proxy-headers --forwarded-allow-ips="*"
   Restart=always

   [Install]
   WantedBy=multi-user.target
   EOF

   systemctl daemon-reload
   systemctl enable motorent.service
   systemctl start motorent.service
   ```

3. **Luncurkan EC2 Instance 2 (AZ: `ap-southeast-3b`)**:
   - Lakukan langkah yang sama seperti Instance 1, namun pada Subnet AZ `ap-southeast-3b`.
   - Pada script User Data, ubah environment variabel:
     ```bash
     Environment="INSTANCE_ID=ec2-ap-southeast-3b-node2"
     ```

---

### Bagian 2: Konfigurasi AWS Application Load Balancer (ALB)

1. **Buat Target Group (`motorent-tg`)**:
   - Target type: `Instances`
   - Protocol: `HTTP`, Port: `8000`
   - VPC: Default VPC
   - Health check path: `/api/info`
   - Daftarkan kedua EC2 instance yang telah dibuat ke dalam Target Group. Tunggu hingga statusnya menjadi **Healthy**.

2. **Buat Application Load Balancer (`motorent-alb`)**:
   - Scheme: `Internet-facing`
   - IP address type: `IPv4`
   - Mappings: Pilih minimal 2 Availability Zones (`ap-southeast-3a` dan `ap-southeast-3b`).
   - Security Group: Buka Inbound HTTP (Port 80) dari `0.0.0.0/0`.
   - Listeners: HTTP Port 80 forward ke `motorent-tg`.

3. **Verifikasi Algoritma Load Balancing**:
   - Buka atribut Target Group, pastikan Routing algorithm diatur ke **Round robin** (atau **Least outstanding requests** untuk beban dinamis).
   - Simpan DNS Name ALB (contoh: `motorent-alb-123456.ap-southeast-3.elb.amazonaws.com`).

---

### Bagian 3: Deployment Frontend ke AWS S3 & CloudFront

1. **Build Frontend dengan URL Backend ALB**:
   ```bash
   cd frontend
   # Mengarahkan request API ke ALB publik AWS
   export VITE_API_BASE_URL="http://motorent-alb-123456.ap-southeast-3.elb.amazonaws.com"
   npm run build
   ```

2. **Buat S3 Bucket (`motorent-cloud-web`)**:
   - Nonaktifkan "Block all public access" (atau gunakan CloudFront Origin Access Control / OAC).
   - Aktifkan **Static website hosting**:
     - Index document: `index.html`
     - Error document: `index.html`

3. **Upload File Hasil Build ke S3**:
   ```bash
   aws s3 sync dist/ s3://motorent-cloud-web/ --delete
   ```

4. **Konfigurasi CloudFront Distribution (Opsional & Direkomendasikan)**:
   - Origin Domain: Pilih S3 Bucket `motorent-cloud-web`.
   - Viewer Protocol Policy: `Redirect HTTP to HTTPS`.
   - Custom Error Response: Kode 403 & 404 diarahkan ke `/index.html` dengan response code 200 (untuk client-side routing SPA).

---

## 4. Pembahasan Evaluasi Akademik (Materi Kuliah)

| Aspek Komputasi Awan | Implementasi pada MotoRent Cloud |
| :--- | :--- |
| **Decoupled Architecture** | Memisahkan UI presentation layer (React) dan business logic/data layer (FastAPI) sehingga dapat diskalakan secara independen (*Elastic Scalability*). |
| **Stateless Compute & Telemetry** | Server backend tidak menyimpan session pengguna di server memory secara terikat; setiap instance mengembalikan identitas via header `X-Instance-Id`. |
| **Load Balancing Algorithm** | Menggunakan algoritma **Round-Robin** untuk mendistribusikan beban secara merata pada kluster backend multi-node. Mendukung transisi ke **Least Connections**. |
| **Fault Tolerance & Health Checks** | Load balancer memantau ketersediaan node melalui endpoint `/api/info`. Jika salah satu instance mengalami crash/mati, trafik dialihkan secara otomatis ke node sehat tanpa *downtime*. |
| **Reverse Proxy Security** | Menerapkan proteksi IP melalui header `X-Forwarded-For` dan validasi CORS untuk mencegah serangan unauthorized cross-origin. |
