<template>
  <div class="settings-page-root">
    <div class="settings-container">

      <!-- ══════════════════════════════════════════
           TOP HEADER CARD
      ══════════════════════════════════════════ -->
      <div class="settings-header-card">
        <div class="header-left">
          <NuxtLink :to="`/community/${slug}`" class="btn-back-pill" title="ย้อนกลับไปหน้าชุมชน">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"/>
              <polyline points="12 19 5 12 12 5"/>
            </svg>
            <span>ย้อนกลับ</span>
          </NuxtLink>

          <div class="header-title-wrap">
            <div class="community-mini-avatar" :style="!community?.avatar_url ? { background: community?.bg_color || '#6366f1' } : {}">
              <img v-if="community?.avatar_url" :src="community.avatar_url" alt="avatar" />
              <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            </div>
            <div>
              <h1 class="header-title">แผงควบคุมชุมชน</h1>
              <p class="header-subtitle">{{ community?.name }} • จัดการและตั้งค่ากลุ่ม</p>
            </div>
          </div>
        </div>
      </div>

      <!-- ══════════════════════════════════════════
           NAVIGATION TABS BAR
      ══════════════════════════════════════════ -->
      <div class="settings-tabs-bar">
        <button
          v-for="tab in availableTabs"
          :key="tab.id"
          @click="activeTab = tab.id"
          class="settings-tab-btn"
          :class="{ active: activeTab === tab.id, 'danger-tab-btn': tab.id === 'danger' }"
        >
          <span class="tab-icon">
            <svg v-if="tab.id === 'general'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
            <svg v-else-if="tab.id === 'rules'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
            <svg v-else-if="tab.id === 'privacy'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            <svg v-else-if="tab.id === 'members'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            <svg v-else-if="tab.id === 'requests'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 14 14"/></svg>
            <svg v-else-if="tab.id === 'reports'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>
            <svg v-else-if="tab.id === 'danger'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
          </span>
          <span class="tab-label">{{ tab.label }}</span>
          
          <!-- Badge for Pending Requests -->
          <span v-if="tab.id === 'requests' && pendingRequests.length > 0" class="badge-counter red">
            {{ pendingRequests.length }}
          </span>
          <!-- Badge for Reports -->
          <span v-if="tab.id === 'reports' && reports.length > 0" class="badge-counter amber">
            {{ reports.length }}
          </span>
          <!-- Badge for Members -->
          <span v-if="tab.id === 'members' && members.length > 0" class="badge-counter blue">
            {{ members.length }}
          </span>
        </button>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="settings-state-card">
        <div class="spinner"></div>
        <p>กำลังโหลดข้อมูลการตั้งค่า...</p>
      </div>

      <!-- TAB 1: ข้อมูลทั่วไป (GENERAL) -->
      <div v-if="!loading && activeTab === 'general'" class="settings-content-card">
        <div class="card-section-header">
          <div class="section-icon-badge">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
          </div>
          <div>
            <h2>ข้อมูลทั่วไปของชุมชน</h2>
            <p>ปรับแต่งชื่อ คำแนะนำ รูปโปรไฟล์ ภาพหน้าปก และสีธีมหลัก</p>
          </div>
        </div>
        
        <div class="form-grid">
          <!-- Community Name -->
          <div class="form-group">
            <label class="form-label">ชื่อชุมชน (Community Name)</label>
            <input 
              v-model="formGeneral.name" 
              type="text" 
              class="form-input" 
              placeholder="ระบุชื่อชุมชนของคุณ..."
            />
          </div>

          <!-- Description -->
          <div class="form-group">
            <label class="form-label">คำแนะนำชุมชน (Description)</label>
            <textarea 
              v-model="formGeneral.description" 
              class="form-textarea" 
              rows="3" 
              placeholder="อธิบายจุดประสงค์ กิจกรรม หรือหัวข้อการพูดคุยของชุมชนนี้..."
            ></textarea>
          </div>

          <!-- Visual Assets: Avatar & Banner -->
          <div class="assets-upload-grid">
            
            <!-- Avatar Card -->
            <div class="asset-card">
              <label class="form-label">รูปภาพหลัก (Avatar)</label>
              <div class="avatar-preview-box">
                <div class="avatar-img-wrap" :style="!formGeneral.avatar_url ? { background: formGeneral.bg_color || '#6366f1' } : {}">
                  <img v-if="formGeneral.avatar_url" :src="formGeneral.avatar_url" alt="avatar" />
                  <span v-else class="avatar-placeholder-emoji">{{ community?.icon || '🚀' }}</span>
                </div>
                <div class="avatar-upload-info">
                  <button @click="triggerAvatarUpload" class="btn-upload-pill">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                    <span>{{ formGeneral.avatar_url ? 'เปลี่ยนรูปหลัก' : 'อัปโหลดรูป' }}</span>
                  </button>
                  <span class="file-hint">แนะนำขนาดสี่เหลี่ยมจัตุรัส 500x500px</span>
                </div>
                <input ref="avatarInputRef" type="file" accept="image/*" style="display: none;" @change="handleAvatarSelected" />
              </div>
            </div>

            <!-- Banner Card -->
            <div class="asset-card banner-flex">
              <label class="form-label">ภาพหน้าปก (Cover Banner)</label>
              <div class="banner-preview-box">
                <div class="banner-img-wrap">
                  <img 
                    v-if="formGeneral.banner_url" 
                    :src="formGeneral.banner_url" 
                    :style="`object-position: center ${formGeneral.banner_position_y}%;`" 
                  />
                  <div v-else class="banner-fallback-gradient" :style="`background: linear-gradient(135deg, ${formGeneral.bg_color} 0%, #0f172a 100%);`"></div>
                </div>
                <div class="banner-upload-info">
                  <button @click="triggerBannerUpload" class="btn-upload-pill">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                    <span>{{ formGeneral.banner_url ? 'เปลี่ยนหน้าปก' : 'อัปโหลดหน้าปก' }}</span>
                  </button>
                  <span class="file-hint">แนะนำสัดส่วนแนวนอนความละเอียดสูง (1200x400px)</span>
                </div>
                <input ref="bannerInputRef" type="file" accept="image/*" style="display: none;" @change="handleBannerSelected" />
              </div>
            </div>

          </div>

          <!-- Theme Colors -->
          <div class="form-group">
            <label class="form-label">สีธีมหลักของชุมชน (Theme Color)</label>
            <div class="theme-colors-palette">
              <button 
                v-for="color in themeColors" 
                :key="color"
                @click="formGeneral.bg_color = color"
                type="button"
                class="color-dot"
                :class="{ active: formGeneral.bg_color === color }"
                :style="`background: ${color};`"
              >
                <svg v-if="formGeneral.bg_color === color" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </button>
            </div>
          </div>

          <!-- Submit Button -->
          <div class="form-actions-footer">
            <button @click="saveGeneral" class="btn-action-primary" :disabled="saving">
              <span v-if="saving">กำลังบันทึก...</span>
              <span v-else style="display: inline-flex; align-items: center; gap: 6px;">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
                <span>บันทึกข้อมูล</span>
              </span>
            </button>
          </div>

        </div>
      </div>

      <!-- TAB 2: กฎกติกา (RULES) -->
      <div v-if="!loading && activeTab === 'rules'" class="settings-content-card">
        <div class="card-section-header">
          <div class="section-icon-badge">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
          </div>
          <div>
            <h2>กฎกติกาของชุมชน</h2>
            <p>กำหนดแนวทางการอยู่ร่วมกัน เพื่อให้ทุกคนพูดคุยอย่างปลอดภัยและสร้างสรรค์</p>
          </div>
        </div>

        <div class="rules-management-list">
          <div v-for="(rule, index) in formRules" :key="index" class="rule-edit-row">
            <div class="rule-edit-num">{{ index + 1 }}</div>
            <input 
              v-model="formRules[index]" 
              type="text" 
              placeholder="ระบุข้อกำหนด เช่น เคารพความคิดเห็นซึ่งกันและกัน..." 
              class="form-input" 
            />
            <button @click="formRules.splice(index, 1)" class="btn-delete-rule" title="ลบกฎข้อนี้">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
              </svg>
              <span>ลบ</span>
            </button>
          </div>

          <button @click="formRules.push('')" class="btn-add-rule-dashed">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            <span>เพิ่มกฎข้อใหม่</span>
          </button>
        </div>

        <div class="form-actions-footer">
          <button @click="saveRules" class="btn-action-primary" :disabled="saving">
            <span v-if="saving">กำลังบันทึก...</span>
            <span v-else style="display: inline-flex; align-items: center; gap: 6px;">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
              <span>บันทึกกฎกติกา</span>
            </span>
          </button>
        </div>
      </div>

      <!-- TAB 3: ความเป็นส่วนตัว (PRIVACY & INVITE LINKS) -->
      <div v-if="!loading && activeTab === 'privacy'" class="settings-content-card">
        <div class="card-section-header">
          <div class="section-icon-badge">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          </div>
          <div>
            <h2>การตั้งค่าความเป็นส่วนตัว & ลิงก์เชิญ</h2>
            <p>ควบคุมการมองเห็น การเข้าถึง และสร้างลิงก์เชิญเข้าร่วมกลุ่มแบบกำหนดเวลาหมดอายุ</p>
          </div>
        </div>

        <div class="privacy-switches-stack">
          <!-- Switch 1: Private Community -->
          <div class="privacy-switch-card">
            <div class="privacy-info-col">
              <div class="privacy-title-row">
                <span class="privacy-status-dot" :class="{ private: community?.is_private }"></span>
                <h3 class="privacy-title">ชุมชนแบบปิด (Private Community)</h3>
              </div>
              <p class="privacy-desc">
                เมื่อเปิดใช้งาน ผู้ใช้ใหม่ที่กดเข้าร่วมจะต้องได้รับการอนุมัติจากผู้ดูแลก่อน จึงจะสามารถมองเห็นโพสต์และมีส่วนร่วมในชุมชนได้
              </p>
            </div>

            <label class="ios-switch">
              <input type="checkbox" :checked="community?.is_private" @change="togglePrivate">
              <span class="switch-slider"></span>
            </label>
          </div>

          <!-- Switch 2: Hidden Community -->
          <div class="privacy-switch-card">
            <div class="privacy-info-col">
              <div class="privacy-title-row">
                <span class="privacy-status-dot hidden-dot" :class="{ active: community?.is_hidden }"></span>
                <h3 class="privacy-title">ซ่อนชุมชน (Hidden Community)</h3>
              </div>
              <p class="privacy-desc">
                เมื่อเปิดใช้งาน ชุมชนนี้จะไม่ปรากฏบนหน้ารวมชุมชน การค้นหา หรือกระดานจัดอันดับ ผู้ใช้ภายนอกจะสามารถเข้าถึงได้ผ่าน <strong>ลิงก์เชิญ (Invite Link)</strong> เท่านั้น
              </p>
            </div>

            <label class="ios-switch purple-switch">
              <input type="checkbox" :checked="community?.is_hidden" @change="toggleHidden">
              <span class="switch-slider"></span>
            </label>
          </div>

          <!-- Switch 3: Unified Community-Only & Members-Only Home Feed Combo Card -->
          <div class="privacy-switch-card unified-feed-card" :class="{ 'is-active': community?.is_community_only_feed }">
            <div class="privacy-info-col">
              <div class="privacy-title-row">
                <span class="privacy-status-dot" :class="community?.is_community_only_feed ? 'lock-dot active' : 'public-dot'"></span>
                <h3 class="privacy-title">โพสต์เฉพาะในกลุ่มเท่านั้น (Community-Only Feed)</h3>
                <span class="feed-badge-pill" :class="!community?.is_community_only_feed ? 'badge-public' : (community?.members_only_feed ? 'badge-combo' : 'badge-hidden')">
                  {{ !community?.is_community_only_feed ? '🌐 สาธารณะ' : (community?.members_only_feed ? '👥 สมาชิกเห็นหน้าแรก' : '🔒 ซ่อนจากหน้าแรก 100%') }}
                </span>
              </div>
              <p class="privacy-desc">
                <template v-if="!community?.is_community_only_feed">
                  <strong>โหมดสาธารณะ:</strong> ทุกคนรวมถึงคนที่ไม่ได้เข้ากลุ่มจะสามารถเห็นโพสต์จากกลุ่มนี้บนหน้าแรก (Home Feed) ได้ตามปกติ
                </template>
                <template v-else-if="community?.members_only_feed">
                  <strong>โหมดจำกัดเฉพาะสมาชิก:</strong> คนที่ไม่ได้เข้ากลุ่ม<strong>จะไม่เห็นโพสต์บนหน้าแรก</strong> ส่วนคนที่เข้าร่วมกลุ่มแล้ว<strong>จะเห็นโพสต์บนหน้าแรกได้</strong>
                </template>
                <template v-else>
                  <strong>โหมดซ่อนจากหน้าแรก 100%:</strong> ทั้งสมาชิกและคนนอกกลุ่ม<strong>จะไม่เห็นโพสต์บนหน้าแรก</strong> ทุกคนต้องกดเข้ามาดูภายในหน้ากลุ่มเท่านั้น
                </template>
              </p>

              <!-- Nested Combo Switch: แสดงเมื่อเปิดสวิตช์หลัก -->
              <transition name="tray-slide">
                <div v-if="community?.is_community_only_feed" class="nested-combo-card">
                  <div class="combo-icon-aura">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                    </svg>
                  </div>
                  <div class="combo-info-wrap">
                    <div class="combo-title-row">
                      <span class="combo-badge-tag">⚡ ตัวเลือกคอมโบ</span>
                      <h4 class="combo-title">แสดงบนหน้าแรกเฉพาะสมาชิกในกลุ่ม</h4>
                    </div>
                    <p class="combo-desc">
                      {{ community?.members_only_feed 
                        ? '✅ สมาชิกที่เข้าร่วมกลุ่มแล้วจะเห็นโพสต์บนหน้าแรกได้ (คนนอกกลุ่มจะไม่เห็น)' 
                        : '❌ ปิดไว้: สมาชิกจะไม่เห็นโพสต์บนหน้าแรก (ต้องเข้ามาดูในหน้ากลุ่มเท่านั้น)' 
                      }}
                    </p>
                  </div>
                  <label class="ios-switch cyan-switch mini-switch">
                    <input type="checkbox" :checked="community?.members_only_feed !== false" @change="toggleMembersOnlyFeed">
                    <span class="switch-slider"></span>
                  </label>
                </div>
              </transition>
            </div>

            <!-- Main Toggle Switch -->
            <label class="ios-switch cyan-switch">
              <input type="checkbox" :checked="community?.is_community_only_feed" @change="toggleCommunityOnlyFeed">
              <span class="switch-slider"></span>
            </label>
          </div>
        </div>

        <!-- ══════════════════════════════════════════
             INVITE LINK GENERATOR & LIST SECTION
        ══════════════════════════════════════════ -->
        <div class="invite-section-box">
          <div class="invite-section-header">
            <div class="invite-header-title">
              <div class="invite-icon-pill">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
              </div>
              <div>
                <h3>สร้างและจัดการลิงก์เชิญ (Invite Links)</h3>
                <p>สร้างลิงก์สำหรับส่งต่อให้เพื่อนเข้าร่วมกลุ่มโดยตรง กำหนดอายุลิงก์เพื่อความปลอดภัย</p>
              </div>
            </div>
            <span class="invite-count-badge">{{ invites.length }} ลิงก์ที่สร้างไว้</span>
          </div>

          <!-- Invite Config Controls -->
          <div class="invite-controls-card">
            <div class="invite-field-group">
              <label>อายุของลิงก์ (วันหมดอายุ):</label>
              <select v-model="inviteDuration" class="invite-select-input">
                <option value="30m">30 นาที (30 Minutes)</option>
                <option value="1h">1 ชั่วโมง (1 Hour)</option>
                <option value="24h">24 ชั่วโมง (1 Day)</option>
                <option value="7d">7 วัน (7 Days)</option>
                <option value="never">ไม่มีวันหมดอายุ (Never Expire)</option>
              </select>
            </div>

            <div class="invite-field-group">
              <label>จำกัดจำนวนคนเข้า:</label>
              <select v-model="inviteMaxUses" class="invite-select-input">
                <option :value="null">ไม่จำกัดจำนวนคน</option>
                <option :value="1">1 คน (ใช้ได้ครั้งเดียว)</option>
                <option :value="5">5 คน</option>
                <option :value="10">10 คน</option>
                <option :value="50">50 คน</option>
                <option :value="100">100 คน</option>
              </select>
            </div>

            <button
              @click="createInvite"
              class="btn-create-invite"
              :disabled="creatingInvite"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              <span>{{ creatingInvite ? 'กำลังสร้าง...' : 'สร้างลิงก์เชิญ' }}</span>
            </button>
          </div>

          <!-- Active Invites List -->
          <div v-if="invites.length > 0" class="invites-list-table-wrap">
            <div class="invites-list-header">รายการลิงก์เชิญ:</div>
            
            <div v-for="inv in invites" :key="inv.id" class="invite-row-card" :class="{ 'expired-row': inv.is_expired || inv.is_maxed }">
              <div class="invite-info-block">
                <div class="invite-url-box">
                  <span class="invite-url-text">{{ getInviteUrl(inv.code) }}</span>
                  <button @click="copyInviteLink(inv.code)" class="btn-copy-mini" title="คัดลอกลิงก์">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                    <span>คัดลอก</span>
                  </button>
                </div>

                <div class="invite-meta-badges">
                  <!-- Expiry Badge -->
                  <span v-if="inv.is_expired" class="status-chip expired">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                    หมดอายุแล้ว
                  </span>
                  <span v-else-if="inv.expires_at" class="status-chip active-timer">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 14 14"/></svg>
                    หมดอายุ: {{ formatExpiresAt(inv.expires_at) }}
                  </span>
                  <span v-else class="status-chip forever">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
                    ไม่มีวันหมดอายุ
                  </span>

                  <!-- Usage Badge -->
                  <span class="status-chip usage" :class="{ maxed: inv.is_maxed }">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                    ใช้แล้ว {{ inv.use_count }}{{ inv.max_uses ? ` / ${inv.max_uses}` : '' }} คน
                  </span>
                </div>
              </div>

              <button @click="deleteInvite(inv.id, inv.code)" class="btn-delete-invite" title="ยกเลิกลิงก์นี้">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                <span>ยกเลิกลิงก์</span>
              </button>
            </div>
          </div>

          <div v-else class="empty-invites-hint">
            ยังไม่มีลิงก์เชิญที่ถูกสร้าง สามารถเลือกอายุลิงก์แล้วกด <strong>"สร้างลิงก์เชิญ"</strong> ด้านบนเพื่อแชร์ได้เลย
          </div>
        </div>

      </div>

      <!-- TAB 4: สมาชิก (MEMBERS) -->
      <div v-if="!loading && activeTab === 'members'" class="settings-content-card no-padding">
        <div class="table-header-box">
          <div class="card-section-header">
            <div class="section-icon-badge">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            </div>
            <div>
              <h2>รายชื่อสมาชิก ({{ members.length }} คน)</h2>
              <p>จัดการสิทธิ์ บทบาท และการเข้าถึงของสมาชิกในกลุ่ม</p>
            </div>
          </div>
        </div>

        <div class="table-responsive-wrap">
          <table class="settings-table">
            <thead>
              <tr>
                <th>สมาชิก</th>
                <th>บทบาท</th>
                <th style="text-align: right;">การจัดการ</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="m in members" :key="m.user_id">
                <td>
                  <div class="member-cell">
                    <div class="member-avatar-box">
                      <img v-if="m.avatar_url" :src="m.avatar_url" class="member-avatar" />
                      <div v-else class="member-avatar-fallback">
                        {{ (m.display_name || m.username || 'U').slice(0, 1).toUpperCase() }}
                      </div>
                    </div>
                    <div>
                      <div class="member-name">{{ m.display_name }}</div>
                      <div class="member-handle">@{{ m.username }}</div>
                    </div>
                  </div>
                </td>

                <td>
                  <span 
                    class="role-badge-pill"
                    :class="{
                      'owner': m.role === 'owner',
                      'mod': m.role === 'moderator',
                      'member': m.role === 'member'
                    }"
                  >
                    <span v-if="m.role === 'owner'">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2.5" style="display:inline-block; vertical-align:middle; margin-right:3px;"><path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14"/></svg>
                      ผู้สร้างกลุ่ม (Owner)
                    </span>
                    <span v-else-if="m.role === 'moderator'">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#0ea5e9" stroke-width="2.5" style="display:inline-block; vertical-align:middle; margin-right:3px;"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>
                      ผู้ดูแล (Mod)
                    </span>
                    <span v-else>
                      สมาชิก
                    </span>
                  </span>
                </td>

                <td style="text-align: right;">
                  <div class="table-actions-row" v-if="m.role !== 'owner'">
                    <button 
                      v-if="m.role === 'member' && (community?.user_role === 'owner' || user?.role === 'admin')" 
                      @click="updateRole(m.user_id, 'moderator')" 
                      class="btn-table-action purple"
                    >
                      แต่งตั้ง Mod
                    </button>
                    <button 
                      v-if="m.role === 'moderator' && (community?.user_role === 'owner' || user?.role === 'admin')" 
                      @click="updateRole(m.user_id, 'member')" 
                      class="btn-table-action outline"
                    >
                      ปลด Mod
                    </button>
                    <button 
                      v-if="(community?.user_role === 'owner' || user?.role === 'admin') || (community?.user_role === 'moderator' && m.role === 'member')"
                      @click="kickMember(m.user_id, m.display_name || m.username)" 
                      class="btn-table-action rose"
                    >
                      เตะออก
                    </button>
                    <button 
                      v-if="(community?.user_role === 'owner' || user?.role === 'admin') || (community?.user_role === 'moderator' && m.role === 'member')"
                      @click="banMember(m.user_id, m.display_name || m.username)" 
                      class="btn-table-action red"
                    >
                      แบน
                    </button>
                  </div>
                  <span v-else class="owner-immutable-tag">สิทธิ์สูงสุด</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- TAB 5: คำขอเข้าร่วม (PENDING REQUESTS) -->
      <div v-if="!loading && activeTab === 'requests'" class="settings-content-card no-padding">
        <div class="table-header-box">
          <div class="card-section-header">
            <div class="section-icon-badge">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 14 14"/></svg>
            </div>
            <div>
              <h2>คำขอเข้าร่วมชุมชน ({{ pendingRequests.length }} รายการ)</h2>
              <p>ตรวจสอบและอนุมัติผู้ใช้ที่ต้องการเข้าร่วมกลุ่มของคุณ</p>
            </div>
          </div>
        </div>

        <div class="table-responsive-wrap">
          <table class="settings-table">
            <thead>
              <tr>
                <th>ผู้ยื่นคำขอ</th>
                <th>วันที่ขอเข้าร่วม</th>
                <th style="text-align: right;">การจัดการ</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="pendingRequests.length === 0">
                <td colspan="3">
                  <div class="empty-table-state">
                    <div class="state-icon-circle">
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                        <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 14 14"/>
                      </svg>
                    </div>
                    <h3>ไม่มีคำขอเข้าร่วมที่รอดำเนินการ</h3>
                    <p>เมื่อมีผู้ใช้ขอยื่นเข้าร่วมกลุ่ม รายชื่อจะแสดงขึ้นที่นี่</p>
                  </div>
                </td>
              </tr>
              <tr v-for="r in pendingRequests" :key="r.id">
                <td>
                  <div class="member-cell">
                    <div class="member-avatar-box">
                      <img v-if="r.avatar_url" :src="r.avatar_url" class="member-avatar" />
                      <div v-else class="member-avatar-fallback">
                        {{ (r.display_name || r.username || 'U').slice(0, 1).toUpperCase() }}
                      </div>
                    </div>
                    <div>
                      <div class="member-name">{{ r.display_name }}</div>
                      <div class="member-handle">@{{ r.username }}</div>
                    </div>
                  </div>
                </td>

                <td class="timestamp-cell">
                  {{ new Date(r.joined_at).toLocaleString('th-TH') }}
                </td>

                <td style="text-align: right;">
                  <div class="table-actions-row">
                    <button @click="handleRequest(r.user_id, 'approve')" class="btn-table-action emerald">
                      ✓ อนุมัติ
                    </button>
                    <button @click="handleRequest(r.user_id, 'reject')" class="btn-table-action rose">
                      ✕ ปฏิเสธ
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- TAB 6: รายงาน (REPORTS) -->
      <div v-if="!loading && activeTab === 'reports'" class="settings-content-card no-padding">
        <div class="table-header-box">
          <div class="card-section-header">
            <div class="section-icon-badge">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>
            </div>
            <div>
              <h2>รายงานภายในกลุ่ม ({{ reports.length }} รายการ)</h2>
              <p>ดูแลและจัดการเนื้อหาที่มีการรายงานจากสมาชิกในชุมชน</p>
            </div>
          </div>
        </div>

        <div class="table-responsive-wrap">
          <table class="settings-table">
            <thead>
              <tr>
                <th>ผู้รายงาน / วันที่</th>
                <th>เป้าหมาย</th>
                <th>เหตุผลการรายงาน</th>
                <th style="text-align: right;">การจัดการ</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="reports.length === 0">
                <td colspan="4">
                  <div class="empty-table-state">
                    <div class="state-icon-circle glowing">
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                        <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path>
                        <line x1="4" y1="22" x2="4" y2="15"></line>
                      </svg>
                    </div>
                    <h3>ไม่มีรายงานที่รอดำเนินการ</h3>
                    <p>กลุ่มของคุณสะอาดและเรียบร้อยดีมาก!</p>
                  </div>
                </td>
              </tr>
              <tr v-for="r in reports" :key="r.id">
                <td>
                  <div class="report-user-cell">
                    <div class="member-cell">
                      <img :src="r.reporter_avatar || '/default-avatar.svg'" class="member-avatar small" />
                      <span class="member-handle">@{{ r.reporter_username }}</span>
                    </div>
                    <span class="report-date-tag">{{ new Date(r.created_at).toLocaleDateString('th-TH') }}</span>
                  </div>
                </td>

                <td>
                  <div class="report-target-box">
                    <div class="member-cell">
                      <img :src="r.reported_avatar || '/default-avatar.svg'" class="member-avatar small" />
                      <span class="member-name">@{{ r.reported_username }}</span>
                    </div>
                    <span 
                      class="target-type-tag"
                      :class="r.target_type"
                    >
                      {{ r.target_type === 'post' ? 'โพสต์' : 'คอมเมนต์' }}
                    </span>
                  </div>
                </td>

                <td>
                  <div class="report-reason-box">
                    <strong class="reason-title">{{ r.reason }}</strong>
                    <p v-if="r.description" class="reason-desc">{{ r.description }}</p>
                  </div>
                </td>

                <td style="text-align: right;">
                  <div class="report-actions-col">
                    <button v-if="r.status === 'pending'" @click="resolveReport(r.id)" class="btn-table-action emerald">
                      ทำเครื่องหมายว่าจัดการแล้ว
                    </button>
                    <span v-else class="status-resolved-tag">จัดการแล้ว</span>

                    <button v-if="!r.is_escalated && r.status === 'pending'" @click="escalateReport(r.id)" class="btn-table-action amber">
                      ส่งต่อให้แอดมินระบบ
                    </button>
                    <span v-else-if="r.is_escalated" class="status-escalated-tag">ส่งให้ระบบแล้ว</span>
                    
                    <button v-if="r.target_type === 'post' && r.reported_post_id" @click="deletePost(r.reported_post_id)" class="btn-table-action red">
                      ลบโพสต์
                    </button>
                    <button v-if="r.target_type === 'comment' && r.reported_comment_id" @click="deleteComment(r.reported_comment_id)" class="btn-table-action red">
                      ลบคอมเมนต์
                    </button>
                    <button @click="kickMember(r.reported_user_id)" class="btn-table-action rose">
                      เตะผู้ถูกรายงาน
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- TAB 7: DANGER ZONE (DELETE COMMUNITY) - OWNER ONLY -->
      <div v-if="!loading && activeTab === 'danger' && community?.user_role === 'owner'" class="settings-content-card danger-card">
        <div class="card-section-header">
          <div class="section-icon-badge danger">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
          </div>
          <div>
            <h2 style="color: #f43f5e;">โซนอันตราย (Danger Zone)</h2>
            <p>การจัดการขั้นเด็ดขาดและลบชุมชนนี้อย่างถาวร</p>
          </div>
        </div>

        <div class="danger-zone-box">
          <div class="danger-info-wrap">
            <div class="danger-badge-icon">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                <line x1="10" y1="11" x2="10" y2="17"></line>
                <line x1="14" y1="11" x2="14" y2="17"></line>
              </svg>
            </div>
            <div class="danger-text-col">
              <h3 class="danger-action-title">ลบชุมชนนี้อย่างถาวร (Delete Community)</h3>
              <p class="danger-action-desc">
                เมื่อลบชุมชน <strong>"{{ community?.name }}"</strong> แล้ว ข้อมูลทั้งหมดรวมถึง โพสต์, คอมเมนต์, สมาชิก, แชทกลุ่ม และรูปภาพ จะถูกลบออกจากระบบทันทีอย่างถาวร และ<strong>ไม่สามารถกู้คืนได้</strong>
              </p>
            </div>
          </div>
          <div class="danger-btn-wrap">
            <button @click="openDeleteModal" class="btn-delete-community-trigger">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
              <span>ลบชุมชนนี้</span>
            </button>
          </div>
        </div>
      </div>

    </div>

    <!-- MODAL: DELETE COMMUNITY CONFIRMATION -->
    <Teleport to="body" v-if="isMounted && showDeleteModal">
      <div
        class="nexus-modal-overlay"
        @click.self="closeDeleteModal"
      >
        <div class="nexus-delete-modal-card">
          <div class="delete-modal-header">
            <div class="delete-warning-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2.5">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                <line x1="12" y1="9" x2="12" y2="13"/>
                <line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
            </div>
            <div>
              <h3 class="delete-modal-title">ยืนยันการลบชุมชนถาวร</h3>
              <p class="delete-modal-sub">การดำเนินการนี้มีผลทันทีและไม่สามารถย้อนกลับได้</p>
            </div>
            <button @click="closeDeleteModal" class="close-preview-btn" style="margin-left: auto;">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>

          <div class="delete-modal-body">
            <div class="delete-summary-box">
              <p>คุณกำลังจะลบชุมชน <strong>"{{ community?.name }}"</strong></p>
              <ul>
                <li>• โพสต์และคอมเมนต์ทั้งหมดในกลุ่มนี้จะถูกลบทันที</li>
                <li>• ประวัติการสนทนาและสมาชิกทั้งหมดจะถูกยกเลิก</li>
                <li>• เฉพาะคุณในฐานะผู้สร้างกลุ่ม (Owner) เท่านั้นที่ทำรายการนี้ได้</li>
              </ul>
            </div>

            <div class="delete-input-group">
              <label class="form-label">พิมพ์ชื่อชุมชน <code>{{ community?.name }}</code> หรือคำว่า <code>delete</code> เพื่อยืนยัน:</label>
              <input
                v-model="deleteConfirmText"
                type="text"
                class="form-input delete-confirm-input"
                :placeholder="community?.name"
                autocomplete="off"
              />
            </div>
          </div>

          <div class="delete-modal-footer">
            <button @click="closeDeleteModal" class="btn-pill-glass" :disabled="deletingCommunity">
              ยกเลิก
            </button>
            <button
              @click="confirmDeleteCommunity"
              :disabled="deletingCommunity || (deleteConfirmText.trim() !== community?.name && deleteConfirmText.trim().toLowerCase() !== 'delete')"
              class="btn-action-danger-confirm"
            >
              <span v-if="deletingCommunity">กำลังลบชุมชน...</span>
              <span v-else>ยืนยันการลบชุมชนถาวร</span>
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- MODAL: IMAGE UPLOAD & POSITION SLIDER -->
    <Teleport to="body" v-if="isMounted && imagePreview.show">
      <div
        class="nexus-modal-overlay"
        @click.self="cancelImagePreview"
      >
        <div class="image-preview-modal-card">
          <!-- Header -->
          <div class="preview-modal-header">
            <h3>{{ imagePreview.type === 'banner' ? 'ตั้งค่าภาพหน้าปก' : 'ตั้งค่ารูปโปรไฟล์' }}</h3>
            <button @click="cancelImagePreview" class="close-preview-btn">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>

          <!-- Preview Stage -->
          <div 
            class="preview-stage-wrap"
            :class="imagePreview.type"
          >
            <img
              v-if="imagePreview.type === 'banner'"
              :src="imagePreview.dataUrl"
              alt="preview"
              class="banner-preview-img"
              :style="`object-position: center ${imagePreview.positionY}%;`"
            />
            <div v-else class="avatar-preview-circle-stage">
              <div 
                class="avatar-circle-view"
                :style="`background: url(${imagePreview.dataUrl}) center ${imagePreview.positionY}%/cover no-repeat;`" 
              />
              <p class="avatar-preview-tip">ลากตัวเลื่อนเพื่อปรับตำแหน่งรูปภาพ</p>
            </div>
          </div>

          <!-- Slider Controls -->
          <div class="preview-controls-bar">
            <div class="slider-control-row">
              <span class="slider-label">ปรับตำแหน่งภาพ:</span>
              <input
                type="range"
                min="0"
                max="100"
                step="2"
                v-model="imagePreview.positionY"
                class="custom-slider"
              />
              <span class="slider-val">{{ imagePreview.positionY }}%</span>
            </div>

            <!-- Confirm Buttons -->
            <div class="preview-footer-buttons">
              <button @click="cancelImagePreview" class="btn-pill-glass">ยกเลิก</button>
              <button @click="confirmImageUpload" :disabled="imagePreview.uploading" class="btn-action-primary">
                {{ imagePreview.uploading ? 'กำลังบันทึก...' : 'ยืนยันการอัปโหลด' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- ══════════════════════════════════════════
         CYBERPUNK GLASS CONFIRMATION MODAL
    ══════════════════════════════════════════ -->
    <Teleport to="body" v-if="isMounted && confirmDialog.show">
      <div
        class="nexus-modal-overlay"
        @click.self="confirmDialog.show = false"
      >
        <div class="nexus-confirm-modal-card">
          <!-- Glow Header Icon -->
          <div class="confirm-icon-aura" :class="confirmDialog.danger ? 'danger' : 'amber'">
            <!-- Link Revoke Icon -->
            <svg v-if="confirmDialog.icon === 'link'" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
              <line x1="2" y1="2" x2="22" y2="22" stroke="#ef4444" stroke-width="2.5"/>
            </svg>
            <!-- User-minus Icon -->
            <svg v-else-if="confirmDialog.icon === 'user-minus'" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
              <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="8.5" cy="7" r="4"/>
              <line x1="18" y1="11" x2="23" y2="11"/>
            </svg>
            <!-- Ban Icon -->
            <svg v-else-if="confirmDialog.icon === 'ban'" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
            </svg>
            <!-- Alert Icon -->
            <svg v-else-if="confirmDialog.icon === 'alert'" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
            <!-- Default Trash Icon -->
            <svg v-else width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
              <line x1="10" y1="11" x2="10" y2="17"/>
              <line x1="14" y1="11" x2="14" y2="17"/>
            </svg>
          </div>

          <!-- Title & Message -->
          <h3 class="confirm-modal-title">{{ confirmDialog.title }}</h3>
          <p class="confirm-modal-msg">{{ confirmDialog.message }}</p>
          <p v-if="confirmDialog.submessage" class="confirm-modal-submsg">{{ confirmDialog.submessage }}</p>

          <!-- Action Buttons -->
          <div class="confirm-modal-actions">
            <button
              type="button"
              @click="confirmDialog.show = false"
              class="btn-confirm-cancel"
              :disabled="confirmDialog.loading"
            >
              {{ confirmDialog.cancelText }}
            </button>
            <button
              type="button"
              @click="handleConfirmAction"
              class="btn-confirm-execute"
              :class="confirmDialog.danger ? 'danger-btn' : 'amber-btn'"
              :disabled="confirmDialog.loading"
            >
              <span v-if="confirmDialog.loading" class="spinner-mini"></span>
              <span>{{ confirmDialog.loading ? 'กำลังดำเนินการ...' : confirmDialog.confirmText }}</span>
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- ══════════════════════════════════════════
         TOAST ALERT
    ══════════════════════════════════════════ -->
    <div 
      class="settings-toast-banner"
      :class="[toast.type, { show: toast.show }]"
    >
      <div class="toast-icon-circle">
        <span v-if="toast.type === 'success'">✓</span>
        <span v-else>!</span>
      </div>
      <div class="toast-text">{{ toast.message }}</div>
    </div>

  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'default',
  middleware: ['auth']
})

