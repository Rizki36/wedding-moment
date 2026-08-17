# 📄 Product Requirements Document (PRD)

**Nama Produk:** Wedding Moment
**Fase:** Minimum Viable Product (MVP)

## 1. Ringkasan Produk

Wedding Moment adalah aplikasi berbasis web yang dirancang untuk menangkap momen dan ucapan dari tamu pernikahan secara interaktif. Tamu dapat mengirimkan foto secara *live* menggunakan bingkai kustom (opsional) beserta pesan suara singkat kepada pengantin, hanya dengan memindai QR Code di lokasi acara tanpa perlu mengunduh aplikasi atau melakukan registrasi akun.

## 2. Aktor / Peran Pengguna

* **Admin**: Super-user yang mengelola seluruh sistem. Memiliki kemampuan penuh untuk membuat akun pengantin, mengatur *event* pernikahan, mengunggah bingkai, dan mencetak QR Code atas nama pengantin (sebagai opsi layanan bantuan/vendor).
* **Pengantin**: Pengguna terdaftar (*self-service*) yang memiliki *event* pernikahan. Dapat mengunggah desain bingkai foto, menghasilkan QR Code acara, memantau dasbor ucapan, serta mengunduh seluruh data tamu.
* **Pengunjung (Tamu)**: Pengguna anonim yang hanya diwajibkan menginput nama. Mengakses platform via QR Code untuk berfoto dan merekam pesan suara.

## 3. Alur Pengguna (User Flows)

### 3.1 Fase Pra-Acara (Setup & Persiapan)

1. **Registrasi:** Pengantin membuat akun secara mandiri atau dibuatkan oleh Admin.
2. **Pembuatan Event:** Pengantin/Admin membuat *event* dengan memasukkan detail acara (Nama Pengantin, Tanggal, dll).
3. **Upload Aset:** Pengantin/Admin mengunggah desain bingkai foto (*custom frame*) dalam format transparan (misal: PNG).
4. **Generate QR:** Sistem menghasilkan QR Code unik yang terhubung langsung ke URL *event* tersebut. QR Code siap diunduh dan dicetak untuk dipajang di *venue* pernikahan.

### 3.2 Fase Hari H (Interaksi Pengunjung)

1. **Akses Web:** Pengunjung memindai QR Code menggunakan perangkat pribadi (HP) dan langsung diarahkan ke *web app*.
2. **Input Data Awal:** Pengunjung memasukkan nama mereka.
3. **Pilih Bingkai:** Pengunjung memilih bingkai foto dari daftar yang telah disediakan oleh pengantin (langkah ini bersifat opsional).
4. **Ambil Foto:** Pengunjung mengambil foto **secara langsung (*live camera*)** melalui antarmuka web (tidak ada opsi *upload* dari galeri).
5. **Rekam Suara:** Pengunjung merekam pesan suara sebagai ucapan (maksimal **30 detik**).
6. **Pratinjau (Preview) & Retake:** Pengunjung melihat hasil jepretan dan mendengarkan rekaman suara. Disediakan tombol **"Ulangi Foto"** dan **"Rekam Ulang"** jika dirasa belum maksimal.
7. **Simpan & Kirim:** Pengunjung dapat mengunduh foto tersebut ke perangkat pribadi mereka (opsional), lalu menekan tombol kirim. Data (Nama, Foto, Pesan Suara) masuk ke sistem pengantin.

### 3.3 Fase Pasca-Acara (Manajemen Data oleh Pengantin)

1. **Akses Dasbor:** Pengantin *login* ke dalam sistem dan masuk ke dasbor *event* mereka.
2. **Tinjau Momen:** Pengantin melihat daftar pengunjung, melihat hasil foto, dan memutar pesan suara yang dikirimkan.
3. **Bulk Download:** Pengantin dapat menekan tombol **"Unduh Semua"** untuk mengekstrak seluruh data (foto dan audio) ke dalam satu *file* kompresi (misal: ZIP) untuk diarsipkan.

## 4. Spesifikasi Teknis & Tumpukan Teknologi (Tech Stack)

### 4.1 Core Framework (Full-Stack)

* **TanStack Start:** Digunakan sebagai *framework* utama berbasis React yang menangani *frontend* (UI) maupun *backend logic* (API/Server Functions). Menawarkan *type-safe routing*, *Server-Side Rendering* (SSR) untuk optimasi kecepatan muat halaman pengunjung, dan integrasi mulus untuk pemuatan data acara (Event Data Fetching).

### 4.2 Frontend & UI/UX

* **Platform Pengunjung:** Berbasis web (*Mobile Web App*). Dioptimalkan secara khusus untuk *browser mobile* (Chrome, Safari) untuk akses WebRTC (Kamera & Mikrofon).
* **Styling:** Menggunakan **Tailwind CSS** untuk desain yang responsif dan sangat ringan.
* **Komponen Interaktif:** Menggunakan **Headless UI** untuk komponen aksesibel (*dropdown*, *modal preview*) agar tampilan bersih dan ukuran *bundle javascript* tetap kecil.

### 4.3 Backend, Database & Storage

* **Server Logic:** Ditangani langsung melalui kapabilitas *server* dari TanStack Start (tanpa perlu membangun *backend* terpisah).
* **Relational Database:** Menggunakan **Neon (Serverless Postgres)** untuk menyimpan data tekstual dan relasional (Akun, Event, Nama Tamu, URL Media). Pendekatan *serverless* memungkinkan *auto-scaling* saat lonjakan trafik hari-H dan *scale-to-zero* saat sepi.
* **Object Storage (Media):** Menggunakan **Cloudflare R2** untuk menyimpan *file* (Bingkai PNG, Foto tamu, Rekaman Suara) karena keunggulannya yang membebaskan biaya penarikan data (*zero egress fee*), sangat ideal untuk fitur *Bulk Download*.

### 4.4 Kinerja & Caching (Performance)

* **SSR & Edge Caching:** Halaman *landing* pengunjung yang dipindai via QR Code akan menggunakan SSR (dari TanStack Start) dipadukan dengan *Edge Caching* (Cloudflare CDN) agar terbuka dalam hitungan milidetik.
* **Media Capture & Optimasi:** Akses *Live Camera* akan mengompresi foto secara *client-side* sebelum diunggah ke R2.
* **Durasi Audio:** Dibatasi maksimal **30 detik** per rekaman untuk efisiensi *bandwidth*.

### 4.5 Batasan Sistem & Keamanan

* **Privasi Tampilan:** Seluruh foto dan pesan suara bersifat **privat** (hanya masuk ke dasbor pengantin).
* **Retensi Data & Pembersihan (Auto-Purge):** Menggunakan fitur *Lifecycle Rule* di Cloudflare R2 dan operasi penghapusan terjadwal di *database* untuk menghapus seluruh data pengunjung secara otomatis maksimal **30 hari** setelah acara selesai.