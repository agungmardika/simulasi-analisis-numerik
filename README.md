# NumSim - Simulasi Analisis Numerik (3 Metode)

> **Tugas 4 Analisis Numerik**  
> Disusun oleh: **Mohammad Agung Dwi Mardika**  
> NIM: **2511016110012**  

🌐 **Live Demo (GitHub Pages):**  
[https://agungmardika.github.io/simulasi-analisis-numerik/](https://agungmardika.github.io/simulasi-analisis-numerik/)

---

## 📌 Deskripsi Proyek

**NumSim** adalah aplikasi web interaktif untuk simulasi dan perbandingan metode pencarian akar fungsi nonlinear (*root-finding algorithms*). Aplikasi ini dirancang dengan antarmuka yang bersih, utilitarian, berorientasi presisi teknis, dan mendukung eksekusi komputasi langsung di sisi peramban (*client-side* murni) maupun melalui server lokal Python.

---

## 🚀 Fitur Utama

1. **3 Pendekatan Metode Numerik**:
   - **Metode Tabel (Pencarian Inkremental)**: Membagi rentang $[a, b]$ ke dalam $N$ partisi langkah untuk mendeteksi perubahan tanda dan aproksimasi akar terdekat.
   - **Metode Bagi Dua (Bisection / Bolzano)**: Metode pengurung interval tertutup dengan jaminan konvergensi berbasis Teorema Nilai Antara.
   - **Metode Newton-Raphson**: Metode terbuka dengan laju konvergensi kuadratik berbasis garis singgung turunan $f'(x)$ (mendukung turunan simbolik maupun pendekatan numerik *central difference*).

2. **Visualisasi Kurva & Jejak Iterasi**:
   - Grafik fungsi $f(x)$ dinamis menggunakan Chart.js.
   - Penandaan titik akar eksak/taksiran dan jejak titik langkah iterasi.
   - Garis $y = 0$ tegas untuk mengamati perpotongan sumbu-X secara presisi.

3. **Tabel Komputasi Langkah demi Langkah**:
   - Detail evaluasi setiap iterasi hingga batas toleransi galat terpenuhi.
   - Penyorotan (*highlight*) otomatis baris akar terbaik.
   - **Pilihan Presisi Desimal**: Pengguna dapat memilih presisi (3, 4, 5, atau 6 angka di belakang koma).
   - **Salin Data (Clipboard)**: Format tab-separated siap *paste* langsung ke Microsoft Word / Excel.
   - **Unduh CSV**: Ekspor seluruh baris iterasi untuk lampiran laporan praktikum.

4. **Parser Matematika Fleksibel**:
   - Mendukung penulisan pangkat dengan tanda `^` maupun `**`.
   - Mendukung perkalian implisit (contoh: `2x`, `3(x+1)`, `x(x-1)`).
   - Mendukung fungsi umum: `sin`, `cos`, `tan`, `exp`, `ln`, `log10`, `sqrt`, `abs`.

---

## 📁 Struktur Direktori

```text
simulasi-analisis-numerik/
├── index.html            # Entry point web utama (Kompatibel dengan GitHub Pages)
├── app.py                # Server web lokal (Flask / Standalone http.server)
├── numerical_methods.py  # Algoritma numerik murni & evaluator fungsi Python
├── requirements.txt      # Dependensi (Flask)
├── run.bat               # Skrip praktis menjalankan server lokal di Windows
├── templates/
│   └── index.html        # Salinan template untuk runner Flask
├── static/
│   ├── css/
│   │   └── style.css     # Desain utilitarian kontras tinggi
│   └── js/
│       └── script.js     # Mesin komputasi numerik client-side & interaktivitas grafik
└── README.md
```

---

## 🌐 Cara Aktivasi di GitHub Pages

Agar website langsung dapat diakses melalui link online publik:
1. Buka repositori Anda di GitHub: `https://github.com/agungmardika/simulasi-analisis-numerik`
2. Klik tab **Settings** di bagian atas menu repositori.
3. Di bilah menu sebelah kiri, klik **Pages**.
4. Pada bagian **Build and deployment** -> **Branch**:
   - Pilih Branch: **`main`**
   - Pilih Folder: **`/(root)`**
5. Klik **Save**.
6. Tunggu sekitar 1-2 menit hingga status berubah menjadi hijau dengan link:  
   👉 **`https://agungmardika.github.io/simulasi-analisis-numerik/`**

---

## 💻 Cara Menjalankan Secara Lokal (Offline)

### Opsi 1: Buka Langsung (Tanpa Instalasi Apa Pun)
Cukup klik ganda (*double-click*) file `index.html` pada File Explorer untuk membukanya langsung di browser (Chrome, Edge, Firefox).

### Opsi 2: Menggunakan Server Python (Flask)
1. Buka terminal di folder proyek:
   ```powershell
   pip install -r requirements.txt
   python app.py
   ```
2. Buka browser di: `http://localhost:5000`

---

## 📐 Ringkasan Matematis

| Metode | Tipe | Rumus Utama | Keunggulan |
| :--- | :--- | :--- | :--- |
| **Tabel** | Diskrit Inkremental | $x_i = a + i \cdot h$, dengan $h = \frac{b-a}{N}$ | Sederhana, mendeteksi banyak selang |
| **Bisection** | Pengurung Tertutup | $c = \frac{a + b}{2}$ | Pasti konvergen dan stabil |
| **Newton-Raphson** | Garis Singgung Terbuka | $x_{r+1} = x_r - \frac{f(x_r)}{f'(x_r)}$ | Konvergensi kuadratik (sangat cepat) |

