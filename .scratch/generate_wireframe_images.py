import os
import subprocess
from pathlib import Path

# Base styling for all low-fi wireframes
BASE_CSS = """
* {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
}
body {
    background-color: #e9ecef;
    color: #212529;
    padding: 24px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    min-height: 100vh;
}
.wireframe-container {
    width: 1240px;
    background: #ffffff;
    border: 2px solid #adb5bd;
    border-radius: 10px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
    overflow: hidden;
    position: relative;
}
/* Browser frame mock */
.browser-header {
    background: #f1f3f5;
    border-bottom: 2px solid #ced4da;
    padding: 10px 16px;
    display: flex;
    align-items: center;
    gap: 12px;
}
.browser-dots {
    display: flex;
    gap: 6px;
}
.browser-dot {
    width: 11px;
    height: 11px;
    border-radius: 50%;
    background: #ced4da;
    border: 1px solid #adb5bd;
}
.browser-url {
    background: #ffffff;
    border: 1px solid #ced4da;
    border-radius: 6px;
    padding: 4px 14px;
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    font-size: 11px;
    color: #495057;
    width: 480px;
}
.wireframe-tag {
    margin-left: auto;
    background: #212529;
    color: #ffffff;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.8px;
    padding: 3px 10px;
    border-radius: 4px;
    text-transform: uppercase;
}
/* App Navbar */
.app-navbar {
    background: #ffffff;
    border-bottom: 1.5px solid #dee2e6;
    padding: 12px 28px;
    display: flex;
    align-items: center;
    justify-content: space-between;
}
.brand-area {
    display: flex;
    align-items: center;
    gap: 12px;
}
.brand-logo-mock {
    width: 36px;
    height: 36px;
    border: 1.5px solid #212529;
    border-radius: 8px;
    background: #f8f9fa;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 11px;
    font-weight: bold;
    position: relative;
    overflow: hidden;
}
.brand-title {
    font-size: 18px;
    font-weight: 800;
    color: #212529;
    display: flex;
    align-items: center;
    gap: 6px;
}
.brand-tag {
    font-size: 10px;
    font-weight: 700;
    background: #e9ecef;
    border: 1px solid #ced4da;
    padding: 1px 6px;
    border-radius: 12px;
    color: #495057;
}
.brand-sub {
    font-size: 10px;
    color: #868e96;
    font-weight: 500;
}
.nav-pills {
    display: flex;
    gap: 6px;
    background: #f1f3f5;
    padding: 4px;
    border-radius: 8px;
    border: 1px solid #dee2e6;
}
.nav-pill {
    padding: 6px 14px;
    font-size: 12px;
    font-weight: 600;
    color: #495057;
    border-radius: 6px;
    border: none;
    background: transparent;
}
.nav-pill.active {
    background: #ffffff;
    color: #212529;
    border: 1px solid #ced4da;
    box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}
.nav-actions {
    display: flex;
    align-items: center;
    gap: 10px;
}
.btn-wire {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding: 6px 14px;
    font-size: 12px;
    font-weight: 600;
    border-radius: 6px;
    border: 1.5px solid #212529;
    background: #212529;
    color: #ffffff;
}
.btn-wire-outline {
    background: #ffffff;
    border: 1.5px solid #ced4da;
    color: #212529;
}
.btn-wire-outline:hover {
    border-color: #212529;
}
.node-badge {
    background: #212529;
    color: #adb5bd;
    font-family: monospace;
    font-size: 10px;
    padding: 4px 10px;
    border-radius: 6px;
    display: flex;
    align-items: center;
    gap: 6px;
}
.node-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #51cf66;
}
/* Main Content */
.main-content {
    padding: 24px 28px;
    background: #f8f9fa;
    min-height: 600px;
}
/* Image Placeholder Box with Diagonal X */
.img-placeholder {
    background: #f1f3f5;
    border: 1.5px dashed #adb5bd;
    border-radius: 6px;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
}
.img-placeholder svg {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
}
.img-placeholder svg line {
    stroke: #ced4da;
    stroke-width: 1.5;
}
.placeholder-label {
    position: relative;
    z-index: 2;
    background: #ffffff;
    border: 1px solid #ced4da;
    padding: 3px 8px;
    border-radius: 4px;
    font-size: 10px;
    font-weight: 700;
    color: #6c757d;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}
/* General Elements */
.card-wire {
    background: #ffffff;
    border: 1.5px solid #dee2e6;
    border-radius: 8px;
    padding: 16px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.02);
}
.text-bar {
    height: 8px;
    background: #dee2e6;
    border-radius: 4px;
    margin-bottom: 6px;
}
.app-footer {
    background: #ffffff;
    border-top: 1.5px solid #dee2e6;
    padding: 14px 28px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 11px;
    color: #868e96;
}
"""

def generate_svg_x(label):
    return f"""
    <div class="img-placeholder" style="width: 100%; height: 100%;">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none">
            <line x1="0" y1="0" x2="100" y2="100" />
            <line x1="0" y1="100" x2="100" y2="0" />
        </svg>
        <span class="placeholder-label">{label}</span>
    </div>
    """

