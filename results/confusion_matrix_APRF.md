# Evaluasi Model: Confusion Matrix & Metrik APRF
**Proyek:** Analisis Perubahan Vegetasi Kota Padang Panjang (2024–2025)
**Model:** Random Forest (100 Trees)
**Dataset Uji:** 123 sampel (30% dari total 400 sampel, seed=42)

---

## Confusion Matrix

|                     | **Prediksi: Non-Vegetasi (0)** | **Prediksi: Vegetasi (1)** |
|---------------------|-------------------------------|---------------------------|
| **Aktual: Non-Vegetasi (0)** | **55** *(True Negative / TN)* | 1 *(False Positive / FP)* |
| **Aktual: Vegetasi (1)**     | 1 *(False Negative / FN)*     | **66** *(True Positive / TP)* |

**Raw output GEE:**
```
[[55, 1],
 [ 1, 66]]
```

---

## Metrik APRF (Accuracy, Precision, Recall, F1-Score)

| Metrik | Kelas 0 (Non-Vegetasi) | Kelas 1 (Vegetasi) |
|--------|------------------------|---------------------|
| **Precision (Consumer's Accuracy)** | 98.21% | 98.51% |
| **Recall (Producer's Accuracy)**    | 98.21% | 98.51% |

| Metrik Global       | Nilai     |
|---------------------|-----------|
| **Accuracy**        | **98.37%** |
| **Precision (Class 1)** | **98.51%** |
| **Recall (Class 1)**    | **98.51%** |
| **F1-Score (Class 1)**  | **98.51%** |

---

## Detail Perhitungan

```
Total Sampel Test  : 123
True Positive  (TP): 66  → Vegetasi diprediksi benar sebagai Vegetasi
True Negative  (TN): 55  → Non-Vegetasi diprediksi benar sebagai Non-Vegetasi
False Positive (FP): 1   → Non-Vegetasi salah diprediksi sebagai Vegetasi
False Negative (FN): 1   → Vegetasi salah diprediksi sebagai Non-Vegetasi

Accuracy  = (TP + TN) / Total  = (66 + 55) / 123  = 0.98374 → 98.37%
Precision = TP / (TP + FP)     = 66 / (66 + 1)    = 0.98507 → 98.51%
Recall    = TP / (TP + FN)     = 66 / (66 + 1)    = 0.98507 → 98.51%
F1-Score  = 2 × (P × R)/(P+R) = 2 × (0.98507²) / (2×0.98507) = 0.98507 → 98.51%
```

---

## Interpretasi

- Hanya **1 kesalahan FP** dan **1 kesalahan FN** dari 123 sampel uji, menunjukkan performa model yang sangat tinggi.
- Nilai F1-Score **98.51%** mengkonfirmasi keseimbangan yang sangat baik antara Precision dan Recall.
- Model dapat dipercaya untuk digunakan dalam klasifikasi biner vegetasi / non-vegetasi pada citra Sentinel-2 di wilayah Kota Padang Panjang.
