// server/dev-proxy.js
import express from "express";
import cors from "cors";
import { createProxyMiddleware } from "http-proxy-middleware";

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

// 🟡 Log all requests going to the proxy
app.use("/mint_proxy", (req, res, next) => {
  console.log("🔄 Proxying request to:", req.method, req.originalUrl);
  console.log("📦 Headers:", req.headers);
  next();
});

app.use(
  "/tenent_proxy",
  createProxyMiddleware({
    target: "https://mint-fastapi-app.cfapps.eu10-004.hana.ondemand.com", // 🔁 replace this
    changeOrigin: true,
    secure: false,
    followRedirects: true,
    pathRewrite: {
      "^/tenent_proxy": "",
    },
    logLevel: "debug",
    onProxyRes(proxyRes, req, res) {
      console.log(`✅ Response from backend: ${proxyRes.statusCode}`);
    },
  })
);

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`🟢 Dev proxy running at http://localhost:${PORT}`);
});
