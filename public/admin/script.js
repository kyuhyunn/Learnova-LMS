let serverData = {};

async function fetchServerData() {
    try {
        const response = await fetch('/api/data');
        serverData = await response.json();
        renderAllAdminData();
    } catch (err) {
        console.error('Gagal mengambil data server:', err);
    }
}

function renderAllAdminData() {
    if (!serverData.students) return;

    // Statistik Dashboard
    const statTotalSiswa = document.getElementById('stat-total-siswa');
    if (statTotalSiswa) statTotalSiswa.innerText = serverData.students.length;

    const totalHadir = serverData.students.filter(s => s.attendance === 'Hadir').length;
    const statTotalHadir = document.getElementById('stat-total-hadir');
    if (statTotalHadir) statTotalHadir.innerText = totalHadir;

    const statTotalMateri = document.getElementById('stat-total-materi');
    if (statTotalMateri && serverData.materials) {
        statTotalMateri.innerText = serverData.materials.length;
    }

    // Tabel Manajemen Siswa
    const studentTable = document.getElementById('student-table-body');
    if (studentTable) {
        studentTable.innerHTML = '';
        serverData.students.forEach(s => {
            studentTable.innerHTML += `
                <tr class="border-b border-dark-border hover:bg-slate-800/50 transition">
                    <td class="p-4 font-medium text-slate-200">${s.name}</td>
                    <td class="p-4 text-slate-400">${s.nisn}</td>
                    <td class="p-4 text-slate-400">${s.email || '-'}</td>
                    <td class="p-4"><span class="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">${s.status || 'Aktif'}</span></td>
                    <td class="p-4 text-right space-x-2">
                        <button onclick="openEditStudentModal(${s.id}, '${s.name}', '${s.nisn}', '${s.email || ''}')" class="px-3 py-1.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-xl text-xs font-medium hover:bg-blue-500/20 transition">Edit</button>
                        <button onclick="deleteStudent(${s.id})" class="px-3 py-1.5 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-xl text-xs font-medium hover:bg-rose-500/20 transition">Hapus</button>
                    </td>
                </tr>
            `;
        });
    }

    // Tabel Rekap Nilai
    const gradeTable = document.getElementById('grade-table-body');
    if (gradeTable) {
        gradeTable.innerHTML = '';
        serverData.students.forEach(s => {
            gradeTable.innerHTML += `
                <tr class="border-b border-dark-border hover:bg-slate-800/50 transition">
                    <td class="p-4 font-medium text-slate-200">${s.name}</td>
                    <td class="p-4 text-slate-300 font-semibold text-orange-400">${s.tugas || 0}</td>
                    <td class="p-4 text-slate-300 text-blue-400">${s.kuis || 0}</td>
                    <td class="p-4 text-slate-300 text-purple-400">${s.ujian || 0}</td>
                </tr>
            `;
        });
    }

    // Tabel Absensi
    const attendanceTable = document.getElementById('attendance-table-body');
    if (attendanceTable) {
        attendanceTable.innerHTML = '';
        serverData.students.forEach(s => {
            const badgeColor = s.attendance === 'Hadir' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20';
            attendanceTable.innerHTML += `
                <tr class="border-b border-dark-border hover:bg-slate-800/50 transition">
                    <td class="p-4 font-medium text-slate-200">${s.name}</td>
                    <td class="p-4"><span class="px-3 py-1 rounded-full text-xs font-semibold border ${badgeColor}">${s.attendance || 'Belum Absen'}</span></td>
                </tr>
            `;
        });
    }

    // List Materi, Tugas, Kuis, Ujian
    const materialList = document.getElementById('material-list');
    if (materialList && serverData.materials) {
        materialList.innerHTML = '';
        serverData.materials.forEach(m => {
            const deadlineFormatted = m.deadline ? new Date(m.deadline).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }) : 'Tidak ada deadline';
            materialList.innerHTML += `
                <div class="bg-dark-bg p-4 rounded-xl border border-dark-border flex justify-between items-start">
                    <div class="space-y-1">
                        <div class="flex items-center space-x-2">
                            <h4 class="font-bold text-slate-200">${m.title}</h4>
                            <span class="text-xs px-2 py-0.5 bg-orange-500/10 text-orange-400 rounded-md border border-orange-500/20">${m.category}</span>
                        </div>
                        <p class="text-xs text-slate-400">${m.desc}</p>
                        <p class="text-xs text-amber-400 font-medium"><i class="fa-regular fa-clock mr-1"></i>Deadline: ${deadlineFormatted}</p>
                    </div>
                    <button onclick="deleteMaterial(${m.id})" class="px-3 py-1.5 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-xl text-xs font-medium hover:bg-rose-500/20 transition">
                        <i class="fa-solid fa-trash"></i> Hapus
                    </button>
                </div>
            `;
        });
    }

    // List Pengumuman Admin (Dengan Tombol Hapus)
    const annList = document.getElementById('admin-announcement-list');
    if (annList && serverData.announcements) {
        annList.innerHTML = '';
        if (serverData.announcements.length === 0) {
            annList.innerHTML = '<p class="text-xs text-slate-500 italic">Belum ada pengumuman aktif.</p>';
        } else {
            serverData.announcements.forEach(a => {
                annList.innerHTML += `
                    <div class="bg-dark-bg p-4 rounded-xl border border-dark-border flex justify-between items-start">
                        <div class="space-y-1">
                            <div class="flex items-center space-x-2 text-xs text-orange-400 font-semibold">
                                <span><i class="fa-solid fa-bullhorn mr-1.5"></i>${a.title}</span>
                                <span class="text-slate-500 font-normal">(${a.date})</span>
                            </div>
                            <p class="text-sm text-slate-200">${a.content}</p>
                        </div>
                        <button onclick="deleteAnnouncement(${a.id})" class="px-3 py-1.5 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-xl text-xs font-medium hover:bg-rose-500/20 transition">
                            <i class="fa-solid fa-trash"></i> Hapus
                        </button>
                    </div>
                `;
            });
        }
    }
}

