/**
 * STACKLY RENEWABLE ENERGY - DASHBOARD CONTROLLER
 * Session verification, Role switching, Dynamic Widgets, Responsive Sidebar & 404 actions
 */

document.addEventListener("DOMContentLoaded", () => {
  verifyDashboardSession();
  initDashboardSidebar();
  initDashboardRoleView();
  initDashboardCharts();
  initDashboardSignOut();
  initDashboardActions();
});

/* =========================================================
   1. SESSION VERIFICATION (Redirect to sign-in if unauthenticated)
   ========================================================= */
function getDisplayNameFromUser(user) {
  if (!user) return "Operator";
  if (user.email) {
    const localPart = user.email.split("@")[0] || "";
    const parts = localPart.split(/[._\-+]+/).filter(Boolean);
    if (parts.length > 0) {
      return parts.map(p => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase()).join(" ");
    }
  }
  if (user.firstName) {
    return `${user.firstName} ${user.lastName || ""}`.trim();
  }
  return "Operator";
}

function verifyDashboardSession() {
  const rawUser = localStorage.getItem("stackly_current_user");
  if (!rawUser) {
    window.location.href = "sign-in.html";
    return;
  }

  const user = JSON.parse(rawUser);

  const displayName = getDisplayNameFromUser(user);
  const firstName = displayName.split(" ")[0] || "Operator";

  // Render User Profile Meta in Topbar
  const nameDisplays = document.querySelectorAll(".user-meta-name, .dash-username");
  nameDisplays.forEach((el) => {
    el.textContent = displayName;
  });

  const roleDisplays = document.querySelectorAll(".dash-role-badge, .dash-user-role");
  roleDisplays.forEach((el) => {
    el.textContent = user.role || "Admin";
  });

  const avatarDisplays = document.querySelectorAll(".user-avatar-img");
  avatarDisplays.forEach((el) => {
    if (user.avatar) el.src = user.avatar;
  });

  // Dynamic Greeting with user name
  const greetingEl = document.querySelector(".topbar-greeting");
  if (greetingEl) {
    const hour = new Date().getHours();
    let timeGreeting = "Good day";
    if (hour >= 5 && hour < 12) timeGreeting = "Good morning";
    else if (hour >= 12 && hour < 17) timeGreeting = "Good afternoon";
    else if (hour >= 17 && hour < 22) timeGreeting = "Good evening";
    else timeGreeting = "Good night";

    greetingEl.textContent = `${timeGreeting}, ${firstName}`;
  }

  // Active Login Timestamp
  const timeMetaEl = document.querySelector(".topbar-time-meta");
  if (timeMetaEl) {
    const dateStr = new Date().toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
    timeMetaEl.textContent = `Active Session • ${dateStr} • Grid Status: Synchronized`;
  }
}

/* =========================================================
   2. COLLAPSIBLE SIDEBAR & RESPONSIVE FULLSCREEN MOBILE MENU
   ========================================================= */
function initDashboardSidebar() {
  const sidebar = document.querySelector(".dash-sidebar");
  const desktopToggle = document.querySelector(".sidebar-toggle-btn");
  const mobileToggle = document.querySelector(".mobile-sidebar-btn");

  if (!sidebar) return;

  // Desktop collapse toggle (or close drawer on mobile)
  if (desktopToggle) {
    desktopToggle.addEventListener("click", () => {
      if (window.innerWidth <= 768) {
        sidebar.classList.remove("is-open");
        document.body.classList.remove("nav-open");
        if (mobileToggle) mobileToggle.setAttribute("aria-expanded", "false");
      } else {
        sidebar.classList.toggle("collapsed");
      }
    });
  }

  // Mobile toggle (always spans entire width on smaller screens when open)
  if (mobileToggle) {
    mobileToggle.addEventListener("click", () => {
      const isOpen = sidebar.classList.toggle("is-open");
      document.body.classList.toggle("nav-open", isOpen);
      mobileToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });
  }

  // Close sidebar on link click on mobile
  const links = sidebar.querySelectorAll(".sidebar-link");
  links.forEach((l) => {
    l.addEventListener("click", () => {
      if (window.innerWidth <= 768) {
        sidebar.classList.remove("is-open");
        document.body.classList.remove("nav-open");
        if (mobileToggle) mobileToggle.setAttribute("aria-expanded", "false");
      }
    });
  });

  // Dedicated Mobile / Smaller Screens Collapse Button
  const mobileCollapseBtn = sidebar.querySelector(".sidebar-collapse-mobile-btn");
  if (mobileCollapseBtn) {
    mobileCollapseBtn.addEventListener("click", () => {
      sidebar.classList.remove("is-open");
      document.body.classList.remove("nav-open");
      if (mobileToggle) mobileToggle.setAttribute("aria-expanded", "false");
    });
  }

  // Close when clicking outside sidebar on smaller screens
  document.addEventListener("click", (e) => {
    if (window.innerWidth <= 768 && sidebar.classList.contains("is-open")) {
      if (!sidebar.contains(e.target) && !mobileToggle?.contains(e.target)) {
        sidebar.classList.remove("is-open");
        document.body.classList.remove("nav-open");
        if (mobileToggle) mobileToggle.setAttribute("aria-expanded", "false");
      }
    }
  });
}