def create_dashboard_html():
    return f"""<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>Wireframe 01 - Dashboard</title>
<style>
{BASE_CSS}
.hero-box {{
    background: #ffffff;
    border: 2px dashed #adb5bd;
    border-radius: 10px;
    padding: 28px;
    margin-bottom: 24px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20px;
}}
.stats-grid {{
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
    margin-bottom: 24px;
}}
.stat-card {{
    background: #ffffff;
    border: 1.5px solid #dee2e6;
    border-radius: 8px;
    padding: 16px;
}}
.fleet-grid {{
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 18px;
}}
.fleet-card {{
    background: #ffffff;
    border: 1.5px solid #dee2e6;
    border-radius: 8px;
    overflow: hidden;
    padding: 14px;
    display: flex;
    flex-direction: column;
    gap: 12px;
}}
</style>
</head>
<body>
<div class="wireframe-container">
    <div class="browser-header">
        <div class="browser-dots">
            <div class="browser-dot"></div>
            <div class="browser-dot"></div>
            <div class="browser-dot"></div>
        </div>
        <div class="browser-url">http://localhost:8080/dashboard</div>
        <div class="wireframe-tag">WIREFRAME 01 • DASHBOARD UTAMA (GUEST & CUSTOMER)</div>
    </div>

    <div class="app-navbar">
        <div class="brand-area">
            <div class="brand-logo-mock">M</div>
            <div>
                <div class="brand-title">MotoRent <span class="brand-tag">Cloud</span></div>
                <div class="brand-sub">CAK3EAB3 Komputasi Awan Terdistribusi</div>
            </div>
        </div>
        <div class="nav-pills">
            <button class="nav-pill active">Dashboard</button>
            <button class="nav-pill">Katalog Armada</button>
            <button class="nav-pill">Data Pelanggan*</button>
            <button class="nav-pill">Transaksi Sewa*</button>
        </div>
        <div class="nav-actions">
            <button class="btn-wire btn-wire-outline">Masuk</button>
            <button class="btn-wire">Daftar</button>
            <div class="node-badge"><span class="node-dot"></span> Node: ec2-ap-southeast-3a-node1</div>
        </div>
    </div>

    <div class="main-content">
        <!-- Hero Banner Wireframe -->
        <div class="hero-box">
            <div style="flex: 1;">
                <div style="display: inline-block; font-size: 10px; font-weight: 700; background: #e9ecef; border: 1px solid #ced4da; padding: 2px 8px; border-radius: 4px; margin-bottom: 10px;">
                    INFRASTRUKTUR CLOUD AKTIF • MULTI-AZ AWS
                </div>
                <h1 style="font-size: 22px; font-weight: 800; margin-bottom: 8px;">SEWA KENDARAAN CEPAT, TRANSPARAN, DAN SIAP JALAN</h1>
                <p style="font-size: 12px; color: #6c757d; margin-bottom: 16px; max-width: 650px; line-height: 1.5;">
                    Pusat rental motor dan mobil terpercaya dengan arsitektur komputasi awan terdistribusi. Tanpa database SQL eksternal, performa cepat dengan in-memory JSON thread-safe.
                </p>
                <div style="display: flex; gap: 10px;">
                    <button class="btn-wire">Jelajahi Armada &rarr;</button>
                    <button class="btn-wire btn-wire-outline">Daftar Akun Pelanggan</button>
                </div>
            </div>
            <div style="width: 220px; height: 110px;">
                {generate_svg_x("Cloud Hero Vector")}
            </div>
        </div>

        <!-- 4 Quick Stats Cards -->
        <div class="stats-grid">
            <div class="stat-card">
                <div style="font-size: 11px; font-weight: 600; color: #868e96; text-transform: uppercase;">Total Armada</div>
                <div style="font-size: 24px; font-weight: 800; margin: 4px 0;">5 Unit</div>
                <div style="font-size: 10px; color: #6c757d;">Motor & Mobil Siap Pakai</div>
            </div>
            <div class="stat-card">
                <div style="font-size: 11px; font-weight: 600; color: #868e96; text-transform: uppercase;">Unit Tersedia</div>
                <div style="font-size: 24px; font-weight: 800; margin: 4px 0; color: #2b8a3e;">5 Unit</div>
                <div style="font-size: 10px; color: #6c757d;">Bisa Langsung Di-booking</div>
            </div>
            <div class="stat-card">
                <div style="font-size: 11px; font-weight: 600; color: #868e96; text-transform: uppercase;">Sedang Disewa</div>
                <div style="font-size: 24px; font-weight: 800; margin: 4px 0; color: #e67700;">0 Unit</div>
                <div style="font-size: 10px; color: #6c757d;">Transaksi Aktif Berjalan</div>
            </div>
            <div class="stat-card">
                <div style="font-size: 11px; font-weight: 600; color: #868e96; text-transform: uppercase;">Pelanggan Aktif</div>
                <div style="font-size: 24px; font-weight: 800; margin: 4px 0;">3 Orang</div>
                <div style="font-size: 10px; color: #6c757d;">SIM Terverifikasi</div>
            </div>
        </div>

        <!-- Catalog Filter Bar -->
        <div style="background: #ffffff; border: 1.5px solid #dee2e6; border-radius: 8px; padding: 12px 16px; margin-bottom: 20px; display: flex; align-items: center; justify-content: space-between;">
            <div style="display: flex; gap: 8px;">
                <button class="btn-wire" style="padding: 4px 12px; font-size: 11px;">Semua Kategori</button>
                <button class="btn-wire btn-wire-outline" style="padding: 4px 12px; font-size: 11px;">Motor</button>
                <button class="btn-wire btn-wire-outline" style="padding: 4px 12px; font-size: 11px;">Mobil</button>
            </div>
            <div style="display: flex; gap: 8px;">
                <input type="text" placeholder="Cari armada atau plat..." style="border: 1px solid #ced4da; border-radius: 6px; padding: 5px 12px; font-size: 11px; width: 220px;" disabled>
                <select style="border: 1px solid #ced4da; border-radius: 6px; padding: 5px 10px; font-size: 11px;" disabled>
                    <option>Semua Status</option>
                </select>
            </div>
        </div>

        <!-- 3 Vehicle Cards in Grid -->
        <div class="fleet-grid">
            <!-- Card 1 -->
            <div class="fleet-card">
                <div style="height: 120px;">
                    {generate_svg_x("Foto Yamaha NMAX")}
                </div>
                <div>
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                        <span style="font-size: 10px; font-weight: 700; background: #e9ecef; border: 1px solid #ced4da; padding: 1px 6px; border-radius: 4px;">Motor</span>
                        <span style="font-size: 10px; font-weight: 700; color: #2b8a3e; border: 1px solid #b2f2bb; background: #ebfbee; padding: 1px 6px; border-radius: 4px;">Tersedia</span>
                    </div>
                    <div style="font-size: 14px; font-weight: 800;">Yamaha NMAX 155</div>
                    <div style="font-size: 10px; font-family: monospace; color: #868e96;">R 1234 AB • ID: VEH-001</div>
                </div>
                <div style="display: flex; justify-content: space-between; align-items: flex-end; border-top: 1px solid #f1f3f5; padding-top: 10px;">
                    <div>
                        <div style="font-size: 9px; color: #868e96;">Tarif Harian</div>
                        <div style="font-size: 14px; font-weight: 800; color: #212529;">Rp 120.000<span style="font-size: 10px; font-weight: 500; color: #868e96;">/hari</span></div>
                    </div>
                    <button class="btn-wire" style="padding: 6px 12px; font-size: 11px;">Sewa Sekarang</button>
                </div>
            </div>

            <!-- Card 2 -->
            <div class="fleet-card">
                <div style="height: 120px;">
                    {generate_svg_x("Foto Honda Vario")}
                </div>
                <div>
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                        <span style="font-size: 10px; font-weight: 700; background: #e9ecef; border: 1px solid #ced4da; padding: 1px 6px; border-radius: 4px;">Motor</span>
                        <span style="font-size: 10px; font-weight: 700; color: #2b8a3e; border: 1px solid #b2f2bb; background: #ebfbee; padding: 1px 6px; border-radius: 4px;">Tersedia</span>
                    </div>
                    <div style="font-size: 14px; font-weight: 800;">Honda Vario 160</div>
                    <div style="font-size: 10px; font-family: monospace; color: #868e96;">R 5678 CD • ID: VEH-002</div>
                </div>
                <div style="display: flex; justify-content: space-between; align-items: flex-end; border-top: 1px solid #f1f3f5; padding-top: 10px;">
                    <div>
                        <div style="font-size: 9px; color: #868e96;">Tarif Harian</div>
                        <div style="font-size: 14px; font-weight: 800; color: #212529;">Rp 100.000<span style="font-size: 10px; font-weight: 500; color: #868e96;">/hari</span></div>
                    </div>
                    <button class="btn-wire" style="padding: 6px 12px; font-size: 11px;">Sewa Sekarang</button>
                </div>
            </div>

            <!-- Card 3 -->
            <div class="fleet-card">
                <div style="height: 120px;">
                    {generate_svg_x("Foto Toyota Avanza")}
                </div>
                <div>
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                        <span style="font-size: 10px; font-weight: 700; background: #e9ecef; border: 1px solid #ced4da; padding: 1px 6px; border-radius: 4px;">Mobil</span>
                        <span style="font-size: 10px; font-weight: 700; color: #2b8a3e; border: 1px solid #b2f2bb; background: #ebfbee; padding: 1px 6px; border-radius: 4px;">Tersedia</span>
                    </div>
                    <div style="font-size: 14px; font-weight: 800;">Toyota Avanza 1.5G</div>
                    <div style="font-size: 10px; font-family: monospace; color: #868e96;">B 1122 XYZ • ID: VEH-004</div>
                </div>
                <div style="display: flex; justify-content: space-between; align-items: flex-end; border-top: 1px solid #f1f3f5; padding-top: 10px;">
                    <div>
                        <div style="font-size: 9px; color: #868e96;">Tarif Harian</div>
                        <div style="font-size: 14px; font-weight: 800; color: #212529;">Rp 350.000<span style="font-size: 10px; font-weight: 500; color: #868e96;">/hari</span></div>
                    </div>
                    <button class="btn-wire" style="padding: 6px 12px; font-size: 11px;">Sewa Sekarang</button>
                </div>
            </div>
        </div>
    </div>

    <div class="app-footer">
        <div>&copy; 2026 MotoRent Cloud &bull; CAK3EAB3 Komputasi Awan dan Terdistribusi &bull; Telkom University Purwokerto</div>
        <div>FastAPI In-Memory JSON &bull; AWS Multi-AZ &amp; ALB Ready</div>
    </div>
</div>
</body>
</html>
"""

