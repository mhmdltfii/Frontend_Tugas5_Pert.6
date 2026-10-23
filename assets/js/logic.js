"use strict";

// ========================================
// 1. KONFIGURASI & PAGINASI
// ========================================

const KEY_PRODUK = "produkUMKM";
const KEY_ID_TERAKHIR = "produkUMKM_idTerakhir";

const kategoriFilter = "Makanan";

let currentPage = 1;
const itemsPerPage = 10;

// ========================================
// 2. DATA PRODUK AWAL (8 DATA DEFAULTS)
// ========================================

const produkAwal = [
    { id: 1, name: "Keripik Pisang", category: "Makanan", price: 15000, stock: 20, active: true },
    { id: 2, name: "Kopi Banyuwangi", category: "Minuman", price: 25000, stock: 15, active: true },
    { id: 3, name: "Batik Banyuwangi", category: "Kerajinan", price: 85000, stock: 10, active: true },
    { id: 4, name: "Kue Bagiak", category: "Makanan", price: 20000, stock: 18, active: true },
    { id: 5, name: "Teh Herbal", category: "Minuman", price: 18000, stock: 12, active: true },
    { id: 6, name: "Tas Anyaman", category: "Kerajinan", price: 50000, stock: 8, active: true },
    { id: 7, name: "Sambal Pecel", category: "Makanan", price: 12000, stock: 25, active: true },
    { id: 8, name: "Madu Asli", category: "Minuman", price: 45000, stock: 10, active: true }
];

// ========================================
// 3. PENYIMPANAN DATA
// ========================================

function ambilProduk() {
    try {
        const data = localStorage.getItem(KEY_PRODUK);

        if (data === null) {
            localStorage.setItem(KEY_PRODUK, JSON.stringify(produkAwal));
            return produkAwal.map(p => ({ ...p }));
        }

        const hasil = JSON.parse(data);

        return Array.isArray(hasil)
            ? hasil
            : produkAwal.map(p => ({ ...p }));
    } catch (error) {
        console.error("Gagal membaca produk:", error);
        return produkAwal.map(p => ({ ...p }));
    }
}

let produkDataset = ambilProduk();

function simpanProduk() {
    try {
        localStorage.setItem(KEY_PRODUK, JSON.stringify(produkDataset));
        return true;
    } catch (error) {
        console.error("Gagal menyimpan produk:", error);
        tampilkanFeedback("Data gagal disimpan.", "error");
        return false;
    }
}

// ========================================
// 4. ID PRODUK BERURUTAN
// ========================================

function buatIdProduk() {
    const idTerpakai = new Set(produkDataset.map(p => Number(p.id)));
    let idBaru = 9;

    while (idTerpakai.has(idBaru)) {
        idBaru++;
    }

    localStorage.setItem(KEY_ID_TERAKHIR, String(idBaru));
    return idBaru;
}

// ========================================
// 5. FUNGSI BANTUAN
// ========================================

function formatRupiah(angka) {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0
    }).format(Number(angka) || 0);
}

function escapeHTML(nilai) {
    return String(nilai ?? "").replace(/[&<>"']/g, karakter => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
    })[karakter]);
}

function tampilkanFeedback(pesan, tipe = "success") {
    const feedback = document.getElementById("feedback");

    if (!feedback) {
        console.log(pesan);
        return;
    }

    feedback.textContent = pesan;
    feedback.className = `feedback ${tipe}`;
    feedback.style.display = "block";
}

// ========================================
// 6. FILTER REKAP CONSOLE
// ========================================

function tampilkanRekapProduk() {
    console.log(`=== Menjalankan Filter Kategori: ${kategoriFilter} ===`);

    const hasil = produkDataset.filter(p =>
        p.category.toLowerCase() === kategoriFilter.toLowerCase()
    );

    hasil.forEach(p => {
        console.log(`[ID: ${p.id}] ${p.name} | Harga: Rp${p.price.toLocaleString("id-ID")} | Stok: ${p.stock} | Status: ${p.active ? "Aktif" : "Nonaktif"}`);
    });

    const rekap = {
        category: kategoriFilter,
        totalProducts: hasil.length,
        totalStockValue: hasil.reduce((total, p) => total + p.price * p.stock, 0)
    };

    console.log("Hasil Rekapitulasi:", rekap);
    return rekap;
}

// ========================================
// 7. HALAMAN INDEX
// ========================================

