<template>
  <div style="max-width: 800px; margin: 0 auto; padding: 24px;">
    
    <!-- Header with Back Button -->
    <div style="display: flex; align-items: center; gap: 14px; margin-bottom: 24px;">
      <button 
        @click="goBack" 
        style="
          display: flex;
          align-items: center;
          justify-content: center;
          width: 42px;
          height: 42px;
          border-radius: 12px;
          background: var(--bg-card);
          border: 1px solid var(--border-primary);
          color: var(--text-primary);
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: var(--card-shadow);
          flex-shrink: 0;
        "
        @mouseenter="$event.currentTarget.style.background = 'var(--bg-hover)'"
        @mouseleave="$event.currentTarget.style.background = 'var(--bg-card)'"
        title="ย้อนกลับ"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <line x1="19" y1="12" x2="5" y2="12"/>
          <polyline points="12 19 5 12 12 5"/>
        </svg>
      </button>

      <div>
        <h1 style="font-size: 26px; font-weight: 800; color: var(--text-primary); margin: 0; line-height: 1.2;">
          ความปลอดภัยของบัญชี
        </h1>
        <p style="font-size: 13px; color: var(--text-muted); margin: 2px 0 0 0;">
          จัดการรหัสผ่าน อีเมล ชื่อผู้ใช้ และตรวจสอบประวัติความปลอดภัย
        </p>
      </div>
    </div>

    <div style="display: flex; flex-direction: column; gap: 24px;">
      
      <!-- Account Credentials -->
      <div style="background: var(--bg-card); border: 1px solid var(--border-primary); border-radius: 16px; padding: 24px;">
        <h3 style="font-size: 18px; font-weight: 700; color: var(--text-primary); margin: 0 0 16px;">ข้อมูลสำคัญ</h3>
        
        <div style="display: flex; flex-direction: column; gap: 16px;">
          <!-- Password -->
          <div style="display: flex; justify-content: space-between; align-items: center; padding-bottom: 16px; border-bottom: 1px solid var(--border-primary);">
            <div>
              <div style="font-weight: 600; color: var(--text-primary);">รหัสผ่าน</div>
              <div style="font-size: 13px; color: var(--text-muted);">อัปเดตรหัสผ่านเพื่อความปลอดภัย</div>
            </div>
            <button @click="openModal('password')" style="padding: 6px 16px; border-radius: 9999px; background: transparent; border: 1px solid var(--border-primary); color: var(--text-primary); cursor: pointer; font-weight: 600;">เปลี่ยนรหัสผ่าน</button>
          </div>

          <!-- Email -->
          <div style="display: flex; justify-content: space-between; align-items: center; padding-bottom: 16px; border-bottom: 1px solid var(--border-primary);">
            <div>
              <div style="font-weight: 600; color: var(--text-primary);">อีเมล</div>
              <div style="font-size: 13px; color: var(--text-muted); line-height: 1.5; margin-top: 2px;">
                <div>หลัก: {{ user?.email || 'ไม่มีอีเมล' }}</div>
                <div v-if="user?.backup_email">สำรอง: {{ user.backup_email }}</div>
              </div>
            </div>
            <button @click="openModal('email')" style="padding: 6px 16px; border-radius: 9999px; background: transparent; border: 1px solid var(--border-primary); color: var(--text-primary); cursor: pointer; font-weight: 600;">จัดการอีเมล</button>
          </div>

          <!-- Username -->
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div>
              <div style="font-weight: 600; color: var(--text-primary);">ชื่อผู้ใช้</div>
              <div style="font-size: 13px; color: var(--text-muted);">@{{ user?.username }}</div>
            </div>
            <button @click="openModal('username')" style="padding: 6px 16px; border-radius: 9999px; background: transparent; border: 1px solid var(--border-primary); color: var(--text-primary); cursor: pointer; font-weight: 600;">เปลี่ยนชื่อผู้ใช้</button>
          </div>
        </div>
      </div>

      <!-- Security Logs -->
      <div style="background: var(--bg-card); border: 1px solid var(--border-primary); border-radius: 16px; padding: 24px;">
        <h3 style="font-size: 18px; font-weight: 700; color: var(--text-primary); margin: 0 0 16px;">ประวัติกิจกรรมความปลอดภัย</h3>
        <div v-if="pendingLogs" style="color: var(--text-muted); font-size: 14px;">กำลังโหลดประวัติ...</div>
        <div v-else-if="logs.length === 0" style="color: var(--text-muted); font-size: 14px;">ไม่มีประวัติกิจกรรม</div>
        <table v-else style="width: 100%; text-align: left; border-collapse: collapse; font-size: 14px;">
          <thead>
            <tr style="color: var(--text-muted); border-bottom: 1px solid var(--border-primary);">
              <th style="padding: 12px 0; font-weight: 600;">เหตุการณ์</th>
              <th style="padding: 12px 0; font-weight: 600;">สถานะ</th>
              <th style="padding: 12px 0; font-weight: 600;">เวลา</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="log in logs" :key="log.id" style="border-bottom: 1px solid var(--border-primary);">
              <td style="padding: 12px 0; color: var(--text-primary);">{{ formatEvent(log.event_type) }}</td>
              <td style="padding: 12px 0;">
                <span :style="{ color: log.status === 'success' ? '#10b981' : '#ef4444' }">
                  {{ log.status === 'success' ? 'สำเร็จ' : 'ล้มเหลว' }}
                </span>
              </td>
              <td style="padding: 12px 0; color: var(--text-muted);">{{ new Date(log.created_at).toLocaleString() }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modals -->
    <ClientOnly>
      <Teleport to="body">
        
        <!-- Change Password Modal -->
        <div v-if="activeModal === 'password'" style="position: fixed; inset: 0; z-index: 9999; display: flex; align-items: center; justify-content: center; background: rgba(0,0,0,0.7); backdrop-filter: blur(8px);" @click.self="closeModal">
          <div class="pwd-modal-card" style="background: var(--bg-card); border: 1px solid var(--border-primary); padding: 28px 26px; border-radius: 24px; width: 92%; max-width: 440px; animation: slideUp 0.2s ease-out; text-align: left; box-shadow: 0 20px 50px rgba(0,0,0,0.5);">
            
            <div v-if="successMessage" style="text-align: center; padding: 20px 10px;">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2" style="margin: 0 auto 16px;">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
              <h3 style="margin: 0 0 12px; color: var(--text-primary); font-size: 20px; font-weight: 800;">สำเร็จ!</h3>
              <p style="color: var(--text-muted); margin-bottom: 24px; font-size: 14.5px;">{{ successMessage }}</p>
              <button @click="closeModal" class="btn-submit" style="width: 100%;">ตกลง</button>
            </div>

            <div v-else>
              <!-- Modal Title Header -->
              <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 18px;">
                <div style="width: 40px; height: 40px; border-radius: 12px; background: rgba(99, 102, 241, 0.15); border: 1px solid rgba(99, 102, 241, 0.3); display: flex; align-items: center; justify-content: center; color: var(--brand); flex-shrink: 0;">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                </div>
                <div>
                  <h3 style="margin: 0; color: var(--text-primary); font-size: 19px; font-weight: 800;">เปลี่ยนรหัสผ่าน</h3>
                  <p style="margin: 2px 0 0; color: var(--text-muted); font-size: 12.5px;">ตั้งรหัสผ่านใหม่เพื่อความปลอดภัยของบัญชี</p>
                </div>
              </div>
              
              <!-- Error Banner -->
              <div v-if="errorMessage" style="display: flex; align-items: flex-start; gap: 10px; padding: 10px 14px; background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 12px; margin-bottom: 16px; animation: slideUp 0.2s ease-out;">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2" style="flex-shrink: 0; margin-top: 1px;">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
                <span style="color: #ef4444; font-size: 13px; line-height: 1.4;">{{ errorMessage }}</span>
              </div>

              <!-- Input Fields -->
              <div style="display: flex; flex-direction: column; gap: 12px; margin-bottom: 16px;">
                <!-- Current Password -->
                <div>
                  <label style="display: block; font-size: 13px; font-weight: 600; color: var(--text-primary); margin-bottom: 6px;">รหัสผ่านปัจจุบัน</label>
                  <div style="position: relative;">
                    <input 
                      v-model="form.current_password" 
                      :type="showPwd1 ? 'text' : 'password'" 
                      placeholder="กรอกรหัสผ่านปัจจุบันของคุณ" 
                      class="input-field" 
                      style="padding-right: 44px;" 
                    />
                    <button type="button" @click="showPwd1 = !showPwd1" style="position: absolute; right: 12px; top: 12px; background: none; border: none; color: var(--text-muted); cursor: pointer; padding: 0;">
                      <svg v-if="!showPwd1" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                      <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                    </button>
                  </div>
                </div>

                <!-- New Password -->
                <div>
                  <label style="display: block; font-size: 13px; font-weight: 600; color: var(--text-primary); margin-bottom: 6px;">รหัสผ่านใหม่</label>
                  <div style="position: relative;">
                    <input 
                      v-model="form.new_password" 
                      :type="showPwd2 ? 'text' : 'password'" 
                      placeholder="ตั้งรหัสผ่านใหม่" 
                      class="input-field" 
                      style="padding-right: 44px;" 
                    />
                    <button type="button" @click="showPwd2 = !showPwd2" style="position: absolute; right: 12px; top: 12px; background: none; border: none; color: var(--text-muted); cursor: pointer; padding: 0;">
                      <svg v-if="!showPwd2" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                      <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                    </button>
                  </div>
                </div>

                <!-- Confirm Password -->
                <div>
                  <label style="display: block; font-size: 13px; font-weight: 600; color: var(--text-primary); margin-bottom: 6px;">ยืนยันรหัสผ่านใหม่</label>
                  <div style="position: relative;">
                    <input 
                      v-model="form.confirm_password" 
                      :type="showPwd3 ? 'text' : 'password'" 
                      placeholder="กรอกรหัสผ่านใหม่อีกครั้งให้ตรงกัน" 
                      class="input-field" 
                      style="padding-right: 44px;" 
                    />
                    <button type="button" @click="showPwd3 = !showPwd3" style="position: absolute; right: 12px; top: 12px; background: none; border: none; color: var(--text-muted); cursor: pointer; padding: 0;">
                      <svg v-if="!showPwd3" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                      <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                    </button>
                  </div>
                </div>
              </div>

              <!-- Password Requirements & Live Checklist Box -->
              <div class="pwd-requirements-card">
                <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 8px; font-size: 12.5px; font-weight: 700; color: var(--text-secondary);">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                  <span>เงื่อนไขรหัสผ่านที่ปลอดภัย:</span>
                </div>
                <div class="pwd-req-list">
                  <div class="pwd-req-item" :class="{ met: pwdChecks?.hasLength }">
                    <span class="req-dot">{{ pwdChecks?.hasLength ? '✓' : '•' }}</span>
                    <span>ความยาวอย่างน้อย <strong>8 ตัวอักษร</strong></span>
                  </div>
                  <div class="pwd-req-item" :class="{ met: pwdChecks?.hasLetter }">
                    <span class="req-dot">{{ pwdChecks?.hasLetter ? '✓' : '•' }}</span>
                    <span>มีตัวอักษร <strong>ภาษาอังกฤษ (a-z, A-Z)</strong></span>
                  </div>
                  <div class="pwd-req-item" :class="{ met: pwdChecks?.hasNumber }">
                    <span class="req-dot">{{ pwdChecks?.hasNumber ? '✓' : '•' }}</span>
                    <span>มีตัวเลข <strong>(0-9)</strong> อย่างน้อย 1 ตัว</span>
                  </div>
                  <div v-if="form.confirm_password" class="pwd-req-item" :class="{ met: pwdChecks?.isMatch }">
                    <span class="req-dot">{{ pwdChecks?.isMatch ? '✓' : '•' }}</span>
                    <span>รหัสผ่านใหม่และการยืนยัน <strong>ตรงกัน</strong></span>
                  </div>
                </div>
              </div>

              <!-- Action Buttons -->
              <div style="display: flex; gap: 12px; margin-top: 20px;">
                <button @click="closeModal" class="btn-cancel">ยกเลิก</button>
                <button 
                  @click="submitPassword" 
                  class="btn-submit" 
                  :disabled="loading || (form.new_password && !pwdChecks?.isValid)"
                >
                  <span v-if="loading">กำลังบันทึก...</span>
                  <span v-else>บันทึกรหัสผ่านใหม่</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Change Email Modal -->
        <div v-if="activeModal === 'email'" style="position: fixed; inset: 0; z-index: 9999; display: flex; align-items: center; justify-content: center; background: rgba(0,0,0,0.7); backdrop-filter: blur(8px);" @click.self="closeModal">
          <div style="background: var(--bg-card); border: 1px solid var(--border-primary); padding: 30px 28px; border-radius: 24px; width: 92%; max-width: 440px; animation: slideUp 0.2s ease-out; box-shadow: 0 20px 50px rgba(0,0,0,0.5);">
            <!-- Header -->
            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 18px;">
              <div style="width: 40px; height: 40px; border-radius: 12px; background: rgba(99, 102, 241, 0.15); border: 1px solid rgba(99, 102, 241, 0.3); display: flex; align-items: center; justify-content: center; color: var(--brand); flex-shrink: 0;">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
              </div>
              <div>
                <h3 style="margin: 0; color: var(--text-primary); font-size: 19px; font-weight: 800;">จัดการอีเมล</h3>
                <p style="margin: 2px 0 0; color: var(--text-muted); font-size: 12.5px;">ระบุอีเมลหลักและอีเมลสำรองสำหรับกู้คืนบัญชี</p>
              </div>
            </div>
            
            <!-- Primary Email -->
            <div style="margin-bottom: 16px;">
              <label style="display: block; font-size: 13.5px; font-weight: 600; color: var(--text-primary); margin-bottom: 6px;">อีเมลหลัก</label>
              <div style="display: flex; gap: 8px;">
                <input v-model="form.email" type="email" placeholder="อีเมลหลักของคุณ" class="input-field" style="flex: 1;" />
                <button v-if="form.email" type="button" @click="form.email = ''" style="padding: 0 14px; border-radius: 8px; background: rgba(239, 68, 68, 0.12); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.3); cursor: pointer; flex-shrink: 0; font-weight: 600; font-size: 13px;">ลบ</button>
              </div>
            </div>

            <!-- Single Backup Email -->
            <div style="margin-bottom: 24px;">
              <label style="display: block; font-size: 13.5px; font-weight: 600; color: var(--text-primary); margin-bottom: 6px;">อีเมลสำรอง</label>
              <div style="display: flex; gap: 8px;">
                <input v-model="form.backup_email" type="email" placeholder="อีเมลสำรองของคุณ" class="input-field" style="flex: 1;" />
                <button v-if="form.backup_email" type="button" @click="form.backup_email = ''" style="padding: 0 14px; border-radius: 8px; background: rgba(239, 68, 68, 0.12); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.3); cursor: pointer; flex-shrink: 0; font-weight: 600; font-size: 13px;">ลบ</button>
              </div>
            </div>

            <!-- Action buttons -->
            <div style="display: flex; gap: 12px;">
              <button @click="closeModal" class="btn-cancel">ยกเลิก</button>
              <button @click="submitEmail(false)" class="btn-submit" :disabled="loading" style="background: var(--brand);">
                <span v-if="!loading">บันทึก</span>
                <span v-else>กำลังบันทึก...</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Change Username Modal -->
        <div v-if="activeModal === 'username'" style="position: fixed; inset: 0; z-index: 9999; display: flex; align-items: center; justify-content: center; background: rgba(0,0,0,0.7); backdrop-filter: blur(8px);" @click.self="closeModal">
          <div class="uname-modal-card" style="background: var(--bg-card); border: 1px solid var(--border-primary); padding: 28px 26px; border-radius: 24px; width: 92%; max-width: 440px; animation: slideUp 0.2s ease-out; text-align: left; box-shadow: 0 20px 50px rgba(0,0,0,0.5);">
            
            <!-- Header -->
            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 20px;">
              <div style="width: 40px; height: 40px; border-radius: 12px; background: rgba(139, 92, 246, 0.15); border: 1px solid rgba(139, 92, 246, 0.3); display: flex; align-items: center; justify-content: center; color: var(--brand); font-weight: 800; font-size: 18px; flex-shrink: 0;">
                @
              </div>
              <div>
                <h3 style="margin: 0; color: var(--text-primary); font-size: 19px; font-weight: 800;">เปลี่ยนชื่อผู้ใช้</h3>
                <p style="margin: 2px 0 0; color: var(--text-muted); font-size: 12.5px;">ชื่อผู้ใช้ใช้สำหรับลิงก์โปรไฟล์และการแท็ก (@mention)</p>
              </div>
            </div>

            <!-- Current Username Badge -->
            <div style="display: flex; align-items: center; justify-content: space-between; background: var(--bg-hover); border: 1px solid var(--border-primary); padding: 10px 14px; border-radius: 12px; margin-bottom: 16px;">
              <span style="font-size: 12.5px; color: var(--text-muted);">ชื่อผู้ใช้ปัจจุบัน:</span>
              <span style="font-size: 13.5px; font-weight: 700; color: var(--text-primary); font-family: monospace;">@{{ user?.username }}</span>
            </div>

            <!-- New Username Input with @ prefix & Counter -->
            <div style="margin-bottom: 14px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                <label style="font-size: 13px; font-weight: 600; color: var(--text-primary);">ชื่อผู้ใช้ใหม่</label>
                <span style="font-size: 11.5px; color: var(--text-muted);">{{ form.new_username.length }}/30</span>
              </div>
              <div style="position: relative;">
                <div style="position: absolute; left: 14px; top: 50%; transform: translateY(-50%); font-weight: 800; color: var(--brand); font-size: 16px; pointer-events: none;">
                  @
                </div>
                <input 
                  v-model="form.new_username" 
                  type="text" 
                  placeholder="new_username" 
                  maxlength="30"
                  class="input-field" 
                  style="padding-left: 36px; padding-right: 14px; font-family: monospace; font-size: 14.5px;" 
                  autocomplete="off"
                  spellcheck="false"
                  autocorrect="off"
                  autocapitalize="off"
                />
              </div>

              <!-- Warning when typing same username -->
              <div v-if="unameChecks?.isSameAsCurrent" style="display: flex; align-items: center; gap: 6px; margin-top: 6px; font-size: 12px; color: #f59e0b;">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                <span>ชื่อนี้คือชื่อปัจจุบันของคุณแล้ว (กรุณาตั้งชื่อใหม่ เช่น {{ user?.username }}_1 หรือ {{ user?.username }}2)</span>
              </div>
            </div>

            <!-- Live Profile Link Preview -->
            <div style="background: rgba(139, 92, 246, 0.06); border: 1px dashed rgba(139, 92, 246, 0.3); border-radius: 12px; padding: 10px 14px; margin-bottom: 16px;">
              <div style="font-size: 11.5px; color: var(--text-muted); margin-bottom: 3px;">ตัวอย่างลิงก์โปรไฟล์ของคุณ:</div>
              <div style="font-size: 13px; font-weight: 600; color: var(--brand); word-break: break-all; font-family: monospace;">
                https://connecxus.com/@{{ form.new_username || 'username' }}
              </div>
            </div>

            <!-- Requirements Checklist Box -->
            <div class="pwd-requirements-card" style="margin-bottom: 18px;">
              <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 8px; font-size: 12.5px; font-weight: 700; color: var(--text-secondary);">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                <span>ข้อกำหนดชื่อผู้ใช้:</span>
              </div>
              <div class="pwd-req-list">
                <div class="pwd-req-item" :class="{ met: unameChecks?.hasLength }">
                  <span class="req-dot">{{ unameChecks?.hasLength ? '✓' : '•' }}</span>
                  <span>ความยาว <strong>3 - 30 ตัวอักษร</strong></span>
                </div>
                <div class="pwd-req-item" :class="{ met: unameChecks?.isValidChars }">
                  <span class="req-dot">{{ unameChecks?.isValidChars ? '✓' : '•' }}</span>
                  <span>ใช้อักษรภาษาอังกฤษ <strong>(A-Z, a-z)</strong>, ตัวเลข <strong>(0-9)</strong>, ขีดล่าง <strong>(_)</strong></span>
                </div>
                <div class="pwd-req-item" :class="{ met: unameChecks?.isDifferent }">
                  <span class="req-dot">{{ unameChecks?.isDifferent ? '✓' : '•' }}</span>
                  <span>ต้องเป็นชื่อใหม่ (ไม่ตรงกับชื่อปัจจุบัน <strong>@{{ user?.username }}</strong>)</span>
                </div>
              </div>
            </div>

            <!-- Buttons -->
            <div style="display: flex; gap: 12px;">
              <button @click="closeModal" class="btn-cancel">ยกเลิก</button>
              <button 
                @click="promptUsernameConfirm" 
                class="btn-submit" 
                :disabled="loading || !unameChecks?.isValid"
              >
                ถัดไป
              </button>
            </div>
          </div>
        </div>

      </Teleport>
    </ClientOnly>

    <!-- Global Sleek Toast Notification -->
    <ClientOnly>
      <Teleport to="body" v-if="toastState.show">
        <div 
          class="security-toast-banner"
          :class="toastState.type"
        >
          <div class="toast-icon-circle">
            <svg v-if="toastState.type === 'success'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
          </div>
          <div class="toast-body">
            <div class="toast-title">{{ toastState.title }}</div>
            <div class="toast-desc" v-if="toastState.message">{{ toastState.message }}</div>
          </div>
        </div>
      </Teleport>
    </ClientOnly>

    <!-- Global Confirm Modal (for username) -->
    <AppConfirmModal
      :isOpen="isConfirmOpen"
      title="ยืนยันการเปลี่ยนชื่อผู้ใช้"
      :message="`คุณแน่ใจหรือไม่ที่จะเปลี่ยนชื่อผู้ใช้เป็น @${form.new_username} ?`"
      confirmText="ยืนยันเปลี่ยนชื่อ"
      cancelText="ยกเลิก"
      @confirm="submitUsername"
      @cancel="cancelUsernameConfirm"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, reactive, onMounted, onUnmounted } from 'vue'

