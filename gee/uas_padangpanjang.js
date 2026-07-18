// ==========================================
// 1. PENENTUAN ROI KOTA PADANG PANJANG, SUMBAR
// ==========================================
// Mengambil batas presisi administratif Kota Padang Panjang
var roi = ee.FeatureCollection("WM/geoLab/geoBoundaries/600/ADM2")
            .filter(ee.Filter.eq('shapeName', 'Kota Padang Panjang'));
            
// Memusatkan tampilan peta (Zoom level 13 cocok untuk kota kecil)
Map.centerObject(roi, 13);
Map.addLayer(roi, {}, 'Batas Kota Padang Panjang', false);

// ==========================================
// 2. FUNGSI PREPROCESSING & FITUR
// ==========================================
function maskS2clouds(image) {
  var qa = image.select('QA60');
  var cloudBitMask = 1 << 10;
  var cirrusBitMask = 1 << 11;
  var mask = qa.bitwiseAnd(cloudBitMask).eq(0)
                .and(qa.bitwiseAnd(cirrusBitMask).eq(0));
  return image.updateMask(mask).divide(10000)
              .copyProperties(image, ["system:time_start"]);
}

function addNDVI(image) {
  var ndvi = image.normalizedDifference(['B8', 'B4']).rename('NDVI');
  return image.addBands(ndvi);
}

// ==========================================
// 3. KOMPOSIT CITRA 2024 & 2025 (KONSISTEN)
// ==========================================
var bands = ['B2', 'B3', 'B4', 'B8', 'B11', 'B12', 'NDVI'];

var img2024 = ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED')
                .filterBounds(roi)
                .filterDate('2024-01-01', '2024-12-31') 
                .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 70))
                .map(maskS2clouds).map(addNDVI)
                .median().select(bands).clip(roi);

var img2025 = ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED')
                .filterBounds(roi)
                .filterDate('2025-01-01', '2025-12-31')
                .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 70))
                .map(maskS2clouds).map(addNDVI)
                .median().select(bands).clip(roi);

var rgbVis = {bands: ['B4', 'B3', 'B2'], min: 0, max: 0.3};
Map.addLayer(img2024, rgbVis, 'Citra 2024 (RGB)', false);
Map.addLayer(img2025, rgbVis, 'Citra 2025 (RGB)', false);

// ==========================================
// 4. PERSIAPAN DATA LATIH & SPLITTING (70:30)
// ==========================================
// PASTIKAN ANDA SUDAH MENITIK ULANG GEOMETRY (target24, dll) DI AREA PADANG PANJANG
var t24 = target24.map(function(f) { return f.set('class', 1).set('year', 2024); });
var nt24 = nontarget24.map(function(f) { return f.set('class', 0).set('year', 2024); });
var t25 = target25.map(function(f) { return f.set('class', 1).set('year', 2025); });
var nt25 = nontarget25.map(function(f) { return f.set('class', 0).set('year', 2025); });

var pts2024 = t24.merge(nt24);
var pts2025 = t25.merge(nt25);

var sample2024 = img2024.sampleRegions({
  collection: pts2024, properties: ['class', 'year'], scale: 10, tileScale: 16 
});

var sample2025 = img2025.sampleRegions({
  collection: pts2025, properties: ['class', 'year'], scale: 10, tileScale: 16
});

var trainingData = sample2024.merge(sample2025);

var withRandom = trainingData.randomColumn('random', 42); 
var trainSet = withRandom.filter(ee.Filter.lt('random', 0.7));
var testSet = withRandom.filter(ee.Filter.gte('random', 0.7));

// ==========================================
// 5. TRAINING MODEL RANDOM FOREST
// ==========================================
var rfModel = ee.Classifier.smileRandomForest(100)
                .train({
                  features: trainSet,
                  classProperty: 'class',
                  inputProperties: bands
                });

// ==========================================
// 6. EVALUASI MODEL DARI DATA TESTING (APRF)
// ==========================================
var testClassified = testSet.classify(rfModel);
var confusionMatrix = testClassified.errorMatrix('class', 'classification');

