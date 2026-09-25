<template>
  <nav
    style="
      height: 56px;
      background: var(--dark-bg);
      border-bottom: 1px solid var(--dark-border);
      display: flex;
      align-items: center;
      padding: 0 24px;
      gap: 4px;
      position: sticky;
      top: 0;
      z-index: 100;
    "
  >
    <!-- Brand Logo -->
    <NuxtLink to="/" style="text-decoration: none; margin-right: 16px; display: flex; align-items: center;">
      <span style="font-size: 18px; font-weight: 800; color: #fff; letter-spacing: -0.5px; font-family: 'Inter', sans-serif;">
        Connec<span style="color: var(--brand);">X</span>us
      </span>
    </NuxtLink>

    <NuxtLink
      to="/login"
      :class="route.path === '/login' ? 'nav-pill-active' : 'nav-pill-inactive'"
      style="text-decoration: none; font-size: 14px;"
    >Login</NuxtLink>

    <NuxtLink
      to="/register"
      :class="route.path === '/register' ? 'nav-pill-active' : 'nav-pill-inactive'"
      style="text-decoration: none; font-size: 14px;"
    >สมัครสมาชิก</NuxtLink>

    <!-- Divider -->
    <div style="width: 1px; height: 18px; background: var(--dark-border); margin: 0 10px; flex-shrink: 0;" />

    <NuxtLink
      to="/"
      :class="route.path === '/' ? 'nav-pill-active' : 'nav-pill-inactive'"
      style="text-decoration: none; font-size: 14px;"
    >ฟีด</NuxtLink>

    <NuxtLink
      to="/messages"
      :class="route.path.startsWith('/messages') ? 'nav-pill-active' : 'nav-pill-inactive'"
      style="text-decoration: none; font-size: 14px;"
    >แชท</NuxtLink>

    <NuxtLink
      to="/community"
      :class="route.path.startsWith('/community') ? 'nav-pill-active' : 'nav-pill-inactive'"
      style="text-decoration: none; font-size: 14px;"
    >ชุมชน</NuxtLink>
  </nav>
</template>

<script setup lang="ts">
const route = useRoute()
</script>
