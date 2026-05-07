import { useState, useRef, useEffect } from "react";
import * as XLSX from "xlsx";

// ─── Real employee data ────────────────────────────────────────────────────────
const SAMPLE = [
  // MasTec
  { id:1,  client:"MasTec",          name:"Diego Alfredo Berumen Ponce",      role:"Project Coordinator",            manager:"", status:"pending", arrival:null, comment:"" },
  { id:2,  client:"MasTec",          name:"Liliana Mendez Andrade",           role:"Project Coordinator",            manager:"", status:"pending", arrival:null, comment:"" },
  { id:3,  client:"MasTec",          name:"Sofía Alejandra Pérez García",     role:"Talent Acquisition Administrator",manager:"", status:"pending", arrival:null, comment:"" },
  { id:4,  client:"MasTec",          name:"Luis Alfredo Treviño Aguilar",     role:"Data Entry",                     manager:"", status:"pending", arrival:null, comment:"" },
  { id:5,  client:"MasTec",          name:"Leonardo Carrasco López",          role:"Project Specialist",             manager:"", status:"pending", arrival:null, comment:"" },
  { id:6,  client:"MasTec",          name:"Andrés Mejía Mere",                role:"Project Specialist",             manager:"", status:"pending", arrival:null, comment:"" },
  { id:7,  client:"MasTec",          name:"Lizbeth Bautista López",           role:"Project Specialist",             manager:"", status:"pending", arrival:null, comment:"" },
  { id:8,  client:"MasTec",          name:"Jesse David Martinez Trejo",       role:"Project Specialist",             manager:"", status:"pending", arrival:null, comment:"" },
  { id:9,  client:"MasTec",          name:"Angel Isaac Garduño Perez",        role:"Project Specialist",             manager:"", status:"pending", arrival:null, comment:"" },
  { id:10, client:"MasTec",          name:"Alberto Morales Velazquez",        role:"Quality Control Auditor",        manager:"", status:"pending", arrival:null, comment:"" },
  { id:11, client:"MasTec",          name:"Noe Austreberto Perez Rivera",     role:"Quality Control Auditor",        manager:"", status:"pending", arrival:null, comment:"" },
  { id:12, client:"MasTec",          name:"José Alfredo Cruz Mecott",         role:"Quality Control Auditor",        manager:"", status:"pending", arrival:null, comment:"" },
  { id:13, client:"MasTec",          name:"José Alberto Núñez Rodríguez",     role:"Quality Control Auditor",        manager:"", status:"pending", arrival:null, comment:"" },
  { id:14, client:"MasTec",          name:"Adalberto Mendoza Garcia",         role:"Quality Control Auditor",        manager:"", status:"pending", arrival:null, comment:"" },
  { id:15, client:"MasTec",          name:"Gerardo Lugo Quiroz",              role:"Vendor Management Coordinator",  manager:"", status:"pending", arrival:null, comment:"" },
  { id:16, client:"MasTec",          name:"Jose Pedro Aguirre Lopez",         role:"Quality Control Auditor",        manager:"", status:"pending", arrival:null, comment:"" },
  { id:17, client:"MasTec",          name:"Diego Antonio Vivar Castellanos",  role:"IT Project Manager",             manager:"", status:"pending", arrival:null, comment:"" },
  { id:18, client:"MasTec",          name:"Osvaldo Carrillo Padilla",         role:"Quality Control Auditor",        manager:"", status:"pending", arrival:null, comment:"" },
  { id:19, client:"MasTec",          name:"Viridiana Carrasco Matuk",         role:"Vendor Management Coordinator",  manager:"", status:"pending", arrival:null, comment:"" },
  { id:20, client:"MasTec",          name:"Marco Polo Granados Chavez",       role:"Quality Control Auditor",        manager:"", status:"pending", arrival:null, comment:"" },
  { id:21, client:"MasTec",          name:"Claudia Marcela Ramírez Kalisch",  role:"eLearning Specialist",           manager:"", status:"pending", arrival:null, comment:"" },
  { id:22, client:"MasTec",          name:"Jorge Alcantara Vidal",            role:"Finance Analyst",                manager:"", status:"pending", arrival:null, comment:"" },
  { id:23, client:"MasTec",          name:"Diego Eduardo Saiz Guarneros",     role:"Quality Control Auditor",        manager:"", status:"pending", arrival:null, comment:"" },

  // Hope
  { id:24, client:"Hope",            name:"Gabriela Beatriz López Serna",     role:"Human Resources Generalist",     manager:"", status:"pending", arrival:null, comment:"" },
  { id:25, client:"Hope",            name:"Guadalupe Heva Gallegos Loaeza",   role:"Accounting Clerk",               manager:"", status:"pending", arrival:null, comment:"" },
  { id:26, client:"Hope",            name:"Alejandra Barahona Neri",          role:"Human Resources Administrator",  manager:"", status:"pending", arrival:null, comment:"" },
  { id:27, client:"Hope",            name:"José Pablo Vázquez Tello",         role:"Accounting Clerk",               manager:"", status:"pending", arrival:null, comment:"" },
  { id:28, client:"Hope",            name:"Alejandro Calderon Lopez",         role:"HR Generalist",                  manager:"", status:"pending", arrival:null, comment:"" },
  { id:29, client:"Hope",            name:"Mirta Adriana Tapia Don",          role:"Accounting Clerk",               manager:"", status:"pending", arrival:null, comment:"" },

  // Bluetuskr
  { id:30, client:"Bluetuskr",       name:"Francisco Ramon UC Loria",         role:"Project Manager E-Commerce",     manager:"", status:"pending", arrival:null, comment:"" },

  // A1 - Technology
  { id:31, client:"A1 - Technology", name:"Oscar Daniel Galicia Murillo",     role:"QA Automation Engineer",         manager:"", status:"pending", arrival:null, comment:"" },

  // 2020 Companies
  { id:32, client:"2020 Companies",  name:"Gerardo Moran Martinez",           role:"Partnership & Training Lead",    manager:"", status:"pending", arrival:null, comment:"" },
];

