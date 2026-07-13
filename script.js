/* =========================================
   処遇改善加算ナビ｜script.js
   区分診断ウィザードの判定ロジックは、以下の一次資料に基づく：
   ・障障発0331第１号 こ支障第78号（令和8年3月31日）
     「福祉・介護職員等処遇改善加算等に関する基本的考え方
       並びに事務処理手順及び様式例の提示について」（令和8年度分）
     ※令和8年6月1日施行。令和7年3月7日付旧通知（障障発0307第１号）は廃止。
   ・上記通知 別紙１（サービス別加算率、要件対応表 等）、別紙１表３（職場環境等要件）
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
   書類名の根拠：障障発0331第１号 こ支障第78号（令和8年3月31日）通知
   別紙様式2-1(総括表)・2-2(個票・4/5月分)・2-3(個票・6月以降分)・
   3-1(実績報告書)・3-2(個票)・4(変更届出書)・5(特別事情届出書) の記載に基づく。
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
        { id: 'y2-1', label: '処遇改善計画書 総括表（別紙様式２－１）', sub: '賃金改善計画の全体像・各要件の充足状況をまとめる基本の様式' },
        { id: 'y2-2', label: '個票／令和8年4・5月分（別紙様式２－２）', sub: '令和8年4月・5月分を算定する場合のみ提出' },
        { id: 'y2-3', label: '個票／令和8年6月以降分（別紙様式２－３）', sub: '令和8年6月以降の算定分（新区分イ／ロ対応）はこちらを使用' },
        { id: 'y3-2-new', label: 'キャリアパス要件Ⅳについて（別紙様式３－２）', sub: '該当する場合のみ。460万円要件を満たす職員数、または職場環境等要件（全体14以上）による代替の状況を記載' }
      ]
    },
    annual: {
      label: '毎年度の実績報告時',
      items: [
        { id: 'y3-1', label: '実績報告書（別紙様式３－１）', sub: '賃金改善の実績や各要件の充足状況を報告する書類' },
        { id: 'y3-2-annual', label: 'キャリアパス要件Ⅳについて（別紙様式３－２）', sub: '460万円要件の該当者数、または職場環境等要件（全体14以上）による代替の状況を記載' },
        { id: 'evidence', label: '給与明細・勤務記録等の根拠資料', sub: '指定権者からの求めに応じて速やかに提出できるよう、日頃から保管しておく（提出そのものは通常不要）' }
      ]
    },
    change: {
      label: '変更事項が生じた時',
      items: [
        { id: 'y4', label: '変更に係る届出書（別紙様式４）', sub: '区分変更・法人合併・就業規則改訂等があった場合に提出。別紙様式２－２・２－３のうち該当する個票もあわせて提出' },
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
      '<p class="disclaimer-note">書類名・要否は令和8年3月31日付通知（令和8年度分）に基づく目安です。実際の提出書類は指定権者の指示を優先してください。チェック状況はこの端末のブラウザにのみ保存され、送信されません。</p>';

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
   区分診断ウィザード（障害福祉版・令和8年度ルール対応）
   根拠：障障発0331第１号 こ支障第78号（令和8年3月31日）通知
   令和8年6月1日以降の要件構造（別紙１表２－２・表２－３）に基づく。
   ----------------------------------------- */
