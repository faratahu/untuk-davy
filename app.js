(() => {
  const openButton = document.querySelector('#buka');
  const seal = document.querySelector('#seal');
  const closeButton = document.querySelector('#tutup');
  const envelope = document.querySelector('#envelope');
  const letter = document.querySelector('#surat');
  const music = document.querySelector('#music');
  const slot = document.querySelector('#player-slot');
  const hint = document.querySelector('#envelope-hint');
  const status = document.querySelector('#music-status');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const songUrl = 'https://www.youtube.com/watch?v=uh0SpzMsZAs';
  let opened = false;
  let revealTimer;
  let youtubePlayer;
  let currentFrame;

  function connectPlayer() {
    if (!opened || !currentFrame || !window.YT?.Player || youtubePlayer) return;
    youtubePlayer = new window.YT.Player(currentFrame, {
      events: {
        onReady(event) {
          if (!opened) return;
          event.target.setVolume(35);
          event.target.playVideo();
        },
        onStateChange(event) {
          if (event.data === 1) status.textContent = 'Musik sedang diputar. Kamu bisa menjedakannya melalui pemutar.';
          if (event.data === 2) status.textContent = 'Musik dijeda. Tekan Play untuk melanjutkan.';
        },
        onAutoplayBlocked() {
          status.textContent = 'Pemutaran otomatis dibatasi. Tekan Play pada pemutar untuk memulai musik.';
        },
        onError() {
          status.textContent = 'YouTube tidak dapat memutar lagu di sini. Gunakan Buka di YouTube; suratmu tetap bisa dibaca.';
        }
      }
    });
  }
  window.onYouTubeIframeAPIReady = connectPlayer;

  function loadPlayerApi() {
    if (window.YT?.Player) {
      connectPlayer();
    } else if (!document.querySelector('#youtube-api')) {
      const script = document.createElement('script');
      script.id = 'youtube-api';
      script.src = 'https://www.youtube.com/iframe_api';
      script.onerror = () => {
        status.textContent = 'Jika pemutar tidak tersedia, gunakan Buka di YouTube untuk mendengarkan lagunya.';
      };
      document.head.append(script);
    }
  }

  function openLetter() {
    if (opened) {
      letter.scrollIntoView({ behavior: reducedMotion.matches ? 'instant' : 'smooth', block: 'start' });
      return;
    }
    opened = true;
    envelope.classList.add('is-open');
    openButton.setAttribute('aria-expanded', 'true');
    seal.setAttribute('aria-expanded', 'true');
    seal.disabled = true;
    openButton.firstChild.textContent = 'Baca suratku ';
    hint.textContent = 'Untuk kamu, dengan sepenuh hati.';
    status.textContent = 'Jika musik belum terdengar, tekan Play pada pemutar.';

    const player = document.createElement('iframe');
    player.title = 'Indecision — Rex Orange County feat. Daniel Caesar, pemutar YouTube resmi';
    const params = new URLSearchParams({
      autoplay: '1', playsinline: '1', controls: '1',
      loop: '1', playlist: 'uh0SpzMsZAs', rel: '0', enablejsapi: '1'
    });
    if (window.location.origin !== 'null') params.set('origin', window.location.origin);
    player.src = `https://www.youtube.com/embed/uh0SpzMsZAs?${params}`;
    player.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
    player.referrerPolicy = 'strict-origin-when-cross-origin';
    player.allowFullscreen = true;
    currentFrame = player;
    slot.replaceChildren(player);
    loadPlayerApi();

    revealTimer = window.setTimeout(() => {
      if (!opened) return;
      letter.hidden = false;
      music.hidden = false;
      closeButton.hidden = false;
      letter.focus({ preventScroll: true });
      letter.scrollIntoView({ behavior: reducedMotion.matches ? 'instant' : 'smooth', block: 'start' });
    }, reducedMotion.matches ? 0 : 1250);
  }

  function closeLetter() {
    opened = false;
    window.clearTimeout(revealTimer);
    youtubePlayer?.destroy();
    youtubePlayer = null;
    currentFrame = null;
    slot.replaceChildren();
    letter.hidden = true;
    music.hidden = true;
    closeButton.hidden = true;
    envelope.classList.remove('is-open');
    seal.disabled = false;
    seal.setAttribute('aria-expanded', 'false');
    openButton.setAttribute('aria-expanded', 'false');
    openButton.firstChild.textContent = 'Buka suratku ';
    hint.textContent = 'Ketuk segelnya untuk membuka';
    openButton.focus({ preventScroll: true });
    document.querySelector('#cover').scrollIntoView({ behavior: reducedMotion.matches ? 'instant' : 'smooth', block: 'start' });
  }

  openButton.addEventListener('click', openLetter);
  seal.addEventListener('click', openLetter);
  closeButton.addEventListener('click', closeLetter);
  document.querySelector('#copy-song').addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(songUrl);
      status.textContent = 'Tautan lagu berhasil disalin.';
    } catch {
      status.textContent = 'Salin manual tautan yang tertulis di bawah tombol.';
    }
  });
})();
