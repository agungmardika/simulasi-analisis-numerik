/**
 * script.js - Logika Interaktif Simulasi Analisis Numerik
 * Tugas 4 Analisis Numerik - Mohammad Agung Dwi Mardika (NIM: 2511016110012)
 */

document.addEventListener("DOMContentLoaded", () => {
    // State Aplikasi
    let currentMethod = "tabel"; // 'tabel' | 'bisection' | 'newton'
    let chartInstance = null;
    let lastResultData = null;

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

    // Metadata untuk masing-masing metode
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

    // Inisialisasi Navigasi & Form
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

    // Submit Form
    simForm.addEventListener("submit", (e) => {
        e.preventDefault();
        runSimulation();
    });

    // Fungsi Utama Eksekusi Simulasi
    async function runSimulation() {
        hideAlert();
        btnSubmit.disabled = true;
        btnSubmit.textContent = "Menghitung...";

        const payload = {
            metode: currentMethod,
            fungsi: inputFunc.value.trim()
        };

        if (currentMethod === "tabel") {
            payload.a = parseFloat(inputA.value);
            payload.b = parseFloat(inputB.value);
            payload.n = parseInt(inputN.value, 10);
        } else if (currentMethod === "bisection") {
            payload.a = parseFloat(inputA.value);
            payload.b = parseFloat(inputB.value);
            payload.tol = parseFloat(inputTol.value);
            payload.max_iter = parseInt(inputMaxIter.value, 10);
        } else if (currentMethod === "newton") {
            payload.dfungsi = inputDfunc.value.trim();
            payload.x0 = parseFloat(inputX0.value);
            payload.tol = parseFloat(inputTol.value);
            payload.max_iter = parseInt(inputMaxIter.value, 10);
        }

        try {
            const resp = await fetch("/api/simulasi", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            const data = await resp.json();

            if (!resp.ok || data.status === "error") {
                throw new Error(data.message || "Gagal memproses simulasi numerik.");
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

    // Tampilkan Hasil (Stats, Grafik, dan Tabel)
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

    // Buat Kalimat Kesimpulan Otomatis Sesuai Metode
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

    // Render Grafik Menggunakan Chart.js
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
                tension: 0.15,
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
                animation: { duration: 350 },
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
                                return `x: ${context.parsed.x.toFixed(3)}, y: ${context.parsed.y.toFixed(3)}`;
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

    // Render Tabel Sesuai Metode
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
                    <td class="num">${row.x.toFixed(3)}</td>
                    <td class="num">${row.fx.toFixed(3)}</td>
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
                    <td class="num">${row.a.toFixed(3)}</td>
                    <td class="num">${row.b.toFixed(3)}</td>
                    <td class="num" style="font-weight: 600;">${row.c.toFixed(3)}</td>
                    <td class="num">${row.fa.toFixed(3)}</td>
                    <td class="num">${row.fb.toFixed(3)}</td>
                    <td class="num">${row.fc.toFixed(3)}</td>
                    <td class="num">${row.error.toFixed(3)}</td>
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
                    <td class="num">${row.xr.toFixed(3)}</td>
                    <td class="num">${row.fxr.toFixed(3)}</td>
                    <td class="num">${row.dfxr.toFixed(3)}</td>
                    <td class="num" style="font-weight: 600;">${row.xr1.toFixed(3)}</td>
                    <td class="num">${row.error.toFixed(3)}</td>
                `;
                tableBody.appendChild(tr);
            });
        }
    }

    // Utility: Format Number
    function formatNum(num) {
        if (num === null || num === undefined) return "-";
        if (typeof num === "number") {
            return num.toFixed(3);
        }
        return num;
    }

    // Helper Alert
    function showAlert(msg) {
        alertMsg.textContent = msg;
        alertBox.style.display = "flex";
        if (conclusionSection) conclusionSection.style.display = "none";
    }

    function hideAlert() {
        alertBox.style.display = "none";
    }

    // Eksekusi default saat pertama kali dimuat
    runSimulation();
});