// Tambah Materi / Tugas / Kuis / Ujian
async function addMaterial(event) {
    event.preventDefault();
    const title = document.getElementById('mat-title').value;
    const category = document.getElementById('mat-category').value;
    const desc = document.getElementById('mat-desc').value;
    const deadline = document.getElementById('mat-deadline').value;

    const newMat = { id: Date.now(), title, category, desc, deadline };

    try {
        const response = await fetch('/api/materials', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newMat)
        });
        const result = await response.json();
        if (result.success) {
            showToast('Konten & deadline berhasil dipublikasikan!');
            document.getElementById('material-form').reset();
            fetchServerData();
        }
    } catch (err) {
        showToast('Gagal mempublikasikan konten', 'error');
    }
}

// Hapus Tugas / Materi
async function deleteMaterial(id) {
    if (!confirm('Apakah kamu yakin ingin menghapus tugas/materi ini?')) return;

    try {
        const response = await fetch(`/api/materials/${id}`, {
            method: 'DELETE'
        });
        const result = await response.json();
        if (result.success) {
            showToast('Tugas berhasil dihapus dari sistem!');
            fetchServerData();
        }
    } catch (err) {
        showToast('Gagal menghapus tugas', 'error');
    }
}

// Kirim Pengumuman
async function postAnnouncement(event) {
    event.preventDefault();
    const title = document.getElementById('ann-title').value;
    const content = document.getElementById('ann-content').value;

    try {
        const response = await fetch('/api/announcements', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, content })
        });
        const result = await response.json();
        if (result.success) {
            showToast('Pengumuman berhasil dikirim ke siswa!');
            document.getElementById('announcement-form').reset();
            fetchServerData();
        }
    } catch (err) {
        showToast('Gagal mengirim pengumuman', 'error');
    }
}

// Hapus Pengumuman
async function deleteAnnouncement(id) {
    if (!confirm('Apakah kamu yakin ingin menghapus pengumuman ini?')) return;

    try {
        const response = await fetch(`/api/announcements/${id}`, {
            method: 'DELETE'
        });
        const result = await response.json();
        if (result.success) {
            showToast('Pengumuman berhasil dihapus!');
            fetchServerData();
        }
    } catch (err) {
        showToast('Gagal menghapus pengumuman', 'error');
    }
}

async function handleSaveStudent(event) {
    event.preventDefault();
    const name = document.getElementById('modal-student-name').value;
    const nisn = document.getElementById('modal-student-nisn').value;
    const email = document.getElementById('modal-student-email').value;

    const newStudent = { id: Date.now(), name, nisn, email, status: 'Aktif', tugas: 0, kuis: 0, ujian: 0, attendance: 'Belum Absen' };

    try {
        const response = await fetch('/api/students', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newStudent)
        });
        const result = await response.json();
        if (result.success) {
            showToast('Siswa berhasil disimpan secara permanen!');
            closeStudentModal();
            document.getElementById('add-student-form').reset();
            fetchServerData();
        }
    } catch (err) {
        showToast('Gagal menyimpan siswa', 'error');
    }
}

