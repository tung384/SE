/* ==========================================================================
   1. KHAI BÁO HÌNH ẢNH & DANH SÁCH SẢN PHẨM (DATABASE)
   ========================================================================== */
const IMG = (() => {
  const IMG_BASE = "./IMG/";
  const F = {
    "case": "case.png",
    "cooler": "cooler.png",
    "cpu": "cpu.png",
    "keyboard": "keyboard.png",
    "mainboard": "mainboard.png",
    "monitor": "monitor.png",
    "psu": "psu.png",
    "ram": "ram.png",
    "ssd": "ssd.png",
    "vga": "vga.png",
    "logo": "apple-icon.png"
  };
  return Object.fromEntries(Object.entries(F).map(([k, v]) => [k, IMG_BASE + v]));
})();

const P = [
  { id: 1, cat: "CPU", b: "Intel", n: "Intel Core i9-13900K 3.0GHz", p: 13990000, o: 15490000, i: "cpu", s: ["24 nhân (8P + 16E), 32 luồng", "Xung tối đa 5.8GHz", "Socket LGA1700", "Không kèm tản nhiệt"] },
  { id: 2, cat: "Mainboard", b: "ASUS", n: "ASUS ROG Strix Z790-F Gaming WiFi", p: 10490000, i: "mainboard", s: ["Chipset Z790, DDR5", "Wi-Fi 6E, Bluetooth 5.3", "PCIe 5.0 x16, 4 khe M.2", "Hỗ trợ Intel Gen 12/13"] },
  { id: 3, cat: "RAM", b: "Corsair", n: "Corsair Vengeance DDR5 32GB (2x16GB) 6000MHz CL30", p: 3290000, o: 3690000, i: "ram", s: ["Dung lượng 32GB (2x16GB)", "Bus 6000MHz, CL30", "LED RGB", "Hỗ trợ Intel XMP 3.0"] },
  { id: 4, cat: "VGA", b: "MSI", n: "MSI GeForce RTX 4080 Gaming X Trio 16GB", p: 28900000, o: 30900000, i: "vga", s: ["16GB GDDR6X", "Tản nhiệt 3 quạt TORX", "Cổng 3x DisplayPort, 1x HDMI", "Nguồn đề xuất 750W"] },
  { id: 5, cat: "SSD", b: "Kingston", n: "Kingston KC3000 2TB PCIe 4.0 NVMe M.2", p: 3990000, i: "ssd", s: ["Dung lượng 2TB", "Đọc tối đa 7000MB/s", "Chuẩn M.2 2280 PCIe 4.0 x4", "Bảo hành 5 năm"] },
  { id: 6, cat: "Nguồn", b: "EVGA", n: "EVGA SuperNOVA 850 G6 850W 80 Plus Gold", p: 3490000, i: "psu", s: ["Công suất 850W", "Chứng nhận 80 Plus Gold", "Full modular", "Quạt 130mm, chế độ ECO"] },
  { id: 7, cat: "Vỏ case", b: "AeroFlow", n: "AeroFlow Mid Tower kính cường lực 3 quạt RGB", p: 2190000, i: "case", s: ["Mid Tower, hỗ trợ ATX", "Hông kính cường lực", "Mặt trước lưới, sẵn 3 quạt RGB", "Cổng USB 3.0 và Type-C phía trước"] },
  { id: 8, cat: "Tản nhiệt", b: "AeroFlow", n: "AeroFlow tản nhiệt khí 6 ống đồng", p: 890000, o: 1090000, i: "cooler", s: ["6 ống đồng tiếp xúc trực tiếp", "Quạt 120mm", "Hỗ trợ LGA1700, AM4, AM5", "Cáp bọc dù"] },
  { id: 9, cat: "Màn hình", b: "Display", n: "Màn hình 27 inch viền mỏng, chân xoay chỉnh độ cao", p: 4590000, i: "monitor", s: ["Kích thước 27 inch", "Viền mỏng 3 cạnh", "Chân đế chỉnh cao, xoay dọc", "Cổng HDMI, DisplayPort"] },
  { id: 10, cat: "Phím & chuột", b: "Razer", n: "Combo phím cơ và chuột gaming Razer", p: 2390000, o: 2790000, i: "keyboard", s: ["Bàn phím cơ full-size, LED nền", "Chuột gaming có LED", "Kết nối USB", "Dây bọc dù"] }
];

const ST = ["Chờ xử lý", "Đang giao", "Giao thành công"];

/* ==========================================================================
   2. API MÔ PHỎNG LƯU ĐƠN HÀNG (LOCALSTORAGE)
   ========================================================================== */
