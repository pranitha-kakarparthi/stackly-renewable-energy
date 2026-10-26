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
function verifyDashboardSession() {
  const rawUser = localStorage.getItem("stackly_current_user");
  if (!rawUser) {
    window.location.href = "sign-in.html";
    return;
  }

  const user = JSON.parse(rawUser);

  // Render User Profile Meta in Topbar
  const nameDisplays = document.querySelectorAll(".user-meta-name, .dash-username");
  nameDisplays.forEach((el) => {
    el.textContent = `${user.firstName} ${user.lastName}`;
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

    greetingEl.textContent = `${timeGreeting}, ${user.firstName}`;
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

  // Desktop collapse toggle
  if (desktopToggle) {
    desktopToggle.addEventListener("click", () => {
      sidebar.classList.toggle("collapsed");
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
      }
    });
  });
}

/* =========================================================
   3. ROLE AWARENESS & CUSTOMIZED DATA PROFILES
   ========================================================= */
function initDashboardRoleView() {
  const rawUser = localStorage.getItem("stackly_current_user");
  if (!rawUser) return;
  const user = JSON.parse(rawUser);
  const role = user.role || "Admin";

  const roleContainers = document.querySelectorAll("[data-role-view]");
  roleContainers.forEach((container) => {
    const targetRoles = container.getAttribute("data-role-view").split(",");
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

  if (role === "Customer") {
    if (kpiGen) kpiGen.textContent = "1.42 MWh";
    if (kpiFeed) kpiFeed.textContent = "0.85 MWh";
    if (kpiOffset) kpiOffset.textContent = "1.12 Tons";
    if (kpiRev) kpiRev.textContent = "$382 Saved";
  } else if (role === "Manager") {
    if (kpiGen) kpiGen.textContent = "84.6 MWh";
    if (kpiFeed) kpiFeed.textContent = "62.1 MWh";
    if (kpiOffset) kpiOffset.textContent = "68.4 Tons";
    if (kpiRev) kpiRev.textContent = "$18,420";
  } else if (role === "Vendor/Engineer") {
    if (kpiGen) kpiGen.textContent = "99.4% Eff";
    if (kpiFeed) kpiFeed.textContent = "435 RPM Max";
    if (kpiOffset) kpiOffset.textContent = "0 Faults";
    if (kpiRev) kpiRev.textContent = "18 Units Ok";
  } else {
    // Admin default
    if (kpiGen) kpiGen.textContent = "128.4 MWh";
    if (kpiFeed) kpiFeed.textContent = "94.8 MWh";
    if (kpiOffset) kpiOffset.textContent = "104.2 Tons";
    if (kpiRev) kpiRev.textContent = "$34,890";
  }
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