def create_login_html():
    return f"""<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>Wireframe 02 - Login</title>
<style>
{BASE_CSS}
.split-layout {{
    display: flex;
    min-height: 650px;
}}
.split-left {{
    flex: 1;
    background: #212529;
    color: #ffffff;
    padding: 48px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
}}
.split-right {{
    flex: 1.2;
    background: #ffffff;
    padding: 48px;
    display: flex;
    flex-direction: column;
    justify-content: center;
}}
.feature-box {{
    background: #343a40;
    border: 1px solid #495057;
    border-radius: 8px;
    padding: 14px;
    margin-bottom: 12px;
}}
.demo-capsule {{
    background: #f8f9fa;
    border: 1.5px dashed #adb5bd;
    border-radius: 8px;
    padding: 14px;
    margin-bottom: 20px;
}}
.form-group {{
    margin-bottom: 16px;
}}
.form-label {{
    display: block;
    font-size: 11px;
    font-weight: 700;
    margin-bottom: 6px;
    color: #495057;
    text-transform: uppercase;
}}
.form-input {{
    width: 100%;
    padding: 10px 14px;
    border: 1.5px solid #ced4da;
    border-radius: 6px;
    font-size: 13px;
    background: #ffffff;
    color: #212529;
}}
</style>
</head>
<body>
<div class="wireframe-container">
    <div class="browser-header">
        <div class="browser-dots">
            <div class="browser-dot"></div>
            <div class="browser-dot"></div>
            <div class="browser-dot"></div>
        </div>
        <div class="browser-url">http://localhost:8080/login</div>
        <div class="wireframe-tag">WIREFRAME 02 • HALAMAN LOGIN (SPLIT-SCREEN)</div>
    </div>

    <div class="split-layout">
        <!-- Left Pane: Branding & Value -->
        <div class="split-left">
            <div>
                <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 24px;">
                    <div style="width: 32px; height: 32px; border: 1.5px solid #ffffff; border-radius: 6px; display: flex; align-items: center; justify-content: center; font-weight: bold;">M</div>
                    <span style="font-size: 18px; font-weight: 800; letter-spacing: -0.5px;">MotoRent Cloud</span>
                </div>
                <h2 style="font-size: 24px; font-weight: 800; margin-bottom: 12px; line-height: 1.3;">Sistem Rental Kendaraan Berbasis Cloud Native</h2>
                <p style="font-size: 12px; color: #adb5bd; margin-bottom: 28px; line-height: 1.5;">
                    Arsitektur backend nir-database (In-Memory JSON) berkinerja tinggi yang disimulasikan pada kluster Multi-Availability Zone AWS.
                </p>

                <div class="feature-box">
                    <div style="font-size: 12px; font-weight: 700; margin-bottom: 4px;">&check; Multi-AZ High Availability</div>
                    <div style="font-size: 10px; color: #adb5bd;">Dua node backend terdistribusi aktif dengan Nginx Reverse Proxy / ALB.</div>
                </div>
                <div class="feature-box">
                    <div style="font-size: 12px; font-weight: 700; margin-bottom: 4px;">&check; Role-Based Access Control (RBAC)</div>
                    <div style="font-size: 10px; color: #adb5bd;">Hak akses terpisah aman untuk Administrator Armada dan Pelanggan Umum.</div>
                </div>
            </div>

            <div style="font-size: 10px; color: #6c757d; font-family: monospace; border-top: 1px solid #343a40; padding-top: 16px;">
                Node: ec2-ap-southeast-3a-node1 &bull; Status: OK (Healthy)
            </div>
        </div>

        <!-- Right Pane: Login Form -->
        <div class="split-right">
            <div style="max-width: 420px; width: 100%; margin: 0 auto;">
                <div style="margin-bottom: 20px;">
                    <h2 style="font-size: 22px; font-weight: 800; color: #212529;">Masuk ke Akun Anda</h2>
                    <p style="font-size: 12px; color: #6c757d;">Pilih akun demo cepat atau masukkan kredensial terdaftar.</p>
                </div>

                <!-- 1-Click Demo -->
                <div class="demo-capsule">
                    <div style="font-size: 10px; font-weight: 700; color: #6c757d; margin-bottom: 8px; text-transform: uppercase;">1-Click Quick Demo Login</div>
                    <div style="display: flex; gap: 8px;">
                        <button class="btn-wire btn-wire-outline" style="flex: 1; font-size: 11px; padding: 6px 8px;">⚡ Demo Admin</button>
                        <button class="btn-wire btn-wire-outline" style="flex: 1; font-size: 11px; padding: 6px 8px;">⚡ Demo Pelanggan (Andi)</button>
                    </div>
                </div>

                <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 20px;">
                    <div style="flex: 1; height: 1px; background: #dee2e6;"></div>
                    <span style="font-size: 10px; color: #868e96; text-transform: uppercase;">atau via email</span>
                    <div style="flex: 1; height: 1px; background: #dee2e6;"></div>
                </div>

                <div class="form-group">
                    <label class="form-label">Alamat Email</label>
                    <input type="email" class="form-input" value="andi@motorent.cloud" readonly>
                </div>

                <div class="form-group">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <label class="form-label">Kata Sandi</label>
                        <span style="font-size: 10px; color: #495057; text-decoration: underline; cursor: pointer;">Lupa password?</span>
                    </div>
                    <input type="password" class="form-input" value="••••••••" readonly>
                </div>

                <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 20px;">
                    <input type="checkbox" id="remember" checked disabled>
                    <label for="remember" style="font-size: 11px; color: #495057;">Ingat sesi saya di peramban ini</label>
                </div>

                <button class="btn-wire" style="width: 100%; padding: 10px; font-size: 13px; margin-bottom: 16px;">Masuk ke Sistem &rarr;</button>

                <div style="text-align: center; font-size: 11px; color: #6c757d;">
                    Belum memiliki akun? <span style="font-weight: 700; color: #212529; text-decoration: underline;">Daftar Akun Baru</span>
                </div>
            </div>
        </div>
    </div>

    <div class="app-footer">
        <div>&copy; 2026 MotoRent Cloud &bull; CAK3EAB3 Komputasi Awan dan Terdistribusi</div>
        <div>[ &larr; Kembali ke Beranda Tanpa Login ]</div>
    </div>
</div>
</body>
</html>
"""

def create_register_html():
    return f"""<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>Wireframe 03 - Register</title>
<style>
{BASE_CSS}
.split-layout {{
    display: flex;
    min-height: 650px;
}}
.split-left {{
    flex: 1;
    background: #212529;
    color: #ffffff;
    padding: 44px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
}}
.split-right {{
    flex: 1.3;
    background: #ffffff;
    padding: 36px 48px;
    display: flex;
    flex-direction: column;
    justify-content: center;
}}
.step-item {{
    display: flex;
    gap: 12px;
    margin-bottom: 16px;
}}
.step-num {{
    width: 24px;
    height: 24px;
    border-radius: 50%;
    border: 1.5px solid #ffffff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 11px;
    font-weight: bold;
    flex-shrink: 0;
}}
.form-grid {{
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 14px;
}}
.form-group {{
    margin-bottom: 12px;
}}
.form-label {{
    display: block;
    font-size: 11px;
    font-weight: 700;
    margin-bottom: 4px;
    color: #495057;
    text-transform: uppercase;
}}
.form-input {{
    width: 100%;
    padding: 8px 12px;
    border: 1.5px solid #ced4da;
    border-radius: 6px;
    font-size: 12px;
    background: #ffffff;
    color: #212529;
}}
</style>
</head>
<body>
<div class="wireframe-container">
    <div class="browser-header">
        <div class="browser-dots">
            <div class="browser-dot"></div>
            <div class="browser-dot"></div>
            <div class="browser-dot"></div>
        </div>
        <div class="browser-url">http://localhost:8080/register</div>
        <div class="wireframe-tag">WIREFRAME 03 • HALAMAN REGISTER (SPLIT-SCREEN)</div>
    </div>

    <div class="split-layout">
        <!-- Left Pane -->
        <div class="split-left">
            <div>
                <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 24px;">
                    <div style="width: 32px; height: 32px; border: 1.5px solid #ffffff; border-radius: 6px; display: flex; align-items: center; justify-content: center; font-weight: bold;">M</div>
                    <span style="font-size: 18px; font-weight: 800; letter-spacing: -0.5px;">MotoRent Cloud</span>
                </div>
                <h2 style="font-size: 22px; font-weight: 800; margin-bottom: 12px;">Mulai Sewa Kendaraan Impian Anda Hari Ini</h2>
                <p style="font-size: 12px; color: #adb5bd; margin-bottom: 32px; line-height: 1.5;">
                    Daftar akun pelanggan untuk menikmati kemudahan booking motor dan mobil secara instan, transparan, dan terintegrasi sistem cloud.
                </p>

                <div class="step-item">
                    <div class="step-num">1</div>
                    <div>
                        <div style="font-size: 12px; font-weight: 700;">Buat Profil Pelanggan</div>
                        <div style="font-size: 10px; color: #adb5bd;">Lengkapi identitas SIM dan kontak aktif WhatsApp.</div>
                    </div>
                </div>
                <div class="step-item">
                    <div class="step-num">2</div>
                    <div>
                        <div style="font-size: 12px; font-weight: 700;">Pilih Unit Armada</div>
                        <div style="font-size: 10px; color: #adb5bd;">Cek ketersediaan langsung di dashboard interaktif.</div>
                    </div>
                </div>
                <div class="step-item">
                    <div class="step-num">3</div>
                    <div>
                        <div style="font-size: 12px; font-weight: 700;">Booking &amp; Ambil Kunci</div>
                        <div style="font-size: 10px; color: #adb5bd;">Verifikasi otomatis tanpa antre, kendaraan siap jalan.</div>
                    </div>
                </div>
            </div>

            <div style="font-size: 10px; color: #adb5bd; border-top: 1px solid #343a40; padding-top: 16px;">
                Keamanan data terjamin dengan enkripsi password PBKDF2 SHA-256 standard industri.
            </div>
        </div>

        <!-- Right Pane: Form -->
        <div class="split-right">
            <div style="max-width: 480px; width: 100%; margin: 0 auto;">
                <div style="margin-bottom: 18px;">
                    <h2 style="font-size: 22px; font-weight: 800; color: #212529;">Daftar Akun Pelanggan Baru</h2>
                    <p style="font-size: 11px; color: #6c757d;">Lengkapi informasi data diri di bawah ini.</p>
                </div>

                <div class="form-group">
                    <label class="form-label">Nama Lengkap</label>
                    <input type="text" class="form-input" value="Budi Setiawan" readonly>
                </div>

                <div class="form-grid">
                    <div class="form-group">
                        <label class="form-label">Alamat Email</label>
                        <input type="email" class="form-input" value="budi.setiawan@gmail.com" readonly>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Nomor WhatsApp / HP</label>
                        <input type="text" class="form-input" value="081234567899" readonly>
                    </div>
                </div>

                <div class="form-group">
                    <label class="form-label">Nomor Surat Izin Mengemudi (SIM / KTP)</label>
                    <input type="text" class="form-input" value="SIM-3302198822001" readonly>
                </div>

                <div class="form-grid">
                    <div class="form-group">
                        <label class="form-label">Kata Sandi</label>
                        <input type="password" class="form-input" value="••••••••" readonly>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Konfirmasi Kata Sandi</label>
                        <input type="password" class="form-input" value="••••••••" readonly>
                    </div>
                </div>

                <div style="display: flex; align-items: flex-start; gap: 8px; margin: 14px 0 18px 0;">
                    <input type="checkbox" id="terms" checked disabled style="margin-top: 2px;">
                    <label for="terms" style="font-size: 10px; color: #495057; line-height: 1.4;">
                        Saya menyetujui Syarat &amp; Ketentuan rental kendaraan dan menjamin keaslian data SIM yang dilampirkan.
                    </label>
                </div>

                <button class="btn-wire" style="width: 100%; padding: 10px; font-size: 13px; margin-bottom: 14px;">Daftar Akun Pelanggan &rarr;</button>

                <div style="text-align: center; font-size: 11px; color: #6c757d;">
                    Sudah memiliki akun terdaftar? <span style="font-weight: 700; color: #212529; text-decoration: underline;">Masuk di sini</span>
                </div>
            </div>
        </div>
    </div>

    <div class="app-footer">
        <div>&copy; 2026 MotoRent Cloud &bull; CAK3EAB3 Komputasi Awan dan Terdistribusi</div>
        <div>[ &larr; Kembali ke Beranda ]</div>
    </div>
</div>
</body>
</html>
"""

