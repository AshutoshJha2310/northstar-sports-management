import { useMemo, useState } from 'react';
import {
  Activity, ArrowDownRight, ArrowRight, ArrowUpRight, Bell, CalendarDays,
  Check, ChevronDown, ChevronLeft, ChevronRight, CircleHelp, Clock3, Download,
  Dumbbell, Ellipsis, Filter, Flag, LayoutDashboard, MapPin, Menu, Plus, Search,
  Settings2, Shield, Trophy, UserRound, Users, Wallet, X,
} from 'lucide-react';

type View = 'Overview' | 'Athletes' | 'Schedule' | 'Teams' | 'Finance';
type Athlete = { name: string; initials: string; sport: string; position: string; status: string; attendance: string; color: string };

const initialAthletes: Athlete[] = [
  { name: 'Jordan Lee', initials: 'JL', sport: 'Basketball', position: 'Point guard', status: 'Active', attendance: '96%', color: 'coral' },
  { name: 'Maya Patel', initials: 'MP', sport: 'Football', position: 'Midfielder', status: 'Active', attendance: '92%', color: 'violet' },
  { name: 'Alex Morgan', initials: 'AM', sport: 'Basketball', position: 'Shooting guard', status: 'Injured', attendance: '88%', color: 'blue' },
  { name: 'Sam Rivera', initials: 'SR', sport: 'Swimming', position: 'Freestyle', status: 'Active', attendance: '98%', color: 'green' },
  { name: 'Taylor Kim', initials: 'TK', sport: 'Football', position: 'Forward', status: 'Active', attendance: '91%', color: 'yellow' },
  { name: 'Chris Okafor', initials: 'CO', sport: 'Basketball', position: 'Center', status: 'Active', attendance: '94%', color: 'pink' },
];

const fixtures = [
  { day: 'TODAY', date: '25', month: 'NOV', sport: 'Basketball', opponent: 'Eastside Eagles', venue: 'Home · North Court', time: '6:30 PM', color: 'orange', score: 'VS' },
  { day: 'THU', date: '26', month: 'NOV', sport: 'Football', opponent: 'Riverside FC', venue: 'Away · Riverside Park', time: '4:00 PM', color: 'lime', score: 'VS' },
  { day: 'SAT', date: '28', month: 'NOV', sport: 'Swimming', opponent: 'City Aquatics', venue: 'Home · Lane 1–6', time: '9:00 AM', color: 'blue', score: 'VS' },
];

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
  const [athletes, setAthletes] = useState(initialAthletes);
  const [query, setQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [selectedSport, setSelectedSport] = useState('All sports');
  const [toast, setToast] = useState('');

  const filteredAthletes = useMemo(() => athletes.filter((athlete) => {
    const matchesText = `${athlete.name} ${athlete.sport} ${athlete.position}`.toLowerCase().includes(query.toLowerCase());
    return matchesText && (selectedSport === 'All sports' || athlete.sport === selectedSport);
  }), [athletes, query, selectedSport]);

  function showToast(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(''), 2600);
  }

  function addAthlete(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = String(form.get('name')).trim();
    if (!name) return;
    const [first = '', last = ''] = name.split(/\s+/);
    const color = ['coral', 'violet', 'blue', 'green', 'yellow', 'pink'][athletes.length % 6];
    setAthletes((current) => [{
      name, initials: `${first[0] ?? ''}${last[0] ?? ''}`.toUpperCase(),
      sport: String(form.get('sport')), position: String(form.get('position')) || 'Athlete',
      status: 'Active', attendance: '100%', color,
    }, ...current]);
    setModalOpen(false);
    showToast(`${name} added to your roster`);
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
            <p>Attendance is up 4.2% this month. A good run of practices is paying off.</p>
            <button onClick={() => showToast('Your season report is ready')}>View season report <ArrowRight size={14} /></button>
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
          {activeView === 'Overview' && <Overview athletes={athletes} onNavigate={changeView} onToast={showToast} onAdd={() => setModalOpen(true)} />}
          {activeView === 'Athletes' && <AthletesView athletes={filteredAthletes} query={query} setQuery={setQuery} selectedSport={selectedSport} setSelectedSport={setSelectedSport} onAdd={() => setModalOpen(true)} />}
          {activeView === 'Schedule' && <ScheduleView onToast={showToast} />}
          {activeView === 'Teams' && <TeamsView onToast={showToast} />}
          {activeView === 'Finance' && <FinanceView onToast={showToast} />}
        </div>
        <footer className="page-footer"><span>© 2026 Northstar Athletic Club</span><span><span className="live-dot" /> All systems operational</span></footer>
      </main>
      {modalOpen && <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setModalOpen(false); }}><form className="modal" onSubmit={addAthlete}>
        <div className="modal-head"><div><span className="eyebrow">ROSTER MANAGEMENT</span><h2>Add an athlete</h2></div><button type="button" className="icon-button" aria-label="Close" onClick={() => setModalOpen(false)}><X size={18} /></button></div>
        <label>Full name<input name="name" placeholder="e.g. Riley Chen" required autoFocus /></label>
        <div className="form-grid"><label>Sport<select name="sport"><option>Basketball</option><option>Football</option><option>Swimming</option><option>Volleyball</option><option>Tennis</option></select></label><label>Position<input name="position" placeholder="e.g. Forward" /></label></div>
        <div className="modal-actions"><button type="button" className="button-secondary" onClick={() => setModalOpen(false)}>Cancel</button><button type="submit" className="button-primary"><Plus size={16} /> Add to roster</button></div>
      </form></div>}
      {toast && <div className="toast"><span className="toast-check"><Check size={14} /></span>{toast}</div>}
    </div>
  );
}

