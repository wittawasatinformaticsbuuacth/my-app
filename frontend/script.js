async function loadUsers() {
  const usersList = document.getElementById("usersList");
  usersList.innerHTML = '<p class="loading">กำลังโหลด...</p>';

  try {
    const response = await fetch(`${API_URL}/users`);

    if (!response.ok) {
      throw new Error("ไม่สามารถโหลดข้อมูลได้");
    }

    const users = await response.json();

    if (users.length === 0) {
      usersList.innerHTML = '<p class="loading">ยังไม่มีผู้ใช้ในระบบ</p>';
      return;
    }

    // แสดงรายการผู้ใช้
    usersList.innerHTML = users
      .map(
        (user) => `
            <div class="user-card">
                <div class="user-info">
                    <h3>${user.name}</h3>
                    <p>📧 ${user.email}</p>
                </div>
                <button class="delete-btn" onclick="deleteUser(${user.id})">
                    🗑️ ลบ
                </button>
            </div>
        `
      )
      .join("");
  } catch (error) {
    console.error("Error:", error);
    usersList.innerHTML = `
            <div class="error">
                ⚠️ เกิดข้อผิดพลาด: ${error.message}<br>
                <small>ตรวจสอบว่า Backend ทำงานอยู่หรือไม่</small>
            </div>
        `;
  }
}

// เพิ่มผู้ใช้ใหม่
async function addUser(event) {
  event.preventDefault();

  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;

  try {
    const response = await fetch(`${API_URL}/users`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, email }),
    });

    if (!response.ok) {
      throw new Error("ไม่สามารถเพิ่มผู้ใช้ได้");
    }

    const user = await response.json();

    // แสดงข้อความสำเร็จ
    showMessage("success", `✅ เพิ่ม ${user.name} สำเร็จ!`);

    // ล้างฟอร์ม
    document.getElementById("userForm").reset();

    // โหลดข้อมูลใหม่
    loadUsers();
  } catch (error) {
    console.error("Error:", error);
    showMessage("error", `⚠️ เกิดข้อผิดพลาด: ${error.message}`);
  }
}

// ลบผู้ใช้
async function deleteUser(id) {
  if (!confirm("คุณแน่ใจหรือไม่ว่าต้องการลบผู้ใช้นี้?")) {
    return;
  }

  try {
    const response = await fetch(`${API_URL}/users/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error("ไม่สามารถลบผู้ใช้ได้");
    }

    showMessage("success", "✅ ลบผู้ใช้สำเร็จ!");
    loadUsers();
  } catch (error) {
    console.error("Error:", error);
    showMessage("error", `⚠️ เกิดข้อผิดพลาด: ${error.message}`);
  }
}

// แสดงข้อความแจ้งเตือน
function showMessage(type, message) {
  const container = document.querySelector(".container");
  const messageDiv = document.createElement("div");
  messageDiv.className = type;
  messageDiv.textContent = message;

  container.insertBefore(messageDiv, container.firstChild);

  // ลบข้อความหลัง 3 วินาที
  setTimeout(() => {
    messageDiv.remove();
  }, 3000);
}

// Event Listeners
document.getElementById("userForm").addEventListener("submit", addUser);

// โหลดข้อมูลเมื่อเปิดหน้าเว็บ
loadUsers();