const { user, fetchMe } = useAuth()
const toast = useToast()
const router = useRouter()

onMounted(() => {
  fetchMe()
})

// ── Floating Toast State ──
const toastState = reactive({
  show: false,
  title: '',
  message: '',
  type: 'success' as 'success' | 'error'
})
let toastTimer: any = null

function showSecurityToast(title: string, message = '', type: 'success' | 'error' = 'success') {
  if (toastTimer) clearTimeout(toastTimer)
  toastState.title = title
  toastState.message = message
  toastState.type = type
  toastState.show = true
  toastTimer = setTimeout(() => {
    toastState.show = false
  }, 3500)
}

onUnmounted(() => {
  if (toastTimer) clearTimeout(toastTimer)
})

function goBack() {
  if (typeof window !== 'undefined' && window.history.length > 1) {
    router.back()
  } else {
    navigateTo(user.value ? `/profile/${user.value.username}` : '/')
  }
}

const { data: logsData, pending: pendingLogs, refresh: refreshLogs } = useFetch<any>('/api/users/security/logs')
const logs = computed(() => logsData.value?.logs || [])

function formatEvent(event: string) {
  const map: Record<string, string> = {
    'PASSWORD_CHANGED': 'เปลี่ยนรหัสผ่าน',
    'EMAIL_CHANGED': 'เปลี่ยนอีเมล',
    'USERNAME_CHANGED': 'เปลี่ยนชื่อบัญชี',
    'PASSWORD_FAILED': 'เปลี่ยนรหัสผ่าน (ล้มเหลว)',
  }
  return map[event] || event
}