const ST = {
  present:  { label:"Present",     dot:"#16a34a", bg:"#dcfce7", text:"#15803d" },
  late:     { label:"Late",        dot:"#d97706", bg:"#fef3c7", text:"#b45309" },
  vacation: { label:"On Vacation", dot:"#0284c7", bg:"#e0f2fe", text:"#0369a1" },
  absent:   { label:"Absent",      dot:"#7c3aed", bg:"#ede9fe", text:"#6d28d9" },
  pending:  { label:"Unreported",  dot:"#dc2626", bg:"#fee2e2", text:"#b91c1c" },
};

// A distinct color per client index
const CLIENT_COLORS = ["#4f46e5","#0891b2","#059669","#d97706","#db2777","#7c3aed"];

// ─── Excel parsing ─────────────────────────────────────────────────────────────
const COL_ALIASES = {
  client:  ["client","cliente","company","empresa","account"],
  name:    ["name","employee name","full name","nombre"],
  role:    ["role","position","job title","puesto"],
  manager: ["manager","supervisor","lead","jefe","responsable"],
  status:  ["status","attendance","estado","asistencia"],
  arrival:  ["arrival","arrival time","check-in","time in","hora","hora llegada"],
  comment:  ["comment","comments","notes","note","nota","notas","observaciones","reason","motivo"],
};

function findCol(headers, aliases) {
  return headers.find(h => aliases.includes(h.toLowerCase().trim())) ?? null;
}

function normStatus(r = "") {
  const s = r.toString().toLowerCase().trim();
  if (!s) return "pending";
  if (s.includes("vacation") || s.includes("vacacion") || s.includes("holiday") || s.includes("fuera") || s.includes("pto") || s === "off") return "vacation";
  if (s.includes("absent")   || s.includes("ausente")  || s.includes("falta"))   return "absent";
  if (s.includes("late")     || s.includes("tarde")    || s.includes("tardy")    || s.includes("delayed")) return "late";
  if (s.includes("present")  || s.includes("presente") || s.includes("here")     || s.includes("on time") || s.includes("checked in")) return "present";
  return "pending";
}