def create_booking_modal_html():
    return f"""<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>Wireframe 04 - Booking Modal</title>
<style>
{BASE_CSS}
.backdrop {{
    position: relative;
    background: #e9ecef;
    min-height: 650px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 30px;
}}
.dimmed-bg {{
    position: absolute;
    top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(33, 37, 41, 0.45);
    z-index: 1;
}}
.modal-box {{
    position: relative;
    z-index: 2;
    background: #ffffff;
    border: 2px solid #212529;
    border-radius: 10px;
    width: 580px;
    box-shadow: 0 15px 35px rgba(0,0,0,0.25);
    overflow: hidden;
}}
.modal-header {{
    background: #f8f9fa;
    border-bottom: 1.5px solid #dee2e6;
    padding: 16px 20px;
    display: flex;
    align-items: center;
    justify-content: space-between;
}}
.modal-body {{
    padding: 20px;
}}
.modal-footer {{
    background: #f8f9fa;
    border-top: 1.5px solid #dee2e6;
    padding: 14px 20px;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 10px;
}}
.form-grid {{
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
}}
.calc-box {{
    background: #f1f3f5;
    border: 1.5px dashed #adb5bd;
    border-radius: 8px;
    padding: 14px;
    margin: 16px 0;
}}
</style>
</head>
<body>
<div class="wireframe-container">
    <div class="browser-header">
        <div class="browser-dots">
            <div class="browser-dot"></div>
            <div class="browser-dot"></div>
            <div class="browser-dot"></div>
        </div>
        <div class="browser-url">http://localhost:8080/dashboard?action=rent&id=VEH-001</div>
        <div class="wireframe-tag">WIREFRAME 04 • MODAL RESERVASI BOOKING SEWA</div>
    </div>

    <!-- Main Content Area with Modal Dialog Centered -->
    <div class="backdrop">
        <div class="dimmed-bg"></div>

        <div class="modal-box">
            <div class="modal-header">
                <div>
                    <h3 style="font-size: 16px; font-weight: 800; color: #212529;">Konfirmasi Reservasi Sewa Kendaraan</h3>
                    <div style="font-size: 11px; color: #6c757d;">Periksa detail unit dan tentukan tanggal peminjaman.</div>
                </div>
                <div style="font-size: 18px; font-weight: bold; cursor: pointer; color: #868e96;">&times;</div>
            </div>

            <div class="modal-body">
                <!-- Vehicle Info Snapshot -->
                <div style="display: flex; gap: 14px; background: #f8f9fa; border: 1.5px solid #dee2e6; border-radius: 8px; padding: 12px; margin-bottom: 16px;">
                    <div style="width: 100px; height: 65px;">
                        {generate_svg_x("Foto Unit")}
                    </div>
                    <div style="flex: 1;">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <span style="font-size: 9px; font-weight: 700; background: #e9ecef; border: 1px solid #ced4da; padding: 1px 6px; border-radius: 4px;">MOTOR MATIC</span>
                            <span style="font-size: 11px; font-family: monospace; color: #868e96;">VEH-001</span>
                        </div>
                        <div style="font-size: 15px; font-weight: 800; margin: 2px 0;">Yamaha NMAX 155</div>
                        <div style="font-size: 11px; color: #495057;">Plat: <strong>R 1234 AB</strong> &bull; Tarif: <strong>Rp 120.000 / hari</strong></div>
                    </div>
                </div>

                <!-- Date Picker Inputs -->
                <div class="form-grid">
                    <div>
                        <label style="display: block; font-size: 10px; font-weight: 700; color: #495057; text-transform: uppercase; margin-bottom: 4px;">Tanggal Mulai Sewa</label>
                        <input type="text" value="2026-11-23" style="width: 100%; border: 1.5px solid #ced4da; border-radius: 6px; padding: 8px 10px; font-size: 12px;" readonly>
                    </div>
                    <div>
                        <label style="display: block; font-size: 10px; font-weight: 700; color: #495057; text-transform: uppercase; margin-bottom: 4px;">Tanggal Selesai Sewa</label>
                        <input type="text" value="2026-11-26" style="width: 100%; border: 1.5px solid #ced4da; border-radius: 6px; padding: 8px 10px; font-size: 12px;" readonly>
                    </div>
                </div>

                <!-- Calculation Summary Box -->
                <div class="calc-box">
                    <div style="display: flex; justify-content: space-between; font-size: 11px; margin-bottom: 6px;">
                        <span style="color: #6c757d;">Durasi Sewa:</span>
                        <strong>3 Hari (23 Nov &ndash; 26 Nov 2026)</strong>
                    </div>
                    <div style="display: flex; justify-content: space-between; font-size: 11px; margin-bottom: 8px;">
                        <span style="color: #6c757d;">Tarif Harian:</span>
                        <span>Rp 120.000 &times; 3</span>
                    </div>
                    <div style="border-top: 1px solid #ced4da; padding-top: 8px; display: flex; justify-content: space-between; align-items: center;">
                        <span style="font-size: 12px; font-weight: 700; color: #212529;">Total Biaya Sewa:</span>
                        <span style="font-size: 18px; font-weight: 800; color: #212529;">Rp 360.000</span>
                    </div>
                </div>

                <!-- Customer Info Capsule -->
                <div style="background: #ffffff; border: 1px solid #dee2e6; border-radius: 6px; padding: 10px 14px; font-size: 11px; display: flex; justify-content: space-between;">
                    <div>
                        <div style="color: #868e96; font-size: 9px; text-transform: uppercase;">Penyewa Terautentikasi</div>
                        <div style="font-weight: 700; color: #212529;">Andi Pratama (andi@motorent.cloud)</div>
                    </div>
                    <div style="text-align: right;">
                        <div style="color: #868e96; font-size: 9px; text-transform: uppercase;">Nomor SIM</div>
                        <div style="font-family: monospace; font-weight: 600;">SIM-987654321 &check;</div>
                    </div>
                </div>
            </div>

            <div class="modal-footer">
                <button class="btn-wire btn-wire-outline">Batal</button>
                <button class="btn-wire">&check; Konfirmasi Booking &amp; Sewa Sekarang</button>
            </div>
        </div>
    </div>

    <div class="app-footer">
        <div>&copy; 2026 MotoRent Cloud &bull; CAK3EAB3 Komputasi Awan dan Terdistribusi</div>
        <div>In-Memory JSON Thread-Safe Synchronization</div>
    </div>
</div>
</body>
</html>
"""

