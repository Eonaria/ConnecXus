<template>
  <div class="admin-dashboard">
    <div class="admin-header">
      <div class="admin-header-title-wrap">
        <div class="admin-title-badge">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
          </svg>
        </div>
        <div class="admin-header-info">
          <h1 class="admin-main-title">System Administration</h1>
          <p class="subtitle">ศูนย์กลางการจัดการระบบ ผู้ใช้งาน ชุมชน การรายงาน และบันทึกกิจกรรม</p>
        </div>
      </div>
      <div class="admin-online-pill">
        <span class="live-dot-green"></span>
        <span>Admin Panel Active</span>
      </div>
    </div>
    
    <!-- Floating Glass Segmented Tabs Dock -->
    <div class="tabs-nav-wrapper">
      <div class="admin-tabs-dock">
        <button 
          @click="activeTab = 'dashboard'" 
          class="nexus-tab"
          :class="{ active: activeTab === 'dashboard' }"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
          <span>ภาพรวม (Dashboard)</span>
        </button>
        <button 
          @click="activeTab = 'users'" 
          class="nexus-tab"
          :class="{ active: activeTab === 'users' }"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          <span>จัดการผู้ใช้</span>
        </button>
        <button 
          @click="activeTab = 'banned'" 
          class="nexus-tab"
          :class="{ active: activeTab === 'banned' }"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>
          <span>บัญชีที่ถูกระงับ</span>
          <span v-if="unreadBannedCount > 0" class="badge-red" title="บัญชีที่ถูกระงับใหม่">{{ unreadBannedCount }}</span>
        </button>
        <button 
          @click="activeTab = 'communities'" 
          class="nexus-tab"
          :class="{ active: activeTab === 'communities' }"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
          <span>จัดการชุมชน</span>
        </button>
        <button 
          @click="activeTab = 'reports'" 
          class="nexus-tab"
          :class="{ active: activeTab === 'reports' }"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          <span>ประวัติการรายงาน</span>
          <span v-if="unreadReportsCount > 0" class="badge-yellow" title="รายงานที่รอตรวจสอบใหม่">{{ unreadReportsCount }}</span>
        </button>
        <button 
          @click="activeTab = 'logs'" 
          class="nexus-tab"
          :class="{ active: activeTab === 'logs' }"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
          <span>ระบบล็อก (Logs)</span>
          <span v-if="unreadLogsCount > 0" class="badge-red">{{ unreadLogsCount }}</span>
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>กำลังโหลดข้อมูลระดับสูง...</p>
    </div>

    <!-- Dashboard Tab -->
    <div v-else-if="activeTab === 'dashboard'" class="dashboard-grid">
      <div class="stat-card">
        <div class="stat-icon brand">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
        </div>
        <div class="stat-content">
          <h3>ผู้ใช้ทั้งหมดในระบบ</h3>
          <div class="stat-value">{{ stats?.totalUsers || 0 }} <span>คน</span></div>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon info">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
        </div>
        <div class="stat-content">
          <h3>โพสต์ใหม่วันนี้</h3>
          <div class="stat-value">{{ stats?.postsToday || 0 }} <span>โพสต์</span></div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon warning">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
        </div>
        <div class="stat-content">
          <h3>รายงานที่รอตรวจสอบ</h3>
          <div class="stat-value" :class="{'text-warning': (stats?.unresolvedReports || 0) > 0}">{{ stats?.unresolvedReports || 0 }} <span>รายการ</span></div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon danger">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>
        </div>
        <div class="stat-content">
          <h3>บัญชีที่ถูกระงับ (Banned)</h3>
          <div class="stat-value text-danger">{{ stats?.bannedUsers || 0 }} <span>บัญชี</span></div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon" style="background: rgba(16,185,129,0.1); color: #10b981;">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="4"/></svg>
        </div>
        <div class="stat-content">
          <h3>ผู้ใช้ออนไลน์ขณะนี้</h3>
          <div class="stat-value">{{ stats?.onlineCount || 0 }} <span>คน</span></div>
        </div>
      </div>
    </div>

    <!-- Users Tab -->
    <div v-else-if="activeTab === 'users'" class="nexus-panel">
      <!-- Toolbar: Search & Filters -->
      <div class="admin-search-toolbar">
        <div class="search-input-wrap">
          <svg class="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input 
            v-model="searchUsers" 
            type="text" 
            placeholder="ค้นหาชื่อผู้ใช้, ชื่อที่แสดง, อีเมล..." 
            class="admin-search-input"
          />
          <button v-if="searchUsers" @click="searchUsers = ''" class="btn-clear-search" title="ล้างการค้นหา">✕</button>
        </div>

        <div class="filter-controls-group">
          <!-- Role Filter -->
          <div class="filter-select-box">
            <span class="filter-label">ยศ:</span>
            <select v-model="filterUserRole" class="admin-filter-select">
              <option value="all">ทั้งหมด</option>
              <option value="admin">Admin</option>
              <option value="user">User</option>
            </select>
          </div>

          <div class="result-count-badge">
            {{ filteredUsers.length }} บัญชีปกติ
          </div>
        </div>
      </div>

      <table class="nexus-table">
        <thead>
          <tr>
            <th>ผู้ใช้</th>
            <th>อีเมล</th>
            <th>สถานะ</th>
            <th>ยศ (Role)</th>
            <th class="text-right">จัดการ</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="filteredUsers.length === 0">
            <td colspan="5" class="empty-state" style="text-align: center; padding: 40px 20px; color: var(--text-muted);">
              <div style="display: flex; flex-direction: column; align-items: center; gap: 8px;">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="opacity: 0.5;">
                  <circle cx="11" cy="11" r="8"/>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
                <span>{{ searchUsers || filterUserRole !== 'all' ? 'ไม่พบผู้ใช้ที่ตรงกับเงื่อนไขการค้นหา' : 'ไม่มีข้อมูลผู้ใช้ในระบบ' }}</span>
                <button v-if="searchUsers || filterUserRole !== 'all'" @click="searchUsers = ''; filterUserRole = 'all'" class="nexus-btn btn-outline" style="margin-top: 6px; padding: 4px 12px; font-size: 12px;">
                  ล้างตัวกรอง
                </button>
              </div>
            </td>
          </tr>
          <tr v-for="u in filteredUsers" :key="u.id" class="nexus-row">
            <td>
              <div class="user-profile">
                <div class="avatar-wrapper">
                  <img :src="u.avatar_url || '/default-avatar.svg'" />
                </div>
                <div class="user-info">
                  <div class="display-name">{{ u.display_name }}</div>
                  <div class="username">
                    @{{ u.username }} 
                    <span v-if="u.report_count > 0" class="text-danger" style="margin-left: 6px; font-weight: bold; font-size: 11px;">
                      (โดนรีพอร์ต {{ u.report_count }} ครั้ง)
                    </span>
                  </div>
                </div>
              </div>
            </td>
            <td class="text-muted">{{ u.email }}</td>
            <td>
              <div class="nexus-badge badge-success">
                <div class="glow-dot"></div>
                ปกติ
              </div>
            </td>
            <td>
              <div class="nexus-badge" :class="u.role === 'admin' ? 'badge-brand' : 'badge-default'">
                {{ u.role === 'admin' ? 'Admin' : 'User' }}
              </div>
            </td>
            <td class="actions-cell">
              <div class="actions-wrapper" v-if="u.id !== 1">
                <button 
                  v-if="u.id !== user?.id"
                  @click="openModal('role', u)" 
                  class="nexus-btn btn-outline"
                >
                  {{ u.role === 'admin' ? 'ปลดแอดมิน' : 'ตั้งแอดมิน' }}
                </button>
                <button 
                  v-if="u.id !== user?.id"
                  @click="openModal('ban', u)" 
                  class="nexus-btn btn-warning"
                >
                  ระงับบัญชี
                </button>
                <button 
                  v-if="u.id !== user?.id"
                  @click="openModal('delete', u)" 
                  class="nexus-btn btn-danger"
                >
                  ลบถาวร
                </button>
              </div>
              <div v-else class="text-muted" style="font-size: 12px; font-weight: bold;">
                (ผู้ก่อตั้งระบบ)
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Banned Users Tab (ห้องแยกสำหรับบัญชีที่ถูกระงับ) -->
    <div v-else-if="activeTab === 'banned'" class="nexus-panel fade-in">
      <div class="card-header" style="background: rgba(239, 68, 68, 0.08); border-bottom: 1px solid rgba(239, 68, 68, 0.2);">
        <div class="header-icon" style="background: rgba(239, 68, 68, 0.15); color: #ef4444;">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
          </svg>
        </div>
        <div>
          <h2 style="color: #ef4444; margin: 0; font-size: 16px;">ห้องแยก: บัญชีผู้ใช้ที่ถูกระงับ (Banned Accounts Vault)</h2>
          <p style="margin: 2px 0 0 0; font-size: 12px; color: var(--text-muted);">
            รายชื่อบัญชีทั้งหมดที่ถูกระงับสิทธิ์การใช้งานในระบบ สามารถค้นหา ตรวจสอบ หรือปลดระงับได้ที่นี่
          </p>
        </div>
      </div>

      <!-- Toolbar: Search Banned Users -->
      <div class="admin-search-toolbar">
        <div class="search-input-wrap">
          <svg class="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input 
            v-model="searchBannedUsers" 
            type="text" 
            placeholder="ค้นหาชื่อผู้ใช้, ชื่อที่แสดง, อีเมลที่ถูกระงับ..." 
            class="admin-search-input"
          />
          <button v-if="searchBannedUsers" @click="searchBannedUsers = ''" class="btn-clear-search" title="ล้างการค้นหา">✕</button>
        </div>

        <div class="filter-controls-group">
          <div class="result-count-badge" style="background: rgba(239, 68, 68, 0.12); color: #ef4444; border-color: rgba(239, 68, 68, 0.25);">
            {{ filteredBannedUsers.length }} บัญชีที่ถูกระงับ
          </div>
        </div>
      </div>

      <table class="nexus-table">
        <thead>
          <tr>
            <th>ผู้ใช้ที่ถูกระงับ</th>
            <th>อีเมล</th>
            <th>สถานะ</th>
            <th>ยศเดิม</th>
            <th class="text-right">การจัดการ</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="filteredBannedUsers.length === 0">
            <td colspan="5" class="empty-state" style="text-align: center; padding: 48px 20px; color: var(--text-muted);">
              <div style="display: flex; flex-direction: column; align-items: center; gap: 10px;">
                <div style="width: 52px; height: 52px; border-radius: 50%; background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.2); display: flex; align-items: center; justify-content: center; color: #10b981;">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                    <polyline points="22 4 12 14.01 9 11.01"/>
                  </svg>
                </div>
                <div style="font-weight: 700; font-size: 15px; color: var(--text-primary);">
                  {{ searchBannedUsers ? 'ไม่พบบัญชีที่ถูกระงับที่ตรงกับการค้นหา' : 'ไม่มีบัญชีผู้ใช้ที่ถูกระงับในระบบ' }}
                </div>
                <p style="margin: 0; font-size: 13px; color: var(--text-muted);">
                  {{ searchBannedUsers ? 'ลองค้นหาด้วยชื่อผู้ใช้ หรืออีเมลอื่น' : 'ขณะนี้สมาชิกทุกคนในระบบสามารถใช้งานได้ตามปกติอย่างปลอดภัย 🎉' }}
                </p>
                <button v-if="searchBannedUsers" @click="searchBannedUsers = ''" class="nexus-btn btn-outline" style="margin-top: 6px; padding: 5px 14px; font-size: 12px;">
                  ล้างคำค้นหา
                </button>
              </div>
            </td>
          </tr>
          <tr v-for="u in filteredBannedUsers" :key="u.id" class="nexus-row is-banned" :class="{ 'is-new-item': isNewBanned(u) }">
            <td>
              <div class="user-profile">
                <div class="avatar-wrapper" style="border: 2px solid rgba(239, 68, 68, 0.5);">
                  <img :src="u.avatar_url || '/default-avatar.svg'" />
                </div>
                <div class="user-info">
                  <div class="display-name" style="text-decoration: line-through; color: #f87171; display: flex; align-items: center; gap: 4px;">
                    <span>{{ u.display_name }}</span>
                    <span v-if="isNewBanned(u)" class="badge-new-glow">ใหม่</span>
                  </div>
                  <div class="username">
                    @{{ u.username }} 
                    <span v-if="u.report_count > 0" class="text-danger" style="margin-left: 6px; font-weight: bold; font-size: 11px;">
                      (โดนรีพอร์ต {{ u.report_count }} ครั้ง)
                    </span>
                  </div>
                </div>
              </div>
            </td>
            <td class="text-muted">{{ u.email }}</td>
            <td>
              <div style="display: flex; flex-direction: column; gap: 3px;">
                <div class="nexus-badge badge-danger" style="width: fit-content;">
                  <div class="glow-dot"></div>
                  {{ formatBanStatus(u).label }}
                </div>
                <span v-if="formatBanStatus(u).subtext" style="font-size: 11px; color: var(--text-muted);">
                  {{ formatBanStatus(u).subtext }}
                </span>
                <span v-if="u.ban_reason" style="font-size: 11px; color: #f87171; max-width: 220px; word-break: break-word;">
                  {{ u.ban_reason }}
                </span>
              </div>
            </td>
            <td>
              <div class="nexus-badge" :class="u.role === 'admin' ? 'badge-brand' : 'badge-default'">
                {{ u.role === 'admin' ? 'Admin' : 'User' }}
              </div>
            </td>
            <td class="actions-cell">
              <div class="actions-wrapper" v-if="u.id !== 1">
                <button 
                  v-if="u.id !== user?.id"
                  @click="openModal('ban', u)" 
                  class="nexus-btn btn-success"
                  style="display: inline-flex; align-items: center; gap: 4px;"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                  ปลดแบน
                </button>
                <button 
                  v-if="u.id !== user?.id"
                  @click="openModal('delete', u)" 
                  class="nexus-btn btn-danger"
                >
                  ลบถาวร
                </button>
              </div>
              <div v-else class="text-muted" style="font-size: 12px; font-weight: bold;">
                (ผู้ก่อตั้งระบบ)
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Reports Tab -->
    <div v-else-if="activeTab === 'reports'" class="nexus-panel">
      <!-- Toolbar: Search & Filters -->
      <div class="admin-search-toolbar">
        <div class="search-input-wrap">
          <svg class="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input 
            v-model="searchReports" 
            type="text" 
            placeholder="ค้นหาข้อความรายงาน, ผู้รายงาน, ผู้ถูกรายงาน..." 
            class="admin-search-input"
          />
          <button v-if="searchReports" @click="searchReports = ''" class="btn-clear-search" title="ล้างการค้นหา">✕</button>
        </div>

        <div class="filter-controls-group">
          <!-- Status Filter -->
          <div class="filter-select-box">
            <span class="filter-label">สถานะ:</span>
            <select v-model="filterReportStatus" class="admin-filter-select">
              <option value="all">ทั้งหมด</option>
              <option value="pending">รอตรวจสอบ</option>
              <option value="reviewed">กำลังดำเนินการ</option>
              <option value="resolved">ตรวจสอบแล้ว</option>
            </select>
          </div>

          <!-- Target Type Filter -->
          <div class="filter-select-box">
            <span class="filter-label">ประเภท:</span>
            <select v-model="filterReportTarget" class="admin-filter-select">
              <option value="all">ทั้งหมด</option>
              <option value="user">ผู้ใช้</option>
              <option value="community">ชุมชน</option>
              <option value="post">โพสต์</option>
              <option value="comment">คอมเมนต์</option>
              <option value="message">ข้อความแชท</option>
            </select>
          </div>

          <div class="result-count-badge">
            {{ filteredReports.length }} รายการ
          </div>
        </div>
      </div>

      <table class="nexus-table reports-table">
        <thead>
          <tr>
            <th style="width: 110px;">วันที่</th>
            <th style="width: 140px;">ผู้รายงาน</th>
            <th style="width: 170px;">ผู้ถูกรายงาน</th>
            <th style="min-width: 280px;">สาเหตุและบริบท</th>
            <th style="width: 130px; text-align: center;">สถานะ</th>
            <th style="width: 140px;" class="text-right">จัดการ</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="filteredReports.length === 0">
            <td colspan="6" class="empty-state" style="text-align: center; padding: 40px 20px; color: var(--text-muted);">
              <div style="display: flex; flex-direction: column; align-items: center; gap: 8px;">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="opacity: 0.5;">
                  <circle cx="11" cy="11" r="8"/>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
                <span>{{ searchReports || filterReportStatus !== 'all' || filterReportTarget !== 'all' ? 'ไม่พบรายงานที่ตรงกับเงื่อนไขการค้นหา' : 'ไม่มีข้อมูลการรายงานในขณะนี้' }}</span>
                <button v-if="searchReports || filterReportStatus !== 'all' || filterReportTarget !== 'all'" @click="searchReports = ''; filterReportStatus = 'all'; filterReportTarget = 'all'" class="nexus-btn btn-outline" style="margin-top: 6px; padding: 4px 12px; font-size: 12px;">
                  ล้างตัวกรอง
                </button>
              </div>
            </td>
          </tr>
          <tr v-for="r in filteredReports" :key="r.id" class="nexus-row" :class="{ 'is-new-report': isNewReport(r) }">
            <td class="date-cell">
              <div class="report-date" style="display: flex; align-items: center; gap: 4px;">
                <span>{{ new Date(r.created_at).toLocaleDateString('th-TH', { dateStyle: 'short' }) }}</span>
                <span v-if="isNewReport(r)" class="badge-new-glow yellow">ใหม่</span>
              </div>
              <div class="report-time">{{ new Date(r.created_at).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) }} น.</div>
            </td>
            <td>
              <div class="mini-profile">
                <img :src="r.reporter_avatar || '/default-avatar.svg'" />
                <span class="profile-handle">@{{ r.reporter_username }}</span>
              </div>
            </td>
            <td>
              <div class="mini-profile" v-if="r.target_type === 'user'">
                <img :src="r.reported_avatar || '/default-avatar.svg'" />
                <span class="profile-handle" :class="{ 'text-danger fw-bold': r.reported_is_banned }">@{{ r.reported_username }}</span>
                <span class="target-tag tag-user">ผู้ใช้</span>
              </div>
              <div v-else-if="r.target_type === 'community'" class="mini-profile">
                <div class="community-icon-box">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                </div>
                <div style="display: flex; flex-direction: column;">
                  <span style="color: #fbbf24; font-weight: 700; font-size: 13.5px;">{{ r.reported_community_name || '?' }}</span>
                  <span v-if="r.reported_community_is_suspended" class="target-tag tag-danger" style="margin-top: 2px;">ถูกระงับแล้ว</span>
                </div>
              </div>
              <div v-else class="mini-profile">
                <img :src="r.reported_avatar || '/default-avatar.svg'" />
                <div style="display: flex; flex-direction: column; gap: 2px;">
                  <span class="profile-handle" :class="{ 'text-danger fw-bold': r.reported_is_banned }">@{{ r.reported_username }}</span>
                  <div>
                    <span v-if="r.target_type === 'message'" class="target-tag tag-message">แชท</span>
                    <span v-else-if="r.target_type === 'post' && r.report_context_community_id" class="target-tag tag-comm-post">โพสต์ชุมชน</span>
                    <span v-else-if="r.target_type === 'post'" class="target-tag tag-post">โพสต์หน้าหลัก</span>
                    <span v-else-if="r.target_type === 'comment'" class="target-tag tag-comment">คอมเมนต์</span>
                    <span v-else class="target-tag">{{ r.target_type }}</span>
                  </div>
                </div>
              </div>
            </td>
            <td>
              <div class="reason-card">
                <div class="reason-text">{{ r.reason }}</div>
                
                <div v-if="r.report_context_community_id" class="reason-ctx ctx-community">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
                  <span>รายงานจากกลุ่ม: <b>{{ r.report_context_community_id }}</b></span>
                </div>

                <div v-if="r.target_type === 'post' && r.reported_post_id" class="reason-ctx ctx-post">
                  <span class="ctx-label">โพสต์:</span>
                  <span class="ctx-content">{{ r.post_content ? (r.post_content.substring(0, 60) + (r.post_content.length > 60 ? '...' : '')) : '(โพสต์ถูกลบไปแล้ว)' }}</span>
                </div>
                <div v-if="r.target_type === 'comment' && r.reported_comment_id" class="reason-ctx ctx-comment">
                  <span class="ctx-label">คอมเมนต์:</span>
                  <span class="ctx-content">{{ r.comment_content ? (r.comment_content.substring(0, 60) + (r.comment_content.length > 60 ? '...' : '')) : '(คอมเมนต์ถูกลบไปแล้ว)' }}</span>
                </div>
                <div v-if="r.target_type === 'message' && r.reported_message_id" class="reason-ctx ctx-message">
                  <span class="ctx-label">แชท:</span>
                  <span class="ctx-content">{{ r.message_content ? (r.message_content.substring(0, 60) + (r.message_content.length > 60 ? '...' : '')) : '(ข้อความถูกลบไปแล้ว/รูปภาพ)' }}</span>
                </div>

                <!-- Navigation Links -->
                <div class="reason-links">
                  <NuxtLink v-if="r.target_type === 'user'" :to="'/profile/' + r.reported_username" target="_blank" class="reason-link-btn link-user">
                    ดูโปรไฟล์
                  </NuxtLink>
                  <NuxtLink v-if="r.target_type === 'community' && r.reported_community_slug" :to="'/community/' + r.reported_community_slug" target="_blank" class="reason-link-btn link-community">
                    ดูชุมชน
                  </NuxtLink>
                  <NuxtLink v-if="r.target_type === 'post' && r.reported_post_id" :to="'/post/' + r.reported_post_id" target="_blank" class="reason-link-btn link-post">
                    ดูโพสต์ต้นทาง
                  </NuxtLink>
                  <NuxtLink v-if="r.target_type === 'comment' && r.comment_post_id" :to="'/post/' + r.comment_post_id" target="_blank" class="reason-link-btn link-comment">
                    ดูโพสต์
                  </NuxtLink>
                </div>
              </div>
            </td>
            <td style="text-align: center;">
              <div class="nexus-badge" :class="r.status === 'resolved' ? 'badge-success' : (r.status === 'reviewed' ? 'badge-info' : 'badge-warning')">
                <div class="glow-dot" v-if="r.status !== 'resolved'"></div>
                {{ r.status === 'resolved' ? 'ตรวจสอบแล้ว' : (r.status === 'reviewed' ? 'กำลังดำเนินการ' : 'รอตรวจสอบ') }}
              </div>
            </td>
            <td class="actions-cell">
              <div class="report-actions-col">
                <button 
                  v-if="r.status !== 'resolved'"
                  @click="openModal('resolve', r)" 
                  class="nexus-btn btn-success"
                >
                  จัดการแล้ว
                </button>
                <button 
                  v-if="r.target_type === 'post' && r.reported_post_id && r.post_content && r.post_content !== '(โพสต์ถูกลบไปแล้ว)' && r.post_content !== '(แอดมินลบโพสต์แล้ว)'"
                  @click="openModal('delete_content', r)" 
                  class="nexus-btn btn-danger"
                  title="ลบโพสต์ที่มีปัญหาและปิดเคสการรายงาน"
                >
                  ลบโพสต์
                </button>
                <button 
                  v-if="r.target_type === 'comment' && r.reported_comment_id && r.comment_content && r.comment_content !== '(คอมเมนต์ถูกลบไปแล้ว)' && r.comment_content !== '(แอดมินลบคอมเมนต์แล้ว)'"
                  @click="openModal('delete_content', r)" 
                  class="nexus-btn btn-danger"
                  title="ลบคอมเมนต์ที่มีปัญหาและปิดเคสการรายงาน"
                >
                  ลบคอมเมนต์
                </button>
                <button 
                  v-if="['user', 'post', 'comment'].includes(r.target_type) && !r.reported_is_banned"
                  @click="openModal('ban', { id: r.reported_user_id, username: r.reported_username, is_banned: 0 })" 
                  class="nexus-btn btn-danger"
                >
                  แบนบัญชี
                </button>
                <button 
                  v-if="r.target_type === 'community' && !r.reported_community_is_suspended"
                  @click="openModal('suspend_community', { id: r.reported_community_id, name: r.reported_community_name })" 
                  class="nexus-btn btn-warning"
                >
                  ระงับกลุ่ม
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Communities Tab -->
    <div v-else-if="activeTab === 'communities'" class="nexus-panel fade-in">
      <div class="card-header">
        <div class="header-icon brand">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
        </div>
        <h2>จัดการชุมชนทั้งหมด</h2>
      </div>

      <!-- Toolbar: Search & Filters -->
      <div class="admin-search-toolbar">
        <div class="search-input-wrap">
          <svg class="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input 
            v-model="searchCommunities" 
            type="text" 
            placeholder="ค้นหาชื่อชุมชน, slug, เจ้าของกลุ่ม..." 
            class="admin-search-input"
          />
          <button v-if="searchCommunities" @click="searchCommunities = ''" class="btn-clear-search" title="ล้างการค้นหา">✕</button>
        </div>

        <div class="filter-controls-group">
          <!-- Status Filter -->
          <div class="filter-select-box">
            <span class="filter-label">สถานะ:</span>
            <select v-model="filterCommunityStatus" class="admin-filter-select">
              <option value="all">ทั้งหมด</option>
              <option value="normal">ปกติ</option>
              <option value="suspended">ถูกระงับ</option>
            </select>
          </div>

          <div class="result-count-badge">
            {{ filteredCommunities.length }} รายการ
          </div>
        </div>
      </div>
      
      <table class="nexus-table">
        <thead>
          <tr>
            <th>ชื่อชุมชน</th>
            <th>เจ้าของ/ผู้ดูแลหลัก</th>
            <th>สมาชิก</th>
            <th>สถานะ</th>
            <th class="actions-cell">จัดการ</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="filteredCommunities.length === 0">
            <td colspan="5" class="empty-state" style="text-align: center; padding: 40px 20px; color: var(--text-muted);">
              <div style="display: flex; flex-direction: column; align-items: center; gap: 8px;">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="opacity: 0.5;">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
                <span>{{ searchCommunities || filterCommunityStatus !== 'all' ? 'ไม่พบชุมชนที่ตรงกับเงื่อนไขการค้นหา' : 'ยังไม่มีชุมชนที่ถูกสร้างในระบบ' }}</span>
                <button v-if="searchCommunities || filterCommunityStatus !== 'all'" @click="searchCommunities = ''; filterCommunityStatus = 'all'" class="nexus-btn btn-outline" style="margin-top: 6px; padding: 4px 12px; font-size: 12px;">
                  ล้างตัวกรอง
                </button>
              </div>
            </td>
          </tr>
          <tr v-for="c in filteredCommunities" :key="c.id" class="nexus-row">
            <td>
              <div style="font-weight: 600;">{{ c.name }}</div>
              <div class="text-sm text-muted">/community/{{ c.slug }}</div>
            </td>
            <td>
              <div style="font-weight: 500;">{{ c.owner_name || 'N/A' }}</div>
              <div class="text-sm text-muted">@{{ c.owner_username || 'n/a' }}</div>
            </td>
            <td>
              <div class="nexus-badge badge-info">{{ c.member_count }} คน</div>
            </td>
            <td>
              <div class="nexus-badge" :class="c.is_suspended ? 'badge-danger' : 'badge-success'">
                <div class="glow-dot" v-if="!c.is_suspended"></div>
                {{ c.is_suspended ? 'ถูกระงับ' : 'ปกติ' }}
              </div>
            </td>
            <td class="actions-cell">
              <div class="actions-wrapper">
                <NuxtLink 
                  :to="'/community/' + c.slug" 
                  target="_blank"
                  class="nexus-btn btn-outline"
                  style="display: inline-flex; align-items: center; gap: 4px; text-decoration: none;"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                  ดูชุมชน
                </NuxtLink>
                <button 
                  v-if="!c.is_suspended"
                  @click="openModal('suspend_community', c)" 
                  class="nexus-btn btn-warning"
                  style="display: inline-flex; align-items: center; gap: 4px;"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                  ระงับชุมชน
                </button>
                <button 
                  v-else
                  @click="openModal('unsuspend_community', c)" 
                  class="nexus-btn btn-success"
                  style="display: inline-flex; align-items: center; gap: 4px;"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                  ปลดระงับ
                </button>
                <button 
                  @click="openModal('delete_community', c)" 
                  class="nexus-btn btn-danger"
                  style="display: inline-flex; align-items: center; gap: 4px;"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                  ลบชุมชน
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Logs Tab (Read-only System Logs) -->
    <div v-else-if="activeTab === 'logs'" class="nexus-panel logs-panel fade-in">
      <div class="card-header logs-header">
        <div class="header-icon warning">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
        </div>
        <div>
          <h2>System Logs (บันทึกการทำงานของระบบ)</h2>
          <p class="logs-header-sub">ตรวจสอบประวัติการจัดการ บันทึกความปลอดภัย และการกระทำของแอดมิน</p>
        </div>
      </div>

      <!-- Toolbar: Search & Filters (Fixed at top) -->
      <div class="admin-search-toolbar logs-toolbar">
        <div class="search-input-wrap">
          <svg class="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input 
            v-model="searchLogs" 
            type="text" 
            placeholder="ค้นหาข้อความ, แอดมิน, ผู้ถูกกระทำ @username, วันที่..." 
            class="admin-search-input"
          />
          <button v-if="searchLogs" @click="searchLogs = ''" class="btn-clear-search" title="ล้างการค้นหา">✕</button>
        </div>

        <div class="filter-controls-group">
          <!-- Date Filter Dropdown -->
          <div class="filter-select-box">
            <span class="filter-label">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="filter-icon-svg">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
              ช่วงเวลา:
            </span>
            <select v-model="filterLogDateRange" class="admin-filter-select">
              <option value="all">ทั้งหมด</option>
              <option value="today">วันนี้</option>
              <option value="yesterday">เมื่อวาน</option>
              <option value="7days">7 วันล่าสุด</option>
              <option value="30days">30 วันล่าสุด</option>
              <option value="custom">กำหนดวันเอง...</option>
            </select>
          </div>

          <!-- Custom Date Range Picker (shown when custom is selected) -->
          <div v-if="filterLogDateRange === 'custom'" class="custom-date-picker-box">
            <input 
              v-model="filterLogStartDate" 
              type="date" 
              class="admin-date-input" 
              title="ตั้งแต่วันที่" 
            />
            <span class="date-sep">ถึง</span>
            <input 
              v-model="filterLogEndDate" 
              type="date" 
              class="admin-date-input" 
              title="ถึงวันที่" 
            />
          </div>

          <!-- Action Filter -->
          <div class="filter-select-box">
            <span class="filter-label">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="filter-icon-svg">
                <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
              </svg>
              การกระทำ:
            </span>
            <select v-model="filterLogAction" class="admin-filter-select">
              <option value="all">ทั้งหมด</option>
              <option v-for="act in availableLogActions" :key="act.key" :value="act.key">{{ act.label }}</option>
            </select>
          </div>

          <!-- Clear All Filters Button (if active) -->
          <button 
            v-if="filterLogAction !== 'all' || filterLogDateRange !== 'all' || filterLogStartDate || filterLogEndDate || searchLogs" 
            @click="clearLogFilters" 
            class="btn-reset-filters" 
            title="ล้างตัวกรองทั้งหมด"
          >
            ✕ ล้างตัวกรอง
          </button>

          <div class="result-count-badge">
            {{ filteredLogs.length }} รายการ
          </div>
        </div>
      </div>
      
      <!-- Scrollable Table Body Container (Only table rows scroll) -->
      <div class="table-container logs-table-container">
        <table class="nexus-table logs-table">
          <thead>
            <tr>
              <th style="width: 80px;">ID</th>
              <th style="width: 140px;">แอดมิน</th>
              <th style="width: 160px;">การกระทำ</th>
              <th style="min-width: 190px;">เป้าหมาย</th>
              <th style="min-width: 280px;">รายละเอียด</th>
              <th style="width: 150px;">วันเวลา</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="filteredLogs.length === 0">
              <td colspan="6" class="empty-state" style="text-align: center; padding: 60px 20px; color: var(--text-muted);">
                <div style="display: flex; flex-direction: column; align-items: center; gap: 10px;">
                  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="opacity: 0.4;">
                    <circle cx="11" cy="11" r="8"/>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                  </svg>
                  <span style="font-size: 14px; font-weight: 500;">{{ searchLogs || filterLogAction !== 'all' || filterLogDateRange !== 'all' ? 'ไม่พบบันทึกการทำงานที่ตรงกับเงื่อนไขที่เลือก' : 'ไม่มีบันทึกข้อมูลในระบบ' }}</span>
                  <button v-if="searchLogs || filterLogAction !== 'all' || filterLogDateRange !== 'all'" @click="clearLogFilters" class="nexus-btn btn-outline" style="margin-top: 6px; padding: 6px 16px; font-size: 12.5px;">
                    ล้างตัวกรองทั้งหมด
                  </button>
                </div>
              </td>
            </tr>
            <tr v-for="log in filteredLogs" :key="log.id" :class="{ 'is-new-log': isNewLog(log) }">
              <td>
                <div style="display: flex; align-items: center; gap: 4px;">
                  <span class="log-id-pill">#{{ log.id }}</span>
                  <span v-if="isNewLog(log)" class="badge-new-glow purple">ใหม่</span>
                </div>
              </td>
              <td>
                <div style="display: flex; align-items: center; gap: 8px;">
                  <div class="admin-shield-badge" title="ผู้ดูแลระบบ">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                    </svg>
                  </div>
                  <span style="font-weight: 700; color: var(--text-primary); font-size: 13.5px;">{{ log.admin_name || log.admin_username }}</span>
                </div>
              </td>
              <td>
                <span class="status-badge" :class="getActionBadgeClass(log.action)">
                  <span class="badge-dot"></span>
                  {{ formatLogAction(log.action) }}
                </span>
              </td>
              <td>
                <!-- User Target -->
                <div v-if="log.target_type === 'user'" style="display: flex; align-items: center; gap: 10px;">
                  <div v-if="log.target_avatar_url" style="width: 28px; height: 28px; flex-shrink: 0;">
                    <img :src="log.target_avatar_url" alt="avatar" style="width: 28px; height: 28px; border-radius: 50%; object-fit: cover; border: 1.5px solid var(--border-primary);" />
                  </div>
                  <div v-else class="target-icon-box user">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                      <circle cx="12" cy="7" r="4"/>
                    </svg>
                  </div>
                  <div style="display: flex; flex-direction: column; line-height: 1.3;">
                    <NuxtLink v-if="log.target_username" :to="`/profile/${log.target_username}`" style="font-weight: 700; color: var(--text-primary); text-decoration: none; font-size: 13.5px;" class="admin-user-link">
                      {{ log.target_display_name || log.target_username }}
                    </NuxtLink>
                    <span v-else style="font-weight: 700; color: var(--text-primary); font-size: 13.5px;">
                      ผู้ใช้ #{{ log.target_id }}
                    </span>
                    <span v-if="log.target_username" style="font-size: 11.5px; color: var(--text-muted);">
                      @{{ log.target_username }}
                    </span>
                  </div>
                </div>

                <!-- Community Target -->
                <div v-else-if="log.target_type === 'community'" style="display: flex; align-items: center; gap: 10px;">
                  <div class="target-icon-box community">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                      <circle cx="9" cy="7" r="4"/>
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                    </svg>
                  </div>
                  <div style="display: flex; flex-direction: column; line-height: 1.3;">
                    <NuxtLink v-if="log.target_community_slug" :to="`/community/${log.target_community_slug}`" style="font-weight: 700; color: #f59e0b; text-decoration: none; font-size: 13.5px;" class="admin-user-link">
                      {{ log.target_community_name || ('ชุมชน #' + log.target_id) }}
                    </NuxtLink>
                    <span v-else style="font-weight: 700; color: #f59e0b; font-size: 13.5px;">
                      {{ log.target_community_name || ('ชุมชน #' + log.target_id) }}
                    </span>
                    <span v-if="log.target_community_slug" style="font-size: 11.5px; color: var(--text-muted);">
                      c/{{ log.target_community_slug }}
                    </span>
                  </div>
                </div>

                <!-- Post Target -->
                <div v-else-if="log.target_type === 'post'" style="display: flex; align-items: center; gap: 8px;">
                  <div class="target-icon-box post">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                      <polyline points="14 2 14 8 20 8"/>
                      <line x1="16" y1="13" x2="8" y2="13"/>
                      <line x1="16" y1="17" x2="8" y2="17"/>
                    </svg>
                  </div>
                  <NuxtLink :to="`/post/${log.target_id}`" style="font-weight: 600; color: #3b82f6; text-decoration: none; font-size: 13px;" class="admin-user-link">
                    โพสต์ #{{ log.target_id }}
                  </NuxtLink>
                </div>

                <!-- Comment Target -->
                <div v-else-if="log.target_type === 'comment'" style="display: flex; align-items: center; gap: 8px;">
                  <div class="target-icon-box comment">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                    </svg>
                  </div>
                  <span style="font-weight: 600; color: var(--text-secondary); font-size: 13px;">
                    คอมเมนต์ #{{ log.target_id }}
                  </span>
                </div>

                <!-- Report Target -->
                <div v-else-if="log.target_type === 'report'" style="display: flex; align-items: center; gap: 8px;">
                  <div class="target-icon-box warning">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                      <line x1="12" y1="9" x2="12" y2="13"/>
                      <line x1="12" y1="17" x2="12.01" y2="17"/>
                    </svg>
                  </div>
                  <span style="font-weight: 600; color: #f59e0b; font-size: 13px;">
                    รายงาน #{{ log.target_id }}
                  </span>
                </div>

                <!-- Fallback / Other -->
                <div v-else style="display: flex; align-items: center; gap: 8px;">
                  <div class="target-icon-box generic">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <circle cx="12" cy="12" r="10"/>
                      <line x1="12" y1="16" x2="12" y2="12"/>
                      <line x1="12" y1="8" x2="12.01" y2="8"/>
                    </svg>
                  </div>
                  <span style="font-weight: 600; color: var(--text-muted); font-size: 12.5px;">
                    {{ log.target_type }} #{{ log.target_id }}
                  </span>
                </div>
              </td>
              <td style="max-width: 320px; white-space: normal; line-height: 1.5; color: var(--text-primary); font-size: 13px;">
                {{ log.details }}
              </td>
              <td class="log-date-cell">
                <div class="log-date-primary">{{ formatLogDate(log.created_at) }}</div>
                <div class="log-time-secondary">{{ formatLogTime(log.created_at) }}</div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Custom Confirmation Modal -->
    <Teleport to="body">
      <Transition name="modal-fade">
        <div v-if="modal.show" class="nexus-modal-overlay" @click.self="closeModal">
          <div class="nexus-modal" :class="`theme-${modal.type || 'brand'}`">
            <!-- Top Gradient Accent Glow Line -->
            <div class="modal-top-accent-line" :class="modal.type"></div>

            <!-- Icon Ring with Glowing Aura -->
            <div class="modal-icon-container" :class="modal.type">
              <div class="modal-icon-inner-box">
                <svg v-if="modal.type === 'danger'" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                  <line x1="12" y1="9" x2="12" y2="13"/>
                  <line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
                <svg v-else-if="modal.type === 'warning'" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="12"/>
                  <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                <svg v-else-if="modal.type === 'success'" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M9 12l2 2 4-4"/>
                </svg>
              </div>
            </div>

            <h2 class="modal-title-heading">{{ modal.title }}</h2>
            <p class="modal-body-desc">{{ modal.message }}</p>
            
            <div v-if="(modal.actionType === 'ban' && !modal.targetData?.is_banned) || modal.actionType === 'suspend_community'" class="modal-form-block">
              <label class="modal-input-label">ระยะเวลาการระงับ</label>
              <select v-model="modal.banDuration" class="modal-custom-select">
                <option value="24h">ระงับ 24 ชั่วโมง</option>
                <option value="3d">ระงับ 3 วัน</option>
                <option value="7d">ระงับ 7 วัน</option>
                <option value="30d">ระงับ 30 วัน</option>
                <option value="permanent">แบนถาวร</option>
              </select>

              <label class="modal-input-label">เหตุผลการระงับ (แสดงให้ผู้ใช้เห็น)</label>
              <textarea v-model="modal.banReason" rows="3" placeholder="ระบุเหตุผลที่ระงับ เช่น ละเมิดข้อกำหนด..." class="modal-custom-textarea"></textarea>
            </div>

            <div class="modal-actions-container">
              <button class="modal-btn-dismiss" @click="closeModal">
                ยกเลิก
              </button>
              <button 
                class="modal-btn-action" 
                :class="`btn-action-${modal.type || 'brand'}`" 
                @click="confirmModal" 
                :disabled="((modal.actionType === 'ban' && !modal.targetData?.is_banned) || modal.actionType === 'suspend_community') && !modal.banReason.trim()"
              >
                {{ modal.confirmText }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, reactive, computed, watch } from 'vue'

