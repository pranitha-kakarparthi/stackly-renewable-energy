/**
 * STACKLY RENEWABLE ENERGY - AUTHENTICATION & STORAGE MODULE
 * Frontend-only complete simulation with localStorage persistence
 * Handles Users, Roles (Admin, Manager, Customer), Validation & Session
 */

const STORAGE_KEYS = {
  USERS: "stackly_users",
  CURRENT_USER: "stackly_current_user",
  ROLE: "stackly_role",
  PREFERENCES: "stackly_preferences",
  NOTIFICATIONS: "stackly_notifications",
};

// Seed default users if not present in localStorage
function initSeedUsers() {
  const existingUsers = localStorage.getItem(STORAGE_KEYS.USERS);
  if (!existingUsers) {
    const defaultUsers = [
      {
        firstName: "James",
        lastName: "Workman",
        username: "james_workman",
        email: "james.workman@thestackly.com",
        password: "Password@123",
        role: "Admin",
        mobile: "9876543210",
        countryCode: "+91",
        avatar: "../assets/images/team-james-workman-field-operations-lead.webp",
      },
      {
        firstName: "Elena",
        lastName: "Rostova",
        username: "elena_rostova",
        email: "elena.rostova@thestackly.com",
        password: "Password@123",
        role: "Manager",
        mobile: "9876543211",
        countryCode: "+91",
        avatar: "../assets/images/avatar-elena-rostova-grid-director.webp",
      },
      {
        firstName: "David",
        lastName: "Chen",
        username: "david_chen",
        email: "david.chen@cleanenergy.org",
        password: "Password@123",
        role: "Customer",
        mobile: "9876543212",
        countryCode: "+91",
        avatar: "../assets/images/avatar-david-chen-solar-engineer.webp",
      },

    ];
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(defaultUsers));
  }
}

// Check session status
function getCurrentUser() {
  const raw = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
  return raw ? JSON.parse(raw) : null;
}

function setCurrentSession(user) {
  localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
  localStorage.setItem(STORAGE_KEYS.ROLE, user.role);
}

function clearSession() {
  localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  localStorage.removeItem(STORAGE_KEYS.ROLE);
}

document.addEventListener("DOMContentLoaded", () => {
  initSeedUsers();
  initPasswordToggles();
  initSignInHandler();
  initSignUpHandler();
});

/* =========================================================
   PASSWORD VISIBILITY TOGGLE
   ========================================================= */
function initPasswordToggles() {
  const toggleButtons = document.querySelectorAll(".password-toggle-btn");
  toggleButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const targetId = btn.getAttribute("data-target");
      const input = document.getElementById(targetId);
      if (!input) return;

      const isPassword = input.type === "password";
      input.type = isPassword ? "text" : "password";
      btn.setAttribute("aria-label", isPassword ? "Hide password" : "Show password");
      btn.innerHTML = isPassword
        ? `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" width="20" height="20"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18"/></svg>`
        : `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" width="20" height="20"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>`;
    });
  });
}

/* =========================================================
   SIGN IN HANDLER & STRICT VALIDATION
   ========================================================= */
