/*
 * File: style.css
 * Deskripsi: Styling untuk antarmuka aplikasi absensi.
 * Menggunakan prinsip-prinsip styling yang responsif.
 */

body {
  font-family: 'Inter', sans-serif;
  background: #f4f6f8;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24px;
  color: #2c3e50;
  margin: 0;
}

.container {
  width: 100%;
  max-width: 600px;
  background-color: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  margin-top: 24px;
}

h1 {
  color: #3498db;
  text-align: center;
  margin-bottom: 16px;
}

video {
  width: 100%;
  max-width: 480px;
  border: 4px solid #3498db;
  border-radius: 12px;
  margin: 20px auto;
  display: block;
}

.status-message {
  font-weight: bold;
  margin-bottom: 16px;
  text-align: center;
  min-height: 24px;
}

#result {
  color: #27ae60;
}

#error {
  color: #e74c3c;
}

.table-container {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 24px;
}

th, td {
  border: 1px solid #ccc;
  padding: 12px;
  text-align: left;
}

th {
  background: #3498db;
  color: white;
  font-weight: 600;
}

tr:nth-child(even) {
  background: #ecf0f1;
}

@media (max-width: 640px) {
  body {
    padding: 16px;
  }
  .container {
    padding: 16px;
  }
}