function PageHeading({ eyebrow, title, description, children }: { eyebrow: string; title: React.ReactNode; description: string; children?: React.ReactNode }) {
  return <div className="page-heading"><div><div className="eyebrow">{eyebrow}</div><h1>{title}</h1><p>{description}</p></div>{children && <div className="heading-actions">{children}</div>}</div>;
}

function Overview({ athletes, onNavigate, onToast, onAdd }: { athletes: Athlete[]; onNavigate: (view: View) => void; onToast: (message: string) => void; onAdd: () => void }) {
  return <>
    <PageHeading eyebrow="MATCHDAY / WEDNESDAY, NOVEMBER 25, 2026" title={<>Game day, <span className="heading-accent">handled.</span></>} description="Tip-off is at 6:30 tonight. Here’s the rest of your week." >
      <button className="button-secondary" onClick={() => onToast('Season report exported')}><Download size={16} /> Export report</button>
      <button className="button-primary" onClick={onAdd}><Plus size={17} /> Add athlete</button>
    </PageHeading>
    <section className="stat-grid" aria-label="Club statistics">
      <StatCard label="Total athletes" value={String(athletes.length + 242)} change="+12 this month" positive icon={Users} tint="lime" note="vs last month" />
      <StatCard label="Active teams" value="12" change="+2 new teams" positive icon={Shield} tint="violet" note="this season" />
      <StatCard label="Events this week" value="08" change="3 coming up" icon={CalendarDays} tint="orange" note="next 7 days" />
      <StatCard label="Club attendance" value="94.8%" change="+4.2%" positive icon={Activity} tint="blue" note="vs last month" />
    </section>
    <section className="dashboard-grid">
      <div className="panel performance-panel">
        <div className="panel-heading"><div><span className="eyebrow">CLUB HEALTH</span><h2>Attendance overview</h2></div><button className="select-button" onClick={() => onToast('Showing the last 30 days')}>Last 30 days <ChevronDown size={15} /></button></div>
        <div className="chart-summary"><div className="chart-value">94.8% <span className="trend-chip"><ArrowUpRight size={13} /> 4.2%</span></div><span className="chart-caption">Average athlete attendance</span></div>
        <AttendanceChart />
        <div className="chart-axis"><span>OCT 27</span><span>NOV 03</span><span>NOV 10</span><span>NOV 17</span><span>NOV 24</span></div>
        <div className="chart-legend"><span><i className="legend-lime" /> This month</span><span><i className="legend-gray" /> Last month</span><span className="chart-note">You’re 8.3% above the club average</span></div>
      </div>
      <div className="panel fixture-panel">
        <div className="panel-heading"><div><span className="eyebrow">DON’T MISS A MOMENT</span><h2>Upcoming fixtures</h2></div><button className="circle-arrow" aria-label="View all fixtures" onClick={() => onNavigate('Schedule')}><ArrowRight size={17} /></button></div>
        <div className="fixture-list">{fixtures.map((fixture) => <div className="fixture-row" key={fixture.opponent}>
          <div className="date-block"><span>{fixture.day}</span><strong>{fixture.date}</strong><small>{fixture.month}</small></div>
          <div className="fixture-info"><div className="fixture-title"><strong>{fixture.opponent}</strong><span className={`sport-pill ${fixture.color}`}>{fixture.sport}</span></div><span className="fixture-meta"><MapPin size={12} />{fixture.venue}</span><span className="fixture-meta"><Clock3 size={12} />{fixture.time}</span></div>
          <span className="vs-badge">{fixture.score}</span>
        </div>)}</div>
        <button className="panel-link" onClick={() => onNavigate('Schedule')}>View full schedule <ArrowRight size={15} /></button>
      </div>
    </section>
    <section className="bottom-grid">
      <div className="panel roster-panel">
        <div className="panel-heading"><div><span className="eyebrow">YOUR PEOPLE, IN ONE PLACE</span><h2>Recently active athletes</h2></div><button className="text-button" onClick={() => onNavigate('Athletes')}>View roster <ArrowRight size={15} /></button></div>
        <div className="athlete-mini-list">{athletes.slice(0, 4).map((athlete) => <div className="athlete-mini-row" key={athlete.name}><Avatar athlete={athlete} /><div className="athlete-mini-name"><strong>{athlete.name}</strong><span>{athlete.sport} · {athlete.position}</span></div><span className={`status-pill ${athlete.status === 'Injured' ? 'status-injured' : ''}`}><i />{athlete.status}</span><span className="attendance-value">{athlete.attendance}</span></div>)}</div>
      </div>
      <div className="panel insight-panel"><div className="insight-top"><span className="insight-spark"><Flag size={16} /></span><span className="eyebrow">COACH’S NOTES</span></div><h2>Good habits are starting to show.</h2><p>Attendance is up <strong>4.2%</strong> this month. The U18 Basketball team has the biggest jump, with <strong>3 extra athletes</strong> at every practice.</p><button className="panel-link" onClick={() => onToast('Opening your club notes')}>See the team notes <ArrowRight size={15} /></button><div className="insight-decoration">01</div></div>
    </section>
  </>;
}

