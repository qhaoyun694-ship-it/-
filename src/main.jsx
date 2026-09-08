import React, { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import "./styles.css";
gsap.registerPlugin(ScrollTrigger, useGSAP);

const imagePath = (filename) => `${import.meta.env.BASE_URL}images/${filename}`;
const categories = ["婚礼", "人像写真", "活动纪实", "视频", "其他"];
const weddingGroups = [
  [9, 16],
  [8, 12],
  [7, 8],
  [6, 10],
  [5, 20],
  [4, 13],
  [3, 19],
  [2, 9],
  [1, 12],
];
const weddingCovers = {
  9: 8,
  8: 1,
  7: 1,
  6: 4,
  5: 14,
  4: 7,
  3: 17,
  2: 8,
  1: 8,
};
const weddingWorks = weddingGroups.flatMap(([group, count]) =>
  Array.from({ length: count }, (_, index) => {
    const number = String(index + 1).padStart(2, "0");
    const src = imagePath(`weddings/group-${group}/${number}.jpg`);
    return {
      id: `wedding-${group}-${number}`,
      category: "婚礼",
      series: `第 ${group} 组`,
      src,
      full: src,
      alt: `婚礼第 ${group} 组作品 ${index + 1}`,
      size: "normal",
    };
  }),
);
const weddingCollections = weddingGroups.map(([group, count]) => ({
  group,
  count,
  category: "婚礼",
  cover: imagePath(
    `weddings/group-${group}/${String(weddingCovers[group]).padStart(2, "0")}.jpg`,
  ),
  works: weddingWorks.filter((work) => work.series === `第 ${group} 组`),
}));
const portraitGroups = [
  [1, 20],
  [2, 13],
  [3, 7],
  [4, 14],
  [10, 17],
];
const portraitCovers = {
  1: 1,
  2: 9,
  3: 1,
  4: 12,
  10: 3,
};
const portraitWorks = portraitGroups.flatMap(([group, count]) =>
  Array.from({ length: count }, (_, index) => {
    const number = String(index + 1).padStart(2, "0");
    const src = imagePath(`portraits/group-${group}/${number}.jpg`);
    return {
      id: `portrait-${group}-${number}`,
      category: "人像写真",
      series: `写真 ${group}`,
      src,
      full: src,
      alt: `人像写真作品 ${group}-${index + 1}`,
      size: "normal",
    };
  }),
);
const portraitCollections = portraitGroups.map(([group, count]) => ({
  group,
  count,
  category: "人像写真",
  cover: imagePath(
    `portraits/group-${group}/${String(portraitCovers[group]).padStart(2, "0")}.jpg`,
  ),
  works: portraitWorks.filter((work) => work.series === `写真 ${group}`),
}));
const initialWorks = [
  ...weddingWorks,
  ...portraitWorks,
  {
    id: "x1",
    category: "其他",
    src: imagePath("experimental-01.jpg"),
    full: imagePath("experimental-01-large.jpg"),
    alt: "其他作品一",
    size: "normal",
  },
  {
    id: "x2",
    category: "其他",
    src: imagePath("experimental-02.jpg"),
    full: imagePath("experimental-02-large.jpg"),
    alt: "其他作品二",
    size: "small",
  },
  {
    id: "e1",
    category: "活动纪实",
    src: imagePath("event-01.jpg"),
    full: imagePath("event-01-large.jpg"),
    alt: "活动纪实作品一",
    size: "normal",
  },
  {
    id: "e2",
    category: "活动纪实",
    src: imagePath("event-02.jpg"),
    full: imagePath("event-02-large.jpg"),
    alt: "活动纪实作品二",
    size: "wide",
  },
];

const saved = () => {
  try {
    return (
      JSON.parse(localStorage.getItem("qiaokeli-portfolio-v4")) || initialWorks
    );
  } catch {
    return initialWorks;
  }
};
const compressImage = async (file) => {
  const bitmap = await createImageBitmap(file);
  const max = 1600,
    scale = Math.min(1, max / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d").drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return new Promise((resolve, reject) =>
    canvas.toBlob(
      (blob) => {
        if (!blob) return reject(new Error("图片处理失败"));
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      },
      "image/webp",
      0.78,
    ),
  );
};
const initialCopy = {
  heroKicker: "独立摄影师",
  heroTitle: "让影像，\n替时间停留。",
  heroMeta: "婚礼 · 人像写真 · 活动纪实 · 视频",
  worksNote: "被看见的片刻",
  aboutTitle: "关于我",
  aboutOne: "我是一名独立摄影师，关注人与人之间真实而细微的情绪。",
  aboutTwo: "相信好的照片，会保留当时的空气、光线和沉默。",
  contactKicker: "如果你也珍惜真实的瞬间",
  contactTitle: "一起留下它。",
  wechat: "Qiaoyunjinli",
  location: "中国 · 可预约异地拍摄",
};
const savedCopy = () => {
  try {
    return {
      ...initialCopy,
      ...JSON.parse(localStorage.getItem("qiaokeli-copy")),
    };
  } catch {
    return initialCopy;
  }
};

function Lightbox({ work, sequence, onChange, onClose }) {
  const close = useRef(null);
  const index = sequence.findIndex((item) => item.id === work?.id);
  const navigate = (step) => {
    if (index < 0 || sequence.length < 2) return;
    onChange(sequence[(index + step + sequence.length) % sequence.length]);
  };
  useEffect(() => {
    if (!work) return;
    const old = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    close.current?.focus();
    const key = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") navigate(-1);
      if (e.key === "ArrowRight") navigate(1);
    };
    window.addEventListener("keydown", key);
    return () => {
      document.body.style.overflow = old;
      window.removeEventListener("keydown", key);
    };
  }, [work, index, sequence, onChange, onClose]);
  if (!work) return null;
  return (
    <div
      className="lightbox"
      role="dialog"
      aria-modal="true"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <button ref={close} className="lightbox-close" onClick={onClose}>
        关闭
      </button>
      {sequence.length > 1 && (
        <>
          <button
            className="lightbox-arrow lightbox-prev"
            onClick={() => navigate(-1)}
            aria-label="上一张"
          >
            ←
          </button>
          <button
            className="lightbox-arrow lightbox-next"
            onClick={() => navigate(1)}
            aria-label="下一张"
          >
            →
          </button>
        </>
      )}
      <img src={work.full || work.src} alt={work.alt} />
      <p>
        {work.category}
        {index >= 0 ? ` · ${index + 1} / ${sequence.length}` : ""}
      </p>
    </div>
  );
}