const api = {
  load() { try { return JSON.parse(localStorage.getItem("v0orders") || "[]") } catch(e) { return [] } },
  save(o) { try { localStorage.setItem("v0orders", JSON.stringify(o)) } catch(e) {} },
  create(d) {
    const l = api.load(), o = { id: "DH" + Date.now().toString().slice(-6), ...d, status: 0, log: [Date.now()] };
    l.push(o); api.save(l); return o;
  },
  find(k) {
    k = k.trim().toLowerCase();
    return api.load().filter(x => x.id.toLowerCase() == k || x.phone == k).reverse();
  },
  next(id) {
    const l = api.load(), o = l.find(x => x.id == id);
    if (o && o.status < 2) { o.status++; o.log[o.status] = Date.now(); api.save(l); }
  },
  cancel(id) {
    const l = api.load(), o = l.find(x => x.id == id);
    if (o && o.status == 0) { o.status = 3; o.cancelAt = Date.now(); api.save(l); }
  }
};

/* ==========================================================================
   3. TIỆN ÍCH CHUNG & TRẠNG THÁI GIỎ HÀNG
   ========================================================================== */
const $ = s => document.querySelector(s);
const vnd = n => n.toLocaleString("vi-VN") + "₫";

$("#lg").src = IMG.logo;

let cat = "Tất cả", cart = {};
try { cart = JSON.parse(localStorage.getItem("v0cart") || "{}") } catch(e) {}

const save = () => { try { localStorage.setItem("v0cart", JSON.stringify(cart)) } catch(e) {} };
const cats = ["Tất cả", ...new Set(P.map(p => p.cat))];

/* ==========================================================================
   4. HIỂN THỊ DANH MỤC, SẮP XẾP VÀ DANH SÁCH SẢN PHẨM
   ========================================================================== */
function chips() {
  $("#cats").innerHTML = cats.map(c => `<button class="chip" aria-pressed="${c == cat}" data-c="${c}">${c}</button>`).join("") +
    `<select id="so" aria-label="Sắp xếp">
      <option value="">Sắp xếp: Mặc định</option>
      <option value="a">Giá tăng dần</option>
      <option value="d">Giá giảm dần</option>
    </select>`;
  
  $("#so").value = sort;
  $("#so").onchange = e => { sort = e.target.value; list(); };
  document.querySelectorAll(".chip").forEach(b => b.onclick = () => { cat = b.dataset.c; chips(); list(); });
}

let sort = "";

function list() {
  const k = $("#q").value.trim().toLowerCase();
  let a = P.filter(p => (cat == "Tất cả" || p.cat == cat) && (p.n + " " + p.b + " " + p.cat).toLowerCase().includes(k));
  
  if (sort) a.sort((x, y) => sort == "a" ? x.p - y.p : y.p - x.p);
  
  $("#g").innerHTML = a.length ? a.map(p => `
    <article class="card">
      <button class="im" data-v="${p.id}" aria-label="Xem ${p.n}">
        <img src="${IMG[p.i]}" alt="${p.n}" loading="lazy">
      </button>
      <div class="bd">
        <span class="brand">${p.b}</span>
        <button class="view" data-v="${p.id}">${p.n}</button>
        <div class="price">${vnd(p.p)}${p.o ? `<span class="old">${vnd(p.o)}</span>` : ""}</div>
        <button class="add" data-a="${p.id}">Thêm vào giỏ</button>
      </div>
    </article>
  `).join("") : `<div class="empty">Không tìm thấy sản phẩm phù hợp. Hãy thử từ khóa khác hoặc chọn danh mục “Tất cả”.</div>`;

  document.querySelectorAll("[data-v]").forEach(b => b.onclick = () => detail(+b.dataset.v));
  document.querySelectorAll("[data-a]").forEach(b => b.onclick = () => add(+b.dataset.a));
}

function toast(t) {
  const e = $("#ts");
  e.textContent = t;
  e.classList.add("on");
  clearTimeout(toast.t);
  toast.t = setTimeout(() => e.classList.remove("on"), 1600);
}

function add(id, n = 1) {
  cart[id] = (cart[id] || 0) + n;
  save();
  badge();
  toast("Đã thêm vào giỏ hàng");
}

function badge() {
  $("#cc").textContent = Object.values(cart).reduce((a, b) => a + b, 0);
}

/* ==========================================================================
   5. POPUP XEM CHI TIẾT SẢN PHẨM
   ========================================================================== */
