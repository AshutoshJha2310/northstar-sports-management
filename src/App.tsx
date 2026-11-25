import { useMemo, useState, type Dispatch, type SetStateAction } from 'react';
import {
  Activity, ArrowDownRight, ArrowRight, ArrowUpRight, Bell, CalendarDays,
  Check, ChevronDown, ChevronLeft, ChevronRight, CircleHelp, Clock3, Download,
  Dumbbell, Ellipsis, Filter, Flag, LayoutDashboard, MapPin, Menu, Plus, Search, Trash2,
  Settings2, Shield, Trophy, UserRound, Users, Wallet, X,
} from 'lucide-react';
import { readStored, writeStored } from './storage';

type View = 'Overview' | 'Athletes' | 'Schedule' | 'Teams' | 'Finance';
type Athlete = { id: string; name: string; initials: string; sport: string; position: string; status: string; attendance: string; color: string };
type Fixture = { id: string; dateKey: string; sport: string; opponent: string; venue: string; time: string; kind: string; color: string };
type Team = { id: string; name: string; sport: string; athletes: number; coach: string; record: string; color: string; initials: string };
type Transaction = { id: string; title: string; dateKey: string; amount: number; kind: 'received' | 'spent' };
type ModalKind = 'athlete' | 'event' | 'team' | 'transaction';

const initialAthletes: Athlete[] = [
  { id: 'athlete-jordan-lee', name: 'Jordan Lee', initials: 'JL', sport: 'Basketball', position: 'Point guard', status: 'Active', attendance: '96%', color: 'coral' },
  { id: 'athlete-maya-patel', name: 'Maya Patel', initials: 'MP', sport: 'Football', position: 'Midfielder', status: 'Active', attendance: '92%', color: 'violet' },
  { id: 'athlete-alex-morgan', name: 'Alex Morgan', initials: 'AM', sport: 'Basketball', position: 'Shooting guard', status: 'Injured', attendance: '88%', color: 'blue' },
  { id: 'athlete-sam-rivera', name: 'Sam Rivera', initials: 'SR', sport: 'Swimming', position: 'Freestyle', status: 'Active', attendance: '98%', color: 'green' },
  { id: 'athlete-taylor-kim', name: 'Taylor Kim', initials: 'TK', sport: 'Football', position: 'Forward', status: 'Active', attendance: '91%', color: 'yellow' },
  { id: 'athlete-chris-okafor', name: 'Chris Okafor', initials: 'CO', sport: 'Basketball', position: 'Center', status: 'Active', attendance: '94%', color: 'pink' },
];

const initialTeams: Team[] = [
  { id: 'team-u18-basketball', name: 'U18 Basketball', sport: 'Basketball', athletes: 14, coach: 'Marcus Chen', record: '8–2', color: 'orange', initials: 'BK' },
  { id: 'team-first-football', name: 'First Team Football', sport: 'Football', athletes: 22, coach: 'Sofia Williams', record: '6–1–1', color: 'lime', initials: 'FB' },
  { id: 'team-competitive-swimming', name: 'Competitive Swimming', sport: 'Swimming', athletes: 18, coach: 'David Park', record: '12 medals', color: 'blue', initials: 'SW' },
  { id: 'team-u16-basketball', name: 'U16 Basketball', sport: 'Basketball', athletes: 12, coach: 'Avery Johnson', record: '5–3', color: 'violet', initials: 'BK' },
  { id: 'team-womens-football', name: 'Women’s Football', sport: 'Football', athletes: 19, coach: 'Priya Singh', record: '7–2', color: 'pink', initials: 'FB' },
  { id: 'team-junior-swim', name: 'Junior Swim Squad', sport: 'Swimming', athletes: 16, coach: 'Noah Brooks', record: '9 medals', color: 'green', initials: 'SW' },
];

function getDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function shiftDate(days: number) {
  const date = new Date();
  date.setHours(12, 0, 0, 0);
  date.setDate(date.getDate() + days);
  return date;
}

function createInitialFixtures(): Fixture[] {
  return [
    { id: 'fixture-eastside', dateKey: getDateKey(shiftDate(0)), sport: 'Basketball', opponent: 'Eastside Eagles', venue: 'Home · North Court', time: '6:30 PM', kind: 'Game', color: 'orange' },
    { id: 'fixture-riverside', dateKey: getDateKey(shiftDate(2)), sport: 'Football', opponent: 'Riverside FC', venue: 'Away · Riverside Park', time: '4:00 PM', kind: 'League match', color: 'lime' },
    { id: 'fixture-aquatics', dateKey: getDateKey(shiftDate(4)), sport: 'Swimming', opponent: 'City Aquatics', venue: 'Home · Lane 1–6', time: '9:00 AM', kind: 'Swim meet', color: 'blue' },
  ];
}

const initialTransactions: Transaction[] = [
  { id: 'transaction-dues-u18', title: 'Membership dues · U18 Basketball', dateKey: getDateKey(shiftDate(0)), amount: 840, kind: 'received' },
  { id: 'transaction-court', title: 'Court rental · Northside Arena', dateKey: getDateKey(shiftDate(-1)), amount: 320, kind: 'spent' },
  { id: 'transaction-tournament', title: 'Tournament registration · 3 teams', dateKey: getDateKey(shiftDate(-3)), amount: 540, kind: 'spent' },
  { id: 'transaction-dues-first', title: 'Membership dues · First Team', dateKey: getDateKey(shiftDate(-4)), amount: 1260, kind: 'received' },
  { id: 'transaction-equipment', title: 'New training equipment', dateKey: getDateKey(shiftDate(-6)), amount: 215, kind: 'spent' },
];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isAthlete(value: unknown): value is Athlete {
  return isRecord(value) && ['id', 'name', 'initials', 'sport', 'position', 'status', 'attendance', 'color']
    .every((key) => typeof value[key] === 'string');
}

