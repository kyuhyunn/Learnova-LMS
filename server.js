const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcrypt'); // Poin 7: Enkripsi password aman

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Menyediakan folder statis untuk Admin & Siswa[cite: 2]
app.use('/admin', express.static(path.join(__dirname, 'public/admin')));
app.use('/siswa', express.static(path.join(__dirname, 'public/siswa')));

// Path file database permanen lokal[cite: 2]
const dbFile = path.join(__dirname, 'database.json');

// Data Default jika file database.json belum ada[cite: 2]
let defaultData = {
    students: [
        { id: 1, name: 'Fadhli', nisn: '0107695680', email: 'muamad.fadhli@gmail.com', status: 'Aktif', tugas: 90, kuis: 85, ujian: 88, attendance: 'Hadir' },
        { id: 2, name: 'Radit', nisn: '12345678', email: 'radit@gmail.com', status: 'Aktif', tugas: 90, kuis: 0, ujian: 0, attendance: 'Belum Absen' },
        { id: 3, name: 'Fajar', nisn: '11223344', email: 'fajar@gmail.com', status: 'Aktif', tugas: 0, kuis: 0, ujian: 0, attendance: 'Belum Absen' },
        { id: 4, name: 'Ervan', nisn: '00112233', email: 'ervan@gmail.com', status: 'Aktif', tugas: 0, kuis: 0, ujian: 0, attendance: 'Belum Absen' },
        { id: 5, name: 'Talyssa', nisn: '11111111', email: 'yisa@gmail.com', status: 'Aktif', tugas: 0, kuis: 0, ujian: 0, attendance: 'Belum Absen' },
        { id: 6, name: 'Irsyad', nisn: '22222222', email: 'irsyad@gmail.com', status: 'Aktif', tugas: 0, kuis: 0, ujian: 0, attendance: 'Belum Absen' },
        { id: 7, name: 'Widya', nisn: '33333333', email: 'widya@gmail.com', status: 'Aktif', tugas: 0, kuis: 0, ujian: 0, attendance: 'Belum Absen' },
        { id: 8, name: 'Salsa', nisn: '44444444', email: 'salsa@gmail.com', status: 'Aktif', tugas: 0, kuis: 0, ujian: 0, attendance: 'Belum Absen' }
    ],
    materials: [
        { id: 1, title: 'Modul Cisco Packet Tracer Dasar', category: 'Materi Pembelajaran', desc: 'Panduan perancangan topologi dasar.', deadline: '2026-12-31T23:59' },
        { id: 2, title: 'Topologi Jaringan LAN', category: 'Tugas Praktikum', desc: 'Buat topologi star network di cisco.', deadline: '2026-12-31T23:59' },
        { id: 3, title: 'Kuis Jaringan Komputer 1', category: 'Kuis', desc: 'Jawab pertanyaan seputar OSI Layer & IP Addressing.', deadline: '2026-12-31T23:59' },
        { id: 4, title: 'Ujian Tengah Semester TKJ', category: 'Ujian', desc: 'Soal ujian praktik dan teori jaringan komputer.', deadline: '2026-12-31T23:59' }
    ],
    announcements: [
        { id: 1, title: 'Pengumuman Kelas TKJ', content: 'Silakan kerjakan modul praktikum jaringan tepat waktu.', date: 'Hari ini' }
    ],
    assignments: [
        { id: 1, title: 'Laporan Praktikum IP Static', deadline: 'Besok, 23:59 WIB', status: 'Pending' }
    ],
    forum: [
        { id: 1, author: 'Admin Guru', time: '2 jam lalu', content: 'Selamat pagi anak-anak, silakan kumpulkan tugas tepat waktu.' }
    ]
};

// Memuat database dari file JSON (Penyimpanan Permanen)[cite: 2]
let dbData = defaultData;
if (fs.existsSync(dbFile)) {
    try {
        const fileContent = fs.readFileSync(dbFile, 'utf8');
        dbData = JSON.parse(fileContent);
        if (!dbData.announcements) {
            dbData.announcements = defaultData.announcements;
        }
    } catch (err) {
        console.error('Gagal membaca database.json, menggunakan data default.');
    }
} else {
    fs.writeFileSync(dbFile, JSON.stringify(defaultData, null, 2));
}

