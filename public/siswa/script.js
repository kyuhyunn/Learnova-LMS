let currentStudent = null;

// Login Siswa berdasarkan NISN
async function handleStudentLogin(event) {
    event.preventDefault();
    const nisn = document.getElementById('login-nisn').value;

    try {
        const response = await fetch('/api/siswa/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nisn })
        });
        const result = await response.json();

        if (result.success) {
            currentStudent = result.student;
            localStorage.setItem('student_session', JSON.stringify(currentStudent));
            
            document.getElementById('login-container').classList.add('hidden');
            updateStudentUI();
            loadStudentData();
            showToast('Login berhasil, selamat datang ' + currentStudent.name + '!');
        } else {
            showToast(result.message, 'error');
        }
    } catch (err) {
        showToast('Gagal terhubung ke server', 'error');
    }
}

function updateStudentUI() {
    if (!currentStudent) return;
    
    const nameSidebar = document.getElementById('student-name-sidebar');
    if (nameSidebar) nameSidebar.innerText = currentStudent.name;

    const nisnSidebar = document.getElementById('student-nisn-sidebar');
    if (nisnSidebar) nisnSidebar.innerText = 'NISN: ' + currentStudent.nisn;

    const initials = currentStudent.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    const avatar = document.getElementById('user-avatar-initials');
    if (avatar) avatar.innerText = initials;

    const attStatus = document.getElementById('stat-attendance-status');
    if (attStatus) {
        attStatus.innerText = currentStudent.attendance || 'Belum Absen';
        attStatus.className = currentStudent.attendance === 'Hadir' ? 'text-2xl font-bold mt-1 text-emerald-400' : 'text-2xl font-bold mt-1 text-amber-400';
    }
}

// Load Data Materi, Kuis, Ujian, & Pengumuman + Sinkronisasi Data Siswa Terbaru
async function loadStudentData() {
    if (!currentStudent) return;

    try {
        const response = await fetch('/api/data');
        const data = await response.json();
        
        // SINKRONISASI OTOMATIS: Perbarui status siswa dari database server (misal setelah di-reset admin)
        const latestStudent = data.students.find(s => s.id === currentStudent.id);
        if (latestStudent) {
            currentStudent = latestStudent;
            localStorage.setItem('student_session', JSON.stringify(currentStudent));
            updateStudentUI();
        }

        const materialContainer = document.getElementById('student-material-list');
        const quizContainer = document.getElementById('student-quiz-list');
        const examContainer = document.getElementById('student-exam-list');
        const announcementContainer = document.getElementById('student-announcements');

        // Render Pengumuman dari Guru
        if (announcementContainer && data.announcements) {
            announcementContainer.innerHTML = '';
            if (data.announcements.length === 0) {
                announcementContainer.innerHTML = '<p class="text-xs text-slate-500 italic">Tidak ada pengumuman saat ini.</p>';
            } else {
                data.announcements.forEach(a => {
                    announcementContainer.innerHTML += `
                        <div class="bg-dark-bg p-4 rounded-xl border border-dark-border space-y-2">
                            <div class="flex items-center space-x-2 text-xs text-orange-400 font-semibold">
                                <i class="fa-solid fa-bullhorn"></i>
                                <span>${a.title}</span>
                            </div>
                            <p class="text-sm text-slate-200">${a.content}</p>
                        </div>
                    `;
                });
            }
        }

        // Render Materi, Kuis, dan Ujian ke Tab masing-masing
        if (data.materials) {
            if (materialContainer) materialContainer.innerHTML = '';
            if (quizContainer) quizContainer.innerHTML = '';
            if (examContainer) examContainer.innerHTML = '';

            data.materials.forEach(m => {
                const now = new Date();
                const deadlineDate = m.deadline ? new Date(m.deadline) : null;
                const isExpired = deadlineDate && now > deadlineDate;

                const deadlineFormatted = deadlineDate ? deadlineDate.toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }) : 'Tanpa Batas Waktu';
                
                const btnStyle = isExpired 
                    ? 'bg-slate-700 text-slate-400 cursor-not-allowed' 
                    : 'bg-orange-500 hover:bg-orange-600 text-white shadow-lg shadow-orange-500/20';
                
                const btnAction = isExpired ? '' : `onclick="submitTask(${m.id})"`;
                const btnLabel = isExpired ? '<i class="fa-solid fa-ban mr-1.5"></i> Waktu Habis (Deadline Lewat)' : `<i class="fa-solid fa-paper-plane mr-1.5"></i> ${m.category === 'Kuis' ? 'Kirim Jawaban Kuis' : m.category === 'Ujian' ? 'Kirim Lembar Ujian' : 'Kumpulkan Tugas'}`;

                const cardHTML = `
                    <div class="bg-dark-bg p-5 rounded-2xl border border-dark-border space-y-3">
                        <div class="flex justify-between items-center">
                            <h4 class="font-bold text-slate-100 text-base">${m.title}</h4>
                            <span class="text-xs px-2.5 py-1 bg-orange-500/10 text-orange-400 rounded-lg border border-orange-500/20 font-medium">${m.category}</span>
                        </div>
                        <p class="text-xs text-slate-300 leading-relaxed">${m.desc}</p>
                        <div class="flex items-center justify-between pt-1">
                            <span class="text-xs ${isExpired ? 'text-rose-400 font-semibold' : 'text-amber-400'}">
                                <i class="fa-regular fa-clock mr-1"></i> Deadline: ${deadlineFormatted}
                            </span>
                        </div>
                        <button ${btnAction} class="w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-medium transition ${btnStyle}">
                            ${btnLabel}
                        </button>
                    </div>
                `;

                if (m.category === 'Kuis' && quizContainer) {
                    quizContainer.innerHTML += cardHTML;
                } else if (m.category === 'Ujian' && examContainer) {
                    examContainer.innerHTML += cardHTML;
                } else if (materialContainer) {
                    materialContainer.innerHTML += cardHTML;
                }
            });
        }
    } catch (err) {
        console.error('Gagal memuat data siswa:', err);
    }
}

// Absensi Check-in
async function doAttendance() {
    if (!currentStudent) return;

    try {
        const response = await fetch('/api/siswa/attendance', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ studentId: currentStudent.id })
        });
        const result = await response.json();
        if (result.success) {
            currentStudent.attendance = 'Hadir';
            localStorage.setItem('student_session', JSON.stringify(currentStudent));
            updateStudentUI();
            showToast('Absensi berhasil dicatat: Hadir!');
        } else {
            showToast(result.message, 'error');
        }
    } catch (err) {
        showToast('Gagal melakukan absensi', 'error');
    }
}

// Kumpul Tugas / Kuis / Ujian
async function submitTask(materialId) {
    if (!currentStudent) return;

    try {
        const response = await fetch('/api/siswa/submit-task', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ studentId: currentStudent.id, materialId })
        });
        const result = await response.json();
        if (result.success) {
            showToast(result.message);
        } else {
            showToast(result.message, 'error');
        }
    } catch (err) {
        showToast('Gagal mengirim data', 'error');
    }
}

function switchTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(el => el.classList.add('hidden'));
    const target = document.getElementById(`tab-${tabId}`);
    if (target) target.classList.remove('hidden');

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

function logoutStudent() {
    localStorage.removeItem('student_session');
    location.reload();
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
    const savedSession = localStorage.getItem('student_session');
    if (savedSession) {
        currentStudent = JSON.parse(savedSession);
        const loginContainer = document.getElementById('login-container');
        if (loginContainer) loginContainer.classList.add('hidden');
        
        updateStudentUI();
        loadStudentData();
    }
};