print('--- EVALUASI MODEL APRF PADANG PANJANG ---');
print('Confusion Matrix:');
print(confusionMatrix);
print('Accuracy (A):');
print(confusionMatrix.accuracy());
print('Recall / Producers Acc:');
print(confusionMatrix.producersAccuracy());
print('Precision / Consumers Acc:');
print(confusionMatrix.consumersAccuracy());
print('Total Sampel Data Keseluruhan:');
print(trainingData.size());

// ==========================================
// 7. KLASIFIKASI KOTA PADANG PANJANG (2024 & 2025)
// ==========================================
var class2024 = img2024.classify(rfModel);
var class2025 = img2025.classify(rfModel);

// ==========================================
// 8. DETEKSI PERUBAHAN & KALKULASI LUAS
// ==========================================
var gainMap = class2025.eq(1).and(class2024.eq(0));
var lossMap = class2024.eq(1).and(class2025.eq(0));

Map.addLayer(class2024.mask(class2024.eq(1)), {palette: ['green']}, 'Target 2024 (Hijau)', false);
Map.addLayer(class2025.mask(class2025.eq(1)), {palette: ['darkgreen']}, 'Target 2025 (Hijau Tua)', false);
Map.addLayer(gainMap.mask(gainMap), {palette: ['blue']}, 'Gain 2024-2025 (Biru)');
Map.addLayer(lossMap.mask(lossMap), {palette: ['red']}, 'Loss 2024-2025 (Merah)');

var areaImage = ee.Image.pixelArea();

var luasPadangPanjang = areaImage.reduceRegion({
  reducer: ee.Reducer.sum(),
  geometry: roi,
  scale: 10,
  maxPixels: 1e13,
  tileScale: 16 
}).getNumber('area').divide(10000);

print('--- DATA LUASAN UNTUK LAPORAN (Hektar) ---');
print('Luas Total Kota Padang Panjang (Ha):');
print(luasPadangPanjang);

function hitungLuas(imageMask, label) {
  var area = areaImage.updateMask(imageMask).reduceRegion({
    reducer: ee.Reducer.sum(),
    geometry: roi,
    scale: 10,
    maxPixels: 1e13,
    tileScale: 16
  }).getNumber('area').divide(10000);
  
  print('Luas ' + label + ' (Ha):');
  print(area);
}

hitungLuas(class2024.eq(1), 'Target Vegetasi 2024');
hitungLuas(class2025.eq(1), 'Target Vegetasi 2025');
hitungLuas(gainMap, 'Gain (Penambahan)');
hitungLuas(lossMap, 'Loss (Penyusutan)');

// ==========================================
// 9. VEKTORISASI & EKSPOR GEOJSON (RESOLUSI TINGGI)
// ==========================================
function exportToGeoJSON(imageMask, namaExport) {
  // PERBAIKAN KRUSIAL: Menambahkan .selfMask() agar nilai 0 (Non-target) 
  // dibuang sepenuhnya dan tidak ikut menjadi poligon.
  var onlyTarget = imageMask.selfMask();
  
  // Membersihkan noise/piksel tunggal di bawah 10 piksel
  var cleanedRaster = onlyTarget.updateMask(onlyTarget.connectedPixelCount(10).gte(10));
  
  var vektor = cleanedRaster.reduceToVectors({
    geometry: roi,
    crs: cleanedRaster.projection(),
    scale: 10, // Resolusi asli 10 meter
    geometryType: 'polygon',
    eightConnected: false,
    maxPixels: 1e13,
    tileScale: 16
  });
  
  // Simplifikasi geometri (memperhalus garis)
  var simplified = vektor.map(function(feat) {
    return feat.simplify({maxError: 5});
  });
  
  Export.table.toDrive({
    collection: simplified,
    description: namaExport,
    fileFormat: 'GeoJSON',
    folder: 'UAS_MahaData'
  });
}

// Menjalankan ekspor
exportToGeoJSON(class2024.eq(1), 'UAS_PadangPanjang_Target2024');
exportToGeoJSON(class2025.eq(1), 'UAS_PadangPanjang_Target2025');
exportToGeoJSON(gainMap, 'UAS_PadangPanjang_Gain');
exportToGeoJSON(lossMap, 'UAS_PadangPanjang_Loss');

Export.table.toDrive({
  collection: roi,
  description: 'UAS_PadangPanjang_BatasWilayah',
  fileFormat: 'GeoJSON',
  folder: 'UAS_MahaData'
});