useHead({ title: 'Admin — ConnecXus' })
definePageMeta({ layout: 'default', middleware: ['auth'] })

const { user } = useAuth()
const { init, publish, joinRoom, leaveRoom, subscribe } = useRealtime()
const { onlineCount, initPresence } = usePresence()
const { setBannedUsers, setUnresolvedReports, setUnreadLogs, incrementBanned, incrementReports, decrementBanned, decrementReports } = useAdminBadge()
const activeTab = ref('dashboard')

const stats = ref<any>(null)
const users = ref<any[]>([])
const reports = ref<any[]>([])
const communitiesList = ref<any[]>([])
const logsList = ref<any[]>([])
const loading = ref(true)

const lastSeenLogs = ref(0)
const lastSeenBanned = ref(0)
const lastSeenReports = ref(0)

function isNewBanned(u: any) {
  if (!u || !u.is_banned) return false
  if (u.is_new) return true
  const t = u.banned_at ? new Date(u.banned_at).getTime() : new Date(u.updated_at || u.created_at).getTime()
  return t > lastSeenBanned.value
}

function isNewReport(r: any) {
  if (!r || r.status !== 'pending') return false
  if (r.is_new) return true
  const t = r.created_at ? new Date(r.created_at).getTime() : 0
  return t > lastSeenReports.value
}