/* =========================================================
   3. ROLE AWARENESS & CUSTOMIZED INDEPENDENT DATA PROFILES
   ========================================================= */
const ROLE_PERSONAS = {
  "Admin": {
    name: "James Workman",
    title: "Global SCADA Operations Lead",
    avatar: "team-james-workman-field-operations-lead.webp",
    badgeClass: "role-admin",
    kpis: {
      gen: "128.4 MWh",
      feed: "94.8 MWh",
      offset: "104.2 Tons",
      rev: "$34,890",
      custom1: "38 / 38 Active",
      custom2: "0 Critical Faults"
    },
    banner: "Admin Mode: Full SCADA grid dispatch authority, sub-second telemetry write permissions & API key configuration."
  },
  "Manager": {
    name: "Elena Rostova",
    title: "Grid Operations & PPA Director",
    avatar: "avatar-elena-rostova-grid-director.webp",
    badgeClass: "role-manager",
    kpis: {
      gen: "84.6 MWh",
      feed: "62.1 MWh",
      offset: "68.4 Tons",
      rev: "$18,420",
      custom1: "99.8% Availability",
      custom2: "PPA On Target"
    },
    banner: "Manager Mode: Executive ESG reporting, PPA billing settlements, workforce dispatch schedule & yield targets."
  },
  "Customer": {
    name: "Marcus Vance",
    title: "Commercial Facility Director",
    avatar: "avatar-marcus-vance-sustainability-lead.webp",
    badgeClass: "role-customer",
    kpis: {
      gen: "1.42 MWh",
      feed: "0.85 MWh",
      offset: "1.12 Tons",
      rev: "$382 Saved",
      custom1: "100% Green Match",
      custom2: "Net-Metered Credit"
    },
    banner: "Customer Portal: Contracted solar & wind capacity, monthly utility cost avoidance, verified I-REC certificates."
  }
};

function switchActiveRole(newRole) {
  if (!ROLE_PERSONAS[newRole]) newRole = "Admin";
  const persona = ROLE_PERSONAS[newRole];
  
  const rawUser = localStorage.getItem("stackly_current_user");
  const existingUser = rawUser ? JSON.parse(rawUser) : null;
  
  // Determine relative avatar prefix
  const isSubpage = window.location.pathname.includes("/pages/");
  const avatarPrefix = isSubpage ? "../assets/images/" : "assets/images/";
  
  const updatedUser = {
    firstName: existingUser?.firstName || persona.name.split(" ")[0],
    lastName: existingUser?.lastName !== undefined ? existingUser.lastName : persona.name.split(" ").slice(1).join(" "),
    email: existingUser?.email || `${persona.name.toLowerCase().replace(/\s+/g, ".")}@stacklyenergy.com`,
    role: newRole,
    avatar: existingUser?.avatar || `${avatarPrefix}${persona.avatar}`
  };
  
  localStorage.setItem("stackly_current_user", JSON.stringify(updatedUser));
  localStorage.setItem("stackly_role", newRole);
  
  // Sync all role selects on page
  document.querySelectorAll(".topbar-role-select, #roleSwitcherSelect").forEach(sel => {
    sel.value = newRole;
  });
  
  applyRoleData(newRole, updatedUser);
}

function initDashboardRoleView() {
  const rawUser = localStorage.getItem("stackly_current_user");
  let user = rawUser ? JSON.parse(rawUser) : null;
  let role = (user && user.role) ? user.role : (localStorage.getItem("stackly_role") || "Admin");
  
  if (!ROLE_PERSONAS[role]) role = "Admin";
  
  // Sync all role selects on page
  document.querySelectorAll(".topbar-role-select, #roleSwitcherSelect").forEach(sel => {
    sel.value = role;
    sel.addEventListener("change", (e) => {
      switchActiveRole(e.target.value);
    });
  });

  applyRoleData(role, user);
}

