"use client";

import { useEffect, useRef, useState, type PointerEvent } from "react";
import { Check, CheckCheck, ChevronDown, Clapperboard, Download, Eye, FileVideo, Focus, ImagePlus, Layers2, LoaderCircle, LockKeyhole, LogIn, Maximize, MousePointer2, Pause, Play, Plus, RotateCcw, Save, ShieldCheck, SlidersHorizontal, Sparkles, Upload, X } from "lucide-react";
import Brand from "./Brand";
import { api, ApiError } from "@/lib/api";
import { DEFAULT_PLACEMENT, type Placement, type Project, type RenderJob } from "@/shared/types";

const DEFAULT_PROMPT = "Place the reference product naturally on the table. Match the existing lighting, perspective and contact shadow. Preserve the product's shape, colors and brand details.";
const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));
const clock = (n: number) => `${Math.floor(n / 60).toString().padStart(2, "0")}:${Math.floor(n % 60).toString().padStart(2, "0")}`;

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => { const image = new Image(); image.onload = () => resolve(image); image.onerror = () => reject(new Error("이미지를 불러오지 못했습니다.")); image.src = src; });
}

export default function Studio() {
  const [session, setSession] = useState<{ displayName: string } | null>(null);
  const [sessionReady, setSessionReady] = useState(false);
  const [rendererAvailable, setRendererAvailable] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectId, setProjectId] = useState<string | null>(null);
  const [name, setName] = useState("나의 첫 번째 장면");
  const [brand, setBrand] = useState("morrow");
  const [prompt, setPrompt] = useState(DEFAULT_PROMPT);
  const [placement, setPlacement] = useState<Placement>({ ...DEFAULT_PLACEMENT });
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [productFile, setProductFile] = useState<File | null>(null);
  const [videoId, setVideoId] = useState<string | null>(null);
  const [productId, setProductId] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState("");
  const [productUrl, setProductUrl] = useState("/images/product.svg");
  const [duration, setDuration] = useState(5);
  const [videoRatio, setVideoRatio] = useState(16 / 9);
  const [productRatio, setProductRatio] = useState(2 / 3);
  const [currentTime, setCurrentTime] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [tab, setTab] = useState<"placement" | "mask" | "result">("placement");
  const [original, setOriginal] = useState(false);
  const [busy, setBusy] = useState("");
  const [dirty, setDirty] = useState(false);
  const [job, setJob] = useState<RenderJob | null>(null);
  const [toast, setToast] = useState<{ message: string; error: boolean } | null>(null);
  const [loginPrompt, setLoginPrompt] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [authBusy, setAuthBusy] = useState(false);
  const [authError, setAuthError] = useState("");
  const stageRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const productInput = useRef<HTMLInputElement>(null);
  const videoInput = useRef<HTMLInputElement>(null);
  const dragging = useRef(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const projectIdRef = useRef(projectId);
  projectIdRef.current = projectId;

  const notify = (message: string, error = false) => setToast({ message, error });
  useEffect(() => { if (!toast) return; const timer = setTimeout(() => setToast(null), 6000); return () => clearTimeout(timer); }, [toast]);
  useEffect(() => {
    let mounted = true;
    api.session().then(async (data) => {
      if (!mounted) return;
      setSession(data.user); setRendererAvailable(data.rendererAvailable); setSessionReady(true);
      if (data.user) { const result = await api.projects(); if (mounted) setProjects(result.projects); }
    }).catch(() => { if (mounted) { setSessionReady(true); notify("서버 연결을 확인해 주세요. 배치 시안은 계속 사용할 수 있습니다.", true); } });
    return () => { mounted = false; };
  }, []);
  useEffect(() => () => { if (videoUrl.startsWith("blob:")) URL.revokeObjectURL(videoUrl); }, [videoUrl]);
  useEffect(() => () => { if (productUrl.startsWith("blob:")) URL.revokeObjectURL(productUrl); }, [productUrl]);
  useEffect(() => {
    if (!job || !["queued", "rendering"].includes(job.status)) return;
    let stopped = false; let inFlight = false;
    const poll = async () => {
      if (inFlight) return; inFlight = true;
      try { const { job: next } = await api.job(job.id); if (stopped) return; setJob(next); if (next.status === "completed") { setTab("result"); notify("AI 재생성이 끝났습니다. 원본과 비교해 검수해 주세요."); } if (next.status === "failed") notify(next.error || "재생성에 실패했습니다.", true); }
      catch (error) { if (!stopped) notify(error instanceof Error ? error.message : "작업 상태 확인 실패", true); }
      finally { inFlight = false; }
    };
    const timer = setInterval(poll, 3500); return () => { stopped = true; clearInterval(timer); };
  }, [job?.id, job?.status]);

  const authenticate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setAuthBusy(true); setAuthError("");
    try {
      const result = authMode === "login" ? await api.login(email, password) : await api.register(email, password, displayName);
      setSession(result.user); setLoginPrompt(false); setPassword("");
      setProjects((await api.projects()).projects);
      notify(authMode === "login" ? "로그인했습니다. 현재 시안을 저장할 수 있어요." : "워크스페이스를 만들었습니다. 현재 시안을 저장할 수 있어요.");
    } catch (error) { setAuthError(error instanceof Error ? error.message : "로그인하지 못했습니다."); }
    finally { setAuthBusy(false); }
  };
  const logout = async () => {
    try { await api.logout(); setSession(null); setProjects([]); newProject(); notify("로그아웃했습니다."); }
    catch { notify("로그아웃하지 못했습니다.", true); }
  };
  const update = (values: Partial<Placement>) => { setPlacement((old) => ({ ...old, ...values })); setDirty(true); };
  const newProject = () => {
    if (busy) return;
    setProjectId(null); setName("새로운 장면"); setBrand("morrow"); setPrompt(DEFAULT_PROMPT); setPlacement({ ...DEFAULT_PLACEMENT });
    setVideoFile(null); setProductFile(null); setVideoId(null); setProductId(null); setVideoUrl(""); setProductUrl("/images/product.svg"); setDuration(5); setCurrentTime(0); setVideoRatio(16 / 9); setProductRatio(2 / 3); setPlaying(false); setJob(null); setDirty(false); setTab("placement"); setSidebarOpen(false);
  };
  const openProject = async (project: Project) => {
    if (busy) return;
    setProjectId(project.id); setName(project.name); setBrand(project.brand); setPrompt(project.prompt); setPlacement(project.placement);
    setVideoId(project.videoId); setProductId(project.productId); setVideoFile(null); setProductFile(null);
    setVideoUrl(project.videoId ? `/api/assets/${project.videoId}` : ""); setProductUrl(project.productId ? `/api/assets/${project.productId}` : "/images/product.svg");
    setCurrentTime(0); setPlaying(false); setDirty(false); setTab("placement"); setJob(null); setSidebarOpen(false);
    const lastJob = localStorage.getItem(`layer-job:${project.id}`);
    if (lastJob) try { const data = await api.job(lastJob); if (projectIdRef.current === project.id) setJob(data.job); } catch { /* a stale job pointer is not a saved job */ }
  };
  const selectFile = (file: File | undefined, kind: "video" | "product") => {
    if (!file) return;
    const valid = kind === "video" ? ["video/mp4", "video/webm", "video/quicktime"] : ["image/png", "image/jpeg", "image/webp"];
    const limit = (kind === "video" ? 40 : 10) * 1024 * 1024;
    if (!valid.includes(file.type) || file.size === 0 || file.size > limit) { notify(kind === "video" ? "40MB 이하의 MP4·WebM·MOV 영상을 선택해 주세요." : "10MB 이하의 PNG·JPG·WebP 이미지를 선택해 주세요.", true); return; }
    const objectUrl = URL.createObjectURL(file);
    if (kind === "video") { setVideoFile(file); setVideoUrl(objectUrl); setVideoId(null); setPlaying(false); setCurrentTime(0); }
    else { setProductFile(file); setProductUrl(objectUrl); setProductId(null); }
    setDirty(true); setTab("placement"); setJob(null);
  };
  const saveProject = async (): Promise<Project | null> => {
    if (!session) { setLoginPrompt(true); return null; }
    if (!name.trim()) { notify("프로젝트 이름을 입력해 주세요.", true); return null; }
    if (placement.end <= placement.start || placement.end > duration) { notify("영상 길이 안에서 시작·종료 시간을 설정해 주세요.", true); return null; }
    setBusy("저장 중");
    try {
      let savedVideoId = videoId; let savedProductId = productId;
      if (videoFile && !savedVideoId) { const data = await api.upload(videoFile, "video"); savedVideoId = data.asset.id; setVideoId(savedVideoId); }
      if (productFile && !savedProductId) { const data = await api.upload(productFile, "product"); savedProductId = data.asset.id; setProductId(savedProductId); }
      const input = { name, brand, prompt, videoId: savedVideoId, productId: savedProductId, placement };
      const result = projectId ? await api.update(projectId, input) : await api.create(input);
      setProjectId(result.project.id); setDirty(false); setProjects((list) => [result.project, ...list.filter((p) => p.id !== result.project.id)]); notify("프로젝트와 광고 슬롯을 저장했습니다."); return result.project;
    } catch (error) { if (error instanceof ApiError && error.status === 401) setLoginPrompt(true); notify(error instanceof Error ? error.message : "저장하지 못했습니다.", true); return null; }
    finally { setBusy(""); }
  };
  const regenerate = async () => {
    if (!videoUrl || productUrl === "/images/product.svg") { notify("직접 촬영한 영상과 제품 이미지를 먼저 업로드해 주세요.", true); return; }
    const saved = await saveProject(); if (!saved) return;
    setBusy("재생성 요청 중");
    try { const data = await api.render(saved.id); setJob(data.job); localStorage.setItem(`layer-job:${saved.id}`, data.job.id); notify("제품 영역 재생성을 요청했습니다."); }
    catch (error) { notify(error instanceof Error ? error.message : "재생성을 요청하지 못했습니다.", true); }
    finally { setBusy(""); }
  };
  const exportFrame = async () => {
    setBusy("시안 준비 중");
    try {
      const canvas = document.createElement("canvas");
      const video = videoRef.current;
      const background = videoUrl ? video : await loadImage("/images/cafe.jpg");
      if (!background || (videoUrl && !video?.videoWidth)) throw new Error("영상이 로드된 뒤 다시 시도해 주세요.");
      canvas.width = videoUrl ? video!.videoWidth : 1600; canvas.height = videoUrl ? video!.videoHeight : 900;
      const context = canvas.getContext("2d"); if (!context) throw new Error("브라우저에서 이미지 내보내기를 지원하지 않습니다.");
      const sourceWidth = background instanceof HTMLVideoElement ? background.videoWidth : background.naturalWidth;
      const sourceHeight = background instanceof HTMLVideoElement ? background.videoHeight : background.naturalHeight;
      const scale = Math.max(canvas.width / sourceWidth, canvas.height / sourceHeight);
      context.drawImage(background, (canvas.width - sourceWidth * scale) / 2, (canvas.height - sourceHeight * scale) / 2, sourceWidth * scale, sourceHeight * scale);
      if (!original && currentTime >= placement.start && currentTime <= placement.end) {
        const image = await loadImage(productUrl); const w = placement.width * canvas.width; const h = w * image.naturalHeight / image.naturalWidth;
        context.save(); context.translate(placement.x * canvas.width + w / 2, placement.y * canvas.height + h / 2); context.rotate(placement.rotation * Math.PI / 180); context.globalAlpha = placement.opacity; context.shadowColor = "rgba(0,0,0,.3)"; context.shadowBlur = 12; context.shadowOffsetY = 7; context.drawImage(image, -w / 2, -h / 2, w, h); context.restore();
      }
      canvas.toBlob((blob) => { if (!blob) { notify("시안을 내보내지 못했습니다.", true); return; } const href = URL.createObjectURL(blob); const anchor = document.createElement("a"); anchor.href = href; anchor.download = `layer-placement-${Date.now()}.png`; anchor.click(); setTimeout(() => URL.revokeObjectURL(href), 30000); notify("배치 시안을 내려받았습니다. AI 재생성 결과와는 다릅니다."); }, "image/png");
    } catch (error) { notify(error instanceof Error ? error.message : "이미지 내보내기 실패", true); } finally { setBusy(""); }
  };
  const startDrag = (event: PointerEvent<HTMLDivElement>) => {
    if (tab === "result" || original || busy) return;
    event.preventDefault(); const rect = event.currentTarget.getBoundingClientRect();
    const target = event.target as HTMLElement;
    if (target.closest(".studio-product")) dragOffset.current = { x: (event.clientX - rect.left) / rect.width - placement.x, y: (event.clientY - rect.top) / rect.height - placement.y };
    else { dragOffset.current = { x: placement.width / 2, y: placement.width * videoRatio / productRatio / 2 }; }
    dragging.current = true; event.currentTarget.setPointerCapture(event.pointerId); drag(event);
  };
  const drag = (event: PointerEvent<HTMLDivElement>) => {
    if (!dragging.current) return; const rect = event.currentTarget.getBoundingClientRect();
    update({ x: clamp((event.clientX - rect.left) / rect.width - dragOffset.current.x, 0, 1 - placement.width), y: clamp((event.clientY - rect.top) / rect.height - dragOffset.current.y, 0, Math.max(0, 1 - placement.width * videoRatio / productRatio)) });
  };
  const productStyle = { left: `${placement.x * 100}%`, top: `${placement.y * 100}%`, width: `${placement.width * 100}%`, transform: `rotate(${placement.rotation}deg)`, opacity: placement.opacity };
  const showProduct = !original && currentTime >= placement.start && currentTime <= placement.end;
  const renderRunning = job?.status === "queued" || job?.status === "rendering";

  return <div className="studio-app">
    <header className="studio-header"><div className="studio-brand-group"><Brand compact /><span className="header-slash">/</span><span className="studio-wordmark">STUDIO <span className="beta-tag">BETA</span></span></div><div className="studio-project-name"><input aria-label="프로젝트 이름" value={name} disabled={!!busy} onChange={(e) => { setName(e.target.value); setDirty(true); }} maxLength={100} /><span className={dirty ? "unsaved-mark" : "saved-mark"}>{dirty ? "저장되지 않은 변경" : projectId ? "저장됨" : "새 프로젝트"}</span></div><div className="studio-header-actions"><button className="btn btn-outline btn-sm" disabled={!!busy} onClick={() => void saveProject()}>{busy === "저장 중" ? <LoaderCircle className="spin" size={15} /> : <Save size={15} />} 저장</button>{session ? <button className="user-avatar" title={`${session.displayName} · 로그아웃`} aria-label="로그아웃" onClick={() => void logout()}>{session.displayName.slice(0, 1).toUpperCase()}</button> : <button className="btn btn-lime btn-sm" onClick={() => setLoginPrompt(true)}><LogIn size={15} /> 로그인</button>}</div></header>
    <div className="studio-layout">
      <aside className={`project-sidebar ${sidebarOpen ? "is-open" : ""}`}><div className="sidebar-heading"><span>워크스페이스</span><button className="icon-btn close-sidebar" onClick={() => setSidebarOpen(false)} aria-label="프로젝트 목록 닫기"><X size={16} /></button></div><button className="btn btn-outline btn-full" onClick={newProject} disabled={!!busy}><Plus size={16} /> 새 프로젝트</button><div className="project-list-label">내 프로젝트 <span>{projects.length}</span></div><div className="project-list">{projects.length ? projects.map((p) => <button className={`project-item ${p.id === projectId ? "active" : ""}`} key={p.id} onClick={() => void openProject(p)} disabled={!!busy}><span className="project-thumb"><Clapperboard size={18} /></span><span><strong>{p.name}</strong><small>{p.brand || "브랜드 미지정"}</small></span></button>) : <div className="empty-projects"><Layers2 size={27} /><p>{session ? "첫 번째 프로젝트를\n저장해 보세요." : "로그인하면 프로젝트를\n저장하고 이어서 작업할 수 있어요."}</p></div>}</div><div className="sidebar-bottom"><LockKeyhole size={18} /><strong>Story first, always.</strong><p>제품 밖의 장면은 원본으로.<br />이야기의 완성도를 지키는 설계.</p><a href="/">Admasker 소개 보기</a></div></aside>
      <main className="studio-main"><div className="studio-section-top"><div><span className="eyebrow text-lime">YOUR STORY. A NEW LAYER.</span><h1>장면에 브랜드를 더하세요.</h1></div><button className="btn btn-outline btn-sm show-projects" onClick={() => setSidebarOpen(true)}><Layers2 size={14} /> 프로젝트</button><span className="status-label"><ShieldCheck size={15} /> 원본 보존 모드</span></div><div className="studio-editor"><div className="studio-editor-toolbar"><div className="editor-tabs"><button className={tab === "placement" ? "active" : ""} onClick={() => setTab("placement")}><MousePointer2 size={15} /> 배치 시안</button><button className={tab === "mask" ? "active" : ""} onClick={() => setTab("mask")}><Focus size={15} /> 재생성 영역</button><button className={tab === "result" ? "active" : ""} onClick={() => setTab("result")} disabled={!job?.outputId}><Sparkles size={15} /> AI 결과</button></div><button className={`original-btn ${original ? "selected" : ""}`} onClick={() => setOriginal(!original)} aria-pressed={original}><Eye size={15} /> 원본 보기</button></div>
        {tab === "result" && job?.outputId && !original ? <div className="result-stage"><video controls src={`/api/assets/${job.outputId}`} onLoadedMetadata={(e) => { e.currentTarget.currentTime = currentTime; }} onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)} /><div className="result-note"><ShieldCheck size={16} /> AI 결과입니다. 제품·로고·가림과 원본 보존을 검수해 주세요.</div></div> : <div className="stage-surround"><div ref={stageRef} className={`studio-stage ${tab === "mask" ? "mask-mode" : ""}`} style={{ aspectRatio: videoRatio }} onPointerDown={startDrag} onPointerMove={drag} onPointerUp={() => { dragging.current = false; }} onPointerCancel={() => { dragging.current = false; }}>
          {videoUrl ? <video ref={videoRef} src={videoUrl} playsInline preload="metadata" onLoadedMetadata={(e) => { const video = e.currentTarget; const d = video.duration; if (!Number.isFinite(d) || d > 120) { notify("120초 이하의 영상을 사용해 주세요.", true); setVideoUrl(""); setVideoFile(null); setVideoId(null); return; } setDuration(d); setVideoRatio(video.videoWidth / video.videoHeight); if (tab === "result") video.currentTime = currentTime; setPlacement((p) => ({ ...p, start: Math.min(p.start, Math.max(0, d - 0.1)), end: Math.min(Math.max(p.end, 0.1), d) })); }} onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)} onPause={() => setPlaying(false)} onPlay={() => setPlaying(true)} onEnded={() => setPlaying(false)} onError={() => notify("영상을 재생할 수 없습니다. MP4(H.264) 또는 WebM을 사용해 주세요.", true)} /> : <img className="studio-background" src="/images/cafe.jpg" alt="카페 장면 샘플" draggable={false} />}
          <div className="stage-label"><span>{original ? "ORIGINAL" : tab === "mask" ? "REGENERATION AREA" : "PLACEMENT PREVIEW"}</span>{!videoUrl && <span>샘플 이미지</span>}</div>
          {showProduct && <div className="studio-product" style={productStyle} role="slider" tabIndex={0} aria-label="제품 배치 위치. 방향키로 이동" aria-valuetext={`가로 ${Math.round(placement.x * 100)}%, 세로 ${Math.round(placement.y * 100)}%`} aria-valuenow={Math.round(placement.x * 100)} aria-valuemin={0} aria-valuemax={100} onKeyDown={(e) => { if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.key)) { e.preventDefault(); update({ x: clamp(placement.x + (e.key === "ArrowRight" ? .005 : e.key === "ArrowLeft" ? -.005 : 0), 0, 1 - placement.width), y: clamp(placement.y + (e.key === "ArrowDown" ? .005 : e.key === "ArrowUp" ? -.005 : 0), 0, .95) }); } }}><img src={productUrl} alt="배치할 제품" draggable={false} onLoad={(e) => setProductRatio(e.currentTarget.naturalWidth / e.currentTarget.naturalHeight)} /><span className="product-corner tl" /><span className="product-corner tr" /><span className="product-corner bl" /><span className="product-corner br" /><span className="product-drag-label"><Focus size={11} /> {brand || "제품"}</span></div>}
          {tab === "mask" && !original && <div className="mask-area" style={{ ...productStyle, opacity: 1, left: `${(placement.x - placement.width * .15) * 100}%`, top: `${(placement.y - placement.width * videoRatio / productRatio * .15) * 100}%`, width: `${placement.width * 1.3 * 100}%`, aspectRatio: productRatio }}><span>제품 + 주변 효과</span></div>}
          <span className="stage-mode-note">{tab === "mask" ? "밝은 영역만 재생성 대상 · 경계는 부드럽게 합성" : original ? "원본 프레임" : "배치 시안 · AI 재생성 전"}</span>
        </div></div>}
        <div className="studio-transport"><button className="icon-btn" aria-label={playing ? "일시 정지" : "영상 재생"} disabled={!videoUrl || tab === "result"} onClick={() => { if (!videoRef.current) return; if (playing) videoRef.current.pause(); else void videoRef.current.play().catch(() => notify("재생을 시작하지 못했습니다.", true)); }}>{playing ? <Pause size={17} /> : <Play size={17} fill="currentColor" />}</button><span className="mono">{clock(currentTime)} <span className="muted">/ {clock(duration)}</span></span><input aria-label="영상 재생 위치" type="range" min={0} max={duration} step={0.01} value={currentTime} onChange={(e) => { const time = +e.target.value; setCurrentTime(time); if (videoRef.current) videoRef.current.currentTime = time; }} /><span className="transport-resolution">{videoUrl ? "SOURCE" : "DEMO"}</span></div>
        <div className="studio-timeline"><div className="timeline-ruler">{Array.from({ length: 7 }, (_, i) => <span key={i}>{clock(duration * i / 6)}</span>)}</div><div className="studio-video-track"><FileVideo size={14} /><span>{videoFile?.name || (videoId ? "원본 영상" : "카페 샘플 · 이미지")}</span><span className="timeline-original-lock"><LockKeyhole size={12} /> 원본</span></div><div className="studio-ad-track"><span className="track-icon"><Layers2 size={14} /></span><div className="ad-track-range" style={{ left: `${placement.start / duration * 100}%`, width: `${(placement.end - placement.start) / duration * 100}%` }}><Layers2 size={12} /> {brand || "제품 레이어"}<span>{(placement.end - placement.start).toFixed(1)}s</span></div></div></div>
      </div>
      <div className="editor-bottom-row"><p><MousePointer2 size={15} /> 화면을 클릭하거나 제품을 드래그해 배치하세요.</p><button className="text-link" onClick={() => { setPlacement({ ...DEFAULT_PLACEMENT, end: Math.min(3, duration) }); setDirty(true); }}><RotateCcw size={14} /> 배치 초기화</button></div>
      <div className="preservation-panel"><div className="preservation-icon"><ShieldCheck size={23} /></div><div><h3>이야기는 원본에 남겨두세요.</h3><p>재생성 영역 밖은 원본 프레임을 사용합니다. 제품의 빛·그림자·가림과 브랜드 정확도는 결과에서 직접 확인하세요.</p></div><span className="feature-tag">원본 마스터 유지</span></div>
      {job && <div className={`job-panel job-${job.status}`}><Sparkles size={18} /><div><strong>{job.status === "queued" ? "AI 작업 대기 중" : job.status === "rendering" ? "제품 영역을 재생성하고 있습니다" : job.status === "completed" ? "AI 재생성 완료 · 검수 대기" : "AI 재생성 실패"}</strong><p>{job.error || (job.status === "completed" ? "원본 비교와 제품 검수 후 결과를 사용해 주세요." : "장면의 원본은 유지하고 지정 영역을 처리합니다.")}</p>{renderRunning && <progress max={100} value={job.progress} />}</div>{job.outputId && <a className="btn btn-outline btn-sm" href={`/api/assets/${job.outputId}?download=1`}><Download size={15} /> 결과 MP4</a>}</div>}
      </main>
      <aside className="studio-inspector"><div className="inspector-heading"><span>광고 레이어</span><SlidersHorizontal size={17} /></div><div className="inspector-section"><div className="control-heading"><span>원본 영상</span><span className="control-hint">최대 40MB</span></div><input hidden ref={videoInput} type="file" accept="video/mp4,video/webm,video/quicktime" onChange={(e) => { selectFile(e.target.files?.[0], "video"); e.target.value = ""; }} /><button className={`upload-zone ${videoUrl ? "has-file" : ""}`} disabled={!!busy} onClick={() => videoInput.current?.click()}>{videoUrl ? <CheckCheck size={23} /> : <Upload size={23} />}<strong>{videoFile?.name || (videoId ? "저장된 원본 영상" : "영상을 불러오세요")}</strong><span>{videoUrl ? "클릭해서 영상 교체" : "MP4, WebM, MOV · 120초 이하"}</span></button></div><div className="inspector-section"><div className="control-heading"><span>제품 이미지</span><span className="control-hint">최대 10MB</span></div><input hidden ref={productInput} type="file" accept="image/png,image/jpeg,image/webp" onChange={(e) => { selectFile(e.target.files?.[0], "product"); e.target.value = ""; }} /><button className="studio-product-asset" disabled={!!busy} onClick={() => productInput.current?.click()}><span><img src={productUrl} alt="현재 제품 에셋" /></span><div><strong>{productFile?.name || (productId ? "저장된 제품 이미지" : "morrow cold brew")}</strong><small>{productId || productFile ? "제품 이미지 교체" : "가상 브랜드 · 샘플 에셋"}</small><em><ImagePlus size={13} /> 이미지 업로드</em></div></button><p className="input-help">배경이 투명한 PNG를 권장합니다.</p><label className="input-label" htmlFor="brand-name">브랜드 이름</label><input className="text-input" id="brand-name" value={brand} maxLength={80} disabled={!!busy} onChange={(e) => { setBrand(e.target.value); setDirty(true); }} placeholder="브랜드 이름을 입력하세요" /></div>
        <fieldset className="inspector-section placement-controls" disabled={!!busy}><legend>배치 조정 <MousePointer2 size={14} /></legend><label className="range-label" htmlFor="size">크기 <span>{Math.round(placement.width * 100)}%</span></label><input id="size" type="range" min={2} max={40} value={placement.width * 100} onChange={(e) => update({ width: +e.target.value / 100 })} /><div className="control-pair"><label>가로 위치 <div className="number-input"><input aria-label="제품 가로 위치" type="number" min={0} max={98} value={Math.round(placement.x * 100)} onChange={(e) => update({ x: clamp(+e.target.value / 100, 0, .98) })} /><span>%</span></div></label><label>세로 위치 <div className="number-input"><input aria-label="제품 세로 위치" type="number" min={0} max={98} value={Math.round(placement.y * 100)} onChange={(e) => update({ y: clamp(+e.target.value / 100, 0, .98) })} /><span>%</span></div></label></div><label className="range-label" htmlFor="rotation">회전 <span>{placement.rotation}°</span></label><input id="rotation" type="range" min={-45} max={45} value={placement.rotation} onChange={(e) => update({ rotation: +e.target.value })} /><label className="range-label" htmlFor="opacity">시안 불투명도 <span>{Math.round(placement.opacity * 100)}%</span></label><input id="opacity" type="range" min={10} max={100} value={placement.opacity * 100} onChange={(e) => update({ opacity: +e.target.value / 100 })} /><div className="control-heading exposure-heading"><span>노출 구간</span><span className="control-hint">초 단위</span></div><div className="control-pair"><label>시작 <div className="number-input"><input aria-label="노출 시작 시간" type="number" min={0} max={Math.max(0, placement.end - .1)} step={.1} value={placement.start} onChange={(e) => update({ start: clamp(+e.target.value, 0, Math.max(0, placement.end - .1)) })} /><span>s</span></div></label><label>종료 <div className="number-input"><input aria-label="노출 종료 시간" type="number" min={placement.start + .1} max={duration} step={.1} value={placement.end} onChange={(e) => update({ end: clamp(+e.target.value, placement.start + .1, duration) })} /><span>s</span></div></label></div></fieldset>
        <div className="inspector-section"><details className="generation-details"><summary>재생성 방향 <ChevronDown size={15} /></summary><label className="input-label" htmlFor="generation-prompt">제품이 장면에 놓이는 방식</label><textarea id="generation-prompt" value={prompt} maxLength={1500} disabled={!!busy} onChange={(e) => { setPrompt(e.target.value); setDirty(true); }} /><p className="input-help">배치 시안과 함께 AI 재생성에 전달됩니다.</p></details></div>
        <div className="studio-output"><button className="btn btn-outline btn-full" onClick={() => void exportFrame()} disabled={!!busy || tab === "result"}><Download size={16} /> 배치 시안 PNG</button><button className="btn btn-lime btn-full" disabled={!!busy || !rendererAvailable || renderRunning} onClick={() => void regenerate()}>{busy || renderRunning ? <LoaderCircle size={16} className="spin" /> : <Sparkles size={16} />} {busy || "제품 영역 AI 재생성"}</button><p className="renderer-note">{rendererAvailable ? "AI 결과는 원본 비교와 브랜드 검수가 필요합니다." : "AI 재생성 서버 연결 전입니다.\n현재는 배치 시안과 프로젝트 저장을 사용할 수 있어요."}</p></div>
      </aside>
    </div>
    {toast && <div className={`toast ${toast.error ? "toast-error" : ""}`} role="status" aria-live="polite">{toast.error ? <Focus size={17} /> : <Check size={17} />}<span>{toast.message}</span><button className="icon-btn" onClick={() => setToast(null)} aria-label="알림 닫기"><X size={15} /></button></div>}
    {loginPrompt && <div className="modal-backdrop" onClick={() => { if (!authBusy) setLoginPrompt(false); }}><div className="login-modal" role="dialog" aria-modal="true" aria-labelledby="login-title" onClick={(e) => e.stopPropagation()} onKeyDown={(e) => { if (e.key === "Escape" && !authBusy) setLoginPrompt(false); }}><button className="icon-btn modal-close" disabled={authBusy} onClick={() => setLoginPrompt(false)} aria-label="닫기"><X size={19} /></button><span className="modal-brand"><Layers2 size={28} /></span><h2 id="login-title">{authMode === "login" ? "이 장면을 저장해두세요." : "당신의 워크스페이스를 만드세요."}</h2><p>영상과 제품 에셋, 광고 슬롯을 저장하고<br />다음에도 이어서 작업하세요.</p><div className="auth-tabs"><button className={authMode === "login" ? "active" : ""} onClick={() => { setAuthMode("login"); setAuthError(""); }}>로그인</button><button className={authMode === "register" ? "active" : ""} onClick={() => { setAuthMode("register"); setAuthError(""); }}>회원가입</button></div><form className="auth-form" onSubmit={(event) => void authenticate(event)}>{authMode === "register" && <label>이름<input className="text-input" autoComplete="name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} required maxLength={60} /></label>}<label>이메일<input className="text-input" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required maxLength={254} autoFocus /></label><label>비밀번호<input className="text-input" type="password" autoComplete={authMode === "register" ? "new-password" : "current-password"} value={password} onChange={(e) => setPassword(e.target.value)} required minLength={10} maxLength={128} placeholder={authMode === "register" ? "10자 이상 입력하세요" : "비밀번호"} /></label>{authError && <p className="auth-error" role="alert">{authError}</p>}<button type="submit" className="btn btn-lime btn-full" disabled={authBusy}>{authBusy ? <LoaderCircle className="spin" size={17} /> : <LogIn size={17} />}{authMode === "login" ? "로그인" : "워크스페이스 만들기"}</button></form><button className="text-link" disabled={authBusy} onClick={() => setLoginPrompt(false)}>시안 계속 편집하기</button></div></div>}
    {!sessionReady && <span className="session-loading" role="status"><LoaderCircle className="spin" size={14} /> 워크스페이스 연결 중</span>}
  </div>;
}
