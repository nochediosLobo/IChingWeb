document.addEventListener('DOMContentLoaded', () => {
    // 禁用瀏覽器的捲動位置恢復功能，強制回到最上方
    if ('scrollRestoration' in history) {
        history.scrollRestoration = 'manual';
    }
    window.scrollTo(0, 0);

    // ---- Theme Selection ----
    const themeSelect = document.getElementById('theme-select');
    if(themeSelect) {
        const currentTheme = localStorage.getItem('app-theme') || 'dark-green';
        themeSelect.value = currentTheme;
        if(currentTheme === 'original') {
            document.documentElement.setAttribute('data-theme', 'original');
        }
        
        themeSelect.addEventListener('change', (e) => {
            const val = e.target.value;
            if(val === 'original') {
                document.documentElement.setAttribute('data-theme', 'original');
            } else {
                document.documentElement.removeAttribute('data-theme');
            }
            localStorage.setItem('app-theme', val);
        });
    }

    // ---- Data Patching for Stability ----
    // Ensure all hexagrams have 'upper' and 'lower' defined
    const activeHexagramData = window.defaultHexagramData || [];
    const trigramsData = window.trigramsData || [];

    activeHexagramData.forEach(hex => {
        if (!hex.upper || !hex.lower) {
            if (hex.name.includes('為')) {
                hex.upper = hex.name.charAt(2);
                hex.lower = hex.name.charAt(2);
            } else {
                hex.upper = hex.name.charAt(0);
                hex.lower = hex.name.charAt(1);
            }
        }
    });

    // ---- DOM Elements ----
    const viewGrid = document.getElementById('view-grid');
    const viewQuiz = document.getElementById('view-quiz');
    const viewPlum = document.getElementById('view-plum-blossom');
    
    // Controls
    const btnSortSeq = document.getElementById('btn-sort-seq');
    const btnSortUpper = document.getElementById('btn-sort-upper');
    const btnLearn = document.getElementById('btn-learn');
    const btnPlumBlossom = document.getElementById('btn-plum-blossom');

    const btnBackToTop = document.getElementById('btn-back-to-top');

    // Container
    const gridContainer = document.getElementById('hexagram-container');
    
    // Modal
    const modal = document.getElementById('detail-modal');
    const modalContentArea = document.getElementById('modal-content-area');
    const closeModalBtn = document.getElementById('close-modal');
    const modalSymbol = document.getElementById('modal-symbol');
    const modalName = document.getElementById('modal-name');
    const sectionStory = document.getElementById('section-story');
    const modalStory = document.getElementById('modal-story');
    const modalClassic = document.getElementById('modal-classic');
    const modalModern = document.getElementById('modal-modern');
    const sectionYao = document.getElementById('section-yao');
    const modalYao = document.getElementById('modal-yao');
    const modalLink = document.getElementById('modal-link');
    
    // Modal Links for external references
    const modalLinkStory = document.getElementById('modal-link-story');
    const modalLinkClassic = document.getElementById('modal-link-classic');
    const modalLinkModern = document.getElementById('modal-link-modern');
    const modalLinkYao = document.getElementById('modal-link-yao');

    // Quiz DOM
    const quizGameSelection = document.getElementById('quiz-game-selection');
    const quizSetup = document.getElementById('quiz-setup');
    const quizActive = document.getElementById('quiz-active');
    const quizResult = document.getElementById('quiz-result');
    
    // ---- Navigation Routing ----
    let currentMode = 'sequence'; // sequence, upper_trigram, learn, plum, coin
    const trigramOrder = ['天', '澤', '火', '雷', '風', '水', '山', '地'];

    function switchView(mode, activeBtn) {
        currentMode = mode;
        const btnCoinDiv = document.getElementById('btn-coin-div');
        [btnSortSeq, btnSortUpper, btnLearn, btnPlumBlossom].forEach(btn => btn.classList.remove('active', 'nav-highlight'));
        if(btnCoinDiv) btnCoinDiv.classList.remove('active', 'nav-highlight');
        if(activeBtn) {
            if(activeBtn === btnLearn) activeBtn.classList.add('nav-highlight');
            else activeBtn.classList.add('active');
        }

        viewGrid.style.display = 'none';
        viewQuiz.style.display = 'none';
        viewPlum.style.display = 'none';
        const viewCoinDiv = document.getElementById('view-coin-div');
        if(viewCoinDiv) viewCoinDiv.style.display = 'none';

        if (mode === 'sequence' || mode === 'upper_trigram') {
            viewGrid.style.display = 'block';
            renderGrid();
        } else if (mode === 'learn') {
            viewQuiz.style.display = 'flex';
            quizGameSelection.style.display = 'block';
            quizSetup.style.display = 'block';
            quizActive.style.display = 'none';
            quizResult.style.display = 'none';
        } else if (mode === 'plum') {
            viewPlum.style.display = 'block';
        } else if (mode === 'coin') {
            viewCoinDiv.style.display = 'block';
            if(typeof resetCoinDivination === 'function') resetCoinDivination();
        }
        window.scrollTo(0, 0); // Scroll to top on view switch
    }

    btnSortSeq.addEventListener('click', () => switchView('sequence', btnSortSeq));
    btnSortUpper.addEventListener('click', () => switchView('upper_trigram', btnSortUpper));
    btnLearn.addEventListener('click', () => switchView('learn', btnLearn));
    btnPlumBlossom.addEventListener('click', () => switchView('plum', btnPlumBlossom));
    const btnCoinDiv = document.getElementById('btn-coin-div');
    if(btnCoinDiv) btnCoinDiv.addEventListener('click', () => switchView('coin', btnCoinDiv));

    // ---- 1. Grid Rendering Logic ----
    function renderGrid() {
        gridContainer.innerHTML = '';
        
        if (currentMode === 'sequence') {
            const grid = document.createElement('div');
            grid.className = 'hexagram-grid';
            const sortedData = [...activeHexagramData].sort((a, b) => a.id - b.id);
            sortedData.forEach(hex => grid.appendChild(createCard(hex)));
            gridContainer.appendChild(grid);
        } else if (currentMode === 'upper_trigram') {
            trigramOrder.forEach(trigram => {
                const groupData = activeHexagramData.filter(h => h.upper === trigram);
                if (groupData.length === 0) return;
                const header = document.createElement('div');
                header.className = 'group-header';
                header.innerHTML = `<h3>上卦：${trigram}宮 (${groupData.length}卦)</h3>`;
                gridContainer.appendChild(header);

                const grid = document.createElement('div');
                grid.className = 'hexagram-grid';
                groupData.forEach(hex => grid.appendChild(createCard(hex)));
                gridContainer.appendChild(grid);
            });
        }
    }

    function createCard(hex) {
        const card = document.createElement('div');
        card.className = 'hex-card';
        card.dataset.id = hex.id;
        card.innerHTML = `
            <div class="card-symbol">${hex.symbol}</div>
            <div class="card-name">${hex.name}</div>
        `;
        card.addEventListener('click', () => openModal(hex));
        return card;
    }

    // ---- 2. Modal Logic ----
    function openModal(hexBase) {
        const hex = activeHexagramData.find(h => h.id === hexBase.id);
        if (!hex) return;

        modalSymbol.textContent = hex.symbol;
        modalName.textContent = hex.name;
        
        let links = hex.links || {};
        modalLinkStory.href = links.story || `https://www.google.com/search?q=${hex.name}+典故`;
        modalLinkClassic.href = links.classic || `https://www.google.com/search?q=${hex.name}+原文`;
        modalLinkModern.href = links.modern || `https://www.google.com/search?q=${hex.name}+解釋`;
        modalLinkYao.href = links.yao || `https://www.google.com/search?q=${hex.name}+爻辭`;
        
        if (hex.story && hex.story.trim() !== "") {
            modalStory.textContent = hex.story;
            sectionStory.style.display = "block";
        } else {
            sectionStory.style.display = "none";
        }

        document.getElementById('section-classic').style.display = "block";
        modalClassic.innerHTML = hex.classicText.replace(/\n/g, '<br>');
        
        document.getElementById('section-modern').style.display = "block";
        modalModern.textContent = hex.modernExplanation;
        
        if (hex.yaoText && hex.yaoText.trim() !== "") {
            modalYao.innerHTML = hex.yaoText.replace(/\n/g, '<br>');
            sectionYao.style.display = "block";
        } else {
            sectionYao.style.display = "none";
        }
        
        modalLink.href = hex.link || ("https://www.google.com/search?q=" + hex.name);

        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        // Modal reset scroll
        if(modalContentArea) modalContentArea.scrollTop = 0;
    }

    function closeModal() {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }

    closeModalBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && modal.classList.contains('active')) closeModal(); });

    // ---- Back to Top FAB ----
    window.addEventListener('scroll', () => {
        if (document.body.scrollTop > 300 || document.documentElement.scrollTop > 300) {
            btnBackToTop.style.display = "flex";
        } else {
            btnBackToTop.style.display = "none";
        }
    });

    btnBackToTop.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    btnBackToTop.style.display = "none";

    // ---- Quiz Game UI Logic ----
    // (Omitted most selectors for brevity, just handling necessary ones)
    const gameModeBtns = document.querySelectorAll('.game-mode-btn');
    const settingsG1G2 = document.getElementById('settings-g1g2');
    const settingsG3 = document.getElementById('settings-g3');
    const settingsG4 = document.getElementById('settings-g4');
    const settingsG5 = document.getElementById('settings-g5');
    const settingsG6 = document.getElementById('settings-g6');
    
    // Quiz Active DOM
    const progressEl = document.getElementById('quiz-progress');
    const scoreEl = document.getElementById('quiz-score');
    const questionContainer = document.getElementById('quiz-question-container');
    const optionsContainer = document.getElementById('quiz-options-container');
    
    // Game 3 specific DOM
    const drawingContainer = document.getElementById('quiz-drawing-container');
    const slotUpper = document.getElementById('slot-upper');
    const slotLower = document.getElementById('slot-lower');
    const trigramsPalette = document.getElementById('trigrams-palette');
    const btnSubmitDraw = document.getElementById('btn-submit-draw');
    let activeDrawSlot = null;

    // Game 5 specific DOM
    const fillContainer = document.getElementById('quiz-fill-container');
    const fillSlotsArea = document.getElementById('fill-slots-area');
    const fillPalette = document.getElementById('fill-palette');
    const btnSubmitFill = document.getElementById('btn-submit-fill');
    let activeFillSlot = null;

    // Feedback
    const feedbackEl = document.getElementById('quiz-feedback');
    const feedbackText = document.getElementById('feedback-text');
    const btnLearnMoreQuiz = document.getElementById('btn-learn-more-quiz');
    const btnNextQuestion = document.getElementById('btn-next-question');
    const btnStartQuiz = document.getElementById('btn-start-quiz');
    const btnRestartQuiz = document.getElementById('btn-restart-quiz');
    
    // Setup Controls
    const setupSubPairing = document.getElementById('setup-sub-pairing');
    const setupSubExpert = document.getElementById('setup-sub-expert');
    
    let quizConfig = { 
        game: 1, 
        g12Mode: 'sym2name', 
        g3Mode: 'name2draw',
        g3Pos: 'fixed',
        g4Q: 'sym', g4Dir: 'prev', g4Opt: 'sym',
        g5Blank: '1_any', g5OptShow: 'sym', g5Pos: 'fixed',
        g6Q: 'sym',
        count: 10 
    };
    let currentQuestions = [];
    let currentQuestionIndex = 0;
    let currentScore = 0;
    let canClickOption = true;
    let currentCorrectHex = null;

    gameModeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            gameModeBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            quizConfig.game = parseInt(btn.dataset.game);
            
            settingsG1G2.style.display = 'none';
            settingsG3.style.display = 'none';
            settingsG4.style.display = 'none';
            settingsG5.style.display = 'none';
            if (settingsG6) settingsG6.style.display = 'none';
            
            if (quizConfig.game === 1) {
                settingsG1G2.style.display = 'block';
                setupSubPairing.style.display = 'block';
                setupSubExpert.style.display = 'none';
                quizConfig.g12Mode = document.querySelector('#setup-sub-pairing .active').dataset.sub;
            } else if (quizConfig.game === 2) {
                settingsG1G2.style.display = 'block';
                setupSubPairing.style.display = 'none';
                setupSubExpert.style.display = 'block';
                quizConfig.g12Mode = document.querySelector('#setup-sub-expert .active').dataset.sub;
            } else if (quizConfig.game === 3) {
                settingsG3.style.display = 'block';
            } else if (quizConfig.game === 4) {
                settingsG4.style.display = 'block';
            } else if (quizConfig.game === 5) {
                settingsG5.style.display = 'block';
            } else if (quizConfig.game === 6) {
                if (settingsG6) settingsG6.style.display = 'block';
            }
        });
    });

    function bindBtnGroup(qs, callback) {
        document.querySelectorAll(qs).forEach(btn => {
            btn.addEventListener('click', () => {
                let siblings = btn.parentElement.querySelectorAll(btn.tagName.toLowerCase() + '.'+btn.classList[0]);
                siblings.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                callback(btn);
            });
        });
    }

    bindBtnGroup('.setup-sub-btn', (btn) => quizConfig.g12Mode = btn.dataset.sub);
    bindBtnGroup('.setup-g3-btn', (btn) => quizConfig.g3Mode = btn.dataset.sub);
    bindBtnGroup('.setup-g3-pos-btn', (btn) => quizConfig.g3Pos = btn.dataset.pos);
    bindBtnGroup('.setup-g4-q-btn', (btn) => quizConfig.g4Q = btn.dataset.val);
    bindBtnGroup('.setup-g4-dir-btn', (btn) => quizConfig.g4Dir = btn.dataset.val);
    bindBtnGroup('.setup-g4-opt-btn', (btn) => quizConfig.g4Opt = btn.dataset.val);
    bindBtnGroup('.setup-g5-blank-btn', (btn) => quizConfig.g5Blank = btn.dataset.val);
    bindBtnGroup('.setup-g5-opt-btn', (btn) => quizConfig.g5OptShow = btn.dataset.val);
    bindBtnGroup('.setup-g5-pos-btn', (btn) => quizConfig.g5Pos = btn.dataset.pos);
    bindBtnGroup('.setup-g6-q-btn', (btn) => quizConfig.g6Q = btn.dataset.val);
    bindBtnGroup('.setup-count-btn', (btn) => quizConfig.count = parseInt(btn.dataset.count));

    btnStartQuiz.addEventListener('click', () => {
        generateQuiz();
        quizGameSelection.style.display = 'none';
        quizSetup.style.display = 'none';
        quizActive.style.display = 'block';
        loadQuestion();
    });

    btnRestartQuiz.addEventListener('click', () => {
        quizResult.style.display = 'none';
        quizGameSelection.style.display = 'block';
        quizSetup.style.display = 'block';
    });

    function shuffle(array) {
        let currentIndex = array.length, randomIndex;
        while (currentIndex != 0) {
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex--;
            [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
        }
        return array;
    }

    function generateQuiz() {
        currentScore = 0;
        currentQuestionIndex = 0;
        currentQuestions = [];
        
        const sortedPool = [...activeHexagramData].sort((a, b) => a.id - b.id);
        const count = Math.min(quizConfig.count, sortedPool.length);

        for (let i = 0; i < count; i++) {
            let baseHex = sortedPool[Math.floor(Math.random() * sortedPool.length)];
            
            if (quizConfig.game === 1 || quizConfig.game === 2 || quizConfig.game === 3 || quizConfig.game === 6) {
                let incorrectPool = sortedPool.filter(h => h.id !== baseHex.id);
                shuffle(incorrectPool);
                let options = [baseHex, incorrectPool[0], incorrectPool[1]];
                shuffle(options);
                currentQuestions.push({ targetHex: baseHex, options: options });
            } 
            else if (quizConfig.game === 4) {
                let dir = quizConfig.g4Dir;
                if (dir === 'rand') dir = Math.random() > 0.5 ? 'prev' : 'next';
                let targetId;
                if (dir === 'next') targetId = (baseHex.id === 64) ? 1 : baseHex.id + 1;
                else targetId = (baseHex.id === 1) ? 64 : baseHex.id - 1;
                
                let targetHex = sortedPool.find(h => h.id === targetId);
                let incorrectPool = sortedPool.filter(h => h.id !== targetHex.id && h.id !== baseHex.id);
                shuffle(incorrectPool);
                let options = [targetHex, incorrectPool[0], incorrectPool[1]];
                shuffle(options);
                
                currentQuestions.push({ 
                    baseHex: baseHex, targetHex: targetHex, options: options, dir: dir,
                    qType: quizConfig.g4Q === 'rand' ? (Math.random()>0.5?'name':'sym') : quizConfig.g4Q,
                    optType: quizConfig.g4Opt === 'rand' ? (Math.random()>0.5?'name':'sym') : quizConfig.g4Opt
                });
            } else if (quizConfig.game === 5) {
                let hides = [];
                let blankRule = quizConfig.g5Blank; 
                let choices = ['1_upper', '1_lower', '1_any', '2'];
                
                // Pure hexagrams (乾為天、坤為地...) are forced into the single-blank pattern
                // so the quiz stays consistent with the "卦名填空" expectation.
                let isPure = baseHex.upper === baseHex.lower && baseHex.name.includes('為');
                
                if (isPure) {
                    hides = ['upper'];
                } else {
                    if (blankRule === 'rand') {
                        blankRule = choices[Math.floor(Math.random() * choices.length)];
                    }
                    
                    if (blankRule === '1_any') {
                        blankRule = Math.random() < 0.5 ? '1_upper' : '1_lower';
                    }

                    if (blankRule === '2') {
                        hides = ['upper', 'lower'];
                    } else if (blankRule === '1_upper') {
                        hides = ['upper'];
                    } else if (blankRule === '1_lower') {
                        hides = ['lower'];
                    }
                }
                currentQuestions.push({ targetHex: baseHex, hides: hides });
            }
        }
    }

    // --- GAME 3 DRAWING INTERACTION ---
    slotUpper.addEventListener('click', () => { activeDrawSlot = slotUpper; updateActiveSlotUI(); });
    slotLower.addEventListener('click', () => { activeDrawSlot = slotLower; updateActiveSlotUI(); });
    
    function updateActiveSlotUI() {
        slotUpper.classList.remove('active-slot');
        slotLower.classList.remove('active-slot');
        if(activeDrawSlot) activeDrawSlot.classList.add('active-slot');
    }

    function initDrawingPalette() {
        trigramsPalette.innerHTML = '';
        let playTrigrams = [...trigramsData];
        if (quizConfig.g3Pos === 'rand') {
            playTrigrams.sort(() => Math.random() - 0.5);
        }
        playTrigrams.forEach(t => {
            const btn = document.createElement('button');
            btn.className = 'trigram-btn';
            btn.innerHTML = `<span class="t-symbol" style="margin-bottom:0; font-size:2.5rem;">${t.symbol}</span>`;
            btn.addEventListener('click', () => {
                if(!activeDrawSlot || !canClickOption) return;
                activeDrawSlot.dataset.filled = t.name;
                activeDrawSlot.querySelector('.slot-content').textContent = t.symbol;
                activeDrawSlot.classList.add('filled');
                if(activeDrawSlot === slotUpper && slotLower.dataset.filled === "") {
                    activeDrawSlot = slotLower;
                    updateActiveSlotUI();
                } else {
                    activeDrawSlot = null;
                    updateActiveSlotUI();
                }
            });
            trigramsPalette.appendChild(btn);
        });
    }

    btnSubmitDraw.addEventListener('click', () => {
        if(!canClickOption) return;
        let u = slotUpper.dataset.filled;
        let l = slotLower.dataset.filled;
        if(u === "" || l === "") { alert("請先填滿上下卦！"); return; }
        
        let hex = currentCorrectHex;
        let isCorrect = (u === hex.upper && l === hex.lower);
        
        canClickOption = false;
        btnSubmitDraw.style.display = 'none'; // Fix: Hide submit button after grading
        
        if(isCorrect) {
            slotUpper.style.borderColor = "#10b981";
            slotLower.style.borderColor = "#10b981";
            currentScore += 10;
            scoreEl.textContent = `得分: ${currentScore}`;
            feedbackText.textContent = "正確！畫卦大師！";
            feedbackEl.className = "quiz-feedback correct-text";
        } else {
            slotUpper.style.borderColor = "#ef4444";
            slotLower.style.borderColor = "#ef4444";
            feedbackText.innerHTML = `錯誤！正確為：<br>上卦：${hex.upper}，下卦：${hex.lower} <br>（正確卦象：${hex.symbol} ${hex.name}）`;
            feedbackEl.className = "quiz-feedback wrong-text";
        }
        
        feedbackEl.style.display = 'block';
        btnNextQuestion.style.display = 'inline-block';
        btnLearnMoreQuiz.style.display = 'inline-block';
    });

    function loadQuestion() {
        canClickOption = true;
        feedbackEl.style.display = 'none';
        btnNextQuestion.style.display = 'none';
        btnLearnMoreQuiz.style.display = 'none';
        
        progressEl.textContent = `題目: ${currentQuestionIndex + 1} / ${currentQuestions.length}`;
        scoreEl.textContent = `得分: ${currentScore}`;

        const q = currentQuestions[currentQuestionIndex];
        currentCorrectHex = q.targetHex;
        const hex = q.targetHex;
        
        questionContainer.innerHTML = '';
        questionContainer.style.display = '';
        optionsContainer.innerHTML = '';
        optionsContainer.style.display = 'grid';
        drawingContainer.style.display = 'none';
        fillContainer.style.display = 'none';
        btnSubmitFill.style.display = 'none';

        if (quizConfig.game === 1 || quizConfig.game === 2) {
            let sub = quizConfig.g12Mode;
            if (quizConfig.game === 1) {
                if (sub === 'sym2name') questionContainer.innerHTML = `<div class="quiz-q-symbol">${hex.symbol}</div>`;
                else questionContainer.innerHTML = `<div class="quiz-q-name">${hex.name}</div>`;
            } else if (quizConfig.game === 2) {
                questionContainer.innerHTML = `<div class="quiz-q-text"><p class="quiz-excerpt">${hex.classicText}</p></div>`;
            }
            
            q.options.forEach((optHex) => {
                const btn = document.createElement('button');
                btn.className = 'quiz-option';
                
                if (quizConfig.game === 1) {
                    if (sub === 'sym2name') btn.textContent = optHex.name;
                    else btn.innerHTML = `<span class="opt-symbol">${optHex.symbol}</span>`;
                } else {
                    if (sub === 'text2name') btn.textContent = optHex.name;
                    else btn.innerHTML = `<span class="opt-symbol">${optHex.symbol}</span>`;
                }
                btn.addEventListener('click', () => selectAnswer(btn, optHex.id === hex.id, hex));
                optionsContainer.appendChild(btn);
            });
        } 
        else if (quizConfig.game === 3) {
            optionsContainer.style.display = 'none';
            drawingContainer.style.display = 'flex';
            btnSubmitDraw.style.display = 'block'; // Ensure it's back
            
            if(quizConfig.g3Mode === 'name2draw') {
                questionContainer.innerHTML = `<div class="quiz-q-name">${hex.name}</div>`;
            } else {
                questionContainer.innerHTML = `<div class="quiz-q-text"><p class="quiz-excerpt">${hex.modernExplanation}</p></div>`;
            }
            
            slotUpper.dataset.filled = "";
            slotUpper.querySelector('.slot-content').textContent = "";
            slotUpper.classList.remove('filled');
            slotUpper.style.borderColor = "";
            slotLower.dataset.filled = "";
            slotLower.querySelector('.slot-content').textContent = "";
            slotLower.classList.remove('filled');
            slotLower.style.borderColor = "";
            
            activeDrawSlot = slotUpper;
            updateActiveSlotUI();
            initDrawingPalette();
        }
        else if (quizConfig.game === 4) {
            let dirText = q.dir === 'prev' ? "上一卦" : "下一卦";
            let baseText = q.qType === 'name' ? q.baseHex.name : q.baseHex.symbol;
            
            questionContainer.innerHTML = `
                <div class="quiz-q-text" style="text-align:center;">
                    <h2 style="font-size: 2rem; color: var(--accent-gold);">${baseText}</h2>
                    <p style="font-size: 1.2rem; margin-top: 10px;">的 <b>${dirText}</b> 是？</p>
                </div>
            `;
            
            q.options.forEach((optHex) => {
                const btn = document.createElement('button');
                btn.className = 'quiz-option';
                
                if (q.optType === 'name') btn.textContent = optHex.name;
                else btn.innerHTML = `<span class="opt-symbol">${optHex.symbol}</span>`;
                btn.addEventListener('click', () => selectAnswer(btn, optHex.id === hex.id, hex));
                optionsContainer.appendChild(btn);
            });
        } else if (quizConfig.game === 5) {
            optionsContainer.style.display = 'none';
            drawingContainer.style.display = 'none';
            questionContainer.style.display = 'none';
            fillContainer.style.display = 'flex';
            btnSubmitFill.style.display = 'block';

            questionContainer.innerHTML = '';
            fillSlotsArea.innerHTML = '';
            
            // Game 5: build the visible "hexagram name" part for the fill layout.
            // Pure hexagrams need special handling because they contain "為" in the name.
            let displayName = hex.name;
            if(hex.upper === hex.lower && displayName.includes('為')) {
                // For pure hexagrams, keep the "為X" structure and hide only the leading trigram.
                displayName = displayName.split('為')[0];
				console.log("displayName:"+displayName);
            } else {
                // For non-pure hexagrams, strip the trigram names and keep the remaining character.
                let temp = displayName;
                temp = temp.replace(hex.upper, '');
                temp = temp.replace(hex.lower, '');
                displayName = temp;
            }
            
            // In the original trigram dataset, the rendered labels use the trigram elements
            // ("天", "地", "水", ...) rather than the raw trigram names ("乾", "坤", ...).
            const pureMap = {
                '乾': '天', '坤': '地', '坎': '水', '離': '火',
                '震': '雷', '巽': '風', '艮': '山', '兌': '澤'
            };
            let upperAttr = pureMap[hex.upper] || hex.upper;
            let lowerAttr = pureMap[hex.lower] || hex.lower;

            let parts = [
                { id: 'upper', val: upperAttr, label: '上卦' },
                { id: 'lower', val: lowerAttr, label: '下卦' },
                { id: 'name', val: displayName, label: '卦名' }
            ];

            parts.forEach(p => {
                let wrapper = document.createElement('div');
                wrapper.style.display = 'flex';
                wrapper.style.flexDirection = 'column';
                wrapper.style.alignItems = 'center';
                wrapper.style.margin = '0 10px';
                
                let label = document.createElement('div');
                label.textContent = p.label;
                label.style.fontSize = '1.3rem';
                label.style.color = p.id === 'name' ? 'transparent' : 'var(--text-muted)';
                label.style.marginBottom = '12px';
                
                let div = document.createElement('div');
                if (p.id === 'name') {
                    div.className = 'fill-text';
                    div.textContent = p.val;
                    div.style.lineHeight = '80px';
                    div.style.fontSize = '3rem';
                } else {
                    if (q.hides.includes(p.id)) {
                        div.className = 'slot-box';
                        div.style.width = '80px'; div.style.height = '80px'; 
                        div.dataset.target = p.val; 
                        div.dataset.filled = '';
                        div.innerHTML = `<span class="slot-content" style="font-size:2.2rem; line-height:80px; margin-top:0;"></span>`;
                        div.addEventListener('click', () => {
                            if(!canClickOption) return;
                            document.querySelectorAll('#fill-slots-area .slot-box').forEach(s => s.classList.remove('active-slot'));
                            div.classList.add('active-slot');
                            activeFillSlot = div;
                        });
                    } else {
                        div.className = 'fill-text';
                        div.textContent = p.val;
                        div.style.lineHeight = '80px';
                        div.style.fontSize = '3rem';
                    }
                }
                wrapper.appendChild(label);
                wrapper.appendChild(div);
                fillSlotsArea.appendChild(wrapper);
            });

            let firstSlot = fillSlotsArea.querySelector('.slot-box');
            if (firstSlot) {
                firstSlot.classList.add('active-slot');
                activeFillSlot = firstSlot;
            }

            fillPalette.innerHTML = '';
            let playTrigrams = [...trigramsData];
            if (quizConfig.g5Pos === 'rand') playTrigrams.sort(() => Math.random() - 0.5);

            playTrigrams.forEach(t => {
                const btn = document.createElement('button');
                btn.className = 'trigram-btn';
                if (quizConfig.g5OptShow === 'sym') {
                    btn.innerHTML = `<span class="t-symbol" style="margin-bottom:0; font-size:2rem;">${t.symbol}</span>`;
                } else {
                    btn.innerHTML = `<span style="font-size:1.5rem; font-weight:bold;">${t.name}</span>`;
                }
                
                btn.addEventListener('click', () => {
                    if(!activeFillSlot || !canClickOption) return;
                    activeFillSlot.dataset.filled = t.name;
                    activeFillSlot.querySelector('.slot-content').textContent = t.name;
                    activeFillSlot.classList.add('filled');
                    
                    let emptySlots = Array.from(fillSlotsArea.querySelectorAll('.slot-box')).filter(s => s.dataset.filled === '');
                    if(emptySlots.length > 0) {
                        document.querySelectorAll('#fill-slots-area .slot-box').forEach(s => s.classList.remove('active-slot'));
                        emptySlots[0].classList.add('active-slot');
                        activeFillSlot = emptySlots[0];
                    } else {
                        activeFillSlot.classList.remove('active-slot');
                        activeFillSlot = null;
                    }
                });
                fillPalette.appendChild(btn);
            });
        } else if (quizConfig.game === 6) {
            optionsContainer.style.display = 'grid';
            drawingContainer.style.display = 'none';
            questionContainer.style.display = '';
            fillContainer.style.display = 'none';
            if (btnSubmitFill) btnSubmitFill.style.display = 'none';

            const sub = quizConfig.g6Q;
            if (sub === 'sym') {
                questionContainer.innerHTML = `<div class="quiz-q-symbol" style="font-size: 8rem;">${hex.symbol}</div>`;
            } else {
                // Game 6 "name fill" uses the same upper/lower label mapping.
                // The blank is appended at the end, so the user sees a partial name prompt.
                const pureMap = {
                    '乾': '天', '坤': '地', '坎': '水', '離': '火',
                    '震': '雷', '巽': '風', '艮': '山', '兌': '澤'
                };
                let upperAttr = pureMap[hex.upper] || hex.upper;
                let lowerAttr = pureMap[hex.lower] || hex.lower;
				
				console.log("upperAttr:"+upperAttr+"/lowerAttr:"+lowerAttr);
                questionContainer.innerHTML = `<div class="quiz-q-name" style="font-size: 3.5rem;">${upperAttr}${lowerAttr}__</div>`;
            }

            q.options.forEach((optHex) => {
                const btn = document.createElement('button');
                btn.className = 'quiz-option';
                
                // Answer buttons only show the part that is being tested.
                // Pure hexagrams use the leading trigram (乾 / 坤 / ...), while others use the final character.
                let backName = optHex.name.includes('為') ? optHex.name.split('為')[0] : optHex.name.substring(2);
                btn.textContent = backName;
                
                btn.addEventListener('click', () => selectAnswer(btn, optHex.id === hex.id, hex));
                optionsContainer.appendChild(btn);
            });
        }
    }

    function selectAnswer(btn, isCorrect, correctHex) {
        if (!canClickOption) return;
        canClickOption = false;

        const allOptionBtns = optionsContainer.querySelectorAll('.quiz-option');
        allOptionBtns.forEach(b => b.classList.add('disabled'));

        if (isCorrect) {
            btn.classList.add('correct');
            currentScore += 10;
            scoreEl.textContent = `得分: ${currentScore}`;
            if (quizConfig.game === 6 && quizConfig.g6Q === 'name') {
                feedbackText.innerHTML = `正確！答案是：${correctHex.name} <span style="font-size:1.8rem;">${correctHex.symbol}</span>`;
            } else {
                feedbackText.textContent = "正確！";
            }
            feedbackEl.className = "quiz-feedback correct-text";
        } else {
            btn.classList.add('wrong');
            feedbackText.textContent = `錯誤！正確答案是：${correctHex.name} ${correctHex.symbol}`;
            feedbackEl.className = "quiz-feedback wrong-text";
            
            // Re-enable and highlight the correct answer button after an incorrect pick.
            allOptionBtns.forEach(b => {
                let backName = correctHex.name.includes('為') ? correctHex.name.split('為')[0] : correctHex.name.substring(2);
                if(b.textContent.includes(correctHex.name) || b.innerHTML.includes(correctHex.symbol) || b.textContent.trim() === backName) {
                   b.classList.remove('disabled');
                   b.classList.add('correct');
                   b.classList.add('disabled');
                }
            });
        }

        feedbackEl.style.display = 'block';
        btnNextQuestion.style.display = 'inline-block';
        btnLearnMoreQuiz.style.display = 'inline-block';
    }
    
    btnLearnMoreQuiz.addEventListener('click', () => openModal(currentCorrectHex));

    btnNextQuestion.addEventListener('click', () => {
        currentQuestionIndex++;
        if (currentQuestionIndex < currentQuestions.length) loadQuestion();
        else showResult();
    });

    if(btnSubmitFill) {
        btnSubmitFill.addEventListener('click', () => {
            if(!canClickOption) return;
            let slots = fillSlotsArea.querySelectorAll('.slot-box');
            let isAllFilled = Array.from(slots).every(s => s.dataset.filled !== '');
            if(!isAllFilled) { alert("請先填滿所有空格！"); return; }
            
            canClickOption = false;
            btnSubmitFill.style.display = 'none';
            
            let isCorrect = Array.from(slots).every(s => s.dataset.filled === s.dataset.target);
            let fullHexText = `整體的卦象為：${currentCorrectHex.symbol} ${currentCorrectHex.name} <br>（上卦：${currentCorrectHex.upper}、下卦：${currentCorrectHex.lower}）`;
            
            if(isCorrect) {
                slots.forEach(s => s.style.borderColor = "#10b981");
                currentScore += 10;
                scoreEl.textContent = `得分: ${currentScore}`;
                feedbackText.innerHTML = `正確！填寫無誤！<br>${fullHexText}`;
                feedbackEl.className = "quiz-feedback correct-text";
            } else {
                slots.forEach(s => s.style.borderColor = "#ef4444");
                feedbackText.innerHTML = `錯誤！<br>${fullHexText}`;
                feedbackEl.className = "quiz-feedback wrong-text";
            }
            
            feedbackEl.style.display = 'block';
            btnNextQuestion.style.display = 'inline-block';
            btnLearnMoreQuiz.style.display = 'inline-block';
        });
    }

    function showResult() {
        quizActive.style.display = 'none';
        quizResult.style.display = 'block';
        
        let maxScore = currentQuestions.length * 10;
        document.getElementById('final-score-display').textContent = `${currentScore} / ${maxScore}`;
    }

    // ==========================================
    // 梅花易數 (Plum Blossom Divination)
    // ==========================================
    const tabPbTime = document.getElementById('tab-pb-time');
    const tabPbNumber = document.getElementById('tab-pb-number');
    const pbResultArea = document.getElementById('pb-result-area');
    const btnCastPlum = document.getElementById('btn-cast-plum');
    let plumMode = 'time';

    tabPbTime.addEventListener('click', () => {
        plumMode = 'time';
        tabPbTime.classList.add('active');
        tabPbNumber.classList.remove('active');
        document.getElementById('pb-mode-time').style.display = 'flex';
        document.getElementById('pb-mode-number').style.display = 'none';
        pbResultArea.style.display = 'none';
    });
    
    tabPbNumber.addEventListener('click', () => {
        plumMode = 'number';
        tabPbNumber.classList.add('active');
        tabPbTime.classList.remove('active');
        document.getElementById('pb-mode-number').style.display = 'flex';
        document.getElementById('pb-mode-time').style.display = 'none';
        pbResultArea.style.display = 'none';
    });

    // 設定預設日期時間為現在
    const dtInput = document.getElementById('pb-datetime');
    if (dtInput) {
        let now = new Date();
        now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
        dtInput.value = now.toISOString().slice(0,16);
    }

    const btnClearQuestion = document.getElementById('btn-clear-question');
    if(btnClearQuestion) {
        btnClearQuestion.addEventListener('click', () => {
            document.getElementById('pb-question').value = '';
        });
    }

    let lastPbResult = null; // 儲存最後一次起卦資料供 AI 提示詞產生器使用

    const plumMap = {
        1: { name: '天', element: '金' },
        2: { name: '澤', element: '金' },
        3: { name: '火', element: '火' },
        4: { name: '雷', element: '木' },
        5: { name: '風', element: '木' },
        6: { name: '水', element: '水' },
        7: { name: '山', element: '土' },
        8: { name: '地', element: '土' }
    };

    const binTrigram = { "111":"天", "110":"澤", "101":"火", "100":"雷", "011":"風", "010":"水", "001":"山", "000":"地" };
    const trigramBin = { "天":"111", "澤":"110", "火":"101", "雷":"100", "風":"011", "水":"010", "山":"001", "地":"000" };

    function getRelation(bodyE, useE) {
        if (bodyE === useE) return { rel: '比和', desc: '大吉 (同心協力，平順如意，相得益彰)' };
        const generates = { '金':'水', '水':'木', '木':'火', '火':'土', '土':'金' };
        const destroys = { '金':'木', '木':'土', '土':'水', '水':'火', '火':'金' };
        if (generates[bodyE] === useE) return { rel: '體生用 (洩氣)', desc: '平凶 (自身付出較多，精氣損耗，需承擔代價)' };
        if (generates[useE] === bodyE) return { rel: '用生體 (得生)', desc: '大吉 (天助天賜，有貴人相助，事半功倍)' };
        if (destroys[bodyE] === useE) return { rel: '體剋用 (偏吉)', desc: '偏吉 (事情雖有阻力，但只要努力終能掌控局勢)' };
        if (destroys[useE] === bodyE) return { rel: '用剋體 (大凶)', desc: '凶險 (外部阻礙極大，不順利，需防範損失)' };
        return { rel: '未知', desc: '' };
    }

    btnCastPlum.addEventListener('click', () => {
        let n1, n2, sum;
        let dtVal = "";
        if (plumMode === 'time') {
            dtVal = document.getElementById('pb-datetime').value;
            const dt = dtVal ? new Date(dtVal) : new Date();
            
            const pbYear = (dt.getFullYear() - 3) % 12 || 12; // 地支轉換
            const pbMonth = dt.getMonth() + 1; // 1~12
            const pbDay = dt.getDate(); // 1~31
            const pbHour = Math.floor(((dt.getHours() + 1) % 24) / 2) + 1; // 地支時間
            
            n1 = pbYear + pbMonth + pbDay;
            n2 = n1 + pbHour;
            sum = n2;
        } else {
            n1 = parseInt(document.getElementById('pb-num1').value) || 8;
            n2 = parseInt(document.getElementById('pb-num2').value) || 8;
            sum = n1 + n2;
        }

        let uNum = n1 % 8; if (uNum === 0) uNum = 8;
        let lNum = n2 % 8; if (lNum === 0) lNum = 8;
        let changeYao = sum % 6; if (changeYao === 0) changeYao = 6;

        let uName = plumMap[uNum].name;
        let lName = plumMap[lNum].name;

        // Base Hex
        let hexBase = activeHexagramData.find(h => h.upper === uName && h.lower === lName);
        if (!hexBase) { alert("無法尋獲本卦，資料異常！"); return; }

        let isUpperBody = (changeYao <= 3); // Lower has changing yao => Upper is Body
        let bodyNum = isUpperBody ? uNum : lNum;
        let useNumBase = isUpperBody ? lNum : uNum;

        // Mutual Hex
        let baseBin = trigramBin[lName] + trigramBin[uName]; // Bottom to Top
        let mLowerBin = baseBin[1] + baseBin[2] + baseBin[3];
        let mUpperBin = baseBin[2] + baseBin[3] + baseBin[4];
        let mLowerName = binTrigram[mLowerBin];
        let mUpperName = binTrigram[mUpperBin];
        let hexMutual = activeHexagramData.find(h => h.upper === mUpperName && h.lower === mLowerName);

        // Transformed Hex
        let tIndex = changeYao - 1;
        let transArr = baseBin.split('');
        transArr[tIndex] = transArr[tIndex] === '1' ? '0' : '1';
        let transBin = transArr.join('');
        let tLowerName = binTrigram[transBin.substring(0,3)];
        let tUpperName = binTrigram[transBin.substring(3,6)];
        let hexTransform = activeHexagramData.find(h => h.upper === tUpperName && h.lower === tLowerName);

        // Render Cards
        function setPbCard(id, hexBaseParam) {
            let el = document.getElementById(id);
            el.querySelector('.pb-hex-sym').textContent = hexBaseParam.symbol;
            el.querySelector('.pb-hex-name').textContent = hexBaseParam.name;
            
            // Add click listener
            el.onclick = () => openModal(hexBaseParam);
        }
        setPbCard('pb-base-card', hexBase);
        setPbCard('pb-mutual-card', hexMutual);
        setPbCard('pb-transform-card', hexTransform);

        // Analysis
        let elBody = plumMap[bodyNum].element;
        let elUseBase = plumMap[useNumBase].element;

        // Figure out Mutual and Transformed Use elements
        let tUseName = isUpperBody ? tLowerName : tUpperName;
        let tUseMapEntry = Object.values(plumMap).find(t => t.name === tUseName);
        let elUseTrans = tUseMapEntry.element;
        
        let elMutBody = Object.values(plumMap).find(t => t.name === (isUpperBody ? mUpperName : mLowerName)).element;
        let elMutUse = Object.values(plumMap).find(t => t.name === (isUpperBody ? mLowerName : mUpperName)).element;

        let rel1 = getRelation(elBody, elUseBase);
        let rel2 = getRelation(elMutBody, elMutUse);
        let rel3 = getRelation(elBody, elUseTrans);

        let bodyTrigName = plumMap[bodyNum].name;
        let useBaseName = plumMap[useNumBase].name;

        // Content Links
        let qTiYong = encodeURIComponent('梅花易數 體用判定');
        let qWuXing = encodeURIComponent('梅花易數 五行關係');
        let qRel1 = encodeURIComponent('梅花易數 ' + rel1.rel);
        let qRel2 = encodeURIComponent('梅花易數 ' + rel2.rel);
        let qRel3 = encodeURIComponent('梅花易數 ' + rel3.rel);

        document.getElementById('pb-analysis-content').innerHTML = `
            <p style="margin-bottom:10px;">1. <b>起卦分析</b>：得 <a href="https://www.google.com/search?q=${encodeURIComponent('梅花易數 ' + hexBase.name)}" target="_blank" style="color:var(--accent-gold); text-decoration:underline;">${hexBase.name}</a>，動爻在第 ${changeYao} 爻。</p>
            <p style="margin-bottom:10px;">2. <b><a href="https://www.google.com/search?q=${qTiYong}" target="_blank" style="color:#60a5fa; text-decoration:underline;">體用判定</a></b>：體卦(主)為 <b>${bodyTrigName} (${elBody})</b>，用卦(客)為 <b>${useBaseName} (${elUseBase})</b>。</p>
            <hr style="border:0; border-top:1px dashed rgba(255,255,255,0.2); margin: 15px 0;">
            <p style="margin-bottom:10px;">3. <b>【起點】體用與本卦</b>：<br><a href="https://www.google.com/search?q=${qWuXing}" target="_blank" style="color:#60a5fa; text-decoration:underline;">五行關係</a>：<a href="https://www.google.com/search?q=${qRel1}" target="_blank" style="color:#10b981; font-weight:bold; text-decoration:underline;">${rel1.rel}</a>。<br>解析：${rel1.desc}</p>
            <p style="margin-bottom:10px;">4. <b>【過程】體用與互卦</b>：<br><a href="https://www.google.com/search?q=${qWuXing}" target="_blank" style="color:#60a5fa; text-decoration:underline;">五行關係</a>：<a href="https://www.google.com/search?q=${qRel2}" target="_blank" style="color:#10b981; font-weight:bold; text-decoration:underline;">${rel2.rel}</a>。<br>解析：${rel2.desc}</p>
            <p style="margin-bottom:10px;">5. <b>【結果】體用與變卦</b>：<br>變卦用卦為 ${tUseName} (${elUseTrans})。<br><a href="https://www.google.com/search?q=${qWuXing}" target="_blank" style="color:#60a5fa; text-decoration:underline;">五行關係</a>：<a href="https://www.google.com/search?q=${qRel3}" target="_blank" style="color:#a78bfa; font-weight:bold; text-decoration:underline;">${rel3.rel}</a>。<br>解析：${rel3.desc}</p>
        `;

        // 儲存 AI Prompt 參數
        let qText = document.getElementById('pb-question') ? document.getElementById('pb-question').value : "";
        let tzSelect = document.getElementById('pb-timezone');
        let tzStr = "";
        if(tzSelect) {
            if(tzSelect.value === 'detect') {
                const tzOffset = -(new Date().getTimezoneOffset() / 60);
                tzStr = "UTC" + (tzOffset >= 0 ? "+" + tzOffset : tzOffset);
                if (tzOffset === 8) tzStr = "台北/北京時間 (UTC+8)";
            } else {
                tzStr = tzSelect.options[tzSelect.selectedIndex].text;
            }
        }
        
        lastPbResult = {
            mode: plumMode,
            qText: qText,
            tzStr: tzStr,
            timeStr: dtVal,
            n1: n1,
            n2: n2,
            base: hexBase.name,
            mutual: hexMutual.name,
            transform: hexTransform.name,
            analysisRaw: `【起點】體用與本卦：五行關係：${rel1.rel}。解析：${rel1.desc} | 【過程】體用與互卦：五行關係：${rel2.rel}。解析：${rel2.desc} | 【結果】體用與變卦：五行關係：${rel3.rel}。解析：${rel3.desc}`
        };

        pbResultArea.style.display = 'block';
        window.scrollBy({ top: 300, behavior: 'smooth' });
    });
    
    // AI Prompt Generator Controls
    const btnAiPrompt = document.getElementById('btn-ai-prompt');
    const aiPromptModal = document.getElementById('ai-prompt-modal');
    const aiPromptClose = document.getElementById('ai-prompt-close');
    const btnGenPrompt = document.getElementById('btn-generate-prompt');
    const btnCopyPrompt = document.getElementById('btn-copy-prompt');
    const promptInputQ = document.getElementById('ai-prompt-question');
    const promptInputName = document.getElementById('ai-prompt-name');
    const promptOutput = document.getElementById('ai-prompt-output');
    const promptResultArea = document.getElementById('ai-prompt-result-area');

    if(btnAiPrompt) {
        btnAiPrompt.addEventListener('click', () => {
            if(!lastPbResult) return;
            promptInputQ.value = lastPbResult.qText || "";
            promptResultArea.style.display = 'none';
            window.activePromptMode = 'plum'; // ensure plum blossom uses normal mode
            aiPromptModal.classList.add('active'); // Use existing active logic
            aiPromptModal.style.display = 'flex';
        });

        aiPromptClose.addEventListener('click', () => {
            aiPromptModal.classList.remove('active');
            aiPromptModal.style.display = 'none';
        });
        
        // Ensure clicking outside closes modal
        aiPromptModal.addEventListener('click', (e) => {
            if (e.target === aiPromptModal) {
                aiPromptModal.classList.remove('active');
                aiPromptModal.style.display = 'none';
            }
        });

        btnGenPrompt.addEventListener('click', () => {
            let name = promptInputName.value.trim() || '我';
            let qText = promptInputQ.value.trim();
            if(!qText) qText = "無特定問題(看整體運勢)";
            
            let resultText = "";
            
            if (window.activePromptMode === 'coin') {
                if(!window.lastCdResult) return;
                resultText = `【${name}】的問題是【${qText}】，使用硬幣起卦得到：本卦－【${window.lastCdResult.base}】，變卦－【${window.lastCdResult.transform}】，起卦結果：【${window.lastCdResult.resultLine}】，請再依照硬幣起卦的概念（你是硬幣起卦的大師）再幫我詳細分析與解釋`;
            } else {
                if(!lastPbResult) return;
                let analText = lastPbResult.analysisRaw;

                if(lastPbResult.mode === 'time') {
                    let d = new Date(lastPbResult.timeStr || new Date());
                    let y = d.getFullYear();
                    let m = d.getMonth() + 1;
                    let day = d.getDate();
                    let h = d.getHours();
                    let min = d.getMinutes();
                    resultText = `現在是【${lastPbResult.tzStr}】時間，【${y}】年【${m}】月【${day}】日【${h}】點【${min}】分，【${name}】的問題是【${qText}】，已用梅花易數推算出：本卦－【${lastPbResult.base}】，互卦－【${lastPbResult.mutual}】，變卦－【${lastPbResult.transform}】，起卦分析：【${analText}】，請再依照梅花易數的概念（你是梅花易數的大師）再幫我詳細分析與解釋`;
                } else {
                    resultText = `【${name}】的問題是【${qText}】，使用梅花易數的數字起卦，第一數是【${lastPbResult.n1}】，第二數是【${lastPbResult.n2}】，並推算出：本卦－【${lastPbResult.base}】，互卦－【${lastPbResult.mutual}】，變卦－【${lastPbResult.transform}】，起卦分析：【${analText}】，請再依照梅花易數的概念（你是梅花易數的大師）再幫我詳細分析與解釋`;
                }
            }
            
            promptOutput.value = resultText;
            promptResultArea.style.display = 'block';
        });

        btnCopyPrompt.addEventListener('click', () => {
            promptOutput.select();
            document.execCommand('copy');
            let origTxt = btnCopyPrompt.innerHTML;
            btnCopyPrompt.innerHTML = "已複製！✅";
            setTimeout(() => btnCopyPrompt.innerHTML = origTxt, 2000);
        });
    }

    // ==========================================
    // 硬幣起卦 (Coin Divination)
    // ==========================================
    const btnShakeCoin = document.getElementById('btn-shake-coin');
    const btnResetCoin = document.getElementById('btn-reset-coin');
    const cdLinesArea = document.getElementById('cd-lines-area');
    const cdLinesList = document.getElementById('cd-lines-list');
    const cdResultArea = document.getElementById('cd-result-area');
    const cdShakeNum = document.getElementById('cd-shake-num');
    const cdProgress = document.getElementById('cd-progress');
    const cdNameInput = document.getElementById('cd-name');
    const cdQuestionInput = document.getElementById('cd-question');

    let coinShakes = []; // Store the value (6,7,8,9) of each line. index 0 is line 1.
    
    // Helper to clear Coin Div
    window.resetCoinDivination = function() {
        coinShakes = [];
        cdLinesList.innerHTML = '';
        cdLinesArea.style.display = 'none';
        cdResultArea.style.display = 'none';
        cdShakeNum.textContent = '1';
        cdProgress.style.display = 'block';
        btnShakeCoin.style.display = 'inline-block';
        btnShakeCoin.innerHTML = '開始搖卦 <span class="arrow">🪙</span>';
        btnResetCoin.style.display = 'none';
    };

    if(btnResetCoin) {
        btnResetCoin.addEventListener('click', () => {
             window.resetCoinDivination();
             cdNameInput.value = '';
             cdQuestionInput.value = '';
        });
    }

    if(btnShakeCoin) {
        btnShakeCoin.addEventListener('click', () => {
            if(coinShakes.length >= 6) return;

            cdLinesArea.style.display = 'block';

            // Toss 3 coins: 0 for Heads (字，2分), 1 for Tails (背，3分)
            const c1 = Math.random() > 0.5 ? 1 : 0;
            const c2 = Math.random() > 0.5 ? 1 : 0;
            const c3 = Math.random() > 0.5 ? 1 : 0;
            
            // Value calculation: Heads = 2, Tails = 3
            const val1 = c1 === 0 ? 2 : 3;
            const val2 = c2 === 0 ? 2 : 3;
            const val3 = c3 === 0 ? 2 : 3;
            const sum = val1 + val2 + val3; 

            coinShakes.push(sum);
            
            const lineNum = coinShakes.length;
            
            // Generate HTML for the row
            const labelMap = {6: '老陰 (變陽) ✖', 7: '少陽 (不變) ⚊', 8: '少陰 (不變) ⚋', 9: '老陽 (變陰) ◯'};
            const colorMap = {6: '#f43f5e', 7: '#10b981', 8: '#6366f1', 9: '#f59e0b'};
            
            const renderCoin = (c) => {
                const text = c === 0 ? '字' : '背';
                const cClass = c === 0 ? 'head' : 'tail';
                return `<div class="cd-coin ${cClass}">${text}</div>`;
            };

            const rowStr = `
                <div class="cd-line-row active" style="border-left-color: ${colorMap[sum]};">
                    <div class="cd-line-label">第 ${lineNum} 爻</div>
                    <div class="cd-coins">
                        ${renderCoin(c1)}
                        ${renderCoin(c2)}
                        ${renderCoin(c3)}
                    </div>
                    <div class="cd-line-result" style="color: ${colorMap[sum]}">${labelMap[sum]}</div>
                </div>
            `;
            
            // Remove active class from previous
            document.querySelectorAll('.cd-line-row.active').forEach(el => el.classList.remove('active'));
            
            cdLinesList.insertAdjacentHTML('afterbegin', rowStr);

            if(coinShakes.length < 6) {
                cdShakeNum.textContent = coinShakes.length + 1;
                btnShakeCoin.innerHTML = `搖第 ${coinShakes.length + 1} 爻 <span class="arrow">🪙</span>`;
            } else {
                cdProgress.style.display = 'none';
                btnShakeCoin.style.display = 'none';
                btnResetCoin.style.display = 'inline-block';
                showCoinResult();
            }
        });
    }

    function showCoinResult() {
        const lineNames = { 0: "初", 1: "二", 2: "三", 3: "四", 4: "五", 5: "上" };
        
        // Base Hexagram logic
        // sum: 6=yin, 7=yang, 8=yin, 9=yang
        let baseBin = coinShakes.map(sum => (sum === 7 || sum === 9) ? '1' : '0').reverse().join(''); // Upper to Lower
        
        let bLowerName = binTrigram[baseBin.substring(3, 6)]; // Bottom 3 bits (in reversed string, first 3 is Upper, last 3 is Lower)
        let bUpperName = binTrigram[baseBin.substring(0, 3)]; 
        let hexBase = activeHexagramData.find(h => h.upper === bUpperName && h.lower === bLowerName);

        // Transformed Hexagram logic
        // sum: 6=yang(transformed), 7=yang, 8=yin, 9=yin(transformed)
        let transBin = coinShakes.map(sum => {
            if(sum === 6) return '1'; // changed to yang
            if(sum === 9) return '0'; // changed to yin
            return (sum === 7) ? '1' : '0';
        }).reverse().join('');
        
        let tLowerName = binTrigram[transBin.substring(3, 6)];
        let tUpperName = binTrigram[transBin.substring(0, 3)];
        let hexTransform = activeHexagramData.find(h => h.upper === tUpperName && h.lower === tLowerName);

        let changingLines = [];
        coinShakes.forEach((sum, idx) => {
            if(sum === 6 || sum === 9) changingLines.push(idx);
        });

        // UI Updates
        let uName = cdNameInput.value.trim() || "卜卦者";
        let uQuestion = cdQuestionInput.value.trim();
        document.getElementById('cd-result-name-display').textContent = `( ${uName} )`;
        if (uQuestion) {
            document.getElementById('cd-result-question-display').textContent = `所問之事：「${uQuestion}」`;
        } else {
            document.getElementById('cd-result-question-display').textContent = "";
        }

        const setCdCard = (id, hexData) => {
            let el = document.getElementById(id);
            el.querySelector('.pb-hex-sym').textContent = hexData.symbol;
            el.querySelector('.pb-hex-name').textContent = hexData.name;
            el.onclick = () => openModal(hexData);
        };

        setCdCard('cd-base-card', hexBase);
        setCdCard('cd-transform-card', hexTransform);

        let analysisText = `<p style="margin-bottom:10px;"><b>起卦結果</b>：您占得了本卦 <b>${hexBase.name}</b>。</p>`;
        let simpleResultText = "";
        
        if(changingLines.length === 0) {
            simpleResultText = `無動爻（六爻皆靜）`;
            analysisText += `<p style="margin-bottom:10px;"><b>卦意</b>：無動爻（六爻皆靜），代表事情目前處於穩定的狀態，未來變化不大。請參考本卦的「卦辭」與整體卦象來探討。</p>`;
        } else {
            analysisText += `<p style="margin-bottom:10px;"><b>變化的引導</b>：變卦為 <b>${hexTransform.name}</b>。</p>`;
            let linesInfo = changingLines.map(idx => `第 ${idx + 1} 爻（${lineNames[idx]}爻）`).join('、');
            simpleResultText = `共有 ${changingLines.length} 個動爻，分別在 ${linesInfo}`;
            
            analysisText += `<p style="margin-bottom:10px;"><b>動爻</b>：${simpleResultText}。傳統解卦上：</p><ul style="margin-left:20px; margin-bottom:10px; color:var(--text-muted); line-height:1.6;">`;
            
            if(changingLines.length === 1) {
                analysisText += `<li>只有一爻動：以本卦的這一爻「爻辭」作為主要依據。</li>`;
            } else if(changingLines.length === 2) {
                analysisText += `<li>兩爻動：以本卦的這兩爻「爻辭」為依據，但以上面的動爻（較高位置的）為主。</li>`;
            } else if(changingLines.length === 3) {
                analysisText += `<li>三爻動：本卦與變卦的力量相當，本卦代表現狀，變卦代表未來的走向。可以同時看本卦和變卦的「卦辭」。</li>`;
            } else if(changingLines.length === 4) {
                analysisText += `<li>四爻動：以變卦的這「兩個靜爻（沒動的爻）」為依據，以下面的靜爻為主。</li>`;
            } else if(changingLines.length === 5) {
                analysisText += `<li>五爻動：以變卦的那「一個靜爻」為依據。</li>`;
            } else if(changingLines.length === 6) {
                if (hexBase.name === '乾為天') analysisText += `<li>六爻全動（若是乾卦）：以「用九」為依據。群龍無首，吉。</li>`;
                else if (hexBase.name === '坤為地') analysisText += `<li>六爻全動（若是坤卦）：以「用六」為依據。利永貞。</li>`;
                else analysisText += `<li>六爻全動：請直接以「變卦的卦辭」為依據，因為情勢即將發生徹底且必然的改變。</li>`;
            }
            analysisText += `</ul>`;
        }

        document.getElementById('cd-analysis-content').innerHTML = analysisText;
        
        // Save result for AI Prompt
        window.lastCdResult = {
            name: uName === "卜卦者" ? "我" : uName,
            question: uQuestion,
            base: hexBase.name,
            transform: hexTransform.name,
            resultLine: simpleResultText
        };
        
        cdResultArea.style.display = 'block';
        window.scrollBy({ top: 300, behavior: 'smooth' });
    }
    
    // Coin Divination AI Prompt Generator
    const btnCdAiPrompt = document.getElementById('btn-cd-ai-prompt');
    if(btnCdAiPrompt) {
        btnCdAiPrompt.addEventListener('click', () => {
            if(!window.lastCdResult) return;
            // Reusing existing AI prompt modal
            const aiPromptModal = document.getElementById('ai-prompt-modal');
            const promptInputQ = document.getElementById('ai-prompt-question');
            const promptInputName = document.getElementById('ai-prompt-name');
            const promptResultArea = document.getElementById('ai-prompt-result-area');
            
            // Set fields and mode
            promptInputQ.value = window.lastCdResult.question || "";
            promptInputName.value = window.lastCdResult.name === "我" ? "" : window.lastCdResult.name;
            promptResultArea.style.display = 'none';
            
            // Override the generated prompt context logic
            window.activePromptMode = 'coin'; // tell the generator to use coin logic
            
            aiPromptModal.classList.add('active');
            aiPromptModal.style.display = 'flex';
        });
    }


    // ==========================================
    // 資料更新工具 (Data Updater for Developer)
    // ==========================================
    const btnUpdateData = document.getElementById('btn-update-data');
    if (btnUpdateData) {
        btnUpdateData.addEventListener('click', async () => {
            try {
                // 要求使用者選取 IChingWeb 專案資料夾
                const dirHandle = await window.showDirectoryPicker();
                
                // 1. 取得更新日期
                const now = new Date();
                const year = now.getFullYear();
                const month = String(now.getMonth() + 1).padStart(2, '0');
                const day = String(now.getDate()).padStart(2, '0');
                const dateStr = `${year}-${month}-${day}`;
                
                // 2. 備份舊的 JSON
                let oldText = "{}";
                try {
                    const oldJsonHandle = await dirHandle.getFileHandle('iching_data.json');
                    const oldFile = await oldJsonHandle.getFile();
                    oldText = await oldFile.text();
                    
                    const oldData = JSON.parse(oldText);
                    const oldDateStr = oldData._buildDate || dateStr;
                    const backupName = `iching_data_${oldDateStr}_backup.json`;
                    
                    const backupHandle = await dirHandle.getFileHandle(backupName, { create: true });
                    const backupWritable = await backupHandle.createWritable();
                    await backupWritable.write(oldText);
                    await backupWritable.close();
                    console.log(`已建立備份：${backupName}`);
                } catch (e) {
                    console.warn('備份程序異常 (可能是檔案不存在)：', e);
                }
                
                // 將現有記憶體中的 activeHexagramData 作為新資料寫入 (確保經過了 upper/lower 之補釘)
                let finalDataToSave = activeHexagramData;
                
                // 寫回新的 JSON
                const newDataObj = {
                    _buildDate: dateStr,
                    data: finalDataToSave
                };
                const newJsonText = JSON.stringify(newDataObj, null, 2);
                
                const newJsonHandle = await dirHandle.getFileHandle('iching_data.json', { create: true });
                const newJsonWritable = await newJsonHandle.createWritable();
                await newJsonWritable.write(newJsonText);
                await newJsonWritable.close();
                
                // 3. 同步寫回 data.js 解決 CORS
                const jsText = `// Auto-generated payload to bypass local CORS file:// restrictions
window.trigramsData = [
    { name: "天", symbol: "☰" },
    { name: "澤", symbol: "☱" },
    { name: "火", symbol: "☲" },
    { name: "雷", symbol: "☳" },
    { name: "風", symbol: "☴" },
    { name: "水", symbol: "☵" },
    { name: "山", symbol: "☶" },
    { name: "地", symbol: "☷" }
];

window.defaultHexagramData = \n` + JSON.stringify(finalDataToSave, null, 4) + `;\n`;

                const jsHandle = await dirHandle.getFileHandle('data.js', { create: true });
                const jsWritable = await jsHandle.createWritable();
                await jsWritable.write(jsText);
                await jsWritable.close();
                
                alert(`資料更新成功！\n\n- 已自動備份舊文件\n- 更新了 iching_data.json\n- 自動同步寫入了 data.js\n\n您以後更新 JSON 的時候，這個按鈕會一併將變更轉移到 JS 中，不再有無法讀取的狀況。`);
            } catch (err) {
                console.error("更新資料失敗：", err);
                if (err.name !== 'AbortError') {
                    alert("更新失敗：" + err.message);
                }
            }
        });
    }

    // Initial render
    renderGrid();
});
