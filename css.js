//
// File: script.js
// Deskripsi: Logika JavaScript untuk scanner barcode dan integrasi Supabase.
//

// === KONFIGURASI SUPABASE ===
// Untuk keamanan, sebaiknya pisahkan kode ini ke file config.js
// dan tambahkan config.js ke .gitignore agar tidak terunggah ke GitHub.
const SUPABASE_URL = "https://YOUR-PROJECT.supabase.co";
const SUPABASE_KEY = "YOUR-ANON-KEY";
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const videoElement = document.getElementById("video");
const resultEl = document.getElementById("result");
const errorEl = document.getElementById("error");
const tableBody = document.getElementById("absen-table");

const codeReader = new ZXing.BrowserMultiFormatReader();
let lastScanned = "";
let lastScanTime = 0;
const SCAN_COOLDOWN_MS = 3000; // Cooldown 3 detik untuk mencegah scan ganda

// ===================================
// === FUNGSI-FUNGSI UTAMA ===
// ===================================

// Fungsi untuk memuat riwayat absensi dari Supabase
async function fetchAttendanceHistory() {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const { data, error } = await supabase
      .from("absensi")
      .select("*")
      .gte("waktu", today + "T00:00:00")
      .lte("waktu", today + "T23:59:59")
      .order("waktu", { ascending: false });

    if (error) throw error;
    
    renderAttendanceTable(data);
  } catch (err) {
    console.error("Gagal mengambil riwayat absensi:", err);
    errorEl.textContent = "Gagal memuat riwayat absensi.";
  }
}

// Fungsi untuk mencatat absensi
async function prosesAbsensi(nisn) {
  const now = Date.now();
  if (nisn === lastScanned && (now - lastScanTime) < SCAN_COOLDOWN_MS) {
    resultEl.textContent = "Baru saja discan. Mohon tunggu...";
    return;
  }
  
  lastScanned = nisn;
  lastScanTime = now;
  
  resultEl.textContent = "Memproses absensi...";
  errorEl.textContent = "";

  try {
    const { data: siswa, error: siswaError } = await supabase
      .from("siswa")
      .select("nama")
      .eq("nisn", nisn)
      .single();

    if (siswaError || !siswa) {
      throw new Error("NISN tidak ditemukan di database.");
    }

    const today = new Date().toISOString().slice(0, 10);
    const { data: absenHariIni, error: absenError } = await supabase
      .from("absensi")
      .select("status")
      .eq("nisn", nisn)
      .gte("waktu", today + "T00:00:00")
      .lte("waktu", today + "T23:59:59")
      .order("waktu", { ascending: false })
      .limit(1);

    let status = "Check-in";
    if (absenHariIni && absenHariIni.length > 0 && absenHariIni[0].status === "Check-in") {
      status = "Check-out";
    }

    const { error: insertError } = await supabase.from("absensi").insert([
      { nisn: nisn, nama: siswa.nama, status: status, waktu: new Date().toISOString() }
    ]);
    
    if (insertError) throw insertError;

    resultEl.textContent = `✅ Absensi ${siswa.nama} berhasil (${status})!`;
    fetchAttendanceHistory();

  } catch (err) {
    console.error("Gagal mencatat absensi:", err);
    errorEl.textContent = `❌ Gagal: ${err.message || 'Terjadi kesalahan.'}`;
  }
}

// Fungsi untuk menampilkan data ke tabel
function renderAttendanceTable(data) {
  tableBody.innerHTML = "";
  if (data.length === 0) {
    tableBody.innerHTML = '<tr><td colspan="4">Belum ada absensi hari ini.</td></tr>';
    return;
  }
  data.forEach(item => {
    const row = document.createElement("tr");
    const waktuLokal = new Date(item.waktu).toLocaleTimeString("id-ID", {
      hour: '2-digit', minute: '2-digit', second: '2-digit'
    });
    row.innerHTML = `
      <td>${item.nisn}</td>
      <td>${item.nama}</td>
      <td>${item.status}</td>
      <td>${waktuLokal}</td>
    `;
    tableBody.appendChild(row);
  });
}

// ===================================
// === INISIALISASI KAMERA & SCANNER ===
// ===================================

// Mulai kamera saat halaman dimuat
window.addEventListener('load', () => {
  codeReader.listVideoInputDevices()
    .then((videoInputDevices) => {
      let selectedDeviceId = null;
      if (videoInputDevices.length > 1) {
        const backCamera = videoInputDevices.find(device => device.label.toLowerCase().includes('back'));
        selectedDeviceId = backCamera ? backCamera.deviceId : videoInputDevices[0].deviceId;
      } else if (videoInputDevices.length === 1) {
        selectedDeviceId = videoInputDevices[0].deviceId;
      }

      if (selectedDeviceId) {
        codeReader.decodeFromVideoDevice(selectedDeviceId, 'video', (result, err) => {
          if (result) {
            console.log("Barcode terdeteksi:", result.text);
            prosesAbsensi(result.text);
          }
          if (err && !(err instanceof ZXing.NotFoundException)) {
            console.error("Kesalahan scanner:", err);
            errorEl.textContent = `Error: ${err.message}`;
          }
        });
        resultEl.textContent = "Kamera aktif, siap untuk scan.";
      } else {
        resultEl.textContent = "Tidak ada perangkat kamera yang ditemukan.";
        console.error("Tidak ada perangkat kamera yang ditemukan.");
      }
    })
    .catch((err) => {
      console.error("Gagal mengakses kamera:", err);
      errorEl.textContent = "Gagal mengakses kamera. Pastikan izin kamera diberikan.";
    });

  // Muat riwayat absensi saat halaman dimuat
  fetchAttendanceHistory();
});
