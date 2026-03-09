import { useState, useRef, useCallback, useEffect } from "react";

const TERRARIUM_THEMES = [
  { id: "forest", name: "🌲 深い森", bg: "radial-gradient(ellipse at 50% 110%, #1a4a1a 0%, #0d2e0d 40%, #071a07 100%)", ground: "radial-gradient(ellipse at 50% 100%, #2d5a1b 0%, #1a3a0a 50%, #0f2206 100%)", decorations: ["🌿","🍃","🌱","🍄","🪨","✨","🌾","🍀"], accent: "#4ade80" },
  { id: "fairy", name: "🧚 妖精の庭", bg: "radial-gradient(ellipse at 50% 110%, #2a1a4a 0%, #1a0d3a 40%, #0d0720 100%)", ground: "radial-gradient(ellipse at 50% 100%, #3b1f6e 0%, #1f0f45 50%, #0d0720 100%)", decorations: ["🌸","🌺","🍄","⭐","🌙","💜","🔮","🌷"], accent: "#c084fc" },
  { id: "beach", name: "🏖️ 砂浜の苔", bg: "radial-gradient(ellipse at 50% 110%, #1a3a4a 0%, #0d2a3a 40%, #071520 100%)", ground: "radial-gradient(ellipse at 50% 100%, #c8a96e 0%, #9a7a45 50%, #6b5020 100%)", decorations: ["🐚","🌊","⭐","🪸","🐠","🌿","💧","🦀"], accent: "#38bdf8" },
  { id: "autumn", name: "🍂 秋の苔", bg: "radial-gradient(ellipse at 50% 110%, #3a1a0a 0%, #2a0e05 40%, #1a0803 100%)", ground: "radial-gradient(ellipse at 50% 100%, #8b4513 0%, #6b3410 50%, #4a2208 100%)", decorations: ["🍂","🍁","🌰","🍄","🦔","🪶","🍃","🌾"], accent: "#fb923c" },
];

const MOSS_PATCHES = [
  { x: 10, y: 75, w: 25, h: 12, opacity: 0.9 }, { x: 30, y: 80, w: 20, h: 10, opacity: 0.7 },
  { x: 55, y: 77, w: 30, h: 13, opacity: 0.85 }, { x: 70, y: 82, w: 18, h: 9, opacity: 0.75 },
  { x: 5, y: 85, w: 15, h: 8, opacity: 0.6 }, { x: 80, y: 79, w: 16, h: 10, opacity: 0.8 },
];

const PRESET_DECOS = [
  { id: 1, emoji: "🌿", x: 15, y: 65, scale: 1.2 }, { id: 2, emoji: "🍄", x: 70, y: 68, scale: 1.0 },
  { id: 3, emoji: "🪨", x: 45, y: 72, scale: 1.4 }, { id: 4, emoji: "🌱", x: 82, y: 60, scale: 1.0 },
  { id: 5, emoji: "✨", x: 25, y: 40, scale: 0.9 },
];

let nextId = 100;

