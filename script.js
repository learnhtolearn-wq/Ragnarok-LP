const header = document.querySelector('[data-header]');
const navToggle = document.querySelector('.nav-toggle');
const siteNav = document.querySelector('#site-nav');

const isMobileViewport = () => window.matchMedia('(max-width: 850px)').matches;

const setMenuState = (open) => {
  if (!siteNav || !navToggle) return;
  const active = isMobileViewport() ? open : true;
  navToggle.setAttribute('aria-expanded', String(isMobileViewport() ? open : false));
  siteNav.classList.toggle('is-open', isMobileViewport() && open);
  siteNav.inert = !active;
  siteNav.setAttribute('aria-hidden', String(!active));
};

const setHeaderState = () => {
  header?.classList.toggle('scrolled', window.scrollY > 24);
};

setHeaderState();
window.addEventListener('scroll', setHeaderState, { passive: true });

setMenuState(false);

navToggle?.addEventListener('click', () => {
  const isOpen = navToggle.getAttribute('aria-expanded') === 'true';
  setMenuState(!isOpen);
});

siteNav?.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    setMenuState(false);
  });
});

const videoFacade = document.querySelector('[data-video-facade]');
const videoPlay = videoFacade?.querySelector('[data-video-play]');
if (videoFacade && videoPlay) {
  videoPlay.hidden = false;
  videoPlay.addEventListener('click', () => {
    if (videoFacade.querySelector('iframe')) return;
    const player = document.createElement('iframe');
    player.src = 'https://www.youtube-nocookie.com/embed/KVHa83JkUV0?autoplay=1&playsinline=1&rel=0';
    player.title = 'Ragnarok: The New World | First Global Full Gameplay Trailer Released';
    player.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
    player.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
    player.referrerPolicy = 'strict-origin-when-cross-origin';
    player.loading = 'eager';
    player.allowFullscreen = true;
    videoFacade.replaceChildren(player);
  });
}

const revealItems = document.querySelectorAll('[data-reveal]');
if ('IntersectionObserver' in window) {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.14 });
  revealItems.forEach((item) => revealObserver.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add('is-visible'));
}

document.documentElement.classList.add('js-enabled');

window.addEventListener('resize', () => {
  setMenuState(false);
});

document.querySelectorAll('details').forEach((detail) => {
  detail.addEventListener('toggle', () => {
    if (!detail.open) return;
    document.querySelectorAll('details[open]').forEach((other) => {
      if (other !== detail) other.removeAttribute('open');
    });
  });
});
