import { useEffect, useState, type FormEvent } from "react";
import { BriefcaseBusiness, Camera, Check, ChevronDown, Clapperboard, Clock3, FileText, Film, Handshake, Layers2, Menu, MessageSquareText, Music2, Search, ShieldCheck, Sparkles, Users, X } from "lucide-react";
import Brand from "./Brand";
import { api } from "@/lib/api";
import { DEMO_CAMPAIGNS } from "./Marketplace";
import type { Campaign, CreatorProfile } from "@/shared/types";
import "../landing.css";

type Audience = "brand" | "creator";
const PLATFORMS = ["전체", "Instagram", "YouTube", "TikTok", "웹드라마"];
const CATEGORIES = ["전체", "라이프스타일", "뷰티", "패션", "푸드", "테크", "여행", "웹드라마"];
const SAMPLE_CREATORS = [
  { category: "라이프스타일", platform: "Instagram", photo: "/images/creator-lifestyle.jpg", title: "일상의 취향을 나누는", detail: "라이프스타일 · 데일리 콘텐츠", color: "sage" },
  { category: "웹드라마", platform: "YouTube", photo: "/images/creator-story.jpg", title: "이야기를 만드는", detail: "웹드라마 · 스토리텔링", color: "blue" },
  { category: "패션", platform: "Instagram", photo: "/images/creator-fashion.jpg", title: "새로운 시선을 제안하는", detail: "패션 · 스타일링 콘텐츠", color: "peach" },
  { category: "푸드", platform: "YouTube", photo: "/images/cafe.jpg", title: "맛있는 순간을 기록하는", detail: "푸드 · 카페 · 공간 콘텐츠", color: "sand" },
];
const FAQ = [
  ["광고주와 크리에이터는 어떻게 시작하나요?", "광고주는 브랜드 계정으로 캠페인을 등록하고, 크리에이터는 활동 채널과 콘텐츠 분야를 소개하는 프로필을 등록합니다. 플랫폼과 분야로 파트너를 탐색하고, 캠페인 지원과 선정 결과는 내 워크스페이스에서 확인할 수 있습니다."],
  ["매칭은 어떤 방식으로 이루어지나요?", "크리에이터가 캠페인에 콘텐츠 아이디어를 담아 지원하면 광고주가 프로필과 제안을 검토해 선정합니다. 현재 플랫폼·분야 검색과 지원·선정 기능을 제공하며, 자동 추천이나 자동 계약 기능은 포함하지 않습니다."],
  ["협업 계약과 광고비 결제도 진행할 수 있나요?", "현재는 캠페인 등록, 지원과 선정 상태 관리까지 제공합니다. 제작 범위, 일정, 광고비, 콘텐츠 사용 권리와 계약·결제는 광고주와 크리에이터가 별도로 협의해야 합니다."],
  ["팔로워가 많지 않아도 시작할 수 있나요?", "채널 규모와 관계없이 프로필을 등록하고 캠페인을 탐색할 수 있습니다. 다만 캠페인별로 희망 채널 규모와 콘텐츠 조건이 다르므로 상세 내용을 확인하고 지원해 주세요."],
  ["영상 PPL 스튜디오는 어떤 기능인가요?", "기존 영상에 제품을 배치하는 시안을 만들고 위치·크기·노출 구간을 조정할 수 있습니다. 실제 AI 재생성은 별도 GPU 서버 연결이 필요합니다. 제품과 주변만 재생성하고 나머지는 원본으로 합성하는 구조이며, 실제 제품·로고 재현 품질은 아직 검증 전입니다."],
];
const GUIDES = {
  brand: [
    { Icon: FileText, title: "캠페인을 소개하세요", description: "브랜드와 제품, 원하는 콘텐츠와 협업 조건을 알려주세요." },
    { Icon: Users, title: "잘 맞는 제안을 찾으세요", description: "지원한 크리에이터의 채널과 아이디어를 함께 살펴보세요." },
    { Icon: Handshake, title: "함께할 파트너를 선정하세요", description: "선정 결과를 관리하고, 세부 협업 조건은 직접 협의하세요." },
  ],
  creator: [
    { Icon: Camera, title: "나의 콘텐츠를 소개하세요", description: "활동 채널과 분야, 나만의 콘텐츠 스타일을 프로필에 담으세요." },
    { Icon: Search, title: "어울리는 캠페인을 찾으세요", description: "내 채널과 취향에 맞는 브랜드를 플랫폼과 분야로 찾아보세요." },
    { Icon: MessageSquareText, title: "나만의 아이디어를 제안하세요", description: "함께 만들 콘텐츠를 제안하고 지원 결과를 확인하세요." },
  ],
};