def create_my_rentals_html():
    return f"""<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>Wireframe 05 - Sewa Saya</title>
<style>
{BASE_CSS}
.rental-card {{
    background: #ffffff;
    border: 1.5px solid #dee2e6;
    border-radius: 8px;
    padding: 18px;
    margin-bottom: 16px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 20px;
}}
</style>
</head>
<body>
<div class="wireframe-container">
    <div class="browser-header">
        <div class="browser-dots">
            <div class="browser-dot"></div>
            <div class="browser-dot"></div>
            <div class="browser-dot"></div>
        </div>
        <div class="browser-url">http://localhost:8080/my-rentals</div>
        <div class="wireframe-tag">WIREFRAME 05 • PORTAL SEWA SAYA (RIWAYAT PELANGGAN)</div>
    </div>

    <div class="app-navbar">
        <div class="brand-area">
            <div class="brand-logo-mock">M</div>
            <div>
                <div class="brand-title">MotoRent <span class="brand-tag">Cloud</span></div>
                <div class="brand-sub">CAK3EAB3 Komputasi Awan Terdistribusi</div>
            </div>
        </div>
        <div class="nav-pills">
            <button class="nav-pill">Dashboard</button>
            <button class="nav-pill active">Sewa Saya</button>
        </div>
        <div class="nav-actions">
            <div style="text-align: right;">
                <div style="font-size: 11px; font-weight: 700;">Andi Pratama <span style="font-size: 9px; background: #e6fcf5; color: #0ca678; border: 1px solid #63e6be; padding: 1px 4px; border-radius: 4px;">Pelanggan</span></div>
                <div style="font-size: 9px; color: #868e96; font-family: monospace;">andi@motorent.cloud</div>
            </div>
            <button class="btn-wire btn-wire-outline" style="padding: 4px 8px; font-size: 10px;">Keluar</button>
            <div class="node-badge"><span class="node-dot"></span> ec2-node1</div>
        </div>
    </div>

    <div class="main-content">
        <div style="margin-bottom: 20px; display: flex; justify-content: space-between; align-items: flex-end;">
            <div>
                <h2 style="font-size: 20px; font-weight: 800;">Riwayat Sewa Saya</h2>
                <p style="font-size: 12px; color: #6c757d;">Pantau status pemesanan aktif, riwayat pengembalian unit, dan total pengeluaran Anda.</p>
            </div>
            <div style="display: flex; gap: 8px;">
                <button class="btn-wire" style="padding: 4px 12px; font-size: 11px;">Semua (2)</button>
                <button class="btn-wire btn-wire-outline" style="padding: 4px 12px; font-size: 11px;">Aktif (1)</button>
                <button class="btn-wire btn-wire-outline" style="padding: 4px 12px; font-size: 11px;">Selesai (1)</button>
            </div>
        </div>

        <!-- Rental Item 1 (Active) -->
        <div class="rental-card">
            <div style="display: flex; gap: 16px; align-items: center;">
                <div style="width: 110px; height: 75px;">
                    {generate_svg_x("Foto NMAX")}
                </div>
                <div>
                    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
                        <span style="font-size: 11px; font-family: monospace; font-weight: 700; color: #212529;">RENT-202611-001</span>
                        <span style="font-size: 9px; font-weight: 800; background: #fff3bf; color: #f08c00; border: 1px solid #ffe066; padding: 2px 6px; border-radius: 4px; text-transform: uppercase;">
                            &bull; SEDANG DISEWA
                        </span>
                    </div>
                    <div style="font-size: 16px; font-weight: 800;">Yamaha NMAX 155</div>
                    <div style="font-size: 11px; color: #6c757d;">Plat: <strong>R 1234 AB</strong> &bull; Periode: <strong>23 Nov 2026 &ndash; 26 Nov 2026 (3 Hari)</strong></div>
                </div>
            </div>

            <div style="display: flex; align-items: center; gap: 20px;">
                <div style="text-align: right;">
                    <div style="font-size: 10px; color: #868e96;">Total Biaya</div>
                    <div style="font-size: 16px; font-weight: 800;">Rp 360.000</div>
                    <div style="font-size: 9px; color: #2b8a3e;">Lunas</div>
                </div>
                <div style="display: flex; flex-direction: column; gap: 6px;">
                    <button class="btn-wire" style="padding: 6px 12px; font-size: 11px;">Kembalikan Unit</button>
                    <button class="btn-wire btn-wire-outline" style="padding: 4px 12px; font-size: 10px; color: #e03131;">Batalkan Sewa</button>
                </div>
            </div>
        </div>

        <!-- Rental Item 2 (Completed) -->
        <div class="rental-card" style="opacity: 0.85;">
            <div style="display: flex; gap: 16px; align-items: center;">
                <div style="width: 110px; height: 75px;">
                    {generate_svg_x("Foto Vario")}
                </div>
                <div>
                    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
                        <span style="font-size: 11px; font-family: monospace; font-weight: 700; color: #212529;">RENT-202610-042</span>
                        <span style="font-size: 9px; font-weight: 800; background: #e6fcf5; color: #0ca678; border: 1px solid #63e6be; padding: 2px 6px; border-radius: 4px; text-transform: uppercase;">
                            &check; SUDAH KEMBALI
                        </span>
                    </div>
                    <div style="font-size: 16px; font-weight: 800;">Honda Vario 160</div>
                    <div style="font-size: 11px; color: #6c757d;">Plat: <strong>R 5678 CD</strong> &bull; Periode: <strong>10 Okt 2026 &ndash; 12 Okt 2026 (2 Hari)</strong></div>
                </div>
            </div>

            <div style="display: flex; align-items: center; gap: 20px;">
                <div style="text-align: right;">
                    <div style="font-size: 10px; color: #868e96;">Total Biaya</div>
                    <div style="font-size: 16px; font-weight: 800;">Rp 200.000</div>
                    <div style="font-size: 9px; color: #868e96;">Selesai</div>
                </div>
                <button class="btn-wire btn-wire-outline" style="padding: 6px 12px; font-size: 11px;">Cetak Bukti Sewa</button>
            </div>
        </div>
    </div>

    <div class="app-footer">
        <div>&copy; 2026 MotoRent Cloud &bull; CAK3EAB3 Komputasi Awan dan Terdistribusi &bull; Telkom University Purwokerto</div>
        <div>User ID: CUST-001 (Andi Pratama)</div>
    </div>
</div>
</body>
</html>
"""