const activeModal = ref<'password' | 'email' | 'username' | null>(null)
const isConfirmOpen = ref(false)
const loading = ref(false)

const showPwd1 = ref(false)
const showPwd2 = ref(false)
const showPwd3 = ref(false)

const successMessage = ref('')
const errorMessage = ref('')

const form = reactive({
  current_password: '',
  new_password: '',
  confirm_password: '',
  email: '',
  backup_email: '',
  new_username: ''
})

const pwdChecks = computed(() => {
  const pwd = form?.new_password || ''
  const confirm = form?.confirm_password || ''
  const hasLength = Boolean(pwd && pwd.length >= 8)
  const hasLetter = Boolean(pwd && /[a-zA-Z]/.test(pwd))
  const hasNumber = Boolean(pwd && /[0-9]/.test(pwd))
  const isMatch = Boolean(pwd && confirm && pwd === confirm)
  
  return {
    hasLength,
    hasLetter,
    hasNumber,
    isMatch,
    isValid: Boolean(hasLength && hasLetter && hasNumber && (!confirm || isMatch))
  }
})

const unameChecks = computed(() => {
  const uname = (form?.new_username || '').trim()
  const current = (user.value?.username || '').trim()
  
  const hasLength = Boolean(uname.length >= 3 && uname.length <= 30)
  const isValidChars = Boolean(uname.length > 0 && /^[a-zA-Z0-9_]+$/.test(uname))
  const isDifferent = Boolean(uname.length > 0 && uname !== current)
  const isSameAsCurrent = Boolean(uname.length > 0 && uname === current)
  
  return {
    hasLength,
    isValidChars,
    isDifferent,
    isSameAsCurrent,
    isValid: Boolean(hasLength && isValidChars && isDifferent)
  }
})