function parseExcel(file, onOk, onErr) {
  const rd = new FileReader();
  rd.onload = e => {
    try {
      const wb   = XLSX.read(e.target.result, { type: "array" });
      const ws   = wb.Sheets[wb.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(ws, { defval: "" });
      if (!rows.length) { onErr("The sheet is empty."); return; }

      const headers = Object.keys(rows[0]);
      const cCl  = findCol(headers, COL_ALIASES.client);
      const cN   = findCol(headers, COL_ALIASES.name);
      const cR   = findCol(headers, COL_ALIASES.role);
      const cM   = findCol(headers, COL_ALIASES.manager);
      const cS   = findCol(headers, COL_ALIASES.status);
      const cA   = findCol(headers, COL_ALIASES.arrival);
      const cCo  = findCol(headers, COL_ALIASES.comment);

      if (!cN) { onErr("Could not find a Name column. Found: " + headers.join(", ")); return; }

      onOk(rows.map((row, i) => ({
        id:      i + 1,
        client:  cCl  ? (row[cCl]  || "Unknown Client") : "Unknown Client",
        name:    row[cN]  ?? "Unknown",
        role:    cR   ? (row[cR]   || "—") : "—",
        manager: cM   ? (row[cM]   || "—") : "—",
        status:  cS   ? normStatus(row[cS]) : "pending",
        arrival: cA   ? (row[cA]?.toString() || null) : null,
        comment: cCo  ? (row[cCo]?.toString() || "") : "",
      })));
    } catch (err) { onErr(err.message); }
  };
  rd.readAsArrayBuffer(file);
}

function initials(n = "") {
  return n.split(" ").slice(0, 2).map(w => w[0]?.toUpperCase() ?? "").join("");
}

// ─── Google Sheets API ─────────────────────────────────────────────────────────
const SHEETS_API_URL = "https://script.google.com/macros/s/AKfycby8DhUqfbdgS1cQNW7aX3Jy0x-axbsrl3-tu5-6q_mScJYsbTO71sSFcmbPs7M2w9Qm/exec";

// ─── Component ─────────────────────────────────────────────────────────────────
export default function DashboardCorporate() {
  // Detect ?client= param in the URL — locks the view to that client
  const urlParams = new URLSearchParams(typeof window !== "undefined" ? window.location.search : "");
  const urlClient = urlParams.get("client") || urlParams.get("Client") || null;

  // If a client param exists, find the matching client name (case-insensitive)
  const matchClient = (name) =>
    urlClient ? name.toLowerCase().replace(/\s/g,"") === urlClient.toLowerCase().replace(/\s/g,"") : false;

  const lockedClient = urlClient
    ? (SAMPLE.map(e => e.client).find(c => matchClient(c)) ?? null)
    : null;

  const isClientMode = !!lockedClient;

  const [employees, setEmployees] = useState(SAMPLE);
  const [loading, setLoading]     = useState(true);
  const [sheetError, setSheetError] = useState(null);
  const [activeClient, setActiveClient] = useState(lockedClient ?? "all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch]       = useState("");
  const [fileName, setFileName]   = useState(null);
  const [fileError, setFileError] = useState(null);
  const [dragOver, setDragOver]   = useState(false);
  const [editingComment, setEditingComment] = useState(null);
  const fileRef = useRef();
  const commentRef = useRef();

  // ── Fetch from Google Sheets on load ──
  useEffect(() => {
    setLoading(true);
    fetch(SHEETS_API_URL)
      .then(res => res.json())
      .then(rows => {
        if (!rows || !rows.length) { setLoading(false); return; }

        const mapped = rows
          .filter(r => r["Name"] || r["name"] || r["Nombre"])
          .map((r, i) => {
            // Parse date — handle formats like 7/5/2026, 2026-05-07, etc.
            const rawDate = r["Date"] || r["date"] || r["Fecha"] || "";
            let dateKey = "";
            if (rawDate) {
              const d = new Date(rawDate);
              if (!isNaN(d)) {
                dateKey = `${d.getMonth()+1}/${d.getDate()}/${d.getFullYear()}`;
              } else {
                dateKey = rawDate.toString().trim();
              }
            }
            return {
              id:      i + 1,
              date:    dateKey,
              client:  r["Client"]  || r["client"]  || r["Cliente"] || "Unknown",
              name:    r["Name"]    || r["name"]    || r["Nombre"]  || "Unknown",
              role:    r["Role"]    || r["role"]    || r["Posición"]|| "—",
              manager: r["Manager"] || r["manager"] || r["Jefe"]    || "—",
              status:  normStatus(r["Status"] || r["status"] || r["Estado"] || ""),
              arrival: r["Arrival"] || r["arrival"] || r["Hora"]    || null,
              comment: r["Comment"] || r["comment"] || r["Comentario"] || "",
            };
          });

        if (mapped.length > 0) {
          setEmployees(mapped);
          if (urlClient) {
            const match = mapped.map(e => e.client).find(c =>
              c.toLowerCase().replace(/\s/g,"") === urlClient.toLowerCase().replace(/\s/g,"")
            );
            if (match) setActiveClient(match);
          }
        }
        setLoading(false);
      })
      .catch(() => {
        setSheetError("Could not connect to Google Sheets — showing local data.");
        setLoading(false);
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const now     = new Date();
  const todayKey = `${now.getMonth()+1}/${now.getDate()}/${now.getFullYear()}`;
  const timeStr = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  const dateStr = now.toLocaleDateString("en-US",  { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  // All unique dates available in the data
  const availableDates = [...new Set(employees.map(e => e.date).filter(Boolean))].sort((a,b) => new Date(a)-new Date(b));
  const [selectedDate, setSelectedDate] = useState("today");

  // Resolve which date key to filter by
  const activeDateKey = selectedDate === "today" ? todayKey : selectedDate;

  // Unique client list (scoped to selected date)
  const clients = [...new Set(employees.filter(e => !e.date || e.date === activeDateKey).map(e => e.client))];
  const clientColor = c => CLIENT_COLORS[clients.indexOf(c) % CLIENT_COLORS.length];

  // Employees scoped to selected date + client
  const dateScoped = employees.filter(e => !e.date || e.date === activeDateKey);
  const clientScoped = activeClient === "all"
    ? dateScoped
    : dateScoped.filter(e => e.client === activeClient);

  // Status counts
  const counts = {
    present:  clientScoped.filter(e => e.status === "present").length,
    late:     clientScoped.filter(e => e.status === "late").length,
    vacation: clientScoped.filter(e => e.status === "vacation").length,
    absent:   clientScoped.filter(e => e.status === "absent").length,
    pending:  clientScoped.filter(e => e.status === "pending").length,
  };

  // Sorting
  const [sortBy, setSortBy]     = useState(null); // "name"|"role"|"manager"|"status"
  const [sortDir, setSortDir]   = useState("asc");

  function handleSort(col) {
    if (sortBy === col) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortBy(col); setSortDir("asc"); }
  }

  // Final filtered + sorted rows
  const filtered = clientScoped
    .filter(e => {
      const mS = statusFilter === "all" || e.status === statusFilter;
      const mQ = [e.name, e.role, e.manager].some(v =>
        v.toLowerCase().includes(search.toLowerCase())
      );
      return mS && mQ;
    })
    .sort((a, b) => {
      if (!sortBy) return 0;
      const va = (a[sortBy] || "").toLowerCase();
      const vb = (b[sortBy] || "").toLowerCase();
      return sortDir === "asc" ? va.localeCompare(vb) : vb.localeCompare(va);
    });

  const coverage = clientScoped.length
    ? Math.round(((counts.present + counts.late) / clientScoped.length) * 100)
    : 0;

  function handleFile(file) {
    if (!file) return;
    setFileError(null);
    parseExcel(
      file,
      data => { setEmployees(data); setFileName(file.name); setActiveClient("all"); setStatusFilter("all"); setSearch(""); },
      msg  => setFileError(msg)
    );
  }

  function resetAll() {
    setEmployees(SAMPLE);
    setFileName(null);
    setFileError(null);
    setActiveClient("all");
    setStatusFilter("all");
    setSearch("");
  }

  function openComment(emp) {
    setEditingComment({ id: emp.id, draft: emp.comment || "" });
    setTimeout(() => commentRef.current?.focus(), 50);
  }

  function saveComment() {
    if (!editingComment) return;
    setEmployees(prev => prev.map(e =>
      e.id === editingComment.id ? { ...e, comment: editingComment.draft.trim() } : e
    ));
    setEditingComment(null);
  }

  return (
    <div style={{ minHeight:"100vh", background:"#f8fafc", fontFamily:"'Sora','Segoe UI',sans-serif", color:"#0f172a" }}>
      <style>{`        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        .row-hover:hover{background:#f1f5f9!important;cursor:default}
        .fbtn{border:none;cursor:pointer;transition:all .15s;font-family:inherit}
        .fbtn:hover{filter:brightness(.95)}
        .inp2{background:#fff;border:1.5px solid #e2e8f0;color:#0f172a;outline:none;font-family:inherit;transition:border .2s}
        .inp2:focus{border-color:#4f46e5;box-shadow:0 0 0 3px rgba(79,70,229,.08)}
        .drop2{border:2px dashed #cbd5e1;border-radius:10px;padding:18px;text-align:center;cursor:pointer;transition:all .2s;background:#fff}
        .drop2:hover,.drop2.over{border-color:#4f46e5;background:#eef2ff}
        @keyframes fadein{from{opacity:0;transform:translateY(5px)}to{opacity:1;transform:none}}
        @keyframes modal-in{from{opacity:0;transform:scale(.97)}to{opacity:1;transform:none}}
        .fade{animation:fadein .25s ease both}
        .client-btn{border:none;cursor:pointer;font-family:inherit;transition:all .15s;text-align:left;width:100%}
        .client-btn:hover{background:#f8fafc!important}
        .comment-cell{cursor:pointer;max-width:220px}
        .comment-cell:hover .comment-edit-hint{opacity:1!important}
        .modal-overlay{position:fixed;inset:0;background:rgba(15,23,42,.35);z-index:100;display:flex;align-items:center;justify-content:center;backdrop-filter:blur(2px)}
        .modal-box{background:#fff;border-radius:16px;box-shadow:0 24px 60px rgba(0,0,0,.18);width:440px;max-width:94vw;animation:modal-in .2s ease;overflow:hidden}
        .comment-ta{width:100%;border:1.5px solid #e2e8f0;border-radius:10px;padding:12px 14px;font-family:inherit;font-size:13px;color:#0f172a;resize:vertical;outline:none;transition:border .2s;min-height:90px}
        .comment-ta:focus{border-color:#4f46e5;box-shadow:0 0 0 3px rgba(79,70,229,.08)}
        ::-webkit-scrollbar{width:5px}::-webkit-scrollbar-thumb{background:#cbd5e1;border-radius:3px}
        .sidebar-section{font-size:10px;font-weight:600;color:#94a3b8;letter-spacing:0.1em;text-transform:uppercase;padding:0 8px;margin-bottom:6px;margin-top:20px}
      `}</style>

      {/* ── Loading banner ── */}
      {loading && (
        <div style={{ position:"fixed", top:0, left:0, right:0, zIndex:200, background:"#4f46e5", color:"#fff",
          padding:"10px", textAlign:"center", fontSize:13, fontWeight:600 }}>
          ⟳ Loading data from Google Sheets…
        </div>
      )}

      {/* ── Sheet error banner ── */}
      {sheetError && (
        <div style={{ position:"fixed", top:0, left:0, right:0, zIndex:200, background:"#f59e0b", color:"#fff",
          padding:"10px", textAlign:"center", fontSize:13, fontWeight:600 }}>
          ⚠ {sheetError}
        </div>
      )}

      {/* ── Comment edit modal ── */}
      {editingComment && (() => {
        const emp = employees.find(e => e.id === editingComment.id);
        const cfg = ST[emp?.status] ?? ST.pending;
        return (
          <div className="modal-overlay" onClick={saveComment}>
            <div className="modal-box" onClick={e => e.stopPropagation()}>
              {/* Modal header */}
              <div style={{ padding:"18px 20px 14px", borderBottom:"1px solid #f1f5f9", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <div>
                  <div style={{ fontWeight:700, fontSize:14, color:"#0f172a" }}>{emp?.name}</div>
                  <div style={{ fontSize:11, color:"#94a3b8", marginTop:2 }}>
                    <span style={{ display:"inline-flex", alignItems:"center", gap:4 }}>
                      <span style={{ width:6, height:6, borderRadius:"50%", background:cfg.dot, display:"inline-block" }}/>
                      {cfg.label}
                    </span>
                    {emp?.arrival && <span style={{ marginLeft:8, fontFamily:"monospace" }}>· {emp.arrival}</span>}
                  </div>
                </div>
                <button onClick={saveComment} style={{ border:"none", background:"none", cursor:"pointer", color:"#94a3b8", fontSize:18, lineHeight:1, padding:4 }}>✕</button>
              </div>
              {/* Textarea */}
              <div style={{ padding:"16px 20px" }}>
                <label style={{ fontSize:11, fontWeight:600, color:"#64748b", letterSpacing:"0.06em", textTransform:"uppercase", display:"block", marginBottom:8 }}>
                  Comment / Note
                </label>
                <textarea
                  ref={commentRef}
                  className="comment-ta"
                  placeholder="Add a note about this employee's attendance…"
                  value={editingComment.draft}
                  onChange={e => setEditingComment(prev => ({ ...prev, draft: e.target.value }))}
                  onKeyDown={e => { if (e.key === "Enter" && e.metaKey) saveComment(); if (e.key === "Escape") setEditingComment(null); }}
                />
                <div style={{ fontSize:11, color:"#94a3b8", marginTop:6 }}>⌘ + Enter to save · Esc to cancel</div>
              </div>
              {/* Actions */}
              <div style={{ padding:"0 20px 18px", display:"flex", justifyContent:"flex-end", gap:8 }}>
                <button onClick={() => setEditingComment(null)}
                  style={{ border:"1.5px solid #e2e8f0", background:"#fff", color:"#64748b", borderRadius:8, padding:"8px 16px", fontSize:13, fontWeight:500, cursor:"pointer", fontFamily:"inherit" }}>
                  Cancel
                </button>
                <button onClick={saveComment}
                  style={{ border:"none", background:"#4f46e5", color:"#fff", borderRadius:8, padding:"8px 18px", fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:"inherit" }}>
                  Save comment
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      <div style={{ display:"flex", minHeight:"100vh" }}>

        {/* ── Sidebar — hidden in client mode ── */}
        {!isClientMode && (
        <div style={{ width:248, background:"#fff", borderRight:"1px solid #e2e8f0", padding:"24px 0", display:"flex", flexDirection:"column", flexShrink:0, overflowY:"auto" }}>

          {/* Logo */}
          <div style={{ padding:"0 24px", marginBottom:28 }}>
            <div style={{ width:36, height:36, borderRadius:10, background:"#4f46e5", display:"flex", alignItems:"center", justifyContent:"center", marginBottom:10 }}>
              <span style={{ color:"#fff", fontSize:18 }}>◈</span>
            </div>
            <div style={{ fontSize:13, fontWeight:700, color:"#0f172a", letterSpacing:"-0.02em" }}>AttendanceHQ</div>
            <div style={{ fontSize:11, color:"#94a3b8", marginTop:2 }}>Mexico · {now.getFullYear()}</div>
          </div>

          <div style={{ padding:"0 16px" }}>

            {/* Client filter */}
            <div className="sidebar-section">Clients</div>
            {[{ key:"all", label:"All Clients", count:employees.length, color:"#4f46e5" },
              ...clients.map(c => ({ key:c, label:c, count:employees.filter(e=>e.client===c).length, color:clientColor(c) }))
            ].map(({ key, label, count, color }) => (
              <button key={key} className="client-btn"
                onClick={() => { setActiveClient(key); setStatusFilter("all"); setSearch(""); }}
                style={{
                  padding:"8px 12px", borderRadius:8,
                  background: activeClient === key ? color + "12" : "transparent",
                  color: activeClient === key ? color : "#64748b",
                  display:"flex", justifyContent:"space-between", alignItems:"center",
                  fontSize:13, fontWeight: activeClient === key ? 600 : 400, marginBottom:2,
                  borderLeft: activeClient === key ? `3px solid ${color}` : "3px solid transparent",
                }}>
                <span style={{ overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", paddingRight:6 }}>
                  {key === "all" ? "🌐 " : "🏢 "}{label}
                </span>
                <span style={{ fontSize:11, fontWeight:600, color: activeClient === key ? color : "#94a3b8", flexShrink:0 }}>{count}</span>
              </button>
            ))}

            {/* Status filter */}
            <div className="sidebar-section">Status</div>
            {[["all","All Statuses", clientScoped.length, "#4f46e5"],
              ...Object.entries(ST).map(([k,v]) => [k, v.label, counts[k], v.dot])
            ].map(([key, label, count, color]) => (
              <button key={key} className="fbtn"
                onClick={() => setStatusFilter(key)}
                style={{
                  width:"100%", textAlign:"left", padding:"8px 12px", borderRadius:8,
                  background: statusFilter === key ? "#eef2ff" : "transparent",
                  color: statusFilter === key ? "#4f46e5" : "#64748b",
                  display:"flex", justifyContent:"space-between", alignItems:"center",
                  fontSize:13, fontWeight: statusFilter === key ? 600 : 400, marginBottom:2,
                }}>
                <span style={{ display:"flex", alignItems:"center", gap:8 }}>
                  {key !== "all" && <span style={{ width:7, height:7, borderRadius:"50%", background:color, display:"inline-block", flexShrink:0 }}/>}
                  {label}
                </span>
                <span style={{ fontSize:11, fontWeight:600, color: statusFilter === key ? "#4f46e5" : "#94a3b8" }}>{count}</span>
              </button>
            ))}
          </div>

          {/* Coverage */}
          <div style={{ marginTop:"auto", padding:"20px 24px 0" }}>
            <div style={{ fontSize:11, color:"#94a3b8" }}>
              {activeClient === "all" ? "Overall coverage" : "Client coverage"}
            </div>
            <div style={{ fontSize:24, fontWeight:700, color:"#0f172a", fontFamily:"'JetBrains Mono',monospace", marginTop:2 }}>
              {coverage}%
            </div>
            <div style={{ height:4, background:"#e2e8f0", borderRadius:2, marginTop:8 }}>
              <div style={{ height:"100%", borderRadius:2, background:"#4f46e5", width:`${coverage}%`, transition:"width .6s" }}/>
            </div>
            <div style={{ fontSize:11, color:"#94a3b8", marginTop:6 }}>
              {counts.present + counts.late} of {clientScoped.length} employees active
            </div>
          </div>
        </div>
        )} {/* end sidebar */}

        {/* ── Main content ── */}
        <div style={{ flex:1, overflow:"auto" }}>

          {/* Top bar */}
          <div style={{ background:"#fff", borderBottom:"1px solid #e2e8f0", padding:"16px 32px", display:"flex", justifyContent:"space-between", alignItems:"center", position:"sticky", top:0, zIndex:10 }}>
            <div style={{ display:"flex", alignItems:"center", gap:14 }}>
              {/* Logo — shown in client mode since sidebar is hidden */}
              {isClientMode && (
                <div style={{ width:32, height:32, borderRadius:8, background:"#4f46e5", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                  <span style={{ color:"#fff", fontSize:15 }}>◈</span>
                </div>
              )}
              <div>
                <h1 style={{ fontSize:20, fontWeight:700, color:"#0f172a", letterSpacing:"-0.02em" }}>
                  {isClientMode ? lockedClient : (activeClient === "all" ? "All Employees" : activeClient)}
                </h1>
                <div style={{ fontSize:12, color:"#94a3b8", marginTop:2 }}>{dateStr}</div>
              </div>
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:12 }}>
              {/* Status pills — shown in client mode as quick filter */}
              {isClientMode && (
                <div style={{ display:"flex", gap:6 }}>
                  {[["all","All", clientScoped.length, "#4f46e5"],
                    ...Object.entries(ST).map(([k,v]) => [k, v.label, counts[k], v.dot])
                  ].map(([key, label, count, color]) => (
                    <button key={key} className="fbtn"
                      onClick={() => setStatusFilter(key)}
                      style={{ padding:"5px 12px", borderRadius:20, fontSize:12, fontWeight:600,
                        background: statusFilter === key ? color : "#f1f5f9",
                        color: statusFilter === key ? "#fff" : "#64748b",
                        border: `1.5px solid ${statusFilter === key ? color : "#e2e8f0"}` }}>
                      {label} {count > 0 ? `· ${count}` : ""}
                    </button>
                  ))}
                </div>
              )}
              {/* Date selector */}
              <select
                value={selectedDate}
                onChange={e => { setSelectedDate(e.target.value); setStatusFilter("all"); }}
                style={{ padding:"7px 12px", borderRadius:8, border:"1.5px solid #e2e8f0", fontSize:13,
                  fontFamily:"inherit", color:"#0f172a", background:"#fff", cursor:"pointer", outline:"none" }}>
                <option value="today">📅 Today</option>
                {availableDates.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
              {!isClientMode && activeClient !== "all" && (
                <span style={{ fontSize:12, padding:"4px 10px", borderRadius:6,
                  background: clientColor(activeClient) + "15",
                  color: clientColor(activeClient), fontWeight:600 }}>
                  {clientScoped.length} employees
                </span>
              )}
              <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:16, fontWeight:500, color:"#4f46e5" }}>{timeStr}</div>
              {/* Upload — admin only */}
              {!isClientMode && (
                <>
                  <div style={{ width:1, height:24, background:"#e2e8f0" }}/>
                  <button className="fbtn" onClick={() => fileRef.current.click()}
                    style={{ background:"#4f46e5", color:"#fff", borderRadius:8, padding:"8px 16px", fontSize:13, fontWeight:600 }}>
                    ↑ Upload Excel
                  </button>
                  <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" style={{ display:"none" }} onChange={e => handleFile(e.target.files[0])}/>
                </>
              )}
            </div>
          </div>

          <div style={{ padding:"24px 32px" }}>

            {/* Upload zone — admin only */}
            {!isClientMode && (
            <div className={`drop2${dragOver ? " over" : ""}`} style={{ marginBottom:20 }}
              onClick={() => fileRef.current.click()}
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={e => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]); }}>
              {fileName
                ? <div style={{ color:"#16a34a", fontWeight:600, fontSize:13 }}>
                    ✓ {fileName} loaded ·{" "}
                    <span style={{ color:"#94a3b8", fontWeight:400, cursor:"pointer", textDecoration:"underline" }}
                      onClick={e => { e.stopPropagation(); resetAll(); }}>reset to sample</span>
                  </div>
                : <>
                    <div style={{ fontSize:13, color:"#64748b" }}>📂 Drop your Excel / CSV here, or click to browse</div>
                    <div style={{ fontSize:11, color:"#94a3b8", marginTop:3 }}>
                      Expected columns: <strong>Client · Name · Role · Manager · Status · Arrival</strong>
                    </div>
                  </>
              }
              {fileError && <div style={{ color:"#dc2626", marginTop:6, fontSize:12 }}>⚠ {fileError}</div>}
            </div>
            )}

            {/* ── Summary cards ── */}
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))", gap:12, marginBottom:24 }}>
              {/* Late */}
              <div style={{ background:"#fff", borderRadius:12, border:"1px solid #fde68a", padding:"16px 18px", display:"flex", alignItems:"center", gap:14 }}>
                <div style={{ width:44, height:44, borderRadius:10, background:"#fef3c7", display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, flexShrink:0 }}>⏰</div>
                <div>
                  <div style={{ fontSize:28, fontWeight:800, color:"#b45309", lineHeight:1 }}>{counts.late}</div>
                  <div style={{ fontSize:11, color:"#92400e", fontWeight:600, marginTop:3 }}>Late</div>
                </div>
              </div>
              {/* On Vacation */}
              <div style={{ background:"#fff", borderRadius:12, border:"1px solid #bae6fd", padding:"16px 18px", display:"flex", alignItems:"center", gap:14 }}>
                <div style={{ width:44, height:44, borderRadius:10, background:"#e0f2fe", display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, flexShrink:0 }}>✈️</div>
                <div>
                  <div style={{ fontSize:28, fontWeight:800, color:"#0369a1", lineHeight:1 }}>{counts.vacation}</div>
                  <div style={{ fontSize:11, color:"#075985", fontWeight:600, marginTop:3 }}>On Vacation</div>
                </div>
              </div>
              {/* Absent */}
              <div style={{ background:"#fff", borderRadius:12, border:"1px solid #ddd6fe", padding:"16px 18px", display:"flex", alignItems:"center", gap:14 }}>
                <div style={{ width:44, height:44, borderRadius:10, background:"#ede9fe", display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, flexShrink:0 }}>🚫</div>
                <div>
                  <div style={{ fontSize:28, fontWeight:800, color:"#6d28d9", lineHeight:1 }}>{counts.absent}</div>
                  <div style={{ fontSize:11, color:"#5b21b6", fontWeight:600, marginTop:3 }}>Absent</div>
                </div>
              </div>
              {/* Unreported */}
              <div style={{ background:"#fff", borderRadius:12, border:"1px solid #fecaca", padding:"16px 18px", display:"flex", alignItems:"center", gap:14 }}>
                <div style={{ width:44, height:44, borderRadius:10, background:"#fee2e2", display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, flexShrink:0 }}>❓</div>
                <div>
                  <div style={{ fontSize:28, fontWeight:800, color:"#b91c1c", lineHeight:1 }}>{counts.pending}</div>
                  <div style={{ fontSize:11, color:"#991b1b", fontWeight:600, marginTop:3 }}>Unreported</div>
                </div>
              </div>
              {/* Coverage bar */}
              <div style={{ background:"#fff", borderRadius:12, border:"1px solid #e2e8f0", padding:"16px 18px", gridColumn:"span 1" }}>
                <div style={{ fontSize:11, color:"#64748b", fontWeight:600, marginBottom:6 }}>COVERAGE TODAY</div>
                <div style={{ fontSize:28, fontWeight:800, color:"#4f46e5", lineHeight:1 }}>{coverage}%</div>
                <div style={{ height:4, background:"#e2e8f0", borderRadius:2, marginTop:8 }}>
                  <div style={{ height:"100%", borderRadius:2, background:"#4f46e5", width:`${coverage}%`, transition:"width .6s" }}/>
                </div>
                <div style={{ fontSize:10, color:"#94a3b8", marginTop:4 }}>{counts.present + counts.late} of {clientScoped.length} active</div>
              </div>
            </div>

            {/* Search bar */}
            <div style={{ position:"relative", maxWidth:360, marginBottom:20 }}>
              <span style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", color:"#94a3b8", fontSize:13 }}>🔍</span>
              <input className="inp2" placeholder="Search by name, role or manager…"
                value={search} onChange={e => setSearch(e.target.value)}
                style={{ width:"100%", padding:"9px 12px 9px 34px", borderRadius:8, fontSize:13 }}/>
            </div>

            {/* Table */}
            <div style={{ background:"#fff", borderRadius:12, border:"1px solid #e2e8f0", overflow:"hidden" }}>
              <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
                <thead>
                  <tr style={{ background:"#f8fafc", borderBottom:"1px solid #e2e8f0" }}>
                    {((!isClientMode && activeClient === "all")
                      ? [["Employee","name"],["Role","role"],["Manager","manager"],["Client",null],["Status","status"],["Time",null],["Notes",null]]
                      : [["Employee","name"],["Role","role"],["Manager","manager"],["Status","status"],["Time",null],["Notes",null]]
                    ).map(([h, col]) => (
                      <th key={h}
                        onClick={() => col && handleSort(col)}
                        style={{ padding:"12px 16px", textAlign:"left", fontWeight:600, color: col && sortBy===col ? "#4f46e5" : "#64748b",
                          fontSize:11, textTransform:"uppercase", letterSpacing:"0.06em",
                          cursor: col ? "pointer" : "default", userSelect:"none",
                          whiteSpace:"nowrap" }}>
                        {h}
                        {col && <span style={{ marginLeft:4, opacity: sortBy===col ? 1 : 0.3 }}>
                          {sortBy===col ? (sortDir==="asc" ? "↑" : "↓") : "↕"}
                        </span>}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((emp, i) => {
                    const cfg = ST[emp.status] ?? ST.pending;
                    const cc  = clientColor(emp.client);
                    return (
                      <tr key={emp.id} className="row-hover fade"
                        style={{ borderBottom: i < filtered.length - 1 ? "1px solid #f1f5f9" : "none", animationDelay:`${i * 0.025}s` }}>

                        {/* Employee */}
                        <td style={{ padding:"13px 16px" }}>
                          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                            <div style={{ width:34, height:34, borderRadius:8, background:cfg.bg, display:"flex", alignItems:"center",
                              justifyContent:"center", fontSize:11, fontWeight:700, color:cfg.text, flexShrink:0 }}>
                              {initials(emp.name)}
                            </div>
                            <span style={{ fontWeight:600, color:"#0f172a" }}>{emp.name}</span>
                          </div>
                        </td>

                        {/* Role */}
                        <td style={{ padding:"13px 16px", color:"#64748b" }}>{emp.role}</td>

                        {/* Manager */}
                        <td style={{ padding:"13px 16px" }}>
                          <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                            <div style={{ width:22, height:22, borderRadius:6, background:"#f1f5f9", display:"flex", alignItems:"center",
                              justifyContent:"center", fontSize:9, fontWeight:700, color:"#64748b", flexShrink:0 }}>
                              {initials(emp.manager)}
                            </div>
                            <span style={{ color:"#475569", fontSize:12 }}>{emp.manager}</span>
                          </div>
                        </td>

                        {/* Client — only shown in admin "All Clients" view */}
                        {!isClientMode && activeClient === "all" && (
                          <td style={{ padding:"13px 16px" }}>
                            <span style={{ display:"inline-flex", alignItems:"center", gap:5, padding:"3px 10px", borderRadius:6,
                              background: cc + "15", color: cc, fontWeight:600, fontSize:11 }}>
                              {emp.client}
                            </span>
                          </td>
                        )}

                        {/* Status */}
                        <td style={{ padding:"13px 16px" }}>
                          <span style={{ display:"inline-flex", alignItems:"center", gap:5, padding:"4px 10px", borderRadius:20,
                            background:cfg.bg, color:cfg.text, fontWeight:600, fontSize:11 }}>
                            <span style={{ width:6, height:6, borderRadius:"50%", background:cfg.dot }}/>
                            {cfg.label}
                          </span>
                        </td>

                        {/* Arrival time */}
                        <td style={{ padding:"13px 16px", fontFamily:"'JetBrains Mono',monospace", color: emp.arrival ? cfg.text : "#cbd5e1", fontSize:12 }}>
                          {emp.arrival ?? "—"}
                        </td>

                        {/* Notes / Comment */}
                        <td style={{ padding:"13px 16px" }}>
                          <div
                            className={!isClientMode ? "comment-cell" : ""}
                            onClick={() => !isClientMode && openComment(emp)}
                            style={{ display:"flex", alignItems:"center", gap:6, minWidth:160, cursor: isClientMode ? "default" : "pointer" }}>
                            {emp.comment ? (
                              <>
                                <span style={{ fontSize:14, flexShrink:0 }}>💬</span>
                                <span style={{ fontSize:12, color:"#475569", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", maxWidth:180 }}>
                                  {emp.comment}
                                </span>
                                {!isClientMode && <span className="comment-edit-hint" style={{ fontSize:10, color:"#94a3b8", flexShrink:0, opacity:0, transition:"opacity .15s" }}>✎</span>}
                              </>
                            ) : (
                              !isClientMode
                                ? <span style={{ fontSize:12, color:"#cbd5e1", display:"flex", alignItems:"center", gap:5 }}><span style={{ fontSize:13 }}>＋</span> Add note</span>
                                : <span style={{ fontSize:12, color:"#e2e8f0" }}>—</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {filtered.length === 0 && (
                <div style={{ padding:"48px", textAlign:"center", color:"#94a3b8" }}>
                  No employees match your current filters.
                </div>
              )}

              {/* Table footer */}
              <div style={{ padding:"10px 16px", borderTop:"1px solid #f1f5f9", display:"flex", justifyContent:"space-between", background:"#f8fafc" }}>
                <span style={{ fontSize:11, color:"#94a3b8" }}>
                  {filtered.length} of {clientScoped.length} records
                  {activeClient !== "all" && <span style={{ color: clientColor(activeClient), fontWeight:600 }}> · {activeClient}</span>}
                </span>
                <span style={{ fontSize:11 }}>
                  {counts.pending > 0
                    ? <span style={{ color:"#dc2626", fontWeight:600 }}>⚠ {counts.pending} unreported</span>
                    : <span style={{ color:"#16a34a" }}>All employees accounted for ✓</span>
                  }
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
