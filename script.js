/* =========================================
   処遇改善加算ナビ｜script.js
   区分診断ウィザードの判定ロジックは、以下の一次資料に基づく：
   ・障障発0307第１号 こ支障第11号（令和7年3月7日）
     「福祉・介護職員等処遇改善加算等に関する基本的考え方
       並びに事務処理手順及び様式例の提示について（令和7年度分）」
   ・上記通知 別紙１（サービス別加算率、要件対応表 等）
   ========================================= */

document.addEventListener('DOMContentLoaded', function () {
  initGrainField();
  initParallax();
  initTabs();
  initBackToTop();
  initWizard();
  initChecklist();
});

/* -----------------------------------------
   稲穂フィールドの生成
   ----------------------------------------- */
function initGrainField() {
  const row = document.getElementById('grain-row');
  if (!row) return;
  const count = 14;
  for (let i = 0; i < count; i++) {
    const g = document.createElement('div');
    g.className = 'grain';
    row.appendChild(g);
  }
}

/* -----------------------------------------
   パララックス（スクロールで空と地面が僅かに動く）
   ----------------------------------------- */
function initParallax() {
  const sky = document.querySelector('.parallax-sky');
  const ground = document.querySelector('.parallax-ground');
  if (!sky || !ground) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion) return;

  let ticking = false;
  window.addEventListener('scroll', function () {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      const y = window.scrollY;
      sky.style.transform = 'translateY(' + (y * 0.04) + 'px)';
      ground.style.transform = 'translateY(' + (y * -0.02) + 'px)';
      ticking = false;
    });
  }, { passive: true });
}

/* -----------------------------------------
   タブ切り替え
   ----------------------------------------- */
function initTabs() {
  const btns = document.querySelectorAll('.tab-btn');
  btns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      const target = btn.getAttribute('data-tab');
      document.querySelectorAll('.tab-btn').forEach(function (b) {
        b.classList.remove('is-active');
        b.setAttribute('aria-selected', 'false');
      });
      document.querySelectorAll('.tab-panel').forEach(function (p) {
        p.classList.remove('is-active');
      });
      btn.classList.add('is-active');
      btn.setAttribute('aria-selected', 'true');
      const panel = document.getElementById('panel-' + target);
      if (panel) panel.classList.add('is-active');
    });
  });
}

/* -----------------------------------------
   トップに戻るボタン
   ----------------------------------------- */
