import { useEffect, useState } from "react";
import { BriefcaseBusiness, Check, ChevronDown, Clapperboard, Clock3, FileText, Film, Layers2, Menu, Search, ShieldCheck, Sparkles, Upload, X } from "lucide-react";
import Brand from "./Brand";
import { api } from "@/lib/api";
import { DEMO_CAMPAIGNS } from "./Marketplace";
import type { Campaign } from "@/shared/types";
import "../landing.css";

type Audience = "brand" | "creator";
const CATEGORIES = ["전체", "라이프스타일", "뷰티", "패션", "푸드", "테크", "여행", "웹드라마"];
const SCENES = [
  { title: "이야기 속, 테이블 위의 한 잔.", category: "웹드라마", image: "/images/cafe.jpg", detail: "대화가 이어지는 카페 장면에 음료 PPL", tag: "카페 · 음료", tone: "cafe" },
  { title: "일상의 한 장면이 광고가 되도록.", category: "라이프스타일", image: "/images/scene.jpg", detail: "분위기를 이어가는 공간 속 제품 배치", tag: "일상 · 라이프스타일", tone: "daily" },
  { title: "브랜드가 머무는 새로운 공간.", category: "패션", image: "/images/store.jpg", detail: "취향을 담은 공간에 어울리는 제품 노출", tag: "공간 · 패션", tone: "store" },
];
const GUIDES = {
  brand: [
    { Icon: FileText, title: "광고할 제품을 등록하세요", description: "제품과 브랜드, 원하는 영상 분위기와 광고 조건을 캠페인에 담으세요." },
    { Icon: Film, title: "제품이 어울릴 장면을 정하세요", description: "제안받은 AI 영상의 콘셉트와 제품이 등장할 장면을 검토하세요." },
    { Icon: Check, title: "PPL 시안을 확인하세요", description: "제품 노출을 원본과 비교하고, 게시 조건은 크리에이터와 협의하세요." },
  ],
  creator: [
    { Icon: Upload, title: "여러분의 AI 영상을 올리세요", description: "완성된 영상과 제품 이미지를 PPL 스튜디오에 업로드하세요." },
    { Icon: Layers2, title: "영상에 제품을 더하세요", description: "이야기에 어울리는 위치와 노출 구간을 골라 PPL 시안을 만드세요." },
    { Icon: BriefcaseBusiness, title: "PPL로 수익 기회를 만드세요", description: "영상에 맞는 광고 캠페인에 제안하고, 광고 조건을 협의하세요." },
  ],
};
const FAQ = [
  ["Admasker는 어떤 서비스인가요?", "AI 영상에 제품 PPL을 더하는 광고 플랫폼입니다. 브랜드는 제품을 광고할 캠페인을 등록하고, AI 크리에이터는 기존 영상에 제품이 등장할 장면을 제안하고 PPL 시안을 만들 수 있습니다."],
  ["영상의 이야기나 스타일도 바뀌나요?", "스토리와 영상의 완성도를 지키면서 제품이 장면에 자연스럽게 녹아드는 것이 핵심입니다. 제품과 주변의 필요한 영역만 편집하는 방향으로 개발하고 있으며, 실제 AI 재생성 결과와 제품·로고 재현 품질은 검증 중입니다."],
  ["이미 완성된 AI 영상에도 PPL을 추가할 수 있나요?", "네. PPL 스튜디오에서 보유한 영상과 제품 이미지를 업로드해 위치·크기·노출 구간을 조정할 수 있습니다. 현재 제공되는 화면은 제품 배치 시안이며, 실제 AI 영상 재생성 결과와는 구분됩니다."],
  ["광고비 지급과 영상 게시는 어떻게 진행되나요?", "현재는 캠페인 등록·지원·선정과 제품 배치 시안을 제공합니다. 광고비, 게시 일정, 콘텐츠 사용 범위와 계약·결제는 브랜드와 크리에이터가 별도로 협의합니다."],
];

function PlusMark() { return <span className="lv-plus" aria-hidden="true">+</span>; }