export default function App() {
  const [theme, setTheme] = useState(TERRARIUM_THEMES[0]);
  const [avatarSrc, setAvatarSrc] = useState(null);
  const [avatarName, setAvatarName] = useState("あなた");
  const [avatarPos, setAvatarPos] = useState({ x: 48, y: 68 });
  const [avatarScale, setAvatarScale] = useState(1.0);
  const [decorations, setDecorations] = useState(PRESET_DECOS);
  const [dragging, setDragging] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [showPanel, setShowPanel] = useState("theme");
  const [sparkles, setSparkles] = useState([]);
  const fileRef = useRef();
  const terrRef = useRef();

  const addSparkle = (x, y) => {
    const id = Date.now();
    setSparkles(s => [...s, { id, x, y }]);
    setTimeout(() => setSparkles(s => s.filter(sp => sp.id !== id)), 800);
  };

  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setAvatarSrc(ev.target.result);
    reader.readAsDataURL(file);
  };

  const getRelPos = (clientX, clientY) => {
    const rect = terrRef.current.getBoundingClientRect();
    return { x: ((clientX - rect.left) / rect.width) * 100, y: ((clientY - rect.top) / rect.height) * 100 };
  };

  const startDrag = (e, type, id = null) => {
    e.preventDefault();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const pos = getRelPos(clientX, clientY);
    if (type === "avatar") {
      setDragOffset({ x: pos.x - avatarPos.x, y: pos.y - avatarPos.y });
    } else {
      const deco = decorations.find(d => d.id === id);
      if (deco) setDragOffset({ x: pos.x - deco.x, y: pos.y - deco.y });
    }
    setDragging({ type, id });
  };

  const onMove = useCallback((e) => {
    if (!dragging || !terrRef.current) return;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const pos = getRelPos(clientX, clientY);
    if (dragging.type === "avatar") {
      setAvatarPos({ x: Math.max(5, Math.min(95, pos.x - dragOffset.x)), y: Math.max(10, Math.min(90, pos.y - dragOffset.y)) });
    } else {
      setDecorations(ds => ds.map(d => d.id === dragging.id ? { ...d, x: Math.max(2, Math.min(96, pos.x - dragOffset.x)), y: Math.max(5, Math.min(92, pos.y - dragOffset.y)) } : d));
    }
  }, [dragging, dragOffset]);

  const endDrag = useCallback((e) => {
    if (dragging && terrRef.current) {
      const clientX = e.changedTouches ? e.changedTouches[0].clientX : e.clientX;
      const clientY = e.changedTouches ? e.changedTouches[0].clientY : e.clientY;
      const rect = terrRef.current.getBoundingClientRect();
      addSparkle(clientX - rect.left, clientY - rect.top);
    }
    setDragging(null);
  }, [dragging]);

  useEffect(() => {
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", endDrag);
    window.addEventListener("touchmove", onMove, { passive: false });
    window.addEventListener("touchend", endDrag);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", endDrag);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", endDrag);
    };
  }, [onMove, endDrag]);

  const addDeco = (emoji) => {
    setDecorations(ds => [...ds, { id: nextId++, emoji, x: 30 + Math.random() * 40, y: 50 + Math.random() * 30, scale: 0.8 + Math.random() * 0.6 }]);
  };

  const removeDeco = (id) => setDecorations(ds => ds.filter(d => d.id !== id));

  return (
    <div style={{ minHeight: "100vh", background: "#0a0f0a", display: "flex", flexDirection: "column", alignItems: "center", fontFamily: "'Hiragino Kaku Gothic ProN', 'Noto Sans JP', sans-serif", padding: "16px", gap: "16px" }}>
      <div style={{ textAlign: "center" }}>
        <h1 style={{ margin: 0, fontSize: "clamp(18px,4vw,30px)", fontWeight: 900, background: "linear-gradient(135deg, #4ade80, #86efac, #bbf7d0)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", filter: "drop-shadow(0 0 20px rgba(74,222,128,0.5))" }}>🌿 なんちゃって My 苔テラリウム 🌿</h1>
        <p style={{ color: "#6b7280", margin: "4px 0 0", fontSize: "12px" }}>ドラッグ＆ドロップで自分だけのテラリウムを作ろう！</p>
      </div>
      <div style={{ display: "flex", gap: "16px", width: "100%", maxWidth: "960px", flexWrap: "wrap", justifyContent: "center" }}>
        <div style={{ position: "relative", flex: "1 1 300px", maxWidth: "520px" }}>
          <div style={{ position: "relative", borderRadius: "48% 48% 30% 30% / 20% 20% 10% 10%", overflow: "hidden", aspectRatio: "3/4", background: theme.bg, border: "2px solid rgba(200,255,200,0.15)", boxShadow: "0 0 60px rgba(74,222,128,0.1), inset 0 0 80px rgba(0,0,0,0.5), 0 20px 60px rgba(0,0,0,0.8)", cursor: dragging ? "grabbing" : "default", userSelect: "none" }} ref={terrRef}>
            <div style={{ position: "absolute", inset: 0, zIndex: 10, background: "linear-gradient(135deg, rgba(255,255,255,0.06) 0%, transparent 40%)", pointerEvents: "none" }} />
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "30%", background: theme.ground, borderRadius: "0 0 30% 30% / 0 0 10% 10%" }} />
            {MOSS_PATCHES.map((m, i) => (
              <div key={i} style={{ position: "absolute", left: `${m.x}%`, top: `${m.y}%`, width: `${m.w}%`, height: `${m.h}%`, background: `radial-gradient(ellipse, rgba(74,222,128,${m.opacity * 0.6}) 0%, rgba(34,197,94,${m.opacity * 0.3}) 50%, transparent 100%)`, borderRadius: "50%", filter: "blur(2px)" }} />
            ))}
            {decorations.map(deco => (
              <div key={deco.id} onMouseDown={(e) => startDrag(e, "deco", deco.id)} onTouchStart={(e) => startDrag(e, "deco", deco.id)} onDoubleClick={() => removeDeco(deco.id)} style={{ position: "absolute", left: `${deco.x}%`, top: `${deco.y}%`, transform: `translate(-50%, -50%) scale(${deco.scale})`, fontSize: "clamp(14px,2.5vw,26px)", cursor: "grab", zIndex: 5, filter: dragging?.id === deco.id ? "brightness(1.4) drop-shadow(0 0 8px rgba(255,255,100,0.9))" : "drop-shadow(0 2px 4px rgba(0,0,0,0.5))", userSelect: "none" }} title="ダブルクリックで削除">{deco.emoji}</div>
            ))}
            <div onMouseDown={(e) => startDrag(e, "avatar")} onTouchStart={(e) => startDrag(e, "avatar")} style={{ position: "absolute", left: `${avatarPos.x}%`, top: `${avatarPos.y}%`, transform: "translate(-50%, -50%)", zIndex: 8, cursor: "grab", userSelect: "none", display: "flex", flexDirection: "column", alignItems: "center", gap: "2px" }}>
              <div style={{ width: `clamp(${30 + avatarScale * 20}px, ${3 + avatarScale * 2.5}vw, ${60 + avatarScale * 40}px)`, height: `clamp(${30 + avatarScale * 20}px, ${3 + avatarScale * 2.5}vw, ${60 + avatarScale * 40}px)`, borderRadius: "50%", overflow: "hidden", border: `2px solid ${theme.accent}`, boxShadow: `0 0 12px ${theme.accent}88, 0 4px 12px rgba(0,0,0,0.6)`, background: avatarSrc ? "transparent" : "linear-gradient(135deg, #374151, #1f2937)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                {avatarSrc ? <img src={avatarSrc} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="avatar" /> : <span style={{ fontSize: "clamp(18px,3vw,32px)" }}>🧑</span>}
              </div>
              <div style={{ background: "rgba(0,0,0,0.7)", color: theme.accent, fontSize: "clamp(8px,1.1vw,11px)", padding: "1px 6px", borderRadius: "8px", whiteSpace: "nowrap", border: `1px solid ${theme.accent}44`, backdropFilter: "blur(4px)", fontWeight: 700 }}>{avatarName}</div>
            </div>
            {sparkles.map(sp => (
              <div key={sp.id} style={{ position: "absolute", left: sp.x, top: sp.y, pointerEvents: "none", zIndex: 20, fontSize: "20px", animation: "sparkleUp 0.8s forwards", transform: "translate(-50%, -50%)" }}>✨</div>
            ))}
            {!avatarSrc && <div style={{ position: "absolute", top: "8%", left: "50%", transform: "translateX(-50%)", color: "rgba(255,255,255,0.25)", fontSize: "11px", textAlign: "center", pointerEvents: "none", lineHeight: 1.8 }}>写真をアップして<br/>ドラッグして遊ぼう！</div>}
          </div>
          <div style={{ width: "28%", height: "18px", margin: "-6px auto 0", background: "linear-gradient(180deg, rgba(150,200,150,0.2), rgba(100,150,100,0.1))", borderRadius: "4px 4px 0 0", border: "2px solid rgba(200,255,200,0.1)", borderBottom: "none" }} />
        </div>
        <div style={{ flex: "1 1 200px", maxWidth: "280px", display: "flex", flexDirection: "column", gap: "10px" }}>
          <div style={{ display: "flex", gap: "4px", background: "rgba(255,255,255,0.05)", borderRadius: "12px", padding: "4px" }}>
            {[{ id: "theme", label: "🎨 テーマ" }, { id: "avatar", label: "👤 自分" }, { id: "deco", label: "🍄 飾り" }].map(tab => (
              <button key={tab.id} onClick={() => setShowPanel(tab.id)} style={{ flex: 1, padding: "6px 2px", borderRadius: "8px", border: "none", background: showPanel === tab.id ? theme.accent : "transparent", color: showPanel === tab.id ? "#000" : "#9ca3af", fontWeight: 700, fontSize: "11px", cursor: "pointer", transition: "all 0.2s" }}>{tab.label}</button>
            ))}
          </div>
          {showPanel === "theme" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <p style={{ color: "#9ca3af", fontSize: "12px", margin: 0 }}>テーマを選んでね</p>
              {TERRARIUM_THEMES.map(t => (
                <button key={t.id} onClick={() => setTheme(t)} style={{ padding: "10px 14px", borderRadius: "12px", border: `2px solid ${theme.id === t.id ? t.accent : "rgba(255,255,255,0.1)"}`, background: theme.id === t.id ? `${t.accent}22` : "rgba(255,255,255,0.05)", color: theme.id === t.id ? t.accent : "#9ca3af", fontWeight: 700, fontSize: "13px", cursor: "pointer", textAlign: "left", transition: "all 0.2s" }}>{t.name}</button>
              ))}
            </div>
          )}
          {showPanel === "avatar" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <p style={{ color: "#9ca3af", fontSize: "12px", margin: 0 }}>写真と名前を設定しよう</p>
              <div onClick={() => fileRef.current.click()} style={{ border: `2px dashed ${theme.accent}66`, borderRadius: "16px", padding: "20px", textAlign: "center", cursor: "pointer", background: `${theme.accent}11` }}>
                {avatarSrc ? <img src={avatarSrc} style={{ width: 56, height: 56, borderRadius: "50%", objectFit: "cover", border: `2px solid ${theme.accent}` }} alt="preview" /> : <div style={{ fontSize: "30px" }}>📷</div>}
                <p style={{ color: theme.accent, fontSize: "12px", margin: "6px 0 0", fontWeight: 700 }}>{avatarSrc ? "タップで変更" : "写真をアップ"}</p>
                <input ref={fileRef} type="file" accept="image/*" onChange={handleUpload} style={{ display: "none" }} />
              </div>
              <div>
                <label style={{ color: "#9ca3af", fontSize: "12px", display: "block", marginBottom: "6px" }}>表示名</label>
                <input value={avatarName} onChange={e => setAvatarName(e.target.value)} maxLength={10} style={{ width: "100%", padding: "8px 12px", borderRadius: "10px", border: `1px solid ${theme.accent}44`, background: "rgba(255,255,255,0.07)", color: "#fff", fontSize: "14px", outline: "none", boxSizing: "border-box" }} />
              </div>
              <div>
                <label style={{ color: "#9ca3af", fontSize: "12px", display: "block", marginBottom: "6px" }}>サイズ: {Math.round(avatarScale * 100)}%</label>
                <input type="range" min="0.4" max="2.0" step="0.1" value={avatarScale} onChange={e => setAvatarScale(parseFloat(e.target.value))} style={{ width: "100%", accentColor: theme.accent }} />
              </div>
            </div>
          )}
          {showPanel === "deco" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <p style={{ color: "#9ca3af", fontSize: "12px", margin: 0 }}>クリックで追加・ダブルクリックで削除</p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "8px" }}>
                {theme.decorations.map((emoji, i) => (
                  <button key={i} onClick={() => addDeco(emoji)} style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", padding: "8px 0", fontSize: "20px", cursor: "pointer", color: "white" }}>{emoji}</button>
                ))}
              </div>
              <p style={{ color: "#6b7280", fontSize: "11px", margin: 0, textAlign: "center" }}>現在 {decorations.length} 個配置中</p>
              <button onClick={() => setDecorations([])} style={{ padding: "8px", borderRadius: "10px", border: "1px solid rgba(239,68,68,0.3)", background: "rgba(239,68,68,0.1)", color: "#ef4444", fontSize: "12px", cursor: "pointer", fontWeight: 700 }}>🗑️ 全部リセット</button>
            </div>
          )}
          <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: "12px", padding: "12px", border: "1px solid rgba(255,255,255,0.08)" }}>
            <p style={{ color: "#6b7280", fontSize: "11px", margin: 0, lineHeight: 1.8 }}>💡 <b style={{ color: "#9ca3af" }}>使い方</b><br/>🎨 テーマを選ぶ<br/>📷 写真をアップ<br/>🍄 飾りを追加<br/>👆 ドラッグで配置！</p>
          </div>
        </div>
      </div>
      <style>{`@keyframes sparkleUp { 0% { opacity:1; transform:translate(-50%,-50%) scale(1); } 100% { opacity:0; transform:translate(-50%,-120%) scale(1.5); } }`}</style>
    </div>
  );
}