function detail(id) {
  const p = P.find(x => x.id == id);
  const o = $("#ov");
  
  o.innerHTML = `
    <div class="modal" role="dialog" aria-modal="true">
      <img src="${IMG[p.i]}" alt="${p.n}">
      <div class="tx">
        <button class="x" id="xx">Đóng</button>
        <span class="brand">${p.cat} · ${p.b}</span>
        <h2 style="margin:0;font-size:20px">${p.n}</h2>
        <div class="price" style="padding:0">${vnd(p.p)}${p.o ? `<span class="old">${vnd(p.o)}</span>` : ""}</div>
        <ul>${p.s.map(s => `<li>${s}</li>`).join("")}</ul>
        <button class="add" id="ad">Thêm vào giỏ</button>
      </div>
    </div>
  `;
  
  o.classList.add("on");
  $("#xx").onclick = () => o.classList.remove("on");
  $("#ad").onclick = () => { add(id); o.classList.remove("on"); };
  $("#xx").focus();
}

$("#ov").onclick = e => { if (e.target.id == "ov") e.target.classList.remove("on"); };

/* ==========================================================================
   6. TRA CỨU & HIỂN THỊ TRẠNG THÁI ĐƠN HÀNG
   ========================================================================== */
const fd = t => new Date(t).toLocaleString("vi-VN");

function ordHTML(x) {
  const st = ST.map((s, i) => `
    <li class="${x.status != 3 && i <= x.status ? "on" : ""}">
      <span>${s}</span>
      <small>${x.log[i] ? fd(x.log[i]) : "Chưa tới bước này"}</small>
    </li>
  `).join("");

  return `
    <div class="ord">
      <div class="oh">
        <b>Mã đơn ${x.id}</b>
        <span class="tag s${x.status}">${x.status == 3 ? "Đã hủy" : ST[x.status]}</span>
      </div>
      <ol class="steps">${x.status == 3 ? `<li class="bad on"><span>Đã hủy</span><small>${fd(x.cancelAt)}</small></li>` : st}</ol>
      <small>Đặt lúc ${fd(x.log[0])} · ${x.name} · ${x.phone} · ${x.addr}</small>
      <ul>${x.items.map(i => `<li>${i.n} ×${i.q}</li>`).join("")}</ul>
      <div class="tot"><span>Tổng cộng</span><span>${vnd(x.total)}</span></div>
    </div>
  `;
}

let lastQ = "";

function track(q = "") {
  lastQ = q;
  const o = $("#ov"), r = q ? api.find(q) : [];
  
  o.innerHTML = `
    <div class="modal tk" role="dialog" aria-modal="true">
      <div style="display:flex;justify-content:space-between;align-items:center">
        <h2 style="margin:0;font-size:20px">Tra cứu đơn hàng</h2>
        <button class="x" id="xx">Đóng</button>
      </div>
      <form id="tf">
        <input id="tq" value="${q}" placeholder="Nhập mã đơn (DH123456) hoặc số điện thoại">
        <button>Tra cứu</button>
      </form>
      ${q ? (r.length ? r.map(ordHTML).join("") : `<p class="empty" style="padding:30px 0">Không tìm thấy đơn hàng nào với “${q}”. Kiểm tra lại mã đơn hoặc số điện thoại đã dùng khi đặt hàng.</p>`) : `<p class="empty" style="padding:30px 0">Nhập mã đơn hoặc số điện thoại để xem trạng thái đơn hàng.</p>`}
    </div>
  `;
  
  o.classList.add("on");
  $("#xx").onclick = () => o.classList.remove("on");
  $("#tf").onsubmit = e => { e.preventDefault(); track($("#tq").value.trim()); };
}

$("#tb").onclick = () => track();

/* ==========================================================================
   7. XỬ LÝ TÀI KHOẢN (ĐĂNG NHẬP / ĐĂNG KÝ)
   ========================================================================== */
const esc = s => String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");

const AU = {
  users() { try { return JSON.parse(localStorage.getItem("v0users") || "[]") } catch(e) { return [] } },
  saveU(u) { try { localStorage.setItem("v0users", JSON.stringify(u)) } catch(e) {} },
  cur() { try { const e = localStorage.getItem("v0session"); return AU.users().find(u => u.email == e) || null; } catch(e) { return null; } },
  setCur(e) { try { e ? localStorage.setItem("v0session", e) : localStorage.removeItem("v0session"); } catch(x) {} },
  hash(s) { let h = 5381; for (const c of s) h = ((h << 5) + h + c.charCodeAt(0)) | 0; return String(h); }
};

function hdr() {
  const u = AU.cur();
  $("#ub").textContent = u ? "Đăng xuất (" + u.name.split(" ").pop() + ")" : "Đăng nhập";
}