function PplPreview() {
  const [original, setOriginal] = useState(false);
  return (
    <div className="lv-ppl-preview">
      <div className="lv-preview-top"><span><Clapperboard size={16} /> 장면 속 제품 PPL</span><div className="lv-compare-buttons" aria-label="원본과 PPL 시안 비교"><button aria-pressed={original} className={original ? "active" : ""} onClick={() => setOriginal(true)}>원본</button><button aria-pressed={!original} className={!original ? "active" : ""} onClick={() => setOriginal(false)}>PPL 추가</button></div></div>
      <div className="lv-preview-scene"><img className="lv-preview-bg" src="/images/cafe.jpg" alt="PPL 배치를 설명하는 카페 장면 콘셉트 이미지" fetchPriority="high" /><div className={`lv-preview-product ${original ? "is-hidden" : ""}`}><img src="/images/product.svg" alt="가상 브랜드 morrow 콜드브루 제품 배치 시안" /><span className="lv-product-frame"><i /><i /><i /><i /><small>PRODUCT PLACEMENT</small></span></div><span className="lv-preview-caption">이야기는 그대로.<br /><strong>{original ? "제품을 더하기 전." : "제품은 장면 속으로."}</strong></span><span className="lv-preview-badge">콘셉트 이미지 · 가상 제품 배치 시안</span></div>
      <div className="lv-preview-track"><Film size={16} /><span>원본 영상</span><div className="lv-video-track" /><span>00:03</span></div>
      <div className="lv-preview-track lv-product-track"><Layers2 size={16} /><span>제품 PPL</span><div className={original ? "is-hidden" : ""}>morrow · cold brew</div><Check size={15} /></div>
    </div>
  );
}

function SceneShelf() {
  return (
    <section className="lv-section" id="ad-scenes"><div className="lv-container">
      <div className="lv-section-head"><div><span className="lv-kicker">A NEW PLACE FOR YOUR PRODUCT</span><h2>광고가 될 수 있는,<br />수많은 이야기 속 장면들.</h2><p>AI 웹드라마부터 일상, 패션 콘텐츠까지. 제품이 어울리는 장면을 상상해 보세요.</p></div><a className="lv-link" href="/campaigns?create=1">우리 제품 광고하기 <PlusMark /></a></div>
      <div className="lv-scene-grid">{SCENES.map((scene) => <article className={`lv-scene-card lv-scene-${scene.tone}`} key={scene.category}><div className="lv-scene-image"><img src={scene.image} alt={scene.detail + " 콘셉트 이미지"} loading="lazy" /><span className="lv-scene-tag"><Clapperboard size={14} />{scene.tag}</span><span className="lv-scene-example">장면 예시</span></div><div className="lv-scene-body"><span>{scene.category} PPL</span><h3>{scene.title}</h3><p>{scene.detail}</p><a className="lv-link" href="/campaigns?create=1">이런 장면에 광고하기 <PlusMark /></a></div></article>)}</div>
      <p className="lv-example-note">PPL 활용을 설명하는 콘셉트 이미지입니다. 실제 등록된 AI 영상이나 집행 사례가 아닙니다.</p>
    </div></section>
  );
}

function LandingCampaign({ campaign }: { campaign: Campaign }) {
  const example = campaign.id.startsWith("demo-");
  const visual = campaign.category === "패션" ? "fashion" : campaign.category === "웹드라마" ? "story" : "coffee";
  return (
    <a className="lv-campaign-card" href={`/campaigns?campaign=${encodeURIComponent(campaign.id)}`}>
      <div className={`lv-campaign-image lv-campaign-${visual}`}>
        {example ? visual === "coffee" ? <><span className="lv-coffee-title">a little<br /><em>morrow.</em></span><img className="lv-campaign-product" src="/images/product.svg" alt="가상 브랜드 morrow 제품 예시" loading="lazy" /></> : <><img className="lv-campaign-photo" src={visual === "fashion" ? "/images/store.jpg" : "/images/cafe.jpg"} alt="PPL 캠페인 콘셉트 이미지" loading="lazy" /><span className="lv-campaign-wordmark">{campaign.brand}<small>IN YOUR NEXT SCENE.</small></span></> : <><span className="lv-actual-brand">{campaign.brand}</span><BriefcaseBusiness className="lv-actual-brand-icon" size={64} strokeWidth={1.2} /></>}
        <span className={`lv-campaign-status ${example ? "is-example" : ""}`}>{example ? "예시 캠페인" : campaign.status === "open" ? "모집 중" : "모집 마감"}</span><span className="lv-platform-chip">{campaign.platform}</span>
      </div>
      <div className="lv-campaign-body"><div className="lv-campaign-brand"><span>{campaign.brand.slice(0, 1)}</span>{campaign.brand}<small>{campaign.deliverable}</small></div><h3>{campaign.title}</h3><div className="lv-card-tags"><span>{campaign.category}</span><span>{campaign.deliverable}</span></div><div className="lv-campaign-bottom"><div><span>{example ? "예시 광고 예산" : "광고 예산"}</span><strong>{campaign.budget ? `${new Intl.NumberFormat("ko-KR").format(campaign.budget)}원` : "예산 협의"}</strong></div><span className="lv-card-deadline"><Clock3 size={14} />{example ? "서비스 예시" : `${campaign.deadline.slice(5).replace("-", ".")} 마감`}</span></div></div>
    </a>
  );
}

