# Pemetaan Perubahan Vegetasi Kota Padang Panjang (2024-2025)

Repositori ini berisi hasil proyek akhir mata kuliah **Kapita Selekta Sistem Informasi** dan **Maha Data**. Proyek ini bertujuan untuk memetakan perubahan area vegetasi di Kota Padang Panjang antara tahun 2024 dan 2025 menggunakan citra satelit Sentinel-2, algoritma Random Forest, dan disajikan melalui WebGIS interaktif.

## Anggota Kelompok
1. **Daffa Pratama Putra** (NIM: 1232712004)
2. **Mochammad Fadhilah Y.K.** (NIM: 1232712001)

## Studi Kasus
- **Kota/Wilayah:** Kota Padang Panjang, Sumatera Barat
- **Objek Target:** Vegetasi
- **Periode:** Tahun 2024 vs 2025

## Struktur Repositori
- `data/` : Berisi data spasial dalam format GeoJSON (Batas Wilayah, Hasil Klasifikasi 2024 & 2025, Gain, Loss).
- `gee/` : Berisi script JavaScript (`uas_padangpanjang.js`) yang digunakan di Google Earth Engine untuk preprocessing, training model, dan klasifikasi.
- `webgis/` : Berisi kode sumber untuk antarmuka WebGIS (HTML, CSS, JS).
- `report/` : Berisi file draf laporan akhir (`Laporan_UAS_MahaData.md`).
- `results/` : Folder untuk menyimpan hasil analisis tambahan atau gambar peta jika diperlukan.

## Cara Membuka WebGIS

WebGIS dibangun menggunakan HTML, CSS murni, dan JavaScript (Leaflet.js & Turf.js). Untuk membukanya di komputer lokal:

1. Clone repositori ini ke komputer Anda.
   ```bash
   git clone <URL_REPOSITORI>
   ```
2. Karena WebGIS memuat file GeoJSON dari folder lokal (`data/`), Anda harus menjalankannya melalui *local server* agar tidak terkena pemblokiran CORS oleh browser.
3. Jika Anda memiliki Python terinstal, jalankan perintah berikut di dalam root folder repositori:
   ```bash
   python -m http.server 8000
   ```
4. Buka browser dan akses: `http://localhost:8000/webgis/`

*Catatan: Jika repositori ini telah di-deploy ke GitHub Pages, Anda dapat langsung mengakses link yang tersedia di bagian "About" repositori.*

## Teknologi yang Digunakan
- **Google Earth Engine (GEE)**: Akuisisi citra satelit, Cloud Masking, perhitungan Indeks (NDVI), Machine Learning (Random Forest).
- **Leaflet.js**: Library JavaScript open-source untuk peta interaktif.
- **Turf.js**: Library analisis geospasial tingkat lanjut di browser (digunakan untuk menghitung luasan area GeoJSON secara otomatis tanpa harus menginput manual dari GEE).
- **Vanilla CSS**: Desain UI WebGIS yang bersih, modern, dan ringan.

---
*Proyek ini disusun untuk memenuhi Ujian Akhir Semester (UAS) di Universitas Bakrie.*