function initSignInHandler() {
  const form = document.getElementById("signInForm");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const emailInput = document.getElementById("loginEmail");
    const passwordInput = document.getElementById("loginPassword");
    const roleSelect = document.getElementById("loginRole");
    const errorBanner = document.getElementById("signInError");

    let firstInvalidField = null;

    // Reset error states
    [emailInput, passwordInput, roleSelect].forEach((input) => {
      if (input) input.classList.remove("is-invalid");
    });
    if (errorBanner) errorBanner.style.display = "none";

    // 1. Strict RFC email validation
    const emailVal = emailInput.value.trim();
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailVal || !emailRegex.test(emailVal)) {
      emailInput.classList.add("is-invalid");
      if (!firstInvalidField) firstInvalidField = emailInput;
    }

    // 2. Password validation (cannot be empty and must be minimum 6 characters)
    const passwordVal = passwordInput.value;
    if (!passwordVal || passwordVal.length < 6) {
      passwordInput.classList.add("is-invalid");
      if (!firstInvalidField) firstInvalidField = passwordInput;
    }

    // 3. Operational Role validation
    const roleVal = roleSelect ? roleSelect.value : "Admin";
    if (!roleVal) {
      if (roleSelect) roleSelect.classList.add("is-invalid");
      if (!firstInvalidField) firstInvalidField = roleSelect;
    }

    if (firstInvalidField) {
      firstInvalidField.focus();
      return;
    }

    // Any valid email and password is able to log in successfully
    const nameParts = emailVal.split("@")[0].split(/[._\-+]+/).filter(Boolean);
    const derivedFirst = nameParts[0] ? nameParts[0].charAt(0).toUpperCase() + nameParts[0].slice(1).toLowerCase() : "Operator";
    const derivedLast = nameParts.slice(1).map(p => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase()).join(" ");

    const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || "[]");
    let matchedUser = users.find((u) => u.email.toLowerCase() === emailVal.toLowerCase());

    if (!matchedUser) {
      matchedUser = {
        firstName: derivedFirst,
        lastName: derivedLast,
        username: emailVal.split("@")[0],
        email: emailVal,
        password: passwordVal,
        role: roleVal,
        mobile: "9876543210",
        countryCode: "+91",
        avatar: "../assets/images/avatar-david-chen-solar-engineer.webp",
      };
      users.push(matchedUser);
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    } else {
      matchedUser.role = roleVal;
      matchedUser.password = passwordVal;
      matchedUser.firstName = derivedFirst;
      matchedUser.lastName = derivedLast;
    }

    matchedUser.lastLogin = new Date().toISOString();
    setCurrentSession(matchedUser);

    // Redirect to dashboard
    window.location.href = "dashboard.html";
  });
}

/* =========================================================
   SIGN UP HANDLER & STRICT VALIDATION
   - First/Last name accept ONLY alphabets (no digits)
   - Mobile fixed 10 digits
   - Password strength check
   - Mandatory T&C checkbox
   - Unique username
   ========================================================= */