function applyRoleData(role, user) {
  if (!ROLE_PERSONAS[role]) role = "Admin";
  const persona = ROLE_PERSONAS[role];
  const isSubpage = window.location.pathname.includes("/pages/");
  const avatarPrefix = isSubpage ? "../assets/images/" : "assets/images/";
  
  const rawUser = user || JSON.parse(localStorage.getItem("stackly_current_user") || "{}");
  const displayName = getDisplayNameFromUser(rawUser);
  const firstName = displayName.split(" ")[0] || "Operator";
  
  // Update name & role in UI (Display name derived from email)
  document.querySelectorAll(".user-meta-name, .dash-username").forEach(el => {
    el.textContent = displayName;
  });
  
  document.querySelectorAll(".dash-role-badge, .dash-user-role").forEach(el => {
    el.textContent = role;
    el.className = `dash-role-badge ${persona.badgeClass}`;
  });
  
  document.querySelectorAll(".user-avatar-img").forEach(el => {
    el.src = `${avatarPrefix}${persona.avatar}`;
  });

  // Dynamic Greeting
  const greetingEl = document.querySelector(".topbar-greeting");
  if (greetingEl) {
    const hour = new Date().getHours();
    let timeGreeting = "Good day";
    if (hour >= 5 && hour < 12) timeGreeting = "Good morning";
    else if (hour >= 12 && hour < 17) timeGreeting = "Good afternoon";
    else if (hour >= 17 && hour < 22) timeGreeting = "Good evening";
    else timeGreeting = "Good night";

    greetingEl.textContent = `${timeGreeting}, ${firstName}`;
  }

  // Role Banner
  const bannerEl = document.getElementById("roleBannerAlert");
  if (bannerEl) {
    bannerEl.className = `role-banner-alert role-${role.toLowerCase().replace(/[^a-z]/g, '')}-banner`;
    const bannerText = bannerEl.querySelector(".role-banner-text");
    if (bannerText) bannerText.textContent = persona.banner;
  }

  // Filter role containers
  const roleContainers = document.querySelectorAll("[data-role-view]");
  roleContainers.forEach((container) => {
    const targetRoles = container.getAttribute("data-role-view").split(",").map(s => s.trim());
    if (targetRoles.includes(role) || targetRoles.includes("All")) {
      container.style.display = "";
    } else {
      container.style.display = "none";
    }
  });

  // Dynamic KPI Card numbers based on role
  const kpiGen = document.getElementById("kpiTotalGeneration");
  const kpiFeed = document.getElementById("kpiGridFeed");
  const kpiOffset = document.getElementById("kpiCarbonOffset");
  const kpiRev = document.getElementById("kpiNetRevenue");

  if (kpiGen) kpiGen.textContent = persona.kpis.gen;
  if (kpiFeed) kpiFeed.textContent = persona.kpis.feed;
  if (kpiOffset) kpiOffset.textContent = persona.kpis.offset;
  if (kpiRev) kpiRev.textContent = persona.kpis.rev;
}

/* =========================================================
   4. INTERACTIVE TELEMETRY & BAR/DONUT CHARTS
   ========================================================= */
function initDashboardCharts() {
  // Interactive Hover Bars on Generation vs Irradiation chart
  const bars = document.querySelectorAll(".chart-bar-rect");
  const tooltip = document.getElementById("chartTooltip");

  bars.forEach((bar) => {
    bar.addEventListener("mouseenter", (e) => {
      const val = bar.getAttribute("data-val");
      const month = bar.getAttribute("data-month");
      if (tooltip) {
        tooltip.textContent = `${month}: ${val} MWh Clean Energy`;
        tooltip.style.opacity = "1";
      }
      bar.style.filter = "brightness(1.3)";
    });

    bar.addEventListener("mouseleave", () => {
      if (tooltip) tooltip.style.opacity = "0";
      bar.style.filter = "none";
    });
  });
}

/* =========================================================
   5. SIGN OUT HANDLER
   Clears session & redirects strictly to sign-in.html
   ========================================================= */
function initDashboardSignOut() {
  const signOutButtons = document.querySelectorAll(".btn-sign-out, [data-action='sign-out']");
  signOutButtons.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      localStorage.removeItem("stackly_current_user");
      localStorage.removeItem("stackly_role");
      window.location.href = "sign-in.html";
    });
  });
}

/* =========================================================
   6. ALL DASHBOARD ACTION BUTTONS REDIRECT TO 404
   Complies strictly with: "All action buttons in the dashboard should be redirected to 404 page"
   ========================================================= */
function initDashboardActions() {
  const dashActions = document.querySelectorAll(
    ".btn-dash-action, .dash-action-btn, [data-dash-action='404']"
  );
  dashActions.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      window.location.href = "404.html";
    });
  });
}