function initWizard() {
  const root = document.getElementById('wizard-root');
  if (!root) return;

  // ウィザードの状態
  const state = {
    step: 0,
    service: null,  // 'std'(表1-2対象の従来サービス) | 'consult'(相談支援系・令和8年6月新設) | 'kaigo'
    tokurei: null,  // ⑧令和8年度特例要件: 'ok' | 'pledge' | 'no'
    cp1: null,      // キャリアパス要件Ⅰ: 'ok' | 'pledge' | 'no'（誓約は⑧を満たす場合のみ有効）
    cp2: null,      // キャリアパス要件Ⅱ（同上）
    cp3: null,      // キャリアパス要件Ⅲ（同上）
    cp4: null,      // キャリアパス要件Ⅳ(460万円要件): 'ok' | 'pledge' | 'no'（誓約は無条件で可）
    cp5: null,      // キャリアパス要件Ⅴ(配置等要件): 'exempt' | 'ok' | 'no'
    env: null       // 職場環境等要件: 'high' | 'low' | 'pledgeLow' | 'pledgeHigh' | 'no'
  };

  render();

  function render() {
    root.innerHTML = '';

    if (state.step === 0) {
      root.appendChild(buildChoiceStep({
        progress: null,
        question: 'どのサービス区分についての診断ですか？',
        choices: [
          { label: '従来からのサービス', sub: '居宅介護・生活介護・就労継続支援A型/B型・グループホーム 等（別紙１表１－２対象）', value: 'std' },
          { label: '相談支援系サービス', sub: '計画相談支援・地域相談支援・障害児相談支援（令和8年6月に新設）', value: 'consult' },
          { label: '介護保険サービス', sub: '準備中の制度です', value: 'kaigo' }
        ],
        onSelect: function (v) {
          state.service = v;
          if (v === 'kaigo') state.step = 'kaigo-soon';
          else if (v === 'consult') state.step = 'c-tokurei';
          else state.step = 'tokurei';
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

    /* ---------- 従来サービス（表1-2対象）の質問フロー ---------- */

    if (state.step === 'tokurei') {
      root.appendChild(buildChoiceStep({
        progress: '質問 1 / 7',
        question: '⑧令和8年度特例要件（Ⅰロ・Ⅱロを目指す場合の追加要件）の状況は？',
        note: '「生産性向上の取組を5つ以上（⑱・㉑は必須）実施」または「社会福祉連携推進法人に所属」に加えて、「処遇改善加算Ⅱロ相当額の1/2以上を基本給等に充当」することが必要です。Ⅰロ・Ⅱロを目指さない場合は「目指さない」を選んでください。',
        choices: [
          { label: '満たす（生産性向上5つ以上、または社福連携法人所属＋基本給等への充当済み）', value: 'ok' },
          { label: '令和9年3月末までに整備することを誓約する', value: 'pledge' },
          { label: 'Ⅰロ・Ⅱロは目指さない（わからない場合も選択）', value: 'no' }
        ],
        onSelect: function (v) { state.tokurei = v; state.step = 'cp1'; render(); }
      }));
      return;
    }

    if (state.step === 'cp1') {
      root.appendChild(buildCareerPathStep('cp1', 2, 'キャリアパス要件Ⅰ（任用要件・賃金体系の整備等）',
        '職位・職責・職務内容に応じた任用の要件や賃金体系を定め、就業規則等の書面で全職員に周知している状態です。',
        function (v) { state.cp1 = v; state.step = 'cp2'; render(); }));
      return;
    }

    if (state.step === 'cp2') {
      root.appendChild(buildCareerPathStep('cp2', 3, 'キャリアパス要件Ⅱ（研修の実施等）',
        '資質向上の目標・計画を策定し、研修の実施または研修機会の確保を行い、全職員に周知している状態です。',
        function (v) { state.cp2 = v; state.step = 'cp3'; render(); }));
      return;
    }

    if (state.step === 'cp3') {
      root.appendChild(buildCareerPathStep('cp3', 4, 'キャリアパス要件Ⅲ（昇給の仕組みの整備等）',
        '経験・資格等に応じて昇給する仕組み、または一定基準に基づき定期に昇給を判定する仕組みを設けている状態です。',
        function (v) { state.cp3 = v; state.step = 'cp4'; render(); }));
      return;
    }

    if (state.step === 'cp4') {
      root.appendChild(buildChoiceStep({
        progress: '質問 5 / 7',
        question: 'キャリアパス要件Ⅳ（改善後の賃金要件）は満たせそうですか？',
        note: '事業所内に、改善後の賃金が年額460万円以上となる職員が1人以上いる状態です。この要件は誓約が可能です。なお、次の職場環境等要件で「全体14以上」を満たす場合は、この要件を満たしたものとみなされます（後の質問で自動判定します）。',
        choices: [
          { label: '満たす（該当者が1人以上いる、または今後配置できる）', value: 'ok' },
          { label: '令和9年3月末までに整備することを誓約する', value: 'pledge' },
          { label: '満たさない（職場環境等要件の代替も含めて、現時点では難しい）', value: 'no' }
        ],
        onSelect: function (v) { state.cp4 = v; state.step = 'cp5'; render(); }
      }));
      return;
    }

    if (state.step === 'cp5') {
      root.appendChild(buildChoiceStep({
        progress: '質問 6 / 7',
        question: 'キャリアパス要件Ⅴ（配置等要件）はいかがですか？',
        note: '福祉専門職員配置等加算（居宅介護・重度訪問介護・同行援護・行動援護は特定事業所加算）の届出状況を指します。なお、重度障害者等包括支援・施設入所支援・短期入所・就労定着支援・居宅訪問型児童発達支援・保育所等訪問支援は、この要件自体が不要です。',
        choices: [
          { label: '対象外サービスに該当する（上記6サービスのいずれか）', value: 'exempt' },
          { label: '該当する加算の届出をしている', value: 'ok' },
          { label: '届出をしていない・わからない', value: 'no' }
        ],
        onSelect: function (v) { state.cp5 = v; state.step = 'env'; render(); }
      }));
      return;
    }

    if (state.step === 'env') {
      root.appendChild(buildChoiceStep({
        progress: '質問 7 / 7',
        question: '職場環境等要件（入職促進・資質向上・両立支援・腰痛対策・やりがい醸成・生産性向上）の取組状況は？',
        choices: [
          { label: '各区分1つ以上・生産性向上2つ以上、かつ全体で14以上を実施している', sub: '処遇改善加算Ⅰ・Ⅱの基準を満たす水準', value: 'high' },
          { label: '各区分1つ以上・生産性向上2つ以上、かつ全体で8以上を実施している', sub: '処遇改善加算Ⅲ・Ⅳの基準を満たす水準', value: 'low' },
          { label: '全体8以上の水準まで、令和9年3月末までに整備することを誓約する', sub: '誰でも誓約できます', value: 'pledgeLow' },
          { label: '全体14以上の水準まで、令和9年3月末までに整備することを誓約する', sub: '⑧令和8年度特例要件を満たす場合のみ有効です', value: 'pledgeHigh' },
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

    /* ---------- 相談支援系サービス（令和8年6月新設）の質問フロー ---------- */

    if (state.step === 'c-tokurei') {
      root.appendChild(buildChoiceStep({
        progress: '質問 1 / 4',
        question: '⑧令和8年度特例要件（生産性向上・協働化の取組）を満たしますか？',
        note: '「生産性向上の取組を5つ以上（⑱・㉑は必須）実施」または「社会福祉連携推進法人に所属」していれば、この1問だけで算定可能です。',
        choices: [
          { label: '満たす', value: 'ok' },
          { label: '令和9年3月末までに整備することを誓約する', value: 'pledge' },
          { label: '満たさない・わからない', value: 'no' }
        ],
        onSelect: function (v) {
          state.tokurei = v;
          if (v === 'ok' || v === 'pledge') { state.step = 'c-result'; render(); return; }
          state.step = 'c-cp1';
          render();
        }
      }));
      return;
    }

    if (state.step === 'c-cp1') {
      root.appendChild(buildChoiceStep({
        progress: '質問 2 / 4',
        question: 'キャリアパス要件Ⅰ（任用要件・賃金体系の整備等）の状況は？',
        choices: [
          { label: '整備済み・周知済み', value: 'ok' },
          { label: '令和9年3月末までに整備することを誓約する', value: 'pledge' },
          { label: '整備しておらず、誓約もしない', value: 'no' }
        ],
        onSelect: function (v) { state.cp1 = v; state.step = 'c-cp2'; render(); }
      }));
      return;
    }

    if (state.step === 'c-cp2') {
      root.appendChild(buildChoiceStep({
        progress: '質問 3 / 4',
        question: 'キャリアパス要件Ⅱ（研修の実施等）の状況は？',
        choices: [
          { label: '整備済み・周知済み', value: 'ok' },
          { label: '令和9年3月末までに整備することを誓約する', value: 'pledge' },
          { label: '整備しておらず、誓約もしない', value: 'no' }
        ],
        onSelect: function (v) { state.cp2 = v; state.step = 'c-env'; render(); }
      }));
      return;
    }

    if (state.step === 'c-env') {
      root.appendChild(buildChoiceStep({
        progress: '質問 4 / 4',
        question: '職場環境等要件（各区分1つ以上、生産性向上2つ以上）の取組状況は？',
        choices: [
          { label: '満たしている', value: 'ok' },
          { label: '令和9年3月末までに整備することを誓約する', value: 'pledge' },
          { label: '満たしていない', value: 'no' }
        ],
        onSelect: function (v) { state.env = v; state.step = 'c-result'; render(); }
      }));
      return;
    }

    if (state.step === 'c-result') {
      root.appendChild(buildConsultResult());
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

  function buildCareerPathStep(key, no, title, note, onSelect) {
    return buildChoiceStep({
      progress: '質問 ' + no + ' / 7',
      question: title + ' の整備状況は？',
      note: note + '（誓約は、⑧令和8年度特例要件を満たす場合のみ有効です）',
      choices: [
        { label: '整備済み・周知済み', value: 'ok' },
        { label: '令和9年3月末までに整備することを誓約する', value: 'pledge' },
        { label: '整備しておらず、誓約もしない', value: 'no' }
      ],
      onSelect: onSelect
    });
  }

  function buildResult() {
    const wrap = document.createElement('div');
    wrap.className = 'wizard-step is-active';

    const tokureiOk = state.tokurei === 'ok' || state.tokurei === 'pledge';
    const cp1Ok = state.cp1 === 'ok' || (state.cp1 === 'pledge' && tokureiOk);
    const cp2Ok = state.cp2 === 'ok' || (state.cp2 === 'pledge' && tokureiOk);
    const cp3Ok = state.cp3 === 'ok' || (state.cp3 === 'pledge' && tokureiOk);
    const cp4DirectOk = state.cp4 === 'ok' || state.cp4 === 'pledge';
    const cp5Ok = state.cp5 === 'exempt' || state.cp5 === 'ok';

    const envLowOk = ['high', 'low', 'pledgeLow'].indexOf(state.env) !== -1 ||
      (state.env === 'pledgeHigh' && tokureiOk);
    const envHighOk = state.env === 'high' || (state.env === 'pledgeHigh' && tokureiOk);

    // キャリアパス要件Ⅳの代替ルール：職場環境等要件で全体14以上を満たしていれば要件Ⅳも満たしたとみなす
    const cp4Ok = cp4DirectOk || envHighOk;

    // Ⅳの土台：①(別途実施が必要・注記のみ)＋キャリアパスⅠ・Ⅱ＋職場環境等要件(全体8以上水準)
    const okIV = cp1Ok && cp2Ok && envLowOk;
    // Ⅲ：Ⅳの土台＋キャリアパスⅢ
    const okIII = okIV && cp3Ok;
    // Ⅱイ：Ⅲの土台＋キャリアパスⅣ(460万円 or 代替)＋職場環境等要件(全体14以上水準)
    const okIIi = okIII && cp4Ok && envHighOk;
    // Ⅱロ：Ⅱイの土台＋⑧令和8年度特例要件
    const okIIro = okIIi && tokureiOk;
    // Ⅰイ：Ⅱイの土台＋キャリアパスⅤ(配置等要件)
    const okIi = okIIi && cp5Ok;
    // Ⅰロ：Ⅰイの土台＋⑧令和8年度特例要件
    const okIro = okIi && tokureiOk;

    let grade = null;
    if (okIro) grade = 'Ⅰロ';
    else if (okIi) grade = 'Ⅰイ';
    else if (okIIro) grade = 'Ⅱロ';
    else if (okIIi) grade = 'Ⅱイ';
    else if (okIII) grade = 'Ⅲ';
    else if (okIV) grade = 'Ⅳ';

    const missing = [];
    if (!cp1Ok) missing.push('キャリアパス要件Ⅰ（任用要件・賃金体系の整備等）');
    if (!cp2Ok) missing.push('キャリアパス要件Ⅱ（研修の実施等）');
    if (!envLowOk) missing.push('職場環境等要件（全体8以上の水準）');

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
        '<li>⑧令和8年度特例要件：' + labelPledgeSimple(state.tokurei) + '</li>' +
        '<li>キャリアパス要件Ⅰ・Ⅱ：' + labelCp(state.cp1, tokureiOk) + ' / ' + labelCp(state.cp2, tokureiOk) + '</li>' +
        '<li>キャリアパス要件Ⅲ：' + labelCp(state.cp3, tokureiOk) + '</li>' +
        '<li>キャリアパス要件Ⅳ（460万円要件）：' + (cp4DirectOk ? labelPledgeSimple(state.cp4) : (envHighOk ? '職場環境等要件（全体14以上）による代替で満たす' : '満たさない')) + '</li>' +
        '<li>キャリアパス要件Ⅴ（配置等要件）：' + (cp5Ok ? (state.cp5 === 'exempt' ? '対象外サービスに該当' : '満たす') : '満たさない・要確認') + '</li>' +
        '<li>職場環境等要件：' + labelEnv(state.env) + '</li>';
    } else {
      reasonList.innerHTML = missing.map(function (m) { return '<li>' + m + '</li>'; }).join('');
    }
    box.appendChild(reasonList);

    const noteP = document.createElement('p');
    noteP.className = 'disclaimer-note';
    noteP.style.marginTop = '14px';
    noteP.innerHTML =
      'この結果は、令和8年3月31日付 障障発0331第１号通知（令和8年6月1日施行分）の要件構造に基づく目安です。' +
      'なお、どの区分を目指す場合でも、月額賃金改善要件（加算額に応じた基本給等の引上げ）は別途必ず実施する必要があります。' +
      '誓約の有効性や配置等要件の詳細は、事業所の状況によって異なる場合がありますので、' +
      '最終的な区分の決定・届出前に必ず指定権者（自治体）または国民健康保険団体連合会にご確認ください。';
    box.appendChild(noteP);

    box.appendChild(buildRestartRow());
    wrap.appendChild(box);
    return wrap;
  }

  function buildConsultResult() {
    const wrap = document.createElement('div');
    wrap.className = 'wizard-step is-active';

    const tokureiOk = state.tokurei === 'ok' || state.tokurei === 'pledge';
    const cp1Ok = state.cp1 === 'ok' || state.cp1 === 'pledge';
    const cp2Ok = state.cp2 === 'ok' || state.cp2 === 'pledge';
    const envOk = state.env === 'ok' || state.env === 'pledge';
    const routeB = cp1Ok && cp2Ok && envOk;
    const qualifies = tokureiOk || routeB;

    const box = document.createElement('div');
    box.className = 'wizard-result';

    if (qualifies) {
      box.innerHTML = '<div class="result-grade">算定可：処遇改善加算（相談支援系・加算率5.1%）</div>';
    } else {
      box.innerHTML = '<div class="result-grade" style="font-size:18px;">現時点では算定要件を満たしていません</div>';
    }

    const reasonList = document.createElement('ul');
    reasonList.className = 'reason-list';
    reasonList.innerHTML =
      '<li>ルート①　⑧令和8年度特例要件：' + labelPledgeSimple(state.tokurei) + '</li>' +
      (state.cp1 !== null ? '<li>ルート②　キャリアパス要件Ⅰ：' + labelPledgeSimple(state.cp1) + '</li>' : '') +
      (state.cp2 !== null ? '<li>ルート②　キャリアパス要件Ⅱ：' + labelPledgeSimple(state.cp2) + '</li>' : '') +
      (state.env !== null ? '<li>ルート②　職場環境等要件：' + labelPledgeSimple(state.env) + '</li>' : '');
    box.appendChild(reasonList);

    const noteP = document.createElement('p');
    noteP.className = 'disclaimer-note';
    noteP.style.marginTop = '14px';
    noteP.innerHTML =
      '相談支援系サービス（計画相談支援・地域相談支援・障害児相談支援）は令和8年6月に新設された対象です。' +
      '「⑧令和8年度特例要件」または「キャリアパス要件Ⅰ・Ⅱ＋職場環境等要件（処遇改善加算Ⅳ準拠の水準）」のいずれかを満たせば算定できます。' +
      '詳細は必ず指定権者にご確認ください。';
    box.appendChild(noteP);

    box.appendChild(buildRestartRow());
    wrap.appendChild(box);
    return wrap;
  }

  function buildRestartRow() {
    const btnRow = document.createElement('div');
    btnRow.className = 'btn-row';
    const restart = document.createElement('button');
    restart.className = 'btn btn-ghost';
    restart.textContent = '← もう一度診断する';
    restart.addEventListener('click', function () { resetWizard(); });
    btnRow.appendChild(restart);
    return btnRow;
  }

  function labelCp(v, tokureiOk) {
    if (v === 'ok') return '整備済み';
    if (v === 'pledge') return tokureiOk ? '誓約により整備済み扱い' : '誓約したが⑧特例要件を満たさないため無効';
    return '未整備';
  }
  function labelPledgeSimple(v) {
    if (v === 'ok') return '満たす';
    if (v === 'pledge') return '誓約により満たす扱い';
    return '満たさない';
  }
  function labelEnv(v) {
    if (v === 'high') return '全体14以上（Ⅰ・Ⅱ水準）を満たす';
    if (v === 'low') return '全体8以上（Ⅲ・Ⅳ水準）を満たす';
    if (v === 'pledgeLow') return '全体8以上まで誓約';
    if (v === 'pledgeHigh') return '全体14以上まで誓約（⑧特例要件が前提）';
    return '未整備';
  }

  function resetWizard() {
    state.step = 0;
    state.service = null;
    state.tokurei = null;
    state.cp1 = state.cp2 = state.cp3 = state.cp4 = state.cp5 = state.env = null;
    render();
  }
}
