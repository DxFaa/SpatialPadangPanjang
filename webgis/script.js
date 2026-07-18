document.addEventListener('DOMContentLoaded', () => {

    const TOTAL_CITY_AREA = 2102.89;
    let chartsInitialized = false;
    let areaChartInstance = null;
    let doughnutChartInstance = null;

    // --- 1. Tab Navigation Logic ---
    const navTabs = document.querySelectorAll('.nav-tab');
    const viewSections = document.querySelectorAll('.view-section');

    navTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            navTabs.forEach(t => t.classList.remove('active'));
            viewSections.forEach(v => v.classList.remove('active'));

            tab.classList.add('active');
            const targetId = tab.getAttribute('data-target');
            document.getElementById(targetId).classList.add('active');

            if (targetId === 'view-map' && map) {
                setTimeout(() => map.invalidateSize(), 100);
            }

            if (targetId === 'view-insight') {
                setTimeout(() => {
                    if (!chartsInitialized) {
                        initCharts();
                        chartsInitialized = true;
                    } else {
                        if (areaChartInstance) {
                            areaChartInstance.reset();
                            areaChartInstance.update();
                        }
                        if (doughnutChartInstance) {
                            doughnutChartInstance.reset();
                            doughnutChartInstance.update();
                        }
                    }
                }, 300); // Wait for tab slide-up animation to almost finish before starting chart animation
            }

            if (targetId === 'view-eval') {
                setTimeout(() => runCounters(), 300);
            }
        });
    });

    // --- 2. Leaflet Map Initialization & Turf.js Popup ---
    const map = L.map('map', { zoomControl: false }).setView([-0.4607, 100.4010], 13);
    L.control.zoom({ position: 'topright' }).addTo(map);

    // Tambahkan Skala (Scale Control)
    L.control.scale({ position: 'bottomleft', metric: true, imperial: false }).addTo(map);

    // Tambahkan Arah Mata Angin (North Arrow)
    const northArrow = L.control({ position: 'topright' });
    northArrow.onAdd = function() {
        const div = L.DomUtil.create('div', 'leaflet-control leaflet-bar');
        div.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
        div.style.padding = '4px 6px';
        div.style.textAlign = 'center';
        div.innerHTML = `
            <svg width="20" height="30" viewBox="0 0 24 36" xmlns="http://www.w3.org/2000/svg">
                <text x="12" y="12" font-family="Arial, sans-serif" font-size="14" font-weight="bold" text-anchor="middle" fill="#1e293b">N</text>
                <path d="M12 14 L18 34 L12 29 L6 34 Z" fill="#1e293b"/>
            </svg>
        `;
        return div;
    };
    northArrow.addTo(map);

    const basemap = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap', subdomains: 'abcd', maxZoom: 20
    }).addTo(map);

    // Format Coordinate Decimal to DMS (Degrees, Minutes, Seconds)
    function formatDMS(val, isLat) {
        const absVal = Math.abs(val);
        const deg = Math.floor(absVal);
        const minFloat = (absVal - deg) * 60;
        const min = Math.floor(minFloat);
        const sec = Math.round((minFloat - min) * 60);
        const dir = isLat ? (val >= 0 ? 'N' : 'S') : (val >= 0 ? 'E' : 'W');
        return `${deg}°${min}'${sec}"${dir}`;
    }

    // Tambahkan Garis Grid Koordinat (Graticule)
    L.latlngGraticule({
        showLabel: true,
        color: '#222',
        weight: 0.8,
        opacity: 0.4,
        font: '12px Inter, sans-serif',
        fontColor: '#1e293b',
        dashArray: [4, 4],
        lngFormatTickLabel: function(lng) { return formatDMS(lng, false); },
        latFormatTickLabel: function(lat) { return formatDMS(lat, true); },
        zoomInterval: [
            {start: 2, end: 3, interval: 30},
            {start: 4, end: 4, interval: 10},
            {start: 5, end: 7, interval: 5},
            {start: 8, end: 10, interval: 1},
            {start: 11, end: 12, interval: 0.1},
            {start: 13, end: 13, interval: 0.05},
            {start: 14, end: 15, interval: 0.02},
            {start: 16, end: 18, interval: 0.01}
        ]
    }).addTo(map);

    const styles = {
        batas: { color: '#1e293b', weight: 2, fillOpacity: 0, dashArray: '5, 5' },
        target2024: { color: '#22c55e', weight: 1, fillColor: '#22c55e', fillOpacity: 0.8 },
        target2025: { color: '#84cc16', weight: 1, fillColor: '#84cc16', fillOpacity: 0.8 },
        gain: { color: '#3b82f6', weight: 1, fillColor: '#3b82f6', fillOpacity: 0.8 },
        loss: { color: '#f43f5e', weight: 1, fillColor: '#f43f5e', fillOpacity: 0.8 }
    };

    const mapLayers = {
        basemap: basemap, batas: null, target2024: null, target2025: null, gain: null, loss: null
    };

    let globalOpacity = 0.8;

    async function loadGeoJSON(url, name, style, zIndex, layerKey) {
        try {
            const response = await fetch(url);
            const data = await response.json();

            const layer = L.geoJSON(data, {
                style: style,
                onEachFeature: function (feature, l) {
                    // TOOLTIP INTERAKTIF DENGAN TURF.JS
                    l.on('click', function (e) {
                        let popupContent = `<div style="font-family:Inter,sans-serif;">
                            <h4 style="margin:0 0 5px 0;color:#1e293b;">Kategori: ${name}</h4>`;
                        
                        // Hitung luas poligon individual jika bukan batas kota
                        if (layerKey !== 'batas') {
                            const areaSqMeters = turf.area(feature);
                            const areaHa = (areaSqMeters / 10000);
                            const pct = (areaHa / TOTAL_CITY_AREA) * 100;
                            
                            popupContent += `
                                <p style="margin:0 0 3px 0;font-size:13px;"><b>Luas Poligon:</b> ${areaHa.toLocaleString('id-ID', {maximumFractionDigits:2})} Ha</p>
                                <p style="margin:0;font-size:13px;"><b>Persentase thd Kota:</b> ${pct.toLocaleString('id-ID', {maximumFractionDigits:4})}%</p>
                            `;
                        }
                        popupContent += `</div>`;
                        
                        L.popup()
                            .setLatLng(e.latlng)
                            .setContent(popupContent)
                            .openOn(map);
                    });
                }
            });

            layer.setZIndex(zIndex);
            layer.addTo(map);
            mapLayers[layerKey] = layer;

            if (layerKey === 'batas') map.fitBounds(layer.getBounds());
            return true;
        } catch (error) {
            console.error(`Error loading ${name}:`, error);
        }
    }

    async function initMapData() {
        // Fungsi dinamis untuk mendapatkan URL root data yang kebal terhadap berbagai jenis deployment (Vercel / GitHub Pages)
        const getBaseUrl = () => {
            const path = window.location.pathname;
            if (path.includes('/webgis')) {
                return window.location.origin + path.substring(0, path.indexOf('/webgis')) + '/data/';
            }
            return '../data/'; // Fallback
        };
        const dataPath = getBaseUrl();
        
        await Promise.all([
            loadGeoJSON(dataPath + 'UAS_PadangPanjang_BatasWilayah.geojson', 'Batas Wilayah', styles.batas, 500, 'batas'),
            loadGeoJSON(dataPath + 'UAS_PadangPanjang_Target2024.geojson', 'Vegetasi 2024', styles.target2024, 100, 'target2024'),
            loadGeoJSON(dataPath + 'UAS_PadangPanjang_Target2025.geojson', 'Vegetasi 2025', styles.target2025, 200, 'target2025'),
            loadGeoJSON(dataPath + 'UAS_PadangPanjang_Loss.geojson', 'Berkurang (Loss)', styles.loss, 300, 'loss'),
            loadGeoJSON(dataPath + 'UAS_PadangPanjang_Gain.geojson', 'Bertambah (Gain)', styles.gain, 400, 'gain')
        ]);
        setupControls();
    }

    function setupControls() {
        const toggleLayer = (cbId, layerKey) => {
            const cb = document.getElementById(cbId);
            if(!cb) return;
            cb.addEventListener('change', (e) => {
                const layer = mapLayers[layerKey];
                if(layer) {
                    if(e.target.checked) map.addLayer(layer);
                    else map.removeLayer(layer);
                }
            });
        };

        ['basemap', 'batas', 'target2024', 'target2025', 'gain', 'loss'].forEach(key => toggleLayer(`cb-${key}`, key));

        const opacitySlider = document.getElementById('opacity-slider');
        if(opacitySlider) {
            opacitySlider.addEventListener('input', (e) => {
                globalOpacity = e.target.value / 100;
                ['target2024', 'target2025', 'gain', 'loss'].forEach(key => {
                    if(mapLayers[key]) mapLayers[key].setStyle({ fillOpacity: globalOpacity });
                });
            });
        }
    }

    // --- 3. Confusion Matrix Interactive Logic ---
    const cmCells = document.querySelectorAll('.cm-cell');
    const explBox = document.querySelector('.interpretation-box');
    
    // --- Counter Animation ---
    function runCounters() {
        const counters = document.querySelectorAll('.count-up');
        counters.forEach(counter => {
            const target = +counter.getAttribute('data-target');
            counter.innerText = '0%';
            
            const duration = 1200; // ms
            const stepTime = 20; // ms
            const steps = duration / stepTime;
            const increment = target / steps;
            let current = 0;
            
            const timer = setInterval(() => {
                current += increment;
                if (current >= target) {
                    current = target;
                    clearInterval(timer);
                }
                counter.innerText = current.toFixed(2) + '%';
            }, stepTime);
        });
    }
    
    // Mapping specific cards to highlight
    const cardMap = {
        'cell-tp': 'card-rec', // TP strongly affects Recall
        'cell-fp': 'card-prec', // FP strongly affects Precision
        'cell-fn': 'card-rec', // FN strongly affects Recall
        'cell-tn': 'card-acc'  // TN helps overall accuracy
    };

    cmCells.forEach(cell => {
        cell.addEventListener('mouseenter', (e) => {
            const tooltipText = e.target.getAttribute('data-tooltip');
            const classList = Array.from(e.target.classList);
            
            // Highlight corresponding metric card
            let highlightClass = '';
            let title = '';
            let icon = '';

            if(classList.includes('cell-tn')) { highlightClass = cardMap['cell-tn']; title = 'True Negative (TN)'; icon = '<i class="fa-solid fa-check text-success"></i>'; }
            if(classList.includes('cell-tp')) { highlightClass = cardMap['cell-tp']; title = 'True Positive (TP)'; icon = '<i class="fa-solid fa-check-double text-success"></i>'; }
            if(classList.includes('cell-fp')) { highlightClass = cardMap['cell-fp']; title = 'False Positive (FP)'; icon = '<i class="fa-solid fa-xmark text-danger"></i>'; }
            if(classList.includes('cell-fn')) { highlightClass = cardMap['cell-fn']; title = 'False Negative (FN)'; icon = '<i class="fa-solid fa-triangle-exclamation text-warning"></i>'; }

            document.querySelectorAll('.metric-card').forEach(c => c.classList.remove('active-hover'));
            if(highlightClass) document.getElementById(highlightClass).classList.add('active-hover');

            // Update explanation box
            explBox.classList.remove('default-msg');
            explBox.innerHTML = `<h4>${icon} ${title}</h4><p>${tooltipText}</p>`;
        });

        cell.addEventListener('mouseleave', () => {
            document.querySelectorAll('.metric-card').forEach(c => c.classList.remove('active-hover'));
            explBox.classList.add('default-msg');
            explBox.innerHTML = `<i class="fa-solid fa-arrow-pointer text-muted" style="font-size: 2rem; margin-bottom:10px; display:block;"></i><p>Silakan arahkan kursor Anda ke angka di dalam tabel Confusion Matrix untuk memunculkan penjelasan mendetail di sini.</p>`;
        });
    });

    // --- 4. Chart.js Initialization ---
    function initCharts() {
        const areaCtx = document.getElementById('areaChart');
        if(areaCtx) {
            areaChartInstance = new Chart(areaCtx, {
                type: 'bar',
                data: {
                    labels: ['2024', '2025'],
                    datasets: [{
                        label: 'Luas Vegetasi (Ha)',
                        data: [1362.58, 1491.82],
                        backgroundColor: ['#22c55e', '#84cc16'],
                        borderRadius: 6
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    animation: {
                        duration: 1500,
                        easing: 'easeOutQuart'
                    },
                    plugins: {
                        legend: { display: false },
                        tooltip: {
                            callbacks: {
                                label: (ctx) => ` ${ctx.parsed.y.toLocaleString('id-ID', {minimumFractionDigits:2, maximumFractionDigits:2})} Ha`
                            }
                        }
                    },
                    scales: { y: { beginAtZero: true, grid: { borderDash: [2, 4] } } }
                }
            });
        }

        const doughnutCtx = document.getElementById('doughnutChart');
        if(doughnutCtx) {
            doughnutChartInstance = new Chart(doughnutCtx, {
                type: 'doughnut',
                data: {
                    labels: ['Gain (Bertambah)', 'Loss (Berkurang)'],
                    datasets: [{
                        data: [176.76, 47.52],
                        backgroundColor: ['#3b82f6', '#f43f5e'],
                        borderWidth: 0,
                        hoverOffset: 4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    animation: {
                        duration: 1500,
                        easing: 'easeOutQuart'
                    },
                    plugins: {
                        legend: { position: 'bottom' },
                        tooltip: {
                            callbacks: {
                                label: (ctx) => ` ${ctx.label}: ${ctx.parsed.toLocaleString('id-ID', {minimumFractionDigits:2, maximumFractionDigits:2})} Ha`
                            }
                        }
                    },
                    cutout: '70%'
                }
            });
        }
    }

    // Init
    initMapData();
});
