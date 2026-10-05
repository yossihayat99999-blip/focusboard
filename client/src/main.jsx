import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { api } from './api';
import './styles.css';

const tokenKey = 'focusboard_token';

function AuthScreen({ onAuthenticated }) {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ username: '', password: '', email: '', number: '' });
  const [verificationToken, setVerificationToken] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);

  const update = (event) => setForm({ ...form, [event.target.name]: event.target.value });

  async function submit(event) {
    event.preventDefault();
    setError('');
    setNotice('');
    setBusy(true);
    try {
      if (mode === 'login') {
        const result = await api.login({ username: form.username, password: form.password });
        localStorage.setItem(tokenKey, result.token);
        onAuthenticated();
      } else {
        const result = await api.register(form);
        setVerificationToken(result.verificationToken);
        setMode('verify');
        setNotice('נשלח אליך קוד אימות. הזן אותו כדי להפעיל את החשבון.');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function verify(event) {
    event.preventDefault();
    setError('');
    setBusy(true);
    try {
      await api.verify({ verificationToken, code });
      setNotice('החשבון אומת. אפשר להתחבר עכשיו.');
      setMode('login');
      setCode('');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function resend() {
    setError('');
    setBusy(true);
    try {
      await api.resend(verificationToken);
      setNotice('קוד חדש נשלח אליך.');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function requestPasswordRecovery(event) {
    event.preventDefault();
    setError('');
    setNotice('');
    setBusy(true);
    try {
      const result = await api.passwordRecovery(form.email);
      setVerificationToken(result.verificationToken || '');
      setMode('recovery-code');
      setNotice('אם החשבון קיים, נשלח אליו קוד שחזור.');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function verifyPasswordRecovery(event) {
    event.preventDefault();
    setError('');
    setNotice('');
    setBusy(true);
    try {
      const result = await api.verifyPasswordRecovery({ verificationToken, code });
      setResetToken(result.verificationToken);
      setMode('reset-password');
      setCode('');
      setNotice('הקוד אומת. בחר סיסמה חדשה.');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function resetPassword(event) {
    event.preventDefault();
    setError('');
    setNotice('');
    setBusy(true);
    try {
      await api.resetPassword({ resetToken, newPassword: form.password });
      setMode('login');
      setForm({ ...form, password: '' });
      setResetToken('');
      setNotice('הסיסמה עודכנה. אפשר להתחבר.');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  if (mode === 'forgot-password') {
    return <AuthStep title="שחזור סיסמה" subtitle="נשלח קוד לכתובת הדוא״ל שלך" error={error} notice={notice} onBack={() => setMode('login')}>
      <form onSubmit={requestPasswordRecovery} className="stack-form">
        <label>דוא״ל<input autoFocus type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required /></label>
        {error && <div className="alert error">{error}</div>}
        {notice && <div className="alert success">{notice}</div>}
        <button className="primary-button" disabled={busy}>{busy ? 'שולח...' : 'שלח קוד שחזור'}</button>
      </form>
    </AuthStep>;
  }

  if (mode === 'recovery-code') {
    return <AuthStep title="אימות שחזור" subtitle="הזן את הקוד שקיבלת בדוא״ל" error={error} notice={notice} onBack={() => setMode('forgot-password')}>
      <form onSubmit={verifyPasswordRecovery} className="stack-form">
        <label>קוד שחזור<input autoFocus inputMode="numeric" maxLength="6" value={code} onChange={(e) => setCode(e.target.value)} placeholder="000000" required /></label>
        {error && <div className="alert error">{error}</div>}
        {notice && <div className="alert success">{notice}</div>}
        <button className="primary-button" disabled={busy}>{busy ? 'בודק...' : 'אמת קוד'}</button>
      </form>
    </AuthStep>;
  }

  if (mode === 'reset-password') {
    return <AuthStep title="סיסמה חדשה" subtitle="בחר סיסמה חזקה וחדשה לחשבון" error={error} notice={notice} onBack={() => setMode('recovery-code')}>
      <form onSubmit={resetPassword} className="stack-form">
        <label>סיסמה חדשה<input autoFocus type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required /></label>
        {error && <div className="alert error">{error}</div>}
        {notice && <div className="alert success">{notice}</div>}
        <button className="primary-button" disabled={busy}>{busy ? 'מעדכן...' : 'עדכן סיסמה'}</button>
      </form>
    </AuthStep>;
  }

  if (mode === 'verify') {
    return (
      <main className="auth-shell">
        <section className="auth-art">
          <div className="eyebrow">FOCUSBOARD / 02</div>
          <h1>התחלה טובה<br /><em>מתחילה באישור.</em></h1>
          <p>קוד קצר, חשבון בטוח, וסמסטר מסודר יותר.</p>
        </section>
        <section className="auth-panel">
          <span className="brand-mark">FB</span>
          <div className="auth-heading"><span>אימות חשבון</span><h2>בדוק את המייל</h2></div>
          <p className="muted">שלחנו קוד בן 6 ספרות לכתובת שהזנת.</p>
          <form onSubmit={verify} className="stack-form">
            <label>קוד אימות<input autoFocus inputMode="numeric" maxLength="6" value={code} onChange={(e) => setCode(e.target.value)} placeholder="000000" /></label>
            {error && <div className="alert error">{error}</div>}
            {notice && <div className="alert success">{notice}</div>}
            <button className="primary-button" disabled={busy}>{busy ? 'בודק...' : 'אמת חשבון'}</button>
          </form>
          <button className="text-button" onClick={resend} disabled={busy}>לא קיבלתי קוד, שלח שוב</button>
          <button className="back-button" onClick={() => setMode('login')}>חזרה להתחברות</button>
        </section>
      </main>
    );
  }

  return (
    <main className="auth-shell">
      <section className="auth-art">
        <div className="eyebrow">FOCUSBOARD / 01</div>
        <h1>הסמסטר שלך,<br /><em>בפוקוס.</em></h1>
        <p>קורסים, מטלות ותזכורות. מקום אחד שזוכר בשבילך מה הבא.</p>
        <div className="art-stats"><div><strong>01</strong><span>לוח עבודה</span></div><div><strong>24/7</strong><span>בהישג יד</span></div></div>
        <div className="depth-scene" aria-hidden="true"><div className="depth-card card-back">קורסים</div><div className="depth-card card-mid">מטלות</div><div className="depth-card card-front"><b>FOCUS</b><span>הסמסטר שלך</span></div></div>
      </section>
      <section className="auth-panel">
        <span className="brand-mark">FB</span>
        <div className="auth-heading"><span>{mode === 'login' ? 'ברוך שובך' : 'מתחילים כאן'}</span><h2>{mode === 'login' ? 'התחבר לחשבון' : 'צור חשבון'}</h2></div>
        <form onSubmit={submit} className="stack-form">
          <label>שם משתמש<input name="username" value={form.username} onChange={update} required /></label>
          {mode === 'register' && <><label>דוא״ל<input type="email" name="email" value={form.email} onChange={update} required /></label><label>טלפון<input name="number" value={form.number} onChange={update} required /></label></>}
          <label>סיסמה<input type="password" name="password" value={form.password} onChange={update} required /></label>
          {error && <div className="alert error">{error}</div>}
          {notice && <div className="alert success">{notice}</div>}
          <button className="primary-button" disabled={busy}>{busy ? 'רק רגע...' : mode === 'login' ? 'כניסה ללוח' : 'יצירת חשבון'}</button>
        </form>
        {mode === 'login' && <button className="text-button recovery-link" onClick={() => { setMode('forgot-password'); setError(''); setNotice(''); }}>שכחתי סיסמה</button>}
        <button className="switch-button" onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}>{mode === 'login' ? 'אין לך חשבון? הרשמה' : 'כבר רשום? התחברות'}</button>
      </section>
    </main>
  );
}

function AuthStep({ title, subtitle, error, notice, onBack, children }) {
  return <main className="auth-shell"><section className="auth-art"><div className="eyebrow">FOCUSBOARD / RECOVERY</div><h1>חוזרים<br /><em>לפוקוס.</em></h1><p>נשמור על החשבון שלך ונחזיר אותך ללוח במהירות.</p></section><section className="auth-panel"><span className="brand-mark">FB</span><div className="auth-heading"><span>אבטחת חשבון</span><h2>{title}</h2></div><p className="muted">{subtitle}</p>{children}<button className="back-button" onClick={onBack}>חזרה</button></section></main>;
}

function App() {
  const [authenticated, setAuthenticated] = useState(Boolean(localStorage.getItem(tokenKey)));
  return authenticated ? <Dashboard onLogout={() => { localStorage.removeItem(tokenKey); setAuthenticated(false); }} /> : <AuthScreen onAuthenticated={() => setAuthenticated(true)} />;
}

function Dashboard({ onLogout }) {
  const [tab, setTab] = useState('overview');
  const [courses, setCourses] = useState([]);
  const [lecturers, setLecturers] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [modal, setModal] = useState(null);

  useEffect(() => {
    if (!notice) return undefined;
    const timeout = setTimeout(() => setNotice(''), 3500);
    return () => clearTimeout(timeout);
  }, [notice]);

  async function load() {
    setLoading(true);
    try {
      const [courseData, lecturerData, assignmentData] = await Promise.all([api.courses(), api.lecturers(), api.assignments()]);
      setCourses(Array.isArray(courseData) ? courseData : []);
      setLecturers(Array.isArray(lecturerData) ? lecturerData : []);
      setAssignments(Array.isArray(assignmentData) ? assignmentData : []);
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  const incomplete = assignments.filter((item) => !item.is_completed);
  const overdue = incomplete.filter((item) => new Date(item.due_date) < new Date());
  const upcoming = incomplete.filter((item) => new Date(item.due_date) >= new Date()).slice(0, 5);
  const completedPercent = assignments.length ? Math.round((assignments.filter((item) => item.is_completed).length / assignments.length) * 100) : 0;

  async function toggleAssignment(item) {
    try { await api.updateAssignment(item.id, { is_completed: !item.is_completed }); setNotice(item.is_completed ? 'המטלה חזרה לרשימה הפתוחה.' : 'המטלה סומנה כהושלמה.'); await load(); } catch (err) { setError(err.message); }
  }
  async function removeAssignment(id) {
    if (!window.confirm('למחוק את המטלה הזו?')) return;
    try { await api.deleteAssignment(id); setNotice('המטלה נמחקה.'); await load(); } catch (err) { setError(err.message); }
  }
  async function removeCourse(id) {
    if (!window.confirm('למחוק את הקורס הזה?')) return;
    try { await api.deleteCourse(id); setNotice('הקורס נמחק.'); await load(); } catch (err) { setError(err.message); }
  }
  async function removeLecturer(id) {
    if (!window.confirm('למחוק את המרצה הזה?')) return;
    try { await api.deleteLecturer(id); setNotice('המרצה נמחק.'); await load(); } catch (err) { setError(err.message); }
  }

  async function saveEdit(type, item, form) {
    try {
      if (type === 'assignment') await api.updateAssignment(item.id, { ...form, course_id: Number(form.course_id) });
      if (type === 'course') await api.updateCourse(item.id, { ...form, lecturer_id: Number(form.lecturer_id) });
      if (type === 'lecturer') await api.updateLecturer(item.id, form);
      setModal(null);
      setNotice('השינויים נשמרו.');
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-brand"><span className="brand-mark">FB</span><div><b>focusboard</b><small>semester workspace</small></div></div>
        <nav>{[['overview', 'סקירה'], ['assignments', 'מטלות'], ['courses', 'קורסים'], ['lecturers', 'מרצים']].map(([id, label]) => <button key={id} className={tab === id ? 'nav-item active' : 'nav-item'} onClick={() => setTab(id)}><span className="nav-dot" />{label}</button>)}</nav>
        <div className="sidebar-bottom"><div className="semester-card"><span>הסמסטר הנוכחי</span><strong>אביב 2026</strong><small>{courses.length} קורסים פעילים</small></div><button className="logout" onClick={onLogout}>יציאה מהמערכת <span>↗</span></button></div>
      </aside>
      <main className="main-content">
        <header className="topbar"><div><span className="date-label">{new Intl.DateTimeFormat('he-IL', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date())}</span><h1>{tab === 'overview' ? 'בוקר טוב, הגיע הזמן להתמקד.' : tab === 'assignments' ? 'כל המטלות' : tab === 'courses' ? 'הקורסים שלי' : 'המרצים שלי'}</h1></div><div className="topbar-actions"><button className="refresh-button" onClick={load} aria-label="רענון נתונים" title="רענון נתונים">↻</button><button className="quick-add" onClick={() => setModal({ type: 'assignment' })}>+ מטלה חדשה</button></div></header>
        {error && <div className="alert error page-alert">{error}</div>}
        {notice && <div className="toast success" role="status">{notice}</div>}
        {loading ? <LoadingState /> : <>{tab === 'overview' && <Overview assignments={assignments} incomplete={incomplete} overdue={overdue} upcoming={upcoming} completedPercent={completedPercent} toggle={toggleAssignment} onAdd={() => setModal({ type: 'assignment' })} />}{tab === 'assignments' && <AssignmentsView assignments={assignments} courses={courses} toggle={toggleAssignment} remove={removeAssignment} onAdd={() => setModal({ type: 'assignment' })} onEdit={(item) => setModal({ type: 'assignment', item })} />}{tab === 'courses' && <CoursesView courses={courses} lecturers={lecturers} onAdd={() => setModal({ type: 'course' })} onEdit={(item) => setModal({ type: 'course', item })} remove={removeCourse} />}{tab === 'lecturers' && <LecturersView lecturers={lecturers} onAdd={() => setModal({ type: 'lecturer' })} onEdit={(item) => setModal({ type: 'lecturer', item })} remove={removeLecturer} />}</>}</main>
      {modal && <ModalEditor type={modal.type} item={modal.item} courses={courses} lecturers={lecturers} onClose={() => setModal(null)} onSaved={() => { setModal(null); load(); }} onEditSaved={saveEdit} />}
    </div>
  );
}

function Overview({ assignments, incomplete, overdue, upcoming, completedPercent, toggle, onAdd }) {
  return <>
    <section className="metric-grid"><Metric label="מטלות פתוחות" value={incomplete.length} detail="מחכות לטיפול" tone="sage" /><Metric label="השבוע" value={upcoming.length} detail="מטלות קרובות" tone="coral" /><Metric label="באיחור" value={overdue.length} detail="דורשות תשומת לב" tone="yellow" /><Metric label="השלמה" value={`${completedPercent}%`} detail="מהמטלות שלך" tone="ink" /></section>
    <section className="content-grid"><div className="panel focus-panel"><div className="panel-heading"><div><span className="kicker">הפוקוס הבא</span><h2>מה צריך לקרות עכשיו</h2></div><button className="link-button" onClick={onAdd}>+ הוסף מטלה</button></div>{upcoming.length ? upcoming.map((item) => <AssignmentRow key={item.id} item={item} toggle={toggle} />) : <Empty title="הלוח נקי" text="הוסף את המטלה הבאה שלך כדי להתחיל." />}</div><div className="panel progress-panel"><span className="kicker">התקדמות הסמסטר</span><h2>{completedPercent}%</h2><div className="progress-track"><span style={{ width: `${completedPercent}%` }} /></div><p>{assignments.filter((item) => item.is_completed).length} מתוך {assignments.length || 0} מטלות הושלמו</p><div className="progress-note">עוד צעד קטן, והיום הזה מסודר.</div></div></section>
  </>;
}

function AssignmentRow({ item, toggle, showActions = false, remove, edit }) {
  return <div className={item.is_completed ? 'assignment-row completed' : 'assignment-row'}><button className="check" onClick={() => toggle(item)}>{item.is_completed ? '✓' : ''}</button><div className="assignment-info"><strong>{item.title}</strong><span>{item.Course?.name || item.Cours?.name || 'ללא קורס'} · {new Date(item.due_date).toLocaleDateString('he-IL')}</span></div>{new Date(item.due_date) < new Date() && !item.is_completed && <span className="status-pill late">באיחור</span>}{showActions && <><button className="edit-small" onClick={() => edit(item)}>עריכה</button><button className="delete-small" onClick={() => remove(item.id)}>מחיקה</button></>}</div>;
}
function Metric({ label, value, detail, tone }) { return <div className={`metric ${tone}`}><span>{label}</span><strong>{value}</strong><small>{detail}</small></div> }
function Empty({ title, text }) { return <div className="empty"><strong>{title}</strong><span>{text}</span></div> }
function LoadingState() { return <section className="loading-state" aria-live="polite"><div className="loading-spinner" /><strong>מסדרים את הלוח שלך...</strong><span>עוד רגע והכול במקום.</span><div className="skeleton-row" /><div className="skeleton-row short" /></section> }

function AssignmentsView({ assignments, courses, toggle, remove, onAdd, onEdit }) {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [courseId, setCourseId] = useState('all');
  const [sort, setSort] = useState('date-asc');
  const filtered = useMemo(() => assignments.filter((item) => {
    const course = item.Course?.name || item.Cours?.name || '';
    const matchesSearch = `${item.title} ${course}`.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = status === 'all' || (status === 'open' && !item.is_completed) || (status === 'done' && item.is_completed) || (status === 'late' && !item.is_completed && new Date(item.due_date) < new Date());
    const matchesCourse = courseId === 'all' || String(item.course_id) === courseId;
    return matchesSearch && matchesStatus && matchesCourse;
  }).sort((a, b) => sort === 'title' ? a.title.localeCompare(b.title, 'he') : sort === 'date-desc' ? new Date(b.due_date) - new Date(a.due_date) : new Date(a.due_date) - new Date(b.due_date)), [assignments, search, status, courseId, sort]);
  return <section className="panel full-panel"><div className="panel-heading"><div><span className="kicker">רשימה מלאה</span><h2>{filtered.length} מתוך {assignments.length} מטלות</h2></div><button className="primary-button compact" onClick={onAdd}>+ מטלה חדשה</button></div><div className="filters"><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="חיפוש מטלה או קורס" /><select value={status} onChange={(e) => setStatus(e.target.value)}><option value="all">כל הסטטוסים</option><option value="open">פתוחות</option><option value="done">הושלמו</option><option value="late">באיחור</option></select><select value={courseId} onChange={(e) => setCourseId(e.target.value)}><option value="all">כל הקורסים</option>{courses.map((course) => <option key={course.id} value={course.id}>{course.name}</option>)}</select><select value={sort} onChange={(e) => setSort(e.target.value)}><option value="date-asc">תאריך: קרוב לרחוק</option><option value="date-desc">תאריך: רחוק לקרוב</option><option value="title">שם: א-ת</option></select></div>{filtered.length ? filtered.map((item) => <AssignmentRow key={item.id} item={item} toggle={toggle} showActions remove={remove} edit={onEdit} />) : <Empty title="אין תוצאות" text="נסה לשנות את הסינון או ליצור מטלה חדשה." />}</section>;
}
function CoursesView({ courses, lecturers, onAdd, onEdit, remove }) {
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('name');
  const visible = useMemo(() => courses.filter((course) => course.name.toLowerCase().includes(search.toLowerCase())).sort((a, b) => sort === 'newest' ? b.id - a.id : a.name.localeCompare(b.name, 'he')), [courses, search, sort]);
  return <section className="panel full-panel"><div className="panel-heading"><div><span className="kicker">המרחב האקדמי</span><h2>{visible.length} מתוך {courses.length} קורסים</h2></div><button className="primary-button compact" onClick={onAdd}>+ קורס חדש</button></div><div className="filters compact-filters"><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="חיפוש קורס" /><select value={sort} onChange={(e) => setSort(e.target.value)}><option value="name">שם: א-ת</option><option value="newest">נוספו לאחרונה</option></select></div><div className="card-grid">{visible.map((course) => <div className="entity-card" key={course.id}><span className="entity-index">{String(course.id).padStart(2, '0')}</span><h3>{course.name}</h3><p>{course.Lecturer?.name || course.lecturer?.name || lecturers.find((item) => item.id === course.lecturer_id)?.name || 'מרצה לא שויך'}</p><button className="edit-small" onClick={() => onEdit(course)}>עריכה</button><button className="delete-small" onClick={() => remove(course.id)}>מחיקה</button></div>)}</div>{!visible.length && <Empty title="אין תוצאות" text="נסה חיפוש אחר או הוסף קורס חדש." />}</section>;
}
function LecturersView({ lecturers, onAdd, onEdit, remove }) {
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('name');
  const visible = useMemo(() => lecturers.filter((person) => `${person.name} ${person.email}`.toLowerCase().includes(search.toLowerCase())).sort((a, b) => sort === 'newest' ? b.id - a.id : a.name.localeCompare(b.name, 'he')), [lecturers, search, sort]);
  return <section className="panel full-panel"><div className="panel-heading"><div><span className="kicker">אנשים וקשרים</span><h2>{visible.length} מתוך {lecturers.length} מרצים</h2></div><button className="primary-button compact" onClick={onAdd}>+ מרצה חדש</button></div><div className="filters compact-filters"><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="חיפוש לפי שם או דוא״ל" /><select value={sort} onChange={(e) => setSort(e.target.value)}><option value="name">שם: א-ת</option><option value="newest">נוספו לאחרונה</option></select></div><div className="card-grid">{visible.map((person) => <div className="entity-card lecturer-card" key={person.id}><span className="avatar">{person.name?.slice(0, 1)}</span><h3>{person.name}</h3><p>{person.email}</p><button className="edit-small" onClick={() => onEdit(person)}>עריכה</button><button className="delete-small" onClick={() => remove(person.id)}>מחיקה</button></div>)}</div>{!visible.length && <Empty title="אין תוצאות" text="נסה חיפוש אחר או הוסף מרצה חדש." />}</section>;
}

function ModalEditor({ type, item, courses, lecturers, onClose, onSaved, onEditSaved }) {
  const initial = type === 'assignment'
    ? { title: item?.title || '', course_id: item?.course_id || courses[0]?.id || '', due_date: item?.due_date ? new Date(item.due_date).toISOString().slice(0, 16) : '', is_completed: Boolean(item?.is_completed) }
    : type === 'course'
      ? { name: item?.name || '', lecturer_id: item?.lecturer_id || lecturers[0]?.id || '' }
      : { name: item?.name || '', email: item?.email || '' };
  const [form, setForm] = useState(initial);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const update = (event) => setForm({ ...form, [event.target.name]: event.target.type === 'checkbox' ? event.target.checked : event.target.value });
  async function save(event) {
    event.preventDefault();
    setError('');
    setBusy(true);
    try {
      if (item) await onEditSaved(type, item, form);
      else if (type === 'assignment') await api.createAssignment({ ...form, course_id: Number(form.course_id) });
      else if (type === 'course') await api.createCourse({ ...form, lecturer_id: Number(form.lecturer_id) });
      else await api.createLecturer(form);
      if (!item) onSaved();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }
  const title = item ? 'עריכת' : 'יצירת';
  return <div className="modal-backdrop" onMouseDown={onClose}><div className="modal" onMouseDown={(event) => event.stopPropagation()}><button className="modal-close" onClick={onClose}>×</button><span className="kicker">{title} מידע</span><h2>{type === 'assignment' ? `${title} מטלה` : type === 'course' ? `${title} קורס` : `${title} מרצה`}</h2><form className="stack-form" onSubmit={save}>{type === 'assignment' ? <><label>שם המטלה<input name="title" value={form.title} onChange={update} required /></label><label>קורס<select name="course_id" value={form.course_id} onChange={update} required>{courses.map((course) => <option key={course.id} value={course.id}>{course.name}</option>)}</select></label><label>תאריך יעד<input type="datetime-local" name="due_date" value={form.due_date} onChange={update} required /></label><label className="checkbox-label"><input type="checkbox" name="is_completed" checked={form.is_completed} onChange={update} /> הושלמה</label></> : type === 'course' ? <><label>שם הקורס<input name="name" value={form.name} onChange={update} required /></label><label>מרצה<select name="lecturer_id" value={form.lecturer_id} onChange={update} required>{lecturers.map((lecturer) => <option key={lecturer.id} value={lecturer.id}>{lecturer.name}</option>)}</select></label></> : <><label>שם המרצה<input name="name" value={form.name} onChange={update} required /></label><label>דוא״ל<input type="email" name="email" value={form.email} onChange={update} required /></label></>}{error && <div className="alert error">{error}</div>}<button className="primary-button" disabled={busy}>{busy ? 'שומר...' : 'שמירה'}</button></form></div></div>;
}

function Modal({ type, courses, lecturers, onClose, onSaved }) { const [form, setForm] = useState(type === 'assignment' ? { title: '', course_id: courses[0]?.id || '', due_date: '', is_completed: false } : type === 'course' ? { name: '', lecturer_id: lecturers[0]?.id || '' } : { name: '', email: '' }); const [error, setError] = useState(''); const update = (e) => setForm({ ...form, [e.target.name]: e.target.value }); async function save(e) { e.preventDefault(); setError(''); try { if (type === 'assignment') await api.createAssignment({ ...form, course_id: Number(form.course_id) }); else if (type === 'course') await api.createCourse({ ...form, lecturer_id: Number(form.lecturer_id) }); else await api.createLecturer(form); onSaved(); } catch (err) { setError(err.message); } } return <div className="modal-backdrop" onMouseDown={onClose}><div className="modal" onMouseDown={(e) => e.stopPropagation()}><button className="modal-close" onClick={onClose}>×</button><span className="kicker">יצירה חדשה</span><h2>{type === 'assignment' ? 'מטלה חדשה' : type === 'course' ? 'קורס חדש' : 'מרצה חדש'}</h2><form className="stack-form" onSubmit={save}>{type === 'assignment' ? <><label>שם המטלה<input name="title" value={form.title} onChange={update} required /></label><label>קורס<select name="course_id" value={form.course_id} onChange={update} required>{courses.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label><label>תאריך יעד<input type="datetime-local" name="due_date" value={form.due_date} onChange={update} required /></label></> : type === 'course' ? <><label>שם הקורס<input name="name" value={form.name} onChange={update} required /></label><label>מרצה<select name="lecturer_id" value={form.lecturer_id} onChange={update} required>{lecturers.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label></> : <><label>שם המרצה<input name="name" value={form.name} onChange={update} required /></label><label>דוא״ל<input type="email" name="email" value={form.email} onChange={update} required /></label></>}{error && <div className="alert error">{error}</div>}<button className="primary-button">שמירה</button></form></div></div> }

createRoot(document.getElementById('root')).render(<App />);
