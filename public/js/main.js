/* ShareSphere — shared front-end behaviour.
   Kept framework-free on purpose: every page includes this one file via
   partials/footer.ejs, so new pages get toasts, ajax forms, and ride
   actions for free. Add new behaviour here rather than inline per-page. */

(function () {
  "use strict";

  /* ---------------- Toasts ---------------- */
  function toast(message, type) {
    var stack = document.getElementById("toastStack");
    if (!stack) return;
    var el = document.createElement("div");
    el.className = "toast" + (type === "error" ? " toast-error" : "");
    el.textContent = message;
    stack.appendChild(el);
    setTimeout(function () {
      el.classList.add("is-leaving");
      setTimeout(function () { el.remove(); }, 220);
    }, 3800);
  }
  window.ShareSphere = window.ShareSphere || {};
  window.ShareSphere.toast = toast;

  /* ---------------- Button loading state ---------------- */
  function setLoading(btn, isLoading) {
    if (!btn) return;
    btn.disabled = isLoading;
    btn.classList.toggle("is-loading", isLoading);
  }

  /* ---------------- Ajax forms (login / register / post-ride) ---------------- */
  document.querySelectorAll("form[data-ajax]").forEach(function (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();

      var submitBtn = form.querySelector('button[type="submit"]');
      var errorBox = form.querySelector(".form-error");
      if (errorBox) {
        errorBox.classList.remove("visible");
        errorBox.textContent = "";
      }
      setLoading(submitBtn, true);

      var payload = {};
      new FormData(form).forEach(function (value, key) { payload[key] = value; });

      fetch(form.getAttribute("action") || window.location.pathname, {
        method: form.getAttribute("method") || "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
        .then(function (res) {
          return res.json().catch(function () { return {}; }).then(function (data) {
            return { ok: res.ok, data: data };
          });
        })
        .then(function (result) {
          setLoading(submitBtn, false);
          if (!result.ok) {
            var message = result.data && result.data.error ? result.data.error : "Something went wrong. Please try again.";
            if (errorBox) {
              errorBox.textContent = message;
              errorBox.classList.add("visible");
            } else {
              toast(message, "error");
            }
            return;
          }
          if (result.data && result.data.redirect) {
            window.location.href = result.data.redirect;
          } else {
            window.location.reload();
          }
        })
        .catch(function () {
          setLoading(submitBtn, false);
          var message = "Network error. Check your connection and try again.";
          if (errorBox) {
            errorBox.textContent = message;
            errorBox.classList.add("visible");
          } else {
            toast(message, "error");
          }
        });
    });
  });

  /* ---------------- Ride actions (join / cancel / delete) ---------------- */
  function rideAction(btn, url, method, confirmMessage, successMessage) {
    if (confirmMessage && !window.confirm(confirmMessage)) return;
    setLoading(btn, true);
    fetch(url, { method: method, headers: { "Content-Type": "application/json" } })
      .then(function (res) {
        return res.json().catch(function () { return {}; }).then(function (data) {
          return { ok: res.ok, data: data };
        });
      })
      .then(function (result) {
        if (!result.ok) {
          setLoading(btn, false);
          toast((result.data && result.data.error) || "Couldn't complete that action.", "error");
          return;
        }
        toast(successMessage);
        setTimeout(function () { window.location.reload(); }, 500);
      })
      .catch(function () {
        setLoading(btn, false);
        toast("Network error. Please try again.", "error");
      });
  }

  /* ---------------- Location modal (truncated addresses) ---------------- */
  function openLocationModal(text) {
    var existing = document.querySelector(".location-modal-overlay");
    if (existing) existing.remove();

    var overlay = document.createElement("div");
    overlay.className = "location-modal-overlay";
    overlay.innerHTML =
      '<div class="location-modal">' +
        '<p>' + escapeHTML(text) + '</p>' +
        '<button class="btn btn-primary btn-block">Got it</button>' +
      '</div>';
    document.body.appendChild(overlay);

    overlay.querySelector(".btn").addEventListener("click", function () {
      overlay.remove();
    });
    overlay.addEventListener("click", function (e) {
      if (e.target === overlay) overlay.remove();
    });
  }

  function escapeHTML(str) {
    var div = document.createElement("div");
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
  }

  document.addEventListener("click", function (e) {
    var joinBtn = e.target.closest(".btn-join");
    if (joinBtn) {
      rideAction(joinBtn, "/rides/" + joinBtn.dataset.rideId + "/join", "POST", null, "You're in! Ride joined.");
      return;
    }

    var leaveBtn = e.target.closest(".btn-leave");
    if (leaveBtn) {
      rideAction(leaveBtn, "/rides/" + leaveBtn.dataset.rideId + "/join", "DELETE", "Cancel your seat on this ride?", "You've left the ride.");
      return;
    }

    var deleteBtn = e.target.closest(".btn-delete-ride");
    if (deleteBtn) {
      rideAction(deleteBtn, "/rides/" + deleteBtn.dataset.rideId, "DELETE", "Delete this ride? This can't be undone.", "Ride deleted.");
      return;
    }

    var loc = e.target.closest(".location");
    if (loc && loc.classList.contains("is-truncated")) {
      openLocationModal(loc.getAttribute("data-full") || loc.textContent);
    }
  });

  /* Mark truncated locations with a visual cue */
  function markTruncatedLocations() {
    document.querySelectorAll(".location").forEach(function (el) {
      if (el.scrollHeight > el.clientHeight) {
        el.classList.add("is-truncated");
      }
    });
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", markTruncatedLocations);
  } else {
    markTruncatedLocations();
  }
})();
