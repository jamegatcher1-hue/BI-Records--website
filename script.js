/*
  B.I Records beat store
  1) Replace PAYSTACK_PUBLIC_KEY with your Paystack public key.
  2) Add real MP3 previews under /audio/ and update the audioSrc values below.
  3) For production, initialize/verify transactions on your backend and only
     deliver purchased files after Paystack verification.
*/
const PAYSTACK_PUBLIC_KEY = "pk_test_REPLACE_WITH_YOUR_PUBLIC_KEY";

const beats = [
  {id:1,title:"Accra After Dark",genre:"Afrobeat",bpm:104,key:"C#m",price:150,tags:["Afrobeat","Dark","808"],audioSrc:"audio/accra-after-dark.mp3"},
  {id:2,title:"Golden Coast",genre:"Afropop",bpm:108,key:"F#m",price:150,tags:["Afropop","Guitar","Vibe"],audioSrc:"audio/golden-coast.mp3"},
  {id:3,title:"Concrete Dreams",genre:"Drill",bpm:142,key:"D#m",price:200,tags:["Drill","Heavy","Dark"],audioSrc:"audio/concrete-dreams.mp3"},
  {id:4,title:"Black Star",genre:"Hip-Hop",bpm:92,key:"Am",price:150,tags:["Hip-Hop","Boom Bap","Soul"],audioSrc:"audio/black-star.mp3"},
  {id:5,title:"Midnight Love",genre:"R&B",bpm:86,key:"Gm",price:200,tags:["R&B","Smooth","Soul"],audioSrc:"audio/midnight-love.mp3"},
  {id:6,title:"Osu Nights",genre:"Afrobeat",bpm:112,key:"Bm",price:250,tags:["Afrobeat","Amapiano","Club"],audioSrc:"audio/osu-nights.mp3"}
];

let cart = JSON.parse(localStorage.getItem("biRecordsCart") || "[]");
const beatGrid = document.getElementById("beatGrid");
const cartCount = document.getElementById("cartCount");
const cartPanel = document.getElementById("cartPanel");
const overlay = document.getElementById("overlay");
const audio = document.getElementById("audioPlayer");
const nowTitle = document.getElementById("nowTitle");
const playerTime = document.getElementById("playerTime");

function money(n){ return `GH₵ ${Number(n).toFixed(2)}`; }

function renderBeats(){
  const q = document.getElementById("searchInput").value.toLowerCase().trim();
  const genre = document.getElementById("genreFilter").value;
  const filtered = beats.filter(b =>
    (genre === "all" || b.genre === genre) &&
    [b.title,b.genre,b.key,...b.tags].join(" ").toLowerCase().includes(q)
  );

  beatGrid.innerHTML = filtered.map(b => `
    <article class="beat-card">
      <div class="cover">
        <button class="play" onclick="previewBeat(${b.id})" aria-label="Preview ${b.title}">▶</button>
      </div>
      <div class="beat-meta">
        <h3>${b.title}</h3>
        <div class="tags">
          ${b.tags.map(t => `<span class="tag">${t}</span>`).join("")}
          <span class="tag">${b.bpm} BPM</span>
          <span class="tag">${b.key}</span>
        </div>
        <div class="beat-bottom">
          <span class="price">from ${money(b.price)}</span>
          <button class="add-btn" onclick="addToCart(${b.id})">Add to cart</button>
        </div>
      </div>
    </article>
  `).join("") || `<p style="color:#9ca6b2">No beats found. Try another search.</p>`;
}

window.previewBeat = function(id){
  const beat = beats.find(b => b.id === id);
  if(!beat) return;
  nowTitle.textContent = `${beat.title} • ${beat.genre}`;
  audio.src = beat.audioSrc;
  audio.play().catch(() => {
    nowTitle.textContent = `${beat.title} — add its MP3 to /audio/ to enable preview`;
  });
};

audio.addEventListener("timeupdate", () => {
  const m = Math.floor(audio.currentTime/60);
  const s = String(Math.floor(audio.currentTime%60)).padStart(2,"0");
  playerTime.textContent = `${m}:${s}`;
});