def create_customer_mgmt_html():
    return f"""<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>Wireframe 06 - Data Pelanggan</title>
<style>
{BASE_CSS}
.data-table {{
    width: 100%;
    border-collapse: collapse;
    background: #ffffff;
    border: 1.5px solid #dee2e6;
    border-radius: 8px;
    overflow: hidden;
    font-size: 12px;
}}
.data-table th {{
    background: #f1f3f5;
    border-bottom: 1.5px solid #dee2e6;
    padding: 10px 14px;
    text-align: left;
    font-size: 10px;
    font-weight: 700;
    color: #495057;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}}
.data-table td {{
    padding: 12px 14px;
    border-bottom: 1px solid #f1f3f5;
    color: #212529;
}}
</style>
</head>
<body>
<div class="wireframe-container">
    <div class="browser-header">
        <div class="browser-dots">
            <div class="browser-dot"></div>
            <div class="browser-dot"></div>
            <div class="browser-dot"></div>
        </div>
        <div class="browser-url">http://localhost:8080/customers</div>
        <div class="wireframe-tag">WIREFRAME 06 • MANAJEMEN DATA PELANGGAN (ADMIN PORTAL)</div>
    </div>

    <div class="app-navbar">
        <div class="brand-area">
            <div class="brand-logo-mock">M</div>
            <div>
                <div class="brand-title">MotoRent <span class="brand-tag">Cloud</span></div>
                <div class="brand-sub">CAK3EAB3 Komputasi Awan Terdistribusi</div>
            </div>
        </div>
        <div class="nav-pills">
            <button class="nav-pill">Dashboard</button>
            <button class="nav-pill">Kelola Master Armada</button>
            <button class="nav-pill active">Data Pelanggan</button>
            <button class="nav-pill">Semua Transaksi</button>
        </div>
        <div class="nav-actions">
            <div style="text-align: right;">
                <div style="font-size: 11px; font-weight: 700;">Admin Pusat <span style="font-size: 9px; background: #f3f0ff; color: #7950f2; border: 1px solid #d0bfff; padding: 1px 4px; border-radius: 4px;">Admin</span></div>
                <div style="font-size: 9px; color: #868e96; font-family: monospace;">admin@motorent.cloud</div>
            </div>
            <button class="btn-wire btn-wire-outline" style="padding: 4px 8px; font-size: 10px;">Keluar</button>
            <div class="node-badge"><span class="node-dot"></span> ec2-node1</div>
        </div>
    </div>

    <div class="main-content">
        <div style="margin-bottom: 20px; display: flex; justify-content: space-between; align-items: flex-end;">
            <div>
                <h2 style="font-size: 20px; font-weight: 800;">Manajemen Data Pelanggan</h2>
                <p style="font-size: 12px; color: #6c757d;">Pusat administrasi identitas pelanggan, verifikasi kelayakan SIM, dan riwayat pesanan sewa.</p>
            </div>
            <button class="btn-wire">+ Tambah Pelanggan Baru</button>
        </div>

        <!-- Search & Filter Bar -->
        <div style="background: #ffffff; border: 1.5px solid #dee2e6; border-radius: 8px; padding: 12px 16px; margin-bottom: 16px; display: flex; justify-content: space-between;">
            <input type="text" placeholder="Cari nama pelanggan, nomor telepon, atau no SIM..." style="width: 380px; border: 1px solid #ced4da; border-radius: 6px; padding: 6px 12px; font-size: 11px;" disabled>
            <div style="display: flex; gap: 8px;">
                <select style="border: 1px solid #ced4da; border-radius: 6px; padding: 6px 10px; font-size: 11px;" disabled>
                    <option>Semua Status Pelanggan</option>
                </select>
            </div>
        </div>

        <!-- Data Table -->
        <table class="data-table">
            <thead>
                <tr>
                    <th>ID PELANGGAN</th>
                    <th>NAMA LENGKAP</th>
                    <th>ALAMAT EMAIL</th>
                    <th>NO. TELEPON</th>
                    <th>NO. SIM / KTP</th>
                    <th>TOTAL SEWA</th>
                    <th>STATUS</th>
                    <th style="text-align: right;">AKSI MANAJERIAL</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td style="font-family: monospace; font-weight: 700;">CUST-001</td>
                    <td><strong>Andi Pratama</strong></td>
                    <td style="color: #6c757d;">andi@motorent.cloud</td>
                    <td>081234567890</td>
                    <td><span style="font-family: monospace; background: #f8f9fa; border: 1px solid #ced4da; padding: 2px 6px; border-radius: 4px;">SIM-987654321</span></td>
                    <td><strong>2 Transaksi</strong></td>
                    <td><span style="font-size: 9px; font-weight: 700; background: #e6fcf5; color: #0ca678; border: 1px solid #63e6be; padding: 2px 6px; border-radius: 4px;">Aktif</span></td>
                    <td style="text-align: right;">
                        <button class="btn-wire btn-wire-outline" style="padding: 3px 8px; font-size: 10px;">Edit</button>
                        <button class="btn-wire btn-wire-outline" style="padding: 3px 8px; font-size: 10px; color: #e03131;">Hapus</button>
                    </td>
                </tr>
                <tr>
                    <td style="font-family: monospace; font-weight: 700;">CUST-002</td>
                    <td><strong>Budi Santoso</strong></td>
                    <td style="color: #6c757d;">budi.santoso@gmail.com</td>
                    <td>081298765432</td>
                    <td><span style="font-family: monospace; background: #f8f9fa; border: 1px solid #ced4da; padding: 2px 6px; border-radius: 4px;">SIM-123456789</span></td>
                    <td><strong>1 Transaksi</strong></td>
                    <td><span style="font-size: 9px; font-weight: 700; background: #e6fcf5; color: #0ca678; border: 1px solid #63e6be; padding: 2px 6px; border-radius: 4px;">Aktif</span></td>
                    <td style="text-align: right;">
                        <button class="btn-wire btn-wire-outline" style="padding: 3px 8px; font-size: 10px;">Edit</button>
                        <button class="btn-wire btn-wire-outline" style="padding: 3px 8px; font-size: 10px; color: #e03131;">Hapus</button>
                    </td>
                </tr>
                <tr>
                    <td style="font-family: monospace; font-weight: 700;">CUST-003</td>
                    <td><strong>Citra Lestari</strong></td>
                    <td style="color: #6c757d;">citra.lestari@gmail.com</td>
                    <td>081345678901</td>
                    <td><span style="font-family: monospace; background: #f8f9fa; border: 1px solid #ced4da; padding: 2px 6px; border-radius: 4px;">SIM-456789123</span></td>
                    <td><strong>3 Transaksi</strong></td>
                    <td><span style="font-size: 9px; font-weight: 700; background: #e6fcf5; color: #0ca678; border: 1px solid #63e6be; padding: 2px 6px; border-radius: 4px;">Aktif</span></td>
                    <td style="text-align: right;">
                        <button class="btn-wire btn-wire-outline" style="padding: 3px 8px; font-size: 10px;">Edit</button>
                        <button class="btn-wire btn-wire-outline" style="padding: 3px 8px; font-size: 10px; color: #e03131;">Hapus</button>
                    </td>
                </tr>
            </tbody>
        </table>

        <div style="margin-top: 14px; display: flex; justify-content: space-between; align-items: center; font-size: 11px; color: #868e96;">
            <div>Menampilkan 3 dari 3 data pelanggan terdaftar.</div>
            <div style="display: flex; gap: 4px;">
                <button class="btn-wire btn-wire-outline" style="padding: 3px 8px; font-size: 10px;" disabled>&larr;</button>
                <button class="btn-wire" style="padding: 3px 8px; font-size: 10px;">1</button>
                <button class="btn-wire btn-wire-outline" style="padding: 3px 8px; font-size: 10px;" disabled>&rarr;</button>
            </div>
        </div>
    </div>

    <div class="app-footer">
        <div>&copy; 2026 MotoRent Cloud &bull; CAK3EAB3 Komputasi Awan dan Terdistribusi &bull; Telkom University Purwokerto</div>
        <div>Admin Master Access &bull; In-Memory Data Store</div>
    </div>
</div>
</body>
</html>
"""