function openModal(type: 'password' | 'email' | 'username') {
  activeModal.value = type
  successMessage.value = ''
  errorMessage.value = ''
  form.current_password = ''
  form.new_password = ''
  form.confirm_password = ''
  form.email = user.value?.email || ''
  form.backup_email = user.value?.backup_email || ''
  form.new_username = ''
  showPwd1.value = false
  showPwd2.value = false
  showPwd3.value = false
}

function closeModal() {
  activeModal.value = null
  successMessage.value = ''
  errorMessage.value = ''
}

async function submitPassword() {
  errorMessage.value = ''
  if (!form.current_password || !form.new_password || !form.confirm_password) {
    errorMessage.value = 'กรุณากรอกข้อมูลให้ครบถ้วน'
    return
  }
  if (form.new_password.length < 8 || !/(?=.*[0-9])(?=.*[a-zA-Z])/.test(form.new_password)) {
    errorMessage.value = 'รหัสผ่านใหม่ต้องมีอย่างน้อย 8 ตัวอักษร และประกอบด้วยตัวเลขและตัวอักษร'
    return
  }
  if (form.new_password !== form.confirm_password) {
    errorMessage.value = 'รหัสผ่านใหม่และการยืนยันรหัสผ่านไม่ตรงกัน'
    return
  }
  
  loading.value = true
  try {
    const res = await $fetch<any>('/api/users/security/password', {
      method: 'PUT',
      body: {
        current_password: form.current_password,
        new_password: form.new_password
      }
    })
    
    if (!res.success) {
      errorMessage.value = res.message || 'ไม่สามารถเปลี่ยนรหัสผ่านได้'
      return
    }

    successMessage.value = 'เปลี่ยนรหัสผ่านเรียบร้อยแล้ว!'
    showSecurityToast('บันทึกสำเร็จ!', 'เปลี่ยนรหัสผ่านใหม่เรียบร้อยแล้ว', 'success')
    toast.add({ title: 'สำเร็จ', description: 'เปลี่ยนรหัสผ่านเรียบร้อยแล้ว', color: 'green' })
    closeModal()
    refreshLogs()
  } catch (err: any) {
    errorMessage.value = err.data?.message || 'ไม่สามารถเปลี่ยนรหัสผ่านได้ กรุณาลองใหม่อีกครั้ง'
    showSecurityToast('เกิดข้อผิดพลาด', errorMessage.value, 'error')
  } finally {
    loading.value = false
  }
}

