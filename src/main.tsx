import React from "react";
import ReactDOM from "react-dom/client";
import Landing from "./components/Landing";
import Studio from "./components/Studio";
import Marketplace from "./components/Marketplace";
import "./styles.css";
import "./marketplace.css";

const studio = window.location.pathname === "/studio" || window.location.pathname.startsWith("/studio/");
const path = window.location.pathname.replace(/\/$/, "");
const view = ["/campaigns", "/creators", "/workspace"].includes(path) ? path.slice(1) as "campaigns" | "creators" | "workspace" : null;
if (studio) document.title = "Admasker Studio — 장면을 지키는 PPL";
else if (view) document.title = `${view === "campaigns" ? "캠페인 찾기" : view === "creators" ? "크리에이터 찾기" : "내 워크스페이스"} — Admasker`;
ReactDOM.createRoot(document.getElementById("root")!).render(<React.StrictMode>{studio ? <Studio /> : view ? <Marketplace view={view} /> : <Landing />}</React.StrictMode>);