function isFixture(value: unknown): value is Fixture {
  return isRecord(value) && ['id', 'dateKey', 'sport', 'opponent', 'venue', 'time', 'kind', 'color']
    .every((key) => typeof value[key] === 'string');
}

function isTeam(value: unknown): value is Team {
  return isRecord(value) && ['id', 'name', 'sport', 'coach', 'record', 'color', 'initials']
    .every((key) => typeof value[key] === 'string')
    && typeof value.athletes === 'number';
}

function isTransaction(value: unknown): value is Transaction {
  return isRecord(value) && ['id', 'title', 'dateKey'].every((key) => typeof value[key] === 'string')
    && typeof value.amount === 'number'
    && (value.kind === 'received' || value.kind === 'spent');
}

function isArrayOf<T>(value: unknown, isItem: (item: unknown) => item is T): value is T[] {
  return Array.isArray(value) && value.every(isItem);
}

function makeId(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function dateFromKey(key: string) {
  return new Date(`${key}T12:00:00`);
}

function weekStart(offset: number) {
  const start = new Date();
  start.setHours(12, 0, 0, 0);
  start.setDate(start.getDate() - ((start.getDay() + 6) % 7) + offset * 7);
  return start;
}

function formatWeekRange(start: Date) {
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  const first = start.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
  const last = end.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  return `${first} – ${last}`;
}

const navItems: { label: View; icon: typeof LayoutDashboard }[] = [
  { label: 'Overview', icon: LayoutDashboard },
  { label: 'Athletes', icon: Users },
  { label: 'Schedule', icon: CalendarDays },
  { label: 'Teams', icon: Shield },
  { label: 'Finance', icon: Wallet },
];

function Avatar({ athlete, size = '' }: { athlete: Pick<Athlete, 'initials' | 'color'>; size?: string }) {
  return <span className={`avatar ${athlete.color} ${size}`}>{athlete.initials}</span>;
}

function App() {
  const [activeView, setActiveView] = useState<View>('Overview');
  const [athletes, setAthletes] = useState(() => readStored('northstar-athletes', initialAthletes, (value): value is Athlete[] => isArrayOf(value, isAthlete)));
  const [events, setEvents] = useState(() => readStored('northstar-events', createInitialFixtures(), (value): value is Fixture[] => isArrayOf(value, isFixture)));
  const [teams, setTeams] = useState(() => readStored('northstar-teams', initialTeams, (value): value is Team[] => isArrayOf(value, isTeam)));
  const [transactions, setTransactions] = useState(() => readStored('northstar-transactions', initialTransactions, (value): value is Transaction[] => isArrayOf(value, isTransaction)));
  const [query, setQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [modalType, setModalType] = useState<ModalKind | null>(null);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [selectedSport, setSelectedSport] = useState('All sports');
  const [toast, setToast] = useState('');

  const filteredAthletes = useMemo(() => athletes.filter((athlete) => {
    const matchesText = `${athlete.name} ${athlete.sport} ${athlete.position}`.toLowerCase().includes(query.toLowerCase());
    return matchesText && (selectedSport === 'All sports' || athlete.sport === selectedSport);
  }), [athletes, query, selectedSport]);
  const nextEvent = events
    .filter((fixture) => fixture.dateKey >= getDateKey(new Date()))
    .sort((a, b) => a.dateKey.localeCompare(b.dateKey) || a.time.localeCompare(b.time))[0];

  function showToast(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(''), 2600);
  }

  function commitRecords<T>(
    key: string,
    records: T[],
    setRecords: Dispatch<SetStateAction<T[]>>,
    successMessage: string,
  ) {
    if (!writeStored(key, records)) {
      showToast('Could not save your changes. Check browser storage settings.');
      return false;
    }

    setRecords(records);
    showToast(successMessage);
    return true;
  }

  function addAthlete(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = String(form.get('name')).trim();
    if (!name) {
      showToast('Enter the athlete’s name first.');
      return;
    }
    const [first = '', last = ''] = name.split(/\s+/);
    const color = ['coral', 'violet', 'blue', 'green', 'yellow', 'pink'][athletes.length % 6];
    const athlete: Athlete = {
      id: makeId('athlete'),
      name, initials: `${first[0] ?? ''}${last[0] ?? ''}`.toUpperCase(),
      sport: String(form.get('sport')), position: String(form.get('position')) || 'Athlete',
      status: 'Active', attendance: '0%', color,
    };
    if (commitRecords('northstar-athletes', [athlete, ...athletes], setAthletes, `${name} added to your roster`)) {
      setModalType(null);
    }
  }

  function addEvent(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const opponent = String(form.get('opponent')).trim();
    const dateKey = String(form.get('date'));
    const date = dateFromKey(dateKey);
    if (!opponent || Number.isNaN(date.getTime())) {
      showToast('Enter an event name and a valid date.');
      return;
    }

    const sport = String(form.get('sport'));
    const kind = String(form.get('kind'));
    const colors: Record<string, string> = { Basketball: 'orange', Football: 'lime', Swimming: 'blue' };
    const fixture: Fixture = {
      id: makeId('event'),
      dateKey,
      sport,
      opponent,
      venue: String(form.get('venue')).trim() || 'Venue to be confirmed',
      time: formatTime(String(form.get('time'))),
      kind,
      color: colors[sport] ?? 'violet',
    };
    const next = [...events, fixture].sort((a, b) => a.dateKey.localeCompare(b.dateKey));
    if (commitRecords('northstar-events', next, setEvents, `${opponent} added to the schedule`)) {
      setModalType(null);
    }
  }

  function addTeam(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = String(form.get('name')).trim();
    const coach = String(form.get('coach')).trim();
    if (!name || !coach) {
      showToast('Enter a team name and coach.');
      return;
    }

    const sport = String(form.get('sport'));
    const initials = name.split(/\s+/).slice(0, 2).map((part) => part[0] ?? '').join('').toUpperCase();
    const colors: Record<string, string> = { Basketball: 'orange', Football: 'lime', Swimming: 'blue' };
    const team: Team = {
      id: makeId('team'), name, sport, athletes: 0, coach, record: 'New squad',
      color: colors[sport] ?? 'violet', initials,
    };
    if (commitRecords('northstar-teams', [team, ...teams], setTeams, `${name} created`)) {
      setModalType(null);
    }
  }

  function addTransaction(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const title = String(form.get('title')).trim();
    const amount = Number(form.get('amount'));
    if (!title || !Number.isFinite(amount) || amount <= 0) {
      showToast('Enter a description and an amount greater than zero.');
      return;
    }

    const transaction: Transaction = {
      id: makeId('transaction'),
      title,
      dateKey: getDateKey(new Date()),
      amount: Math.round(amount * 100) / 100,
      kind: form.get('kind') === 'received' ? 'received' : 'spent',
    };
    if (commitRecords('northstar-transactions', [transaction, ...transactions], setTransactions, 'Transaction recorded')) {
      setModalType(null);
    }
  }

  function removeAthlete(id: string) {
    const athlete = athletes.find((record) => record.id === id);
    if (!athlete || !window.confirm(`Remove ${athlete.name} from the roster?`)) return;
    const next = athletes.filter((record) => record.id !== id);
    commitRecords('northstar-athletes', next, setAthletes, `${athlete.name} removed from the roster`);
  }

  function changeView(view: View) {
    setActiveView(view);
    setMobileNavOpen(false);
  }

  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobileNavOpen ? 'mobile-open' : ''}`}>
        <a className="brand" href="#" onClick={() => changeView('Overview')} aria-label="Northstar home">
          <span className="brand-mark"><span /></span><span>NORTHSTAR<span className="brand-period">.</span></span>
        </a>
        <div className="club-switcher">
          <div className="club-emblem"><Trophy size={17} /></div>
          <div className="club-copy"><strong>Northstar Athletic</strong><span>Club workspace</span></div>
          <ChevronDown size={15} className="muted-icon" />
        </div>
        <div className="nav-label">WORKSPACE</div>
        <nav className="main-nav" aria-label="Main navigation">
          {navItems.map(({ label, icon: Icon }) => (
            <button key={label} className={`nav-link ${activeView === label ? 'selected' : ''}`} onClick={() => changeView(label)}>
              <Icon size={18} strokeWidth={1.8} /><span>{label}</span>
              {label === 'Athletes' && <span className="nav-count">{athletes.length}</span>}
              {label === 'Teams' && <span className="nav-count">{teams.length}</span>}
            </button>
          ))}
        </nav>
        <div className="nav-label tools-label">TOOLS</div>
        <nav className="main-nav">
          <button className="nav-link" onClick={() => showToast('Performance analytics are up to date')}><Activity size={18} strokeWidth={1.8} /><span>Performance</span></button>
          <button className="nav-link" onClick={() => showToast('Training plans opened')}><Dumbbell size={18} strokeWidth={1.8} /><span>Training</span></button>
        </nav>
        <div className="sidebar-bottom">
          <div className="upgrade-card">
            <span className="upgrade-icon"><Flag size={16} /></span>
            <strong>Season snapshot</strong>
            <p>{athletes.length} athletes across {teams.length} teams. {nextEvent ? `Next on the calendar: ${nextEvent.opponent}.` : 'Add an event to start planning the season.'}</p>
            <button onClick={() => changeView(nextEvent ? 'Schedule' : 'Athletes')}>{nextEvent ? 'View schedule' : 'Build roster'} <ArrowRight size={14} /></button>
          </div>
          <button className="nav-link settings-link" onClick={() => showToast('Workspace settings opened')}><Settings2 size={18} /><span>Settings</span></button>
          <div className="profile-row">
            <div className="profile-avatar">JD</div>
            <div className="profile-copy"><strong>Jamie Davis</strong><span>Club administrator</span></div>
            <Ellipsis size={18} className="muted-icon" />
          </div>
        </div>
      </aside>

      {mobileNavOpen && <button className="nav-scrim" aria-label="Close navigation" onClick={() => setMobileNavOpen(false)} />}
      <main className="main-area">
        <header className="topbar">
          <div className="breadcrumb"><button className="mobile-menu" onClick={() => setMobileNavOpen(true)} aria-label="Open navigation"><Menu size={20} /></button><span>Northstar Athletic</span><span className="crumb-slash">/</span><strong>{activeView}</strong></div>
          <div className="top-actions">
            <button className={`icon-button ${searchOpen ? 'active' : ''}`} aria-label="Search" onClick={() => setSearchOpen(!searchOpen)}><Search size={18} /></button>
            <button className="icon-button notification-button" aria-label="Notifications" onClick={() => showToast('You’re all caught up')}><Bell size={18} /><i /></button>
            <span className="top-divider" />
            <button className="help-button" onClick={() => showToast('Help center coming right up')}><CircleHelp size={17} /><span>Help</span></button>
          </div>
        </header>

        {searchOpen && <div className="global-search"><Search size={17} /><input autoFocus placeholder="Search athletes, teams, fixtures…" value={query} onChange={(event) => { setQuery(event.target.value); setActiveView('Athletes'); }} /><kbd>ESC</kbd><button aria-label="Close search" onClick={() => { setSearchOpen(false); setQuery(''); }}><X size={16} /></button></div>}

        <div className="page-content">
          {activeView === 'Overview' && <Overview athletes={athletes} teams={teams} events={events} onNavigate={changeView} onToast={showToast} onAdd={() => setModalType('athlete')} />}
          {activeView === 'Athletes' && <AthletesView athletes={filteredAthletes} query={query} setQuery={setQuery} selectedSport={selectedSport} setSelectedSport={setSelectedSport} onAdd={() => setModalType('athlete')} onRemove={removeAthlete} />}
          {activeView === 'Schedule' && <ScheduleView events={events} onCreate={() => setModalType('event')} onToast={showToast} />}
          {activeView === 'Teams' && <TeamsView teams={teams} onCreate={() => setModalType('team')} onToast={showToast} />}
          {activeView === 'Finance' && <FinanceView transactions={transactions} onCreate={() => setModalType('transaction')} onToast={showToast} />}
        </div>
        <footer className="page-footer"><span>© {new Date().getFullYear()} Northstar Athletic Club</span><span><span className="live-dot" /> All systems operational</span></footer>
      </main>
      {modalType === 'athlete' && <RecordModal title="Add an athlete" eyebrow="ROSTER MANAGEMENT" submitLabel="Add to roster" onClose={() => setModalType(null)} onSubmit={addAthlete}>
        <label>Full name<input name="name" placeholder="e.g. Riley Chen" required autoFocus /></label>
        <div className="form-grid"><label>Sport<select name="sport"><option>Basketball</option><option>Football</option><option>Swimming</option><option>Volleyball</option><option>Tennis</option></select></label><label>Position<input name="position" placeholder="e.g. Forward" /></label></div>
      </RecordModal>}
      {modalType === 'event' && <RecordModal title="Schedule an event" eyebrow="FIXTURES & PRACTICE" submitLabel="Add to schedule" onClose={() => setModalType(null)} onSubmit={addEvent}>
        <label>Opponent or event name<input name="opponent" placeholder="e.g. Eastside Eagles" required autoFocus /></label>
        <div className="form-grid"><label>Sport<select name="sport"><option>Basketball</option><option>Football</option><option>Swimming</option><option>Volleyball</option><option>Tennis</option></select></label><label>Event type<select name="kind"><option>Game</option><option>Practice</option><option>Meet</option><option>Tournament</option></select></label></div>
        <div className="form-grid"><label>Date<input name="date" type="date" defaultValue={getDateKey(new Date())} required /></label><label>Start time<input name="time" type="time" defaultValue="18:00" required /></label></div>
        <label>Venue<input name="venue" placeholder="e.g. North Court" /></label>
      </RecordModal>}
      {modalType === 'team' && <RecordModal title="Create a team" eyebrow="SQUADS & COACHES" submitLabel="Create team" onClose={() => setModalType(null)} onSubmit={addTeam}>
        <label>Team name<input name="name" placeholder="e.g. U16 Volleyball" required autoFocus /></label>
        <div className="form-grid"><label>Sport<select name="sport"><option>Basketball</option><option>Football</option><option>Swimming</option><option>Volleyball</option><option>Tennis</option></select></label><label>Coach<input name="coach" placeholder="Coach name" required /></label></div>
      </RecordModal>}
      {modalType === 'transaction' && <RecordModal title="Record a transaction" eyebrow="CLUB FINANCES" submitLabel="Save transaction" onClose={() => setModalType(null)} onSubmit={addTransaction}>
        <label>Description<input name="title" placeholder="e.g. Tournament entry fee" required autoFocus /></label>
        <div className="form-grid"><label>Amount<input name="amount" type="number" min="0.01" step="0.01" placeholder="0.00" required /></label><label>Type<select name="kind"><option value="received">Money in</option><option value="spent">Money out</option></select></label></div>
      </RecordModal>}
      {toast && <div className="toast"><span className="toast-check"><Check size={14} /></span>{toast}</div>}
    </div>
  );
}

function formatTime(value: string) {
  const [hour, minute] = value.split(':').map(Number);
  if (!Number.isFinite(hour) || !Number.isFinite(minute)) return value;
  const period = hour >= 12 ? 'PM' : 'AM';
  return `${hour % 12 || 12}:${String(minute).padStart(2, '0')} ${period}`;
}

function RecordModal({ title, eyebrow, submitLabel, onClose, onSubmit, children }: {
  title: string;
  eyebrow: string;
  submitLabel: string;
  onClose: () => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  children: React.ReactNode;
}) {
  return <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
    <form className="modal" onSubmit={onSubmit}>
      <div className="modal-head"><div><span className="eyebrow">{eyebrow}</span><h2>{title}</h2></div><button type="button" className="icon-button" aria-label="Close" onClick={onClose}><X size={18} /></button></div>
      {children}
      <div className="modal-actions"><button type="button" className="button-secondary" onClick={onClose}>Cancel</button><button type="submit" className="button-primary"><Plus size={16} /> {submitLabel}</button></div>
    </form>
  </div>;
}

function PageHeading({ eyebrow, title, description, children }: { eyebrow: string; title: React.ReactNode; description: string; children?: React.ReactNode }) {
  return <div className="page-heading"><div><div className="eyebrow">{eyebrow}</div><h1>{title}</h1><p>{description}</p></div>{children && <div className="heading-actions">{children}</div>}</div>;
}

function Overview({ athletes, teams, events, onNavigate, onToast, onAdd }: {
  athletes: Athlete[];
  teams: Team[];
  events: Fixture[];
  onNavigate: (view: View) => void;
  onToast: (message: string) => void;
  onAdd: () => void;
}) {
  const todayKey = getDateKey(new Date());
  const nextWeekKey = getDateKey(shiftDate(7));
  const upcomingEvents = events
    .filter((fixture) => fixture.dateKey >= todayKey)
    .sort((a, b) => a.dateKey.localeCompare(b.dateKey) || a.time.localeCompare(b.time));
  const eventsThisWeek = upcomingEvents.filter((fixture) => fixture.dateKey < nextWeekKey).length;
  const attendanceAverage = athletes.length
    ? athletes.reduce((total, athlete) => total + (Number.parseInt(athlete.attendance, 10) || 0), 0) / athletes.length
    : 0;
  const weekLabel = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }).toUpperCase();
  const featuredTeam = teams[0];

  function exportReport() {
    downloadCsv('northstar-club-report.csv', [
      ['Northstar club report'],
      ['Generated', getDateKey(new Date())],
      ['Athletes', String(athletes.length)],
      ['Teams', String(teams.length)],
      ['Events in the next seven days', String(eventsThisWeek)],
      ['Average roster attendance', `${attendanceAverage.toFixed(1)}%`],
      [],
      ['Upcoming events'],
      ['Date', 'Sport', 'Event', 'Type', 'Time', 'Venue'],
      ...upcomingEvents.map((fixture) => [fixture.dateKey, fixture.sport, fixture.opponent, fixture.kind, fixture.time, fixture.venue]),
    ]);
    onToast('Club report downloaded');
  }

  return <>
    <PageHeading eyebrow={`CLUB OVERVIEW / ${weekLabel}`} title={<>Your club, <span className="heading-accent">in motion.</span></>} description="Your club at a glance. Here’s what’s coming up." >
      <button className="button-secondary" onClick={exportReport}><Download size={16} /> Export report</button>
      <button className="button-primary" onClick={onAdd}><Plus size={17} /> Add athlete</button>
    </PageHeading>
    <section className="stat-grid" aria-label="Club statistics">
      <StatCard label="Total athletes" value={String(athletes.length)} change="On the roster" positive icon={Users} tint="lime" note="registered" />
      <StatCard label="Active teams" value={String(teams.length)} change="Across sports" positive icon={Shield} tint="violet" note="club squads" />
      <StatCard label="Events this week" value={String(eventsThisWeek).padStart(2, '0')} change="Next seven days" icon={CalendarDays} tint="orange" note="scheduled" />
      <StatCard label="Club attendance" value={`${attendanceAverage.toFixed(1)}%`} change={`${athletes.length} athlete${athletes.length === 1 ? '' : 's'}`} positive icon={Activity} tint="blue" note="roster average" />
    </section>
    <section className="dashboard-grid">
      <div className="panel performance-panel">
        <div className="panel-heading"><div><span className="eyebrow">CLUB HEALTH</span><h2>Roster attendance</h2></div><span className="select-button">Current roster</span></div>
        <div className="chart-summary"><div className="chart-value">{attendanceAverage.toFixed(1)}% <span className="trend-chip"><Users size={12} /> {athletes.length}</span></div><span className="chart-caption">Average athlete attendance</span></div>
        <AttendanceChart athletes={athletes} />
        <div className="chart-axis">{athletes.slice(0, 8).map((athlete) => <span key={athlete.id}>{athlete.name.split(/\s+/)[0]}</span>)}</div>
        <div className="chart-legend"><span><i className="legend-lime" /> Current roster</span><span className="chart-note">Listed by athlete</span></div>
      </div>
      <div className="panel fixture-panel">
        <div className="panel-heading"><div><span className="eyebrow">DON’T MISS A MOMENT</span><h2>Upcoming fixtures</h2></div><button className="circle-arrow" aria-label="View all fixtures" onClick={() => onNavigate('Schedule')}><ArrowRight size={17} /></button></div>
        <div className="fixture-list">{upcomingEvents.slice(0, 3).map((fixture) => {
          const date = dateFromKey(fixture.dateKey);
          const day = fixture.dateKey === todayKey ? 'TODAY' : date.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
          return <div className="fixture-row" key={fixture.id}>
            <div className="date-block"><span>{day}</span><strong>{date.getDate()}</strong><small>{date.toLocaleDateString('en-US', { month: 'short' }).toUpperCase()}</small></div>
            <div className="fixture-info"><div className="fixture-title"><strong>{fixture.opponent}</strong><span className={`sport-pill ${fixture.color}`}>{fixture.sport}</span></div><span className="fixture-meta"><MapPin size={12} />{fixture.venue}</span><span className="fixture-meta"><Clock3 size={12} />{fixture.time}</span></div>
            <span className="vs-badge">{fixture.kind}</span>
          </div>;
        })}{upcomingEvents.length === 0 && <div className="fixture-empty">No upcoming events. Add one from the schedule.</div>}</div>
        <button className="panel-link" onClick={() => onNavigate('Schedule')}>View full schedule <ArrowRight size={15} /></button>
      </div>
    </section>
    <section className="bottom-grid">
      <div className="panel roster-panel">
        <div className="panel-heading"><div><span className="eyebrow">YOUR PEOPLE, IN ONE PLACE</span><h2>Recently active athletes</h2></div><button className="text-button" onClick={() => onNavigate('Athletes')}>View roster <ArrowRight size={15} /></button></div>
        <div className="athlete-mini-list">{athletes.slice(0, 4).map((athlete) => <div className="athlete-mini-row" key={athlete.id}><Avatar athlete={athlete} /><div className="athlete-mini-name"><strong>{athlete.name}</strong><span>{athlete.sport} · {athlete.position}</span></div><span className={`status-pill ${athlete.status === 'Injured' ? 'status-injured' : ''}`}><i />{athlete.status}</span><span className="attendance-value">{athlete.attendance}</span></div>)}</div>
      </div>
      <div className="panel insight-panel"><div className="insight-top"><span className="insight-spark"><Flag size={16} /></span><span className="eyebrow">COACH’S NOTES</span></div><h2>{featuredTeam ? `${featuredTeam.name} is on the board.` : 'A fresh season starts here.'}</h2><p>{athletes.length ? `Roster attendance averages ${attendanceAverage.toFixed(1)}% across ${athletes.length} athletes.` : 'Add your first athlete to start building a clear picture of the club.'} {featuredTeam ? `${featuredTeam.coach} leads ${featuredTeam.athletes} athletes.` : 'Your teams and their coaches will appear here.'}</p><button className="panel-link" onClick={() => onNavigate(featuredTeam ? 'Teams' : 'Athletes')}>{featuredTeam ? 'See your teams' : 'Build your roster'} <ArrowRight size={15} /></button><div className="insight-decoration">01</div></div>
    </section>
  </>;
}

function StatCard({ label, value, change, positive, icon: Icon, tint, note }: { label: string; value: string; change: string; positive?: boolean; icon: typeof Users; tint: string; note: string }) {
  return <div className="stat-card"><div className="stat-top"><span>{label}</span><span className={`stat-icon ${tint}`}><Icon size={17} /></span></div><div className="stat-value">{value}</div><div className="stat-foot"><span className={`stat-change ${positive ? 'positive' : ''}`}>{positive ? <ArrowUpRight size={13} /> : <Clock3 size={12} />}{change}</span><span className="stat-note">{note}</span></div></div>;
}

function AttendanceChart({ athletes }: { athletes: Athlete[] }) {
  const chartAthletes = athletes.slice(0, 8);
  const points = chartAthletes.map((athlete, index) => {
    const attendance = Math.min(100, Math.max(0, Number.parseInt(athlete.attendance, 10) || 0));
    const x = chartAthletes.length === 1 ? 320 : 24 + index * (592 / (chartAthletes.length - 1));
    return { x, y: 145 - attendance * 1.25 };
  });
  const linePath = points.map((point, index) => `${index === 0 ? 'M' : 'L'}${point.x} ${point.y}`).join(' ');
  const areaPath = points.length > 1 ? `${linePath} L${points[points.length - 1].x} 160 L${points[0].x} 160Z` : '';

  if (points.length === 0) {
    return <div className="chart-empty">Add athletes to see roster attendance.</div>;
  }

  return <div className="chart-wrap"><div className="chart-y-axis"><span>100%</span><span>90%</span><span>80%</span><span>70%</span></div><svg className="attendance-chart" viewBox="0 0 640 160" preserveAspectRatio="none" role="img" aria-label={`Attendance by athlete for ${chartAthletes.length} athletes`}>
    <defs><linearGradient id="chartFill" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#c5f36b" stopOpacity=".22" /><stop offset="100%" stopColor="#c5f36b" stopOpacity="0" /></linearGradient></defs>
    <path d="M0 128H640M0 85H640M0 42H640" className="grid-line" />
    {areaPath && <path d={areaPath} fill="url(#chartFill)" />}
    <path d={linePath} className="chart-line" />
    {points.map((point, index) => <circle key={chartAthletes[index].id} cx={point.x} cy={point.y} r="3.5" className="chart-dot" />)}
  </svg></div>;
}

function AthletesView({ athletes, query, setQuery, selectedSport, setSelectedSport, onAdd, onRemove }: {
  athletes: Athlete[];
  query: string;
  setQuery: (value: string) => void;
  selectedSport: string;
  setSelectedSport: (value: string) => void;
  onAdd: () => void;
  onRemove: (id: string) => void;
}) {
  return <>
    <PageHeading eyebrow="PEOPLE & ROSTERS" title="Your athletes." description="The people who make your club what it is.">
      <button className="button-primary" onClick={onAdd}><Plus size={17} /> Add athlete</button>
    </PageHeading>
    <div className="panel table-panel">
      <div className="table-toolbar"><div className="table-title"><h2>All athletes</h2><span className="count-badge">{athletes.length}</span></div><div className="table-controls"><label className="table-search"><Search size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search athletes…" /></label><label className="filter-select"><Filter size={15} /><select value={selectedSport} onChange={(event) => setSelectedSport(event.target.value)}><option>All sports</option><option>Basketball</option><option>Football</option><option>Swimming</option><option>Volleyball</option><option>Tennis</option></select><ChevronDown size={14} /></label></div></div>
      <div className="table-scroll"><table><thead><tr><th>ATHLETE</th><th>SPORT</th><th>POSITION</th><th>STATUS</th><th>ATTENDANCE</th><th /></tr></thead><tbody>{athletes.map((athlete) => <tr key={athlete.id}><td><div className="table-person"><Avatar athlete={athlete} /><strong>{athlete.name}</strong></div></td><td>{athlete.sport}</td><td>{athlete.position}</td><td><span className={`status-pill ${athlete.status === 'Injured' ? 'status-injured' : ''}`}><i />{athlete.status}</span></td><td><div className="attendance-cell"><span>{athlete.attendance}</span><span className="mini-progress"><i style={{ width: athlete.attendance }} /></span></div></td><td><button className="row-menu" aria-label={`Remove ${athlete.name}`} onClick={() => onRemove(athlete.id)}><Trash2 size={16} /></button></td></tr>)}</tbody></table>
      {athletes.length === 0 && <div className="empty-state"><UserRound size={25} /><strong>No athletes found</strong><span>Try a different search or sport filter.</span></div>}</div>
      <div className="table-footer"><span>Showing <strong>{athletes.length}</strong> athletes</span><div className="pagination"><button disabled><ChevronLeft size={16} /></button><button className="page-current">1</button><button disabled><ChevronRight size={16} /></button></div></div>
    </div>
  </>;
}

function ScheduleView({ events, onCreate, onToast }: { events: Fixture[]; onCreate: () => void; onToast: (message: string) => void }) {
  const [weekOffset, setWeekOffset] = useState(0);
  const start = weekStart(weekOffset);
  const days = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    return date;
  });
  const todayKey = getDateKey(new Date());
  const weekEvents = events.filter((fixture) => {
    const key = fixture.dateKey;
    return key >= getDateKey(days[0]) && key <= getDateKey(days[6]);
  });
  const eventDays = new Set(weekEvents.map((fixture) => fixture.dateKey));
  const practices = weekEvents.filter((fixture) => fixture.kind.toLowerCase().includes('practice')).length;

  function exportSchedule() {
    downloadCsv('northstar-schedule.csv', [
      ['Date', 'Sport', 'Event', 'Type', 'Time', 'Venue'],
      ...weekEvents.map((fixture) => [fixture.dateKey, fixture.sport, fixture.opponent, fixture.kind, fixture.time, fixture.venue]),
    ]);
    onToast('This week’s schedule downloaded');
  }

  return <>
    <PageHeading eyebrow="PLAN THE PLAY" title="The schedule." description="Every practice, game, and big moment on the calendar."><button className="button-primary" onClick={onCreate}><Plus size={17} /> Create event</button></PageHeading>
    <div className="schedule-toolbar panel">
      <button className="button-secondary" onClick={() => setWeekOffset(0)}>Today</button>
      <div className="week-controls"><button className="icon-button" aria-label="Previous week" onClick={() => setWeekOffset((offset) => offset - 1)}><ChevronLeft size={18} /></button><strong>{formatWeekRange(start)}</strong><button className="icon-button" aria-label="Next week" onClick={() => setWeekOffset((offset) => offset + 1)}><ChevronRight size={18} /></button></div>
      <span className="select-button"><CalendarDays size={15} /> Week view</span>
    </div>
    <div className="schedule-layout">
      <div className="panel week-panel">
        <div className="week-days">{days.map((date) => <div key={getDateKey(date)} className={`week-day ${getDateKey(date) === todayKey ? 'today' : ''}`}><span>{date.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase()}</span><strong>{date.getDate()}</strong></div>)}</div>
        <div className="day-events">
          {days.flatMap((date, dayIndex) => {
            const dateEvents = weekEvents.filter((fixture) => fixture.dateKey === getDateKey(date));
            return dateEvents.map((fixture, eventIndex) => <article className={`event-card event-${fixture.color}`} key={fixture.id} style={{ gridColumn: dayIndex + 1, gridRow: `${Math.min(1 + eventIndex * 2, 8)} / span 2` }}>
              <span className="event-time">{fixture.time}</span><strong>{fixture.sport} · {fixture.kind}</strong><span>{fixture.opponent}</span><small><MapPin size={11} /> {fixture.venue}</small>
            </article>);
          })}
          {weekEvents.length === 0 && <div className="calendar-empty">No events this week. Add a fixture or practice to get started.</div>}
        </div>
      </div>
      <aside className="panel week-summary"><span className="eyebrow">THIS WEEK</span><h2>{weekEvents.length} event{weekEvents.length === 1 ? '' : 's'}</h2><p>Your club schedule, all in one place.</p><div className="summary-stat"><span>Games & meets</span><strong>{weekEvents.length - practices}</strong></div><div className="summary-stat"><span>Practices</span><strong>{practices}</strong></div><div className="summary-stat"><span>Open days</span><strong>{7 - eventDays.size}</strong></div><button className="panel-link" onClick={exportSchedule}>Export calendar <Download size={14} /></button></aside>
    </div>
  </>;
}

function TeamsView({ teams, onCreate, onToast }: { teams: Team[]; onCreate: () => void; onToast: (message: string) => void }) {
  return <>
    <PageHeading eyebrow="SQUADS & COACHES" title="Stronger together." description="Your teams, their coaches, and everything in between."><button className="button-primary" onClick={onCreate}><Plus size={17} /> Create team</button></PageHeading>
    <div className="teams-grid">{teams.map((team) => <article className="team-card panel" key={team.id}><div className={`team-art ${team.color}`}><span>{team.initials}</span><span className="team-art-icon"><Shield size={18} /></span></div><div className="team-card-content"><span className="eyebrow">{team.sport.toUpperCase()}</span><h2>{team.name}</h2><div className="team-card-meta"><span><Users size={14} />{team.athletes} athletes</span><span><UserRound size={14} />{team.coach}</span></div><div className="team-card-bottom"><span>SEASON RECORD</span><strong>{team.record}</strong><button className="circle-arrow" aria-label={`Open ${team.name}`} onClick={() => onToast(`${team.name} · ${team.coach} · ${team.athletes} athletes`)}><ArrowRight size={16} /></button></div></div></article>)}
      {teams.length === 0 && <div className="panel empty-state"><Shield size={25} /><strong>No teams yet</strong><span>Create your first squad to organize athletes and coaches.</span></div>}
    </div>
  </>;
}

function FinanceView({ transactions, onCreate, onToast }: { transactions: Transaction[]; onCreate: () => void; onToast: (message: string) => void }) {
  const received = transactions.filter((transaction) => transaction.kind === 'received').reduce((total, transaction) => total + transaction.amount, 0);
  const spent = transactions.filter((transaction) => transaction.kind === 'spent').reduce((total, transaction) => total + transaction.amount, 0);
  const netFlow = received - spent;
  const sortedTransactions = [...transactions].sort((a, b) => b.dateKey.localeCompare(a.dateKey));

  function exportTransactions() {
    downloadCsv('northstar-transactions.csv', [
      ['Date', 'Description', 'Type', 'Amount'],
      ...sortedTransactions.map((transaction) => [transaction.dateKey, transaction.title, transaction.kind, transaction.amount.toFixed(2)]),
    ]);
    onToast('Transactions downloaded');
  }

  return <>
    <PageHeading eyebrow="THE BUSINESS OF SPORT" title="A healthy club, on and off the field." description="Track dues, spending, and the details that keep your club moving."><button className="button-secondary" onClick={exportTransactions}><Download size={16} /> Export</button><button className="button-primary" onClick={onCreate}><Plus size={17} /> Add transaction</button></PageHeading>
    <section className="stat-grid finance-stats">
      <StatCard label="Net cash flow" value={formatMoney(netFlow)} change="Received less spent" positive={netFlow >= 0} icon={Wallet} tint="lime" note="recorded activity" />
      <StatCard label="Money received" value={formatMoney(received)} change={`${transactions.filter((transaction) => transaction.kind === 'received').length} transactions`} positive icon={ArrowUpRight} tint="blue" note="in this ledger" />
      <StatCard label="Recorded entries" value={String(transactions.length)} change="Income & expenses" icon={Clock3} tint="orange" note="in this ledger" />
      <StatCard label="Money spent" value={formatMoney(spent)} change={`${transactions.filter((transaction) => transaction.kind === 'spent').length} transactions`} icon={ArrowDownRight} tint="violet" note="in this ledger" />
    </section>
    <div className="panel finance-panel"><div className="panel-heading"><div><span className="eyebrow">LATEST ACTIVITY</span><h2>Recent transactions</h2></div><span className="select-button">All activity</span></div>
      <div className="transaction-list">{sortedTransactions.slice(0, 12).map((transaction) => <div className="transaction-row" key={transaction.id}><span className={`transaction-icon ${transaction.kind}`}><Wallet size={16} /></span><div><strong>{transaction.title}</strong><span>{dateFromKey(transaction.dateKey).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span></div><strong className={transaction.kind}>{transaction.kind === 'received' ? '+' : '−'}{formatMoney(transaction.amount)}</strong></div>)}
        {sortedTransactions.length === 0 && <div className="empty-state"><Wallet size={25} /><strong>No transactions yet</strong><span>Record your first payment or expense.</span></div>}
      </div>
    </div>
  </>;
}

function formatMoney(amount: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
}

function downloadCsv(filename: string, rows: string[][]) {
  const content = rows.map((row) => row.map((cell) => `"${cell.replaceAll('"', '""')}"`).join(',')).join('\r\n');
  const url = URL.createObjectURL(new Blob([content], { type: 'text/csv;charset=utf-8' }));
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export default App;