function jalankanHalamanIndex() {
    const form = document.getElementById("formProduk");

    if (!form || form.dataset.logicAktif === "true") return;
    form.dataset.logicAktif = "true";

    const nama = document.getElementById("nama");
    const harga = document.getElementById("harga");
    const kategori = document.getElementById("kategori");
    const stok = document.getElementById("stok");

    const previewNama = document.getElementById("previewNama");
    const previewHarga = document.getElementById("previewHarga");
    const previewKategori = document.getElementById("previewKategori");
    const previewStok = document.getElementById("previewStok");

    let idEdit = null;

    let cari = document.getElementById("cariProduk");
    let filterKat = document.getElementById("filterKategori");
    let daftar = document.getElementById("daftarProduk") || document.getElementById("daftarKelolaProduk");
    let batal = document.getElementById("batalEditProduk");

    const btnPrev = document.getElementById("btnPrev");
    const btnNext = document.getElementById("btnNext");
    const pageInfo = document.getElementById("pageInfo");

    if (!batal) {
        batal = document.createElement("button");
        batal.type = "button";
        batal.id = "batalEditProduk";
        batal.className = "btn";
        batal.textContent = "Batal Edit";
        batal.style.display = "none";

        form.querySelector('[type="submit"]')?.insertAdjacentElement("afterend", batal);
    }

    function updatePreview() {
        if (previewNama) previewNama.textContent = nama.value.trim() || "-";
        if (previewHarga) previewHarga.textContent = formatRupiah(harga.value);
        if (previewKategori) previewKategori.textContent = kategori.value || "-";
        if (previewStok) previewStok.textContent = stok.value || "0";
    }

    [nama, harga, kategori, stok].forEach(input => {
        if (input) input.addEventListener("input", updatePreview);
    });

    function resetForm() {
        idEdit = null;
        form.reset();
        updatePreview();

        const submit = form.querySelector('[type="submit"]');
        if (submit) submit.textContent = "Tambah Produk";

        batal.style.display = "none";
    }

    function mulaiEdit(id) {
        const p = produkDataset.find(item => Number(item.id) === id);
        if (!p) return;

        idEdit = id;
        nama.value = p.name;
        harga.value = p.price;
        kategori.value = p.category;
        stok.value = p.stock;

        updatePreview();

        const submit = form.querySelector('[type="submit"]');
        if (submit) submit.textContent = "Simpan Perubahan";

        batal.style.display = "inline-block";
        form.scrollIntoView({ behavior: "smooth", block: "start" });
        nama.focus();
    }

    batal.addEventListener("click", () => {
        resetForm();
        tampilkanFeedback("Edit produk dibatalkan.", "info");
    });

    form.addEventListener("submit", event => {
        event.preventDefault();

        const n = nama.value.trim();
        const h = Number(harga.value);
        const k = kategori.value.trim();
        const s = Number(stok.value);

        if (!n || !k || harga.value === "" || stok.value === "") {
            tampilkanFeedback("Silahkan isi formulir dengan lengkap.", "error");
            return;
        }

        if (n.length < 5 || !Number.isFinite(h) || h < 0) {
            tampilkanFeedback("Gagal! Nama atau harga produk tidak valid. Periksa kembali input Anda.", "error");
            return;
        }

        if (!Number.isInteger(s) || s < 0) {
            tampilkanFeedback("Stok harus bilangan bulat minimal 0.", "error");
            return;
        }

        if (idEdit !== null) {
            const i = produkDataset.findIndex(p => Number(p.id) === idEdit);

            if (i === -1) {
                tampilkanFeedback("Produk tidak ditemukan.", "error");
                resetForm();
                return;
            }

            const lama = { ...produkDataset[i] };

            produkDataset[i] = {
                ...lama,
                name: n,
                price: h,
                category: k,
                stock: s
            };

            if (!simpanProduk()) {
                produkDataset[i] = lama;
                return;
            }

            console.log("Produk berhasil diubah:", produkDataset[i]);
            tampilkanFeedback(`Produk "${n}" berhasil diedit.`);
        } else {
            const baru = {
                id: buatIdProduk(),
                name: n,
                category: k,
                price: h,
                stock: s,
                active: true
            };

            produkDataset.push(baru);

            if (!simpanProduk()) {
                produkDataset.pop();
                return;
            }

            console.log("Produk berhasil ditambahkan:", baru);
            tampilkanFeedback(`Produk "${n}" berhasil ditambahkan.`);
        }

        resetForm();
        renderKelola();
    });

    function renderKelola() {
        if (!daftar) return;

        const q = cari ? cari.value.trim().toLowerCase() : "";
        const kat = filterKat ? filterKat.value : "";

        const hasil = produkDataset.filter(p => {
            const matchQuery = String(p.name).toLowerCase().includes(q) || String(p.category).toLowerCase().includes(q);
            const matchCategory = kat === "" || p.category === kat;
            return matchQuery && matchCategory;
        });

        const totalPages = Math.ceil(hasil.length / itemsPerPage) || 1;
        if (currentPage > totalPages) currentPage = totalPages;

        const startIndex = (currentPage - 1) * itemsPerPage;
        const paginatedData = hasil.slice(startIndex, startIndex + itemsPerPage);

        if (!paginatedData.length) {
            daftar.innerHTML = "<tr><td colspan='6' style='text-align:center;'>Produk tidak ditemukan.</td></tr>";
        } else {
            daftar.innerHTML = paginatedData.map((p, index) => `
                <tr>
                    <td>${startIndex + index + 1}</td>
                    <td>${escapeHTML(p.name)}</td>
                    <td>${formatRupiah(p.price)}</td>
                    <td>${escapeHTML(p.category)}</td>
                    <td>${p.stock}</td>
                    <td class="aksi-col">
                        <button type="button" class="btn-aksi-merah" data-aksi="edit" data-id="${p.id}">Edit</button>
                        <button type="button" class="btn-aksi-merah" data-aksi="status" data-id="${p.id}">
                            ${p.active ? "Nonaktifkan" : "Aktifkan"}
                        </button>
                        <button type="button" class="btn-aksi-merah" data-aksi="hapus" data-id="${p.id}">Hapus</button>
                    </td>
                </tr>
            `).join("");
        }

        if (pageInfo) pageInfo.textContent = `Halaman ${currentPage} dari ${totalPages}`;
        if (btnPrev) btnPrev.disabled = currentPage === 1;
        if (btnNext) btnNext.disabled = currentPage === totalPages || totalPages === 0;
    }

    if (cari) cari.addEventListener("input", () => { currentPage = 1; renderKelola(); });
    if (filterKat) filterKat.addEventListener("change", () => { currentPage = 1; renderKelola(); });

    if (btnPrev) {
        btnPrev.addEventListener("click", () => {
            if (currentPage > 1) {
                currentPage--;
                renderKelola();
            }
        });
    }

    if (btnNext) {
        btnNext.addEventListener("click", () => {
            currentPage++;
            renderKelola();
        });
    }

    if (daftar) {
        daftar.addEventListener("click", event => {
            const tombol = event.target.closest("button[data-aksi]");
            if (!tombol) return;

            const id = Number(tombol.dataset.id);
            const aksi = tombol.dataset.aksi;
            const i = produkDataset.findIndex(p => Number(p.id) === id);

            if (i === -1) return;

            const p = produkDataset[i];

            if (aksi === "edit") {
                mulaiEdit(id);
                return;
            }

            if (aksi === "status") {
                const lama = p.active;
                p.active = !p.active;

                if (!simpanProduk()) {
                    p.active = lama;
                    return;
                }

                const teksStatus = p.active ? "diaktifkan" : "dinonaktifkan";
                console.log(`Produk berhasil ${teksStatus}:`, p);

                const pesan = p.active
                    ? `Produk "${p.name}" berhasil diaktifkan.`
                    : `Produk "${p.name}" berhasil dinonaktifkan.`;

                tampilkanFeedback(pesan);
                renderKelola();
                return;
            }

            if (aksi === "hapus") {
                if (!confirm(`Yakin ingin menghapus produk "${p.name}"?`)) return;

                const dihapus = { ...p };
                produkDataset.splice(i, 1);

                if (!simpanProduk()) {
                    produkDataset.splice(i, 0, dihapus);
                    return;
                }

                console.log("Produk berhasil dihapus:", dihapus);
                tampilkanFeedback(`Produk "${dihapus.name}" berhasil dihapus.`);

                if (idEdit === id) resetForm();
                renderKelola();
            }
        });
    }

    window.addEventListener("storage", event => {
        if (event.key === KEY_PRODUK || event.key === KEY_ID_TERAKHIR) {
            produkDataset = ambilProduk();
            renderKelola();
        }
    });

    updatePreview();
    renderKelola();
    tampilkanRekapProduk();
}