function isNewLog(log: any) {
  if (!log) return false
  if (log.is_new) return true
  const t = log.created_at ? new Date(log.created_at).getTime() : 0
  return t > lastSeenLogs.value
}

const unreadBannedCount = computed(() => {
  const count = (users.value || []).filter((u: any) => u.is_banned).length
  return count || Number(stats.value?.bannedUsers) || 0
})

const unreadReportsCount = computed(() => {
  const count = (reports.value || []).filter((r: any) => r.status === 'pending').length
  return count || Number(stats.value?.unresolvedReports) || 0
})

const unreadLogsCount = computed(() => {
  return (logsList.value || []).filter((log: any) => isNewLog(log)).length
})

function markTabAsSeen(tab: string) {
  if (!process.client) return
  const now = Date.now()
  if (tab === 'banned') {
    lastSeenBanned.value = now
    localStorage.setItem('admin_last_seen_banned', now.toString())
    setBannedUsers(0)
    if (users.value) {
      users.value.forEach((u: any) => { if (u.is_banned) u.is_new = false })
    }
  } else if (tab === 'reports') {
    lastSeenReports.value = now
    localStorage.setItem('admin_last_seen_reports', now.toString())
    setUnresolvedReports(0)
    if (reports.value) {
      reports.value.forEach((r: any) => { r.is_new = false })
    }
  } else if (tab === 'logs') {
    lastSeenLogs.value = now
    localStorage.setItem('admin_last_seen_logs', now.toString())
    setUnreadLogs(0)
    if (logsList.value) {
      logsList.value.forEach((l: any) => { l.is_new = false })
    }
  }
}