export default function Landing() {
  const [menu, setMenu] = useState(false);
  const [audience, setAudience] = useState<Audience>("brand");
  const [guideAudience, setGuideAudience] = useState<Audience>("brand");
  const [category, setCategory] = useState("전체");
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [campaignLoading, setCampaignLoading] = useState(true);
  const [campaignSource, setCampaignSource] = useState<"live" | "empty" | "offline">("empty");
  const [campaignRetry, setCampaignRetry] = useState(0);
  const closeMenu = () => setMenu(false);

  useEffect(() => {
    let active = true;
    setCampaignLoading(true);
    const filters = category === "전체" ? "" : new URLSearchParams({ category }).toString();
    api.campaigns(filters).then((data) => { if (active) { setCampaigns(data.campaigns.slice(0, 3)); setCampaignSource(data.campaigns.length ? "live" : "empty"); } }).catch(() => { if (active) { setCampaigns([]); setCampaignSource("offline"); } }).finally(() => { if (active) setCampaignLoading(false); });
    return () => { active = false; };
  }, [category, campaignRetry]);
  const displayedCampaigns = campaigns.length ? campaigns : DEMO_CAMPAIGNS.filter((campaign) => category === "전체" || campaign.category === category);
  const navigation = <><a href="#ad-scenes" onClick={closeMenu}>AI 영상 광고</a><a href="#for-creators" onClick={closeMenu}>AI 크리에이터</a><a href="#how-it-works" onClick={closeMenu}>이용 방법</a><a href="/studio" onClick={closeMenu}>PPL 스튜디오</a></>;

  return (
    <div className="landing-v2">
      <header className="lv-header"><div className="lv-container lv-header-inner"><Brand /><nav aria-label="메인 메뉴">{navigation}</nav><div className="lv-header-actions"><a className="lv-login" href="/workspace">로그인</a><a className="lv-button lv-button-dark lv-header-cta" href="/campaigns?create=1">제품 광고 시작하기</a><button className="lv-menu" aria-label={menu ? "메뉴 닫기" : "메뉴 열기"} aria-expanded={menu} aria-controls="lv-mobile-navigation" onClick={() => setMenu(!menu)}>{menu ? <X size={23} /> : <Menu size={23} />}</button></div></div>{menu && <nav id="lv-mobile-navigation" className="lv-mobile-nav" aria-label="모바일 메뉴">{navigation}</nav>}</header>
      <main>
        <section className="lv-hero"><div className="lv-container lv-hero-grid"><div className="lv-hero-copy">
          <div className="lv-audience-switch" aria-label="이용 목적 선택"><button aria-pressed={audience === "brand"} className={audience === "brand" ? "active" : ""} onClick={() => setAudience("brand")}>광고주</button><button aria-pressed={audience === "creator"} className={audience === "creator" ? "active" : ""} onClick={() => setAudience("creator")}>AI 크리에이터</button></div>
          <span className="lv-kicker lv-hero-kicker">YOUR PRODUCT. IN AI STORIES.</span>
          <h1>{audience === "brand" ? <>수많은 AI 영상에<br />여러분의 제품을<br /><span>광고하세요.</span></> : <>여러분의 AI 영상에<br /><span>PPL을 추가하세요.</span></>}</h1>
          <p className="lv-hero-description">{audience === "brand" ? <>사람들이 즐기는 AI 영상 속으로, 여러분의 제품을.<br />스토리와 영상의 매력은 지키고 제품이 자연스럽게 녹아들도록.</> : <>이미 만든 영상에 제품을 자연스럽게 더하세요.<br />여러분의 이야기에서 새로운 광고 수익 기회가 시작됩니다.</>}</p>
          <div className="lv-hero-actions"><a className="lv-button lv-button-dark" href={audience === "brand" ? "/campaigns?create=1" : "/studio"}>{audience === "brand" ? "제품 광고 시작하기" : "내 영상에 PPL 추가하기"}</a><a className="lv-link" href={audience === "brand" ? "#ad-scenes" : "/campaigns"}>{audience === "brand" ? "광고 장면 살펴보기" : "PPL 광고 캠페인 보기"}<PlusMark /></a></div>
          <div className="lv-hero-promise"><span><ShieldCheck size={16} />스토리는 그대로</span><span><Film size={16} />영상의 매력은 그대로</span><span><Layers2 size={16} />제품은 자연스럽게</span></div>
        </div><div className="lv-hero-visual"><div className="lv-visual-heading"><span><Sparkles size={15} /> A NEW LAYER OF ADVERTISING</span><span>원본 ↔ PPL 시안</span></div><PplPreview /><div className="lv-product-note"><span className="lv-product-note-icon"><Layers2 size={23} /></span><div><strong>영상에 더하는, 하나의 광고 레이어.</strong><p>브랜드의 제품과 크리에이터의 이야기가 만나는 곳.</p></div></div></div></div></section>

        <section className="lv-manifesto"><div className="lv-container"><span className="lv-kicker">AI VIDEO × PRODUCT PLACEMENT</span><p>브랜드에는 새로운 광고 지면을.<br className="lv-mobile-break" /> AI 크리에이터에게는 새로운 수익 기회를.</p></div></section>

        <SceneShelf />

        <section className="lv-section lv-audience-section" id="for-creators"><div className="lv-container lv-audience-grid">
          <article className="lv-audience-card lv-for-brand"><span className="lv-audience-icon"><BriefcaseBusiness size={25} /></span><span className="lv-kicker">FOR ADVERTISERS</span><h2>여러분의 제품이<br />다음 장면의 일부가 되도록.</h2><p>다양한 AI 콘텐츠에 제품을 노출하세요.<br />이야기를 따라가는 순간, 브랜드도 함께 기억되도록.</p><ul><li><Check size={17} />제품과 광고 조건을 캠페인으로 등록</li><li><Check size={17} />제품에 어울리는 영상과 장면 검토</li><li><Check size={17} />게시 전 PPL 시안과 노출 방식 확인</li></ul><a className="lv-button lv-button-dark" href="/campaigns?create=1">우리 제품 광고하기</a></article>
          <article className="lv-audience-card lv-for-creator"><span className="lv-audience-icon"><Clapperboard size={25} /></span><span className="lv-kicker">FOR AI CREATORS</span><h2>여러분의 영상에 PPL을.<br />이야기에 새로운 수익을.</h2><p>공들여 만든 AI 영상에 제품을 더하세요.<br />나만의 콘텐츠를 새로운 광고 기회로 연결하세요.</p><ul><li><Check size={17} />기존 영상으로 시작하는 제품 PPL</li><li><Check size={17} />위치·크기·노출 구간을 직접 설정</li><li><Check size={17} />내 영상에 맞는 광고 캠페인에 제안</li></ul><a className="lv-button lv-button-lime" href="/studio">내 영상에 PPL 추가하기</a></article>
        </div></section>

        <section className="lv-section lv-campaign-section" id="campaigns"><div className="lv-container"><div className="lv-section-head"><div><span className="lv-kicker">TURN YOUR AI VIDEO INTO AN AD OPPORTUNITY</span><h2>여러분의 AI 영상에<br />등장할 다음 제품.</h2><p>영상의 분위기와 이야기에 어울리는 PPL 광고 캠페인을 살펴보세요.</p></div><a className="lv-link" href="/campaigns">광고 캠페인 전체 보기 <PlusMark /></a></div><div className="lv-category-tabs" aria-label="캠페인 카테고리">{CATEGORIES.map((value) => <button key={value} aria-pressed={category === value} className={category === value ? "active" : ""} onClick={() => setCategory(value)}>{value}</button>)}</div>{campaignLoading ? <div className="lv-card-loading" role="status">광고 캠페인을 불러오고 있어요.</div> : <>{campaignSource !== "live" && <div className="lv-example-note lv-campaign-note"><span>{campaignSource === "offline" ? "광고 캠페인을 불러오지 못해 서비스 예시를 보여드립니다." : "현재 조건에 맞는 캠페인이 없어 서비스 예시를 보여드립니다."} 예시는 실제 모집·광고주·예산이 아닙니다.</span>{campaignSource === "offline" && <button onClick={() => setCampaignRetry((value) => value + 1)}>다시 연결</button>}</div>}<div className="lv-campaign-grid">{displayedCampaigns.map((campaign) => <LandingCampaign key={campaign.id} campaign={campaign} />)}</div>{!displayedCampaigns.length && <div className="lv-empty"><Search size={27} /><h3>새로운 PPL 캠페인을 기다리고 있어요.</h3><p>다른 분야를 살펴보거나 제품 광고 캠페인을 등록해 보세요.</p><a className="lv-link" href="/campaigns?create=1">제품 광고 등록하기 <PlusMark /></a></div>}</>}</div></section>

        <section className="lv-section lv-how-section" id="how-it-works"><div className="lv-container"><div className="lv-how-heading"><span className="lv-kicker">A PRODUCT. A SCENE. A NEW OPPORTUNITY.</span><h2>제품과 영상이 만나면,<br />새로운 광고가 시작됩니다.</h2><div className="lv-guide-switch" aria-label="역할별 이용 방법"><button aria-pressed={guideAudience === "brand"} className={guideAudience === "brand" ? "active" : ""} onClick={() => setGuideAudience("brand")}>광고주 이용 방법</button><button aria-pressed={guideAudience === "creator"} className={guideAudience === "creator" ? "active" : ""} onClick={() => setGuideAudience("creator")}>AI 크리에이터 이용 방법</button></div></div><div className="lv-guide-grid">{GUIDES[guideAudience].map(({ Icon, title, description }) => <article key={title}><span><Icon size={26} /></span><h3>{title}</h3><p>{description}</p></article>)}</div><a className="lv-link lv-how-link" href={guideAudience === "brand" ? "/campaigns?create=1" : "/studio"}>{guideAudience === "brand" ? "첫 제품 광고 시작하기" : "영상에 PPL 추가하기"}<PlusMark /></a></div></section>

        <section className="lv-preserve-section"><div className="lv-container lv-preserve-grid"><div><span className="lv-kicker">KEEP THE STORY. ADD YOUR PRODUCT.</span><h2>좋은 이야기는 지키고,<br /><span>제품이 녹아들도록.</span></h2><p>영상의 스토리와 퀄리티를 지키는 PPL.<br />Admasker가 만드는 광고의 기준입니다.</p><a className="lv-button lv-button-lime" href="/studio">PPL 스튜디오 열기</a></div><div className="lv-preserve-list"><article><ShieldCheck size={25} /><div><h3>영상의 이야기를 존중합니다.</h3><p>기존 흐름과 장면을 살려 제품이 등장할 자리를 찾습니다.</p></div></article><article><Layers2 size={25} /><div><h3>제품이 필요한 곳에 더해집니다.</h3><p>위치와 크기, 노출 구간을 조정해 배치 시안을 검토합니다.</p></div></article><article><Film size={25} /><div><h3>원본과 비교하며 확인합니다.</h3><p>스토리와 분위기, 제품 표현을 함께 살펴봅니다.</p></div></article><small>현재는 제품 배치 시안을 제공합니다. 실제 AI 재생성과 제품 재현 품질은 검증 중입니다.</small></div></div></section>

        <section className="lv-section lv-faq-section" id="faq"><div className="lv-container lv-faq-grid"><div><span className="lv-kicker">BEFORE YOUR FIRST PPL</span><h2>영상 속 제품 광고,<br />궁금한 점을 모았어요.</h2></div><div className="lv-faq-list">{FAQ.map(([question, answer]) => <details key={question}><summary>{question}<ChevronDown size={19} /></summary><p>{answer}</p></details>)}</div></div></section>

        <section className="lv-final-section"><div className="lv-container"><span className="lv-kicker">YOUR NEXT AD IS ALREADY IN THE STORY.</span><h2>수많은 AI 영상 속,<br />여러분의 제품이 등장할 차례.</h2><p>광고주는 제품을, AI 크리에이터는 영상을 준비하세요.</p><div><a className="lv-button lv-button-dark" href="/campaigns?create=1">제품 광고 시작하기</a><a className="lv-button lv-button-white" href="/studio">내 영상에 PPL 추가하기</a></div></div></section>
      </main>
      <footer className="lv-footer"><div className="lv-container"><div className="lv-footer-top"><div><Brand /><p>AI 영상에 제품을 더하는 광고 플랫폼.</p></div><div className="lv-footer-links"><div><strong>제품과 영상</strong><a href="/campaigns?create=1">제품 광고 시작하기</a><a href="/studio">영상에 PPL 추가하기</a><a href="/campaigns">PPL 광고 캠페인</a></div><div><strong>Admasker</strong><a href="#how-it-works">이용 방법</a><a href="#faq">자주 묻는 질문</a><a href="/workspace">내 워크스페이스</a></div></div></div><div className="lv-footer-bottom"><span>© {new Date().getFullYear()} Admasker. All rights reserved.</span><span>AI VIDEO × PRODUCT PLACEMENT</span></div></div></footer>
    </div>
  );
}