// ========================================
// 8. HALAMAN OUTPUT
// ========================================

function jalankanHalamanOutput() {
    const daftar = document.getElementById("daftarProduk");

    if (!daftar || document.getElementById("formProduk")) return;
    if (daftar.dataset.logicAktif === "true") return;
    daftar.dataset.logicAktif = "true";

    const jumlah = document.getElementById("jumlahProduk");

    function renderOutput() {
        const aktif = produkDataset.filter(p => p.active);

        if (jumlah) {
            jumlah.textContent = `${aktif.length}`;
        }

        if (!aktif.length) {
            daftar.innerHTML = "<p class='kosong'>Belum ada produk aktif.</p>";
            return;
        }

        daftar.innerHTML = aktif.map(p => `
            <div class="produk-card">
                <h3>${escapeHTML(p.name)}</h3>
                <p>Harga: ${formatRupiah(p.price)}</p>
                <p>Kategori: ${escapeHTML(p.category)}</p>
                <p>Stok: ${p.stock}</p>
            </div>
        `).join("");
    }

    window.addEventListener("storage", event => {
        if (event.key === KEY_PRODUK || event.key === KEY_ID_TERAKHIR) {
            produkDataset = ambilProduk();
            renderOutput();
        }
    });

    renderOutput();
    tampilkanRekapProduk();
}

// ========================================
// 9. JALANKAN APLIKASI
// ========================================

document.addEventListener("DOMContentLoaded", () => {
    if (document.getElementById("formProduk")) {
        jalankanHalamanIndex();
    } else {
        jalankanHalamanOutput();
    }
});