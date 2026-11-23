# Panduan Prompt Generator AI & Kurasi Aset Kendaraan
### MotoRent Cloud — Asset Creation Guidelines

Dokumen ini berisi panduan dan formula kata kunci (*prompt matrix*) bagi tim pengembang untuk men-generate gambar fotorealistik kendaraan MotoRent Cloud menggunakan AI image generator (Midjourney v6, DALL-E 3, Bing Image Creator, Flux) atau untuk mencari aset berlisensi bebas di Pinterest dan Unsplash.

---

## 🎨 Standar Visual & Anti-Slop Guidelines

Agar tampilan antarmuka web tetap profesional dan tidak terkesan "murahan" atau *generic AI slop*:
1. **Latar Belakang Netral (Clean Studio Cyclorama):** Selalu gunakan latar belakang studio komersial (*infinity cove / soft grey cyclorama floor*) tanpa dekorasi neon atau partikel melayang.
2. **Sudut Pengambilan Konsisten (3/4 Front Three-Quarter Angle):** Menampilkan tampak depan dan samping kendaraan secara seimbang untuk memperlihatkan model dan velg.
3. **Pencahayaan Studio Lembut (Softbox Rim Lighting):** Pencahayaan komersial otomotif dengan bayangan lembut (*ambient contact shadow*) di bawah ban.
4. **Tanpa Teks & Huruf:** Jangan men-generate tulisan, plat nomor acak, atau watermark di dalam gambar (seluruh teks plat dan tarif ditangani langsung oleh kode frontend).
5. **Rasio Aspek 16:9:** Selalu gunakan parameter `--ar 16:9` (atau format lanskap) agar pas dengan kartu armada di Dashboard.

---

## 🤖 Formula Prompt Midjourney / DALL-E 3

```text
[Nama Kendaraan & Warna] [Sudut Pengambilan] in a professional automotive commercial photo studio, soft neutral gray cyclorama background, clean studio softbox lighting, high-end commercial car catalog shoot, sharp focus, 8k resolution, photorealistic, cinematic automotive reflection --ar 16:9 --style raw --v 6.0
```

---

## 🚗 Matriks Prompt per Kendaraan

### 1. Yamaha NMAX 155
- **Deskripsi:** Skuter matic maxi premium warna biru dongker matte (*Matte Navy Metallic*).
- **Prompt Midjourney / DALL-E 3:**
  ```text
  Commercial studio photography of a modern 2024 Yamaha NMAX 155 maxi scooter, matte dark navy blue metallic finish, aerodynamic front windscreen, dual LED projector headlights, parked on a clean minimalist light grey studio floor, front three-quarter view, high-end showroom softbox lighting, photorealistic, sharp details, 8k, automotive catalog style, no text, no watermark --ar 16:9 --style raw
  ```

---

### 2. Honda Vario 160
- **Deskripsi:** Skuter matic sporty agresif warna merah-hitam (*Glossy Sporty Red and Matte Black*).
- **Prompt Midjourney / DALL-E 3:**
  ```text
  Commercial catalog photography of a Honda Vario 160 modern sports scooter, glossy vibrant crimson red and matte black dual-tone panels, sharp angular front cowl, dual-tone alloy wheels, parked in an automotive photography studio with seamless light grey background, dramatic soft rim lighting, photorealistic, 8k, automotive magazine quality, no text --ar 16:9 --style raw
  ```

---

### 3. Honda BeAT Deluxe
- **Deskripsi:** Skuter komuter kompak modern warna perak metalik (*Gloss Silver Metallic*).
- **Prompt Midjourney / DALL-E 3:**
  ```text
  Clean studio shot of a 2024 Honda BeAT Deluxe compact urban scooter, gloss silver metallic paint with subtle dark grey accents, sleek commuter design, front 3/4 angle, pure neutral studio cyclorama floor, soft diffuse ceiling softbox lighting, ultra-sharp reflections, 8k, automotive advertisement photography, no text --ar 16:9 --style raw
  ```

---

### 4. Toyota Avanza 1.5G
- **Deskripsi:** MPV keluarga 7-seater modern warna perak terang (*Silver Metallic*).
- **Prompt Midjourney / DALL-E 3:**
  ```text
  High-end commercial car photography of a 2024 Toyota Avanza 1.5G modern MPV family car, gleaming silver metallic body, chrome front horizontal grille bars, multi-spoke alloy rims, tinted panoramic side windows, parked on a light grey commercial studio floor with subtle floor reflections, front three-quarter view, soft rim lighting, photorealistic, 8k resolution, no people, no text --ar 16:9 --style raw
  ```

---

### 5. Mitsubishi Xpander Ultimate
- **Deskripsi:** Crossover MPV 7-seater tangguh warna abu-abu grafit metalik (*Graphite Grey Metallic*).
- **Prompt Midjourney / DALL-E 3:**
  ```text
  Commercial studio photoshoot of a 2024 Mitsubishi Xpander Ultimate modern crossover MPV, premium graphite dark grey metallic paint, signature chrome dynamic shield front fascia, futuristic T-shaped LED headlights, two-tone diamond-cut alloy wheels, parked on a minimalist studio cove with soft ceiling lighting and sharp ground contact shadow, front three-quarter angle, 8k, automotive press photography, no text --ar 16:9 --style raw
  ```

---

## 📌 Kata Kunci Pencarian Pinterest / Unsplash / Freepik

Jika kamu ingin mencari foto asli berlisensi di Pinterest atau platform stok foto:

| Unit Kendaraan | Kata Kunci Pencarian Rekomendasi |
| :--- | :--- |
| **Yamaha NMAX 155** | `yamaha nmax 155 matte navy studio photo front 3/4 commercial` |
| **Honda Vario 160** | `honda vario 160 red black studio lighting white background` |
| **Honda BeAT Deluxe** | `honda beat deluxe silver commuter scooter studio photoshoot` |
| **Toyota Avanza 1.5G** | `toyota avanza silver modern mpv side view studio white background` |
| **Mitsubishi Xpander** | `mitsubishi xpander dark grey dynamic shield studio photo` |

---

## 📂 Cara Memasang Gambar Baru ke MotoRent Cloud

1. Simpan file gambar hasil generate/download ke dalam folder:
   ```text
   frontend/public/vehicles/<nama-kendaraan>.webp (atau .png / .jpg)
   ```
2. Buka file `backend/data/store.json` (dan `backend/app/store.py`), lalu ubah nilai atribut `image_url` pada kendaraan yang bersangkutan:
   ```json
   {
     "id": "VEH-001",
     "model_name": "Yamaha NMAX 155",
     "image_url": "/vehicles/yamaha-nmax.webp"
   }
   ```
3. Refresh halaman web di browser. Gambar baru akan langsung tampil di kartu armada!