watch(activeTab, (newVal) => {
  nextTick(() => {
    const vp = document.querySelector('.app-main-viewport')
    if (vp) vp.scrollTop = 0
  })
  markTabAsSeen(newVal)
  fetchAllData(true)
})

// ── Search & Filter State Variables ──
const searchUsers = ref('')
const filterUserRole = ref('all')

const searchBannedUsers = ref('')
const bannedUsersCount = computed(() => (users.value || []).filter((u: any) => u.is_banned).length)

const searchCommunities = ref('')
const filterCommunityStatus = ref('all')
const suspendedCommunitiesCount = computed(() => (communitiesList.value || []).filter((c: any) => c.is_suspended).length)

const searchReports = ref('')
const filterReportStatus = ref('all')
const filterReportTarget = ref('all')
const pendingReportsCount = computed(() => (reports.value || []).filter((r: any) => r.status === 'pending').length)

const searchLogs = ref('')
const filterLogAction = ref('all')
const filterLogDateRange = ref('all')
const filterLogStartDate = ref('')
const filterLogEndDate = ref('')

function clearLogFilters() {
  searchLogs.value = ''
  filterLogAction.value = 'all'
  filterLogDateRange.value = 'all'
  filterLogStartDate.value = ''
  filterLogEndDate.value = ''
}

// ── Thai Action Labels & Log Formatters ──
const ACTION_LABELS_TH: Record<string, { label: string; type: string }> = {
  ban_user: { label: 'ระงับบัญชีผู้ใช้', type: 'danger' },
  unban_user: { label: 'ปลดระงับบัญชี', type: 'success' },
  delete_user: { label: 'ลบบัญชีผู้ใช้', type: 'danger' },
  change_role: { label: 'เปลี่ยนยศผู้ใช้', type: 'brand' },
  delete_post: { label: 'ลบโพสต์', type: 'danger' },
  delete_comment: { label: 'ลบคอมเมนต์', type: 'danger' },
  suspend_community: { label: 'ระงับชุมชน', type: 'warning' },
  unsuspend_community: { label: 'ปลดระงับชุมชน', type: 'success' },
  delete_community: { label: 'ลบชุมชนถาวร', type: 'danger' },
  resolve_report: { label: 'ปิดเคสการรายงาน', type: 'success' },
  dismiss_report: { label: 'ยกเลิกการรายงาน', type: 'info' },
  update_report: { label: 'อัปเดตสถานะรายงาน', type: 'info' },
  auto_unban: { label: 'ปลดระงับอัตโนมัติ', type: 'success' },
  auto_unsuspend: { label: 'ปลดระงับอัตโนมัติ', type: 'success' },
  update_settings: { label: 'แก้ไขการตั้งค่า', type: 'info' }
}

function formatLogAction(action: string) {
  if (!action) return '-'
  return ACTION_LABELS_TH[action]?.label || action
}

function getActionBadgeClass(action: string) {
  if (!action) return 'info'
  const found = ACTION_LABELS_TH[action]
  if (found) return found.type
  if (action.includes('delete') || action.includes('ban')) return 'danger'
  if (action.includes('unban') || action.includes('resolve') || action.includes('unsuspend')) return 'success'
  if (action.includes('suspend') || action.includes('warn')) return 'warning'
  if (action.includes('role')) return 'brand'
  return 'info'
}

function formatLogDate(dateStr: string | null | undefined) {
  if (!dateStr) return '-'
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return '-'
  return d.toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: 'Asia/Bangkok'
  })
}

function formatLogTime(dateStr: string | null | undefined) {
  if (!dateStr) return '-'
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return '-'
  return d.toLocaleTimeString('th-TH', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
    timeZone: 'Asia/Bangkok'
  }) + ' น.'
}

// ── Filtered Computed Lists ──
const filteredUsers = computed(() => {
  const q = searchUsers.value.trim().toLowerCase()
  return (users.value || []).filter((u: any) => {
    // แยกคนที่ถูกระงับ (is_banned) ออกไปห้อง "บัญชีที่ถูกระงับ" โดยเฉพาะ ไม่แสดงในห้องจัดการผู้ใช้
    if (u.is_banned) return false
    if (filterUserRole.value !== 'all' && u.role !== filterUserRole.value) return false
    if (!q) return true
    const username = (u.username || '').toLowerCase()
    const name = (u.display_name || '').toLowerCase()
    const email = (u.email || '').toLowerCase()
    return username.includes(q) || name.includes(q) || email.includes(q)
  })
})

const filteredBannedUsers = computed(() => {
  const q = searchBannedUsers.value.trim().toLowerCase()
  return (users.value || []).filter((u: any) => {
    if (!u.is_banned) return false
    if (!q) return true
    const username = (u.username || '').toLowerCase()
    const name = (u.display_name || '').toLowerCase()
    const email = (u.email || '').toLowerCase()
    return username.includes(q) || name.includes(q) || email.includes(q)
  })
})

const filteredCommunities = computed(() => {
  const q = searchCommunities.value.trim().toLowerCase()
  return (communitiesList.value || []).filter((c: any) => {
    if (filterCommunityStatus.value === 'suspended' && !c.is_suspended) return false
    if (filterCommunityStatus.value === 'normal' && c.is_suspended) return false
    if (!q) return true
    const name = (c.name || '').toLowerCase()
    const slug = (c.slug || '').toLowerCase()
    const desc = (c.description || '').toLowerCase()
    const ownerName = (c.owner_name || '').toLowerCase()
    const ownerUsername = (c.owner_username || '').toLowerCase()
    return name.includes(q) || slug.includes(q) || desc.includes(q) || ownerName.includes(q) || ownerUsername.includes(q)
  })
})

const filteredReports = computed(() => {
  const q = searchReports.value.trim().toLowerCase()
  return (reports.value || []).filter((r: any) => {
    if (filterReportStatus.value !== 'all' && r.status !== filterReportStatus.value) return false
    if (filterReportTarget.value !== 'all' && r.target_type !== filterReportTarget.value) return false
    if (!q) return true
    const reason = (r.reason || '').toLowerCase()
    const reporter = (r.reporter_username || '').toLowerCase()
    const reported = (r.reported_username || '').toLowerCase()
    const commName = (r.reported_community_name || '').toLowerCase()
    const postCtx = (r.post_content || '').toLowerCase()
    const commentCtx = (r.comment_content || '').toLowerCase()
    const msgCtx = (r.message_content || '').toLowerCase()
    return reason.includes(q) || reporter.includes(q) || reported.includes(q) || commName.includes(q) || postCtx.includes(q) || commentCtx.includes(q) || msgCtx.includes(q)
  })
})