const { user } = useAuth()
const route = useRoute()
const slug = route.params.slug as string
const activeTab = ref('general')

const { data } = await useFetch(`/api/communities/${slug}`)
const community = computed(() => data.value?.community)

useHead({
  title: computed(() => community.value?.name ? `ตั้งค่า ${community.value.name} — ConnecXus` : 'ตั้งค่าชุมชน — ConnecXus')
})

const availableTabs = computed(() => {
  const list = [
    { id: 'general', label: 'ข้อมูลทั่วไป' },
    { id: 'rules', label: 'กฎกติกา' },
    { id: 'privacy', label: 'ความเป็นส่วนตัว' },
    { id: 'members', label: 'สมาชิก' },
    { id: 'requests', label: 'คำขอเข้าร่วม' },
    { id: 'reports', label: 'รายงาน' }
  ]
  if (community.value?.user_role === 'owner') {
    list.push({ id: 'danger', label: 'โซนอันตราย' })
  }
  return list
})

const loading = ref(true)
const saving = ref(false)
const members = ref<any[]>([])
const pendingRequests = ref<any[]>([])
const reports = ref<any[]>([])

// Delete Community States
const showDeleteModal = ref(false)
const deleteConfirmText = ref('')
const deletingCommunity = ref(false)

// Custom Cyberpunk Confirmation Dialog State
const confirmDialog = ref<{
  show: boolean
  title: string
  message: string
  submessage: string
  icon: 'trash' | 'user-minus' | 'ban' | 'alert' | 'link'
  confirmText: string
  cancelText: string
  danger: boolean
  loading: boolean
  action?: () => Promise<void> | void
}>({
  show: false,
  title: '',
  message: '',
  submessage: '',
  icon: 'trash',
  confirmText: 'ยืนยัน',
  cancelText: 'ยกเลิก',
  danger: true,
  loading: false
})

