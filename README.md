# Film21 Legal Media Starter

Website katalog video profesional berbasis HTML, CSS, dan JavaScript murni. Project ini siap dicoba di InfinityFree karena tidak membutuhkan build step, Node.js, atau database.

## Catatan penting

Project ini hanya untuk konten legal. Gunakan konten video milik sendiri, film public domain/open movie, trailer resmi, atau API resmi/berlisensi.

## Fitur

- UI profesional dengan color grading biru muda.
- Tombol tema gelap dan terang.
- Responsive untuk HP, tablet, dan desktop.
- Pencarian judul, genre, negara, dan tahun.
- Filter genre dan urutan rekomendasi/rating/tahun/A-Z.
- Modal detail dengan HTML5 video player.
- Struktur file statis yang mudah di-upload ke InfinityFree.
- `.htaccess` dasar untuk keamanan dan cache file statis.

## Struktur

```text
.
├── index.html
├── assets/
│   ├── css/styles.css
│   └── js/app.js
├── data/catalog.json
└── .htaccess
```

## Cara deploy ke InfinityFree

1. Login ke InfinityFree.
2. Buka File Manager atau FTP.
3. Masuk ke folder `htdocs`.
4. Upload semua file dan folder dari repo ini ke `htdocs`.
5. Buka domain/subdomain kamu dan tes tombol putar.

## Mengganti katalog

Edit `data/catalog.json` dengan format berikut:

```json
{
  "id": "video-1",
  "title": "Judul Video",
  "year": 2026,
  "rating": 8.5,
  "duration": "1h 45m",
  "quality": "HD",
  "country": "Indonesia",
  "genres": ["Drama", "Action"],
  "poster": "https://domain-kamu.com/poster.jpg",
  "mediaUrl": "https://domain-kamu.com/video.mp4",
  "sourceUrl": "https://domain-kamu.com/legal-source",
  "synopsis": "Sinopsis singkat."
}
```

Pastikan `mediaUrl` mengarah ke file video legal yang bisa diakses browser.

## Catatan teknis

- Jika dibuka langsung lewat `file://`, browser bisa memblokir pembacaan `data/catalog.json`.
- Di InfinityFree, upload ke `htdocs` agar file JSON terbaca sebagai same-origin request.
- Untuk API berlisensi, ubah nilai `CATALOG_URL` di `assets/js/app.js`.