def create_fleet_admin_html():
    return f"""<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>Wireframe 07 - Kelola Master Armada</title>
<style>
{BASE_CSS}
.data-table {{
    width: 100%;
    border-collapse: collapse;
    background: #ffffff;
    border: 1.5px solid #dee2e6;
    border-radius: 8px;
    overflow: hidden;
    font-size: 12px;
}}
.data-table th {{
    background: #f1f3f5;
    border-bottom: 1.5px solid #dee2e6;
    padding: 10px 14px;
    text-align: left;
    font-size: 10px;
    font-weight: 700;
    color: #495057;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}}
.data-table td {{
    padding: 10px 14px;
    border-bottom: 1px solid #f1f3f5;
    color: #212529;
    vertical-align: middle;
}}
</style>
</head>
<body>
<div class="wireframe-container">
    <div class="browser-header">
        <div class="browser-dots">
            <div class="browser-dot"></div>
            <div class="browser-dot"></div>
            <div class="browser-dot"></div>
        </div>
        <div class="browser-url">http://localhost:8080/vehicles</div>
        <div class="wireframe-tag">WIREFRAME 07 • KELOLA MASTER ARMADA (ADMIN PORTAL)</div>
    </div>

    <div class="app-navbar">
        <div class="brand-area">
            <div class="brand-logo-mock">M</div>
            <div>
                <div class="brand-title">MotoRent <span class="brand-tag">Cloud</span></div>
                <div class="brand-sub">CAK3EAB3 Komputasi Awan Terdistribusi</div>
            </div>
        </div>
        <div class="nav-pills">
            <button class="nav-pill">Dashboard</button>
            <button class="nav-pill active">Kelola Master Armada</button>
            <button class="nav-pill">Data Pelanggan</button>
            <button class="nav-pill">Semua Transaksi</button>
        </div>
        <div class="nav-actions">
            <div style="text-align: right;">
                <div style="font-size: 11px; font-weight: 700;">Admin Pusat <span style="font-size: 9px; background: #f3f0ff; color: #7950f2; border: 1px solid #d0bfff; padding: 1px 4px; border-radius: 4px;">Admin</span></div>
                <div style="font-size: 9px; color: #868e96; font-family: monospace;">admin@motorent.cloud</div>
            </div>
            <button class="btn-wire btn-wire-outline" style="padding: 4px 8px; font-size: 10px;">Keluar</button>
            <div class="node-badge"><span class="node-dot"></span> ec2-node1</div>
        </div>
    </div>

    <div class="main-content">
        <div style="margin-bottom: 20px; display: flex; justify-content: space-between; align-items: flex-end;">
            <div>
                <h2 style="font-size: 20px; font-weight: 800;">Kelola Master Armada Kendaraan</h2>
                <p style="font-size: 12px; color: #6c757d;">Inventarisasi unit motor dan mobil, manajemen nomor plat polisi, tarif harian, dan status ketersediaan.</p>
            </div>
            <button class="btn-wire">+ Tambah Unit Armada</button>
        </div>

        <!-- Filter Bar -->
        <div style="background: #ffffff; border: 1.5px solid #dee2e6; border-radius: 8px; padding: 12px 16px; margin-bottom: 16px; display: flex; justify-content: space-between;">
            <div style="display: flex; gap: 8px;">
                <button class="btn-wire" style="padding: 4px 12px; font-size: 11px;">Semua Unit (5)</button>
                <button class="btn-wire btn-wire-outline" style="padding: 4px 12px; font-size: 11px;">Motor (3)</button>
                <button class="btn-wire btn-wire-outline" style="padding: 4px 12px; font-size: 11px;">Mobil (2)</button>
            </div>
            <input type="text" placeholder="Cari nama model atau nomor plat..." style="width: 280px; border: 1px solid #ced4da; border-radius: 6px; padding: 5px 12px; font-size: 11px;" disabled>
        </div>

        <!-- Data Table -->
        <table class="data-table">
            <thead>
                <tr>
                    <th>FOTO</th>
                    <th>ID UNIT</th>
                    <th>MODEL KENDARAAN</th>
                    <th>KATEGORI</th>
                    <th>NOMOR PLAT</th>
                    <th>TARIF HARIAN</th>
                    <th>STATUS KETERSEDIAAN</th>
                    <th style="text-align: right;">AKSI MANAJERIAL</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td style="width: 70px;"><div style="width: 60px; height: 38px;">{generate_svg_x("NMAX")}</div></td>
                    <td style="font-family: monospace; font-weight: 700;">VEH-001</td>
                    <td><strong>Yamaha NMAX 155</strong></td>
                    <td><span style="font-size: 10px; background: #e9ecef; border: 1px solid #ced4da; padding: 1px 6px; border-radius: 4px;">Motor</span></td>
                    <td style="font-family: monospace;">R 1234 AB</td>
                    <td><strong>Rp 120.000</strong>/hari</td>
                    <td><span style="font-size: 9px; font-weight: 700; background: #e6fcf5; color: #0ca678; border: 1px solid #63e6be; padding: 2px 6px; border-radius: 4px;">Tersedia</span></td>
                    <td style="text-align: right;">
                        <button class="btn-wire btn-wire-outline" style="padding: 3px 8px; font-size: 10px;">Edit</button>
                        <button class="btn-wire btn-wire-outline" style="padding: 3px 8px; font-size: 10px; color: #e03131;">Hapus</button>
                    </td>
                </tr>
                <tr>
                    <td style="width: 70px;"><div style="width: 60px; height: 38px;">{generate_svg_x("Vario")}</div></td>
                    <td style="font-family: monospace; font-weight: 700;">VEH-002</td>
                    <td><strong>Honda Vario 160</strong></td>
                    <td><span style="font-size: 10px; background: #e9ecef; border: 1px solid #ced4da; padding: 1px 6px; border-radius: 4px;">Motor</span></td>
                    <td style="font-family: monospace;">R 5678 CD</td>
                    <td><strong>Rp 100.000</strong>/hari</td>
                    <td><span style="font-size: 9px; font-weight: 700; background: #e6fcf5; color: #0ca678; border: 1px solid #63e6be; padding: 2px 6px; border-radius: 4px;">Tersedia</span></td>
                    <td style="text-align: right;">
                        <button class="btn-wire btn-wire-outline" style="padding: 3px 8px; font-size: 10px;">Edit</button>
                        <button class="btn-wire btn-wire-outline" style="padding: 3px 8px; font-size: 10px; color: #e03131;">Hapus</button>
                    </td>
                </tr>
                <tr>
                    <td style="width: 70px;"><div style="width: 60px; height: 38px;">{generate_svg_x("BeAT")}</div></td>
                    <td style="font-family: monospace; font-weight: 700;">VEH-003</td>
                    <td><strong>Honda BeAT Deluxe</strong></td>
                    <td><span style="font-size: 10px; background: #e9ecef; border: 1px solid #ced4da; padding: 1px 6px; border-radius: 4px;">Motor</span></td>
                    <td style="font-family: monospace;">R 9012 EF</td>
                    <td><strong>Rp 80.000</strong>/hari</td>
                    <td><span style="font-size: 9px; font-weight: 700; background: #e6fcf5; color: #0ca678; border: 1px solid #63e6be; padding: 2px 6px; border-radius: 4px;">Tersedia</span></td>
                    <td style="text-align: right;">
                        <button class="btn-wire btn-wire-outline" style="padding: 3px 8px; font-size: 10px;">Edit</button>
                        <button class="btn-wire btn-wire-outline" style="padding: 3px 8px; font-size: 10px; color: #e03131;">Hapus</button>
                    </td>
                </tr>
                <tr>
                    <td style="width: 70px;"><div style="width: 60px; height: 38px;">{generate_svg_x("Avanza")}</div></td>
                    <td style="font-family: monospace; font-weight: 700;">VEH-004</td>
                    <td><strong>Toyota Avanza 1.5G</strong></td>
                    <td><span style="font-size: 10px; background: #e9ecef; border: 1px solid #ced4da; padding: 1px 6px; border-radius: 4px;">Mobil</span></td>
                    <td style="font-family: monospace;">B 1122 XYZ</td>
                    <td><strong>Rp 350.000</strong>/hari</td>
                    <td><span style="font-size: 9px; font-weight: 700; background: #e6fcf5; color: #0ca678; border: 1px solid #63e6be; padding: 2px 6px; border-radius: 4px;">Tersedia</span></td>
                    <td style="text-align: right;">
                        <button class="btn-wire btn-wire-outline" style="padding: 3px 8px; font-size: 10px;">Edit</button>
                        <button class="btn-wire btn-wire-outline" style="padding: 3px 8px; font-size: 10px; color: #e03131;">Hapus</button>
                    </td>
                </tr>
                <tr>
                    <td style="width: 70px;"><div style="width: 60px; height: 38px;">{generate_svg_x("Xpander")}</div></td>
                    <td style="font-family: monospace; font-weight: 700;">VEH-005</td>
                    <td><strong>Mitsubishi Xpander</strong></td>
                    <td><span style="font-size: 10px; background: #e9ecef; border: 1px solid #ced4da; padding: 1px 6px; border-radius: 4px;">Mobil</span></td>
                    <td style="font-family: monospace;">B 3344 JKL</td>
                    <td><strong>Rp 450.000</strong>/hari</td>
                    <td><span style="font-size: 9px; font-weight: 700; background: #e6fcf5; color: #0ca678; border: 1px solid #63e6be; padding: 2px 6px; border-radius: 4px;">Tersedia</span></td>
                    <td style="text-align: right;">
                        <button class="btn-wire btn-wire-outline" style="padding: 3px 8px; font-size: 10px;">Edit</button>
                        <button class="btn-wire btn-wire-outline" style="padding: 3px 8px; font-size: 10px; color: #e03131;">Hapus</button>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>

    <div class="app-footer">
        <div>&copy; 2026 MotoRent Cloud &bull; CAK3EAB3 Komputasi Awan dan Terdistribusi &bull; Telkom University Purwokerto</div>
        <div>Master Armada Terdistribusi &bull; 5 Unit Total</div>
    </div>
</div>
</body>
</html>
"""