function openConfirm(options: {
  title: string
  message: string
  submessage?: string
  icon?: 'trash' | 'user-minus' | 'ban' | 'alert' | 'link'
  confirmText?: string
  cancelText?: string
  danger?: boolean
  action: () => Promise<void> | void
}) {
  confirmDialog.value = {
    show: true,
    title: options.title,
    message: options.message,
    submessage: options.submessage || '',
    icon: options.icon || 'trash',
    confirmText: options.confirmText || 'ยืนยัน',
    cancelText: options.cancelText || 'ยกเลิก',
    danger: options.danger !== false,
    loading: false,
    action: options.action
  }
}

async function handleConfirmAction() {
  if (confirmDialog.value.action) {
    confirmDialog.value.loading = true
    try {
      await confirmDialog.value.action()
      confirmDialog.value.show = false
    } catch (err: any) {
      showToast(err.data?.message || 'เกิดข้อผิดพลาดในการทำรายการ', 'error')
    } finally {
      confirmDialog.value.loading = false
    }
  } else {
    confirmDialog.value.show = false
  }
}

function openDeleteModal() {
  deleteConfirmText.value = ''
  showDeleteModal.value = true
}

function closeDeleteModal() {
  if (deletingCommunity.value) return
  showDeleteModal.value = false
  deleteConfirmText.value = ''
}