const filteredLogs = computed(() => {
  const q = searchLogs.value.trim().toLowerCase()
  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
  const todayEnd = todayStart + 24 * 60 * 60 * 1000 - 1
  const yesterdayStart = todayStart - 24 * 60 * 60 * 1000
  const yesterdayEnd = todayStart - 1
  const sevenDaysAgo = todayStart - 6 * 24 * 60 * 60 * 1000
  const thirtyDaysAgo = todayStart - 29 * 24 * 60 * 60 * 1000

  return (logsList.value || []).filter((log: any) => {
    // 1. Action Filter
    if (filterLogAction.value !== 'all' && log.action !== filterLogAction.value) return false

    // 2. Date Range Filter
    const logTime = new Date(log.created_at).getTime()
    if (filterLogDateRange.value === 'today') {
      if (logTime < todayStart || logTime > todayEnd) return false
    } else if (filterLogDateRange.value === 'yesterday') {
      if (logTime < yesterdayStart || logTime > yesterdayEnd) return false
    } else if (filterLogDateRange.value === '7days') {
      if (logTime < sevenDaysAgo) return false
    } else if (filterLogDateRange.value === '30days') {
      if (logTime < thirtyDaysAgo) return false
    } else if (filterLogDateRange.value === 'custom') {
      if (filterLogStartDate.value) {
        const start = new Date(filterLogStartDate.value + 'T00:00:00').getTime()
        if (logTime < start) return false
      }
      if (filterLogEndDate.value) {
        const end = new Date(filterLogEndDate.value + 'T23:59:59').getTime()
        if (logTime > end) return false
      }
    }

    // 3. Search Query Match
    if (!q) return true
    const admin = (log.admin_name || log.admin_username || '').toLowerCase()
    const action = (log.action || '').toLowerCase()
    const actionTh = formatLogAction(log.action).toLowerCase()
    const details = (log.details || '').toLowerCase()
    const targetType = (log.target_type || '').toLowerCase()
    const targetUser = (log.target_username || log.target_display_name || '').toLowerCase()
    const targetComm = (log.target_community_name || log.target_community_slug || '').toLowerCase()
    const id = String(log.id || '')
    const targetId = String(log.target_id || '')
    const thaiDate = new Date(log.created_at).toLocaleString('th-TH').toLowerCase()
    const isoDate = String(log.created_at || '').toLowerCase()

    return admin.includes(q) || 
           action.includes(q) || 
           actionTh.includes(q) || 
           details.includes(q) || 
           targetType.includes(q) || 
           targetUser.includes(q) || 
           targetComm.includes(q) || 
           id.includes(q) || 
           targetId.includes(q) || 
           thaiDate.includes(q) || 
           isoDate.includes(q)
  })
})

// Unique actions for log filter dropdown
const availableLogActions = computed(() => {
  const set = new Set<string>()
  for (const l of logsList.value || []) {
    if (l.action) set.add(l.action)
  }
  return Array.from(set).map(action => ({
    key: action,
    label: formatLogAction(action)
  }))
})

// Modal State
const modal = reactive({
  show: false,
  type: 'brand', // brand, warning, danger, success
  title: '',
  message: '',
  confirmText: 'ยืนยัน',
  actionType: '',
  targetData: null as any,
  banDuration: '24h',
  banReason: ''
})

let unsub: (() => void) | null = null

onMounted(async () => {
  if (process.client) {
    lastSeenLogs.value = Number(localStorage.getItem('admin_last_seen_logs') || 0)
    lastSeenBanned.value = Number(localStorage.getItem('admin_last_seen_banned') || 0)
    lastSeenReports.value = Number(localStorage.getItem('admin_last_seen_reports') || 0)
    markTabAsSeen(activeTab.value)
  }

  if (user.value?.role !== 'admin') {
    navigateTo('/') // Redirect non-admins
    return
  }

  // 1. Initialize Realtime WebSocket Connection & Join Admin Room
  init()
  joinRoom('admin-channel')
  joinRoom('global')
  initPresence()

  // 2. Initial Data Load
  await fetchAllData(false)
  
  // 3. Realtime Event Listener
  unsub = subscribe((event) => {
    if (event.type === 'online_count_updated') {
      if (stats.value) stats.value = { ...stats.value, onlineCount: event.payload.count }
    }
    if (event.type === 'user_online') {
      if (stats.value) stats.value = { ...stats.value, onlineCount: (stats.value.onlineCount || 0) + 1 }
    }
    if (event.type === 'user_offline') {
      if (stats.value && stats.value.onlineCount > 0) stats.value = { ...stats.value, onlineCount: stats.value.onlineCount - 1 }
    }
    if (event.type === 'new_report' && event.payload?.report) {
      const rep = { ...event.payload.report, is_new: true }
      if (reports.value && Array.isArray(reports.value)) {
        reports.value = [rep, ...reports.value]
      }
      if (stats.value) {
        stats.value = { ...stats.value, unresolvedReports: (stats.value.unresolvedReports || 0) + 1 }
      }
      if (activeTab.value !== 'reports') {
        incrementReports(1)
      }
    }
    if (event.type === 'report_resolved' && event.payload?.report_id) {
      if (reports.value && Array.isArray(reports.value)) {
        const report = reports.value.find(r => r.id === event.payload.report_id)
        if (report) {
          report.status = 'resolved'
          report.resolved_at = new Date().toISOString()
          report.is_new = false
        }
      }
      decrementReports(1)
    }
    if (event.type === 'user_banned' && event.payload?.user_id) {
      if (users.value && Array.isArray(users.value)) {
        const u = users.value.find(u => u.id === event.payload.user_id)
        if (u) {
          u.is_banned = 1
          u.banned_at = new Date().toISOString()
          u.is_new = true
        }
      }
      if (activeTab.value !== 'banned') {
        incrementBanned(1)
      }
    }
    if (event.type === 'user_unbanned' && event.payload?.user_id) {
      if (users.value && Array.isArray(users.value)) {
        const u = users.value.find(u => u.id === event.payload.user_id)
        if (u) {
          u.is_banned = 0
          u.is_new = false
        }
      }
      decrementBanned(1)
    }
    if (event.type === 'admin_log_created' && event.payload?.log) {
      const lg = { ...event.payload.log, is_new: true }
      if (logsList.value && Array.isArray(logsList.value)) {
        logsList.value = [lg, ...logsList.value]
      }
    }
    // Refresh all admin data silently on relevant realtime updates
    if ([
      'admin_stats_updated',
      'admin_user_updated',
      'admin_community_updated',
      'admin_log_created',
      'user_registered',
      'username_changed',
      'community_created',
      'community_deleted'
    ].includes(event.type)) {
      fetchAllData(true)
    }
  })

  // 4. Background Realtime Auto-Poller (Every 3 seconds without screen flashing)
  syncTimer = setInterval(() => {
    if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
      fetchAllData(true)
    }
  }, 3000)

  // 5. Sync on Tab/Window Focus
  if (typeof window !== 'undefined') {
    window.addEventListener('focus', onWindowFocus)
  }
})

let syncTimer: any = null
function onWindowFocus() {
  fetchAllData(true)
}

onUnmounted(() => {
  if (syncTimer) clearInterval(syncTimer)
  if (typeof window !== 'undefined') {
    window.removeEventListener('focus', onWindowFocus)
  }
  if (unsub) unsub()
  leaveRoom('admin-channel')
  leaveRoom('global')
})

async function fetchAllData(silent = false) {
  if (!silent) loading.value = true
  try {
    const [resStats, resUsers, resReports, resCommunities, resLogs] = await Promise.allSettled([
      $fetch('/api/admin/stats'),
      $fetch('/api/admin/users'),
      $fetch('/api/admin/reports'),
      $fetch('/api/admin/communities'),
      $fetch('/api/admin/logs')
    ])
    
    if (resStats.status === 'fulfilled') stats.value = resStats.value as any
    if (resUsers.status === 'fulfilled') users.value = (resUsers.value as any)?.users || []
    if (resReports.status === 'fulfilled') reports.value = (resReports.value as any)?.reports || []
    if (resCommunities.status === 'fulfilled') communitiesList.value = (resCommunities.value as any)?.communities || []
    if (resLogs.status === 'fulfilled') logsList.value = (resLogs.value as any) || []
  } catch(e) {
    console.error(e)
  } finally {
    if (!silent) loading.value = false
  }
}

// ── Modal Actions ──
function openModal(action: string, data: any) {
  modal.actionType = action
  modal.targetData = data
  
  if (action === 'role') {
    const newRole = data.role === 'admin' ? 'user' : 'admin'
    modal.type = 'brand'
    modal.title = 'เปลี่ยนยศผู้ใช้'
    modal.message = `คุณแน่ใจหรือไม่ที่จะเปลี่ยนยศ @${data.username} เป็น ${newRole}?`
    modal.confirmText = 'ยืนยันการเปลี่ยน'
  } 
  else if (action === 'ban') {
    modal.type = data.is_banned ? 'success' : 'warning'
    modal.title = data.is_banned ? 'ปลดระงับบัญชี' : 'ระงับบัญชีผู้ใช้'
    modal.message = data.is_banned 
      ? `ต้องการปลดแบนและคืนสิทธิ์ให้ @${data.username} ใช่หรือไม่?` 
      : `หากระงับบัญชี @${data.username} จะถูกเตะออกจากระบบทันที ยืนยันหรือไม่?`
    modal.confirmText = data.is_banned ? 'ปลดแบน' : 'แบนทันที'
  }
  else if (action === 'delete') {
    modal.type = 'danger'
    modal.title = 'ลบบัญชีถาวร'
    modal.message = `การลบ @${data.username} จะไม่สามารถย้อนกลับได้ ข้อมูลทั้งหมดจะหายไป คุณแน่ใจหรือไม่?`
    modal.confirmText = 'ลบทิ้งถาวร'
  }
  else if (action === 'resolve') {
    modal.type = 'success'
    modal.title = 'ปิดเคสการรายงาน'
    modal.message = `ยืนยันทำเครื่องหมายว่าจัดการปัญหาการรายงานนี้เรียบร้อยแล้ว?`
    modal.confirmText = 'ยืนยัน'
  }
  else if (action === 'delete_content') {
    modal.type = 'danger'
    modal.title = `ลบ${data.target_type === 'post' ? 'โพสต์' : 'คอมเมนต์'}`
    modal.message = 'คุณต้องการลบเนื้อหานี้และปิดเคสการรายงานไปพร้อมกันหรือไม่?'
    modal.confirmText = 'ลบเนื้อหา'
  }
  else if (action === 'suspend_community') {
    modal.type = 'warning'
    modal.title = 'ระงับชุมชน'
    modal.message = `ยืนยันที่จะระงับชุมชน "${data.name}" ใช่หรือไม่? ผู้คนจะไม่สามารถเข้าถึงได้จนกว่าจะปลดระงับ`
    modal.confirmText = 'ระงับชุมชน'
  }
  else if (action === 'unsuspend_community') {
    modal.type = 'success'
    modal.title = 'ปลดระงับชุมชน'
    modal.message = `ยืนยันที่จะปลดระงับชุมชน "${data.name}" เพื่อให้ผู้ใช้กลับมาใช้งานได้ตามปกติ?`
    modal.confirmText = 'ปลดระงับ'
  }
  else if (action === 'delete_community') {
    modal.type = 'danger'
    modal.title = 'ลบชุมชนถาวร'
    modal.message = `การลบชุมชน "${data.name}" จะลบโพสต์, คอมเมนต์ และสมาชิกทั้งหมดภายในชุมชนนี้อย่างถาวรและไม่สามารถกู้คืนได้ คุณแน่ใจหรือไม่?`
    modal.confirmText = 'ลบทิ้งถาวร'
  }
  
  modal.show = true
}

function closeModal() {
  modal.show = false
  setTimeout(() => {
    modal.targetData = null
  }, 300)
}

async function confirmModal() {
  const data = modal.targetData
  if (!data) return
  
  try {
    if (modal.actionType === 'role') {
      const newRole = data.role === 'admin' ? 'user' : 'admin'
      await $fetch(`/api/admin/users/${data.id}`, { method: 'PUT', body: { role: newRole } })
      data.role = newRole
    } 
    else if (modal.actionType === 'ban') {
      const newBanStatus = data.is_banned ? 0 : 1
      await $fetch(`/api/admin/users/${data.id}/ban`, { 
        method: 'PUT', 
        body: { 
          is_banned: newBanStatus,
          ban_duration: modal.banDuration,
          ban_reason: modal.banReason
        } 
      })
      data.is_banned = newBanStatus
      reports.value.forEach(r => {
        if (r.reported_user_id === data.id) r.reported_is_banned = newBanStatus
      })
      
      // Trigger Realtime Kick-out
      if (newBanStatus === 1) {
        publish('user_banned', { user_id: data.id })
      }
    } 
    else if (modal.actionType === 'delete') {
      await $fetch(`/api/admin/users/${data.id}`, { method: 'DELETE' })
      users.value = users.value.filter(u => u.id !== data.id)
    }
    else if (modal.actionType === 'delete_content') {
      try {
        if (data.target_type === 'post' && data.reported_post_id) {
          await $fetch<any>(`/api/posts/${data.reported_post_id}`, { method: 'DELETE' as any })
        } else if (data.target_type === 'comment' && data.reported_comment_id && data.comment_post_id) {
          await $fetch<any>(`/api/posts/${data.comment_post_id}/comments/${data.reported_comment_id}`, { method: 'DELETE' as any })
        }
        await $fetch(`/api/admin/reports/${data.id}`, { method: 'PUT', body: { status: 'resolved' } })
        
        data.status = 'resolved'
        if (data.target_type === 'post') data.post_content = '(แอดมินลบโพสต์แล้ว)'
        if (data.target_type === 'comment') data.comment_content = '(แอดมินลบคอมเมนต์แล้ว)'
      } catch (err: any) {
        alert(err?.data?.message || 'ไม่สามารถลบเนื้อหาได้')
      }
    }
    else if (modal.actionType === 'resolve') {
      await $fetch(`/api/admin/reports/${data.id}`, { method: 'PUT', body: { status: 'resolved' } })
      data.status = 'resolved'
    }
    else if (modal.actionType === 'suspend_community') {
      await $fetch(`/api/admin/communities/${data.id}/status`, { 
        method: 'PUT', 
        body: { 
          is_suspended: true,
          ban_duration: modal.banDuration,
          ban_reason: modal.banReason
        } 
      })
      data.is_suspended = 1
    }
    else if (modal.actionType === 'unsuspend_community') {
      await $fetch(`/api/admin/communities/${data.id}/status`, { method: 'PUT', body: { is_suspended: false } })
      data.is_suspended = 0
    }
    else if (modal.actionType === 'delete_community') {
      await $fetch(`/api/admin/communities/${data.id}`, { method: 'DELETE' })
      communitiesList.value = communitiesList.value.filter(c => c.id !== data.id)
      publish('community_deleted', { community_id: data.id })
    }
  } catch(e) {
    alert('เกิดข้อผิดพลาดจากเซิร์ฟเวอร์')
  }
  closeModal()
}

