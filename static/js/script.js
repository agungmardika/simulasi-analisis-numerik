/**
 * script.js - Logika Interaktif Simulasi Analisis Numerik
 * Tugas 4 Analisis Numerik - Mohammad Agung Dwi Mardika (NIM: 2511016110012)
 * Didukung kalkulasi Client-Side murni (kompatibel GitHub Pages & Offline).
 */

document.addEventListener("DOMContentLoaded", () => {
    // State Aplikasi
    let currentMethod = "tabel"; // 'tabel' | 'bisection' | 'newton'
    let chartInstance = null;
    let lastResultData = null;
    let currentPrecision = 4; // Default presisi desimal

    // DOM Elements
    const navButtons = document.querySelectorAll(".nav-btn");
    const pageTitle = document.getElementById("page-title");
    const pageDesc = document.getElementById("page-desc");
    const simForm = document.getElementById("sim-form");
    const btnSubmit = document.getElementById("btn-submit");
    const alertBox = document.getElementById("alert-box");
    const alertMsg = document.getElementById("alert-msg");
    const chartStatus = document.getElementById("chart-status");
    const conclusionSection = document.getElementById("conclusion-section");
    const conclusionText = document.getElementById("conclusion-text");

    // Action Buttons & Selectors
    const btnCopyTable = document.getElementById("btn-copy-table");
    const btnDownloadCsv = document.getElementById("btn-download-csv");
    const selectPrecision = document.getElementById("select-precision");

    // Summary Elements
    const statAkar = document.getElementById("stat-akar");
    const statFx = document.getElementById("stat-fx");
    const statIter = document.getElementById("stat-iter");
    const statConverge = document.getElementById("stat-converge");

    // Table Elements
    const tableHead = document.getElementById("table-head");
    const tableBody = document.getElementById("table-body");
    const tableSubtitle = document.getElementById("table-subtitle");

    // Theory Element
    const theoryContent = document.getElementById("theory-content");

    // Form inputs
    const inputFunc = document.getElementById("input-func");
    const inputDfunc = document.getElementById("input-dfunc");
    const inputA = document.getElementById("input-a");
    const inputB = document.getElementById("input-b");
    const inputN = document.getElementById("input-n");
    const inputX0 = document.getElementById("input-x0");
    const inputTol = document.getElementById("input-tol");
    const inputMaxIter = document.getElementById("input-max-iter");

    // ==========================================
    // METADATA & TEORI METODE
    // ==========================================
    const METHOD_CONFIG = {
        tabel: {
            title: "Metode Tabel (Pencarian Inkremental)",
            desc: "Membagi domain nilai interval [a, b] menjadi N bagian berukuran sama (h) untuk mendeteksi perubahan tanda f(x) dan taksiran akar.",
            subtitle: "Daftar titik partisi xi, evaluasi f(xi), dan deteksi interval akar.",
            theory: `
                <p>Metode Tabel bekerja dengan membagi selang <code>[a, b]</code> menjadi <code>N</code> bagian dengan lebar langkah <code>h = (b - a) / N</code>.</p>
                <div class="formula-box">
                    x<sub>i</sub> = a + i &times; h &emsp; (untuk i = 0, 1, 2, ..., N)<br>
                    Jika f(x<sub>k</sub>) &times; f(x<sub>k+1</sub>) &le; 0 &rarr; Akar berada di antara [x<sub>k</sub>, x<sub>k+1</sub>]
                </div>
                <div class="theory-grid">
                    <div class="theory-col">
                        <h3>Karakteristik & Kelebihan</h3>
                        <ul>
                            <li>Sederhana dan mudah diamati secara visual pergerakan tandanya.</li>
                            <li>Mampu mendeteksi beberapa selang akar sekaligus jika terdapat lebih dari satu perubahan tanda.</li>
                            <li>Bagus sebagai tebakan awal sebelum dihaluskan dengan metode lain.</li>
                        </ul>
                    </div>
                    <div class="theory-col">
                        <h3>Batasan</h3>
                        <ul>
                            <li>Akurasi bergantung langsung pada jumlah partisi <code>N</code>.</li>
                            <li>Jika langkah <code>h</code> terlalu lebar, akar yang saling berdekatan bisa terlewat.</li>
                        </ul>
                    </div>
                </div>
            `
        },
        bisection: {
            title: "Metode Bagi Dua (Bisection / Bolzano)",
            desc: "Metode pengurung interval tertutup yang membagi dua selang [a, b] secara iteratif hingga lebar selang lebih kecil dari toleransi yang ditetapkan.",
            subtitle: "Daftar iterasi penyempitan interval [a, b] dan nilai tengah c.",
            theory: `
                <p>Metode Bagi Dua adalah metode bracketing yang mensyaratkan <code>f(a) &times; f(b) < 0</code> (berlainan tanda).</p>
                <div class="formula-box">
                    Titik Tengah: c = (a + b) / 2<br>
                    Jika f(a) &times; f(c) < 0 &rarr; b = c &emsp; | &emsp; Jika tidak &rarr; a = c<br>
                    Kriteria Berhenti: |b - a| &lt; &epsilon; atau |f(c)| &lt; &epsilon;
                </div>
                <div class="theory-grid">
                    <div class="theory-col">
                        <h3>Kelebihan</h3>
                        <ul>
                            <li>Dijamin selalu konvergen menuju akar jika f(a) dan f(b) berlainan tanda dan f(x) kontinu.</li>
                            <li>Stabil dan tidak membutuhkan turunan fungsi.</li>
                            <li>Laju kesalahan pasti berkurang setengah setiap iterasi: <code>error<sub>n</sub> = (b - a) / 2<sup>n</sup></code>.</li>
                        </ul>
                    </div>
                    <div class="theory-col">
                        <h3>Batasan</h3>
                        <ul>
                            <li>Laju konvergensi relatif lambat (kecepatan linear).</li>
                            <li>Tidak dapat mendeteksi akar ganda di mana kurva hanya menyinggung sumbu-X tanpa melintasinya.</li>
                        </ul>
                    </div>
                </div>
            `
        },
        newton: {
            title: "Metode Newton-Raphson",
            desc: "Metode terbuka berbasis garis singgung kemiringan turunan f'(x) dengan laju konvergensi kuadratik yang sangat cepat mendekati akar.",
            subtitle: "Daftar iterasi pendekatan garis singgung x_{r+1} = x_r - f(x_r) / f'(x_r).",
            theory: `
                <p>Metode Newton-Raphson menggunakan pendekatan garis singgung deret Taylor orde pertama dari titik tebakan awal x₀.</p>
                <div class="formula-box">
                    x<sub>r+1</sub> = x<sub>r</sub> - [ f(x<sub>r</sub>) / f'(x<sub>r</sub>) ]<br>
                    Kriteria Berhenti: |x<sub>r+1</sub> - x<sub>r</sub>| &lt; &epsilon; atau |f(x<sub>r+1</sub>)| &lt; &epsilon;
                </div>
                <div class="theory-grid">
                    <div class="theory-col">
                        <h3>Kelebihan</h3>
                        <ul>
                            <li>Konvergensi kuadratik (sangat cepat menemukan akar dalam sedikit iterasi).</li>
                            <li>Hanya membutuhkan satu titik tebakan awal x₀.</li>
                        </ul>
                    </div>
                    <div class="theory-col">
                        <h3>Batasan & Risiko</h3>
                        <ul>
                            <li>Divergen jika <code>f'(x) &approx; 0</code> (garis singgung horizontal memicu pembagian dengan nol).</li>
                            <li>Bisa terjadi osilasi jika tebakan awal terlalu jauh dari lokasi akar sebenarnya.</li>
                        </ul>
                    </div>
                </div>
            `
        }
    };

    // ==========================================
    // MESIN MATEMATIKA CLIENT-SIDE (JAVASCRIPT)
    // ==========================================
    function sanitizeExpr(expr) {
        let s = expr.trim();
        // Ganti operator pangkat ^ menjadi **
        s = s.replace(/\^/g, '**');

        // Ganti logaritma natural
        s = s.replace(/\bln\(/g, 'Math.log(');
        s = s.replace(/\blog10\(/g, 'Math.log10(');
        s = s.replace(/\blog\(/g, 'Math.log(');

        // Ganti fungsi matematika standar
        const mathFuncs = [
            'sin', 'cos', 'tan', 'asin', 'acos', 'atan',
            'sinh', 'cosh', 'tanh', 'exp', 'sqrt', 'abs', 'cbrt'
        ];
        mathFuncs.forEach(fn => {
            const regex = new RegExp(`\\b${fn}\\(`, 'g');
            s = s.replace(regex, `Math.${fn}(`);
        });

        // Ganti konstanta
        s = s.replace(/\bpi\b/gi, 'Math.PI');
        s = s.replace(/\be\b(?!\w)/g, 'Math.E');

        // Perkalian implisit (contoh: 2x -> 2*x, 3( -> 3*(, )x -> )*x)
        s = s.replace(/(\d+)([a-zA-Z(])/g, '$1*$2');
        s = s.replace(/(\))([a-zA-Z\d(])/g, '$1*$2');
        s = s.replace(/\bx\(/g, 'x*(');

        return s;
    }

    function evaluateF(expr, x) {
        const sanitized = sanitizeExpr(expr);
        try {
            const fn = new Function('x', 'Math', `"use strict"; return (${sanitized});`);
            const val = Number(fn(x, Math));
            if (isNaN(val) || !isFinite(val)) {
                throw new Error(`Hasil f(${x.toFixed(4)}) tidak terdefinisi (NaN atau Tak Hingga).`);
            }
            return val;
        } catch (err) {
            throw new Error(`Gagal mengevaluasi fungsi pada x=${x.toFixed(4)}: ${err.message}`);
        }
    }

    function evaluateDf(expr, dExpr, x, h = 1e-5) {
        if (dExpr && dExpr.trim()) {
            return evaluateF(dExpr, x);
        }
        // Pendekatan selisih pusat (central difference)
        const fPlus = evaluateF(expr, x + h);
        const fMinus = evaluateF(expr, x - h);
        return (fPlus - fMinus) / (2.0 * h);
    }

    function generatePlotPoints(expr, xMin, xMax, numPoints = 120) {
        const points = [];
        if (xMax <= xMin) {
            xMin -= 2;
            xMax += 2;
        }
        const step = (xMax - xMin) / Math.max(numPoints, 10);
        for (let i = 0; i <= numPoints; i++) {
            const x = xMin + i * step;
            try {
                const y = evaluateF(expr, x);
                if (Math.abs(y) < 1e7) {
                    points.push({ x: Number(x.toFixed(5)), y: Number(y.toFixed(5)) });
                } else {
                    points.push({ x: Number(x.toFixed(5)), y: null });
                }
            } catch {
                points.push({ x: Number(x.toFixed(5)), y: null });
            }
        }
        return points;
    }

    function solveMetodeTabel(funcStr, a, b, n = 10) {
        if (n < 1) throw new Error("Jumlah partisi (N) minimal harus 1.");
        if (b <= a) throw new Error("Batas atas (b) harus lebih besar dari batas bawah (a).");

        const h = (b - a) / n;
        const table = [];
        const signChanges = [];
        let minAbsFx = Infinity;
        let bestIdx = 0;

        for (let i = 0; i <= n; i++) {
            const xi = a + (i * h);
            const fxi = evaluateF(funcStr, xi);
            const absFx = Math.abs(fxi);

            if (absFx < minAbsFx) {
                minAbsFx = absFx;
                bestIdx = i;
            }

            const row = {
                iterasi: i,
                x: xi,
                fx: fxi,
                sign_change: false,
                is_best: false,
                keterangan: "-"
            };
            table.push(row);

            if (i > 0) {
                const prevFx = table[i - 1].fx;
                if ((prevFx * fxi) <= 0) {
                    table[i - 1].sign_change = true;
                    table[i].sign_change = true;
                    const xPrev = table[i - 1].x;
                    signChanges.push([xPrev, row.x]);
                    table[i].keterangan = `Akar di antara [${xPrev.toFixed(currentPrecision)}, ${row.x.toFixed(currentPrecision)}]`;
                }
            }
        }

        table[bestIdx].is_best = true;
        if (table[bestIdx].keterangan === "-") {
            table[bestIdx].keterangan = "Aproksimasi terbaik (|f(x)| minimum)";
        } else {
            table[bestIdx].keterangan += " & |f(x)| terdekat ke nol";
        }

        const padding = (b - a) * 0.15;
        const plotPoints = generatePlotPoints(funcStr, a - padding, b + padding);

        return {
            status: "success",
            metode: "Metode Tabel",
            fungsi: funcStr,
            a: a,
            b: b,
            h: h,
            n: n,
            akar: table[bestIdx].x,
            fx_akar: table[bestIdx].fx,
            sign_changes: signChanges,
            table: table,
            plot_points: plotPoints
        };
    }

    function solveMetodeBisection(funcStr, a, b, tol = 0.0001, maxIter = 50) {
        if (b <= a) throw new Error("Batas atas (b) harus lebih besar dari batas bawah (a).");
        if (tol <= 0) throw new Error("Toleransi error harus bernilai positif.");
        if (maxIter < 1) throw new Error("Maksimum iterasi minimal 1.");

        const fa = evaluateF(funcStr, a);
        const fb = evaluateF(funcStr, b);

        if (fa * fb > 0) {
            throw new Error(
                `f(a) = ${fa.toFixed(currentPrecision)} dan f(b) = ${fb.toFixed(currentPrecision)} memiliki tanda yang sama (f(a) × f(b) > 0). ` +
                `Metode Bagi Dua mensyaratkan f(a) dan f(b) berlawanan tanda agar dapat mengurung akar.`
            );
        }

        const table = [];
        let converged = false;
        let currentA = a;
        let currentB = b;
        let currentFa = fa;
        let currentFb = fb;
        let c = (a + b) / 2.0;
        let fc = evaluateF(funcStr, c);
        const rootHistory = [];

        for (let i = 1; i <= maxIter; i++) {
            c = (currentA + currentB) / 2.0;
            fc = evaluateF(funcStr, c);
            const error = Math.abs(currentB - currentA);
            rootHistory.push({ iterasi: i, x: c, y: fc });

            table.push({
                iterasi: i,
                a: currentA,
                b: currentB,
                c: c,
                fa: currentFa,
                fb: currentFb,
                fc: fc,
                error: error
            });

            if (error < tol || Math.abs(fc) < 1e-12) {
                converged = true;
                break;
            }

            if (currentFa * fc < 0) {
                currentB = c;
                currentFb = fc;
            } else {
                currentA = c;
                currentFa = fc;
            }
        }

        const domainMin = Math.min(a, b) - Math.abs(b - a) * 0.2;
        const domainMax = Math.max(a, b) + Math.abs(b - a) * 0.2;
        const plotPoints = generatePlotPoints(funcStr, domainMin, domainMax);

        return {
            status: "success",
            metode: "Metode Bagi Dua (Bisection)",
            fungsi: funcStr,
            a_awal: a,
            b_awal: b,
            akar: c,
            fx_akar: fc,
            total_iterasi: table.length,
            converged: converged,
            toleransi: tol,
            table: table,
            plot_points: plotPoints,
            root_history: rootHistory
        };
    }

    function solveMetodeNewton(funcStr, dfuncStr, x0, tol = 0.0001, maxIter = 50) {
        if (tol <= 0) throw new Error("Toleransi error harus bernilai positif.");
        if (maxIter < 1) throw new Error("Maksimum iterasi minimal 1.");

        const table = [];
        let xr = Number(x0);
        let converged = false;
        const rootHistory = [];

        for (let i = 1; i <= maxIter; i++) {
            const fxr = evaluateF(funcStr, xr);
            const dfxr = evaluateDf(funcStr, dfuncStr, xr);

            rootHistory.push({ iterasi: i, x: xr, y: fxr });

            if (Math.abs(dfxr) < 1e-12) {
                throw new Error(
                    `Turunan f'(${xr.toFixed(currentPrecision)}) = ${dfxr.toFixed(currentPrecision)} mendekati nol pada iterasi ${i}. ` +
                    `Garis singgung horizontal membuat pembagian nol sehingga metode divergen.`
                );
            }

            const xr1 = xr - (fxr / dfxr);
            const error = Math.abs(xr1 - xr);

            table.push({
                iterasi: i,
                xr: xr,
                fxr: fxr,
                dfxr: dfxr,
                xr1: xr1,
                error: error
            });

            if (error < tol || Math.abs(evaluateF(funcStr, xr1)) < 1e-12) {
                converged = true;
                xr = xr1;
                rootHistory.push({ iterasi: i + 1, x: xr, y: evaluateF(funcStr, xr) });
                break;
            }

            xr = xr1;
        }

        const fxFinal = evaluateF(funcStr, xr);
        const allX = table.map(r => r.xr).concat([xr]);
        const minX = Math.min(...allX);
        const maxX = Math.max(...allX);
        const span = Math.max(Math.abs(maxX - minX), 2.0);
        const plotPoints = generatePlotPoints(funcStr, minX - span * 0.3, maxX + span * 0.3);

        return {
            status: "success",
            metode: "Metode Newton-Raphson",
            fungsi: funcStr,
            turunan: (dfuncStr && dfuncStr.trim()) ? dfuncStr.trim() : "Numerik (Central Difference)",
            x0: x0,
            akar: xr,
            fx_akar: fxFinal,
            total_iterasi: table.length,
            converged: converged,
            toleransi: tol,
            table: table,
            plot_points: plotPoints,
            root_history: rootHistory
        };
    }

    // ==========================================
    // INISIALISASI NAVIGASI & FORM
    // ==========================================
    function setMethod(method) {
        if (!METHOD_CONFIG[method]) return;
        currentMethod = method;

        // Update active class pada tombol nav
        navButtons.forEach(btn => {
            if (btn.dataset.target === method) {
                btn.classList.add("active");
            } else {
                btn.classList.remove("active");
            }
        });

        // Update header & teori
        const conf = METHOD_CONFIG[method];
        pageTitle.textContent = conf.title;
        pageDesc.textContent = conf.desc;
        tableSubtitle.textContent = conf.subtitle;
        theoryContent.innerHTML = conf.theory;

        // Toggle visibilitas field input form
        document.querySelectorAll(".method-field").forEach(el => el.style.display = "none");

        if (method === "tabel") {
            document.querySelectorAll(".tabel-and-bisection, .tabel-only").forEach(el => el.style.display = "flex");
        } else if (method === "bisection") {
            document.querySelectorAll(".tabel-and-bisection, .bisection-and-newton").forEach(el => el.style.display = "flex");
        } else if (method === "newton") {
            document.querySelectorAll(".newton-only, .bisection-and-newton").forEach(el => el.style.display = "flex");
        }

        window.location.hash = method;
        hideAlert();
    }

    // Event Listener Navigasi Tab
    navButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            setMethod(btn.dataset.target);
            runSimulation();
        });
    });

    // Handle Hash URL saat halaman dimuat
    const hash = window.location.hash.replace("#", "");
    if (hash && METHOD_CONFIG[hash]) {
        setMethod(hash);
    } else {
        setMethod("tabel");
    }

    // Event Preset Buttons
    document.querySelectorAll(".btn-preset").forEach(btn => {
        btn.addEventListener("click", () => {
            inputFunc.value = btn.dataset.func || inputFunc.value;
            if (btn.dataset.a) inputA.value = btn.dataset.a;
            if (btn.dataset.b) inputB.value = btn.dataset.b;
            if (btn.dataset.x0) inputX0.value = btn.dataset.x0;
            runSimulation();
        });
    });

    // Event Presisi Angka Desimal
    if (selectPrecision) {
        selectPrecision.addEventListener("change", (e) => {
            currentPrecision = parseInt(e.target.value, 10);
            if (lastResultData) {
                renderResults(lastResultData);
            }
        });
    }

    // Event Salin Tabel (Clipboard)
    if (btnCopyTable) {
        btnCopyTable.addEventListener("click", copyTableToClipboard);
    }

    // Event Unduh CSV
    if (btnDownloadCsv) {
        btnDownloadCsv.addEventListener("click", downloadTableCSV);
    }

    // Submit Form
    simForm.addEventListener("submit", (e) => {
        e.preventDefault();
        runSimulation();
    });

    // ==========================================
    // EKSEKUSI SIMULASI
    // ==========================================
    function runSimulation() {
        hideAlert();
        btnSubmit.disabled = true;
        btnSubmit.textContent = "Menghitung...";

        const funcVal = inputFunc.value.trim();
        if (!funcVal) {
            showAlert("Fungsi f(x) tidak boleh kosong.");
            btnSubmit.disabled = false;
            btnSubmit.textContent = "Jalankan Simulasi";
            return;
        }

        try {
            let data = null;

            if (currentMethod === "tabel") {
                const a = parseFloat(inputA.value);
                const b = parseFloat(inputB.value);
                const n = parseInt(inputN.value, 10);
                data = solveMetodeTabel(funcVal, a, b, n);

            } else if (currentMethod === "bisection") {
                const a = parseFloat(inputA.value);
                const b = parseFloat(inputB.value);
                const tol = parseFloat(inputTol.value);
                const maxIter = parseInt(inputMaxIter.value, 10);
                data = solveMetodeBisection(funcVal, a, b, tol, maxIter);

            } else if (currentMethod === "newton") {
                const dfunc = inputDfunc.value.trim();
                const x0 = parseFloat(inputX0.value);
                const tol = parseFloat(inputTol.value);
                const maxIter = parseInt(inputMaxIter.value, 10);
                data = solveMetodeNewton(funcVal, dfunc, x0, tol, maxIter);
            }

            lastResultData = data;
            renderResults(data);

        } catch (err) {
            showAlert(err.message);
            chartStatus.className = "status-pill status-error";
            chartStatus.textContent = "Error Komputasi";
        } finally {
            btnSubmit.disabled = false;
            btnSubmit.textContent = "Jalankan Simulasi";
        }
    }

    // ==========================================
    // RENDER HASIL
    // ==========================================
    function renderResults(data) {
        // 1. Update Stat Cards
        statAkar.textContent = formatNum(data.akar);
        statFx.textContent = formatNum(data.fx_akar !== undefined ? data.fx_akar : data.fc_akar);

        if (currentMethod === "tabel") {
            statIter.textContent = `${data.n} Partisi (N)`;
            statConverge.textContent = data.sign_changes.length > 0
                ? `${data.sign_changes.length} Selang Berbeda Tanda`
                : "Aproksimasi Terdekat";
            chartStatus.className = "status-pill status-success";
            chartStatus.textContent = "Selesai Evaluasi";
        } else {
            statIter.textContent = `${data.total_iterasi} Iterasi`;
            if (data.converged) {
                statConverge.textContent = "Konvergen (Toleransi Tercapai)";
                statConverge.style.color = "var(--status-success-text)";
                chartStatus.className = "status-pill status-success";
                chartStatus.textContent = "Konvergen";
            } else {
                statConverge.textContent = "Batas Iterasi Tercapai";
                statConverge.style.color = "var(--status-error-text)";
                chartStatus.className = "status-pill status-error";
                chartStatus.textContent = "Belum Konvergen";
            }
        }

        // 2. Render Chart
        renderChart(data);

        // 3. Render Table
        renderTable(data);

        // 4. Render Kesimpulan Perhitungan
        renderConclusion(data);
    }

    function renderConclusion(data) {
        if (!conclusionSection || !conclusionText) return;
        conclusionSection.style.display = "block";

        const funcStr = data.fungsi;
        const akarVal = formatNum(data.akar);
        const fxVal = formatNum(data.fx_akar !== undefined ? data.fx_akar : data.fc_akar);

        if (currentMethod === "tabel") {
            const bestRow = data.table.find(r => r.is_best) || data.table[0];
            let alasan = "";
            if (data.sign_changes && data.sign_changes.length > 0) {
                const firstInterval = data.sign_changes[0];
                alasan = `terjadi perubahan tanda nilai fungsi di sekitar selang [${formatNum(firstInterval[0])}, ${formatNum(firstInterval[1])}] dan menghasilkan nilai <code>f(x) = ${fxVal}</code> (paling mendekati nol).`;
            } else {
                alasan = `menghasilkan nilai <code>f(x) = ${fxVal}</code> yang paling mendekati nol di antara seluruh titik partisi selang.`;
            }
            conclusionText.innerHTML = `Fungsi <code>f(x) = ${funcStr}</code> mendapat taksiran akar <strong>x &approx; ${akarVal}</strong> pada titik partisi ke-<strong>${bestRow.iterasi}</strong> (dari ${data.n} partisi), karena ${alasan}`;

        } else if (currentMethod === "bisection") {
            if (data.converged) {
                const lastRow = data.table[data.table.length - 1];
                const lebarSelang = formatNum(lastRow.error);
                conclusionText.innerHTML = `Fungsi <code>f(x) = ${funcStr}</code> mendapat akar <strong>x &approx; ${akarVal}</strong> pada iterasi ke-<strong>${data.total_iterasi}</strong> (dengan f(x) = ${fxVal}), karena lebar selang pengurung <code>|b - a| = ${lebarSelang}</code> telah mencapai batas toleransi galat (&epsilon; = ${formatNum(data.toleransi)}).`;
            } else {
                conclusionText.innerHTML = `Fungsi <code>f(x) = ${funcStr}</code> berhenti pada iterasi ke-<strong>${data.total_iterasi}</strong> dengan taksiran akar <strong>x &approx; ${akarVal}</strong>, karena telah mencapai batas maksimum iterasi sebelum memenuhi batas toleransi &epsilon; = ${formatNum(data.toleransi)}.`;
            }

        } else if (currentMethod === "newton") {
            if (data.converged) {
                const lastRow = data.table[data.table.length - 1];
                const selisih = formatNum(lastRow.error);
                conclusionText.innerHTML = `Fungsi <code>f(x) = ${funcStr}</code> mendapat akar <strong>x &approx; ${akarVal}</strong> pada iterasi ke-<strong>${data.total_iterasi}</strong> (dengan f(x) = ${fxVal}), karena selisih antar langkah iterasi <code>|x<sub>r+1</sub> - x<sub>r</sub>| = ${selisih}</code> telah lebih kecil dari batas toleransi galat (&epsilon; = ${formatNum(data.toleransi)}).`;
            } else {
                conclusionText.innerHTML = `Fungsi <code>f(x) = ${funcStr}</code> berhenti pada iterasi ke-<strong>${data.total_iterasi}</strong> dengan taksiran akar <strong>x &approx; ${akarVal}</strong>, karena telah mencapai batas maksimum iterasi sebelum selisih langkah memenuhi toleransi &epsilon; = ${formatNum(data.toleransi)}.`;
            }
        }
    }

    function renderChart(data) {
        const ctx = document.getElementById("functionChart").getContext("2d");

        const curvePoints = data.plot_points.map(p => ({ x: p.x, y: p.y }));
        const rootPoint = [{ x: data.akar, y: data.fx_akar !== undefined ? data.fx_akar : (data.fc_akar || 0) }];

        const datasets = [
            {
                label: `f(x) = ${data.fungsi}`,
                data: curvePoints,
                borderColor: "#2563eb",
                backgroundColor: "transparent",
                borderWidth: 2,
                pointRadius: 0,
                tension: 0, // Garis linear eksak tanpa cubic spline overshoot
                type: "line"
            },
            {
                label: `Akar x = ${formatNum(data.akar)}`,
                data: rootPoint,
                borderColor: "#dc2626",
                backgroundColor: "#dc2626",
                pointRadius: 6,
                pointHoverRadius: 8,
                type: "scatter"
            }
        ];

        if (data.root_history && data.root_history.length > 0) {
            const historyPoints = data.root_history.map(pt => ({ x: pt.x, y: pt.y }));
            datasets.push({
                label: "Titik Langkah Iterasi",
                data: historyPoints,
                borderColor: "#64748b",
                backgroundColor: "#94a3b8",
                pointRadius: 3.5,
                type: "scatter"
            });
        }

        if (chartInstance) {
            chartInstance.destroy();
        }

        chartInstance = new Chart(ctx, {
            type: "line",
            data: { datasets: datasets },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: { duration: 300 },
                plugins: {
                    legend: {
                        position: "top",
                        labels: {
                            font: { family: "sans-serif", size: 12 },
                            boxWidth: 14
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `x: ${context.parsed.x.toFixed(currentPrecision)}, y: ${context.parsed.y.toFixed(currentPrecision)}`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        type: "linear",
                        title: { display: true, text: "Sumbu X", font: { weight: "bold" } },
                        grid: { color: "#e2e8f0" }
                    },
                    y: {
                        type: "linear",
                        title: { display: true, text: "Sumbu Y = f(x)", font: { weight: "bold" } },
                        grid: {
                            color: function(context) {
                                if (context.tick.value === 0) return "#475569";
                                return "#f1f5f9";
                            },
                            lineWidth: function(context) {
                                return context.tick.value === 0 ? 1.5 : 1;
                            }
                        }
                    }
                }
            }
        });
    }

    function renderTable(data) {
        tableHead.innerHTML = "";
        tableBody.innerHTML = "";

        if (currentMethod === "tabel") {
            tableHead.innerHTML = `
                <tr>
                    <th style="width: 65px;">i</th>
                    <th class="num">x</th>
                    <th class="num">f(x)</th>
                    <th>Tanda</th>
                    <th>Keterangan Evaluasi</th>
                </tr>
            `;

            data.table.forEach(row => {
                const tr = document.createElement("tr");
                if (row.is_best) tr.classList.add("highlight-row");

                const signBadge = row.fx > 0
                    ? `<span class="badge-tag badge-sign">+</span>`
                    : (row.fx < 0 ? `<span class="badge-tag badge-sign">&minus;</span>` : `<span class="badge-tag badge-root">0</span>`);

                let ketBadge = row.keterangan;
                if (row.is_best) {
                    ketBadge = `<span class="badge-tag badge-root">Taksiran Akar</span> ${row.keterangan}`;
                }

                tr.innerHTML = `
                    <td>${row.iterasi}</td>
                    <td class="num">${formatNum(row.x)}</td>
                    <td class="num">${formatNum(row.fx)}</td>
                    <td>${signBadge}</td>
                    <td>${ketBadge}</td>
                `;
                tableBody.appendChild(tr);
            });

        } else if (currentMethod === "bisection") {
            tableHead.innerHTML = `
                <tr>
                    <th style="width: 60px;">Iter</th>
                    <th class="num">a</th>
                    <th class="num">b</th>
                    <th class="num">c = (a+b)/2</th>
                    <th class="num">f(a)</th>
                    <th class="num">f(b)</th>
                    <th class="num">f(c)</th>
                    <th class="num">Lebar |b-a|</th>
                </tr>
            `;

            data.table.forEach((row, idx) => {
                const tr = document.createElement("tr");
                const isLast = idx === data.table.length - 1;
                if (isLast && data.converged) tr.classList.add("highlight-row");

                tr.innerHTML = `
                    <td>${row.iterasi}</td>
                    <td class="num">${formatNum(row.a)}</td>
                    <td class="num">${formatNum(row.b)}</td>
                    <td class="num" style="font-weight: 600;">${formatNum(row.c)}</td>
                    <td class="num">${formatNum(row.fa)}</td>
                    <td class="num">${formatNum(row.fb)}</td>
                    <td class="num">${formatNum(row.fc)}</td>
                    <td class="num">${formatNum(row.error)}</td>
                `;
                tableBody.appendChild(tr);
            });

        } else if (currentMethod === "newton") {
            tableHead.innerHTML = `
                <tr>
                    <th style="width: 60px;">Iter</th>
                    <th class="num">x<sub>r</sub></th>
                    <th class="num">f(x<sub>r</sub>)</th>
                    <th class="num">f'(x<sub>r</sub>)</th>
                    <th class="num">x<sub>r+1</sub></th>
                    <th class="num">Error |x<sub>r+1</sub> - x<sub>r</sub>|</th>
                </tr>
            `;

            data.table.forEach((row, idx) => {
                const tr = document.createElement("tr");
                const isLast = idx === data.table.length - 1;
                if (isLast && data.converged) tr.classList.add("highlight-row");

                tr.innerHTML = `
                    <td>${row.iterasi}</td>
                    <td class="num">${formatNum(row.xr)}</td>
                    <td class="num">${formatNum(row.fxr)}</td>
                    <td class="num">${formatNum(row.dfxr)}</td>
                    <td class="num" style="font-weight: 600;">${formatNum(row.xr1)}</td>
                    <td class="num">${formatNum(row.error)}</td>
                `;
                tableBody.appendChild(tr);
            });
        }
    }

    // ==========================================
    // UTILITY: FORMAT NUMBER, COPY & CSV
    // ==========================================
    function formatNum(num) {
        if (num === null || num === undefined) return "-";
        if (typeof num === "number") {
            return num.toFixed(currentPrecision);
        }
        return num;
    }

    function copyTableToClipboard() {
        if (!lastResultData || !lastResultData.table || lastResultData.table.length === 0) {
            showAlert("Belum ada data tabel yang bisa disalin.");
            return;
        }

        const tableEl = document.getElementById("iteration-table");
        let text = "";

        // Ambil Header
        const headers = Array.from(tableEl.querySelectorAll("thead th")).map(th => th.innerText.trim());
        text += headers.join("\t") + "\n";

        // Ambil Baris Data
        const rows = tableEl.querySelectorAll("tbody tr");
        rows.forEach(r => {
            const cols = Array.from(r.querySelectorAll("td")).map(td => td.innerText.trim());
            text += cols.join("\t") + "\n";
        });

        navigator.clipboard.writeText(text).then(() => {
            const originalText = btnCopyTable.innerHTML;
            btnCopyTable.innerHTML = "✓ Tersalin!";
            btnCopyTable.style.backgroundColor = "var(--status-success-bg)";
            btnCopyTable.style.color = "var(--status-success-text)";
            setTimeout(() => {
                btnCopyTable.innerHTML = originalText;
                btnCopyTable.style.backgroundColor = "";
                btnCopyTable.style.color = "";
            }, 2000);
        }).catch(err => {
            showAlert("Gagal menyalin ke clipboard: " + err);
        });
    }

    function downloadTableCSV() {
        if (!lastResultData || !lastResultData.table || lastResultData.table.length === 0) {
            showAlert("Belum ada data tabel yang bisa diunduh.");
            return;
        }

        const tableEl = document.getElementById("iteration-table");
        let csv = [];

        // Header
        const headers = Array.from(tableEl.querySelectorAll("thead th")).map(th => `"${th.innerText.trim()}"`);
        csv.push(headers.join(","));

        // Rows
        const rows = tableEl.querySelectorAll("tbody tr");
        rows.forEach(r => {
            const cols = Array.from(r.querySelectorAll("td")).map(td => `"${td.innerText.trim()}"`);
            csv.push(cols.join(","));
        });

        const csvBlob = new Blob([csv.join("\r\n")], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        const filename = `numsim_${currentMethod}_${new Date().toISOString().slice(0, 10)}.csv`;
        link.href = URL.createObjectURL(csvBlob);
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    function showAlert(msg) {
        alertMsg.textContent = msg;
        alertBox.style.display = "flex";
        if (conclusionSection) conclusionSection.style.display = "none";
    }

    function hideAlert() {
        alertBox.style.display = "none";
    }

    // Eksekusi default saat pertama kali halaman dibuka
    runSimulation();
});