async function confirmDeleteCommunity() {
  if (community.value?.user_role !== 'owner') {
    showToast('เฉพาะผู้สร้างกลุ่ม (Owner) เท่านั้นที่มีสิทธิ์ลบชุมชน', 'error')
    return
  }

  deletingCommunity.value = true
  try {
    const res: any = await $fetch(`/api/communities/${slug}`, {
      method: 'DELETE'
    })
    showToast(res?.message || 'ลบชุมชนเรียบร้อยแล้ว', 'success')
    showDeleteModal.value = false
    clearNuxtData()
    setTimeout(() => {
      navigateTo('/community')
    }, 1000)
  } catch (err: any) {
    showToast(err.data?.message || 'เกิดข้อผิดพลาดในการลบชุมชน', 'error')
  } finally {
    deletingCommunity.value = false
  }
}

// Form states
const toast = reactive({
  show: false,
  message: '',
  type: 'success' as 'success' | 'error'
})

function showToast(message: string, type: 'success' | 'error' = 'success') {
  toast.message = message
  toast.type = type
  toast.show = true
  setTimeout(() => {
    toast.show = false
  }, 3000)
}

const formGeneral = reactive({
  name: '',
  description: '',
  bg_color: '#8b5cf6',
  avatar_url: '' as string | null,
  banner_url: '' as string | null,
  banner_position_y: 50
})
const formRules = ref<string[]>([])

const avatarInputRef = ref<HTMLInputElement | null>(null)
const bannerInputRef = ref<HTMLInputElement | null>(null)

function triggerAvatarUpload() {
  avatarInputRef.value?.click()
}
function triggerBannerUpload() {
  bannerInputRef.value?.click()
}

const imagePreview = reactive({
  show: false,
  type: 'banner' as 'banner' | 'avatar',
  file: null as File | null,
  dataUrl: '',
  positionY: 50,
  uploading: false,
})

async function uploadFile(file: File) {
  const formData = new FormData()
  formData.append('file', file, file.name)
  try {
    const res: any = await $fetch('/api/upload', {
      method: 'POST',
      body: formData
    })
    return res.url
  } catch (e) {
    showToast('อัปโหลดไฟล์ไม่สำเร็จ', 'error')
    return null
  }
}

function handleAvatarSelected(e: Event) {
  const target = e.target as HTMLInputElement
  if (!target.files || !target.files[0]) return
  const file = target.files[0]
  const reader = new FileReader()
  reader.onload = (ev) => {
    imagePreview.file = file
    imagePreview.dataUrl = ev.target?.result as string
    imagePreview.type = 'avatar'
    imagePreview.positionY = 50
    imagePreview.show = true
  }
  reader.readAsDataURL(file)
  target.value = ''
}

function handleBannerSelected(e: Event) {
  const target = e.target as HTMLInputElement
  if (!target.files || !target.files[0]) return
  const file = target.files[0]
  const reader = new FileReader()
  reader.onload = (ev) => {
    imagePreview.file = file
    imagePreview.dataUrl = ev.target?.result as string
    imagePreview.type = 'banner'
    imagePreview.positionY = 50
    imagePreview.show = true
  }
  reader.readAsDataURL(file)
  target.value = ''
}

function cancelImagePreview() {
  imagePreview.show = false
  imagePreview.file = null
  imagePreview.dataUrl = ''
}

// ── Image Cropping via HTML5 Canvas ──
function cropImage(imgDataUrl: string, type: 'avatar' | 'banner', posY: number, originalFile: File): Promise<File> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      if (!ctx) return reject(new Error('Canvas ctx is null'))
      
      // Avatar: 500x500 (1:1), Banner: 1200x400 (3:1)
      const targetW = type === 'avatar' ? 500 : 1200
      const targetH = type === 'avatar' ? 500 : 400
      
      canvas.width = targetW
      canvas.height = targetH

      // Calculate cover dimensions
      const imgRatio = img.width / img.height
      const targetRatio = targetW / targetH
      
      let drawW: number, drawH: number
      if (imgRatio > targetRatio) {
        drawH = targetH
        drawW = targetH * imgRatio
      } else {
        drawW = targetW
        drawH = targetW / imgRatio
      }
      
      // Calculate max offset
      const maxOffsetX = drawW - targetW
      const maxOffsetY = drawH - targetH
      
      // Horizontal is centered (50%), vertical is user slider (posY %)
      const offsetX = -(maxOffsetX * 0.5)
      const offsetY = -(maxOffsetY * (posY / 100))
      
      const isPng = originalFile.type === 'image/png' || originalFile.type === 'image/webp'
      if (!isPng) {
        ctx.fillStyle = '#0f111a'
        ctx.fillRect(0, 0, targetW, targetH)
      }
      
      ctx.drawImage(img, offsetX, offsetY, drawW, drawH)
      
      const outputMime = isPng ? 'image/png' : 'image/jpeg'
      const outputQuality = isPng ? undefined : 0.95
      
      canvas.toBlob((blob) => {
        if (!blob) return reject(new Error('Blob creation failed'))
        const newFile = new File([blob], originalFile.name, { type: outputMime })
        resolve(newFile)
      }, outputMime, outputQuality)
    }
    img.onerror = (e) => reject(e)
    img.src = imgDataUrl
  })
}

async function confirmImageUpload() {
  if (!imagePreview.file || imagePreview.uploading) return
  imagePreview.uploading = true
  try {
    // 1. Crop image via Canvas based on user's positioning slider
    const croppedFile = await cropImage(
      imagePreview.dataUrl,
      imagePreview.type,
      Number(imagePreview.positionY),
      imagePreview.file
    )
    
    // 2. Upload cropped file
    const url = await uploadFile(croppedFile)
    if (url) {
      if (imagePreview.type === 'banner') {
        formGeneral.banner_url = url
        formGeneral.banner_position_y = 50 // Already cropped to exact user position!
      } else {
        formGeneral.avatar_url = url
      }
      
      // 3. Auto-save to server so changes take effect immediately
      try {
        await $fetch(`/api/communities/${slug}/settings`, {
          method: 'PUT',
          body: { 
            name: formGeneral.name || community.value?.name,
            description: formGeneral.description,
            bg_color: formGeneral.bg_color,
            avatar_url: formGeneral.avatar_url,
            banner_url: formGeneral.banner_url,
            banner_position_y: formGeneral.banner_position_y
          }
        })
        if (community.value) {
          community.value.avatar_url = formGeneral.avatar_url
          community.value.banner_url = formGeneral.banner_url
          community.value.banner_position_y = formGeneral.banner_position_y
        }
        clearNuxtData()
        showToast('อัปโหลดและปรับตำแหน่งรูปภาพสำเร็จ', 'success')
      } catch (saveErr) {
        console.error('Auto save error:', saveErr)
        showToast('อัปโหลดสำเร็จ (กรุณากดปุ่มบันทึกข้อมูลด้านล่าง)', 'success')
      }
    }
    imagePreview.show = false
    imagePreview.file = null
    imagePreview.dataUrl = ''
  } catch (err) {
    console.error('Upload failed:', err)
    showToast('เกิดข้อผิดพลาดในการประมวลผลรูปภาพ', 'error')
  } finally {
    imagePreview.uploading = false
  }
}

const themeColors = [
  '#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', 
  '#ec4899', '#6366f1', '#14b8a6', '#84cc16', '#f97316'
]

const isMounted = ref(false)
const { subscribe, joinRoom, leaveRoom } = useRealtime()
let pollingTimer: any = null
let unsub: any = null

watch(community, (val) => {
  if (val && val.user_role !== 'owner' && val.user_role !== 'moderator' && user.value?.role !== 'admin') {
    navigateTo(`/community/${slug}`)
  }
}, { immediate: true })