async function submitEmail(isDelete = false) {
  loading.value = true
  try {
    const cleanPrimary = isDelete ? '' : (form.email || '').trim()
    const cleanBackup = isDelete ? '' : (form.backup_email || '').trim()

    const res = await $fetch<{ success: boolean; email?: string | null; backup_email?: string | null }>('/api/users/security/email', {
      method: 'PUT',
      body: {
        email: cleanPrimary,
        backup_email: cleanBackup
      }
    })
    const msg = isDelete ? 'ลบข้อมูลอีเมลเรียบร้อยแล้ว' : 'บันทึกข้อมูลอีเมลหลักและอีเมลสำรองสำเร็จแล้ว!'
    successMessage.value = msg
    showSecurityToast('บันทึกสำเร็จ!', msg, 'success')
    toast.add({ title: 'สำเร็จ', description: msg, color: 'green' })

    // Immediately update reactive user state on client
    if (user.value) {
      if (isDelete) {
        user.value.email = ''
        user.value.backup_email = ''
      } else {
        if (res.email !== undefined) user.value.email = res.email || ''
        user.value.backup_email = res.backup_email || cleanBackup
      }
    }

    await fetchMe()
    closeModal()
    refreshLogs()
  } catch (err: any) {
    const errorMsg = err.data?.message || 'ไม่สามารถดำเนินการได้ กรุณาลองใหม่อีกครั้ง'
    showSecurityToast('เกิดข้อผิดพลาด', errorMsg, 'error')
    toast.add({ title: 'ข้อผิดพลาด', description: errorMsg, color: 'red' })
  } finally {
    loading.value = false
  }
}

