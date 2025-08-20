function prosesAbsen(scannedId) {
  const siswa = dataSiswa.find(s => s.id === scannedId);
  if (!siswa) {
    statusElement.textContent = 'ID tidak ditemukan';
    statusElement.style.color = 'red';
    return;
  }

  const now = new Date();
  const jam = now.getHours();
  const waktu = jam < 12 ? 'pagi' : 'pulang';
  const waktuStr = now.toLocaleTimeString();

  let row = document.getElementById(`row-${siswa.id}`);
  if (!row) {
    row = document.createElement('tr');
    row.id = `row-${siswa.id}`;
    row.innerHTML = `
      <td>${document.querySelectorAll('#tabel-hasil tbody tr').length + 1}</td>
      <td>${siswa.id}</td>
      <td>${siswa.nama}</td>
      <td id="pagi-${siswa.id}">-</td>
      <td id="pulang-${siswa.id}">-</td>
    `;
    document.querySelector('#tabel-hasil tbody').appendChild(row);
  }

  const waktuCell = document.getElementById(`${waktu}-${siswa.id}`);
  if (!waktuCell) {
    statusElement.textContent = 'Kesalahan sistem';
    statusElement.style.color = 'red';
    return;
  }

  if (waktuCell.textContent !== '-') {
    statusElement.textContent = `Sudah absen ${waktu}`;
    statusElement.style.color = 'orange';
    return;
  }

  waktuCell.textContent = waktuStr;

  // ✅ Simpan ke localStorage
  let absenData = JSON.parse(localStorage.getItem('absensi')) || {};
  if (!absenData[siswa.id]) absenData[siswa.id] = {};
  absenData[siswa.id][waktu] = waktuStr;
  localStorage.setItem('absensi', JSON.stringify(absenData));

  statusElement.textContent = `Absensi ${waktu} berhasil!`;
  statusElement.style.color = 'green';
}

function loadAbsensiFromLocalStorage() {
  const saved = JSON.parse(localStorage.getItem('absensi')) || {};
  for (const [id, absen] of Object.entries(saved)) {
    const siswa = dataSiswa.find(s => s.id === id);
    if (!siswa) continue;

    let row = document.getElementById(`row-${id}`);
    if (!row) {
      row = document.createElement('tr');
      row.id = `row-${id}`;
      row.innerHTML = `
        <td>${document.querySelectorAll('#tabel-hasil tbody tr').length + 1}</td>
        <td>${siswa.id}</td>
        <td>${siswa.nama}</td>
        <td id="pagi-${siswa.id}">-</td>
        <td id="pulang-${siswa.id}">-</td>
      `;
      document.querySelector('#tabel-hasil tbody').appendChild(row);
    }

    if (absen.pagi) {
      document.getElementById(`pagi-${id}`).textContent = absen.pagi;
    }
    if (absen.pulang) {
      document.getElementById(`pulang-${id}`).textContent = absen.pulang;
    }
  }
}

// ✅ Jalankan saat halaman dimuat
window.addEventListener('DOMContentLoaded', loadAbsensiFromLocalStorage);
