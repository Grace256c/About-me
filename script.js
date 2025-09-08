// THEME: initialize from saved preference (or system by CSS)
(function initTheme(){
	try{
		const saved = localStorage.getItem('theme'); // 'light' | 'dark' | null
		const root = document.documentElement;
		if(saved === 'light' || saved === 'dark'){
			root.setAttribute('data-theme', saved);
		}
	}catch(e){}
})();

// THEME: toggle handler with persistence and icon swap
(function setupThemeToggle(){
	const btn = document.querySelector('.theme-toggle');
	if(!btn) return;
	const icon = btn.querySelector('i');

	function currentTheme(){
		return document.documentElement.getAttribute('data-theme') || 'system';
	}
	function isLightNow(){
		const t = currentTheme();
		if(t === 'light') return true;
		if(t === 'dark') return false;
		return matchMedia('(prefers-color-scheme: light)').matches;
	}
	function applyIcon(){
		// show moon when light (tap to go dark), sun when dark (tap to go light)
		icon.className = isLightNow() ? 'fa-solid fa-moon' : 'fa-solid fa-sun';
	}

	btn.addEventListener('click', ()=>{
		const root = document.documentElement;
		const cur = currentTheme();
		let next;
		// Cycle: system -> light -> dark -> system
		if(cur === 'system'){ next = 'light'; }
		else if(cur === 'light'){ next = 'dark'; }
		else{ next = 'system'; }

		if(next === 'system'){
			root.removeAttribute('data-theme');
			localStorage.removeItem('theme');
		}else{
			root.setAttribute('data-theme', next);
			localStorage.setItem('theme', next);
		}
		applyIcon();
	});

	// Update icon on system change if using system mode
	matchMedia('(prefers-color-scheme: dark)').addEventListener('change', ()=>{
		if(!localStorage.getItem('theme')) applyIcon();
	});
	applyIcon();
})();

// Year
document.getElementById('year').textContent = new Date().getFullYear();

// Intersection reveal
const io = new IntersectionObserver((entries)=>{
	for(const e of entries){
		if(e.isIntersecting){ e.target.classList.add('show'); io.unobserve(e.target); }
	}
},{threshold:.15});
document.querySelectorAll('.reveal').forEach(el=>io.observe(el));

// Role typer animation
const roles = [
	"Software Developer",
	"Web Developer",
	"Creative Coder",
	"Graphic Designer",
	"Community Builder"
];
const el = document.getElementById('roleTyper');
let ri = 0, ci = 0, del = false;

function typeLoop(){
	const current = roles[ri];
	if(!del){
		ci++;
		el.textContent = current.slice(0,ci);
		if(ci === current.length){ del = true; setTimeout(typeLoop, 1200); return; }
	}else{
		ci--;
		el.textContent = current.slice(0,ci);
		if(ci === 0){ del = false; ri = (ri+1)%roles.length; }
	}
	const speed = del ? 35 : 65;
	setTimeout(typeLoop, speed);
}
typeLoop();

// Animate skill bars on view
const barIO = new IntersectionObserver((entries)=>{
	for(const e of entries){
		if(e.isIntersecting){
			const fills = e.target.querySelectorAll('.fill');
			fills.forEach(f=>{
				const pct = f.getAttribute('data-pct');
				f.style.transition = 'width 1s ease';
				requestAnimationFrame(()=> f.style.width = pct + '%');
			});
			barIO.unobserve(e.target);
		}
	}
},{threshold:.3});
document.querySelectorAll('#skills .card').forEach(c=>barIO.observe(c));

// Background stars and snow
const starCanvas = document.getElementById('bgStars');
const sctx = starCanvas.getContext('2d');
const snowCanvas = document.getElementById('bgSnow');
const nctx = snowCanvas.getContext('2d');
let stars = [], flakes = [];

function resizeCanvas(){
	starCanvas.width = innerWidth;
	starCanvas.height = innerHeight;
	snowCanvas.width = innerWidth;
	snowCanvas.height = innerHeight;
	makeStars();
	makeSnow();
}
addEventListener('resize', resizeCanvas);

function makeStars(){
	const count = Math.min(200, Math.floor(innerWidth*innerHeight/12000));
	stars = Array.from({length:count}).map(()=>({
		x: Math.random()*starCanvas.width,
		y: Math.random()*starCanvas.height,
		r: Math.random()*1.3 + 0.2,
		a: Math.random()*1,
		v: Math.random()*0.02 + 0.005
	}));
}
function drawStars(){
	sctx.clearRect(0,0,starCanvas.width,starCanvas.height);
	for(const s of stars){
		s.a += s.v;
		const twinkle = (Math.sin(s.a)+1)/2;
		sctx.beginPath();
		sctx.arc(s.x, s.y, s.r + twinkle*0.5, 0, Math.PI*2);
		sctx.fillStyle = `rgba(207,230,255,${0.3 + twinkle*0.7})`;
		sctx.fill();
	}
}

function makeSnow(){
	const count = Math.min(120, Math.floor(innerWidth/12));
	flakes = Array.from({length:count}).map(()=>({
		x: Math.random()*snowCanvas.width,
		y: Math.random()*snowCanvas.height,
		r: Math.random()*2 + 0.6,
		s: Math.random()*0.6 + 0.2,
		w: Math.random()*2 + 1.2,
		p: Math.random()*Math.PI*2
	}));
}
function drawSnow(){
	nctx.clearRect(0,0,snowCanvas.width,snowCanvas.height);
	nctx.fillStyle = 'rgba(255,255,255,.75)';
	for(const f of flakes){
		f.p += 0.01;
		f.y += f.s;
		f.x += Math.sin(f.p)*0.3;
		if(f.y > snowCanvas.height){ f.y = -10; f.x = Math.random()*snowCanvas.width; }
		nctx.beginPath();
		nctx.arc(f.x, f.y, f.r, 0, Math.PI*2);
		nctx.fill();
	}
}

function loop(){
	drawStars();
	drawSnow();
	requestAnimationFrame(loop);
}

// Init
resizeCanvas();
loop();