window.addToCart = function(id){
  const beat = beats.find(b => b.id === id);
  if(!beat) return;
  cart.push({id:beat.id,title:beat.title,license:"MP3 Lease",price:beat.price});
  saveCart(); openCart();
};

function saveCart(){
  localStorage.setItem("biRecordsCart", JSON.stringify(cart));
  renderCart();
}

function renderCart(){
  cartCount.textContent = cart.length;
  const items = document.getElementById("cartItems");
  if(!cart.length){
    items.innerHTML = `<p style="color:#9ca6b2;margin-top:30px">Your cart is empty. Add a beat to begin.</p>`;
  } else {
    items.innerHTML = cart.map((item,i) => `
      <div class="cart-item">
        <div><strong>${item.title}</strong><small>${item.license}</small></div>
        <div><strong>${money(item.price)}</strong><br><button class="remove" onclick="removeItem(${i})">Remove</button></div>
      </div>`).join("");
  }
  const total = cart.reduce((sum,i)=>sum+Number(i.price),0);
  document.getElementById("cartTotal").textContent = money(total);
}

window.removeItem = function(i){ cart.splice(i,1); saveCart(); };

function openCart(){ cartPanel.classList.add("open"); overlay.classList.add("open"); cartPanel.setAttribute("aria-hidden","false"); }
function closeCart(){ cartPanel.classList.remove("open"); overlay.classList.remove("open"); cartPanel.setAttribute("aria-hidden","true"); }
document.getElementById("cartButton").onclick = openCart;
document.getElementById("closeCart").onclick = closeCart;
overlay.onclick = closeCart;

document.getElementById("payButton").onclick = () => {
  if(!cart.length){ alert("Please add a beat to your cart first."); return; }
  const total = cart.reduce((sum,i)=>sum+Number(i.price),0);
  document.getElementById("checkoutSummary").textContent = `${cart.length} item(s) • Total ${money(total)}. Enter your email to continue.`;
  document.getElementById("checkoutModal").classList.add("open");
};
document.getElementById("closeModal").onclick = () => document.getElementById("checkoutModal").classList.remove("open");

document.querySelectorAll(".choose-license").forEach(btn => {
  btn.addEventListener("click", () => {
    const firstBeat = cart[0] || beats[0];
    cart = [{id:firstBeat.id,title:firstBeat.title,license:btn.dataset.license,price:Number(btn.dataset.price)}];
    saveCart();
    openCart();
  });
});

document.getElementById("startPayment").onclick = () => {
  const email = document.getElementById("customerEmail").value.trim();
  if(!email || !email.includes("@")) { alert("Please enter a valid email address."); return; }
  const total = cart.reduce((sum,i)=>sum+Number(i.price),0);
  if(PAYSTACK_PUBLIC_KEY.includes("REPLACE_WITH")) {
    alert("Add your Paystack public key to script.js first. The button is already wired to Paystack Popup V2.");
    return;
  }
  const popup = new PaystackPop();
  popup.newTransaction({
    key: PAYSTACK_PUBLIC_KEY,
    email,
    amount: Math.round(total * 100),
    currency: "GHS",
    metadata: {
      custom_fields: [
        {display_name:"Store", variable_name:"store", value:"B.I Records"},
        {display_name:"Items", variable_name:"items", value:cart.map(i=>`${i.title} - ${i.license}`).join(", ")}
      ]
    },
    onSuccess: (transaction) => {
      alert(`Payment successful. Reference: ${transaction.reference}`);
      // Production: verify transaction on your server before delivering files.
      cart = [];
      saveCart();
      document.getElementById("checkoutModal").classList.remove("open");
      closeCart();
    },
    onCancel: () => console.log("Payment cancelled"),
    onError: (error) => alert(`Payment error: ${error.message || "Please try again."}`)
  });
};

document.getElementById("searchInput").addEventListener("input", renderBeats);
document.getElementById("genreFilter").addEventListener("change", renderBeats);
document.getElementById("year").textContent = new Date().getFullYear();
renderBeats();
renderCart();