function StatCard({ label, value, change, positive, icon: Icon, tint, note }: { label: string; value: string; change: string; positive?: boolean; icon: typeof Users; tint: string; note: string }) {
  return <div className="stat-card"><div className="stat-top"><span>{label}</span><span className={`stat-icon ${tint}`}><Icon size={17} /></span></div><div className="stat-value">{value}</div><div className="stat-foot"><span className={`stat-change ${positive ? 'positive' : ''}`}>{positive ? <ArrowUpRight size={13} /> : <Clock3 size={12} />}{change}</span><span className="stat-note">{note}</span></div></div>;
}

function AttendanceChart() {
  return <div className="chart-wrap"><div className="chart-y-axis"><span>100%</span><span>90%</span><span>80%</span><span>70%</span></div><svg className="attendance-chart" viewBox="0 0 640 160" preserveAspectRatio="none" role="img" aria-label="Attendance has trended upward from 85 to 95 percent this month">
    <defs><linearGradient id="chartFill" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#c5f36b" stopOpacity=".22" /><stop offset="100%" stopColor="#c5f36b" stopOpacity="0" /></linearGradient></defs>
    <path d="M0 128H640M0 85H640M0 42H640" className="grid-line" />
    <path d="M0 108 C30 101 35 116 65 96 S104 100 130 84 S165 90 193 75 S228 90 258 72 S293 67 322 78 S355 65 386 57 S420 71 450 49 S484 53 515 38 S546 48 578 27 S609 38 640 16 L640 160 L0 160Z" fill="url(#chartFill)" />
    <path d="M0 108 C30 101 35 116 65 96 S104 100 130 84 S165 90 193 75 S228 90 258 72 S293 67 322 78 S355 65 386 57 S420 71 450 49 S484 53 515 38 S546 48 578 27 S609 38 640 16" className="chart-line" />
    <path d="M0 135 C31 130 35 138 65 126 S99 128 130 121 S163 126 193 115 S229 125 258 118 S291 111 322 120 S352 112 386 104 S420 115 450 99 S483 104 515 92 S548 101 578 84 S610 94 640 79" className="chart-line-muted" />
    <circle cx="640" cy="16" r="4" className="chart-dot" />
  </svg></div>;
}

