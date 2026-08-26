import React, { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import "./styles.css";
gsap.registerPlugin(ScrollTrigger, useGSAP);

const imagePath = (filename) => `${import.meta.env.BASE_URL}images/${filename}`;
const categories = ["婚礼", "人像写真", "活动纪实", "视频", "其他"];
const initialWorks = [
  {
    id: "w1",
    category: "婚礼",
    src: imagePath("wedding-01.jpg"),
    full: imagePath("wedding-01-large.jpg"),
    alt: "婚礼作品一",
    size: "normal",
  },
  {
    id: "w2",
    category: "婚礼",
    src: imagePath("wedding-02.jpg"),
    full: imagePath("wedding-02-large.jpg"),
    alt: "婚礼作品二",
    size: "small",
  },
  {
    id: "p1",
    category: "人像写真",
    src: imagePath("portrait-01.jpg"),
    full: imagePath("portrait-01-large.jpg"),
    alt: "人像写真作品一",
    size: "normal",
  },
  {
    id: "p2",
    category: "人像写真",
    src: imagePath("portrait-02.jpg"),
    full: imagePath("portrait-02-large.jpg"),
    alt: "人像写真作品二",
    size: "wide",
  },
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
      JSON.parse(localStorage.getItem("qiaokeli-portfolio")) || initialWorks
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

function Lightbox({ work, onClose }) {
  const close = useRef(null);
  useEffect(() => {
    if (!work) return;
    const old = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    close.current?.focus();
    const key = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", key);
    return () => {
      document.body.style.overflow = old;
      window.removeEventListener("keydown", key);
    };
  }, [work, onClose]);
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
      <img src={work.full || work.src} alt={work.alt} />
      <p>{work.category}</p>
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
    const clean = works.map(({ id, category, alt, size, src, full }) => ({
      id,
      category,
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
    [filter, setFilter] = useState("全部"),
    [active, setActive] = useState(null),
    [works, setWorks] = useState(saved),
    [copy, setCopy] = useState(savedCopy),
    [editing, setEditing] = useState(
      () => new URLSearchParams(location.search).get("edit") === "1",
    );
  const visible =
    filter === "全部" ? works : works.filter((w) => w.category === filter);
  useEffect(() => {
    try {
      localStorage.setItem("qiaokeli-portfolio", JSON.stringify(works));
    } catch {
      console.warn("本地图片过多，请减少上传数量");
    }
  }, [works]);
  useEffect(
    () => localStorage.setItem("qiaokeli-copy", JSON.stringify(copy)),
    [copy],
  );
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
        gsap.from(".cover-image img", {
          scale: 1.06,
          duration: 1.8,
          ease: "power2.out",
        });
        gsap.utils
          .toArray(".reveal")
          .forEach((item) =>
            gsap.from(item, {
              autoAlpha: 0,
              y: 44,
              duration: 1,
              ease: "power3.out",
              scrollTrigger: { trigger: item, start: "top 84%", once: true },
            }),
          );
      });
      return () => mm.revert();
    },
    { scope: page },
  );
  return (
    <>
      <main ref={page} className={editing ? "editing" : ""}>
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
            <p>{copy.heroKicker}</p>
            <h1>
              {copy.heroTitle.split("\n").map((line, i) => (
                <React.Fragment key={i}>
                  {line}
                  {i === 0 && <br />}
                </React.Fragment>
              ))}
            </h1>
            <span>{copy.heroMeta}</span>
          </div>
          <figure className="cover-image">
            <img
              src={imagePath("hero-cover.jpg")}
              alt="巧克力摄影作品集封面"
              fetchPriority="high"
            />
          </figure>
        </section>
        <section className="works-section" id="works">
          <div className="section-heading reveal">
            <h2>作品</h2>
            <p>{copy.worksNote}</p>
          </div>
          <div className="filters reveal">
            <button
              className={filter === "全部" ? "active" : ""}
              onClick={() => setFilter("全部")}
            >
              全部
            </button>
            {categories.map((c) => (
              <button
                key={c}
                className={filter === c ? "active" : ""}
                onClick={() => setFilter(c)}
              >
                {c}
              </button>
            ))}
          </div>
          <div className="gallery">
            {visible.map((w) => (
              <button
                className={`work-item reveal ${w.size}`}
                key={w.id}
                onClick={() => setActive(w)}
              >
                <img src={w.src} alt={w.alt} loading="lazy" decoding="async" />
                <span>{w.category}</span>
              </button>
            ))}
          </div>
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
        <Lightbox work={active} onClose={() => setActive(null)} />
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
