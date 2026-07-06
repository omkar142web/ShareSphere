import Path from "path";

export const createHttpError = (statusCode, message) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

export const notFoundHandler = (req, res) => {
  const viewsPath = Path.join(process.cwd(), "views");
  if (req.path.startsWith("/api/") || req.accepts(["html", "json"]) === "json") {
    return res.status(404).json({ success: false, message: "Not found" });
  }
  res.status(404).sendFile(Path.join(viewsPath, "404.html"), (err) => {
    if (err) res.status(404).send("Page not found");
  });
};

export const errorHandler = (err, req, res, next) => {
  if (res.headersSent) return next(err);
  const statusCode = err.statusCode || 500;
  console.error("Error:", err);
  if (req.path.startsWith("/api/") || req.accepts(["html", "json"]) === "json") {
    return res.status(statusCode).json({
      success: false,
      message: statusCode === 404 ? "Not found" : "Internal Server Error",
    });
  }
  const viewsPath = Path.join(process.cwd(), "views");
  res.status(statusCode).sendFile(Path.join(viewsPath, "500.html"), (fileErr) => {
    if (fileErr) res.status(500).send("Server error");
  });
};