function AthletesView({ athletes, query, setQuery, selectedSport, setSelectedSport, onAdd }: { athletes: Athlete[]; query: string; setQuery: (value: string) => void; selectedSport: string; setSelectedSport: (value: string) => void; onAdd: () => void }) {
  return <>
    <PageHeading eyebrow="PEOPLE & ROSTERS" title="Your athletes." description="The people who make your club what it is.">
      <button className="button-primary" onClick={onAdd}><Plus size={17} /> Add athlete</button>
    </PageHeading>
    <div className="panel table-panel">
      <div className="table-toolbar"><div className="table-title"><h2>All athletes</h2><span className="count-badge">{athletes.length}</span></div><div className="table-controls"><label className="table-search"><Search size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search athletes…" /></label><label className="filter-select"><Filter size={15} /><select value={selectedSport} onChange={(event) => setSelectedSport(event.target.value)}><option>All sports</option><option>Basketball</option><option>Football</option><option>Swimming</option><option>Volleyball</option><option>Tennis</option></select><ChevronDown size={14} /></label></div></div>
      <div className="table-scroll"><table><thead><tr><th>ATHLETE</th><th>SPORT</th><th>POSITION</th><th>STATUS</th><th>ATTENDANCE</th><th /></tr></thead><tbody>{athletes.map((athlete) => <tr key={athlete.name}><td><div className="table-person"><Avatar athlete={athlete} /><strong>{athlete.name}</strong></div></td><td>{athlete.sport}</td><td>{athlete.position}</td><td><span className={`status-pill ${athlete.status === 'Injured' ? 'status-injured' : ''}`}><i />{athlete.status}</span></td><td><div className="attendance-cell"><span>{athlete.attendance}</span><span className="mini-progress"><i style={{ width: athlete.attendance }} /></span></div></td><td><button className="row-menu" aria-label={`More options for ${athlete.name}`}><Ellipsis size={18} /></button></td></tr>)}</tbody></table>
      {athletes.length === 0 && <div className="empty-state"><UserRound size={25} /><strong>No athletes found</strong><span>Try a different search or sport filter.</span></div>}</div>
      <div className="table-footer"><span>Showing <strong>{athletes.length}</strong> athletes</span><div className="pagination"><button disabled><ChevronLeft size={16} /></button><button className="page-current">1</button><button disabled><ChevronRight size={16} /></button></div></div>
    </div>
  </>;
}

function ScheduleView({ onToast }: { onToast: (message: string) => void }) {
  const [week, setWeek] = useState(0);
  return <>
    <PageHeading eyebrow="PLAN THE PLAY" title="The schedule." description="Every practice, game, and big moment on the calendar."><button className="button-primary" onClick={() => onToast('New event form opened')}><Plus size={17} /> Create event</button></PageHeading>
    <div className="schedule-toolbar panel"><button className="button-secondary" onClick={() => setWeek(0)}>Today</button>    <div className="week-controls"><button className="icon-button" aria-label="Previous week" onClick={() => setWeek(week - 1)}><ChevronLeft size={18} /></button><strong>{week === 0 ? 'November 23 – 29, 2026' : week > 0 ? 'November 30 – December 6, 2026' : 'November 16 – 22, 2026'}</strong><button className="icon-button" aria-label="Next week" onClick={() => setWeek(week + 1)}><ChevronRight size={18} /></button></div><button className="select-button" onClick={() => onToast('Calendar view options')}><CalendarDays size={15} /> Week view <ChevronDown size={15} /></button></div>
    <div className="schedule-layout"><div className="panel week-panel"><div className="week-days">{['MON 23', 'TUE 24', 'WED 25', 'THU 26', 'FRI 27', 'SAT 28', 'SUN 29'].map((day, i) => <div key={day} className={`week-day ${i === 2 ? 'today' : ''}`}><span>{day.split(' ')[0]}</span><strong>{day.split(' ')[1]}</strong></div>)}</div><div className="day-events">{fixtures.map((fixture, i) => <article className={`event-card event-${fixture.color}`} key={fixture.opponent} style={{ gridColumn: `${i === 0 ? 3 : i === 1 ? 4 : 6}`, gridRow: 1 }}><span className="event-time">{fixture.time}</span><strong>{fixture.sport} · {i === 0 ? 'Game night' : i === 1 ? 'League match' : 'Swim meet'}</strong><span>{fixture.opponent}</span><small><MapPin size={11} /> {fixture.venue.split(' · ')[0]}</small></article>)}</div></div><aside className="panel week-summary"><span className="eyebrow">THIS WEEK</span><h2>3 events</h2><p>A good week to show up and show out.</p><div className="summary-stat"><span>Games</span><strong>3</strong></div><div className="summary-stat"><span>Practices</span><strong>8</strong></div><div className="summary-stat"><span>Rest days</span><strong>2</strong></div><button className="panel-link" onClick={() => onToast('Full calendar exported')}>Export calendar <Download size={14} /></button></aside></div>
  </>;
}