function formatBanStatus(u: any) {
  if (!u.suspended_until) {
    return { type: 'permanent', label: 'แบนถาวร', subtext: '' }
  }
  const until = new Date(u.suspended_until)
  const now = new Date()
  const diffMs = until.getTime() - now.getTime()
  if (diffMs <= 0) {
    return { type: 'expired', label: 'ครบกำหนดแล้ว (ระบบกำลังปลดแบน)', subtext: '' }
  }
  const diffHours = Math.ceil(diffMs / (1000 * 60 * 60))
  if (diffHours < 24) {
    return { type: 'temporary', label: `ระงับชั่วคราว (เหลือ ${diffHours} ชม.)`, subtext: `ถึง ${until.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}` }
  }
  const diffDays = Math.ceil(diffHours / 24)
  return { type: 'temporary', label: `ระงับชั่วคราว (เหลือ ${diffDays} วัน)`, subtext: `ถึง ${until.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit' })}` }
}
</script>

<style scoped>
.badge-red {
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: white;
  font-size: 11px;
  font-weight: 800;
  padding: 2px 7px;
  border-radius: 9999px;
  min-width: 20px;
  height: 20px;
  text-align: center;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
  box-shadow: 0 0 10px rgba(239, 68, 68, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.badge-yellow {
  background: linear-gradient(135deg, #f59e0b, #d97706);
  color: white;
  font-size: 11px;
  font-weight: 800;
  padding: 2px 7px;
  border-radius: 9999px;
  min-width: 20px;
  height: 20px;
  text-align: center;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
  box-shadow: 0 0 10px rgba(245, 158, 11, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

/* New Item Highlight Frames */
.nexus-row.is-new-item td {
  position: relative;
  background: rgba(239, 68, 68, 0.09) !important;
  border-top: 2px solid rgba(239, 68, 68, 0.6) !important;
  border-bottom: 2px solid rgba(239, 68, 68, 0.6) !important;
  box-shadow: inset 0 0 15px rgba(239, 68, 68, 0.08);
  animation: pulseNewItem 2.5s infinite alternate ease-in-out;
}
.nexus-row.is-new-item td:first-child {
  border-left: 4px solid #ef4444 !important;
  border-top-left-radius: 12px;
  border-bottom-left-radius: 12px;
}
.nexus-row.is-new-item td:last-child {
  border-right: 2px solid rgba(239, 68, 68, 0.6) !important;
  border-top-right-radius: 12px;
  border-bottom-right-radius: 12px;
}

/* Report New Item */
.nexus-row.is-new-report td {
  position: relative;
  background: rgba(245, 158, 11, 0.09) !important;
  border-top: 2px solid rgba(245, 158, 11, 0.6) !important;
  border-bottom: 2px solid rgba(245, 158, 11, 0.6) !important;
  box-shadow: inset 0 0 15px rgba(245, 158, 11, 0.08);
  animation: pulseNewReport 2.5s infinite alternate ease-in-out;
}
.nexus-row.is-new-report td:first-child {
  border-left: 4px solid #f59e0b !important;
  border-top-left-radius: 12px;
  border-bottom-left-radius: 12px;
}
.nexus-row.is-new-report td:last-child {
  border-right: 2px solid rgba(245, 158, 11, 0.6) !important;
  border-top-right-radius: 12px;
  border-bottom-right-radius: 12px;
}

/* Log New Item */
.logs-table tbody tr.is-new-log td {
  position: relative;
  background: rgba(139, 92, 246, 0.1) !important;
  border-top: 2px solid rgba(139, 92, 246, 0.6) !important;
  border-bottom: 2px solid rgba(139, 92, 246, 0.6) !important;
  box-shadow: inset 0 0 15px rgba(139, 92, 246, 0.08);
  animation: pulseNewLog 2.5s infinite alternate ease-in-out;
}
.logs-table tbody tr.is-new-log td:first-child {
  border-left: 4px solid #8b5cf6 !important;
  border-top-left-radius: 12px;
  border-bottom-left-radius: 12px;
}
.logs-table tbody tr.is-new-log td:last-child {
  border-right: 2px solid rgba(139, 92, 246, 0.6) !important;
  border-top-right-radius: 12px;
  border-bottom-right-radius: 12px;
}

@keyframes pulseNewItem {
  0% { background: rgba(239, 68, 68, 0.06) !important; }
  100% { background: rgba(239, 68, 68, 0.14) !important; }
}
@keyframes pulseNewReport {
  0% { background: rgba(245, 158, 11, 0.06) !important; }
  100% { background: rgba(245, 158, 11, 0.14) !important; }
}
@keyframes pulseNewLog {
  0% { background: rgba(139, 92, 246, 0.06) !important; }
  100% { background: rgba(139, 92, 246, 0.15) !important; }
}

.badge-new-glow {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  background: linear-gradient(135deg, #ef4444, #f97316);
  color: #ffffff;
  font-size: 10px;
  font-weight: 800;
  padding: 1.5px 6px;
  border-radius: 6px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  box-shadow: 0 0 10px rgba(239, 68, 68, 0.7);
  line-height: 1.2;
}

.badge-new-glow.yellow {
  background: linear-gradient(135deg, #f59e0b, #eab308);
  box-shadow: 0 0 10px rgba(245, 158, 11, 0.7);
}

.badge-new-glow.purple {
  background: linear-gradient(135deg, #8b5cf6, #6366f1);
  box-shadow: 0 0 10px rgba(139, 92, 246, 0.7);
}

/* Core Layout */
.admin-dashboard {
  padding: 24px 24px 80px;
  max-width: 100%;
  width: 100%;
  margin: 0 auto;
  color: var(--text-primary);
  font-family: 'Inter', system-ui, sans-serif;
  box-sizing: border-box;
  min-width: 0;
}

/* Header */
.admin-header {
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 16px;
}

.admin-header-title-wrap {
  display: flex;
  align-items: center;
  gap: 14px;
}

.admin-header-info h1.admin-main-title {
  font-size: 24px;
  font-weight: 800;
  margin: 0 0 4px 0;
  letter-spacing: -0.5px;
  background: linear-gradient(135deg, #a78bfa 0%, #60a5fa 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.admin-online-pill {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(16, 185, 129, 0.12);
  border: 1px solid rgba(16, 185, 129, 0.3);
  padding: 6px 14px;
  border-radius: 99px;
  font-size: 12.5px;
  font-weight: 700;
  color: #10b981;
}

.live-dot-green {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #10b981;
  box-shadow: 0 0 8px rgba(16, 185, 129, 0.8);
  animation: livePulse 1.8s infinite ease-in-out;
}

@keyframes livePulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.3); opacity: 0.6; }
}

.admin-title-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(59, 130, 246, 0.2));
  border: 1px solid rgba(139, 92, 246, 0.35);
  color: #8b5cf6;
  box-shadow: 0 0 20px rgba(139, 92, 246, 0.3);
  flex-shrink: 0;
}

.subtitle {
  color: var(--text-secondary);
  font-size: 13.5px;
  font-weight: 500;
  margin: 0;
}

/* Floating Glass Segmented Tabs Dock */
.tabs-nav-wrapper {
  position: sticky;
  top: 0;
  z-index: 40;
  padding: 6px 0 16px;
  margin-bottom: 20px;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}

.admin-tabs-dock {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 5px;
  background: var(--bg-card);
  backdrop-filter: blur(28px) saturate(190%);
  -webkit-backdrop-filter: blur(28px) saturate(190%);
  border: 1px solid var(--border-primary);
  border-radius: 16px;
  box-shadow: var(--card-shadow);
  flex-wrap: wrap;
}

.nexus-tab {
  position: relative;
  background: transparent;
  border: 1px solid transparent;
  padding: 8px 16px;
  border-radius: 12px;
  color: var(--text-secondary);
  font-weight: 600;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.22s cubic-bezier(0.4, 0, 0.2, 1);
  display: inline-flex;
  align-items: center;
  gap: 7px;
  white-space: nowrap;
  user-select: none;
}

.nexus-tab:hover {
  color: var(--text-primary);
  background: var(--bg-hover);
  transform: translateY(-1px);
}

.nexus-tab.active {
  color: #ffffff !important;
  background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 50%, #3b82f6 100%) !important;
  border: 1px solid rgba(255, 255, 255, 0.3) !important;
  box-shadow: 0 4px 18px rgba(139, 92, 246, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.35) !important;
  font-weight: 700;
  transform: translateY(-0.5px);
}

.nexus-tab svg {
  flex-shrink: 0;
  transition: transform 0.2s ease;
}

.nexus-tab:hover svg {
  transform: scale(1.1);
}

/* Panels & Tables */
.nexus-panel {
  background: var(--bg-card);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border: 1px solid var(--border-primary);
  border-radius: 20px;
  overflow: hidden;
  box-shadow: var(--card-shadow);
  width: 100%;
  max-width: 100%;
  margin-bottom: 32px;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 18px 24px;
  border-bottom: 1px solid var(--border-primary);
  background: var(--bg-tertiary);
}
.card-header h2 {
  font-size: 17px;
  font-weight: 700;
  margin: 0;
  color: var(--text-primary);
}
.header-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.header-icon.brand {
  background: rgba(139, 92, 246, 0.15);
  color: #8b5cf6;
}
.header-icon.warning {
  background: rgba(245, 158, 11, 0.15);
  color: #f59e0b;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 11.5px;
  font-weight: 700;
  line-height: 1;
  border: 1px solid transparent;
}
.status-badge .badge-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  flex-shrink: 0;
}
.status-badge.danger {
  background: rgba(239, 68, 68, 0.12);
  border-color: rgba(239, 68, 68, 0.25);
  color: #ef4444;
}
.status-badge.danger .badge-dot {
  background: #ef4444;
  box-shadow: 0 0 6px rgba(239, 68, 68, 0.8);
}
.status-badge.success {
  background: rgba(16, 185, 129, 0.12);
  border-color: rgba(16, 185, 129, 0.25);
  color: #10b981;
}
.status-badge.success .badge-dot {
  background: #10b981;
  box-shadow: 0 0 6px rgba(16, 185, 129, 0.8);
}
.status-badge.warning {
  background: rgba(245, 158, 11, 0.12);
  border-color: rgba(245, 158, 11, 0.25);
  color: #f59e0b;
}
.status-badge.warning .badge-dot {
  background: #f59e0b;
  box-shadow: 0 0 6px rgba(245, 158, 11, 0.8);
}
.status-badge.brand {
  background: rgba(139, 92, 246, 0.12);
  border-color: rgba(139, 92, 246, 0.25);
  color: #8b5cf6;
}
.status-badge.brand .badge-dot {
  background: #8b5cf6;
  box-shadow: 0 0 6px rgba(139, 92, 246, 0.8);
}
.status-badge.info {
  background: rgba(59, 130, 246, 0.12);
  border-color: rgba(59, 130, 246, 0.25);
  color: #3b82f6;
}
.status-badge.info .badge-dot {
  background: #3b82f6;
  box-shadow: 0 0 6px rgba(59, 130, 246, 0.8);
}

.admin-shield-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border-radius: 6px;
  background: rgba(59, 130, 246, 0.15);
  border: 1px solid rgba(59, 130, 246, 0.3);
  color: #3b82f6;
  flex-shrink: 0;
}

.target-icon-box {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 8px;
  flex-shrink: 0;
  border: 1px solid transparent;
}
.target-icon-box.community {
  background: rgba(245, 158, 11, 0.12);
  border-color: rgba(245, 158, 11, 0.25);
  color: #f59e0b;
}
.target-icon-box.post {
  background: rgba(59, 130, 246, 0.12);
  border-color: rgba(59, 130, 246, 0.25);
  color: #3b82f6;
}
.target-icon-box.comment {
  background: rgba(139, 92, 246, 0.12);
  border-color: rgba(139, 92, 246, 0.25);
  color: #8b5cf6;
}
.target-icon-box.user,
.target-icon-box.generic {
  background: var(--bg-tertiary);
  border-color: var(--border-primary);
  color: var(--text-muted);
}

.filter-icon-svg {
  color: var(--brand);
  flex-shrink: 0;
}

.table-container {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  width: 100%;
}

/* Search & Filter Toolbar */
.admin-search-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 12px 16px;
  background: var(--bg-tertiary);
  border-bottom: 1px solid var(--border-primary);
  flex-wrap: wrap;
}

.search-input-wrap {
  position: relative;
  flex: 1;
  min-width: 220px;
  max-width: 380px;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 12px;
  color: var(--text-muted);
  pointer-events: none;
}

.admin-search-input {
  width: 100%;
  padding: 7px 32px 7px 34px;
  background: var(--bg-card);
  border: 1px solid var(--border-primary);
  border-radius: 8px;
  color: var(--text-primary);
  font-size: 13px;
  outline: none;
  transition: all 0.2s ease;
}

.admin-search-input:focus {
  border-color: var(--brand);
  background: var(--bg-card);
  box-shadow: 0 0 0 3px var(--brand-light);
}

.btn-clear-search {
  position: absolute;
  right: 8px;
  background: none;
  border: none;
  color: var(--text-muted);
  font-size: 12px;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.15s ease;
}

.btn-clear-search:hover {
  color: var(--text-primary);
  background: var(--bg-hover);
}

.filter-controls-group {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.filter-select-box {
  display: flex;
  align-items: center;
  gap: 6px;
  background: var(--bg-card);
  border: 1px solid var(--border-primary);
  border-radius: 8px;
  padding: 3px 8px;
}

.custom-date-picker-box {
  display: flex;
  align-items: center;
  gap: 6px;
  background: var(--bg-card);
  border: 1px solid var(--border-primary);
  border-radius: 8px;
  padding: 3px 8px;
}

.admin-date-input {
  background: var(--bg-tertiary);
  border: 1px solid var(--border-primary);
  border-radius: 6px;
  color: var(--text-primary);
  font-size: 12px;
  font-weight: 600;
  outline: none;
  cursor: pointer;
  padding: 3px 6px;
}

.admin-date-input:focus {
  border-color: var(--brand);
}

.date-sep {
  color: var(--text-muted);
  font-weight: 600;
  font-size: 12px;
}

.btn-reset-filters {
  background: rgba(239, 68, 68, 0.12);
  border: 1px solid rgba(239, 68, 68, 0.25);
  color: #ef4444;
  font-size: 11.5px;
  font-weight: 700;
  border-radius: 8px;
  padding: 5px 10px;
  cursor: pointer;
  transition: all 0.15s ease;
  white-space: nowrap;
}

.btn-reset-filters:hover {
  background: rgba(239, 68, 68, 0.22);
}

.filter-label {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-muted);
  white-space: nowrap;
}

.admin-filter-select {
  background: transparent;
  border: none;
  color: var(--text-primary);
  font-size: 12.5px;
  font-weight: 600;
  outline: none;
  cursor: pointer;
  padding: 2px;
}

.admin-filter-select option {
  background: var(--bg-card);
  color: var(--text-primary);
}

.result-count-badge {
  font-size: 11.5px;
  font-weight: 700;
  color: var(--brand);
  background: var(--brand-light);
  border: 1px solid var(--border-primary);
  padding: 4px 10px;
  border-radius: 7px;
  white-space: nowrap;
}

/* Logs Panel Specifics - Fixed top & only table body scrolls */
.logs-panel {
  display: flex;
  flex-direction: column;
  max-height: 820px;
  min-height: 520px;
  overflow: hidden !important;
  border-radius: 20px;
}

.logs-header {
  flex-shrink: 0;
}

.logs-header-sub {
  font-size: 12.5px;
  color: var(--text-muted);
  margin: 3px 0 0 0;
  font-weight: 500;
}

.logs-toolbar {
  flex-shrink: 0;
  z-index: 5;
  background: var(--bg-tertiary);
  border-bottom: 1px solid var(--border-primary);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 20px;
  flex-wrap: wrap;
}

.logs-table-container {
  flex: 1;
  overflow-y: auto !important;
  overflow-x: auto;
  min-height: 380px;
  max-height: 600px;
  width: 100%;
  scrollbar-width: thin;
  scrollbar-color: var(--border-secondary) transparent;
}

.logs-table-container::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
.logs-table-container::-webkit-scrollbar-thumb {
  background: var(--border-secondary);
  border-radius: 4px;
}

.logs-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  min-width: unset;
}

