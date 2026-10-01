(() => {
  'use strict';
  const data = window.FANDOM_DATA;
  const homeView = document.getElementById('homeView');
  const quizCatalogView = document.getElementById('quizCatalogView');
  const quizView = document.getElementById('quizView');
  const resultView = document.getElementById('resultView');
  const views = [homeView, quizCatalogView, quizView, resultView];
  const byId = (id) => document.getElementById(id);
  let currentQuestion = 0;
  let selectedAnswers = [];
  let currentResult = null;
  let activeQuiz = data.quiz;
  let activeFandom = data.fandoms[0];

  const audioEngine = (() => {
    let context = null;
    let timer = null;
    let profile = null;
    let index = 0;
    let muted = false;

    function getContext() {
      if (!context) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) return null;
        context = new AudioContext();
      }
      return context;
    }

    function tone(frequency, duration = 0.18, volume = 0.035, wave = 'sine', when = 0) {
      const ctx = getContext();
      if (!ctx || muted) return;
      const start = ctx.currentTime + when;
      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();
      oscillator.type = wave;
      oscillator.frequency.setValueAtTime(frequency, start);
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(volume, start + 0.018);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
      oscillator.connect(gain).connect(ctx.destination);
      oscillator.start(start);
      oscillator.stop(start + duration + 0.03);
    }

    function beat() {
      if (!profile || muted) return;
      const note = profile.notes[index % profile.notes.length];
      tone(note, 0.42, 0.025, profile.wave);
      if (index % 2 === 0) tone(profile.bass, 0.7, 0.012, 'sine', 0.04);
      index += 1;
    }

    async function start(nextProfile) {
      profile = nextProfile || null;
      if (!profile || muted) return;
      const ctx = getContext();
      if (!ctx) return;
      if (ctx.state === 'suspended') await ctx.resume();
      stopTimer();
      index = 0;
      beat();
      timer = window.setInterval(beat, 60000 / profile.tempo);
    }

    function stopTimer() {
      if (timer) window.clearInterval(timer);
      timer = null;
    }

    function stop() {
      stopTimer();
    }

    function playThemeChange(nextProfile) {
      const next = nextProfile || profile;
      if (!next || muted) return;
      const ctx = getContext();
      if (!ctx) return;
      if (ctx.state === 'suspended') ctx.resume();
      const notes = next.notes || [220, 277, 330];
      const wave = next.wave || 'sine';
      tone(notes[0], 0.16, 0.035, wave);
      tone(notes[1 % notes.length], 0.2, 0.03, wave, 0.08);
      tone(notes[2 % notes.length], 0.32, 0.028, wave, 0.16);
      if (next.bass) tone(next.bass, 0.42, 0.014, 'sine', 0.02);
    }

    function playSecret(nextProfile, mode = 'phrase') {
      const next = nextProfile || profile;
      if (!next || muted) return;
      const ctx = getContext();
      if (!ctx) return;
      if (ctx.state === 'suspended') ctx.resume();
      const notes = next.notes || [220, 277, 330, 392];
      const patterns = {
        phrase: [0, 2, 1, 3, 2],
        mark: [0, 1, 3, 1, 2, 0],
      };
      (patterns[mode] || patterns.phrase).forEach((step, index) => {
        tone(notes[step % notes.length], 0.14 + (index === 4 ? 0.22 : 0), 0.035, next.wave || 'sine', index * 0.085);
      });
      if (next.bass) tone(next.bass, 0.5, 0.012, 'sine', 0.04);
    }

    function playResult() {
      if (!profile) return;
      tone(profile.notes[0], 0.22, 0.045, profile.wave);
      tone(profile.notes[1 % profile.notes.length], 0.32, 0.04, profile.wave, 0.12);
      tone(profile.notes[2 % profile.notes.length], 0.5, 0.035, profile.wave, 0.24);
    }

    function toggle(nextMuted) {
      muted = nextMuted;
      if (muted) stopTimer();
      else if (profile) start(profile);
      return muted;
    }

    return {
      start,
      stop,
      toggle,
      isMuted: () => muted,
      playSelection: () => profile && tone(profile.notes[index % profile.notes.length], 0.11, 0.045, profile.wave),
      playThemeChange,
      playSecret,
      playResult,
    };
  })();

  function getQuizDefinition(quizId) {
    return quizId === data.quiz.id ? data.quiz : data.additionalQuizzes?.[quizId];
  }

  function getFandomForQuiz(quiz) {
    return data.fandoms.find((fandom) => fandom.id === quiz?.fandomId) || data.fandoms[0];
  }

  const RESUME_STORAGE_KEY = 'fandom-fate-quiz-progress-v1';
  const BADGE_STORAGE_KEY = 'fandom-fate-side-quest-badges-v1';

  function readStorage(key, fallback) {
    try {
      const value = window.localStorage.getItem(key);
      return value ? JSON.parse(value) : fallback;
    } catch (_) { return fallback; }
  }

  function writeStorage(key, value) {
    try { window.localStorage.setItem(key, JSON.stringify(value)); } catch (_) { /* private browsing can block storage */ }
  }

  function saveQuizProgress() {
    if (!activeQuiz || currentQuestion >= activeQuiz.questions.length) return;
    writeStorage(RESUME_STORAGE_KEY, {
      quizId: activeQuiz.id,
      fandomId: activeFandom.id,
      currentQuestion,
      selectedAnswers,
      savedAt: Date.now(),
    });
  }

  function clearQuizProgress() {
    try { window.localStorage.removeItem(RESUME_STORAGE_KEY); } catch (_) { /* ignore unavailable storage */ }
  }

  function getCompletedMiniGames() {
    const badges = readStorage(BADGE_STORAGE_KEY, []);
    return Array.isArray(badges) ? badges : [];
  }

  function markMiniGameComplete() {
    const badges = new Set(getCompletedMiniGames());
    badges.add(activeFandom.id);
    writeStorage(BADGE_STORAGE_KEY, [...badges]);
  }

  function isMiniGameComplete() {
    return getCompletedMiniGames().includes(activeFandom.id);
  }

  function clearShareParams() {
    const url = new URL(window.location.href);
    if (!url.searchParams.has('fandom') && !url.searchParams.has('quiz') && !url.searchParams.has('result')) return;
    url.search = '';
    window.history.replaceState({}, '', url.pathname + url.hash);
  }

  function getResultShareUrl() {
    const url = new URL(window.location.href);
    url.search = '';
    url.searchParams.set('fandom', activeFandom.id);
    url.searchParams.set('quiz', activeQuiz.id);
    url.searchParams.set('result', currentResult.id);
    return url.toString();
  }

  const easterEggs = {
    'wizarding-world': { phrases: ['lumos', 'owlpost', 'portkey'], gamePhrase: 'owlpost', reveal: 'A little light answers back.' },
    'lord-of-the-rings': { phrases: ['mellon', 'secondbreakfast', 'lembas'], gamePhrase: 'secondbreakfast', reveal: 'The hidden door knows your word.' },
    'lord-of-the-mysteries': { phrases: ['seer', 'beyonder', 'tarot'], gamePhrase: 'tarot', reveal: 'The veil parts for one second.' },
    marvel: { phrases: ['assemble', 'wakanda', 'multiverse'], gamePhrase: 'multiverse', reveal: 'The team heard that.' },
    disney: { phrases: ['wish', 'bibbidi', 'storybook'], gamePhrase: 'storybook', reveal: 'A small wish became a melody.' },
    'star-wars': { phrases: ['force', 'hyperspace', 'droid'], gamePhrase: 'hyperspace', reveal: 'The signal is strong with you.' },
    'stranger-things': { phrases: ['upside', 'eggo', 'hawkins'], gamePhrase: 'hawkins', reveal: 'Something answered from the other side.' },
    'hunger-games': { phrases: ['mockingjay', 'district', 'nightlock'], gamePhrase: 'district', reveal: 'A quiet signal travels district to district.' },
  };
  const miniGames = {
    'wizarding-world': { title: 'The moving stair test', prompt: 'The staircase changes direction. What do you do first?', options: [['Ask the portrait for a shortcut.', 'You make friends with the rules before breaking them.'], ['Take the stairs two at a time.', 'Bravery gets you moving, even when the landing is unknown.'], ['Wait for the pattern to repeat.', 'Patience is its own kind of magic.']] },
    'lord-of-the-rings': { title: 'A road with three turns', prompt: 'The party reaches a fork before dusk. Which path feels right?', options: [['The quiet road through the trees.', 'You trust the path that leaves room for listening.'], ['The high pass with the wide view.', 'You choose perspective, even when the climb costs more.'], ['The road back to the last camp.', 'You know that regrouping is not the same as retreating.']] },
    'lord-of-the-mysteries': { title: 'Three sealed envelopes', prompt: 'One envelope contains a clue, one a warning, and one a trap. Which do you open?', options: [['The one with no name.', 'Curiosity is your compass, but you keep one hand on the exit.'], ['The one marked urgent.', 'You move toward danger when information can save someone.'], ['None. Check the room first.', 'You survive mysteries by noticing what the mystery wants you to miss.']] },
    marvel: { title: 'The team needs a plan', prompt: 'The plan collapses in the first five minutes. Your next move?', options: [['Build a new plan on the fly.', 'Improvisation turns chaos into a second chance.'], ['Protect the people first.', 'Your power is knowing what matters before the spotlight arrives.'], ['Make the impossible entrance.', 'Sometimes morale is the most practical superpower.']] },
    disney: { title: 'A storybook crossroads', prompt: 'A tiny door appears at the edge of the page. What do you bring?', options: [['A promise to come back.', 'Wonder is stronger when it remembers who is waiting.'], ['A brave question.', 'You turn uncertainty into the beginning of an adventure.'], ['A friend who notices details.', 'The best magic is rarely a solo act.']] },
    'star-wars': { title: 'Signal in the static', prompt: 'A faint signal cuts through the stars. How do you answer?', options: [['Follow the coordinates.', 'You trust the pull of a meaningful direction.'], ['Ask who is transmitting.', 'Discernment keeps hope from becoming a trap.'], ['Send a simple light pulse.', 'You answer uncertainty with a small, steady kindness.']] },
    'stranger-things': { title: 'The flashlight flickers', prompt: 'The hallway goes quiet. What detail do you check?', options: [['The wallpaper pattern.', 'You notice the weird detail everyone else walks past.'], ['Your friends’ footsteps.', 'You know the best survival plan is staying connected.'], ['The exit sign.', 'You keep one eye on the mystery and one on getting home.']] },
    'hunger-games': { title: 'The quiet signal', prompt: 'You have one chance to send a message. What does it say?', options: [['Stay together.', 'You turn survival into solidarity.'], ['Remember who started this.', 'Memory is a form of resistance.'], ['The next safe place.', 'You protect hope by making it practical.']] },
  };
  let secretKeyBuffer = '';
  let secretClickCount = 0;
  let secretClickTimer = null;

  function resetEasterEgg() {
    secretKeyBuffer = '';
    secretClickCount = 0;
    window.clearTimeout(secretClickTimer);
    document.body.classList.remove('easter-egg-found');
    const status = byId('easterEggStatus');
    if (status) {
      status.textContent = '';
      status.classList.remove('is-revealed');
    }
  }

  function updateMiniGameBadge() {
    const complete = isMiniGameComplete();
    const game = miniGames[activeFandom.id];
    const openButton = byId('miniGameOpen');
    const badge = byId('miniGameBadge');
    if (openButton) openButton.textContent = `${complete ? '✓' : '✦'} ${game?.title || 'Open side quest'}`;
    if (badge) badge.textContent = complete ? 'Badge earned' : 'Unclaimed';
  }

  function closeMiniGame() {
    const dialog = byId('miniGameDialog');
    if (dialog?.open) dialog.close();
    else dialog?.removeAttribute('open');
  }

  function openMiniGame() {
    const game = miniGames[activeFandom.id];
    const dialog = byId('miniGameDialog');
    if (!game || !dialog) return;
    updateMiniGameBadge();
    byId('miniGameTitle').textContent = game.title;
    byId('miniGamePrompt').textContent = game.prompt;
    const result = byId('miniGameResult');
    result.textContent = '';
    result.classList.remove('is-revealed');
    const options = byId('miniGameOptions');
    options.replaceChildren();
    game.options.forEach(([label, outcome]) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'mini-game-choice';
      button.textContent = label;
      button.addEventListener('click', () => {
        markMiniGameComplete();
        updateMiniGameBadge();
        result.textContent = outcome;
        result.classList.remove('is-revealed');
        void result.offsetWidth;
        result.classList.add('is-revealed');
        audioEngine.playSecret(activeFandom.theme?.audio, 'mark');
      });
      options.append(button);
    });
    if (typeof dialog.showModal === 'function') dialog.showModal();
    else dialog.setAttribute('open', '');
    window.setTimeout(() => options.querySelector('button')?.focus(), 40);
  }

  function triggerEasterEgg(mode = 'phrase') {
    const egg = easterEggs[activeFandom.id];
    if (!egg) return;
    const status = byId('easterEggStatus');
    if (!status) return;
    status.textContent = egg.reveal;
    status.classList.remove('is-revealed');
    void status.offsetWidth;
    status.classList.add('is-revealed');
    document.body.classList.remove('easter-egg-found');
    void document.body.offsetWidth;
    document.body.classList.add('easter-egg-found');
    audioEngine.playSecret(activeFandom.theme?.audio, mode);
    if (mode === 'game-phrase') window.setTimeout(openMiniGame, 180);
    window.setTimeout(() => document.body.classList.remove('easter-egg-found'), 800);
  }

  function applyFandomTheme(fandom, options = {}) {
    activeFandom = fandom || data.fandoms[0];
    resetEasterEgg();
    const theme = activeFandom.theme || {};
    document.body.dataset.fandom = activeFandom.id;
    document.documentElement.style.setProperty('--fandom-accent', theme.accent || activeFandom.accent || 'var(--red)');
    document.documentElement.style.setProperty('--fandom-soft', theme.soft || 'var(--paper-hi)');
    document.documentElement.style.setProperty('--fandom-ink', theme.ink || 'var(--ink)');
    byId('fandomThemeMark').textContent = theme.mark || activeFandom.glyph;
    byId('fandomThemeKicker').textContent = theme.kicker || activeFandom.name;
    byId('fandomThemeTagline').textContent = theme.tagline || activeFandom.description;
    byId('fandomThemeMotif').textContent = theme.motif || `${activeFandom.name} / QUIZ EDITION`;
    byId('quizThemeMark').textContent = theme.mark || activeFandom.glyph;
    byId('quizThemeTagline').textContent = theme.tagline || activeFandom.description;
    byId('resultThemeNote').textContent = theme.motif || `${activeFandom.name} / QUIZ EDITION`;
    updateMiniGameBadge();
    byId('audioToggle').style.setProperty('--fandom-accent', theme.accent || activeFandom.accent || 'var(--red)');
    updateAudioToggle();
    document.body.classList.remove('theme-switching');
    // Reflow lets the same animation replay when a user revisits a fandom.
    void document.body.offsetWidth;
    document.body.classList.add('theme-switching');
    window.clearTimeout(document.body._themeSwitchTimer);
    document.body._themeSwitchTimer = window.setTimeout(() => document.body.classList.remove('theme-switching'), 900);
    if (options.playCue !== false) audioEngine.playThemeChange(theme.audio);
  }

  function showView(view) {
    views.forEach((item) => {
      const active = item === view;
      item.classList.toggle('is-hidden', !active);
      item.setAttribute('aria-hidden', String(!active));
    });
    window.scrollTo({ top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
  }

  function renderFandomCards() {
    const grid = byId('fandomGrid');
    data.fandoms.forEach((fandom) => {
      const card = document.createElement('article');
      card.className = `fandom-card${fandom.status === 'coming' ? ' is-coming' : ''}`;
      card.dataset.fandom = fandom.id;
      card.style.setProperty('--accent', fandom.theme?.accent || fandom.accent);
      const head = document.createElement('div');
      head.className = 'fandom-card-head';
      const glyph = document.createElement('span');
      glyph.className = 'fandom-glyph';
      glyph.setAttribute('aria-hidden', 'true');
      glyph.textContent = fandom.glyph;
      const status = document.createElement('span');
      status.className = 'fandom-status';
      status.textContent = fandom.status === 'live' ? 'Open' : 'In the works';
      head.append(glyph, status);
      const title = document.createElement('h3');
      title.textContent = fandom.name;
      const description = document.createElement('p');
      description.textContent = fandom.description;
      const bottom = document.createElement('div');
      bottom.className = 'fandom-card-bottom';
      const meta = document.createElement('span');
      meta.className = 'fandom-meta';
      const hasQuizShelf = Array.isArray(fandom.quizzes) && fandom.quizzes.length > 1;
      // ponytail: question totals derive from the quiz definitions so the card can never claim a stale number.
      const liveQuestions = (fandom.quizzes || []).reduce((sum, quiz) => sum + (getQuizDefinition(quiz.id)?.questions.length || 0), 0);
      meta.textContent = hasQuizShelf
        ? `${fandom.quizzes.length} quiz types`
        : fandom.status === 'live'
          ? `${liveQuestions} questions`
          : fandom.category;
      if (fandom.status === 'live') {
        const button = document.createElement('button');
        button.className = 'fandom-link';
        button.type = 'button';
        button.textContent = hasQuizShelf ? 'View quizzes  →' : 'Start quiz  →';
        button.setAttribute('aria-label', hasQuizShelf ? `View quizzes in ${fandom.name}` : `Start the ${fandom.name} quiz`);
        button.addEventListener('click', () => {
          if (hasQuizShelf) return showQuizCatalog(fandom);
          const quiz = (fandom.quizzes || [])[0];
          startQuiz(getQuizDefinition(quiz ? quiz.id : data.quiz.id));
        });
        bottom.append(meta, button);
      } else {
        bottom.append(meta);
      }
      card.append(head, title, description, bottom);
      grid.append(card);
    });
  }

  function showQuizCatalog(fandom) {
    applyFandomTheme(fandom);
    const theme = fandom.theme || {};
    byId('quizCatalogFandomName').textContent = fandom.name;
    byId('quizCatalogEyebrow').textContent = `${theme.kicker || fandom.name} / quiz shelf`;
    byId('quizCatalogDescription').textContent = theme.tagline || 'One fandom, a few different ways to find your place in it.';
    byId('quizCatalogView').dataset.motif = theme.motif || fandom.name;
    byId('quizCatalogView').dataset.texture = theme.texture || '';

    const grid = byId('quizTypeGrid');
    grid.setAttribute('aria-label', `${fandom.name} quiz types`);
    grid.replaceChildren();
    (fandom.quizzes || []).forEach((quiz) => {
      const isReady = quiz.status === 'live' && Boolean(getQuizDefinition(quiz.id));
      const card = document.createElement('article');
      card.className = `quiz-type-card${isReady ? '' : ' is-coming'}`;

      const head = document.createElement('div');
      head.className = 'quiz-type-head';
      const kind = document.createElement('span');
      kind.className = 'quiz-type-kind';
      kind.textContent = quiz.kind;
      const status = document.createElement('span');
      status.className = 'quiz-type-status';
      status.textContent = isReady ? 'Ready' : 'In the works';
      head.append(kind, status);

      const title = document.createElement('h2');
      title.textContent = quiz.title;
      const description = document.createElement('p');
      description.textContent = quiz.description;
      const footer = document.createElement('div');
      footer.className = 'quiz-type-footer';
      const meta = document.createElement('span');
      meta.className = 'quiz-type-meta';
      meta.textContent = quiz.meta;
      footer.append(meta);
      if (isReady) {
        const button = document.createElement('button');
        button.className = 'quiz-type-link';
        button.type = 'button';
        button.textContent = 'Start quiz  →';
        button.setAttribute('aria-label', `Start ${quiz.title}`);
        button.addEventListener('click', () => startQuiz(getQuizDefinition(quiz.id)));
        footer.append(button);
      }
      card.append(head, title, description, footer);
      grid.append(card);
    });
    showView(quizCatalogView);
    window.setTimeout(() => byId('quizCatalogHeading').focus({ preventScroll: true }), 40);
  }

  function startQuiz(quiz = data.quiz, options = {}) {
    activeQuiz = quiz;
    applyFandomTheme(getFandomForQuiz(quiz), { playCue: false });
    byId('quizView').dataset.motif = activeFandom.theme?.motif || activeFandom.name;
    audioEngine.start(activeFandom.theme?.audio);
    audioEngine.playThemeChange(activeFandom.theme?.audio);
    clearShareParams();
    currentQuestion = 0;
    selectedAnswers = [];
    currentResult = null;
    const saved = options.resume === false ? null : readStorage(RESUME_STORAGE_KEY, null);
    const canResume = saved && saved.quizId === activeQuiz.id && Number.isInteger(saved.currentQuestion)
      && saved.currentQuestion > 0 && saved.currentQuestion < activeQuiz.questions.length
      && Array.isArray(saved.selectedAnswers) && saved.selectedAnswers.length === saved.currentQuestion;
    if (canResume) {
      currentQuestion = saved.currentQuestion;
      selectedAnswers = saved.selectedAnswers;
      byId('resumeStatus').textContent = `Resumed at question ${currentQuestion + 1} of ${activeQuiz.questions.length}.`;
    } else {
      byId('resumeStatus').textContent = '';
    }
    byId('quizFandomName').textContent = activeQuiz.fandomName;
    showView(quizView);
    renderQuestion();
    window.setTimeout(() => byId('questionText').focus({ preventScroll: true }), 40);
  }

  function renderQuestion() {
    const question = activeQuiz.questions[currentQuestion];
    const total = activeQuiz.questions.length;
    const step = currentQuestion + 1;
    byId('questionCount').textContent = `QUESTION ${step} OF ${total}`;
    byId('progressTrack').setAttribute('aria-valuemax', String(total));
    byId('progressTrack').setAttribute('aria-valuenow', String(step));
    byId('progressBar').style.width = `${(step / total) * 100}%`;
    byId('previousQuestion').disabled = currentQuestion === 0;
    byId('questionCategory').textContent = question.category;
    byId('questionText').textContent = question.text;
    const list = byId('answerList');
    list.replaceChildren();
    question.answers.forEach((answer, index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'answer-button';
      const marker = document.createElement('span');
      marker.className = 'answer-marker';
      marker.setAttribute('aria-hidden', 'true');
      marker.textContent = String.fromCharCode(65 + index);
      const label = document.createElement('span');
      label.textContent = answer.text;
      button.append(marker, label);
      button.addEventListener('click', () => chooseAnswer(answer.result, button));
      list.append(button);
    });
  }

  function chooseAnswer(resultId, selectedButton) {
    const buttons = [...byId('answerList').querySelectorAll('button')];
    if (buttons.some((button) => button.disabled)) return;
    buttons.forEach((button) => { button.disabled = true; });
    selectedButton.classList.add('selected');
    selectedButton.querySelector('.answer-marker').textContent = '✓';
    audioEngine.playSelection();
    selectedAnswers.push(resultId);
    const delay = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 220;
    window.setTimeout(() => {
      currentQuestion += 1;
      if (currentQuestion < activeQuiz.questions.length) {
        saveQuizProgress();
        renderQuestion();
        byId('questionText').focus({ preventScroll: true });
      } else {
        clearQuizProgress();
        showResult();
      }
    }, delay);
  }

  function goToPreviousQuestion() {
    if (currentQuestion === 0) return;
    currentQuestion -= 1;
    selectedAnswers.splice(currentQuestion, 1);
    saveQuizProgress();
    byId('resumeStatus').textContent = 'Answer reopened. Choose again.';
    renderQuestion();
    byId('questionText').focus({ preventScroll: true });
  }

  function calculateResult() {
    const scores = new Map(activeQuiz.results.map((result) => [result.id, 0]));
    selectedAnswers.forEach((id) => scores.set(id, (scores.get(id) || 0) + 1));
    // Stable tie-break: the first result in the authored results array wins a tie.
    return activeQuiz.results.reduce((best, result) => scores.get(result.id) > scores.get(best.id) ? result : best, activeQuiz.results[0]);
  }

  function showResult(resultOverride = null, options = {}) {
    currentResult = resultOverride || calculateResult();
    clearQuizProgress();
    audioEngine.stop();
    audioEngine.playResult();
    applyFandomTheme(getFandomForQuiz(activeQuiz), { playCue: options.playCue !== false });
    if (options.updateUrl !== false && currentResult) window.history.replaceState({}, '', getResultShareUrl());
    byId('resultFandomName').textContent = activeQuiz.fandomName;
    byId('resultBadge').textContent = activeQuiz.resultBadge || 'YOUR CHARACTER MATCH';
    byId('resultLead').textContent = activeQuiz.resultLead || 'You are';
    byId('resultName').textContent = currentResult.name;
    byId('resultArchetype').textContent = currentResult.archetype;
    byId('resultDescription').textContent = currentResult.description;
    const traits = byId('traitList');
    traits.replaceChildren();
    currentResult.traits.forEach((trait) => {
      const pill = document.createElement('span');
      pill.className = 'trait-pill';
      pill.textContent = trait;
      traits.append(pill);
    });
    byId('shareStatus').textContent = '';
    byId('socialShare').hidden = true;
    showView(resultView);
    window.setTimeout(() => byId('resultHeading').focus({ preventScroll: true }), 40);
  }

  function showHome(target = 'fandoms') {
    audioEngine.stop();
    document.body.dataset.fandom = '';
    clearShareParams();
    showView(homeView);
    if (target === 'top') return;
    window.setTimeout(() => {
      const anchor = byId(target);
      if (anchor) anchor.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'start' });
    }, 20);
  }

  async function copyFallback(text) {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return;
    }
    const field = document.createElement('textarea');
    field.value = text;
    field.setAttribute('readonly', '');
    field.style.position = 'fixed';
    field.style.opacity = '0';
    document.body.append(field);
    field.select();
    const copied = document.execCommand('copy');
    field.remove();
    if (!copied) throw new Error('Copy was not available in this browser.');
  }

  function updateAudioToggle() {
    const button = byId('audioToggle');
    const muted = audioEngine.isMuted();
    button.setAttribute('aria-pressed', String(!muted));
    button.setAttribute('aria-label', muted ? 'Turn fandom ambience on' : 'Turn fandom ambience off');
    button.querySelector('span').textContent = muted ? 'Sound off' : 'Sound on';
  }

  function wrapCanvasText(ctx, text, x, y, maxWidth, lineHeight, maxLines = 4) {
    const words = text.split(' ');
    let line = '';
    let lines = [];
    words.forEach((word) => {
      const candidate = line ? `${line} ${word}` : word;
      if (ctx.measureText(candidate).width > maxWidth && line) {
        lines.push(line);
        line = word;
      } else line = candidate;
    });
    if (line) lines.push(line);
    lines = lines.slice(0, maxLines);
    lines.forEach((item, index) => ctx.fillText(item, x, y + index * lineHeight));
    return y + lines.length * lineHeight;
  }

  function cardSlug() {
    return `${activeQuiz.fandomName}-${currentResult?.name || 'result'}`.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  }

  async function createResultCardBlob() {
    const theme = activeFandom.theme || {};
    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 630;
    const ctx = canvas.getContext('2d');
    const paper = '#f5f0e4';
    const soft = theme.soft || '#fffdf7';
    const accent = theme.accent || '#c95541';
    const ink = theme.ink || '#292638';
    ctx.fillStyle = paper;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = soft;
    ctx.fillRect(50, 50, 1100, 530);
    ctx.strokeStyle = ink;
    ctx.lineWidth = 5;
    ctx.strokeRect(50, 50, 1100, 530);
    ctx.fillStyle = accent;
    ctx.fillRect(50, 50, 18, 530);
    ctx.fillStyle = ink;
    ctx.font = '700 20px Courier New, monospace';
    ctx.fillText((theme.kicker || activeFandom.name).toUpperCase(), 105, 112);
    ctx.font = '700 16px Courier New, monospace';
    ctx.fillStyle = accent;
    ctx.fillText((activeQuiz.resultBadge || 'YOUR RESULT').toUpperCase(), 105, 155);
    ctx.fillStyle = ink;
    ctx.font = '700 58px Georgia, serif';
    ctx.fillText(activeQuiz.resultLead || 'You are', 105, 245);
    ctx.fillStyle = accent;
    ctx.font = '700 72px Georgia, serif';
    const nameEnd = wrapCanvasText(ctx, currentResult.name, 105, 325, 900, 78, 1);
    ctx.fillStyle = ink;
    ctx.font = 'italic 26px Georgia, serif';
    wrapCanvasText(ctx, currentResult.archetype, 105, nameEnd + 8, 820, 34, 2);
    ctx.font = '18px Courier New, monospace';
    ctx.fillStyle = ink;
    ctx.fillText((theme.motif || activeFandom.name).toUpperCase(), 105, 530);
    ctx.font = '700 17px Courier New, monospace';
    ctx.fillStyle = accent;
    ctx.fillText('FANDOM FATE / JUST-FOR-FUN', 785, 530);
    return new Promise((resolve, reject) => canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error('Card image could not be created')), 'image/png'));
  }

  function showSocialFallback() {
    byId('socialShare').hidden = false;
  }

  async function downloadResultCard() {
    if (!currentResult) return;
    const blob = await createResultCardBlob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${cardSlug()}.png`;
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    byId('shareStatus').textContent = 'Your personalized result card is ready to post.';
    showSocialFallback();
  }

  async function shareResult() {
    if (!currentResult) return;
    const shareNoun = activeQuiz.shareNoun || 'character';
    const shareUrl = getResultShareUrl();
    const shareText = `My Fandom Fate: My ${shareNoun} match is ${currentResult.name} — ${currentResult.archetype}. Take the quiz and find your fit! ${shareUrl}`;
    const status = byId('shareStatus');
    try {
      const blob = await createResultCardBlob();
      const file = new File([blob], `${cardSlug()}.png`, { type: 'image/png' });
      if (navigator.share && (!navigator.canShare || navigator.canShare({ files: [file] }))) {
        await navigator.share({ title: 'My Fandom Fate result', text: shareText, url: shareUrl, files: [file] });
        status.textContent = 'Your result card is ready to share.';
        return;
      }
      if (navigator.share) {
        await navigator.share({ title: 'My Fandom Fate result', text: shareText, url: shareUrl });
        status.textContent = 'Result text shared. Download the card to attach the image too.';
      } else {
        await copyFallback(shareText);
        status.textContent = 'Result text copied. Download the card to post the image.';
      }
      showSocialFallback();
    } catch (error) {
      if (error && error.name === 'AbortError') return;
      try {
        await copyFallback(shareText);
        status.textContent = 'Result text copied. Download the card to post the image.';
        showSocialFallback();
      } catch (_) {
        status.textContent = 'Sharing is not available here—download your card to post it manually.';
        showSocialFallback();
      }
    }
  }

  function socialText() {
    return `My Fandom Fate result is ${currentResult.name} — ${currentResult.archetype}. Take the quiz and find your fit! ${getResultShareUrl()}`;
  }

  function openSocial(url) {
    window.open(url, '_blank', 'noopener,noreferrer');
  }

  byId('miniGameOpen').addEventListener('click', openMiniGame);
  byId('miniGameClose').addEventListener('click', closeMiniGame);
  byId('miniGameDialog').addEventListener('click', (event) => {
    if (event.target === byId('miniGameDialog')) closeMiniGame();
  });

  const secretMark = byId('fandomThemeMark');
  secretMark.addEventListener('click', () => {
    secretClickCount += 1;
    window.clearTimeout(secretClickTimer);
    secretClickTimer = window.setTimeout(() => { secretClickCount = 0; }, 1200);
    if (secretClickCount >= 3) {
      secretClickCount = 0;
      triggerEasterEgg('mark');
    }
  });
  secretMark.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      secretMark.click();
    }
  });

  document.querySelectorAll('[data-home-link]').forEach((link) => link.addEventListener('click', (event) => {
    event.preventDefault();
    const href = link.getAttribute('href');
    const target = href === '#top' ? 'top' : href === '#about' ? 'about' : href === '#how-it-works' ? 'how-it-works' : 'fandoms';
    showHome(target);
  }));
  byId('backToFandoms').addEventListener('click', () => showHome('fandoms'));
  byId('catalogBack').addEventListener('click', () => showHome('fandoms'));
  byId('resultBack').addEventListener('click', () => showHome('fandoms'));
  byId('previousQuestion').addEventListener('click', goToPreviousQuestion);
  byId('tryAgain').addEventListener('click', () => startQuiz(activeQuiz, { resume: false }));
  byId('audioToggle').addEventListener('click', async () => {
    const muted = audioEngine.toggle(!audioEngine.isMuted());
    // Paint the new state before awaiting audio: ctx.resume() can stall when no output device exists.
    updateAudioToggle();
    if (!muted) await audioEngine.start(activeFandom.theme?.audio);
  });
  byId('shareResult').addEventListener('click', shareResult);
  byId('downloadResultCard').addEventListener('click', downloadResultCard);
  byId('shareX').addEventListener('click', () => openSocial(`https://twitter.com/intent/tweet?text=${encodeURIComponent(socialText())}`));
  byId('shareFacebook').addEventListener('click', () => openSocial(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`));
  byId('shareWhatsApp').addEventListener('click', () => openSocial(`https://wa.me/?text=${encodeURIComponent(socialText() + ' ' + window.location.href)}`));
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && (!quizView.classList.contains('is-hidden') || !quizCatalogView.classList.contains('is-hidden'))) showHome('fandoms');
    if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
      const egg = easterEggs[activeFandom.id];
      if (egg && (!quizView.classList.contains('is-hidden') || !quizCatalogView.classList.contains('is-hidden'))) {
        const phrases = egg.phrases || [egg.phrase];
        const maxPhraseLength = Math.max(...phrases.map((phrase) => phrase.length));
        secretKeyBuffer = (secretKeyBuffer + event.key.toLowerCase()).slice(-maxPhraseLength);
        const matchedPhrase = phrases.find((phrase) => secretKeyBuffer.endsWith(phrase));
        if (matchedPhrase) {
          secretKeyBuffer = '';
          triggerEasterEgg(matchedPhrase === egg.gamePhrase ? 'game-phrase' : 'phrase');
        }
      }
    }
  });
  function loadSharedResult() {
    const params = new URLSearchParams(window.location.search);
    const quiz = getQuizDefinition(params.get('quiz'));
    const result = quiz?.results?.find((item) => item.id === params.get('result'));
    if (!quiz || !result) return;
    activeQuiz = quiz;
    showResult(result, { playCue: false, updateUrl: false });
  }

  renderFandomCards();
  loadSharedResult();
})();