onMounted(async () => {
  isMounted.value = true

  if (route.query.tab && typeof route.query.tab === 'string') {
    activeTab.value = route.query.tab
  }

  if (community.value && community.value.user_role !== 'owner' && community.value.user_role !== 'moderator' && user.value?.role !== 'admin') {
    navigateTo(`/community/${slug}`)
    return
  }
  
  if (community.value) {
    formGeneral.name = community.value.name || ''
    formGeneral.description = community.value.description || ''
    formGeneral.bg_color = community.value.bg_color || '#8b5cf6'
    formGeneral.avatar_url = community.value.avatar_url || null
    formGeneral.banner_url = community.value.banner_url || null
    formGeneral.banner_position_y = community.value.banner_position_y ?? 50
    
    if (community.value.rules && Array.isArray(community.value.rules)) {
      formRules.value = [...community.value.rules]
    } else {
      formRules.value = ['เคารพความคิดเห็นซึ่งกันและกัน', 'ห้ามโพสต์เนื้อหาที่ผิดกฎหมาย', 'งดการสแปมข้อความ']
    }
  }

  await Promise.all([
    fetchMembers(),
    fetchRequests(),
    fetchReports(),
    fetchInvites()
  ])
  loading.value = false

  // ── Realtime WebSocket Events ──
  joinRoom(`community-${slug}`)
  joinRoom('global')

  unsub = subscribe((event: any) => {
    // 1. Live join request incoming
    if (event.type === 'community_member_request') {
      if (event.payload?.community_slug === slug || event.payload?.community_id === community.value?.id) {
        fetchRequests()
        showToast('มีคำขอเข้าร่วมกลุ่มใหม่เข้ามา! 🔔', 'info')
      }
    }
    // 2. Live member joined or left or request handled
    if (event.type === 'community_member_joined' || event.type === 'community_member_left' || event.type === 'community_member_request_handled') {
      if (event.payload?.community_slug === slug || event.payload?.community_id === community.value?.id) {
        fetchMembers()
        fetchRequests()
        if (community.value && event.payload?.member_count !== undefined) {
          community.value.member_count = event.payload.member_count
        }
      }
    }
    // 3. Live report
    if (event.type === 'community_report_submitted') {
      if (event.payload?.community_slug === slug || event.payload?.community_id === community.value?.id) {
        fetchReports()
      }
    }
    // 4. Live invite
    if (event.type === 'community_invite_created' || event.type === 'community_invite_deleted') {
      if (event.payload?.community_slug === slug || event.payload?.community_id === community.value?.id) {
        fetchInvites()
      }
    }
  })

  // ── Polling Fallback (Every 5s) for instant sync ──
  pollingTimer = setInterval(() => {
    if (activeTab.value === 'requests') {
      fetchRequests()
    } else if (activeTab.value === 'members') {
      fetchMembers()
    } else if (activeTab.value === 'privacy') {
      fetchInvites()
    }
  }, 5000)
})

onUnmounted(() => {
  if (unsub) unsub()
  leaveRoom(`community-${slug}`)
  leaveRoom('global')
  if (pollingTimer) clearInterval(pollingTimer)
})

watch(activeTab, async (newTab) => {
  if (newTab === 'reports') {
    await fetchReports()
  } else if (newTab === 'requests') {
    await fetchRequests()
  } else if (newTab === 'members') {
    await fetchMembers()
  } else if (newTab === 'privacy') {
    await fetchInvites()
  }
})

async function saveGeneral() {
  saving.value = true
  try {
    await $fetch(`/api/communities/${slug}/settings`, {
      method: 'PUT',
      body: { 
        name: formGeneral.name,
        description: formGeneral.description,
        bg_color: formGeneral.bg_color,
        avatar_url: formGeneral.avatar_url,
        banner_url: formGeneral.banner_url,
        banner_position_y: formGeneral.banner_position_y
      }
    })
    showToast('บันทึกข้อมูลทั่วไปสำเร็จ')
    if (community.value) {
      community.value.name = formGeneral.name
      community.value.description = formGeneral.description
      community.value.bg_color = formGeneral.bg_color
      community.value.avatar_url = formGeneral.avatar_url
      community.value.banner_url = formGeneral.banner_url
      community.value.banner_position_y = formGeneral.banner_position_y
    }
    clearNuxtData()
  } catch (err: any) {
    showToast(err.data?.message || 'เกิดข้อผิดพลาดในการบันทึก', 'error')
  } finally {
    saving.value = false
  }
}

async function saveRules() {
  const cleanRules = formRules.value.map(r => r.trim()).filter(r => r.length > 0)
  saving.value = true
  try {
    await $fetch(`/api/communities/${slug}/settings`, {
      method: 'PUT',
      body: { 
        rules: cleanRules
      }
    })
    showToast('บันทึกกฎกติกาสำเร็จ')
    if (community.value) {
      community.value.rules = cleanRules
    }
    formRules.value = [...cleanRules]
    clearNuxtData()
  } catch (err: any) {
    showToast(err.data?.message || 'เกิดข้อผิดพลาดในการบันทึก', 'error')
  } finally {
    saving.value = false
  }
}

async function fetchMembers() {
  try {
    const res: any = await $fetch(`/api/communities/${slug}/members`)
    members.value = res.members || []
  } catch (err) {
    console.error(err)
  }
}

async function fetchRequests() {
  try {
    const res: any = await $fetch(`/api/communities/${slug}/members/requests`)
    pendingRequests.value = res.requests || []
  } catch (err) {
    console.error(err)
  }
}

async function handleRequest(userId: number, action: 'approve' | 'reject') {
  try {
    await $fetch(`/api/communities/${slug}/members/requests`, {
      method: 'PUT',
      body: { user_id: userId, action }
    })
    await fetchRequests()
    await fetchMembers()
  } catch (err) {
    showToast('เกิดข้อผิดพลาดในการจัดการคำขอ', 'error')
  }
}

async function togglePrivate(e: Event) {
  const isPrivate = (e.target as HTMLInputElement).checked
  try {
    await $fetch(`/api/communities/${slug}/settings`, {
      method: 'PUT',
      body: { is_private: isPrivate }
    })
    if (community.value) {
      community.value.is_private = isPrivate ? 1 : 0
    }
    showToast(`เปลี่ยนเป็น${isPrivate ? 'ชุมชนแบบปิด' : 'ชุมชนสาธารณะ'}เรียบร้อย`)
  } catch (err) {
    showToast('อัปเดตการตั้งค่าไม่สำเร็จ', 'error')
    if (community.value) {
      ;(e.target as HTMLInputElement).checked = !!community.value.is_private
    }
  }
}

async function toggleHidden(e: Event) {
  const isHidden = (e.target as HTMLInputElement).checked
  try {
    await $fetch(`/api/communities/${slug}/settings`, {
      method: 'PUT',
      body: { is_hidden: isHidden }
    })
    if (community.value) {
      community.value.is_hidden = isHidden ? 1 : 0
    }
    showToast(`เปลี่ยนเป็น${isHidden ? 'ซ่อนชุมชน (เข้าได้เฉพาะผ่านลิงก์เชิญ)' : 'แสดงชุมชนสาธารณะ'}เรียบร้อย`)
  } catch (err) {
    showToast('อัปเดตการตั้งค่าไม่สำเร็จ', 'error')
    if (community.value) {
      ;(e.target as HTMLInputElement).checked = !!community.value.is_hidden
    }
  }
}

async function toggleCommunityOnlyFeed(e: Event) {
  const isOnly = (e.target as HTMLInputElement).checked
  try {
    const currentMembersOnly = community.value?.members_only_feed !== false
    await $fetch(`/api/communities/${slug}/settings`, {
      method: 'PUT',
      body: { 
        is_community_only_feed: isOnly,
        members_only_feed: currentMembersOnly
      }
    })
    if (community.value) {
      community.value.is_community_only_feed = isOnly
      community.value.members_only_feed = currentMembersOnly
    }
    showToast(isOnly 
      ? (currentMembersOnly ? 'เปิดใช้งาน: แสดงบนหน้าแรกเฉพาะสมาชิกในกลุ่มเท่านั้น' : 'เปิดใช้งาน: ซ่อนโพสต์จากหน้าแรก 100%') 
      : 'ปิดใช้งาน: โหมดสาธารณะ ทุกคนมองเห็นโพสต์บนหน้าแรกได้'
    )
  } catch (err) {
    showToast('อัปเดตการตั้งค่าไม่สำเร็จ', 'error')
    if (community.value) {
      ;(e.target as HTMLInputElement).checked = !!community.value.is_community_only_feed
    }
  }
}

async function toggleMembersOnlyFeed(e: Event) {
  const membersOnly = (e.target as HTMLInputElement).checked
  try {
    await $fetch(`/api/communities/${slug}/settings`, {
      method: 'PUT',
      body: { members_only_feed: membersOnly }
    })
    if (community.value) {
      community.value.members_only_feed = membersOnly
    }
    showToast(membersOnly 
      ? 'เปิดคอมโบ: สมาชิกในกลุ่มจะมองเห็นโพสต์บนหน้าแรกได้' 
      : 'ปิดคอมโบ: ซ่อนโพสต์จากหน้าแรก 100% (ต้องเข้ามาดูในหน้ากลุ่มเท่านั้น)'
    )
  } catch (err) {
    showToast('อัปเดตการตั้งค่าไม่สำเร็จ', 'error')
    if (community.value) {
      ;(e.target as HTMLInputElement).checked = !!community.value.members_only_feed
    }
  }
}

// ── Invite Links Management ──
const invites = ref<any[]>([])
const inviteDuration = ref<'30m' | '1h' | '24h' | '7d' | 'never'>('24h')
const inviteMaxUses = ref<number | null>(null)
const creatingInvite = ref(false)

function getInviteUrl(code: string) {
  if (typeof window !== 'undefined') {
    return `${window.location.origin}/invite/${code}`
  }
  return `/invite/${code}`
}

