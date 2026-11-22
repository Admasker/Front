"use client";

import { useState } from "react";
import { Check, ChevronDown, ChevronRight, CirclePlay, Clapperboard, Eye, Focus, ImagePlus, Layers2, LockKeyhole, Menu, MousePointer2, Move, Play, Plus, ScanLine, ShieldCheck, SlidersHorizontal, Sparkles, Upload, X } from "lucide-react";
import Brand from "./Brand";
import { FeaturedCampaigns } from "./Marketplace";

const faqs = [
  ["브랜드와 크리에이터는 어떻게 시작하나요?", "브랜드는 광고주 계정으로 캠페인을 등록하고, 크리에이터는 채널과 콘텐츠 분야를 소개하는 공개 프로필을 등록합니다. 이메일 가입 후 내 워크스페이스에서 캠페인과 지원 내역을 관리할 수 있습니다."],
  ["매칭은 어떤 방식으로 진행되나요?", "플랫폼과 카테고리로 캠페인·크리에이터를 탐색합니다. 크리에이터가 콘텐츠 아이디어를 담아 지원하면 브랜드가 검토하고 선정합니다. 현재 자동 추천이나 자동 계약을 제공하는 방식은 아닙니다."],
  ["협업 계약과 결제도 여기서 진행하나요?", "현재는 캠페인 등록, 지원과 선정 상태 관리까지 제공합니다. 일정·제작 범위·제품 제공·광고비·권리 사용과 계약·결제는 당사자 간 별도 협의가 필요합니다."],
  ["영상 PPL은 원본을 어떻게 지키나요?", "PPL 스튜디오는 제품과 그림자·반사에 필요한 영역을 지정하고, 해당 영역만 AI 재생성 대상으로 사용하는 구조입니다. 그 밖의 화면은 원본 프레임으로 합성합니다. 실제 제품·로고 재현과 시간적 일관성은 결과 검수가 필요합니다."],
  ["지금 AI 영상 재생성을 사용할 수 있나요?", "배치 시안, 파일 업로드와 프로젝트 저장을 사용할 수 있습니다. 실제 AI 영상 재생성은 별도 GPU 서버 연결이 필요하고, 미연결 상태에서는 배치 시안만 제공합니다. 자연스러운 제품 재현 품질은 현재 검증 전입니다."],
];

function DemoEditor() {
  const [visible, setVisible] = useState(true);
  const [selected, setSelected] = useState("morrow");
  const [split, setSplit] = useState(0);
  return <div className="demo-editor" id="demo">
    <div className="editor-titlebar"><span className="window-controls"><i /><i /><i /></span><span className="editor-filename"><Clapperboard size={15} /> 늦은 오후의 카페 <span className="muted">/ 배치 시안</span></span><span className="editor-version">ADMASKER STUDIO</span></div>
    <div className="demo-editor-body">
      <div className="demo-screen">
        <img className="demo-photo" src="/images/cafe.jpg" alt="창가에서 핸드드립 커피를 내리는 카페 장면" />
        <div className="film-shade" />
        <div className="shot-label"><span className="tiny-cross">+</span> AFTERNOON, A LITTLE SLOWER.</div>
        <div className="demo-switch" aria-label="원본 및 제품 배치 시안"><button className={!visible ? "active" : ""} onClick={() => setVisible(false)}>원본</button><button className={visible ? "active" : ""} onClick={() => setVisible(true)}><Layers2 size={13} /> PPL 시안</button></div>
        <div className="demo-product-wrap" style={{ opacity: visible ? 1 : 0, clipPath: `inset(0 0 0 ${split}%)` }}>
          <div className="placed-product"><div className="product-shadow" /><img src="/images/product.svg" alt="가상 브랜드 morrow 콜드브루 제품 배치 예시" style={{ filter: selected === "morrow" ? "none" : "hue-rotate(95deg)" }} /><div className="tracking-outline"><i /><i /><i /><i /><span><Focus size={12} /> 제품 영역</span></div></div>
        </div>
        <span className="screen-footnote">가상 브랜드 · 이미지 기반 배치 데모</span>
        <div className="screen-caption"><span>당신이 만든 장면에,</span><strong>새로운 가능성 하나.</strong></div>
      </div>
      <aside className="demo-inspector"><div className="inspector-heading"><span>브랜드 레이어</span><SlidersHorizontal size={16} /></div><span className="field-label">제품 에셋</span><div className="asset-preview"><img src="/images/product.svg" alt="morrow 제품 이미지" /><span className="asset-corner">PNG</span></div><div className="asset-info"><span>morrow_coldbrew.png</span><Check size={15} /></div><div className="inspector-divider" /><span className="field-label">브랜드 바꿔보기</span><div className="brand-options"><button aria-pressed={selected === "morrow"} className={selected === "morrow" ? "selected" : ""} onClick={() => setSelected("morrow")}><i className="swatch-green" />morrow</button><button aria-pressed={selected === "citrus"} className={selected === "citrus" ? "selected" : ""} onClick={() => setSelected("citrus")}><i className="swatch-gold" />citrus</button></div><label className="field-label compare-label" htmlFor="compare">원본과 비교 <span>{split}%</span></label><input id="compare" type="range" min="0" max="100" value={split} onChange={(e) => { setVisible(true); setSplit(+e.target.value); }} /><div className="preserve-note"><LockKeyhole size={14} /><span>스토리와 장면을 지키는 설계</span></div><a href="/studio" className="btn btn-lime btn-full"><Plus size={16} /> 내 영상으로 시작</a></aside>
    </div>
    <div className="demo-timeline"><span className="timeline-play"><Play size={13} fill="currentColor" /></span><span className="mono">00:00</span><div className="timeline-track"><div className="timeline-thumbs">{Array.from({ length: 14 }, (_, i) => <div key={i} style={{ backgroundImage: "url(/images/cafe.jpg)", backgroundPosition: `${i * 7}% center` }} />)}</div><div className="timeline-layer"><Layers2 size={12} /><span>{selected} · 제품 배치</span></div><span className="timeline-playhead" /></div><span className="mono muted">00:05</span><span className="timeline-zoom"><Focus size={16} /> 시안</span></div>
  </div>;
}