$("#ub").onclick = () => {
  if (AU.cur()) {
    AU.setCur(null);
    hdr();
    toast("Đã đăng xuất");
  } else {
    showAuth("login");
  }
};

function showShop() {
  $("#shop").hidden = false;
  $("#auth").hidden = true;
  scrollTo(0, 0);
}

function afterAuth() {
  hdr();
  showShop();
  if (Object.values(cart).some(q => q > 0)) {
    drawer();
    $("#dr").classList.add("on");
  } else {
    toast("Đăng nhập thành công");
  }
}

function needLogin() {
  const o = $("#ov");
  o.innerHTML = `
    <div class="modal tk" style="max-width:440px" role="dialog" aria-modal="true">
      <h2 style="margin:0 0 6px;font-size:20px">Bạn cần đăng nhập để đặt hàng</h2>
      <p class="mut">Hãy đăng nhập, hoặc đăng ký nếu chưa có tài khoản. Các sản phẩm trong giỏ hàng vẫn được giữ nguyên.</p>
      <div style="display:flex;gap:8px;margin-top:14px">
        <button class="add" id="n1" style="flex:1;margin:0">Đăng nhập</button>
        <button class="add" id="n2" style="flex:1;margin:0;background:var(--ink);color:var(--bg)">Đăng ký</button>
      </div>
    </div>
  `;
  o.classList.add("on");
  
  const go = m => { o.classList.remove("on"); $("#dr").classList.remove("on"); showAuth(m); };
  $("#n1").onclick = () => go("login");
  $("#n2").onclick = () => go("reg");
}

function showAuth(mode) {
  $("#ov").classList.remove("on");
  $("#dr").classList.remove("on");
  $("#shop").hidden = true;
  
  const a = $("#auth");
  a.hidden = false;
  scrollTo(0, 0);
  
  const reg = mode == "reg";
  const f = (id, l, ty, ac) => `<label class="fl">${l}<input id="${id}" type="${ty}" autocomplete="${ac}"></label>`;
  
  a.innerHTML = `
    <div class="acard">
      <h1>${reg ? "Đăng ký tài khoản" : "Đăng nhập"}</h1>
      <p class="mut">${reg ? "Tạo tài khoản để đặt hàng và theo dõi đơn hàng." : "Đăng nhập để tiếp tục đặt hàng."}</p>
      <form id="af" novalidate>
        ${reg ? f("rn","Họ và tên","text","name") + f("re","Email","email","email") + f("rp","Số điện thoại","tel","tel") + f("r1","Mật khẩu","password","new-password") + f("r2","Nhập lại mật khẩu","password","new-password") : f("le","Email hoặc số điện thoại","text","username") + f("l1","Mật khẩu","password","current-password")}
        <div class="err" id="er" role="alert"></div>
        <button class="add" style="width:100%;margin:0">${reg ? "Đăng ký" : "Đăng nhập"}</button>
      </form>
      <p class="mut">${reg ? "Đã có tài khoản?" : "Chưa có tài khoản?"} <button class="view" id="sw" style="color:var(--acc)">${reg ? "Đăng nhập" : "Đăng ký"}</button></p>
      <button class="chip" id="bk">Quay lại cửa hàng</button>
    </div>
  `;

  $("#sw").onclick = () => showAuth(reg ? "login" : "reg");
  $("#bk").onclick = showShop;
  
  $("#af").onsubmit = ev => {
    ev.preventDefault();
    const e = m => { $("#er").textContent = m; }, v = i => $("#" + i).value.trim();
    
    if (reg) {
      const n = v("rn"), em = v("re").toLowerCase(), ph = v("rp").replace(/\s/g, ""), p1 = $("#r1").value, p2 = $("#r2").value;
      if (!n || !em || !ph || !p1 || !p2) return e("Vui lòng nhập đủ tất cả các ô.");
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(em)) return e("Email chưa đúng định dạng, ví dụ: ten@gmail.com.");
      if (!/^(0|\+84)\d{9}$/.test(ph)) return e("Số điện thoại cần đủ 10 số và bắt đầu bằng 0 (hoặc +84).");
      if (p1.length < 6) return e("Mật khẩu cần có ít nhất 6 ký tự.");
      if (p1 !== p2) return e("Mật khẩu nhập lại chưa khớp.");
      
      const us = AU.users();
      if (us.some(u => u.email == em || u.phone == ph)) return e("Email hoặc số điện thoại này đã được đăng ký. Hãy đăng nhập.");
      
      us.push({ name: n, email: em, phone: ph, pw: AU.hash(p1) });
      AU.saveU(us);
      AU.setCur(em);
      afterAuth();
    } else {
      const id = v("le").toLowerCase().replace(/\s/g, ""), pw = $("#l1").value;
      if (!id || !pw) return e("Vui lòng nhập email/số điện thoại và mật khẩu.");
      
      const u = AU.users().find(x => (x.email == id || x.phone == id) && x.pw == AU.hash(pw));
      if (!u) return e("Thông tin đăng nhập chưa đúng. Kiểm tra lại hoặc đăng ký tài khoản mới.");
      
      AU.setCur(u.email);
      afterAuth();
    }
  };
}