function TeamsView({ onToast }: { onToast: (message: string) => void }) {
  const teams = [
    { name: 'U18 Basketball', sport: 'BASKETBALL', athletes: 14, coach: 'Marcus Chen', record: '8–2', color: 'orange', initials: 'BK' },
    { name: 'First Team Football', sport: 'FOOTBALL', athletes: 22, coach: 'Sofia Williams', record: '6–1–1', color: 'lime', initials: 'FB' },
    { name: 'Competitive Swimming', sport: 'SWIMMING', athletes: 18, coach: 'David Park', record: '12 medals', color: 'blue', initials: 'SW' },
    { name: 'U16 Basketball', sport: 'BASKETBALL', athletes: 12, coach: 'Avery Johnson', record: '5–3', color: 'violet', initials: 'BK' },
    { name: 'Women’s Football', sport: 'FOOTBALL', athletes: 19, coach: 'Priya Singh', record: '7–2', color: 'pink', initials: 'FB' },
    { name: 'Junior Swim Squad', sport: 'SWIMMING', athletes: 16, coach: 'Noah Brooks', record: '9 medals', color: 'green', initials: 'SW' },
  ];
  return <><PageHeading eyebrow="SQUADS & COACHES" title="Stronger together." description="Your teams, their coaches, and everything in between."><button className="button-primary" onClick={() => onToast('Create team form opened')}><Plus size={17} /> Create team</button></PageHeading><div className="teams-grid">{teams.map((team) => <article className="team-card panel" key={team.name}><div className={`team-art ${team.color}`}><span>{team.initials}</span><span className="team-art-icon"><Shield size={18} /></span></div><div className="team-card-content"><span className="eyebrow">{team.sport}</span><h2>{team.name}</h2><div className="team-card-meta"><span><Users size={14} />{team.athletes} athletes</span><span><UserRound size={14} />{team.coach}</span></div><div className="team-card-bottom"><span>SEASON RECORD</span><strong>{team.record}</strong><button className="circle-arrow" aria-label={`Open ${team.name}`} onClick={() => onToast(`${team.name} team selected`)}><ArrowRight size={16} /></button></div></div></article>)}</div></>;
}

function FinanceView({ onToast }: { onToast: (message: string) => void }) {
  return <><PageHeading eyebrow="THE BUSINESS OF SPORT" title="A healthy club, on and off the field." description="Track dues, spending, and the details that keep your club moving."><button className="button-secondary" onClick={() => onToast('Finance report exported')}><Download size={16} /> Export</button><button className="button-primary" onClick={() => onToast('New transaction form opened')}><Plus size={17} /> Add transaction</button></PageHeading><section className="stat-grid finance-stats"><StatCard label="Total balance" value="$48,290" change="Updated just now" icon={Wallet} tint="lime" note="across all accounts" /><StatCard label="Collected this month" value="$12,840" change="+8.4%" positive icon={ArrowUpRight} tint="blue" note="vs last month" /><StatCard label="Pending dues" value="$2,160" change="12 members" icon={Clock3} tint="orange" note="awaiting payment" /><StatCard label="Monthly spend" value="$8,430" change="On track" positive icon={ArrowDownRight} tint="violet" note="of $10,000 budget" /></section>  <div className="panel finance-panel"><div className="panel-heading"><div><span className="eyebrow">LATEST ACTIVITY</span><h2>Recent transactions</h2></div><button className="select-button" onClick={() => onToast('Showing all transactions')}>All activity <ChevronDown size={15} /></button></div><div className="transaction-list">{[['Membership dues · U18 Basketball', 'Nov 25, 2026', '+$840.00', 'received'], ['Court rental · Northside Arena', 'Nov 24, 2026', '−$320.00', 'spent'], ['Tournament registration · 3 teams', 'Nov 22, 2026', '−$540.00', 'spent'], ['Membership dues · First Team', 'Nov 21, 2026', '+$1,260.00', 'received'], ['New training equipment', 'Nov 19, 2026', '−$215.00', 'spent']].map(([title, date, amount, kind]) => <div className="transaction-row" key={title}><span className={`transaction-icon ${kind}`}><Wallet size={16} /></span><div><strong>{title}</strong><span>{date}</span></div><strong className={kind}>{amount}</strong></div>)}</div></div></>;
}

export default App;