export default function Landing() {
  const [menu, setMenu] = useState(false);
  return <div className="landing">
    <header className="site-header container"><Brand /><nav className={menu ? "mobile-open" : ""}><a href="/campaigns" onClick={() => setMenu(false)}>캠페인 찾기</a><a href="/creators" onClick={() => setMenu(false)}>크리에이터 찾기</a><a href="#workflow" onClick={() => setMenu(false)}>이용 가이드</a><a href="#faq" onClick={() => setMenu(false)}>자주 묻는 질문</a></nav><a className="btn btn-outline header-cta" href="/workspace">로그인 · 시작하기</a><button className="icon-btn mobile-menu" aria-label={menu ? "메뉴 닫기" : "메뉴 열기"} onClick={() => setMenu(!menu)}>{menu ? <X /> : <Menu />}</button></header>
    <main>
      <section className="hero container">
        <div className="hero-copy"><div className="hero-heading"><span className="eyebrow"><span className="pill-outline">EARLY ACCESS</span> CREATOR × BRAND, A NEW POSSIBILITY</span><h1>브랜드와 크리에이터,<br /><span>다음 장면을 함께.</span></h1></div><div className="hero-intro"><p>브랜드는 잘 맞는 크리에이터를,<br />크리에이터는 새로운 협업을.<br />영상 PPL부터 브랜디드 콘텐츠까지 연결합니다.</p><div className="hero-actions"><a href="/campaigns?create=1" className="btn btn-lime"><Plus size={18} /> 브랜드로 시작하기</a><a href="/campaigns" className="text-link"><Clapperboard size={19} /> 캠페인 찾기</a></div><span className="hero-subtext">콘텐츠의 취향에서 시작하는, 새로운 브랜드 협업.</span></div></div>
        <div className="matching-hero-visual">
          <div className="hero-visual-heading"><span>CREATIVE PEOPLE. MEANINGFUL CONNECTIONS.</span><span className="hero-visual-chip"><Layers2 size={13} /> 새로운 협업의 시작</span></div>
          <div className="hero-creator-portraits"><div className="hero-portrait portrait-a"><img src="/images/creator-lifestyle.jpg" alt="라이프스타일 크리에이터 콘셉트 사진" /><span>LIFESTYLE<small>일상의 취향을 나누는</small></span></div><div className="hero-portrait portrait-b"><img src="/images/creator-story.jpg" alt="스토리텔링 크리에이터 콘셉트 사진" /><span>STORYTELLING<small>자신만의 이야기를 만드는</small></span></div><div className="hero-portrait portrait-c"><img src="/images/creator-fashion.jpg" alt="패션 크리에이터 콘셉트 사진" /><span>FASHION<small>새로운 시선을 제안하는</small></span></div></div>
          <div className="hero-collaboration-card"><span className="collab-eyebrow"><Layers2 size={15} /> BRAND CAMPAIGN</span><div className="hero-brand-product"><img src="/images/product.svg" alt="가상 브랜드 morrow의 콜드브루 제품" /><div><strong>morrow</strong><span>A LITTLE PAUSE,<br />A BETTER DAY.</span></div></div><h3>우리 브랜드와 어울리는<br />당신의 이야기를 기다려요.</h3><div className="campaign-tags"><span>라이프스타일</span><span>영상 PPL</span></div><a className="btn btn-lime btn-full" href="/campaigns">나에게 맞는 협업 찾기</a><p>가상 브랜드 · 크리에이터 콘셉트 이미지 예시</p></div>
        </div>
        <div className="hero-principles"><span><Clapperboard size={17} /> 콘텐츠 취향으로 찾는 파트너</span><span><Layers2 size={17} /> 캠페인부터 지원 관리까지</span><span><ShieldCheck size={17} /> 원본을 지키는 PPL 스튜디오</span><span className="principles-caption">MADE FOR CREATORS AND BRANDS.</span></div>
      </section>

      <FeaturedCampaigns />
      <section className="ppl-intro-section container"><div className="section-heading"><div><span className="eyebrow text-lime">ONE STEP FURTHER, INTO THE SCENE</span><h2>협업이 정해졌다면,<br />브랜드를 장면 속으로.</h2></div><div><p>완성된 영상의 스토리와 원본 장면은 그대로.<br />제품과 필요한 주변 영역만 다시 그리는 PPL을 준비합니다.</p><a className="text-link text-lime" href="/studio"><Sparkles size={17} /> PPL 스튜디오 열기</a></div></div><DemoEditor /></section>
      <section className="solution-section container" id="solution"><div className="section-heading"><div><span className="eyebrow text-lime">THE INVISIBLE AD BREAK</span><h2>광고를 위한 장면 대신,<br />장면을 위한 광고.</h2></div><p>대사와 흐름을 바꾸지 않고.<br />제품이 원래 그곳에 있었던 것처럼.<br />이야기의 빈틈에서 브랜드의 자리를 찾습니다.</p></div><div className="solution-grid"><article className="solution-card solution-product"><div className="solution-image"><img className="card-photo" src="/images/cafe.jpg" alt="카페 장면의 제품 배치 예시" /><img className="card-product" src="/images/product.svg" alt="배치할 콜드브루 캔" /><span className="image-chip"><Focus size={12} /> OBJECT PLACEMENT</span></div><div className="solution-card-copy"><h3>테이블 위, 제품 하나.</h3><p>음료, 뷰티, 일상의 소품까지.<br />자연스러운 제품 배치를 위한 첫 번째 공간.</p><span className="feature-tag">제품 삽입</span></div></article><article className="solution-card"><div className="solution-image"><img className="card-photo" src="/images/scene.jpg" alt="조명과 벽면이 보이는 카페 내부" /><div className="wall-brand">A LITTLE<br /><em>morrow.</em></div><span className="image-chip"><ScanLine size={12} /> SURFACE PLACEMENT</span></div><div className="solution-card-copy"><h3>공간 속, 브랜드 한 줄.</h3><p>벽면 포스터부터 매장 속 화면까지.<br />장면의 분위기와 어울리는 브랜드의 존재감.</p><span className="feature-tag">공간 브랜딩</span></div></article><article className="solution-card"><div className="solution-image brand-variation"><div className="variation-ring" /><img src="/images/product.svg" alt="브랜드별 제품 에셋 교체 개념" /><span className="variation-pill variation-a">morrow</span><span className="variation-pill variation-b">your brand</span><span className="image-chip"><Layers2 size={12} /> REUSABLE LAYERS</span></div><div className="solution-card-copy"><h3>같은 이야기, 다른 가능성.</h3><p>원본과 광고 슬롯을 분리해,<br />하나의 콘텐츠에서 다양한 협업을 설계하세요.</p><span className="feature-tag">브랜드 레이어</span></div></article></div><p className="section-note">이미지는 서비스 방향을 보여주는 배치 시안입니다. AI 재생성 품질과 지원 장면은 현재 검증 중입니다.</p></section>

      <section className="workflow-section" id="workflow"><div className="container"><div className="section-heading"><div><span className="eyebrow text-lime">FROM SCENE TO OPPORTUNITY</span><h2>좋은 협업으로 이어지는<br />단순한 시작.</h2></div><a className="btn btn-outline" href="/campaigns">첫 협업 찾아보기</a></div><div className="workflow-grid"><article><div className="workflow-icon"><Upload size={26} /><span className="workflow-line" /></div><span className="step-label">INTRODUCE</span><h3>나의 콘텐츠를 소개하고</h3><p>프로필과 채널을 등록하거나<br />브랜드의 캠페인을 소개하세요.</p></article><article><div className="workflow-icon"><MousePointer2 size={26} /><span className="workflow-line" /></div><span className="step-label">DISCOVER</span><h3>잘 맞는 기회를 찾으세요</h3><p>플랫폼과 콘텐츠 분야로<br />서로에게 어울리는 파트너를 찾으세요.</p></article><article><div className="workflow-icon"><Sparkles size={26} /><span className="workflow-line" /></div><span className="step-label">CONNECT</span><h3>함께할 이야기를 제안하고</h3><p>크리에이터는 캠페인에 지원하고,<br />브랜드는 제안을 검토해 선정하세요.</p></article><article><div className="workflow-icon"><Eye size={26} /></div><span className="step-label">CREATE</span><h3>나만의 협업을 완성하세요</h3><p>협업 조건은 당사자가 함께 정하고,<br />영상 PPL은 스튜디오에서 검토하세요.</p></article></div><div className="workflow-bottom"><LockKeyhole size={17} /><span>캠페인 등록부터 지원·선정 상태까지, 내 워크스페이스에서 관리하세요.</span><span className="mono">STORY FIRST, ALWAYS.</span></div></div></section>

      <section className="creators-section container" id="creators"><div className="creator-intro"><span className="eyebrow text-lime">MORE ROOM FOR CREATIVITY</span><h2>좋은 이야기가<br />다음 이야기로<br /><span className="text-muted">이어질 수 있도록.</span></h2><p>창작에는 자유를.<br />브랜드에는 이야기 속 자리를.</p></div><div className="audience-cards"><article><div className="audience-title"><Clapperboard size={23} /><span>FOR CREATORS</span></div><h3>창작의 흐름을 지키세요.</h3><p>나만의 채널과 콘텐츠를 소개하고,<br />내 취향과 잘 어울리는 브랜드의 제안을 찾아보세요.</p><ul><li><Check size={16} /> 분야와 플랫폼으로 찾는 캠페인</li><li><Check size={16} /> 아이디어를 담아 제안하는 협업</li><li><Check size={16} /> 지원·선정 상태를 한 곳에서 관리</li></ul><a href="/creators" className="text-link">내 콘텐츠로 시작하기 <Plus size={15} /></a></article><article><div className="audience-title"><Layers2 size={23} /><span>FOR BRANDS</span></div><h3>이야기 안으로 들어오세요.</h3><p>브랜드의 이야기를 가장 잘 전할 파트너를 찾고,<br />함께 만들 콘텐츠의 가능성을 이야기해 보세요.</p><ul><li><Check size={16} /> 콘텐츠 분야로 탐색하는 크리에이터</li><li><Check size={16} /> 캠페인별로 모이는 콘텐츠 제안</li><li><Check size={16} /> 영상 PPL까지 이어지는 스튜디오</li></ul><a href="/campaigns?create=1" className="text-link">브랜드 캠페인 시작하기 <Plus size={15} /></a></article></div></section>

      <section className="faq-section container" id="faq"><div><span className="eyebrow text-lime">A FEW THINGS TO KNOW</span><h2>궁금한 이야기.</h2><p className="text-muted">Admasker는 현재 초기 제품을 만들고 있습니다.</p></div><div className="faq-list">{faqs.map(([q, a]) => <details key={q}><summary>{q}<Plus size={20} /></summary><p>{a}</p></details>)}</div></section>

      <section className="closing-section container"><div className="closing-art" aria-hidden="true"><Layers2 /></div><span className="eyebrow">YOUR NEXT OPPORTUNITY IS ALREADY IN FRAME.</span><h2>이미 완성된 이야기.<br />아직 열려 있는 가능성.</h2><p>나에게 맞는 브랜드와 크리에이터를 만나보세요.</p><a href="/campaigns" className="btn btn-dark"><Plus size={18} /> 첫 번째 협업 찾아보기</a><span className="closing-note">브랜드 · 크리에이터를 위한 초기 협업 플랫폼</span></section>
    </main>
    <footer className="site-footer container"><div><Brand /><p>좋은 이야기에, 새로운 가능성을.</p></div><div className="footer-links"><a href="#solution">솔루션</a><a href="#faq">자주 묻는 질문</a><a href="/campaigns">캠페인</a></div><span className="footer-copyright">© {new Date().getFullYear()} Admasker. Story first, always.</span></footer>
  </div>;
}