function openEditStudentModal(id, name, nisn, email) {
    document.getElementById('edit-student-id').value = id;
    document.getElementById('edit-student-name').value = name;
    document.getElementById('edit-student-nisn').value = nisn;
    document.getElementById('edit-student-email').value = email;
    document.getElementById('edit-student-modal').classList.remove('hidden');
}

function closeEditStudentModal() {
    document.getElementById('edit-student-modal').classList.add('hidden');
}

async function handleUpdateStudent(event) {
    event.preventDefault();
    const id = document.getElementById('edit-student-id').value;
    const name = document.getElementById('edit-student-name').value;
    const nisn = document.getElementById('edit-student-nisn').value;
    const email = document.getElementById('edit-student-email').value;

    try {
        const response = await fetch(`/api/students/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, nisn, email })
        });
        const result = await response.json();
        if (result.success) {
            showToast('Data siswa berhasil diperbarui!');
            closeEditStudentModal();
            fetchServerData();
        }
    } catch (err) {
        showToast('Gagal memperbarui data siswa', 'error');
    }
}

async function deleteStudent(id) {
    if (!confirm('Apakah kamu yakin ingin menghapus siswa ini dari database?')) return;

    try {
        const response = await fetch(`/api/students/${id}`, {
            method: 'DELETE'
        });
        const result = await response.json();
        if (result.success) {
            showToast('Siswa berhasil dihapus dari sistem!');
            fetchServerData();
        }
    } catch (err) {
        showToast('Gagal menghapus siswa', 'error');
    }
}

// Fungsi Reset Absensi (Fitur Baru)
async function resetAttendance() {
    if (!confirm('Apakah kamu yakin ingin mereset status absensi semua siswa menjadi "Belum Absen"?')) return;

    try {
        const response = await fetch('/api/admin/reset-attendance', {
            method: 'POST'
        });
        const result = await response.json();
        if (result.success) {
            showToast('Absensi berhasil di-reset untuk hari baru!');
            fetchServerData();
        } else {
            showToast('Gagal mereset absensi', 'error');
        }
    } catch (err) {
        showToast('Gagal terhubung ke server', 'error');
    }
}

async function handleAdminAuth(event) {
    event.preventDefault();
    const password = document.getElementById('admin-password-input').value;

    try {
        const response = await fetch('/api/admin/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password })
        });
        const result = await response.json();

        if (result.success) {
            sessionStorage.setItem('admin_logged', 'true');
            document.getElementById('admin-auth-modal').classList.add('hidden');
            showToast('Login admin berhasil!');
            fetchServerData();
        } else {
            showToast(result.message, 'error');
        }
    } catch (err) {
        showToast('Gagal terhubung ke server', 'error');
    }
}

function openStudentModal() { document.getElementById('student-modal').classList.remove('hidden'); }
function closeStudentModal() { document.getElementById('student-modal').classList.add('hidden'); }

function switchTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(el => el.classList.add('hidden'));
    document.getElementById(`tab-${tabId}`).classList.remove('hidden');
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('bg-orange-500', 'text-white', 'shadow-lg', 'shadow-orange-500/20');
        btn.classList.add('text-slate-400');
    });
    const activeNav = document.getElementById(`nav-${tabId}`);
    if (activeNav) {
        activeNav.classList.add('bg-orange-500', 'text-white', 'shadow-lg', 'shadow-orange-500/20');
        activeNav.classList.remove('text-slate-400');
    }
}

function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    const bg = type === 'success' ? 'bg-emerald-600/90' : 'bg-rose-600/90';
    toast.className = `pointer-events-auto px-4 py-3 rounded-xl border text-white text-sm shadow-xl ${bg}`;
    toast.innerHTML = `<span>${message}</span>`;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

window.onload = () => {
    const isAuth = sessionStorage.getItem('admin_logged');
    if (!isAuth) {
        const authModal = document.getElementById('admin-auth-modal');
        if (authModal) authModal.classList.remove('hidden');
    } else {
        fetchServerData();
    }
};