function initBackToTop() {
  const btn = document.getElementById('page-top');
  if (!btn) return;
  window.addEventListener('scroll', function () {
    if (window.scrollY > 400) {
      btn.classList.add('show');
    } else {
      btn.classList.remove('show');
    }
  }, { passive: true });
  btn.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* -----------------------------------------
   提出書類チェックリスト（障害福祉版）
   書類名の根拠：障障発0307第１号 こ支障第11号（令和7年3月7日）通知
   別紙様式2-1・2-2・3-1・3-2・4・5 の記載に基づく。
   利用者の入力（チェック状況）は、サーバーに送信せず、
   ブラウザのlocalStorageにのみ保存する（個人情報保護方針）。
   ----------------------------------------- */
function initChecklist() {
  const root = document.getElementById('checklist-root');
  if (!root) return;

  const DOC_SETS = {
    new: {
      label: '新規算定・区分変更時',
      items: [
        { id: 'y2-1', label: '処遇改善計画書（別紙様式２－１）', sub: '賃金改善の見込額や取組内容を記載する基本の計画書' },
        { id: 'y2-2', label: '事業所一覧（別紙様式２－２）', sub: '複数事業所を一括して申請する場合の一覧表' },
        { id: 'y3-2-new', label: 'キャリアパス要件Ⅳについて（別紙様式３－２）', sub: '該当する場合のみ。440万円要件を満たす職員数を記載' }
      ]
    },
    annual: {
      label: '毎年度の実績報告時',
      items: [
        { id: 'y3-1', label: '実績報告書（別紙様式３－１）', sub: '賃金改善の実績や各要件の充足状況を報告する書類' },
        { id: 'y3-2-annual', label: 'キャリアパス要件Ⅳについて（別紙様式３－２）', sub: '440万円要件の該当者数を記載' },
        { id: 'evidence', label: '給与明細・勤務記録等の根拠資料', sub: '指定権者からの求めに応じて速やかに提出できるよう、日頃から保管しておく（提出そのものは通常不要）' }
      ]
    },
    change: {
      label: '変更事項が生じた時',
      items: [
        { id: 'y4', label: '変更に係る届出書（別紙様式４）', sub: '区分変更・法人合併・就業規則改訂等があった場合に提出' },
        { id: 'y5', label: '特別な事情に係る届出書（別紙様式５）', sub: '賃金水準を引き下げる必要がある場合のみ、追加で提出' }
      ]
    }
  };

  root.innerHTML =
    '<div class="checklist-select-row">' +
      '<div class="field">' +
        '<label for="cl-system">制度</label>' +
        '<select id="cl-system">' +
          '<option value="shogai">障害福祉サービス</option>' +
          '<option value="kaigo">介護保険サービス（準備中）</option>' +
        '</select>' +
      '</div>' +
      '<div class="field">' +
        '<label for="cl-timing">タイミング</label>' +
        '<select id="cl-timing">' +
          '<option value="new">新規算定・区分変更時</option>' +
          '<option value="annual">毎年度の実績報告時</option>' +
          '<option value="change">変更事項が生じた時</option>' +
        '</select>' +
      '</div>' +
    '</div>' +
    '<div id="cl-body"></div>';

  const systemSel = document.getElementById('cl-system');
  const timingSel = document.getElementById('cl-timing');
  const body = document.getElementById('cl-body');

  systemSel.addEventListener('change', renderList);
  timingSel.addEventListener('change', renderList);
  renderList();

  function storageKey(itemId) {
    return 'checklist:' + timingSel.value + ':' + itemId;
  }

  function getChecked(itemId) {
    try {
      return window.localStorage.getItem(storageKey(itemId)) === '1';
    } catch (e) {
      return false;
    }
  }

  function setChecked(itemId, val) {
    try {
      window.localStorage.setItem(storageKey(itemId), val ? '1' : '0');
    } catch (e) { /* 保存できない場合も画面表示自体は継続する */ }
  }

  function renderList() {
    if (systemSel.value === 'kaigo') {
      body.innerHTML = '<div class="coming-soon">介護保険サービスのチェックリストは、現在準備中です🌾</div>';
      return;
    }

    const set = DOC_SETS[timingSel.value];
    const listHtml = set.items.map(function (item) {
      const checked = getChecked(item.id) ? 'checked' : '';
      return (
        '<div class="doc-item">' +
          '<input type="checkbox" id="doc-' + item.id + '" ' + checked + '>' +
          '<label for="doc-' + item.id + '">' + item.label +
            '<span class="doc-sub">' + item.sub + '</span>' +
          '</label>' +
        '</div>'
      );
    }).join('');

    body.innerHTML =
      '<div class="progress-label" id="cl-progress-label"></div>' +
      '<div class="progress-bar-wrap"><div class="progress-bar-fill" id="cl-progress-fill"></div></div>' +
      '<div class="doc-list">' + listHtml + '</div>' +
      '<div class="btn-row">' +
        '<button class="btn btn-ghost" id="cl-print">印刷用に表示する</button>' +
      '</div>' +
      '<p class="disclaimer-note">書類名・要否は令和7年3月7日付通知に基づく目安です。実際の提出書類は指定権者の指示を優先してください。チェック状況はこの端末のブラウザにのみ保存され、送信されません。</p>';

    set.items.forEach(function (item) {
      const cb = document.getElementById('doc-' + item.id);
      cb.addEventListener('change', function () {
        setChecked(item.id, cb.checked);
        updateProgress(set);
      });
    });

    document.getElementById('cl-print').addEventListener('click', function () {
      window.print();
    });

    updateProgress(set);
  }

  function updateProgress(set) {
    const total = set.items.length;
    const done = set.items.filter(function (item) { return getChecked(item.id); }).length;
    const pct = total === 0 ? 0 : Math.round((done / total) * 100);
    const fill = document.getElementById('cl-progress-fill');
    const label = document.getElementById('cl-progress-label');
    if (fill) fill.style.width = pct + '%';
    if (label) label.textContent = '完了率 ' + pct + '%（' + done + ' / ' + total + '）';
  }
}

/* -----------------------------------------
   区分診断ウィザード（障害福祉版）
   ----------------------------------------- */
function initWizard() {
  const root = document.getElementById('wizard-root');
  if (!root) return;

  // ウィザードの状態
  const state = {
    step: 0,
    system: null,   // 'shogai' | 'kaigo'
    cp1: null,      // キャリアパス要件Ⅰ: 'ok' | 'pledge' | 'no'
    cp2: null,      // キャリアパス要件Ⅱ
    cp3: null,      // キャリアパス要件Ⅲ
    cp4: null,      // キャリアパス要件Ⅳ(440万円要件): 'ok' | 'no'
    cp5: null,      // キャリアパス要件Ⅴ(配置等要件): 'ok' | 'no'
    env: null       // 職場環境等要件: 'high' | 'low' | 'pledge' | 'no'
  };

  render();

  function render() {
    root.innerHTML = '';

    if (state.step === 0) {
      root.appendChild(buildChoiceStep({
        progress: null,
        question: 'どちらの制度についての診断ですか？',
        choices: [
          { label: '障害福祉サービス', sub: '生活介護・就労継続支援A型/B型・グループホーム 等', value: 'shogai' },
          { label: '介護保険サービス', sub: '準備中の制度です', value: 'kaigo' }
        ],
        onSelect: function (v) {
          state.system = v;
          if (v === 'kaigo') {
            state.step = 'kaigo-soon';
          } else {
            state.step = 1;
          }
          render();
        }
      }));
      return;
    }

    if (state.step === 'kaigo-soon') {
      const box = document.createElement('div');
      box.className = 'wizard-result';
      box.innerHTML =
        '<p class="result-reason">介護保険サービスの診断ロジックは、現在準備中です🌾<br>' +
        '介護保険の処遇改善加算は要件構造が障害福祉と異なるため、根拠資料をもとに別途整備してから追加いたします。今しばらくお待ちください。</p>';
      const backBtn = document.createElement('button');
      backBtn.className = 'btn btn-ghost';
      backBtn.style.marginTop = '14px';
      backBtn.textContent = '← はじめからやり直す';
      backBtn.addEventListener('click', function () { resetWizard(); });
      box.appendChild(backBtn);
      root.appendChild(box);
      return;
    }

    if (state.step === 1) {
      root.appendChild(buildChoiceStep({
        progress: '質問 1 / 6',
        question: '現在の処遇改善加算の算定状況は？',
        choices: [
          { label: '算定していない（新規に算定したい）', value: 'new' },
          { label: '処遇改善加算ⅢまたはⅣを算定している', value: 'iii_iv' },
          { label: '処遇改善加算ⅠまたはⅡを算定している', value: 'i_ii' }
        ],
        onSelect: function () { state.step = 2; render(); }
      }));
      return;
    }

    if (state.step === 2) {
      root.appendChild(buildCareerPathStep(1, 'キャリアパス要件Ⅰ（任用要件・賃金体系の整備等）',
        '職位・職責・職務内容に応じた任用の要件や賃金体系を定め、就業規則等の書面で全職員に周知している状態です。',
        function (v) { state.cp1 = v; state.step = 3; render(); }));
      return;
    }

    if (state.step === 3) {
      root.appendChild(buildCareerPathStep(2, 'キャリアパス要件Ⅱ（研修の実施等）',
        '資質向上の目標・計画を策定し、研修の実施または研修機会の確保を行い、全職員に周知している状態です。',
        function (v) { state.cp2 = v; state.step = 4; render(); }));
      return;
    }

    if (state.step === 4) {
      root.appendChild(buildCareerPathStep(3, 'キャリアパス要件Ⅲ（昇給の仕組みの整備等）',
        '経験・資格等に応じて昇給する仕組み、または一定基準に基づき定期に昇給を判定する仕組みを設けている状態です。',
        function (v) { state.cp3 = v; state.step = 5; render(); }));
      return;
    }

    if (state.step === 5) {
      root.appendChild(buildChoiceStep({
        progress: '質問 5 / 6',
        question: 'キャリアパス要件Ⅳ（改善後の賃金要件）は満たせそうですか？',
        note: '事業所内に、改善後の賃金が年額440万円以上となる職員が1人以上いる状態を指します。この要件には「誓約」による猶予の仕組みがありません。',
        choices: [
          { label: '満たす（該当者が1人以上いる、または今後配置できる）', value: 'ok' },
          { label: '満たさない（小規模事業所等の理由で、現時点では難しい）', value: 'no' }
        ],
        onSelect: function (v) { state.cp4 = v; state.step = 6; render(); }
      }));
      return;
    }

    if (state.step === 6) {
      root.appendChild(buildChoiceStep({
        progress: '質問 6 / 6',
        question: 'キャリアパス要件Ⅴ（配置等要件）はいかがですか？',
        note: 'サービス種別によって内容が異なる、やや個別性の高い要件です。判断が難しい場合は「わからない・該当なし」を選んでください（結果画面で確認方法をご案内します）。',
        choices: [
          { label: '満たしている、または自事業所には該当しない', value: 'ok' },
          { label: '満たしていない・わからない', value: 'no' }
        ],
        onSelect: function (v) { state.cp5 = v; state.step = 7; render(); }
      }));
      return;
    }

    if (state.step === 7) {
      root.appendChild(buildChoiceStep({
        progress: '最後の質問',
        question: '職場環境等要件（入職促進・資質向上・両立支援・腰痛対策・やりがい醸成・生産性向上）の取組状況は？',
        choices: [
          { label: '各区分で2つ以上（生産性向上区分は3つ以上）実施している', sub: '処遇改善加算Ⅰ・Ⅱの基準を満たす水準', value: 'high' },
          { label: '各区分で1つ以上（生産性向上区分は2つ以上）実施している', sub: '処遇改善加算Ⅲ・Ⅳの基準を満たす水準', value: 'low' },
          { label: '現時点では未整備だが、令和7年度中に整備することを誓約する', value: 'pledge' },
          { label: 'いずれにも該当しない', value: 'no' }
        ],
        onSelect: function (v) { state.env = v; state.step = 'result'; render(); }
      }));
      return;
    }

    if (state.step === 'result') {
      root.appendChild(buildResult());
      return;
    }
  }

  function buildChoiceStep(opts) {
    const wrap = document.createElement('div');
    wrap.className = 'wizard-step is-active';

    if (opts.progress) {
      const p = document.createElement('div');
      p.className = 'wizard-progress';
      p.textContent = opts.progress;
      wrap.appendChild(p);
    }

    const h = document.createElement('h3');
    h.textContent = opts.question;
    h.style.marginTop = '0';
    wrap.appendChild(h);

    if (opts.note) {
      const note = document.createElement('p');
      note.className = 'disclaimer-note';
      note.textContent = opts.note;
      wrap.appendChild(note);
    }

    const list = document.createElement('div');
    list.className = 'choice-list';
    opts.choices.forEach(function (c) {
      const b = document.createElement('button');
      b.className = 'choice-btn';
      b.innerHTML = c.label + (c.sub ? '<span class="sub">' + c.sub + '</span>' : '');
      b.addEventListener('click', function () { opts.onSelect(c.value); });
      list.appendChild(b);
    });
    wrap.appendChild(list);

    if (state.step !== 0) {
      const back = document.createElement('button');
      back.className = 'btn btn-ghost';
      back.style.marginTop = '16px';
      back.textContent = '← 最初からやり直す';
      back.addEventListener('click', function () { resetWizard(); });
      wrap.appendChild(back);
    }

    return wrap;
  }

  function buildCareerPathStep(no, title, note, onSelect) {
    return buildChoiceStep({
      progress: '質問 ' + (no + 1) + ' / 6',
      question: title + ' の整備状況は？',
      note: note,
      choices: [
        { label: '整備済み・周知済み', value: 'ok' },
        { label: '未整備だが、令和8年3月末までに整備することを誓約する', value: 'pledge' },
        { label: '整備しておらず、誓約もしない', value: 'no' }
      ],
      onSelect: onSelect
    });
  }

  function buildResult() {
    const wrap = document.createElement('div');
    wrap.className = 'wizard-step is-active';

    const cp1ok = state.cp1 === 'ok' || state.cp1 === 'pledge';
    const cp2ok = state.cp2 === 'ok' || state.cp2 === 'pledge';
    const cp3ok = state.cp3 === 'ok' || state.cp3 === 'pledge';
    const cp4ok = state.cp4 === 'ok';
    const cp5ok = state.cp5 === 'ok';
    const envLowOk = state.env === 'high' || state.env === 'low' || state.env === 'pledge';
    const envHighOk = state.env === 'high' || state.env === 'pledge';

    let grade = null;
    const missing = [];

    // Ⅳの土台：キャリアパスⅠ・Ⅱ＋職場環境等要件(低い方の基準)
    const okIV = cp1ok && cp2ok && envLowOk;
    // Ⅲ：Ⅳの土台＋キャリアパスⅢ
    const okIII = okIV && cp3ok;
    // Ⅱ：Ⅲの土台＋キャリアパスⅣ(440万円)＋職場環境等要件(高い方の基準)
    const okII = okIII && cp4ok && envHighOk;
    // Ⅰ：Ⅱの土台＋キャリアパスⅤ(配置等要件)
    const okI = okII && cp5ok;

    if (okI) grade = 'Ⅰ';
    else if (okII) grade = 'Ⅱ';
    else if (okIII) grade = 'Ⅲ';
    else if (okIV) grade = 'Ⅳ';
    else grade = null;

    if (!cp1ok) missing.push('キャリアパス要件Ⅰ（任用要件・賃金体系の整備等）');
    if (!cp2ok) missing.push('キャリアパス要件Ⅱ（研修の実施等）');
    if (!envLowOk) missing.push('職場環境等要件（Ⅲ・Ⅳ相当の水準）');

    const box = document.createElement('div');
    box.className = 'wizard-result';

    if (grade) {
      box.innerHTML = '<div class="result-grade">目安：処遇改善加算 ' + grade + '</div>';
    } else {
      box.innerHTML = '<div class="result-grade" style="font-size:18px;">現時点では処遇改善加算Ⅳの要件充足が難しい状況です</div>';
    }

    const reasonList = document.createElement('ul');
    reasonList.className = 'reason-list';

    if (grade) {
      reasonList.innerHTML =
        '<li>キャリアパス要件Ⅰ・Ⅱ：' + labelCp(state.cp1) + ' / ' + labelCp(state.cp2) + '</li>' +
        '<li>キャリアパス要件Ⅲ：' + labelCp(state.cp3) + '</li>' +
        '<li>キャリアパス要件Ⅳ（440万円要件）：' + (cp4ok ? '満たす' : '満たさない') + '</li>' +
        '<li>キャリアパス要件Ⅴ（配置等要件）：' + (cp5ok ? '満たす・該当なし' : '満たさない・要確認') + '</li>' +
        '<li>職場環境等要件：' + labelEnv(state.env) + '</li>';
    } else {
      const ul = missing.map(function (m) { return '<li>' + m + '</li>'; }).join('');
      reasonList.innerHTML = ul;
    }
    box.appendChild(reasonList);

    const noteP = document.createElement('p');
    noteP.className = 'disclaimer-note';
    noteP.style.marginTop = '14px';
    noteP.innerHTML =
      'この結果は、令和7年3月7日付 障障発0307第１号通知の要件構造に基づく目安です。' +
      '誓約に関する取扱いや配置等要件の詳細は、事業所の状況によって異なる場合がありますので、' +
      '最終的な区分の決定・届出前に必ず指定権者（自治体）または国民健康保険団体連合会にご確認ください。';
    box.appendChild(noteP);

    const btnRow = document.createElement('div');
    btnRow.className = 'btn-row';
    const restart = document.createElement('button');
    restart.className = 'btn btn-ghost';
    restart.textContent = '← もう一度診断する';
    restart.addEventListener('click', function () { resetWizard(); });
    btnRow.appendChild(restart);
    box.appendChild(btnRow);

    wrap.appendChild(box);
    return wrap;
  }

  function labelCp(v) {
    if (v === 'ok') return '整備済み';
    if (v === 'pledge') return '誓約により整備済み扱い';
    return '未整備';
  }
  function labelEnv(v) {
    if (v === 'high') return 'Ⅰ・Ⅱ水準を満たす';
    if (v === 'low') return 'Ⅲ・Ⅳ水準を満たす';
    if (v === 'pledge') return '誓約により整備済み扱い';
    return '未整備';
  }

  function resetWizard() {
    state.step = 0;
    state.system = null;
    state.cp1 = state.cp2 = state.cp3 = state.cp4 = state.cp5 = state.env = null;
    render();
  }
}