/* ==========================================================================
   8. GIỎ HÀNG THƯỜNG TRỰC & THANH TOÁN
   ========================================================================== */
function drawer(msg, code) {
  const ids = Object.keys(cart).filter(k => cart[k] > 0);
  const t = ids.reduce((s, k) => s + P.find(p => p.id == k).p * cart[k], 0);

  $("#dr").innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center">
      <h2 style="margin:0;font-size:20px">Giỏ hàng</h2>
      <button class="x" id="dx">Đóng</button>
    </div>
  ` + (msg ? `
    <div class="items">
      <p style="color:var(--ok);font-weight:700">${msg}</p>
      ${code ? `<button class="add" id="gt">Xem trạng thái đơn hàng</button>` : ""}
    </div>
  ` : ids.length ? `
    <div class="items">
      ${ids.map(k => {
        const p = P.find(x => x.id == k);
        return `
          <div class="it">
            <img src="${IMG[p.i]}" alt="">
            <div>
              <div style="font-size:14px;font-weight:500">${p.n}</div>
              <small>${vnd(p.p)}</small>
              <div class="qty">
                <button data-m="${k}" aria-label="Giảm">−</button>${cart[k]}
                <button data-p="${k}" aria-label="Tăng">+</button>
              </div>
            </div>
            <button class="rm" data-r="${k}" aria-label="Xóa">×</button>
          </div>
        `;
      }).join("")}
    </div>
    <div class="tot"><span>Tổng cộng</span><span>${vnd(t)}</span></div>
    <div class="co">
      <input id="nm" placeholder="Họ và tên" value="${esc((AU.cur() || {}).name || "")}">
      <input id="ph" type="tel" placeholder="Số điện thoại" value="${esc((AU.cur() || {}).phone || "")}">
      <input id="ad2" placeholder="Địa chỉ nhận hàng">
      <button class="add" style="width:100%;margin-top:12px" id="ck">Đặt hàng</button>
    </div>
  ` : `
    <div class="items">
      <p class="empty">Giỏ hàng đang trống. Chọn linh kiện để bắt đầu build PC.</p>
    </div>
  `);

  $("#dx").onclick = () => $("#dr").classList.remove("on");
  
  document.querySelectorAll("[data-m]").forEach(b => b.onclick = () => { cart[b.dataset.m]--; if (cart[b.dataset.m] <= 0) delete cart[b.dataset.m]; save(); badge(); drawer(); });
  document.querySelectorAll("[data-p]").forEach(b => b.onclick = () => { cart[b.dataset.p]++; save(); badge(); drawer(); });
  document.querySelectorAll("[data-r]").forEach(b => b.onclick = () => { delete cart[b.dataset.r]; save(); badge(); drawer(); });

  const gt = $("#gt");
  if (gt) gt.onclick = () => { $("#dr").classList.remove("on"); track(code); };

  const ck = $("#ck");
  if (ck) {
    ck.onclick = () => {
      if (!AU.cur()) { needLogin(); return; }
      
      const nmEl = $("#nm");
      const phEl = $("#ph");
      const adEl = $("#ad2");

      if (!nmEl || !phEl || !adEl || !nmEl.value.trim() || !phEl.value.trim() || !adEl.value.trim()) {
        toast("Vui lòng nhập đủ họ tên, số điện thoại và địa chỉ");
        return;
      }

      const od = api.create({
        name: nmEl.value.trim(),
        phone: phEl.value.trim(),
        addr: adEl.value.trim(),
        total: t,
        items: ids.map(k => { const p = P.find(x => x.id == k); return { n: p.n, q: cart[k], p: p.p }; })
      });
      
      cart = {}; 
      save(); 
      badge();
      drawer("Đặt hàng thành công. Mã đơn của bạn: " + od.id + ". Chúng tôi sẽ gọi xác nhận trong ít phút.", od.id);
    };
  }
}

/* ==========================================================================
   9. KHỞI CHẠY ỨNG DỤNG (INITIALIZATION)
   ========================================================================== */
$("#cb").onclick = () => { drawer(); $("#dr").classList.add("on"); };
$("#q").oninput = list;

chips();
list();
badge();
hdr();