// Fungsi helper untuk menyimpan perubahan ke file JSON permanen[cite: 2]
function saveDB() {
    fs.writeFileSync(dbFile, JSON.stringify(dbData, null, 2));
}

// --- API ENDPOINTS ---

// 1. Ambil semua data[cite: 2]
app.get('/api/data', (req, res) => {
    res.json({
        students: dbData.students,
        materials: dbData.materials,
        announcements: dbData.announcements
    });
});

// 2. API: Login Admin (Password: Fadhli2010)[cite: 2]
app.post('/api/admin/login', (req, res) => {
    const { password } = req.body;
    if (password === 'Fadhli2010') {
        res.json({ success: true, message: 'Login admin berhasil!' });
    } else {
        res.status(401).json({ success: false, message: 'Password admin salah!' });
    }
});

// 3. API: Tambah Siswa Baru oleh Admin[cite: 2]
app.post('/api/students', (req, res) => {
    const newStudent = req.body;
    dbData.students.push(newStudent);
    saveDB();
    res.json({ success: true, message: 'Siswa berhasil disimpan secara permanen!', students: dbData.students });
});

// 4. API: Edit Data Siswa[cite: 2]
app.put('/api/students/:id', (req, res) => {
    const studentId = Number(req.params.id);
    const { name, nisn, email } = req.body;
    
    const student = dbData.students.find(s => s.id === studentId);
    if (student) {
        student.name = name || student.name;
        student.nisn = nisn || student.nisn;
        student.email = email || student.email;
        saveDB();
        res.json({ success: true, message: 'Data siswa berhasil diperbarui!', students: dbData.students });
    } else {
        res.status(404).json({ success: false, message: 'Siswa tidak ditemukan' });
    }
});

// 5. API: Hapus Siswa[cite: 2]
app.delete('/api/students/:id', (req, res) => {
    const studentId = Number(req.params.id);
    const initialLength = dbData.students.length;
    dbData.students = dbData.students.filter(s => s.id !== studentId);

    if (dbData.students.length < initialLength) {
        saveDB();
        res.json({ success: true, message: 'Siswa berhasil dihapus!', students: dbData.students });
    } else {
        res.status(404).json({ success: false, message: 'Siswa tidak ditemukan' });
    }
});

// 6. API: Publikasi Materi / Tugas / Kuis / Ujian Baru[cite: 2]
app.post('/api/materials', (req, res) => {
    const newMaterial = req.body;
    dbData.materials.push(newMaterial);
    saveDB();
    res.json({ success: true, message: 'Materi berhasil dipublikasikan!', materials: dbData.materials });
});

// 7. API: Hapus Materi / Tugas Berdasarkan ID[cite: 2]
app.delete('/api/materials/:id', (req, res) => {
    const materialId = Number(req.params.id);
    const initialLength = dbData.materials.length;
    dbData.materials = dbData.materials.filter(m => m.id !== materialId);

    if (dbData.materials.length < initialLength) {
        saveDB();
        res.json({ success: true, message: 'Konten tugas berhasil dihapus!', materials: dbData.materials });
    } else {
        res.status(404).json({ success: false, message: 'Konten tidak ditemukan' });
    }
});

// 8. API: Kirim Pengumuman Kelas[cite: 2]
app.post('/api/announcements', (req, res) => {
    const { title, content } = req.body;
    if (!dbData.announcements) {
        dbData.announcements = [];
    }
    const newAnnouncement = {
        id: Date.now(),
        title: title || 'Pengumuman Kelas',
        content,
        date: 'Baru saja'
    };
    dbData.announcements.unshift(newAnnouncement);
    saveDB();
    res.json({ success: true, message: 'Pengumuman berhasil dikirim!', announcements: dbData.announcements });
});

// 9. API: Hapus Pengumuman Berdasarkan ID[cite: 2]
app.delete('/api/announcements/:id', (req, res) => {
    const annId = Number(req.params.id);
    if (!dbData.announcements) {
        return res.status(404).json({ success: false, message: 'Data pengumuman tidak ditemukan' });
    }
    
    const initialLength = dbData.announcements.length;
    dbData.announcements = dbData.announcements.filter(a => a.id !== annId);

    if (dbData.announcements.length < initialLength) {
        saveDB();
        res.json({ success: true, message: 'Pengumuman berhasil dihapus!', announcements: dbData.announcements });
    } else {
        res.status(404).json({ success: false, message: 'Pengumuman tidak ditemukan' });
    }
});