function promptUsernameConfirm() {
  if (!form.new_username) {
    return showSecurityToast('แจ้งเตือน', 'กรุณากรอกชื่อผู้ใช้ใหม่', 'error')
  }
  activeModal.value = null // ซ่อนหน้าต่างเดิมก่อนเปิดหน้าต่างยืนยันเพื่อไม่ให้ซ้อนกัน
  isConfirmOpen.value = true
}

function cancelUsernameConfirm() {
  isConfirmOpen.value = false
  activeModal.value = 'username' // เปิดหน้าต่างเดิมกลับมา
}

async function submitUsername() {
  isConfirmOpen.value = false
  loading.value = true
  try {
    const cleanUsername = form.new_username.trim()
    await $fetch('/api/users/security/username', {
      method: 'PUT',
      body: {
        new_username: cleanUsername
      }
    })
    const msg = `เปลี่ยนชื่อผู้ใช้เป็น @${cleanUsername} เรียบร้อยแล้ว`
    showSecurityToast('บันทึกสำเร็จ!', msg, 'success')
    toast.add({ title: 'สำเร็จ', description: msg, color: 'green' })
    await fetchMe()
    closeModal()
    refreshLogs()
  } catch (err: any) {
    const errorMsg = err.data?.message || 'มีข้อผิดพลาดในการเปลี่ยนชื่อผู้ใช้'
    showSecurityToast('เกิดข้อผิดพลาด', errorMsg, 'error')
    toast.add({ title: 'ไม่สามารถเปลี่ยนชื่อได้', description: errorMsg, color: 'red' })
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.input-field {
  width: 100%;
  padding: 12px;
  border-radius: 8px;
  border: 1px solid var(--border-primary);
  background: transparent;
  color: var(--text-primary);
  font-family: inherit;
  font-size: 15px;
}
.input-field:focus {
  outline: none;
  border-color: var(--brand);
}

.btn-cancel {
  flex: 1;
  padding: 12px;
  background: transparent;
  color: var(--text-primary);
  border: 1px solid var(--border-primary);
  border-radius: 8px;
  cursor: pointer;
  font-family: inherit;
  font-weight: 600;
}

.btn-submit {
  flex: 1;
  padding: 12px;
  background: var(--brand);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-family: inherit;
  font-weight: bold;
}
.btn-submit:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* ── Password Modal Enhancements ── */
.pwd-requirements-card {
  background: var(--bg-hover);
  border: 1px solid var(--border-primary);
  border-radius: 14px;
  padding: 12px 14px;
}

.pwd-req-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.pwd-req-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12.5px;
  color: var(--text-muted);
  transition: all 0.2s ease;
}

.pwd-req-item .req-dot {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: var(--border-primary);
  color: var(--text-muted);
  font-size: 11px;
  font-weight: 800;
  flex-shrink: 0;
  transition: all 0.2s ease;
}

.pwd-req-item.met {
  color: #10b981;
}

.pwd-req-item.met .req-dot {
  background: rgba(16, 185, 129, 0.2);
  color: #10b981;
  border: 1px solid rgba(16, 185, 129, 0.4);
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(20px) scale(0.95); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

/* ── Floating Cyberpunk Toast Banner ── */
.security-toast-banner {
  position: fixed;
  top: 24px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 99999;
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 22px;
  border-radius: 16px;
  background: rgba(15, 23, 42, 0.92);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.12);
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.5), 0 0 20px rgba(16, 185, 129, 0.15);
  animation: toastSlideDown 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  min-width: 280px;
  max-width: 90vw;
}

.security-toast-banner.success {
  border-color: rgba(16, 185, 129, 0.45);
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.5), 0 0 24px rgba(16, 185, 129, 0.25);
}

.security-toast-banner.error {
  border-color: rgba(239, 68, 68, 0.45);
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.5), 0 0 24px rgba(239, 68, 68, 0.25);
}

.toast-icon-circle {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.security-toast-banner.success .toast-icon-circle {
  background: rgba(16, 185, 129, 0.2);
  color: #10b981;
  border: 1px solid rgba(16, 185, 129, 0.4);
}

.security-toast-banner.error .toast-icon-circle {
  background: rgba(239, 68, 68, 0.2);
  color: #ef4444;
  border: 1px solid rgba(239, 68, 68, 0.4);
}

.toast-body {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.toast-title {
  font-size: 14.5px;
  font-weight: 700;
  color: #f8fafc;
}

.toast-desc {
  font-size: 12.5px;
  color: #94a3b8;
  line-height: 1.4;
}

@keyframes toastSlideDown {
  from {
    opacity: 0;
    transform: translate(-50%, -20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translate(-50%, 0) scale(1);
  }
}
</style>
