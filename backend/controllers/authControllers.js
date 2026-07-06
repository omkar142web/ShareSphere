import { findUserByEmail, createUser } from "../services/auth.service.js";

const COOKIE_OPTIONS = {
  httpOnly: true,
  maxAge: 1000 * 60 * 60 * 24 * 30,
};

const setUserCookies = (res, user) => {
  const cookies = {
    name: user.name,
    email: user.email,
    password: user.password,
  };
  Object.entries(cookies).forEach(([key, value]) => {
    res.cookie(key, value, COOKIE_OPTIONS);
  });
};

function clearUserCookies(res) {
  ["name", "email", "password"].forEach((cookie) => {
    res.clearCookie(cookie);
  });
}

export const getHome = async (req, res) => {
  if (req.cookies.email && req.cookies.password) {
    return res.redirect("/dashboard");
  }
  return res.render("home", { user: null });
};

export const getLogin = async (req, res, next) => {
  try {
    if (!req.cookies.email || !req.cookies.password) {
      return res.render("login");
    }
    const user = await findUserByEmail(req.cookies.email);
    if (!user || user.password !== req.cookies.password) {
      clearUserCookies(res);
      return res.render("login");
    }
    return res.redirect("/dashboard");
  } catch (err) {
    console.error("Login GET error ❌", err);
    return next(err);
  }
};

export const postLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    const user = await findUserByEmail(email);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "No account found with that email. Please register first.",
        field: "email",
      });
    }

    if (user.password !== password) {
      return res.status(401).json({
        success: false,
        message: "Incorrect password. Please try again.",
        field: "password",
      });
    }

    setUserCookies(res, user);

    return res.json({ success: true, redirect: "/dashboard" });
  } catch (err) {
    console.error("Login POST error ❌", err);
    return res.status(500).json({
      success: false,
      message: "Something went wrong. Please try again.",
    });
  }
};

export const getRegister = (req, res) => {
  res.render("register");
};

export const postRegister = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required.",
      });
    }

    const existingUser = await findUserByEmail(email);

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists. Try logging in.",
        field: "email",
      });
    }

    await createUser({ ...req.body, eco_score: 0 });
    setUserCookies(res, { name, email, password });

    return res.json({ success: true, redirect: "/dashboard" });
  } catch (err) {
    console.error("Register POST error ❌", err);
    return res.status(500).json({
      success: false,
      message: "Something went wrong. Please try again.",
    });
  }
};

export const logoutUser = (req, res) => {
  clearUserCookies(res);
  res.redirect("/");
};
