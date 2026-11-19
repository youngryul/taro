import React, { useMemo, useRef, useState } from 'react';
import './DevMode.css';
import { ReadingCards } from '../AskTarot/AskTarot';
import { ALL_CARDS, CARD_BY_KEY, cardImageUrl } from '../../data/universalTarot';
import { CATEGORIES, CATEGORY_BY_ID, CategoryId, SPREAD_BY_ID } from '../../data/knowledge';
import { ENGINE_VERSION, generateReading, readingToText } from '../../services/readingEngine';
import {
  deleteReading, devModeStore, exportAll, importAll, overridesStore, Reading, readingsStore,
  ReviewStatus, saveCardOverride, updateReading, updateReview, useStore,
} from '../../services/storage';

type Tab = 'readings' | 'cards' | 'stats' | 'backup';

const STATUS_LABEL: Record<ReviewStatus, string> = {
  new: '미검토',
  'needs-work': '보완 필요',
  reviewed: '검토 완료',
};

const formatDate = (t: number) =>
  new Date(t).toLocaleString('ko-KR', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' });

/**
 * 개발자 모드
 * - 답변 모음: 모든 질문/답변을 모아 보고, 평가·메모·보완 답변 작성
 * - 카드 해석: 카드별·카테고리별 해석을 보완 → 다음 답변부터 반영
 * - 통계 / 백업
 */
export const DevMode: React.FC = () => {
  const [tab, setTab] = useState<Tab>('readings');
  const [focusCard, setFocusCard] = useState<string>('m0');

  const openCard = (key: string) => {
    setFocusCard(key);
    setTab('cards');
  };

  return (
    <section className="dev">
      <header className="dev__header">
        <h2>🛠 개발자 모드</h2>
        <nav className="dev__tabs">
          {([
            ['readings', '답변 모음'],
            ['cards', '카드 해석 보완'],
            ['stats', '통계'],
            ['backup', '백업'],
          ] as [Tab, string][]).map(([id, label]) => (
            <button
              key={id}
              type="button"
              className={`dev__tab ${tab === id ? 'dev__tab--active' : ''}`}
              onClick={() => setTab(id)}
            >
              {label}
            </button>
          ))}
        </nav>
        <button type="button" className="dev__ghost" onClick={() => devModeStore.set(false)}>
          개발자 모드 끄기
        </button>
      </header>

      <div className="dev__body">
        {tab === 'readings' && <ReadingsTab onOpenCard={openCard} />}
        {tab === 'cards' && <CardsTab cardKey={focusCard} onSelect={setFocusCard} />}
        {tab === 'stats' && <StatsTab onOpenCard={openCard} />}
        {tab === 'backup' && <BackupTab />}
      </div>
    </section>
  );
};

/* ───────────────────────── 답변 모음 ───────────────────────── */

const ReadingsTab: React.FC<{ onOpenCard: (key: string) => void }> = ({ onOpenCard }) => {
  const readings = useStore(readingsStore);
  const [category, setCategory] = useState<CategoryId | 'all'>('all');
  const [status, setStatus] = useState<ReviewStatus | 'all'>('all');
  const [feedback, setFeedback] = useState<'all' | 'up' | 'down'>('all');
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const filtered = readings.filter(
    (r) =>
      (category === 'all' || r.category === category) &&
      (status === 'all' || r.review.status === status) &&
      (feedback === 'all' || r.userFeedback === feedback) &&
      (!query || r.question.includes(query))
  );
  const selected = readings.find((r) => r.id === selectedId) ?? filtered[0] ?? null;

  return (
    <div className="dev__split">
      <aside className="dev__list">
        <div className="dev__filters">
          <input placeholder="질문 검색" value={query} onChange={(e) => setQuery(e.target.value)} />
          <select value={category} onChange={(e) => setCategory(e.target.value as CategoryId | 'all')}>
            <option value="all">전체 카테고리</option>
            {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
          </select>
          <select value={status} onChange={(e) => setStatus(e.target.value as ReviewStatus | 'all')}>
            <option value="all">전체 상태</option>
            {Object.entries(STATUS_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
          <select value={feedback} onChange={(e) => setFeedback(e.target.value as 'all' | 'up' | 'down')}>
            <option value="all">사용자 반응 전체</option>
            <option value="up">👍 도움됨</option>
            <option value="down">👎 아쉬움</option>
          </select>
        </div>
        <p className="dev__count">{filtered.length}개 / 전체 {readings.length}개</p>
        {filtered.length === 0 && (
          <p className="dev__empty">아직 답변이 없습니다. ‘질문 타로’에서 질문을 해 보세요.</p>
        )}
        <ul>
          {filtered.map((r) => (
            <li key={r.id}>
              <button
                type="button"
                className={`dev__item ${selected?.id === r.id ? 'dev__item--active' : ''}`}
                onClick={() => setSelectedId(r.id)}
              >
                <span className="dev__item-top">
                  <span>{CATEGORY_BY_ID[r.category].icon} {CATEGORY_BY_ID[r.category].name}</span>
                  <span className={`dev__status dev__status--${r.review.status}`}>{STATUS_LABEL[r.review.status]}</span>
                </span>
                <span className="dev__item-q">{r.question}</span>
                <span className="dev__item-meta">
                  {formatDate(r.createdAt)} · {r.cards.map((c) => CARD_BY_KEY[c.key].nameKo).join(', ')}
                  {r.userFeedback && ` · ${r.userFeedback === 'up' ? '👍' : '👎'}`}
                  {r.review.rating ? ` · ★${r.review.rating}` : ''}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </aside>
      <div className="dev__detail">
        {selected ? (
          <ReadingDetail key={selected.id} reading={selected} onOpenCard={onOpenCard} />
        ) : (
          <p className="dev__empty">왼쪽에서 답변을 선택하세요.</p>
        )}
      </div>
    </div>
  );
};

const ReadingDetail: React.FC<{ reading: Reading; onOpenCard: (key: string) => void }> = ({ reading, onOpenCard }) => {
  const overrides = useStore(overridesStore);
  const [note, setNote] = useState(reading.review.note ?? '');
  const [improved, setImproved] = useState(reading.review.improvedAnswer ?? '');
  const [saved, setSaved] = useState(false);
  const cat = CATEGORY_BY_ID[reading.category];

  // 현재 카드 해석(보완 포함)으로 다시 만들면 어떻게 바뀌는지 미리보기
  const regenerated = useMemo(
    () => generateReading({ ...reading, overrides }),
    [reading, overrides]
  );
  const currentText = readingToText(reading.result);
  const regeneratedText = readingToText(regenerated);
  const changed = currentText !== regeneratedText;

  const saveReview = (status?: ReviewStatus) => {
    updateReview(reading.id, {
      note,
      improvedAnswer: improved,
      ...(status ? { status } : {}),
    });
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1500);
  };

  return (
    <div className="dev__reading">
      <div className="dev__reading-head">
        <div>
          <p className="dev__muted">
            {formatDate(reading.createdAt)} · {cat.icon} {cat.name} · {SPREAD_BY_ID[reading.spread].name} · 엔진 v{reading.engineVersion}
          </p>
          <h3>“{reading.question}”</h3>
        </div>
        <button
          type="button"
          className="dev__danger"
          onClick={() => window.confirm('이 답변 기록을 삭제할까요?') && deleteReading(reading.id)}
        >
          삭제
        </button>
      </div>

      <ReadingCards reading={reading} size="sm" />

      <div className="dev__grid2">
        <div>
          <h4>생성된 답변 {reading.userFeedback && <small>(사용자 {reading.userFeedback === 'up' ? '👍' : '👎'})</small>}</h4>
          <pre className="dev__pre">{currentText}</pre>
        </div>
        <div>
          <h4>
            현재 해석으로 재생성 {changed ? <small className="dev__changed">· 달라짐</small> : <small>· 동일</small>}
          </h4>
          <pre className="dev__pre">{regeneratedText}</pre>
          {changed && (
            <button
              type="button"
              className="dev__btn"
              onClick={() => updateReading(reading.id, { result: regenerated, engineVersion: ENGINE_VERSION })}
            >
              재생성 답변으로 교체
            </button>
          )}
        </div>
      </div>

      <div className="dev__review">
        <h4>검토</h4>
        <div className="dev__row">
          <span>평점</span>
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              className={`dev__star ${(reading.review.rating ?? 0) >= n ? 'dev__star--on' : ''}`}
              onClick={() => updateReview(reading.id, { rating: reading.review.rating === n ? undefined : n })}
            >
              ★
            </button>
          ))}
          <span className="dev__spacer" />
          {(Object.keys(STATUS_LABEL) as ReviewStatus[]).map((s) => (
            <button
              key={s}
              type="button"
              className={`dev__pill ${reading.review.status === s ? 'dev__pill--on' : ''}`}
              onClick={() => saveReview(s)}
            >
              {STATUS_LABEL[s]}
            </button>
          ))}
        </div>
        <label className="dev__label">
          메모 (무엇이 아쉬웠는지, 다음에 고칠 점)
          <textarea rows={2} value={note} onChange={(e) => setNote(e.target.value)} />
        </label>
        <label className="dev__label">
          보완 답변 — 저장하면 사용자 화면에 ‘타로 마스터의 답변’으로 대신 보여집니다
          <textarea rows={8} value={improved} onChange={(e) => setImproved(e.target.value)} />
        </label>
        <div className="dev__row">
          <button type="button" className="dev__ghost" onClick={() => setImproved(currentText)}>
            생성 답변을 복사해서 시작
          </button>
          <span className="dev__spacer" />
          {saved && <span className="dev__saved">저장됨 ✓</span>}
          <button type="button" className="dev__btn" onClick={() => saveReview()}>검토 저장</button>
        </div>
      </div>

      <div className="dev__review">
        <h4>카드 해석에 반영 — ‘{cat.name}’ 질문에서 이 카드가 나오면 다음부터 이 문장을 사용</h4>
        {reading.cards.map((c) => (
          <CategoryOverrideEditor
            key={c.key}
            cardKey={c.key}
            category={reading.category}
            onOpenCard={onOpenCard}
          />
        ))}
      </div>
    </div>
  );
};

const CategoryOverrideEditor: React.FC<{
  cardKey: string;
  category: CategoryId;
  compact?: boolean;
  onOpenCard?: (key: string) => void;
}> = ({ cardKey, category, compact = false, onOpenCard }) => {
  const overrides = useStore(overridesStore);
  const card = CARD_BY_KEY[cardKey];
  const initial = overrides[cardKey]?.byCategory?.[category] ?? '';
  const [text, setText] = useState(initial);
  const dirty = text !== initial;

  return (
    <div className="dev__override">
      {!compact && <img src={cardImageUrl(cardKey)} alt={card.nameKo} />}
      <div className="dev__override-body">
        {!compact && (
          <div className="dev__row">
            <strong>{card.nameKo}</strong>
            <span className="dev__muted">{card.name} · {card.astro}</span>
            <span className="dev__spacer" />
            {onOpenCard && (
              <button type="button" className="dev__ghost" onClick={() => onOpenCard(cardKey)}>카드 사전 열기</button>
            )}
          </div>
        )}
        <textarea
          rows={3}
          value={text}
          placeholder={`비워 두면 문서 해석을 사용합니다: ${card.summary}`}
          onChange={(e) => setText(e.target.value)}
        />
        <div className="dev__row">
          <span className="dev__spacer" />
          <button
            type="button"
            className="dev__btn"
            disabled={!dirty}
            onClick={() => saveCardOverride(cardKey, { byCategory: { [category]: text } })}
          >
            {dirty ? '반영' : '반영됨'}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ───────────────────────── 카드 해석 보완 ───────────────────────── */

const CardsTab: React.FC<{ cardKey: string; onSelect: (key: string) => void }> = ({ cardKey, onSelect }) => {
  const overrides = useStore(overridesStore);
  const readings = useStore(readingsStore);
  const [query, setQuery] = useState('');
  const card = CARD_BY_KEY[cardKey];

  const appearances = readings.filter((r) => r.cards.some((c) => c.key === cardKey));
  const rated = appearances.filter((r) => r.review.rating);
  const avg = rated.length ? rated.reduce((s, r) => s + (r.review.rating ?? 0), 0) / rated.length : null;

  const list = ALL_CARDS.filter(
    (c) => !query || c.nameKo.includes(query) || c.name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="dev__split">
      <aside className="dev__list">
        <div className="dev__filters">
          <input placeholder="카드 검색 (예: 여제, cups)" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        <ul className="dev__card-list">
          {list.map((c) => {
            const o = overrides[c.key];
            const n = (o?.summary ? 1 : 0) + Object.keys(o?.byCategory ?? {}).length;
            return (
              <li key={c.key}>
                <button
                  type="button"
                  className={`dev__item dev__item--card ${c.key === cardKey ? 'dev__item--active' : ''}`}
                  onClick={() => onSelect(c.key)}
                >
                  <img src={cardImageUrl(c.key)} alt="" loading="lazy" />
                  <span>
                    {c.nameKo}
                    <small>{c.name}</small>
                  </span>
                  {n > 0 && <span className="dev__badge">{n}</span>}
                </button>
              </li>
            );
          })}
        </ul>
      </aside>

      <div className="dev__detail">
        <div className="dev__card-head">
          <img src={cardImageUrl(cardKey)} alt={card.nameKo} />
          <div>
            <h3>{card.nameKo} <small>{card.name}</small></h3>
            <p className="dev__muted">{card.astro} · 키워드: {card.keywords.join(', ')}</p>
            <p className="dev__muted">
              뽑힌 횟수 {appearances.length}회{avg !== null && ` · 포함된 답변 평균 ★${avg.toFixed(1)}`}
            </p>
            <h4>문서 원문</h4>
            <ul className="dev__notes">
              {card.notes.map((n) => <li key={n}>{n}</li>)}
            </ul>
          </div>
        </div>

        <SummaryEditor key={cardKey} cardKey={cardKey} />

        <div className="dev__review">
          <h4>카테고리별 해석 (있으면 이 문장이 우선 사용됨)</h4>
          {CATEGORIES.map((c) => (
            <div key={`${cardKey}-${c.id}`} className="dev__cat-override">
              <span className="dev__cat-label">{c.icon} {c.name}</span>
              <CategoryOverrideEditor cardKey={cardKey} category={c.id} compact />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const SummaryEditor: React.FC<{ cardKey: string }> = ({ cardKey }) => {
  const overrides = useStore(overridesStore);
  const saved = overrides[cardKey]?.summary ?? '';
  const [summary, setSummary] = useState(saved);

  return (
    <div className="dev__review">
      <h4>기본 요약 (모든 카테고리 공통)</h4>
      <textarea
        rows={2}
        value={summary}
        placeholder={CARD_BY_KEY[cardKey].summary}
        onChange={(e) => setSummary(e.target.value)}
      />
      <div className="dev__row">
        <span className="dev__muted">비워 두면 문서 요약을 사용합니다.</span>
        <span className="dev__spacer" />
        <button
          type="button"
          className="dev__btn"
          disabled={summary === saved}
          onClick={() => saveCardOverride(cardKey, { summary })}
        >
          저장
        </button>
      </div>
    </div>
  );
};

/* ───────────────────────── 통계 ───────────────────────── */

const StatsTab: React.FC<{ onOpenCard: (key: string) => void }> = ({ onOpenCard }) => {
  const readings = useStore(readingsStore);
  const overrides = useStore(overridesStore);

  const byCategory = CATEGORIES.map((c) => ({ c, n: readings.filter((r) => r.category === c.id).length }));
  const maxCat = Math.max(1, ...byCategory.map((x) => x.n));
  const up = readings.filter((r) => r.userFeedback === 'up').length;
  const down = readings.filter((r) => r.userFeedback === 'down').length;
  const reviewed = readings.filter((r) => r.review.status === 'reviewed').length;
  const needs = readings.filter((r) => r.review.status === 'needs-work').length;
  const rated = readings.filter((r) => r.review.rating);
  const avg = rated.length ? rated.reduce((s, r) => s + (r.review.rating ?? 0), 0) / rated.length : null;
  const overrideCount = Object.values(overrides).reduce(
    (s, o) => s + (o.summary ? 1 : 0) + Object.keys(o.byCategory ?? {}).length, 0
  );

  const cardCount = new Map<string, number>();
  readings.forEach((r) => r.cards.forEach((c) => cardCount.set(c.key, (cardCount.get(c.key) ?? 0) + 1)));
  const top = Array.from(cardCount.entries()).sort((a, b) => b[1] - a[1]).slice(0, 10);

  return (
    <div className="dev__stats">
      <div className="dev__tiles">
        <Tile label="전체 답변" value={readings.length} />
        <Tile label="검토 완료" value={`${reviewed}`} sub={readings.length ? `${Math.round((reviewed / readings.length) * 100)}%` : ''} />
        <Tile label="보완 필요" value={needs} />
        <Tile label="사용자 반응" value={`👍 ${up} · 👎 ${down}`} />
        <Tile label="평균 평점" value={avg !== null ? `★ ${avg.toFixed(2)}` : '-'} sub={`${rated.length}건 평가`} />
        <Tile label="보완한 해석" value={overrideCount} />
      </div>

      <div className="dev__review">
        <h4>카테고리별 질문 수</h4>
        {byCategory.map(({ c, n }) => (
          <div key={c.id} className="dev__bar">
            <span>{c.icon} {c.name}</span>
            <div><i style={{ width: `${(n / maxCat) * 100}%` }} /></div>
            <b>{n}</b>
          </div>
        ))}
      </div>

      <div className="dev__review">
        <h4>가장 많이 나온 카드</h4>
        {top.length === 0 && <p className="dev__empty">데이터가 없습니다.</p>}
        <div className="dev__top-cards">
          {top.map(([key, n]) => (
            <button key={key} type="button" onClick={() => onOpenCard(key)}>
              <img src={cardImageUrl(key)} alt="" />
              <span>{CARD_BY_KEY[key].nameKo}</span>
              <b>{n}회</b>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

const Tile: React.FC<{ label: string; value: React.ReactNode; sub?: string }> = ({ label, value, sub }) => (
  <div className="dev__tile">
    <span>{label}</span>
    <b>{value}</b>
    {sub && <small>{sub}</small>}
  </div>
);

/* ───────────────────────── 백업 ───────────────────────── */

const BackupTab: React.FC = () => {
  const fileRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState('');

  const download = () => {
    const blob = new Blob([JSON.stringify(exportAll(), null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `taro-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const onFile = async (file: File | undefined, mode: 'merge' | 'replace') => {
    if (!file) return;
    try {
      importAll(JSON.parse(await file.text()), mode);
      setMessage(`가져오기 완료 (${mode === 'merge' ? '합치기' : '덮어쓰기'})`);
    } catch {
      setMessage('JSON 파일을 읽지 못했습니다.');
    }
  };

  return (
    <div className="dev__stats">
      <div className="dev__review">
        <h4>내보내기</h4>
        <p className="dev__muted">
          답변 기록과 보완한 카드 해석은 이 브라우저(localStorage)에만 저장됩니다.
          주기적으로 내려받아 두거나, 다른 기기로 옮길 때 사용하세요.
        </p>
        <button type="button" className="dev__btn" onClick={download}>JSON 내려받기</button>
      </div>
      <div className="dev__review">
        <h4>가져오기</h4>
        <input ref={fileRef} type="file" accept="application/json" />
        <div className="dev__row">
          <button type="button" className="dev__btn" onClick={() => onFile(fileRef.current?.files?.[0], 'merge')}>합치기</button>
          <button
            type="button"
            className="dev__danger"
            onClick={() => window.confirm('현재 데이터를 모두 덮어쓸까요?') && onFile(fileRef.current?.files?.[0], 'replace')}
          >
            덮어쓰기
          </button>
          {message && <span className="dev__saved">{message}</span>}
        </div>
      </div>
    </div>
  );
};