.logs-table thead th {
  position: sticky;
  top: 0;
  z-index: 10;
  background: var(--bg-tertiary) !important;
  color: var(--text-primary) !important;
  border-bottom: 2px solid var(--border-secondary) !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  font-size: 12px;
  font-weight: 800;
  padding: 12px 14px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  white-space: nowrap;
}

.logs-table tbody td {
  padding: 12px 14px;
  border-bottom: 1px solid var(--border-primary);
  vertical-align: middle;
  transition: background 0.15s ease;
}

.logs-table tbody tr:nth-child(even) {
  background: rgba(255, 255, 255, 0.015);
}

.logs-table tbody tr:hover td {
  background: rgba(139, 92, 246, 0.06) !important;
}

.log-id-pill {
  font-family: 'JetBrains Mono', monospace, sans-serif;
  font-size: 11.5px;
  font-weight: 700;
  color: var(--text-secondary);
  background: var(--bg-tertiary);
  border: 1px solid var(--border-primary);
  padding: 2px 6px;
  border-radius: 6px;
  white-space: nowrap;
}

.admin-shield-icon {
  font-size: 13px;
}

.log-date-cell {
  white-space: nowrap;
}

.log-date-primary {
  font-size: 12.5px;
  font-weight: 700;
  color: var(--text-primary);
}

.log-time-secondary {
  font-size: 11px;
  color: var(--text-muted);
  margin-top: 2px;
  font-family: monospace, system-ui;
}

.nexus-table {
  width: 100%;
  min-width: unset;
  border-collapse: collapse;
}
.nexus-table th {
  padding: 12px 14px;
  font-size: 11.5px;
  text-transform: uppercase;
  letter-spacing: 0.6px;
  color: var(--text-muted);
  font-weight: 700;
  background: var(--bg-tertiary);
  border-bottom: 1px solid var(--border-primary);
  white-space: nowrap;
  text-align: left;
}
.nexus-table td {
  padding: 12px 14px;
  vertical-align: middle;
  border-bottom: 1px solid var(--border-primary);
  color: var(--text-primary);
  font-size: 13px;
  transition: background 0.15s ease;
}
.nexus-row:hover td {
  background: rgba(139, 92, 246, 0.05);
}
.nexus-row.is-banned td {
  background: rgba(239, 68, 68, 0.06);
}

/* Profiles */
.user-profile {
  display: flex;
  align-items: center;
  gap: 14px;
}
.avatar-wrapper {
  position: relative;
  width: 42px;
  height: 42px;
  border-radius: 50%;
  padding: 2px;
  background: linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0));
  flex-shrink: 0;
}
.avatar-wrapper img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid var(--border-primary);
}
.nexus-row.is-banned .avatar-wrapper img {
  filter: grayscale(100%);
  opacity: 0.6;
}
.user-info .display-name {
  font-weight: 700;
  font-size: 14.5px;
  color: var(--text-primary);
  white-space: nowrap;
}
.nexus-row.is-banned .display-name {
  text-decoration: line-through;
  color: var(--text-muted);
}
.user-info .username {
  font-size: 12.5px;
  color: var(--text-muted);
  margin-top: 2px;
  white-space: nowrap;
}

.mini-profile {
  display: flex;
  align-items: center;
  gap: 10px;
}
.mini-profile img {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  object-fit: cover;
}

/* Badges */
.nexus-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 100px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  border: 1px solid transparent;
  white-space: nowrap;
  line-height: 1.2;
}
.glow-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  flex-shrink: 0;
}
.badge-success {
  background: rgba(16, 185, 129, 0.12);
  color: #10b981;
  border-color: rgba(16, 185, 129, 0.25);
}
.badge-success .glow-dot {
  background: #10b981;
  box-shadow: 0 0 8px rgba(16, 185, 129, 0.6);
}
.badge-danger {
  background: rgba(239, 68, 68, 0.12);
  color: #ef4444;
  border-color: rgba(239, 68, 68, 0.25);
}
.badge-danger .glow-dot {
  background: #ef4444;
  box-shadow: 0 0 8px rgba(239, 68, 68, 0.6);
}
.badge-warning {
  background: rgba(245, 158, 11, 0.12);
  color: #f59e0b;
  border-color: rgba(245, 158, 11, 0.25);
}
.badge-warning .glow-dot {
  background: #f59e0b;
  box-shadow: 0 0 8px rgba(245, 158, 11, 0.6);
}
.badge-info {
  background: rgba(59, 130, 246, 0.12);
  color: #3b82f6;
  border-color: rgba(59, 130, 246, 0.25);
}
.badge-info .glow-dot {
  background: #3b82f6;
  box-shadow: 0 0 8px rgba(59, 130, 246, 0.6);
}
.badge-brand {
  background: rgba(139, 92, 246, 0.15);
  color: #8b5cf6;
  border-color: rgba(139, 92, 246, 0.3);
}
.badge-default {
  background: var(--bg-tertiary);
  color: var(--text-muted);
  border-color: var(--border-primary);
}

.admin-user-link {
  transition: color 0.15s ease;
}
.admin-user-link:hover {
  color: var(--brand) !important;
  text-decoration: underline !important;
}

/* Reports Table Specifics */
.reports-table {
  width: 100%;
  min-width: unset;
}

.date-cell {
  white-space: nowrap;
}
.report-date {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
}
.report-time {
  font-size: 11.5px;
  color: var(--text-muted);
  margin-top: 2px;
}

.profile-handle {
  font-weight: 600;
  font-size: 13.5px;
  color: var(--text-primary);
  white-space: nowrap;
}

.community-icon-box {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  background: rgba(245, 158, 11, 0.15);
  color: #f59e0b;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

/* Target Tags */
.target-tag {
  display: inline-block;
  padding: 2px 7px;
  border-radius: 6px;
  font-size: 10.5px;
  font-weight: 700;
  white-space: nowrap;
  letter-spacing: 0.2px;
}
.tag-user {
  background: rgba(59, 130, 246, 0.12);
  color: #3b82f6;
  border: 1px solid rgba(59, 130, 246, 0.2);
}
.tag-post {
  background: rgba(16, 185, 129, 0.12);
  color: #10b981;
  border: 1px solid rgba(16, 185, 129, 0.2);
}
.tag-comm-post {
  background: rgba(168, 85, 247, 0.12);
  color: #a855f7;
  border: 1px solid rgba(168, 85, 247, 0.2);
}
.tag-comment {
  background: rgba(245, 158, 11, 0.12);
  color: #f59e0b;
  border: 1px solid rgba(245, 158, 11, 0.2);
}
.tag-message {
  background: rgba(236, 72, 153, 0.12);
  color: #ec4899;
  border: 1px solid rgba(236, 72, 153, 0.2);
}
.tag-danger {
  background: rgba(239, 68, 68, 0.12);
  color: #ef4444;
  border: 1px solid rgba(239, 68, 68, 0.2);
}

/* Reason Card (Super clean & legible) */
.reason-card {
  background: var(--bg-tertiary);
  border: 1px solid var(--border-primary);
  border-radius: 12px;
  padding: 10px 14px;
  min-width: 260px;
  max-width: 380px;
}
.reason-text {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
  line-height: 1.45;
  word-break: break-word;
}
.reason-ctx {
  margin-top: 6px;
  padding: 6px 10px;
  border-radius: 8px;
  font-size: 11.5px;
  line-height: 1.4;
  word-break: break-word;
  display: flex;
  align-items: flex-start;
  gap: 5px;
}
.ctx-community {
  background: rgba(168, 85, 247, 0.08);
  color: #a855f7;
  border: 1px solid rgba(168, 85, 247, 0.2);
}
.ctx-post {
  background: var(--bg-card);
  color: var(--text-secondary);
  border: 1px solid var(--border-primary);
}
.ctx-comment {
  background: var(--bg-card);
  color: var(--text-secondary);
  border: 1px solid var(--border-primary);
}
.ctx-message {
  background: var(--bg-card);
  color: var(--text-secondary);
  border: 1px solid var(--border-primary);
}
.ctx-label {
  font-weight: 700;
  color: var(--brand);
  flex-shrink: 0;
}
.ctx-content {
  color: var(--text-secondary);
}

.reason-links {
  margin-top: 8px;
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}
.reason-link-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 11.5px;
  font-weight: 600;
  text-decoration: none;
  white-space: nowrap;
  transition: all 0.2s ease;
}
.reason-link-btn.link-user {
  background: rgba(59, 130, 246, 0.12);
  color: #3b82f6;
  border: 1px solid rgba(59, 130, 246, 0.25);
}
.reason-link-btn.link-user:hover {
  background: rgba(59, 130, 246, 0.2);
  border-color: rgba(59, 130, 246, 0.4);
}
.reason-link-btn.link-community {
  background: rgba(245, 158, 11, 0.12);
  color: #f59e0b;
  border: 1px solid rgba(245, 158, 11, 0.25);
}
.reason-link-btn.link-community:hover {
  background: rgba(245, 158, 11, 0.2);
  border-color: rgba(245, 158, 11, 0.4);
}
.reason-link-btn.link-post {
  background: rgba(139, 92, 246, 0.12);
  color: #8b5cf6;
  border: 1px solid rgba(139, 92, 246, 0.25);
}
.reason-link-btn.link-post:hover {
  background: rgba(139, 92, 246, 0.2);
  border-color: rgba(139, 92, 246, 0.4);
}
.reason-link-btn.link-comment {
  background: rgba(59, 130, 246, 0.12);
  color: #3b82f6;
  border: 1px solid rgba(59, 130, 246, 0.25);
}
.reason-link-btn.link-comment:hover {
  background: rgba(59, 130, 246, 0.2);
  border-color: rgba(59, 130, 246, 0.4);
}