function formatExpiresAt(dateStr: string) {
  try {
    const d = new Date(dateStr)
    return d.toLocaleString('th-TH', { 
      day: 'numeric', 
      month: 'short', 
      year: '2-digit', 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  } catch {
    return dateStr
  }
}

async function fetchInvites() {
  try {
    const res: any = await $fetch(`/api/communities/${slug}/invites`)
    invites.value = res.invites || []
  } catch (err) {
    console.error(err)
  }
}

async function createInvite() {
  creatingInvite.value = true
  try {
    const res: any = await $fetch(`/api/communities/${slug}/invites`, {
      method: 'POST',
      body: {
        duration: inviteDuration.value,
        max_uses: inviteMaxUses.value
      }
    })
    showToast('สร้างลิงก์เชิญเรียบร้อยแล้ว!')
    await fetchInvites()
    if (res?.invite?.code) {
      copyInviteLink(res.invite.code)
    }
  } catch (err: any) {
    showToast(err.data?.message || 'ไม่สามารถสร้างลิงก์เชิญได้', 'error')
  } finally {
    creatingInvite.value = false
  }
}

function deleteInvite(id: number, code?: string) {
  openConfirm({
    title: 'ยกเลิกลิงก์เชิญ',
    message: `คุณต้องการยกเลิกลิงก์เชิญ ${code ? `"${code}"` : 'นี้'} ใช่หรือไม่?`,
    submessage: 'เมื่อยกเลิกแล้ว ลิงก์นี้จะไม่สามารถใช้เข้าร่วมกลุ่มได้อีกต่อไป',
    icon: 'link',
    confirmText: 'ยกเลิกลิงก์เชิญ',
    danger: true,
    action: async () => {
      await $fetch(`/api/communities/${slug}/invites/${id}`, {
        method: 'DELETE'
      })
      showToast('ยกเลิกลิงก์เชิญเรียบร้อยแล้ว')
      await fetchInvites()
    }
  })
}

async function copyInviteLink(code: string) {
  const url = getInviteUrl(code)
  await copyToClipboard(url)
  showToast('คัดลอกลิงก์เชิญแล้ว! 📋', 'success')
}

async function fetchReports() {
  try {
    const res: any = await $fetch(`/api/communities/${slug}/reports`)
    reports.value = res.reports || []
  } catch (err) {
    console.error(err)
  }
}

async function updateRole(userId: number, role: string) {
  try {
    await $fetch(`/api/communities/${slug}/members/${userId}/role`, {
      method: 'PUT',
      body: { role }
    })
    await fetchMembers()
    showToast('อัปเดตสิทธิ์สมาชิกเรียบร้อย')
  } catch (err) {
    showToast('ไม่สามารถอัปเดตสิทธิ์ได้', 'error')
  }
}

function kickMember(userId: number, memberName?: string) {
  openConfirm({
    title: 'เตะสมาชิกออกจากกลุ่ม',
    message: `คุณแน่ใจหรือไม่ว่าต้องการเตะ ${memberName ? `"${memberName}"` : 'สมาชิกคนนี้'} ออกจากกลุ่ม?`,
    submessage: 'สมาชิกจะถูกนำออกจากกลุ่ม แต่สามารถขอยื่นเข้าร่วมใหม่ได้ในภายหลัง',
    icon: 'user-minus',
    confirmText: 'เตะออกจากกลุ่ม',
    danger: true,
    action: async () => {
      await $fetch(`/api/communities/${slug}/members/${userId}`, {
        method: 'DELETE'
      })
      await fetchMembers()
      showToast('เตะสมาชิกออกจากกลุ่มเรียบร้อย')
    }
  })
}

function banMember(userId: number, memberName?: string) {
  openConfirm({
    title: 'แบนสมาชิกจากกลุ่ม',
    message: `คุณแน่ใจหรือไม่ว่าต้องการแบน ${memberName ? `"${memberName}"` : 'สมาชิกคนนี้'} ออกจากกลุ่ม?`,
    submessage: 'ผู้ใช้ที่ถูกแบนจะไม่สามารถมองเห็นหรือยื่นคำขอเข้าร่วมกลุ่มนี้ได้อีกต่อไป',
    icon: 'ban',
    confirmText: 'ยืนยันการแบน',
    danger: true,
    action: async () => {
      await $fetch(`/api/communities/${slug}/members/${userId}/ban`, {
        method: 'PUT'
      })
      await fetchMembers()
      showToast('แบนสมาชิกเรียบร้อย')
    }
  })
}

async function resolveReport(reportId: number) {
  try {
    await $fetch(`/api/communities/${slug}/reports/${reportId}/resolve`, {
      method: 'PUT'
    })
    await fetchReports()
    showToast('จัดการรายงานเรียบร้อย')
  } catch (err) {
    showToast('ไม่สามารถอัปเดตสถานะการรายงานได้', 'error')
  }
}

function escalateReport(reportId: number) {
  openConfirm({
    title: 'ส่งต่อรายงานให้ผู้ดูแลระบบ',
    message: 'ต้องการส่งเรื่องให้แอดมินระบบพิจารณาหรือไม่?',
    submessage: 'รายงานนี้จะถูกส่งต่อไปยังศูนย์กลางการดูแลความปลอดภัยของระบบ ConnecXus',
    icon: 'alert',
    confirmText: 'ส่งต่อรายงาน',
    danger: false,
    action: async () => {
      await $fetch(`/api/communities/${slug}/reports/${reportId}/escalate`, {
        method: 'PUT'
      })
      await fetchReports()
      showToast('ส่งเรื่องต่อให้ระบบเรียบร้อย')
    }
  })
}

function deletePost(postId: number) {
  openConfirm({
    title: 'ลบโพสต์ที่ถูกรายงาน',
    message: 'คุณต้องการลบโพสต์นี้ออกจากชุมชนถาวรใช่หรือไม่?',
    submessage: 'โพสต์และคอมเมนต์ทั้งหมดที่เกี่ยวข้องจะถูกลบทันทีและไม่สามารถกู้คืนได้',
    icon: 'trash',
    confirmText: 'ลบโพสต์',
    danger: true,
    action: async () => {
      await $fetch(`/api/posts/${postId}`, { method: 'DELETE' })
      showToast('ลบโพสต์เรียบร้อย')
      await fetchReports()
    }
  })
}

function deleteComment(commentId: number) {
  openConfirm({
    title: 'ลบคอมเมนต์',
    message: 'คุณต้องการลบคอมเมนต์นี้ใช่หรือไม่?',
    submessage: 'คอมเมนต์จะถูกลบออกจากระบบอย่างถาวร',
    icon: 'trash',
    confirmText: 'ลบคอมเมนต์',
    danger: true,
    action: async () => {
      showToast('ลบคอมเมนต์เรียบร้อย')
      await fetchReports()
    }
  })
}
</script>

<style scoped>
/* ── Root & Container ── */
.settings-page-root {
  display: flex;
  justify-content: center;
  width: 100%;
  min-height: 100vh;
  background: var(--bg-primary);
  color: var(--text-primary);
}

.settings-container {
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 1080px;
  min-width: 0;
  padding: 24px 20px 96px;
  gap: 20px;
}

/* ── Top Header Card ── */
.settings-header-card {
  background: var(--bg-card);
  border: 1px solid var(--border-primary);
  border-radius: 20px;
  padding: 18px 24px;
  box-shadow: var(--card-shadow);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 20px;
}

.btn-back-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: 100px;
  background: var(--bg-hover);
  border: 1px solid var(--border-primary);
  color: var(--text-primary);
  font-size: 13px;
  font-weight: 700;
  text-decoration: none;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.btn-back-pill:hover {
  background: var(--brand-light);
  border-color: var(--brand);
  color: var(--brand);
  transform: translateX(-2px);
}

.header-title-wrap {
  display: flex;
  align-items: center;
  gap: 14px;
}

.community-mini-avatar {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-primary);
  flex-shrink: 0;
}

.community-mini-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.header-title {
  font-size: 20px;
  font-weight: 800;
  color: var(--text-primary);
  margin: 0;
  line-height: 1.2;
}

.header-subtitle {
  font-size: 12.5px;
  color: var(--text-muted);
  margin: 2px 0 0;
}

/* ── Navigation Tabs Bar ── */
.settings-tabs-bar {
  display: flex;
  flex-wrap: nowrap;
  align-items: center;
  gap: 4px;
  background: var(--bg-card);
  border: 1px solid var(--border-primary);
  border-radius: 16px;
  padding: 5px 6px;
  box-sizing: border-box;
  box-shadow: var(--card-shadow);
  width: 100%;
  flex-shrink: 0;
  min-height: 48px;
  height: 48px;
  overflow-x: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.settings-tabs-bar::-webkit-scrollbar {
  display: none;
}

.settings-tab-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  padding: 0 10px;
  border-radius: 10px;
  border: 1px solid transparent;
  background: transparent;
  color: var(--text-muted);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.2s ease;
  white-space: nowrap;
  flex: 1 1 auto;
  min-width: max-content;
  height: 36px;
  min-height: 36px;
  box-sizing: border-box;
}

.settings-tab-btn:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}

.settings-tab-btn.active {
  background: var(--brand-light);
  border-color: rgba(99, 102, 241, 0.3);
  color: var(--brand);
  font-weight: 700;
  box-shadow: 0 2px 10px rgba(99, 102, 241, 0.15);
}

.settings-tab-btn.danger-tab-btn {
  color: #ef4444;
}

.settings-tab-btn.danger-tab-btn:hover {
  background: rgba(239, 68, 68, 0.1);
  border-color: rgba(239, 68, 68, 0.2);
}

.settings-tab-btn.danger-tab-btn.active {
  background: rgba(239, 68, 68, 0.15);
  border-color: rgba(239, 68, 68, 0.35);
  color: #ef4444;
  box-shadow: 0 2px 10px rgba(239, 68, 68, 0.2);
}

.tab-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.tab-label {
  line-height: 1;
}

.badge-counter {
  padding: 2px 7px;
  border-radius: 100px;
  font-size: 11px;
  font-weight: 800;
  line-height: 1;
}

.badge-counter.red {
  background: #ef4444;
  color: #fff;
}

.badge-counter.amber {
  background: #f59e0b;
  color: #000;
}

.badge-counter.blue {
  background: var(--brand-light);
  color: var(--brand);
}

/* ── Content Card & Sections ── */
.settings-content-card {
  background: var(--bg-card);
  border: 1px solid var(--border-primary);
  border-radius: 24px;
  padding: 28px;
  box-shadow: var(--card-shadow);
}

.settings-content-card.no-padding {
  padding: 0;
  overflow: hidden;
}

.table-header-box {
  padding: 24px 28px 16px;
  border-bottom: 1px solid var(--border-primary);
}

.card-section-header {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 24px;
}

.section-icon-badge {
  width: 44px;
  height: 44px;
  border-radius: 14px;
  background: var(--brand-light);
  border: 1px solid var(--border-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  flex-shrink: 0;
}

.card-section-header h2 {
  font-size: 18px;
  font-weight: 800;
  color: var(--text-primary);
  margin: 0 0 2px;
}

.card-section-header p {
  font-size: 13px;
  color: var(--text-muted);
  margin: 0;
}

/* ── Form Inputs ── */
.form-grid {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-label {
  font-size: 13.5px;
  font-weight: 700;
  color: var(--text-primary);
}

.form-input, .form-textarea {
  width: 100%;
  padding: 12px 16px;
  border-radius: 12px;
  background: var(--bg-input);
  border: 1px solid var(--border-primary);
  color: var(--text-primary);
  font-size: 14px;
  outline: none;
  font-family: inherit;
  transition: all 0.2s ease;
}

.form-input:focus, .form-textarea:focus {
  border-color: var(--brand);
  background: var(--bg-card);
  box-shadow: 0 0 0 3px var(--brand-light);
}

.form-textarea {
  resize: vertical;
  min-height: 90px;
  line-height: 1.5;
}

/* Assets Upload Grid */
.assets-upload-grid {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}

.asset-card {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.asset-card.banner-flex {
  flex: 1;
  min-width: 300px;
}

.avatar-preview-box {
  display: flex;
  align-items: center;
  gap: 16px;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-primary);
  padding: 12px 16px;
  border-radius: 16px;
}

.avatar-img-wrap {
  width: 72px;
  height: 72px;
  border-radius: 18px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-card);
  border: 2px solid var(--border-primary);
  flex-shrink: 0;
}

.avatar-img-wrap img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder-emoji {
  font-size: 32px;
}

.banner-preview-box {
  display: flex;
  flex-direction: column;
  gap: 12px;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-primary);
  padding: 12px 16px;
  border-radius: 16px;
}

.banner-img-wrap {
  width: 100%;
  height: 90px;
  border-radius: 12px;
  overflow: hidden;
  background: var(--bg-card);
}

.banner-img-wrap img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.banner-fallback-gradient {
  width: 100%;
  height: 100%;
}

.avatar-upload-info, .banner-upload-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.btn-upload-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 14px;
  border-radius: 8px;
  background: var(--brand-light);
  border: 1px solid var(--border-primary);
  color: var(--brand);
  font-size: 12.5px;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.2s ease;
  width: fit-content;
}

.btn-upload-pill:hover {
  background: var(--brand);
  color: #fff;
}

.file-hint {
  font-size: 11.5px;
  color: var(--text-muted);
}

/* Theme Colors Palette */
.theme-colors-palette {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.color-dot {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  border: 3px solid transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.color-dot:hover {
  transform: scale(1.1);
}

.color-dot.active {
  border-color: #fff;
  box-shadow: 0 0 12px rgba(255, 255, 255, 0.4);
}

/* Form Actions */
.form-actions-footer {
  display: flex;
  justify-content: flex-end;
  margin-top: 12px;
}

.btn-action-primary {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 10px 26px;
  border-radius: 100px;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: #fff;
  border: none;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
  box-shadow: 0 4px 16px rgba(99, 102, 241, 0.35);
  transition: all 0.2s ease;
}

.btn-action-primary:hover {
  filter: brightness(1.1);
  transform: translateY(-1px);
}

.btn-action-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* ── Rules Management ── */
.rules-management-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 20px;
}

.rule-edit-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.rule-edit-num {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: var(--brand-light);
  color: var(--brand);
  font-size: 14px;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.btn-delete-rule {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 10px 14px;
  border-radius: 12px;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.2);
  color: #ef4444;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.2s ease;
}

.btn-delete-rule:hover {
  background: rgba(239, 68, 68, 0.2);
}

.btn-add-rule-dashed {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px;
  border-radius: 14px;
  background: transparent;
  border: 1px dashed var(--border-primary);
  color: var(--text-muted);
  font-size: 13.5px;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.2s ease;
  margin-top: 4px;
}

.btn-add-rule-dashed:hover {
  border-color: var(--brand);
  color: var(--brand);
  background: var(--brand-light);
}

/* ── Privacy & Invite Switches Stack ── */
.privacy-switches-stack {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 28px;
}

.privacy-switch-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-radius: 18px;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-primary);
  gap: 20px;
}

.privacy-title-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.privacy-status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--text-muted);
}

.privacy-status-dot.private {
  background: #10b981;
  box-shadow: 0 0 8px #10b981;
}

.privacy-status-dot.hidden-dot.active {
  background: #a855f7;
  box-shadow: 0 0 8px #a855f7;
}

