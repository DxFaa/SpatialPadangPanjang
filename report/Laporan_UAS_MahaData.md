# Laporan Proyek Akhir: Kapita Selekta Sistem Informasi & Maha Data
## Analisis Perubahan Vegetasi di Kota Padang Panjang (2024 - 2025)

**Oleh:**
1. Daffa Pratama Putra (NIM: 1232712004)
2. Mochammad Fadhillah Y.K. (NIM: 1232712001)

**Tautan Penting:**
- **Repositori GitHub:** https://github.com/DxFaa/SpatialPadangPanjang
- **WebGIS:** https://spatial-padang-panjang.vercel.app/

---

### 1. Pendahuluan
#### 1.1 Rumusan Masalah
Apakah luas area vegetasi di Kota Padang Panjang mengalami pertambahan (gain) atau penyusutan (loss) secara signifikan antara tahun 2024 dan 2025? Di mana lokasi perubahan terbesar terjadi, dan seberapa akurat model klasifikasi yang digunakan untuk mendeteksi perubahan tersebut?

#### 1.2 Alasan Pemilihan Objek dan Kota
Kota Padang Panjang dipilih karena merupakan salah satu kota dengan suhu sejuk di Sumatera Barat yang memiliki tutupan vegetasi unik dan berpotensi mengalami perubahan akibat perkembangan permukiman atau alih fungsi lahan. Objek **Vegetasi** dipilih sebagai indikator Ruang Terbuka Hijau (RTH) yang krusial untuk mempertahankan iklim mikro dan daerah resapan air di kota tersebut.

#### 1.3 Pengguna Potensial dan Manfaat
- **Dinas Tata Ruang & Bappeda:** Sebagai basis data spasial untuk evaluasi master plan RTH dan pemantauan perizinan pembangunan.
- **Dinas Lingkungan Hidup:** Untuk mengidentifikasi wilayah prioritas penghijauan kembali.
- **Manfaat:** Memberikan wawasan berbasis data historis (Maha Data / Big Data) dari satelit tanpa memerlukan biaya survei lapangan yang mahal.

---

### 2. Metodologi & Preprocessing Data
Pemrosesan utama dilakukan menggunakan **Google Earth Engine (GEE)** dengan dataset citra satelit **Sentinel-2 Surface Reflectance Harmonized**.

#### 2.1 Parameter Komposit Citra
Untuk memastikan perbandingan yang adil (apple-to-apple) antara tahun 2024 dan 2025, kami menerapkan aturan konsisten:
- **Rentang Waktu:** 1 Januari hingga 31 Desember untuk masing-masing tahun.
- **Cloud Masking:** Menggunakan bitmask `QA60` untuk membuang awan tebal dan sirus. Ambang batas awal (filter meta) ditetapkan pada citra dengan persentase awan < 70%.
- **Metode Komposit:** Menggunakan `median()` reducer untuk menghasilkan satu citra gabungan bebas awan untuk setiap tahun.
- **Batas Administrasi:** Menggunakan dataset `geoBoundaries ADM2` (Kota Padang Panjang).
- **Resolusi Spasial:** 10 meter/piksel.

#### 2.2 Feature Stack dan Ground Truth
- **Feature Stack:** Kami menggunakan 7 band/indeks (B2, B3, B4, B8, B11, B12, dan NDVI). NDVI ditambahkan untuk mempertajam pemisahan kelas vegetasi dan non-vegetasi.
- **Ground Truth:** Sampel dikumpulkan secara spasial yang tersebar di pusat dan pinggiran kota. 
- **Kelas:** Kelas 1 (Vegetasi) dan Kelas 0 (Non-Vegetasi).
- **Training/Testing Split:** Pembagian dilakukan dengan proporsi 70% Training dan 30% Testing menggunakan seed acak statis (`42`) agar eksperimen dapat direproduksi (reproducible).

#### 2.3 Model Pembelajaran Mesin
Algoritma yang digunakan adalah **Random Forest** dengan jumlah 100 *trees* (pohon keputusan). Model dilatih menggunakan subset *training* gabungan (2024 & 2025) dan diaplikasikan pada citra tahun 2024 dan 2025 secara identik.

---

### 3. Evaluasi Model (APRF)
Berdasarkan *testing dataset* (123 titik atau 30% dari total 400 sampel populasi), kinerja model Random Forest tercatat sangat baik:
- **Confusion Matrix:**
  - True Positive (TP): 66
  - True Negative (TN): 55
  - False Positive (FP): 1
  - False Negative (FN): 1
- **Accuracy (Akurasi):** 98.37%
- **Precision (Consumers Accuracy):** 98.50%
- **Recall (Producers Accuracy):** 98.50%
- **F1-Score:** 98.50%

**Interpretasi:**
Tingkat akurasi dan presisi yang mencapai 98% mengindikasikan bahwa model dapat sangat dipercaya saat mengklasifikasikan piksel sebagai vegetasi. Hanya terdapat 1 kesalahan False Positive dan 1 False Negative, menunjukkan bahwa model berhasil mengatasi variasi noise dengan sangat baik menggunakan 100 *trees*.

---

### 4. Hasil dan Analisis Perubahan
Berdasarkan raster hasil klasifikasi biner, perubahan dihitung dengan metode *post-classification change detection*. Poligon vektor diekspor dan luasnya dihitung melalui sistem Google Earth Engine.

- **Luas Total Kota Padang Panjang:** 2.102,88 Ha
- **Luas Target (Vegetasi) 2024:** 1.362,58 Ha
- **Luas Target (Vegetasi) 2025:** 1.491,82 Ha
- **Gain (Pertambahan Vegetasi):** 176,75 Ha
- **Loss (Penyusutan Vegetasi):** 47,51 Ha
- **Perubahan Bersih (Net Change):** +129,24 Ha (+9.48%)

**Pola Spasial:**
Lokasi perubahan terbesar (Loss) umumnya terkonsentrasi di area perbatasan kota dan di sepanjang jalan arteri yang mengindikasikan adanya perluasan bangunan atau infrastruktur. Sementara (Gain) terpantau berupa sebaran acak kecil yang mengindikasikan pertumbuhan semak belukar liar di lahan yang tidak dikelola.

---

### 5. Kesimpulan dan Keterbatasan
- **Kesimpulan:** Model Random Forest berhasil memetakan vegetasi dengan akurasi yang memadai (di atas 90%). Analisis menunjukkan tren [pilih: penurunan/penambahan] luasan vegetasi di Kota Padang Panjang dalam kurun satu tahun.
- **Keterbatasan:** Resolusi Sentinel-2 (10 meter) tidak ideal untuk membedakan vegetasi individual (seperti satu pohon di pekarangan rumah), sehingga pemetaan lebih mewakili hamparan kanopi besar. *Ground truth* juga sangat bergantung pada interpretasi visual yang mungkin memiliki tingkat bias manusia.

---
*Laporan Kontribusi Anggota:*
- **Daffa Pratama Putra:** Penyusunan Code Google Earth Engine; Ground Truth; Pengumpulan Sample Titik Point 100 per Target dan Non-Target; Github Repository; Frontend WebGIS; Backend WebGIS; Penyusunan Laporan; Konfigurasi Export GeoJSON di GEE;
- **Mochammad Fadhillah Y.K.:** Frontend WebGIS; Backend WebGIS; Penyusunan Laporan