// 10. API: Registrasi Siswa Mandiri (Poin 6 & 7)
app.post('/api/siswa/register', async (req, res) => {
    try {
        const { name, nisn, email, password } = req.body;

        const existingStudent = dbData.students.find(s => s.nisn === nisn);
        if (existingStudent) {
            return res.status(400).json({ success: false, message: 'NISN sudah terdaftar di database!' });
        }

        // Enkripsi password menggunakan bcrypt
        const hashedPassword = await bcrypt.hash(password, 10);

        const newStudent = {
            id: dbData.students.length > 0 ? Math.max(...dbData.students.map(s => s.id)) + 1 : 1,
            name,
            nisn,
            email: email || `${nisn}@student.nova`,
            password: hashedPassword, // Simpan password terhash
            status: 'Aktif',
            tugas: 0,
            kuis: 0,
            ujian: 0,
            attendance: 'Belum Absen'
        };

        dbData.students.push(newStudent);
        saveDB();
        res.json({ success: true, message: 'Registrasi akun berhasil! Silakan login.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server.' });
    }
});

// 11. API: Login Siswa dengan Verifikasi Password (Poin 7)
app.post('/api/siswa/login', async (req, res) => {
    try {
        const { nisn, password } = req.body;
        const student = dbData.students.find(s => s.nisn === nisn);

        if (!student) {
            return res.status(401).json({ success: false, message: 'NISN tidak terdaftar di database!' });
        }

        // Jika siswa dari data default lama belum memiliki password
        if (!student.password) {
            return res.json({ success: true, student, message: 'Login berhasil!' });
        }

        // Bandingkan password input dengan hash di database
        const isMatch = await bcrypt.compare(password, student.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Password salah!' });
        }

        res.json({ success: true, student, message: 'Login berhasil!' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server.' });
    }
});

// 12. API: Siswa Absensi Check-in[cite: 2]
app.post('/api/siswa/attendance', (req, res) => {
    const { studentId } = req.body;
    const student = dbData.students.find(s => s.id === Number(studentId));
    if (student) {
        student.attendance = 'Hadir';
        saveDB();
        res.json({ success: true, message: 'Absensi berhasil dicatat!' });
    } else {
        res.status(404).json({ success: false, message: 'Siswa tidak ditemukan' });
    }
});

// 13. API: Reset Absensi Semua Siswa[cite: 2]
app.post('/api/admin/reset-attendance', (req, res) => {
    dbData.students.forEach(s => {
        s.attendance = 'Belum Absen';
    });
    saveDB();
    res.json({ success: true, message: 'Absensi berhasil di-reset!', students: dbData.students });
});

// 14. API: Siswa Kumpul Tugas / Kuis / Ujian dengan Validasi Deadline[cite: 2]
app.post('/api/siswa/submit-task', (req, res) => {
    const { studentId, materialId } = req.body;
    const student = dbData.students.find(s => s.id === Number(studentId));
    const material = dbData.materials.find(m => m.id === Number(materialId));

    if (!student || !material) {
        return res.status(404).json({ success: false, message: 'Data siswa atau tugas tidak ditemukan' });
    }

    if (material.deadline) {
        const currentTime = new Date();
        const deadlineTime = new Date(material.deadline);
        
        if (currentTime > deadlineTime) {
            return res.json({ 
                success: false, 
                message: 'Gagal! Batas waktu (deadline) pengumpulan tugas ini sudah terlewati.' 
            });
        }
    }

    if (material.category === 'Kuis') {
        student.kuis = 85;
    } else if (material.category === 'Ujian') {
        student.ujian = 88;
    } else {
        student.tugas = 90;
    }
    
    saveDB();
    res.json({ success: true, message: 'Tugas berhasil dikumpulkan ke guru!' });
});

app.listen(PORT, () => {
    console.log(`Server Learnova LMS berjalan di port ${PORT} (Storage: File JSON Permanen Active)`);
});