// DOM 요소
const userTableBody = document.getElementById('userTableBody');
const addUserForm = document.getElementById('addUserForm');
const editUserForm = document.getElementById('editUserForm');
const showInactiveCheckbox = document.getElementById('showInactive');
const migrateBtn = document.getElementById('migrateBtn');
const editModal = new bootstrap.Modal(document.getElementById('editModal'));

// 페이지 로드 시 사용자 목록 불러오기
document.addEventListener('DOMContentLoaded', () => {
    loadUsers();
});

// 사용자 목록 불러오기
async function loadUsers() {
    try {
        const includeInactive = showInactiveCheckbox.checked;
        const response = await fetch(`/api/users?includeInactive=${includeInactive}`);
        
        if (!response.ok) {
            throw new Error('사용자 목록을 불러오는데 실패했습니다.');
        }
        
        const users = await response.json();
        displayUsers(users);
    } catch (error) {
        console.error('Error loading users:', error);
        alert('사용자 목록을 불러오는 중 오류가 발생했습니다.');
    }
}

// 사용자 목록 표시
function displayUsers(users) {
    userTableBody.innerHTML = '';
    
    if (users.length === 0) {
        userTableBody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center text-muted py-4">
                    등록된 사용자가 없습니다.
                </td>
            </tr>
        `;
        return;
    }
    
    users.forEach(user => {
        const row = document.createElement('tr');
        row.className = 'user-row';
        
        const createdDate = new Date(user.createdAt).toLocaleDateString('ko-KR');
        const statusBadge = user.isActive 
            ? '<span class="badge bg-success">활성</span>'
            : '<span class="badge bg-secondary">비활성</span>';
        
        row.innerHTML = `
            <td>${user.name}</td>
            <td>${user.department || '-'}</td>
            <td>${user.position || '-'}</td>
            <td>${statusBadge}</td>
            <td>${createdDate}</td>
            <td class="text-center action-buttons">
                <button class="btn btn-sm btn-outline-primary" onclick="editUser('${user.id}', '${user.name}', '${user.department || ''}', '${user.position || ''}')">
                    수정
                </button>
                ${user.isActive ? `
                    <button class="btn btn-sm btn-outline-danger" onclick="deleteUser('${user.id}', '${user.name}')">
                        삭제
                    </button>
                ` : ''}
            </td>
        `;
        
        userTableBody.appendChild(row);
    });
}

// 새 사용자 추가
addUserForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const name = document.getElementById('newUserName').value.trim();
    const department = document.getElementById('newUserDepartment').value.trim();
    const position = document.getElementById('newUserPosition').value.trim();
    
    if (!name) {
        alert('이름을 입력해주세요.');
        return;
    }
    
    try {
        const response = await fetch('/api/users', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, department, position })
        });
        
        const result = await response.json();
        
        if (!response.ok) {
            throw new Error(result.error || '사용자 추가에 실패했습니다.');
        }
        
        alert('사용자가 추가되었습니다.');
        addUserForm.reset();
        loadUsers();
    } catch (error) {
        console.error('Error adding user:', error);
        alert(error.message || '사용자 추가 중 오류가 발생했습니다.');
    }
});

// 사용자 수정 모달 열기
function editUser(id, name, department, position) {
    document.getElementById('editUserId').value = id;
    document.getElementById('editUserName').value = name;
    document.getElementById('editUserDepartment').value = department;
    document.getElementById('editUserPosition').value = position;
    editModal.show();
}

// 사용자 정보 수정 저장
document.getElementById('saveEditBtn').addEventListener('click', async () => {
    const id = document.getElementById('editUserId').value;
    const name = document.getElementById('editUserName').value.trim();
    const department = document.getElementById('editUserDepartment').value.trim();
    const position = document.getElementById('editUserPosition').value.trim();
    
    if (!name) {
        alert('이름을 입력해주세요.');
        return;
    }
    
    try {
        const response = await fetch(`/api/users/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, department, position })
        });
        
        const result = await response.json();
        
        if (!response.ok) {
            throw new Error(result.error || '사용자 수정에 실패했습니다.');
        }
        
        alert('사용자 정보가 수정되었습니다.');
        editModal.hide();
        loadUsers();
    } catch (error) {
        console.error('Error updating user:', error);
        alert(error.message || '사용자 수정 중 오류가 발생했습니다.');
    }
});

// 사용자 삭제
async function deleteUser(id, name) {
    if (!confirm(`정말로 "${name}" 사용자를 삭제하시겠습니까?\n\n삭제된 사용자는 야근 입력 화면에서 보이지 않게 됩니다.\n기존 야근 기록은 유지됩니다.`)) {
        return;
    }
    
    try {
        const response = await fetch(`/api/users/${id}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            const result = await response.json();
            throw new Error(result.error || '사용자 삭제에 실패했습니다.');
        }
        
        alert('사용자가 삭제되었습니다.');
        loadUsers();
    } catch (error) {
        console.error('Error deleting user:', error);
        alert(error.message || '사용자 삭제 중 오류가 발생했습니다.');
    }
}

// 비활성 사용자 포함 체크박스 변경 시
showInactiveCheckbox.addEventListener('change', () => {
    loadUsers();
});

// 마이그레이션 버튼 클릭
migrateBtn.addEventListener('click', async () => {
    if (!confirm('기존 하드코딩된 사용자 목록을 데이터베이스로 이전하시겠습니까?\n\n이 작업은 한 번만 수행하면 됩니다.')) {
        return;
    }
    
    try {
        const response = await fetch('/api/users/migrate', {
            method: 'POST'
        });
        
        const result = await response.json();
        
        if (!response.ok) {
            throw new Error(result.error || '마이그레이션에 실패했습니다.');
        }
        
        alert(`마이그레이션이 완료되었습니다.\n\n${result.results.filter(r => r.status === 'created').length}명 추가됨\n${result.results.filter(r => r.status === 'already_exists').length}명 이미 존재`);
        loadUsers();
    } catch (error) {
        console.error('Error during migration:', error);
        alert(error.message || '마이그레이션 중 오류가 발생했습니다.');
    }
});