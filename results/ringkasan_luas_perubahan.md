# Ringkasan Luas & Perubahan Vegetasi
**Proyek:** Analisis Perubahan Vegetasi Kota Padang Panjang (2024–2025)
**Metode:** Post-Classification Change Detection
**Sumber Citra:** Sentinel-2 SR Harmonized (Level-2A), Resolusi 10 m/piksel

---

## Tabel Ringkasan Luasan (Hektar)

| Parameter                         | Nilai (Ha)      | Persentase thd Luas Kota |
|-----------------------------------|-----------------|--------------------------|
| **Luas Total Kota Padang Panjang**| **2.102,89 Ha** | 100%                     |
| Luas Target Vegetasi **2024**     | 1.362,58 Ha     | 64,80%                   |
| Luas Target Vegetasi **2025**     | 1.491,82 Ha     | 70,95%                   |
| **Gain** (Penambahan Vegetasi)    | +176,76 Ha      | 8,40% dari luas kota     |
| **Loss** (Penyusutan Vegetasi)    | -47,52 Ha       | 2,26% dari luas kota     |
| **Perubahan Bersih (Net Change)** | **+129,24 Ha**  | **+9,49% dari 2024**     |

---

## Grafik Perubahan (Tekstual)

### Bar Chart: Perbandingan Luasan Vegetasi 2024 vs 2025

```
Luas (Ha)
1.600 |
1.491 |                ████████
1.400 | ████████
1.363 | ████████        ████████
1.200 | ████████        ████████
...   | ████████        ████████
    0 +----------+----------+
          2024          2025

  ██ = Tutupan Vegetasi (Ha)
```

### Doughnut Chart: Dinamika Gain vs Loss

```
Total Perubahan Bruto: 176,76 + 47,52 = 224,28 Ha

  Gain (Bertambah) : 176,76 Ha  → 78,81% dari total perubahan bruto
  Loss (Berkurang) :  47,52 Ha  → 21,19% dari total perubahan bruto
```

---

## Data Mentah (Presisi Penuh dari GEE)

```
Luas Total Kota Padang Panjang : 2102.88555752635  Ha
Luas Target Vegetasi 2024      : 1362.579441516119  Ha
Luas Target Vegetasi 2025      : 1491.821329341296  Ha
Luas Gain (Penambahan)         :  176.75766261503034 Ha
Luas Loss (Penyusutan)         :   47.515774789853566 Ha
```

---

## Analisis & Interpretasi

### Tren Utama
- Vegetasi di Kota Padang Panjang menunjukkan **tren PERTAMBAHAN** bersih sebesar **+129,24 Ha (+9,49%)** dalam satu tahun (2024 → 2025).
- Luas vegetasi meningkat dari **1.362,58 Ha** (64,80% kota) menjadi **1.491,82 Ha** (70,95% kota).

### Pola Spasial Perubahan
- **Gain (+176,76 Ha):** Tersebar di area lahan terbuka yang mulai ditumbuhi vegetasi alami (semak belukar) di pinggiran kota.
- **Loss (-47,52 Ha):** Terkonsentrasi di titik-titik perbatasan kota dan sepanjang jalan arteri utama, mengindikasikan adanya perluasan bangunan dan infrastruktur baru.

### Potensi Penggunaan
- Data ini dapat digunakan oleh **Dinas Lingkungan Hidup (DLH)** Kota Padang Panjang untuk memvalidasi pencapaian target **Ruang Terbuka Hijau (RTH)** secara berkala tanpa survei lapangan penuh.
- Dapat pula menjadi basis evaluasi **master plan** tata ruang kota oleh **Bappeda**.
