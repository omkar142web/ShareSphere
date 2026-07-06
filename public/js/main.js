function showToast(message, type = "success") {
  const container =
    document.querySelector(".toast-container") ||
    (() => {
      const el = document.createElement("div");
      el.className = "toast-container";
      document.body.appendChild(el);
      return el;
    })();

  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transition = "opacity 0.3s";
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

document.addEventListener("DOMContentLoaded", () => {
  const forms = document.querySelectorAll("form[data-ajax]");
  forms.forEach((form) => {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const formData = new FormData(form);
      const data = Object.fromEntries(formData.entries());
      const errorEl = form.querySelector(".form-error");
      const submitBtn = form.querySelector('button[type="submit"]');

      if (errorEl) {
        errorEl.classList.remove("visible");
        errorEl.textContent = "";
      }
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="spinner"></span>';
      }

      try {
        const res = await fetch(form.action || window.location.pathname, {
          method: form.method || "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });

        const result = await res.json();

        if (!res.ok) {
          if (result.field) {
            const field = form.querySelector(`[name="${result.field}"]`);
            if (field) {
              field.focus();
              field.style.borderColor = "#ef4444";
            }
          }
          if (result.message && errorEl) {
            errorEl.textContent = result.message;
            errorEl.classList.add("visible");
          } else if (result.message) {
            showToast(result.message, "error");
          }
          return;
        }

        if (result.redirect) {
          window.location.href = result.redirect;
        } else if (result.message) {
          showToast(result.message, "success");
          if (result.reload) setTimeout(() => location.reload(), 500);
          else if (result.redirect) window.location.href = result.redirect;
        }
      } catch (err) {
        showToast("Something went wrong. Please try again.", "error");
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent =
            submitBtn.dataset.originalText || "Submit";
        }
      }
    });
  });

  const joinBtns = document.querySelectorAll(".btn-join");
  joinBtns.forEach((btn) => {
    btn.addEventListener("click", async () => {
      const rideId = btn.dataset.rideId;
      btn.disabled = true;
      try {
        const res = await fetch(`/rides/${rideId}/join`, { method: "POST" });
        const data = await res.json();
        if (data.success) {
          showToast("Joined ride! +25 eco points", "success");
          setTimeout(() => location.reload(), 600);
        } else {
          showToast(data.message, "error");
        }
      } catch {
        showToast("Error joining ride", "error");
      } finally {
        btn.disabled = false;
      }
    });
  });

  const leaveBtns = document.querySelectorAll(".btn-leave");
  leaveBtns.forEach((btn) => {
    btn.addEventListener("click", async () => {
      const rideId = btn.dataset.rideId;
      btn.disabled = true;
      try {
        const res = await fetch(`/rides/${rideId}/join`, { method: "DELETE" });
        const data = await res.json();
        if (data.success) {
          showToast("Left the ride", "success");
          setTimeout(() => location.reload(), 600);
        } else {
          showToast(data.message, "error");
        }
      } catch {
        showToast("Error leaving ride", "error");
      } finally {
        btn.disabled = false;
      }
    });
  });

  const deleteBtns = document.querySelectorAll(".btn-delete-ride");
  deleteBtns.forEach((btn) => {
    btn.addEventListener("click", async () => {
      if (!confirm("Delete this ride?")) return;
      const rideId = btn.dataset.rideId;
      btn.disabled = true;
      try {
        const res = await fetch(`/rides/${rideId}`, { method: "DELETE" });
        const data = await res.json();
        if (data.success) {
          showToast("Ride deleted", "success");
          setTimeout(() => location.reload(), 600);
        } else {
          showToast(data.message, "error");
        }
      } catch {
        showToast("Error deleting ride", "error");
      } finally {
        btn.disabled = false;
      }
    });
  });
});