function Instagram({ size = 16 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" /></svg>;
}
function Youtube({ size = 16 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><rect x="2" y="5" width="20" height="14" rx="4" /><path d="m10 9 5 3-5 3Z" fill="currentColor" stroke="none" /></svg>;
}

function PlatformIcon({ platform, size = 16 }: { platform: string; size?: number }) {
  if (platform === "Instagram") return <Instagram size={size} />;
  if (platform === "YouTube") return <Youtube size={size} />;
  if (platform === "TikTok") return <Music2 size={size} />;
  return <Clapperboard size={size} />;
}

function discoveryUrl(audience: Audience, q = "", platform = "전체", category = "전체") {
  const query = new URLSearchParams();
  if (q.trim()) query.set("q", q.trim());
  if (platform !== "전체") query.set("platform", platform);
  if (category !== "전체") query.set("category", category);
  return `${audience === "brand" ? "/creators" : "/campaigns"}${query.size ? `?${query}` : ""}`;
}

function CreatorShelf({ profiles }: { profiles: CreatorProfile[] }) {
  const examples = profiles.length === 0;
  return (
    <section className="lv-section lv-creator-section" id="discover">
      <div className="lv-container">
        <div className="lv-section-head">
          <div><span className="lv-kicker">FIND YOUR CREATIVE MATCH</span><h2>브랜드의 취향을<br className="lv-mobile-break" /> 가장 잘 전할 파트너.</h2><p>분야와 채널부터 살펴보고, 우리 브랜드와 어울리는 콘텐츠를 찾아보세요.</p></div>
          <a className="lv-link" href="/creators">크리에이터 전체 보기 <PlusMark /></a>
        </div>
        {examples && <p className="lv-example-note">아래는 콘텐츠 분야를 보여주는 프로필 예시입니다. 사진 속 인물은 등록 크리에이터가 아닙니다.</p>}
        <div className="lv-creator-grid">
          {examples ? SAMPLE_CREATORS.map((creator) => (
            <a className="lv-creator-card" key={creator.category} href={discoveryUrl("brand", "", creator.platform, creator.category)} aria-label={`${creator.category} 크리에이터 찾기`}>
              <div className={`lv-creator-image lv-tone-${creator.color}`}><img src={creator.photo} alt={`${creator.category} 콘텐츠 콘셉트 이미지`} loading="lazy" /><span className="lv-image-chip">프로필 예시</span><span className="lv-platform-chip"><PlatformIcon platform={creator.platform} />{creator.platform}</span></div>
              <div className="lv-creator-body"><span className="lv-profile-category">{creator.category}</span><h3>{creator.title}<br />크리에이터</h3><p>{creator.detail}</p><span className="lv-card-action">이런 크리에이터 찾기 <Search size={14} /></span></div>
            </a>
          )) : profiles.slice(0, 4).map((creator) => (
            <a className="lv-creator-card" key={creator.id} href={discoveryUrl("brand", creator.displayName)}>
              <div className="lv-creator-image lv-real-profile"><span className="lv-profile-letter">{creator.displayName.slice(0, 1)}</span><span className="lv-platform-chip"><PlatformIcon platform={creator.platform} />{creator.platform}</span></div>
              <div className="lv-creator-body"><span className="lv-profile-category">{creator.categories.join(" · ")}</span><h3>{creator.displayName}</h3><p>{creator.bio}</p><span className="lv-card-action">프로필 살펴보기 <Search size={14} /></span></div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

function PlusMark() { return <span className="lv-plus" aria-hidden="true">+</span>; }

function LandingCampaign({ campaign }: { campaign: Campaign }) {
  const example = campaign.id.startsWith("demo-");
  const visual = campaign.category === "패션" ? "fashion" : campaign.category === "웹드라마" ? "story" : "coffee";
  return (
    <a className="lv-campaign-card" href={`/campaigns?campaign=${encodeURIComponent(campaign.id)}`}>
      <div className={`lv-campaign-image lv-campaign-${visual}`}>
        {example ? visual === "fashion" ? <><img className="lv-campaign-photo" src="/images/store.jpg" alt="패션 캠페인 콘셉트 이미지" loading="lazy" /><span className="lv-fashion-title">STILL<br /><em>your own story.</em></span></> : visual === "story" ? <><img className="lv-campaign-photo" src="/images/cafe.jpg" alt="웹드라마 카페 장면 예시" loading="lazy" /><span className="lv-story-mark"><Clapperboard size={46} strokeWidth={1.5} /></span></> : <><span className="lv-coffee-title">a little<br /><em>morrow.</em></span><img className="lv-campaign-product" src="/images/product.svg" alt="가상 브랜드 morrow 제품 예시" loading="lazy" /></> : <><span className="lv-actual-brand">{campaign.brand}</span><MegaphoneMark /></>}
        <span className={`lv-campaign-status ${example ? "is-example" : ""}`}>{example ? "예시 캠페인" : "모집 중"}</span>
        <span className="lv-platform-chip"><PlatformIcon platform={campaign.platform} />{campaign.platform}</span>
      </div>
      <div className="lv-campaign-body"><div className="lv-campaign-brand"><span>{campaign.brand.slice(0, 1)}</span>{campaign.brand}<small>{campaign.deliverable}</small></div><h3>{campaign.title}</h3><div className="lv-card-tags"><span>{campaign.category}</span><span>{campaign.deliverable}</span></div><div className="lv-campaign-bottom"><div><span>{example ? "예시 협업 예산" : "협업 예산"}</span><strong>{campaign.budget ? `${new Intl.NumberFormat("ko-KR").format(campaign.budget)}원` : "예산 협의"}</strong></div><span className="lv-card-deadline"><Clock3 size={14} />{example ? "서비스 예시" : `${campaign.deadline.slice(5).replace("-", ".")} 마감`}</span></div></div>
    </a>
  );
}

function MegaphoneMark() { return <BriefcaseBusiness className="lv-actual-brand-icon" size={64} strokeWidth={1.2} aria-hidden="true" />; }

function PplPreview() {
  const [original, setOriginal] = useState(false);
  return (
    <div className="lv-ppl-preview">
      <div className="lv-preview-top"><span><Clapperboard size={15} /> 카페 장면 · 배치 시안</span><div className="lv-compare-buttons" aria-label="원본과 배치 시안 비교"><button aria-pressed={original} className={original ? "active" : ""} onClick={() => setOriginal(true)}>원본</button><button aria-pressed={!original} className={!original ? "active" : ""} onClick={() => setOriginal(false)}>제품 배치 시안</button></div></div>
      <div className="lv-preview-scene"><img className="lv-preview-bg" src="/images/cafe.jpg" alt="원본 카페 장면" loading="lazy" /><div className={`lv-preview-product ${original ? "is-hidden" : ""}`}><img src="/images/product.svg" alt="가상 브랜드 콜드브루 제품 배치 시안" /><span className="lv-product-frame"><i /><i /><i /><i /><small>제품 영역</small></span></div><span className="lv-preview-caption">이야기는 그대로.<br /><strong>브랜드는 자연스럽게.</strong></span><span className="lv-preview-badge">가상 브랜드 · AI 재생성 전 시안</span></div>
      <div className="lv-preview-track"><Layers2 size={15} /><span>morrow · 제품 레이어</span><div /><span>00:03</span></div>
    </div>
  );
}

export default function Landing() {
  const [menu, setMenu] = useState(false);
  const [audience, setAudience] = useState<Audience>("brand");
  const [guideAudience, setGuideAudience] = useState<Audience>("brand");
  const [platform, setPlatform] = useState("전체");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("전체");
  const [creators, setCreators] = useState<CreatorProfile[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [campaignLoading, setCampaignLoading] = useState(true);
  const [campaignSource, setCampaignSource] = useState<"live" | "empty" | "offline">("empty");
  const [campaignRetry, setCampaignRetry] = useState(0);
  const closeMenu = () => setMenu(false);

  useEffect(() => { let active = true; api.creators().then((data) => { if (active) setCreators(data.creators.slice(0, 4)); }).catch(() => {}); return () => { active = false; }; }, []);
  useEffect(() => {
    let active = true;
    setCampaignLoading(true);
    const filters = category === "전체" ? "" : new URLSearchParams({ category }).toString();
    api.campaigns(filters).then((data) => { if (active) { setCampaigns(data.campaigns.slice(0, 3)); setCampaignSource(data.campaigns.length ? "live" : "empty"); } }).catch(() => { if (active) { setCampaigns([]); setCampaignSource("offline"); } }).finally(() => { if (active) setCampaignLoading(false); });
    return () => { active = false; };
  }, [category, campaignRetry]);

  const submitSearch = (event: FormEvent) => { event.preventDefault(); window.location.href = discoveryUrl(audience, search, platform); };
  const displayedCampaigns = campaigns.length ? campaigns : DEMO_CAMPAIGNS.filter((campaign) => category === "전체" || campaign.category === category);

  return (
    <div className="landing-v2">
      <header className="lv-header"><div className="lv-container lv-header-inner"><Brand /><nav className={menu ? "is-open" : ""} aria-label="메인 메뉴"><a href="/creators" onClick={closeMenu}>크리에이터 찾기</a><a href="/campaigns" onClick={closeMenu}>캠페인 찾기</a><a href="#how-it-works" onClick={closeMenu}>이용 방법</a><a href="/studio" onClick={closeMenu}>PPL 스튜디오 <span>NEW</span></a></nav><div className="lv-header-actions"><a className="lv-login" href="/workspace">로그인</a><a className="lv-button lv-button-dark lv-header-cta" href="/campaigns?create=1">브랜드로 시작하기</a><button className="lv-menu" aria-label={menu ? "메뉴 닫기" : "메뉴 열기"} aria-expanded={menu} aria-controls="lv-mobile-navigation" onClick={() => setMenu(!menu)}>{menu ? <X size={23} /> : <Menu size={23} />}</button></div></div>{menu && <nav id="lv-mobile-navigation" className="lv-mobile-nav" aria-label="모바일 메뉴"><a href="/creators" onClick={closeMenu}>크리에이터 찾기</a><a href="/campaigns" onClick={closeMenu}>캠페인 찾기</a><a href="#how-it-works" onClick={closeMenu}>이용 방법</a><a href="/studio" onClick={closeMenu}>PPL 스튜디오</a></nav>}</header>
      <main>
        <section className="lv-hero"><div className="lv-container lv-hero-grid"><div className="lv-hero-copy"><div className="lv-audience-switch" aria-label="이용 목적 선택"><button aria-pressed={audience === "brand"} className={audience === "brand" ? "active" : ""} onClick={() => setAudience("brand")}>브랜드를 위한</button><button aria-pressed={audience === "creator"} className={audience === "creator" ? "active" : ""} onClick={() => setAudience("creator")}>크리에이터를 위한</button></div><span className="lv-kicker lv-hero-kicker">GOOD CONTENT STARTS WITH A GOOD MATCH.</span><h1>{audience === "brand" ? <>우리 브랜드와<br /><span>딱 맞는 크리에이터.</span></> : <>내 콘텐츠와<br /><span>딱 맞는 브랜드.</span></>}</h1><p className="lv-hero-description">{audience === "brand" ? <>브랜드의 이야기를 가장 잘 전할 파트너를 만나세요.<br />탐색부터 캠페인 지원·선정까지, Admasker에서.</> : <>나만의 취향과 콘텐츠를 알아봐줄 브랜드를 만나세요.<br />새로운 협업의 시작을 Admasker와 함께하세요.</>}</p><form className="lv-search-form" onSubmit={submitSearch}><label className="lv-search-platform"><span>플랫폼</span><select aria-label="검색 플랫폼" value={platform} onChange={(event) => setPlatform(event.target.value)}>{PLATFORMS.map((value) => <option key={value} value={value}>{value === "전체" ? "모든 플랫폼" : value}</option>)}</select><ChevronDown size={15} aria-hidden="true" /></label><label className="lv-search-input"><span className="lv-sr-only">{audience === "brand" ? "크리에이터 검색어" : "캠페인 검색어"}</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={audience === "brand" ? "분야, 채널명, 콘텐츠 키워드" : "브랜드, 캠페인, 콘텐츠 키워드"} maxLength={100} /></label><button className="lv-search-submit" aria-label={audience === "brand" ? "크리에이터 검색" : "캠페인 검색"} type="submit"><Search size={21} /></button></form><div className="lv-popular-search"><span>분야별로 찾기</span>{["라이프스타일", "뷰티", "패션", "웹드라마"].map((value) => <a href={discoveryUrl(audience, "", platform, value)} key={value}>{value}</a>)}</div><div className="lv-hero-bottom"><a href={audience === "brand" ? "/campaigns?create=1" : "/workspace"} className="lv-hero-secondary">{audience === "brand" ? "캠페인 등록하고 크리에이터 제안 받기" : "프로필 등록하고 협업 시작하기"}<PlusMark /></a><span>취향이 통하는 곳에서, 좋은 협업이 시작돼요.</span></div></div><div className="lv-hero-visual"><div className="lv-photo-stage"><span className="lv-orbit lv-orbit-a" /><span className="lv-orbit lv-orbit-b" /><div className="lv-photo-card lv-photo-one"><img src="/images/creator-lifestyle.jpg" alt="라이프스타일 크리에이터 콘셉트 사진" fetchPriority="high" /><span><Instagram size={16} />LIFESTYLE</span></div><div className="lv-photo-card lv-photo-two"><img src="/images/creator-story.jpg" alt="스토리텔링 크리에이터 콘셉트 사진" /><span><Youtube size={16} />STORYTELLER</span></div><div className="lv-photo-card lv-photo-three"><img src="/images/creator-fashion.jpg" alt="패션 크리에이터 콘셉트 사진" /><span><Camera size={16} />FASHION & BEAUTY</span></div><div className="lv-connection-note"><span><Handshake size={22} /></span><div><strong>서로의 취향이 닿는 순간.</strong><small>브랜드 × 크리에이터</small></div></div><span className="lv-floating-spark" aria-hidden="true"><Sparkles size={30} /></span><span className="lv-content-sticker" aria-hidden="true">LET'S<br /><em>create.</em></span></div><p className="lv-photo-disclosure">서비스 소개용 콘셉트 이미지이며 실제 등록 프로필이 아닙니다.</p></div></div></section>
        <section className="lv-platform-strip" aria-label="지원 콘텐츠 플랫폼"><div className="lv-container"><span>다양한 채널.<br /><strong>같은 취향의 연결.</strong></span><div><span><Instagram size={25} />Instagram</span><span><Youtube size={28} />YouTube</span><span><Music2 size={25} />TikTok</span><span><Clapperboard size={25} />웹드라마</span></div><small>활동 플랫폼과 콘텐츠 분야로 파트너를 찾아보세요.</small></div></section>

        <CreatorShelf profiles={creators} />

        <section className="lv-section lv-campaign-section" id="campaigns"><div className="lv-container"><div className="lv-section-head"><div><span className="lv-kicker">YOUR NEXT BRAND COLLABORATION</span><h2>당신의 다음 콘텐츠가<br className="lv-mobile-break" /> 기다리는 캠페인.</h2><p>내 취향과 채널에 잘 어울리는 브랜드를 발견해 보세요.</p></div><a className="lv-link" href="/campaigns">캠페인 전체 보기 <PlusMark /></a></div><div className="lv-category-tabs" aria-label="캠페인 카테고리">{CATEGORIES.map((value) => <button key={value} aria-pressed={category === value} className={category === value ? "active" : ""} onClick={() => setCategory(value)}>{value}</button>)}</div>{campaignLoading ? <div className="lv-card-loading" role="status">캠페인을 불러오고 있어요.</div> : <>{campaignSource !== "live" && <div className="lv-example-note lv-campaign-note"><span>{campaignSource === "offline" ? "캠페인 서버에 연결되지 않아 서비스 예시를 보여드립니다." : "현재 조건에 맞는 모집 캠페인이 없어 서비스 예시를 보여드립니다."} 예시는 실제 모집·광고주·예산이 아닙니다.</span>{campaignSource === "offline" && <button onClick={() => setCampaignRetry((value) => value + 1)}>다시 연결</button>}</div>}<div className="lv-campaign-grid">{displayedCampaigns.map((campaign) => <LandingCampaign key={campaign.id} campaign={campaign} />)}</div>{!displayedCampaigns.length && <div className="lv-empty"><Search size={27} /><h3>새로운 캠페인을 기다리고 있어요.</h3><p>다른 분야를 살펴보거나 브랜드의 캠페인을 등록해 보세요.</p><a className="lv-link" href="/campaigns?create=1">캠페인 등록하기 <PlusMark /></a></div>}</>}</div></section>

        <section className="lv-section lv-audience-section"><div className="lv-container lv-audience-grid"><article className="lv-audience-card lv-for-brand"><span className="lv-audience-icon"><BriefcaseBusiness size={25} /></span><span className="lv-kicker">FOR BRANDS</span><h2>브랜드의 이야기를<br />전할 사람을 찾으세요.</h2><p>어울리는 콘텐츠를 만드는 파트너를 찾고,<br />우리 브랜드만의 협업을 시작하세요.</p><ul><li><Check size={17} />콘텐츠 분야와 플랫폼으로 탐색</li><li><Check size={17} />캠페인별 제안과 지원자를 한 곳에서</li><li><Check size={17} />프로필과 아이디어를 검토하고 선정</li></ul><a className="lv-button lv-button-dark" href="/campaigns?create=1">브랜드 캠페인 등록하기</a><span className="lv-audience-decoration" aria-hidden="true"><Users size={105} strokeWidth={1} /></span></article><article className="lv-audience-card lv-for-creator"><span className="lv-audience-icon"><Camera size={25} /></span><span className="lv-kicker">FOR CREATORS</span><h2>내 콘텐츠를 알아봐줄<br />다음 브랜드를 만나세요.</h2><p>나의 채널과 콘텐츠 스타일을 소개하고,<br />좋아하는 브랜드에 나만의 아이디어를 제안하세요.</p><ul><li><Check size={17} />취향과 채널에 맞는 캠페인 발견</li><li><Check size={17} />아이디어를 담아 직접 제안하는 협업</li><li><Check size={17} />지원과 선정 결과를 워크스페이스에서</li></ul><a className="lv-button lv-button-lime" href="/campaigns">나에게 맞는 캠페인 찾기</a><span className="lv-audience-decoration" aria-hidden="true"><Camera size={105} strokeWidth={1} /></span></article></div></section>

        <section className="lv-section lv-how-section" id="how-it-works"><div className="lv-container"><div className="lv-how-heading"><span className="lv-kicker">A GOOD MATCH, A SIMPLE START</span><h2>좋은 협업, 시작은 간단하게.</h2><p>서로를 발견하고, 아이디어를 나누고, 함께할 파트너를 정하세요.</p><div className="lv-guide-switch" aria-label="역할별 이용 방법"><button aria-pressed={guideAudience === "brand"} className={guideAudience === "brand" ? "active" : ""} onClick={() => setGuideAudience("brand")}>광고주 이용 방법</button><button aria-pressed={guideAudience === "creator"} className={guideAudience === "creator" ? "active" : ""} onClick={() => setGuideAudience("creator")}>크리에이터 이용 방법</button></div></div><div className="lv-guide-grid">{GUIDES[guideAudience].map(({ Icon, title, description }) => <article key={title}><span><Icon size={26} /></span><h3>{title}</h3><p>{description}</p></article>)}</div><a className="lv-link lv-how-link" href={guideAudience === "brand" ? "/campaigns?create=1" : "/workspace"}>{guideAudience === "brand" ? "첫 캠페인 등록하기" : "프로필 만들고 시작하기"}<PlusMark /></a></div></section>

        <section className="lv-ppl-section" id="ppl-studio"><div className="lv-container lv-ppl-grid"><div className="lv-ppl-copy"><span className="lv-kicker">THE NEXT SCENE OF COLLABORATION</span><h2>매칭, 그다음은<br />장면 속으로.</h2><p>영상의 이야기는 그대로 두고,<br />브랜드가 자연스럽게 어울릴 자리를 찾아보세요.</p><ul><li><ShieldCheck size={19} />제품 주변만 재생성하는 원본 보존 구조</li><li><Layers2 size={19} />제품의 위치·크기·노출 구간을 시안으로</li><li><Film size={19} />원본과 비교하며 검토하는 PPL 스튜디오</li></ul><a className="lv-button lv-button-lime" href="/studio"><Sparkles size={17} />PPL 스튜디오 살펴보기</a><small>현재는 배치 시안부터 사용할 수 있어요.<br />AI 재생성은 GPU 서버 연결과 실제 품질 검증이 필요합니다.</small></div><PplPreview /></div></section>

        <section className="lv-section lv-faq-section" id="faq"><div className="lv-container lv-faq-grid"><div><span className="lv-kicker">A FEW THINGS TO KNOW</span><h2>시작하기 전에<br />궁금한 이야기.</h2><p>브랜드와 크리에이터,<br />서로의 다음을 응원합니다.</p></div><div className="lv-faq-list">{FAQ.map(([question, answer]) => <details key={question}><summary>{question}<PlusMark /></summary><p>{answer}</p></details>)}</div></div></section>

        <section className="lv-final-section"><div className="lv-container"><span className="lv-kicker">YOUR NEXT COLLABORATION STARTS HERE</span><h2>좋은 협업은,<br />잘 맞는 파트너에서 시작돼요.</h2><p>브랜드의 이야기와 크리에이터의 취향이 만나는 곳.</p><div><a className="lv-button lv-button-dark" href="/creators">크리에이터 찾기</a><a className="lv-button lv-button-white" href="/campaigns">캠페인 찾기</a></div><span className="lv-final-decor" aria-hidden="true"><Handshake size={200} strokeWidth={.8} /></span></div></section>
      </main>
      <footer className="lv-footer"><div className="lv-container"><div className="lv-footer-top"><div><Brand /><p>좋은 브랜드와 좋은 콘텐츠의 다음 장면.</p></div><div className="lv-footer-links"><div><strong>파트너 찾기</strong><a href="/creators">크리에이터 찾기</a><a href="/campaigns">캠페인 찾기</a><a href="/campaigns?create=1">브랜드 캠페인 등록</a></div><div><strong>Admasker</strong><a href="#how-it-works">이용 방법</a><a href="/studio">PPL 스튜디오</a><a href="#faq">자주 묻는 질문</a></div></div></div><div className="lv-footer-bottom"><span>© {new Date().getFullYear()} Admasker. All rights reserved.</span><span>브랜드 × 크리에이터 · 초기 협업 플랫폼</span></div></div></footer>
    </div>
  );
}