.privacy-status-dot.lock-dot.active {
  background: #06b6d4;
  box-shadow: 0 0 8px #06b6d4;
}

.privacy-status-dot.public-dot {
  background: #10b981;
  box-shadow: 0 0 8px #10b981;
}

.privacy-status-dot.blue-dot.active {
  background: #3b82f6;
  box-shadow: 0 0 8px #3b82f6;
}

.privacy-title {
  font-size: 16px;
  font-weight: 800;
  color: var(--text-primary);
  margin: 0;
}

.privacy-desc {
  font-size: 13px;
  color: var(--text-muted);
  margin: 0;
  max-width: 620px;
  line-height: 1.5;
}

/* ── Unified Feed Card & Combo Box ── */
.unified-feed-card {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
}

.unified-feed-card.is-active {
  background: rgba(6, 182, 212, 0.04);
  border-color: rgba(6, 182, 212, 0.3);
  box-shadow: 0 4px 20px rgba(6, 182, 212, 0.06);
}

.feed-badge-pill {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 11.5px;
  font-weight: 700;
  padding: 2px 9px;
  border-radius: 99px;
  margin-left: 6px;
}

.feed-badge-pill.badge-public {
  background: rgba(16, 185, 129, 0.12);
  color: #10b981;
  border: 1px solid rgba(16, 185, 129, 0.25);
}

.feed-badge-pill.badge-combo {
  background: rgba(6, 182, 212, 0.12);
  color: #06b6d4;
  border: 1px solid rgba(6, 182, 212, 0.25);
}

.feed-badge-pill.badge-hidden {
  background: rgba(239, 68, 68, 0.12);
  color: #ef4444;
  border: 1px solid rgba(239, 68, 68, 0.25);
}

.nested-combo-card {
  margin-top: 14px;
  padding: 14px 16px;
  background: rgba(15, 23, 42, 0.7);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(6, 182, 212, 0.25);
  border-radius: 14px;
  display: flex;
  align-items: center;
  gap: 14px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
}

.combo-icon-aura {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: rgba(6, 182, 212, 0.15);
  border: 1px solid rgba(6, 182, 212, 0.3);
  color: #06b6d4;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.combo-info-wrap {
  flex: 1;
}

.combo-title-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 3px;
}

.combo-badge-tag {
  font-size: 10px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding: 1px 6px;
  border-radius: 4px;
  background: rgba(6, 182, 212, 0.2);
  color: #22d3ee;
}

.combo-title {
  font-size: 13.5px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
}

.combo-desc {
  font-size: 12px;
  color: var(--text-muted);
  margin: 0;
  line-height: 1.4;
}

.ios-switch.mini-switch {
  width: 42px;
  height: 24px;
}

.ios-switch.mini-switch .switch-slider:before {
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
}

.ios-switch.mini-switch input:checked + .switch-slider:before {
  transform: translateX(18px);
}

/* iOS Switch */
.ios-switch {
  position: relative;
  display: inline-block;
  width: 48px;
  height: 28px;
  flex-shrink: 0;
}

.ios-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.switch-slider {
  position: absolute;
  cursor: pointer;
  inset: 0;
  background-color: var(--border-secondary);
  transition: 0.3s;
  border-radius: 34px;
}

.switch-slider:before {
  position: absolute;
  content: "";
  height: 22px;
  width: 22px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: 0.3s;
  border-radius: 50%;
}