def create_rental_mgmt_html():
    return f"""<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>Wireframe 08 - Semua Transaksi</title>
<style>
{BASE_CSS}
.stats-grid {{
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
    margin-bottom: 20px;
}}
.stat-card {{
    background: #ffffff;
    border: 1.5px solid #dee2e6;
    border-radius: 8px;
    padding: 14px 16px;
}}
.data-table {{
    width: 100%;
    border-collapse: collapse;
    background: #ffffff;
    border: 1.5px solid #dee2e6;
    border-radius: 8px;
    overflow: hidden;
    font-size: 12px;
}}
.data-table th {{
    background: #f1f3f5;
    border-bottom: 1.5px solid #dee2e6;
    padding: 10px 14px;
    text-align: left;
    font-size: 10px;
    font-weight: 700;
    color: #495057;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}}
.data-table td {{
    padding: 12px 14px;
    border-bottom: 1px solid #f1f3f5;
    color: #212529;
    vertical-align: middle;
}}
</style>
</head>
<body>
<div class="wireframe-container">
    <div class="browser-header">
        <div class="browser-dots">
            <div class="browser-dot"></div>
            <div class="browser-dot"></div>
            <div class="browser-dot"></div>
        </div>
        <div class="browser-url">http://localhost:8080/rentals</div>
        <div class="wireframe-tag">WIREFRAME 08 • KELOLA SEMUA TRANSAKSI SEWA (ADMIN PORTAL)</div>
    </div>

    <div class="app-navbar">
        <div class="brand-area">
            <div class="brand-logo-mock">M</div>
            <div>
                <div class="brand-title">MotoRent <span class="brand-tag">Cloud</span></div>
                <div class="brand-sub">CAK3EAB3 Komputasi Awan Terdistribusi</div>
            </div>
        </div>
        <div class="nav-pills">
            <button class="nav-pill">Dashboard</button>
            <button class="nav-pill">Kelola Master Armada</button>
            <button class="nav-pill">Data Pelanggan</button>
            <button class="nav-pill active">Semua Transaksi</button>
        </div>
        <div class="nav-actions">
            <div style="text-align: right;">
                <div style="font-size: 11px; font-weight: 700;">Admin Pusat <span style="font-size: 9px; background: #f3f0ff; color: #7950f2; border: 1px solid #d0bfff; padding: 1px 4px; border-radius: 4px;">Admin</span></div>
                <div style="font-size: 9px; color: #868e96; font-family: monospace;">admin@motorent.cloud</div>
            </div>
            <button class="btn-wire btn-wire-outline" style="padding: 4px 8px; font-size: 10px;">Keluar</button>
            <div class="node-badge"><span class="node-dot"></span> ec2-node1</div>
        </div>
    </div>

    <div class="main-content">
        <div style="margin-bottom: 18px;">
            <h2 style="font-size: 20px; font-weight: 800;">Kelola Seluruh Transaksi Sewa</h2>
            <p style="font-size: 12px; color: #6c757d;">Monitoring rental aktif, validasi proses pengembalian unit, pembatalan pesanan, dan rekap omset keuangan.</p>
        </div>

        <!-- 4 Metric Cards for Admin -->
        <div class="stats-grid">
            <div class="stat-card">
                <div style="font-size: 10px; font-weight: 700; color: #868e96; text-transform: uppercase;">Total Transaksi</div>
                <div style="font-size: 22px; font-weight: 800; margin: 4px 0;">12 Transaksi</div>
                <div style="font-size: 10px; color: #6c757d;">Semua Riwayat</div>
            </div>
            <div class="stat-card">
                <div style="font-size: 10px; font-weight: 700; color: #868e96; text-transform: uppercase;">Sedang Berjalan</div>
                <div style="font-size: 22px; font-weight: 800; margin: 4px 0; color: #e67700;">1 Unit Aktif</div>
                <div style="font-size: 10px; color: #6c757d;">Di Tangan Penyewa</div>
            </div>
            <div class="stat-card">
                <div style="font-size: 10px; font-weight: 700; color: #868e96; text-transform: uppercase;">Transaksi Selesai</div>
                <div style="font-size: 22px; font-weight: 800; margin: 4px 0; color: #2b8a3e;">11 Unit</div>
                <div style="font-size: 10px; color: #6c757d;">Unit Telah Kembali</div>
            </div>
            <div class="stat-card">
                <div style="font-size: 10px; font-weight: 700; color: #868e96; text-transform: uppercase;">Total Omset</div>
                <div style="font-size: 22px; font-weight: 800; margin: 4px 0;">Rp 4.250.000</div>
                <div style="font-size: 10px; color: #6c757d;">Pendapatan Bersih</div>
            </div>
        </div>

        <!-- Data Table -->
        <table class="data-table">
            <thead>
                <tr>
                    <th>KODE RENTAL</th>
                    <th>PELANGGAN</th>
                    <th>UNIT KENDARAAN</th>
                    <th>PERIODE SEWA</th>
                    <th>DURASI</th>
                    <th>TOTAL BIAYA</th>
                    <th>STATUS</th>
                    <th style="text-align: right;">AKSI MANAJERIAL</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td style="font-family: monospace; font-weight: 700;">RENT-202611-001</td>
                    <td><strong>Andi Pratama</strong><br><span style="font-size: 10px; color: #868e96;">andi@motorent.cloud</span></td>
                    <td>Yamaha NMAX 155<br><span style="font-size: 10px; font-family: monospace; color: #868e96;">R 1234 AB</span></td>
                    <td>23 Nov &ndash; 26 Nov 2026</td>
                    <td>3 Hari</td>
                    <td><strong>Rp 360.000</strong></td>
                    <td><span style="font-size: 9px; font-weight: 800; background: #fff3bf; color: #f08c00; border: 1px solid #ffe066; padding: 2px 6px; border-radius: 4px;">BERJALAN</span></td>
                    <td style="text-align: right;">
                        <button class="btn-wire" style="padding: 4px 8px; font-size: 10px;">Proses Selesai</button>
                        <button class="btn-wire btn-wire-outline" style="padding: 4px 8px; font-size: 10px; color: #e03131;">Batalkan</button>
                    </td>
                </tr>
                <tr>
                    <td style="font-family: monospace; font-weight: 700;">RENT-202610-089</td>
                    <td><strong>Budi Santoso</strong><br><span style="font-size: 10px; color: #868e96;">budi@gmail.com</span></td>
                    <td>Toyota Avanza 1.5G<br><span style="font-size: 10px; font-family: monospace; color: #868e96;">B 1122 XYZ</span></td>
                    <td>15 Okt &ndash; 18 Okt 2026</td>
                    <td>3 Hari</td>
                    <td><strong>Rp 1.050.000</strong></td>
                    <td><span style="font-size: 9px; font-weight: 800; background: #e6fcf5; color: #0ca678; border: 1px solid #63e6be; padding: 2px 6px; border-radius: 4px;">SELESAI</span></td>
                    <td style="text-align: right;">
                        <button class="btn-wire btn-wire-outline" style="padding: 4px 8px; font-size: 10px;">Detail / Cetak</button>
                    </td>
                </tr>
                <tr>
                    <td style="font-family: monospace; font-weight: 700;">RENT-202610-042</td>
                    <td><strong>Citra Lestari</strong><br><span style="font-size: 10px; color: #868e96;">citra@gmail.com</span></td>
                    <td>Honda Vario 160<br><span style="font-size: 10px; font-family: monospace; color: #868e96;">R 5678 CD</span></td>
                    <td>02 Okt &ndash; 04 Okt 2026</td>
                    <td>2 Hari</td>
                    <td><strong>Rp 200.000</strong></td>
                    <td><span style="font-size: 9px; font-weight: 800; background: #e6fcf5; color: #0ca678; border: 1px solid #63e6be; padding: 2px 6px; border-radius: 4px;">SELESAI</span></td>
                    <td style="text-align: right;">
                        <button class="btn-wire btn-wire-outline" style="padding: 4px 8px; font-size: 10px;">Detail / Cetak</button>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>

    <div class="app-footer">
        <div>&copy; 2026 MotoRent Cloud &bull; CAK3EAB3 Komputasi Awan dan Terdistribusi &bull; Telkom University Purwokerto</div>
        <div>Audit Trail &bull; FastAPI In-Memory Store</div>
    </div>
</div>
</body>
</html>
"""

def main():
    pages = [
        ("01-dashboard.html", "01-dashboard.png", create_dashboard_html()),
        ("02-login.html", "02-login.png", create_login_html()),
        ("03-register.html", "03-register.png", create_register_html()),
        ("04-booking-modal.html", "04-booking-modal.png", create_booking_modal_html()),
        ("05-my-rentals.html", "05-my-rentals.png", create_my_rentals_html()),
        ("06-customer-management.html", "06-customer-management.png", create_customer_mgmt_html()),
        ("07-fleet-catalog-admin.html", "07-fleet-catalog-admin.png", create_fleet_admin_html()),
        ("08-rental-management-admin.html", "08-rental-management-admin.png", create_rental_mgmt_html()),
    ]

    scratch_dir = Path(".scratch/wireframe_pages")
    scratch_dir.mkdir(parents=True, exist_ok=True)
    out_dir = Path("docs/wireframes")
    out_dir.mkdir(parents=True, exist_ok=True)

    for html_file, png_file, content in pages:
        html_path = scratch_dir / html_file
        png_path = out_dir / png_file
        with open(html_path, "w", encoding="utf-8") as f:
            f.write(content)
        print(f"Generated HTML: {html_path}")

        # Run playwright screenshot
        full_html_url = f"file:///{html_path.resolve()}"
        cmd = [
            "npx.cmd", "playwright", "screenshot",
            "--channel", "msedge",
            "--viewport-size", "1280, 800",
            full_html_url,
            str(png_path.resolve())
        ]
        print(f"Rendering PNG: {png_path}...")
        res = subprocess.run(cmd, capture_output=True, text=True)
        if res.returncode != 0:
            print(f"Error rendering {png_file}: {res.stderr}")
        else:
            print(f"Successfully generated: {png_path}")

if __name__ == "__main__":
    main()