function initSignUpHandler() {
  const form = document.getElementById("signUpForm");
  if (!form) return;

  const passInput = document.getElementById("regPassword");
  const strengthFill = document.getElementById("passStrengthFill");
  const strengthText = document.getElementById("passStrengthText");

  // Real-time password strength meter
  if (passInput && strengthFill) {
    passInput.addEventListener("input", () => {
      const val = passInput.value;
      if (!val) {
        strengthFill.style.width = "0%";
        if (strengthText) strengthText.textContent = "Enter password (8+ chars, upper, lower, number, special).";
        return;
      }
      let score = 0;
      if (val.length >= 8) score++;
      if (/[A-Z]/.test(val)) score++;
      if (/[a-z]/.test(val)) score++;
      if (/[0-9]/.test(val)) score++;
      if (/[^A-Za-z0-9]/.test(val)) score++;

      const pct = (score / 5) * 100;
      strengthFill.style.width = `${pct}%`;

      if (score <= 2) {
        strengthFill.style.backgroundColor = "#ef4444";
        if (strengthText) strengthText.textContent = "Weak (Needs 8+ chars, upper, lower, number, special)";
      } else if (score <= 4) {
        strengthFill.style.backgroundColor = "#f59e0b";
        if (strengthText) strengthText.textContent = "Moderate (add missing uppercase/symbol/number)";
      } else {
        strengthFill.style.backgroundColor = "#10b981";
        if (strengthText) strengthText.textContent = "Strong renewable password!";
      }
    });
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const firstName = document.getElementById("regFirstName");
    const lastName = document.getElementById("regLastName");
    const username = document.getElementById("regUsername");
    const email = document.getElementById("regEmail");
    const countryCode = document.getElementById("regCountryCode");
    const mobile = document.getElementById("regMobile");
    const password = document.getElementById("regPassword");
    const confirmPassword = document.getElementById("regConfirmPassword");
    const role = document.getElementById("regRole");
    const terms = document.getElementById("regTerms");

    let firstInvalidField = null;

    // Clear previous errors
    const inputs = [firstName, lastName, username, email, mobile, password, confirmPassword, role, terms];
    inputs.forEach((input) => {
      if (input) input.classList.remove("is-invalid");
    });

    // 1. First Name: alphabets only, no digits
    const nameRegex = /^[A-Za-z\s]+$/;
    if (!firstName.value.trim() || !nameRegex.test(firstName.value.trim())) {
      firstName.classList.add("is-invalid");
      if (!firstInvalidField) firstInvalidField = firstName;
    }

    // 2. Last Name: alphabets only, no digits
    if (!lastName.value.trim() || !nameRegex.test(lastName.value.trim())) {
      lastName.classList.add("is-invalid");
      if (!firstInvalidField) firstInvalidField = lastName;
    }

    // 3. Username: alphanumeric, min 3 chars, unique against localStorage
    const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || "[]");
    const uNameVal = username.value.trim();
    const isUnameTaken = users.some((u) => u.username.toLowerCase() === uNameVal.toLowerCase());
    if (!uNameVal || uNameVal.length < 3 || isUnameTaken) {
      username.classList.add("is-invalid");
      if (!firstInvalidField) firstInvalidField = username;
    }

    // 4. Email: valid RFC format
    const emailVal = email.value.trim();
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailVal || !emailRegex.test(emailVal)) {
      email.classList.add("is-invalid");
      if (!firstInvalidField) firstInvalidField = email;
    }

    // 5. Mobile: exact 10 digits
    const mobileVal = mobile.value.trim();
    const mobileRegex = /^\d{10}$/;
    if (!mobileVal || !mobileRegex.test(mobileVal)) {
      mobile.classList.add("is-invalid");
      if (!firstInvalidField) firstInvalidField = mobile;
    }

    // 6. Password: strict rules (uppercase, lowercase, number, special char, min 8)
    const passVal = password.value;
    const hasUpper = /[A-Z]/.test(passVal);
    const hasLower = /[a-z]/.test(passVal);
    const hasNumber = /[0-9]/.test(passVal);
    const hasSpecial = /[^A-Za-z0-9]/.test(passVal);
    if (!passVal || passVal.length < 8 || !hasUpper || !hasLower || !hasNumber || !hasSpecial) {
      password.classList.add("is-invalid");
      if (!firstInvalidField) firstInvalidField = password;
    }

    // 7. Confirm Password
    if (!confirmPassword.value || confirmPassword.value !== passVal) {
      confirmPassword.classList.add("is-invalid");
      if (!firstInvalidField) firstInvalidField = confirmPassword;
    }

    // 8. Role
    if (!role.value) {
      role.classList.add("is-invalid");
      if (!firstInvalidField) firstInvalidField = role;
    }

    // 9. Mandatory Terms Checkbox
    if (!terms.checked) {
      terms.classList.add("is-invalid");
      if (!firstInvalidField) firstInvalidField = terms;
    }

    if (firstInvalidField) {
      firstInvalidField.focus();
      return;
    }

    // Register user (without avatar requirement)
    const newUser = {
      firstName: firstName.value.trim(),
      lastName: lastName.value.trim(),
      username: uNameVal,
      email: emailVal,
      password: passVal,
      mobile: mobileVal,
      countryCode: countryCode ? countryCode.value : "+91",
      role: role.value,
      avatar: "../assets/images/avatar-david-chen-solar-engineer.webp",
      address: document.getElementById("regAddress")?.value.trim() || "",
      registeredAt: new Date().toISOString(),
    };

    users.push(newUser);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));

    // Show success alert and redirect to sign-in
    const successMsg = document.getElementById("signUpSuccess");
    if (successMsg) {
      successMsg.style.display = "block";
      form.style.display = "none";
    }

    setTimeout(() => {
      window.location.href = "sign-in.html?registered=true";
    }, 1500);
  });
}