input:checked + .switch-slider {
  background: linear-gradient(135deg, #10b981, #059669);
}

.purple-switch input:checked + .switch-slider {
  background: linear-gradient(135deg, #8b5cf6, #a855f7);
}

.cyan-switch input:checked + .switch-slider {
  background: linear-gradient(135deg, #06b6d4, #0891b2);
}

.blue-switch input:checked + .switch-slider {
  background: linear-gradient(135deg, #3b82f6, #6366f1);
}

input:checked + .switch-slider:before {
  transform: translateX(20px);
}

/* ── Invite Links Manager Section ── */
.invite-section-box {
  background: var(--bg-tertiary);
  border: 1px solid var(--border-primary);
  border-radius: 20px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.invite-section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}

.invite-header-title {
  display: flex;
  align-items: center;
  gap: 12px;
}

.invite-icon-pill {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  background: rgba(99, 102, 241, 0.12);
  color: var(--brand);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.invite-header-title h3 {
  font-size: 16px;
  font-weight: 800;
  margin: 0;
  color: var(--text-primary);
}

.invite-header-title p {
  font-size: 12.5px;
  color: var(--text-muted);
  margin: 2px 0 0;
}

.invite-count-badge {
  font-size: 11.5px;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 100px;
  background: var(--brand-light);
  color: var(--brand);
}

.invite-section-desc {
  font-size: 13px;
  color: var(--text-muted);
  margin: 0;
  line-height: 1.5;
}

.invite-controls-card {
  display: flex;
  align-items: flex-end;
  gap: 14px;
  flex-wrap: wrap;
  background: var(--bg-card);
  padding: 16px;
  border-radius: 16px;
  border: 1px solid var(--border-primary);
}

.invite-field-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
  min-width: 180px;
}

.invite-field-group label {
  font-size: 12px;
  font-weight: 700;
  color: var(--text-secondary);
}

.invite-select-input {
  width: 100%;
  padding: 9px 12px;
  border-radius: 10px;
  background: var(--bg-input);
  border: 1px solid var(--border-primary);
  color: var(--text-primary);
  font-size: 13px;
  font-family: inherit;
  outline: none;
  cursor: pointer;
  transition: all 0.2s;
}

.invite-select-input:focus {
  border-color: var(--brand);
}

.btn-create-invite {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 10px 20px;
  border-radius: 12px;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: #fff;
  border: none;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.2s ease;
  box-shadow: 0 4px 14px rgba(99, 102, 241, 0.3);
  height: 38px;
  white-space: nowrap;
}

.btn-create-invite:hover:not(:disabled) {
  filter: brightness(1.1);
  transform: translateY(-1px);
}

.btn-create-invite:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.invites-list-table-wrap {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.invites-list-header {
  font-size: 12.5px;
  font-weight: 700;
  color: var(--text-secondary);
}

.invite-row-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  padding: 14px 18px;
  background: var(--bg-card);
  border: 1px solid var(--border-primary);
  border-radius: 14px;
  transition: all 0.2s ease;
}

.invite-row-card.expired-row {
  opacity: 0.7;
  background: rgba(239, 68, 68, 0.04);
  border-color: rgba(239, 68, 68, 0.2);
}

.invite-info-block {
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
  min-width: 0;
}

.invite-url-box {
  display: flex;
  align-items: center;
  gap: 8px;
}

.invite-url-text {
  font-size: 13.5px;
  font-weight: 700;
  color: var(--brand);
  font-family: monospace;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.btn-copy-mini {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: 8px;
  background: var(--brand-light);
  border: 1px solid var(--border-primary);
  color: var(--brand);
  font-size: 11.5px;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.2s;
  flex-shrink: 0;
}

.btn-copy-mini:hover {
  background: var(--brand);
  color: #fff;
}

.invite-meta-badges {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.status-chip {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 11px;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 6px;
}

.status-chip.active-timer {
  background: rgba(16, 185, 129, 0.12);
  color: #10b981;
}

.status-chip.expired {
  background: rgba(239, 68, 68, 0.12);
  color: #ef4444;
}

.status-chip.forever {
  background: rgba(59, 130, 246, 0.12);
  color: #3b82f6;
}

.status-chip.usage {
  background: var(--bg-hover);
  color: var(--text-muted);
  border: 1px solid var(--border-primary);
}

.status-chip.usage.maxed {
  background: rgba(239, 68, 68, 0.12);
  color: #ef4444;
}

.btn-delete-invite {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 7px 12px;
  border-radius: 8px;
  border: 1px solid rgba(239, 68, 68, 0.2);
  background: rgba(239, 68, 68, 0.08);
  color: #ef4444;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.2s;
  flex-shrink: 0;
}

.btn-delete-invite:hover {
  background: #ef4444;
  color: #fff;
}

.empty-invites-hint {
  padding: 20px;
  text-align: center;
  font-size: 13px;
  color: var(--text-muted);
  background: var(--bg-card);
  border-radius: 14px;
  border: 1px dashed var(--border-primary);
}

/* ── Tables Styling ── */
.table-responsive-wrap {
  width: 100%;
  overflow-x: auto;
}

.settings-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

.settings-table thead tr {
  background: var(--bg-tertiary);
  border-bottom: 1px solid var(--border-primary);
}

.settings-table th {
  padding: 14px 24px;
  font-size: 12.5px;
  color: var(--text-muted);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.settings-table td {
  padding: 16px 24px;
  border-bottom: 1px solid var(--border-primary);
  font-size: 13.5px;
}

.settings-table tbody tr:hover {
  background: var(--bg-hover);
}

.member-cell {
  display: flex;
  align-items: center;
  gap: 12px;
}

.member-avatar-box {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-primary);
}

.member-avatar {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
}

.member-avatar-fallback {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: #fff;
  font-size: 14px;
  font-weight: 700;
}

.member-name {
  font-weight: 700;
  color: var(--text-primary);
  font-size: 14px;
}

.member-handle {
  font-size: 12.5px;
  color: var(--text-muted);
}

.role-badge-pill {
  display: inline-flex;
  padding: 4px 12px;
  border-radius: 100px;
  font-size: 12px;
  font-weight: 700;
}

.role-badge-pill.owner {
  background: rgba(254, 240, 138, 0.15);
  color: #ca8a04;
  border: 1px solid rgba(254, 240, 138, 0.4);
}

.role-badge-pill.mod {
  background: var(--brand-light);
  color: var(--brand);
  border: 1px solid var(--border-primary);
}

.role-badge-pill.member {
  background: var(--bg-tertiary);
  color: var(--text-muted);
}

.table-actions-row {
  display: flex;
  gap: 6px;
  justify-content: flex-end;
}

.btn-table-action {
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
  border: none;
  transition: all 0.2s ease;
}

.btn-table-action.emerald {
  background: rgba(16, 185, 129, 0.15);
  color: #10b981;
}
.btn-table-action.emerald:hover { background: rgba(16, 185, 129, 0.25); }

.btn-table-action.rose {
  background: rgba(244, 63, 94, 0.15);
  color: #f43f5e;
}
.btn-table-action.rose:hover { background: rgba(244, 63, 94, 0.25); }

.btn-table-action.red {
  background: #ef4444;
  color: #fff;
}
.btn-table-action.red:hover { background: #dc2626; }

.btn-table-action.purple {
  background: var(--brand-light);
  color: var(--brand);
}
.btn-table-action.purple:hover { background: var(--brand); color: #fff; }

.btn-table-action.outline {
  background: transparent;
  border: 1px solid var(--border-primary);
  color: var(--text-muted);
}
.btn-table-action.outline:hover { background: var(--bg-hover); }

.btn-table-action.amber {
  background: rgba(245, 158, 11, 0.15);
  color: #f59e0b;
}
.btn-table-action.amber:hover { background: rgba(245, 158, 11, 0.25); }

.owner-immutable-tag {
  font-size: 12px;
  color: var(--text-muted);
  font-style: italic;
}

.timestamp-cell {
  font-size: 13px;
  color: var(--text-muted);
}

/* Empty Table State */
.empty-table-state {
  padding: 48px 24px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.empty-table-state h3 {
  font-size: 16px;
  font-weight: 800;
  color: var(--text-primary);
  margin: 0;
}

.empty-table-state p {
  font-size: 13px;
  color: var(--text-muted);
  margin: 0;
}

/* Reports Specific */
.report-user-cell {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.report-date-tag {
  font-size: 11.5px;
  color: var(--text-muted);
}

.report-target-box {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.target-type-tag {
  font-size: 11px;
  padding: 3px 8px;
  border-radius: 6px;
  width: fit-content;
  font-weight: 700;
}

.target-type-tag.post {
  background: rgba(16, 185, 129, 0.12);
  color: #10b981;
}

.target-type-tag.comment {
  background: rgba(245, 158, 11, 0.12);
  color: #f59e0b;
}

.report-reason-box {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.reason-title {
  color: var(--text-primary);
  font-size: 13.5px;
}

.reason-desc {
  font-size: 12px;
  color: var(--text-secondary);
  background: var(--bg-tertiary);
  padding: 6px 10px;
  border-radius: 8px;
  margin: 0;
}

.report-actions-col {
  display: flex;
  flex-direction: column;
  gap: 6px;
  align-items: flex-end;
}

.status-resolved-tag {
  font-size: 12px;
  color: #10b981;
  font-weight: 700;
}

.status-escalated-tag {
  font-size: 12px;
  color: #f59e0b;
  font-weight: 700;
}

/* ── Image Preview Modal ── */
.nexus-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.65);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.image-preview-modal-card {
  background: var(--bg-card);
  border-radius: 24px;
  overflow: hidden;
  width: 100%;
  max-width: 620px;
  border: 1px solid var(--border-primary);
  box-shadow: var(--card-shadow);
}

.preview-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 24px;
  border-bottom: 1px solid var(--border-primary);
}

.preview-modal-header h3 {
  font-size: 16px;
  font-weight: 800;
  color: var(--text-primary);
  margin: 0;
}

.close-preview-btn {
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s ease;
}

.close-preview-btn:hover { color: var(--text-primary); }

.preview-stage-wrap {
  position: relative;
  overflow: hidden;
  background: var(--bg-tertiary);
}

.preview-stage-wrap.banner {
  height: 240px;
}

.preview-stage-wrap.avatar {
  height: 260px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.banner-preview-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-circle-view {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  border: 4px solid var(--brand);
  box-shadow: 0 0 24px rgba(123, 108, 246, 0.4);
}

.avatar-preview-circle-stage {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
}

.avatar-preview-tip {
  font-size: 12.5px;
  color: var(--text-muted);
  margin: 0;
}

.preview-controls-bar {
  padding: 20px 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.slider-control-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.slider-label {
  font-size: 13px;
  font-weight: 600;
  color: var(--brand);
  white-space: nowrap;
}

.custom-slider {
  flex: 1;
  accent-color: var(--brand);
  cursor: pointer;
}

.slider-val {
  font-size: 12px;
  font-weight: 700;
  color: var(--text-muted);
  width: 36px;
  text-align: right;
}

.preview-footer-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.btn-pill-glass {
  padding: 9px 20px;
  border-radius: 100px;
  background: var(--bg-hover);
  border: 1px solid var(--border-primary);
  color: var(--text-primary);
  font-size: 13.5px;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.2s ease;
}

.btn-pill-glass:hover {
  background: var(--brand-light);
  border-color: var(--brand);
  color: var(--brand);
}

/* ── Toast ── */
.settings-toast-banner {
  position: fixed;
  bottom: 32px;
  right: 32px;
  background: var(--bg-card);
  border: 1px solid var(--border-primary);
  padding: 14px 20px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  box-shadow: var(--card-shadow);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 9999;
  transform: translateY(20px);
  opacity: 0;
  pointer-events: none;
}

.settings-toast-banner.show {
  transform: translateY(0);
  opacity: 1;
  pointer-events: auto;
}

.toast-icon-circle {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 12px;
}

.settings-toast-banner.success .toast-icon-circle {
  background: #10b981;
  color: #fff;
}

.settings-toast-banner.error .toast-icon-circle {
  background: #ef4444;
  color: #fff;
}

.toast-text {
  font-size: 13.5px;
  font-weight: 700;
  color: var(--text-primary);
}

/* ── State & Loader ── */
.settings-state-card {
  background: var(--bg-card);
  border: 1px solid var(--border-primary);
  border-radius: 20px;
  padding: 60px 24px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.spinner {
  width: 36px;
  height: 36px;
  border: 3px solid var(--brand-light);
  border-top-color: var(--brand);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.state-icon-circle {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: var(--bg-hover);
  border: 1px solid var(--border-primary);
  color: var(--text-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 6px;
}

.state-icon-circle.glowing {
  background: var(--brand-light);
  border-color: var(--brand);
  color: var(--brand);
  box-shadow: 0 0 20px rgba(123, 108, 246, 0.2);
}

/* ── Danger Zone Tab & Styles ── */
.danger-tab-btn {
  color: #f87171 !important;
}

.danger-tab-btn:hover {
  background: rgba(239, 68, 68, 0.12) !important;
  color: #ef4444 !important;
}

.danger-tab-btn.active {
  background: rgba(239, 68, 68, 0.18) !important;
  color: #ef4444 !important;
  border-color: rgba(239, 68, 68, 0.4) !important;
  box-shadow: 0 4px 14px rgba(239, 68, 68, 0.25) !important;
}

.settings-content-card.danger-card {
  border-color: rgba(239, 68, 68, 0.25);
  box-shadow: 0 10px 30px rgba(239, 68, 68, 0.08);
}

.section-icon-badge.danger {
  background: rgba(239, 68, 68, 0.15);
  border-color: rgba(239, 68, 68, 0.3);
  color: #ef4444;
}

.danger-zone-box {
  background: rgba(239, 68, 68, 0.04);
  border: 1px dashed rgba(239, 68, 68, 0.35);
  border-radius: 18px;
  padding: 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  margin-top: 10px;
}

.danger-info-wrap {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  flex: 1;
}

.danger-badge-icon {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  background: rgba(239, 68, 68, 0.15);
  border: 1px solid rgba(239, 68, 68, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.danger-text-col {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.danger-action-title {
  font-size: 16px;
  font-weight: 800;
  color: #ef4444;
  margin: 0;
}

.danger-action-desc {
  font-size: 13.5px;
  color: var(--text-secondary);
  line-height: 1.5;
  margin: 0;
}

.btn-delete-community-trigger {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 22px;
  border-radius: 12px;
  border: 1px solid rgba(239, 68, 68, 0.4);
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: #fff;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 4px 16px rgba(239, 68, 68, 0.35);
  transition: all 0.2s ease;
  white-space: nowrap;
  font-family: inherit;
}

.btn-delete-community-trigger:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(239, 68, 68, 0.5);
  background: linear-gradient(135deg, #f43f5e, #e11d48);
}

/* ── Delete Modal ── */
.nexus-delete-modal-card {
  background: var(--bg-card);
  border: 1px solid rgba(239, 68, 68, 0.35);
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.6), 0 0 30px rgba(239, 68, 68, 0.2);
  border-radius: 22px;
  width: 92%;
  max-width: 480px;
  overflow: hidden;
  animation: modalPop 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

.delete-modal-header {
  padding: 20px 24px;
  display: flex;
  align-items: center;
  gap: 14px;
  border-bottom: 1px solid var(--border-primary);
  background: rgba(239, 68, 68, 0.05);
}

.delete-warning-icon {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: rgba(239, 68, 68, 0.15);
  border: 1px solid rgba(239, 68, 68, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.delete-modal-title {
  font-size: 17px;
  font-weight: 800;
  color: #ef4444;
  margin: 0;
}

.delete-modal-sub {
  font-size: 12px;
  color: var(--text-muted);
  margin: 2px 0 0;
}

.delete-modal-body {
  padding: 22px 24px;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.delete-summary-box {
  background: var(--bg-hover);
  border: 1px solid var(--border-primary);
  border-radius: 12px;
  padding: 14px 16px;
  font-size: 13px;
  color: var(--text-secondary);
}

.delete-summary-box p {
  margin: 0 0 8px;
  font-weight: 700;
  color: var(--text-primary);
}

.delete-summary-box ul {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 4px;
  color: #f87171;
  font-size: 12.5px;
}

.delete-input-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.delete-input-group code {
  background: rgba(239, 68, 68, 0.15);
  color: #ef4444;
  padding: 2px 6px;
  border-radius: 6px;
  font-weight: 700;
}

.delete-confirm-input {
  border-color: rgba(239, 68, 68, 0.4) !important;
}

.delete-confirm-input:focus {
  border-color: #ef4444 !important;
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.25) !important;
}

.delete-modal-footer {
  padding: 16px 24px;
  background: var(--bg-hover);
  border-top: 1px solid var(--border-primary);
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
}

.btn-action-danger-confirm {
  padding: 10px 20px;
  border-radius: 12px;
  border: none;
  background: #ef4444;
  color: #fff;
  font-size: 13.5px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: inherit;
}

.btn-action-danger-confirm:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.btn-action-danger-confirm:not(:disabled):hover {
  background: #dc2626;
  box-shadow: 0 4px 14px rgba(239, 68, 68, 0.4);
}

/* ── Responsive ── */
@media (max-width: 640px) {
  .danger-zone-box {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
  }
  .btn-delete-community-trigger {
    justify-content: center;
  }
  .settings-container {
    padding: 12px 10px 96px;
  }
  .settings-header-card {
    padding: 14px 16px;
  }
  .header-title {
    font-size: 17px;
  }
  .settings-content-card {
    padding: 18px 16px;
  }
  .settings-tabs-bar {
    padding: 6px;
    min-height: 52px;
    height: 52px;
    flex-shrink: 0;
  }
  .settings-tab-btn {
    padding: 0 12px;
    font-size: 12.5px;
    height: 38px;
    min-height: 38px;
    flex-shrink: 0;
  }
}

/* ── Cyberpunk Glass Confirmation Modal ── */
.nexus-confirm-modal-card {
  background: rgba(18, 20, 30, 0.96);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 26px;
  padding: 32px 28px 26px;
  width: 90%;
  max-width: 420px;
  text-align: center;
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.7), 0 0 35px rgba(99, 102, 241, 0.2);
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  overflow: hidden;
  animation: modalPopIn 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

.confirm-icon-aura {
  width: 68px;
  height: 68px;
  border-radius: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
  position: relative;
}

.confirm-icon-aura.danger {
  background: radial-gradient(circle, rgba(239, 68, 68, 0.22) 0%, rgba(239, 68, 68, 0.08) 100%);
  border: 1px solid rgba(239, 68, 68, 0.4);
  color: #ef4444;
  box-shadow: 0 0 30px rgba(239, 68, 68, 0.35);
}

.confirm-icon-aura.amber {
  background: radial-gradient(circle, rgba(245, 158, 11, 0.22) 0%, rgba(245, 158, 11, 0.08) 100%);
  border: 1px solid rgba(245, 158, 11, 0.4);
  color: #f59e0b;
  box-shadow: 0 0 30px rgba(245, 158, 11, 0.35);
}

.confirm-modal-title {
  font-size: 20px;
  font-weight: 800;
  color: #f8fafc;
  margin: 0 0 10px;
  letter-spacing: -0.2px;
}

.confirm-modal-msg {
  font-size: 14.5px;
  color: #94a3b8;
  line-height: 1.6;
  margin: 0 0 10px;
  max-width: 360px;
}

.confirm-modal-submsg {
  font-size: 12.5px;
  color: #64748b;
  line-height: 1.5;
  margin: 0 0 24px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px dashed rgba(255, 255, 255, 0.12);
  border-radius: 12px;
  padding: 10px 14px;
  width: 100%;
  box-sizing: border-box;
}

.confirm-modal-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
}

.btn-confirm-cancel {
  flex: 1;
  padding: 12px 18px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: #e2e8f0;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.2s ease;
}

.btn-confirm-cancel:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.12);
  border-color: rgba(255, 255, 255, 0.22);
}

.btn-confirm-execute {
  flex: 1.2;
  padding: 12px 20px;
  border-radius: 14px;
  color: #fff;
  border: none;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.btn-confirm-execute.danger-btn {
  background: linear-gradient(135deg, #ef4444, #dc2626);
  box-shadow: 0 4px 20px rgba(239, 68, 68, 0.45);
}

.btn-confirm-execute.danger-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #f43f5e, #e11d48);
  box-shadow: 0 6px 26px rgba(239, 68, 68, 0.6);
  transform: translateY(-1px);
}

.btn-confirm-execute.amber-btn {
  background: linear-gradient(135deg, #f59e0b, #d97706);
  box-shadow: 0 4px 20px rgba(245, 158, 11, 0.45);
}

.btn-confirm-execute.amber-btn:hover:not(:disabled) {
  filter: brightness(1.1);
  transform: translateY(-1px);
}

.btn-confirm-execute:disabled,
.btn-confirm-cancel:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@keyframes modalPopIn {
  0% {
    opacity: 0;
    transform: scale(0.92) translateY(10px);
  }
  100% {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}
</style>