function Editor({ works, setWorks, copy, setCopy, onExit }) {
  const [dragged, setDragged] = useState(null),
    [notice, setNotice] = useState("");
  const addImages = async (e) => {
    const files = [...e.target.files];
    if (!files.length) return;
    setNotice("正在压缩照片…");
    try {
      const items = [];
      for (const file of files) {
        if (!file.type.startsWith("image/")) continue;
        const src = await compressImage(file);
        items.push({
          id: `local-${Date.now()}-${items.length}`,
          category: "人像写真",
          src,
          full: src,
          alt: file.name.replace(/\.[^.]+$/, ""),
          size: "normal",
        });
      }
      setWorks((v) => [...v, ...items]);
      setNotice(`已添加 ${items.length} 张照片`);
    } catch (error) {
      setNotice(`上传失败：${error.message}`);
    } finally {
      e.target.value = "";
    }
  };
  const update = (id, patch) =>
    setWorks((v) => v.map((w) => (w.id === id ? { ...w, ...patch } : w)));
  const drop = (target) => {
    if (!dragged || dragged === target) return;
    setWorks((v) => {
      const next = [...v],
        from = next.findIndex((w) => w.id === dragged),
        to = next.findIndex((w) => w.id === target);
      const [item] = next.splice(from, 1);
      next.splice(to, 0, item);
      return next;
    });
    setDragged(null);
  };
  const exportConfig = () => {
    const clean = works.map(({ id, category, series, alt, size, src, full }) => ({
      id,
      category,
      series,
      alt,
      size,
      src: src.startsWith("data:") ? "请替换为 images/文件名" : src,
      full: full?.startsWith("data:") ? "请替换为 images/大图文件名" : full,
    }));
    const blob = new Blob([JSON.stringify(clean, null, 2)], {
      type: "application/json",
    });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "portfolio-config.json";
    a.click();
    URL.revokeObjectURL(a.href);
    setNotice("配置已导出");
  };
  const field = (label, key, multi = false) => (
    <label className="copy-field">
      <span>{label}</span>
      {multi ? (
        <textarea
          value={copy[key]}
          onChange={(e) => setCopy((v) => ({ ...v, [key]: e.target.value }))}
        />
      ) : (
        <input
          value={copy[key]}
          onChange={(e) => setCopy((v) => ({ ...v, [key]: e.target.value }))}
        />
      )}
    </label>
  );
  return (
    <aside className="editor" aria-label="作品集编辑器">
      <div className="editor-head">
        <div>
          <strong>可视化编辑</strong>
          <span>仅保存在当前浏览器</span>
        </div>
        <button onClick={onExit}>完成预览</button>
      </div>
      <details className="copy-editor" open>
        <summary>页面文字</summary>
        {field("首页小标题", "heroKicker")}
        {field("首页主标题", "heroTitle", true)}
        {field("首页说明", "heroMeta")}
        {field("作品说明", "worksNote")}
        {field("关于我第一段", "aboutOne", true)}
        {field("关于我第二段", "aboutTwo", true)}
        {field("联系引导", "contactKicker")}
        {field("联系标题", "contactTitle")}
        {field("微信号", "wechat")}
        {field("所在地", "location")}
      </details>
      <div className="editor-actions">
        <label className="upload" htmlFor="photo-upload">
          添加照片
        </label>
        <input
          id="photo-upload"
          className="file-input"
          type="file"
          accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
          multiple
          onChange={addImages}
        />
        <button onClick={exportConfig}>导出配置</button>
        <button
          onClick={() => {
            setWorks(initialWorks);
            setCopy(initialCopy);
            setNotice("已恢复默认");
          }}
        >
          恢复默认
        </button>
      </div>
      <p className="editor-tip">
        拖动卡片改变顺序。上传时会自动压缩本地预览，不会上传到网络。
      </p>
      <div className="editor-list">
        {works.map((w, i) => (
          <article
            key={w.id}
            draggable
            onDragStart={() => setDragged(w.id)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => drop(w.id)}
          >
            <span className="drag">↕</span>
            <img src={w.src} alt="" />
            <div>
              <b>{String(i + 1).padStart(2, "0")}</b>
              <input
                value={w.alt}
                aria-label="作品名称"
                onChange={(e) => update(w.id, { alt: e.target.value })}
              />
              <select
                value={w.category}
                onChange={(e) => update(w.id, { category: e.target.value })}
              >
                {categories.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
              <select
                value={w.size}
                onChange={(e) => update(w.id, { size: e.target.value })}
              >
                <option value="normal">标准</option>
                <option value="small">收窄</option>
                <option value="wide">加宽</option>
              </select>
            </div>
            <button
              className="remove"
              onClick={() => setWorks((v) => v.filter((x) => x.id !== w.id))}
            >
              删除
            </button>
          </article>
        ))}
      </div>
      {notice && <p className="editor-notice">{notice}</p>}
    </aside>
  );
}

function App() {
  const page = useRef(null),
    cursor = useRef(null),
    spotlight = useRef(null),
    [filter, setFilter] = useState("全部"),
    [activeGroup, setActiveGroup] = useState(null),
    [activeCategory, setActiveCategory] = useState(null),
    [active, setActive] = useState(null),
    [activeSequence, setActiveSequence] = useState([]),
    [works, setWorks] = useState(saved),
    [copy, setCopy] = useState(savedCopy),
    [editing, setEditing] = useState(
      () => new URLSearchParams(location.search).get("edit") === "1",
    );
  const visible =
    filter === "全部" ? works : works.filter((w) => w.category === filter);
  const activeCollection = (
    activeCategory === "人像写真" ? portraitCollections : weddingCollections
  ).find((collection) => collection.group === activeGroup);
  const ungroupedWorks = visible.filter(
    (work) => work.category !== "婚礼" && work.category !== "人像写真",
  );
  const selectFilter = (nextFilter) => {
    setFilter(nextFilter);
    setActiveGroup(null);
    setActiveCategory(null);
  };
  const openWork = (work, sequence) => {
    setActiveSequence(sequence);
    setActive(work);
  };
  useEffect(() => {
    try {
      localStorage.setItem("qiaokeli-portfolio-v4", JSON.stringify(works));
    } catch {
      console.warn("本地图片过多，请减少上传数量");
    }
  }, [works]);
  useEffect(
    () => localStorage.setItem("qiaokeli-copy", JSON.stringify(copy)),
    [copy],
  );
  useEffect(() => {
    const frame = requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => cancelAnimationFrame(frame);
  }, [filter, activeGroup, activeCategory]);
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from(".hero-copy>*", {
          autoAlpha: 0,
          y: 24,
          duration: 1.1,
          stagger: 0.12,
          ease: "power3.out",
        });
        gsap.from(".cover-image", {
          autoAlpha: 0,
          duration: 1.6,
          ease: "power2.out",
        });
      });
      mm.add(
        "(min-width: 701px) and (prefers-reduced-motion: no-preference)",
        () => {
          gsap.utils
            .toArray(".reveal")
            .forEach((item) =>
              gsap.from(item, {
                autoAlpha: 0,
                y: 24,
                duration: 0.95,
                ease: "power3.out",
                scrollTrigger: { trigger: item, start: "top 84%", once: true },
              }),
            );
        },
      );
      mm.add("(max-width: 700px)", () => {
        gsap.set(".reveal", { clearProps: "opacity,visibility,transform" });
      });
      return () => mm.revert();
    },
    { scope: page },
  );
  useGSAP(
    (context, contextSafe) => {
      if (editing) return;
      const mm = gsap.matchMedia();
      mm.add(
        "(min-width: 701px) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)",
        () => {
          const cursorEl = cursor.current;
          const spotlightEl = spotlight.current;
          document.body.classList.add("has-art-cursor");
          gsap.set([cursorEl, spotlightEl], { xPercent: -50, yPercent: -50 });

          const cursorX = gsap.quickTo(cursorEl, "x", { duration: 0.22, ease: "power3.out" });
          const cursorY = gsap.quickTo(cursorEl, "y", { duration: 0.22, ease: "power3.out" });
          const lightX = gsap.quickTo(spotlightEl, "x", { duration: 0.85, ease: "power3.out" });
          const lightY = gsap.quickTo(spotlightEl, "y", { duration: 0.85, ease: "power3.out" });

          const onPointerMove = contextSafe((event) => {
            cursorX(event.clientX);
            cursorY(event.clientY);
            lightX(event.clientX);
            lightY(event.clientY);
            cursorEl.classList.add("is-visible");
            spotlightEl.classList.add("is-visible");
            const target = event.target;
            const overImage = Boolean(target.closest(".collection-card, .group-photo, .work-item"));
            cursorEl.classList.toggle("is-view", overImage);
            cursorEl.classList.toggle("is-link", Boolean(target.closest("a, button")) && !overImage);
          });
          const onPointerLeave = () => {
            cursorEl.classList.remove("is-visible", "is-view", "is-link");
            spotlightEl.classList.remove("is-visible");
          };
          window.addEventListener("pointermove", onPointerMove, { passive: true });
          document.documentElement.addEventListener("mouseleave", onPointerLeave);

          const cleanups = [];
          gsap.utils.toArray(".nav a, .hero-cta, .collection-back, .contact > a").forEach((element) => {
            const xTo = gsap.quickTo(element, "x", { duration: 0.35, ease: "power3.out" });
            const yTo = gsap.quickTo(element, "y", { duration: 0.35, ease: "power3.out" });
            const move = (event) => {
              const rect = element.getBoundingClientRect();
              xTo(((event.clientX - rect.left) / rect.width - 0.5) * 6);
              yTo(((event.clientY - rect.top) / rect.height - 0.5) * 6);
            };
            const leave = () => { xTo(0); yTo(0); };
            element.addEventListener("pointermove", move, { passive: true });
            element.addEventListener("pointerleave", leave);
            cleanups.push(() => {
              element.removeEventListener("pointermove", move);
              element.removeEventListener("pointerleave", leave);
            });
          });

          gsap.utils.toArray(".collection-card, .group-photo, .work-item").forEach((card) => {
            const image = card.querySelector("img");
            if (!image) return;
            const xTo = gsap.quickTo(image, "x", { duration: 0.55, ease: "power3.out" });
            const yTo = gsap.quickTo(image, "y", { duration: 0.55, ease: "power3.out" });
            const scaleTo = gsap.quickTo(image, "scale", { duration: 0.55, ease: "power3.out" });
            const move = (event) => {
              const rect = card.getBoundingClientRect();
              xTo(((event.clientX - rect.left) / rect.width - 0.5) * 8);
              yTo(((event.clientY - rect.top) / rect.height - 0.5) * 8);
            };
            const enter = () => scaleTo(card.matches(".group-photo") ? 1.008 : 1.014);
            const leave = () => { xTo(0); yTo(0); scaleTo(1); };
            card.addEventListener("pointermove", move, { passive: true });
            card.addEventListener("pointerenter", enter);
            card.addEventListener("pointerleave", leave);
            cleanups.push(() => {
              card.removeEventListener("pointermove", move);
              card.removeEventListener("pointerenter", enter);
              card.removeEventListener("pointerleave", leave);
            });
          });

          gsap.utils
            .toArray(
              ".nav, .filters, .collection-card, .group-photo, .about, .hero-cta, .contact > a, .lightbox-arrow",
            )
            .forEach((element) => {
              element.classList.add("proximity-border");
              let frame = 0;
              let mouseX = 0;
              let mouseY = 0;
              const paint = () => {
                frame = 0;
                element.style.setProperty("--mouse-x", `${mouseX}px`);
                element.style.setProperty("--mouse-y", `${mouseY}px`);
              };
              const move = (event) => {
                const rect = element.getBoundingClientRect();
                mouseX = event.clientX - rect.left;
                mouseY = event.clientY - rect.top;
                if (!frame) frame = requestAnimationFrame(paint);
              };
              const enter = () => element.classList.add("is-proximity-active");
              const leave = () => element.classList.remove("is-proximity-active");
              element.addEventListener("pointermove", move, { passive: true });
              element.addEventListener("pointerenter", enter);
              element.addEventListener("pointerleave", leave);
              cleanups.push(() => {
                if (frame) cancelAnimationFrame(frame);
                element.classList.remove("proximity-border", "is-proximity-active");
                element.style.removeProperty("--mouse-x");
                element.style.removeProperty("--mouse-y");
                element.removeEventListener("pointermove", move);
                element.removeEventListener("pointerenter", enter);
                element.removeEventListener("pointerleave", leave);
              });
            });

          return () => {
            document.body.classList.remove("has-art-cursor");
            window.removeEventListener("pointermove", onPointerMove);
            document.documentElement.removeEventListener("mouseleave", onPointerLeave);
            cleanups.forEach((cleanup) => cleanup());
          };
        },
      );
      return () => mm.revert();
    },
    {
      scope: page,
      dependencies: [editing, filter, activeGroup, Boolean(active)],
      revertOnUpdate: true,
    },
  );
  return (
    <>
      <main ref={page} className={editing ? "editing" : ""}>
        <div ref={spotlight} className="cursor-spotlight" aria-hidden="true" />
        <div ref={cursor} className="art-cursor" aria-hidden="true">
          <span>VIEW</span>
        </div>
        <header className="nav">
          <a className="brand" href="#home">
            巧克力摄影个人网站
          </a>
          <nav>
            <a href="#home">首页</a>
            <a href="#works">作品</a>
            <a href="#about">关于我</a>
            <a href="#contact">联系</a>
          </nav>
        </header>
        <section className="hero" id="home">
          <div className="hero-copy">
            <p className="hero-badge">巧克力摄影 · PHOTO STORIES</p>
            <h1>
              {copy.heroTitle.split("\n").map((line, i) => (
                <span className="hero-title-line" key={i}>
                  {line}
                </span>
              ))}
            </h1>
            <span className="hero-meta">{copy.heroMeta}</span>
            <div className="hero-actions">
              <a className="hero-cta" href="#works">
                浏览作品 <span aria-hidden="true">↗</span>
              </a>
              <span className="hero-kicker">{copy.heroKicker}</span>
            </div>
          </div>
          <figure className="cover-image">
            <picture>
              <source
                media="(max-width: 700px)"
                srcSet={imagePath("hero-dali-mobile.jpg")}
              />
              <img
                className="hero-scene"
                src={imagePath("hero-dali.jpg")}
                alt="云隙光照亮苍山与洱海边的城市"
                fetchPriority="high"
              />
            </picture>
          </figure>
        </section>
        <section className="works-section" id="works">
          <div className="section-heading reveal">
            <h2>
              {activeCollection ? `${activeCollection.category}作品` : "作品"}
            </h2>
            <p>
              {activeCollection
                ? `${activeCollection.count} 张照片`
                : copy.worksNote}
            </p>
          </div>
          {activeCollection ? (
            <button
              className="collection-back"
              onClick={() => {
                setActiveGroup(null);
                setActiveCategory(null);
              }}
            >
              ← 返回{activeCollection.category}作品集
            </button>
          ) : (
            <div className="filters reveal">
              <button
                className={filter === "全部" ? "active" : ""}
                onClick={() => selectFilter("全部")}
              >
                全部
              </button>
              {categories.map((c) => (
                <button
                  key={c}
                  className={filter === c ? "active" : ""}
                  onClick={() => selectFilter(c)}
                >
                  {c}
                </button>
              ))}
            </div>
          )}
          {activeCollection ? (
            <div className="group-gallery">
              {activeCollection.works.map((work, index) => (
                <button
                  className="group-photo"
                  key={work.id}
                  onClick={() => openWork(work, activeCollection.works)}
                >
                  <img
                    src={work.src}
                    alt={work.alt}
                    loading={index < 4 ? "eager" : "lazy"}
                    fetchPriority={index === 0 ? "high" : "auto"}
                    decoding="async"
                  />
                </button>
              ))}
            </div>
          ) : (
            <>
              {(filter === "全部" || filter === "婚礼") && (
                <div className="wedding-groups">
                  {weddingCollections.map((collection, index) => (
                    <button
                      className={`collection-card wedding-collection-${collection.group} reveal`}
                      key={collection.group}
                      onClick={() => {
                        setActiveGroup(collection.group);
                        setActiveCategory("婚礼");
                      }}
                    >
                      <img
                        src={collection.cover}
                        alt={`婚礼第 ${collection.group} 组封面`}
                        loading={index < 4 ? "eager" : "lazy"}
                        fetchPriority={index === 0 ? "high" : "auto"}
                        decoding="async"
                      />
                      <small className="collection-count">
                        {collection.count} 张
                      </small>
                    </button>
                  ))}
                </div>
              )}
              {(filter === "全部" || filter === "人像写真") && (
                <div
                  className={`wedding-groups portrait-groups ${
                    filter === "全部" ? "after-collection" : ""
                  }`}
                >
                  {portraitCollections.map((collection, index) => (
                    <button
                      className="collection-card reveal"
                      key={collection.group}
                      onClick={() => {
                        setActiveGroup(collection.group);
                        setActiveCategory("人像写真");
                      }}
                    >
                      <img
                        src={collection.cover}
                        alt={`人像写真第 ${collection.group} 组封面`}
                        loading={
                          filter === "人像写真" && index < 4 ? "eager" : "lazy"
                        }
                        fetchPriority={
                          filter === "人像写真" && index === 0 ? "high" : "auto"
                        }
                        decoding="async"
                      />
                      <small className="collection-count">
                        {collection.count} 张
                      </small>
                    </button>
                  ))}
                </div>
              )}
              {ungroupedWorks.length > 0 && (
                <div className="gallery secondary-gallery">
                  {ungroupedWorks.map((work) => (
                    <button
                      className={`work-item reveal ${work.size}`}
                      key={work.id}
                      onClick={() => openWork(work, ungroupedWorks)}
                    >
                      <img
                        src={work.src}
                        alt={work.alt}
                        loading="lazy"
                        decoding="async"
                      />
                      <span>{work.category}</span>
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </section>
        <section className="about reveal" id="about">
          <h2>{copy.aboutTitle}</h2>
          <div>
            <p>{copy.aboutOne}</p>
            <p>{copy.aboutTwo}</p>
          </div>
        </section>
        <section className="contact reveal" id="contact">
          <p>{copy.contactKicker}</p>
          <h2>{copy.contactTitle}</h2>
          <a href="weixin://">微信号：{copy.wechat}</a>
          <p className="contact-meta">{copy.location}</p>
        </section>
        <footer>
          <span>巧克力摄影个人网站</span>
          <span>© 2026</span>
        </footer>
        <Lightbox
          work={active}
          sequence={activeSequence}
          onChange={setActive}
          onClose={() => setActive(null)}
        />
      </main>
      {editing && (
        <Editor
          works={works}
          setWorks={setWorks}
          copy={copy}
          setCopy={setCopy}
          onExit={() => setEditing(false)}
        />
      )}{" "}
      {!editing && (
        <a className="edit-entry" href="?edit=1" aria-label="打开编辑器">
          编辑
        </a>
      )}
    </>
  );
}
createRoot(document.getElementById("root")).render(<App />);