/* Report Action Column */
.report-actions-col {
  display: flex;
  flex-direction: column;
  gap: 6px;
  align-items: flex-end;
}
.report-actions-col .nexus-btn {
  padding: 5px 12px;
  font-size: 12px;
}

/* Buttons */
.actions-cell {
  text-align: right;
  white-space: nowrap;
}
.actions-wrapper {
  display: flex;
  gap: 4px;
  justify-content: flex-end;
  align-items: center;
  flex-wrap: nowrap;
}
.nexus-btn {
  padding: 4px 8px;
  border-radius: 7px;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
  border: 1px solid transparent;
  white-space: nowrap;
  font-family: inherit;
}
.nexus-btn:hover {
  transform: translateY(-1px);
}
.nexus-btn:active {
  transform: translateY(1px);
}
.btn-outline {
  background: transparent;
  border-color: var(--border-secondary);
  color: var(--text-primary);
}
.btn-outline:hover {
  background: var(--bg-hover);
  border-color: var(--border-primary);
  color: var(--text-primary);
}
.btn-success {
  background: rgba(16, 185, 129, 0.12);
  border-color: rgba(16, 185, 129, 0.3);
  color: #10b981;
}
.btn-success:hover {
  background: rgba(16, 185, 129, 0.22);
  box-shadow: 0 0 15px rgba(16, 185, 129, 0.2);
}
.btn-warning {
  background: rgba(245, 158, 11, 0.12);
  border-color: rgba(245, 158, 11, 0.3);
  color: #f59e0b;
}
.btn-warning:hover {
  background: rgba(245, 158, 11, 0.22);
  box-shadow: 0 0 15px rgba(245, 158, 11, 0.2);
}
.btn-danger {
  background: rgba(239, 68, 68, 0.12);
  border-color: rgba(239, 68, 68, 0.3);
  color: #ef4444;
}
.btn-danger:hover {
  background: rgba(239, 68, 68, 0.22);
  box-shadow: 0 0 15px rgba(239, 68, 68, 0.2);
}
.btn-brand {
  background: linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%);
  color: #fff;
  border: none;
  box-shadow: 0 4px 15px rgba(139, 92, 246, 0.3);
}
.btn-brand:hover {
  box-shadow: 0 6px 20px rgba(139, 92, 246, 0.4);
}
.btn-ghost {
  background: transparent;
  color: var(--text-secondary);
}
.btn-ghost:hover {
  color: var(--text-primary);
  background: var(--bg-hover);
}

/* ══════════════════════════════════════════
   UPGRADED CYBER GLASS CONFIRMATION MODAL
══════════════════════════════════════════ */
.nexus-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.72);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 16px;
  animation: overlayFadeIn 0.2s ease-out;
}

@keyframes overlayFadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.nexus-modal {
  position: relative;
  background: var(--bg-card);
  border: 1px solid var(--border-primary);
  border-radius: 28px;
  padding: 36px 32px 30px 32px;
  width: 100%;
  max-width: 440px;
  text-align: center;
  box-shadow: 0 25px 60px -12px rgba(0, 0, 0, 0.45), 0 0 0 1px rgba(255, 255, 255, 0.08);
  overflow: hidden;
  animation: modalSpring 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes modalSpring {
  from {
    opacity: 0;
    transform: scale(0.92) translateY(10px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

/* Top Accent Line with Ambient Glow */
.modal-top-accent-line {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #8b5cf6, #3b82f6);
}

.modal-top-accent-line.danger {
  background: linear-gradient(90deg, #ef4444, #f43f5e, #dc2626);
  box-shadow: 0 0 16px rgba(239, 68, 68, 0.6);
}

.modal-top-accent-line.warning {
  background: linear-gradient(90deg, #f59e0b, #fbbf24, #d97706);
  box-shadow: 0 0 16px rgba(245, 158, 11, 0.6);
}

.modal-top-accent-line.success {
  background: linear-gradient(90deg, #10b981, #34d399, #059669);
  box-shadow: 0 0 16px rgba(16, 185, 129, 0.6);
}

.modal-top-accent-line.brand {
  background: linear-gradient(90deg, #8b5cf6, #a855f7, #3b82f6);
  box-shadow: 0 0 16px rgba(139, 92, 246, 0.6);
}

/* Icon Outer Aura Ring */
.modal-icon-container {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  margin: 4px auto 20px auto;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.modal-icon-inner-box {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.modal-icon-inner-box svg {
  width: 28px;
  height: 28px;
}

.modal-icon-container.danger {
  background: rgba(239, 68, 68, 0.08);
  box-shadow: 0 0 35px rgba(239, 68, 68, 0.25);
}

.modal-icon-container.danger .modal-icon-inner-box {
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(220, 38, 38, 0.1));
  border: 1.5px solid rgba(239, 68, 68, 0.35);
  color: #ef4444;
}

.modal-icon-container.warning {
  background: rgba(245, 158, 11, 0.08);
  box-shadow: 0 0 35px rgba(245, 158, 11, 0.25);
}

.modal-icon-container.warning .modal-icon-inner-box {
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(217, 119, 6, 0.1));
  border: 1.5px solid rgba(245, 158, 11, 0.35);
  color: #f59e0b;
}

.modal-icon-container.success {
  background: rgba(16, 185, 129, 0.08);
  box-shadow: 0 0 35px rgba(16, 185, 129, 0.25);
}

.modal-icon-container.success .modal-icon-inner-box {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(5, 150, 105, 0.1));
  border: 1.5px solid rgba(16, 185, 129, 0.35);
  color: #10b981;
}

.modal-icon-container.brand {
  background: rgba(139, 92, 246, 0.08);
  box-shadow: 0 0 35px rgba(139, 92, 246, 0.25);
}

.modal-icon-container.brand .modal-icon-inner-box {
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(59, 130, 246, 0.1));
  border: 1.5px solid rgba(139, 92, 246, 0.35);
  color: #8b5cf6;
}

/* Typography */
.modal-title-heading {
  font-size: 22px;
  font-weight: 800;
  color: var(--text-primary);
  margin: 0 0 10px 0;
  letter-spacing: -0.3px;
  line-height: 1.3;
}

.modal-body-desc {
  color: var(--text-secondary);
  font-size: 14.5px;
  line-height: 1.6;
  margin: 0 auto 28px auto;
  max-width: 360px;
}

/* Form Area */
.modal-form-block {
  margin: 0 0 24px 0;
  text-align: left;
  background: var(--bg-tertiary, rgba(255, 255, 255, 0.03));
  border: 1px solid var(--border-primary);
  border-radius: 16px;
  padding: 16px;
}

.modal-input-label {
  display: block;
  font-size: 12.5px;
  font-weight: 700;
  color: var(--text-secondary);
  margin-bottom: 8px;
}

.modal-custom-select {
  width: 100%;
  padding: 11px 14px;
  border-radius: 10px;
  border: 1px solid var(--border-primary);
  background: var(--bg-card);
  color: var(--text-primary);
  margin-bottom: 14px;
  font-size: 13.5px;
  font-weight: 600;
  outline: none;
  transition: all 0.2s ease;
}

.modal-custom-select:focus {
  border-color: var(--brand);
  box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.2);
}

.modal-custom-textarea {
  width: 100%;
  padding: 11px 14px;
  border-radius: 10px;
  border: 1px solid var(--border-primary);
  background: var(--bg-card);
  color: var(--text-primary);
  font-size: 13px;
  resize: none;
  outline: none;
  font-family: inherit;
  transition: all 0.2s ease;
}

.modal-custom-textarea:focus {
  border-color: var(--brand);
  box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.2);
}

/* Buttons Container */
.modal-actions-container {
  display: grid;
  grid-template-columns: 1fr 1.3fr;
  gap: 12px;
  align-items: center;
}

.modal-btn-dismiss {
  padding: 13px 20px;
  border-radius: 14px;
  font-size: 14px;
  font-weight: 700;
  color: var(--text-secondary);
  background: var(--bg-tertiary, rgba(255, 255, 255, 0.05));
  border: 1px solid var(--border-primary);
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  font-family: inherit;
}

.modal-btn-dismiss:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
  border-color: var(--border-secondary);
  transform: translateY(-1px);
}

.modal-btn-dismiss:active {
  transform: translateY(1px);
}

.modal-btn-action {
  padding: 13px 22px;
  border-radius: 14px;
  font-size: 14.5px;
  font-weight: 800;
  color: #ffffff;
  border: none;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  font-family: inherit;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.modal-btn-action:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none !important;
  box-shadow: none !important;
}

.modal-btn-action:hover:not(:disabled) {
  transform: translateY(-2px);
  filter: brightness(1.1);
}

.modal-btn-action:active:not(:disabled) {
  transform: translateY(1px);
  filter: brightness(0.95);
}

.btn-action-danger {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  box-shadow: 0 6px 20px rgba(239, 68, 68, 0.45);
}

.btn-action-warning {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  box-shadow: 0 6px 20px rgba(245, 158, 11, 0.45);
}

.btn-action-success {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  box-shadow: 0 6px 20px rgba(16, 185, 129, 0.45);
}

.btn-action-brand {
  background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%);
  box-shadow: 0 6px 20px rgba(139, 92, 246, 0.45);
}

.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
  margin-bottom: 28px;
}
.stat-card {
  background: var(--bg-card);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border: 1px solid var(--border-primary);
  border-radius: 20px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: var(--card-shadow);
  transition: transform 0.25s ease, box-shadow 0.25s ease;
}
.stat-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 16px 36px rgba(0, 0, 0, 0.15);
}
.stat-icon {
  width: 50px;
  height: 50px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.stat-icon.brand {
  background: rgba(139, 92, 246, 0.15);
  color: #8b5cf6;
}
.stat-icon.info {
  background: rgba(59, 130, 246, 0.15);
  color: #3b82f6;
}
.stat-icon.warning {
  background: rgba(245, 158, 11, 0.15);
  color: #f59e0b;
}
.stat-icon.danger {
  background: rgba(239, 68, 68, 0.15);
  color: #ef4444;
}
.stat-content h3 {
  margin: 0 0 4px 0;
  font-size: 13.5px;
  color: var(--text-secondary);
  font-weight: 600;
}
.stat-value {
  font-size: 28px;
  font-weight: 800;
  color: var(--text-primary);
  display: flex;
  align-items: baseline;
  gap: 6px;
}
.stat-value span {
  font-size: 13px;
  color: var(--text-muted);
  font-weight: 500;
}

/* Animations */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
  backdrop-filter: blur(0px);
}
.modal-fade-enter-from .nexus-modal,
.modal-fade-leave-to .nexus-modal {
  transform: scale(0.95) translateY(10px);
  opacity: 0;
}

/* Utility */
.text-right { text-align: right; }
.text-muted { color: var(--text-muted); }
.text-danger { color: #ef4444; }
.fw-bold { font-weight: 600; }
.empty-state { text-align: center; padding: 60px 24px !important; color: var(--text-muted) !important; }
.spinner {
  width: 36px; height: 36px;
  border: 3px solid var(--border-secondary);
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 14px auto;
}
@keyframes spin { 100% { transform: rotate(360deg); } }

/* ─── Responsive Media Queries ─── */
@media (max-width: 1024px) {
  .admin-dashboard {
    padding: 24px 16px 80px;
  }
  
  .admin-tabs {
    justify-content: flex-start !important;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    flex-wrap: nowrap !important;
    padding-bottom: 6px;
    scrollbar-width: none;
  }
  .admin-tabs::-webkit-scrollbar { display: none; }
  
  .nexus-tab {
    flex-shrink: 0;
    padding: 8px 16px;
    font-size: 13.5px;
  }
}

@media (max-width: 640px) {
  .admin-dashboard {
    padding: 16px 10px 90px;
  }

  .dashboard-grid {
    grid-template-columns: 1fr !important;
    gap: 10px !important;
  }

  .stat-card {
    padding: 14px 16px !important;
    border-radius: 16px !important;
  }

  .stat-value {
    font-size: 22px !important;
  }

  .nexus-panel {
    border-radius: 16px !important;
  }
}
</style>
