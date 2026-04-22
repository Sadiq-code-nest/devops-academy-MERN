import Sidebar from '../../components/Sidebar';
import { useAuth } from '../../context/AuthContext';

const curriculum = [
  { num:'01', title:'Introduction to DevOps',    phase:'Phase 1' },
  { num:'02', title:'Linux Essentials',           phase:'Phase 1' },
  { num:'03', title:'Git & GitHub — Part I',      phase:'Phase 1' },
  { num:'04', title:'Git & GitHub — Part II',     phase:'Phase 1' },
  { num:'05', title:'Nginx & Multi-Stack Deploy', phase:'Phase 2' },
  { num:'06', title:'Jenkins Fundamentals',       phase:'Phase 3' },
  { num:'07', title:'Advanced Pipelines',         phase:'Phase 3' },
  { num:'08', title:'Docker Basics',              phase:'Phase 4' },
  { num:'09', title:'Docker Advanced',            phase:'Phase 4' },
  { num:'10', title:'AWS Core Services',          phase:'Phase 5' },
];

const motivations = [
  'Every expert was once a beginner. Keep going.',
  'The best time to learn DevOps was yesterday. Second best time is now.',
  'One pipeline at a time. You are building real skills.',
  'Consistency beats intensity. Show up every class.',
];

const sidebarLinks = [
  { icon:'📊', label:'Dashboard',  path:'/student-dashboard' },
  { icon:'📚', label:'My Courses', path:'/student-dashboard' },
  { icon:'👤', label:'Profile',    path:'/student-dashboard' },
];

export default function StudentDashboard() {
  const { user } = useAuth();
  const quote = motivations[Math.floor(Math.random() * motivations.length)];

  return (
    <div style={s.layout}>
      <Sidebar links={sidebarLinks} />

      <main style={s.main}>
        {/* Header */}
        <div style={s.header}>
          <div>
            <h1 style={s.h1}>Welcome back, {user?.name?.split(' ')[0]} 👋</h1>
            <p style={s.sub}>Continue your DevOps journey</p>
          </div>
          <div style={s.badge}>🎓 Student</div>
        </div>

        {/* Stats row */}
        <div style={s.statsRow}>
          {[
            { icon:'📖', label:'Classes',  value:'15' },
            { icon:'🏗️', label:'Projects', value:'3'  },
            { icon:'⏱️',  label:'Duration', value:'2mo'},
            { icon:'⭐', label:'Rating',   value:'4.9'},
          ].map(stat => (
            <div key={stat.label} style={s.statCard}>
              <div style={s.statIcon}>{stat.icon}</div>
              <div style={s.statVal}>{stat.value}</div>
              <div style={s.statLabel}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Motivation */}
        <div style={s.motivationBox}>
          <span style={s.motivationIcon}>💡</span>
          <span style={s.motivationText}>{quote}</span>
        </div>

        {/* Curriculum */}
        <div style={s.section}>
          <h2 style={s.h2}>📚 Course Curriculum</h2>
          <div style={s.courseGrid}>
            {curriculum.map(c => (
              <div key={c.num} style={s.courseCard}>
                <div style={s.courseNum}>Class {c.num}</div>
                <div style={s.courseTitle}>{c.title}</div>
                <div style={s.coursePhase}>{c.phase}</div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

const s = {
  layout:   { display:'flex', minHeight:'100vh', background:'var(--bg)' },
  main:     { marginLeft:'240px', flex:1, padding:'2rem', maxWidth:'900px' },
  header:   { display:'flex', justifyContent:'space-between',
              alignItems:'flex-start', marginBottom:'1.5rem' },
  h1:       { fontSize:'1.6rem', fontWeight:'700', color:'var(--text)', margin:0 },
  sub:      { color:'var(--text-muted)', fontSize:'.9rem', marginTop:'.25rem' },
  badge:    { background:'var(--blue-light)', color:'var(--blue)',
              padding:'.4rem .9rem', borderRadius:'20px', fontSize:'.85rem',
              fontWeight:'600' },
  statsRow: { display:'grid', gridTemplateColumns:'repeat(4,1fr)',
              gap:'1rem', marginBottom:'1.5rem' },
  statCard: { background:'var(--bg-alt)', border:'1px solid var(--border)',
              borderRadius:'12px', padding:'1.25rem', textAlign:'center' },
  statIcon: { fontSize:'1.5rem', marginBottom:'.5rem' },
  statVal:  { fontSize:'1.4rem', fontWeight:'700', color:'var(--blue)' },
  statLabel:{ fontSize:'.8rem', color:'var(--text-muted)', marginTop:'.2rem' },
  motivationBox: { background:'var(--blue-light)', border:'1px solid var(--blue)',
    borderRadius:'10px', padding:'1rem 1.25rem', marginBottom:'1.5rem',
    display:'flex', gap:'.75rem', alignItems:'center' },
  motivationIcon: { fontSize:'1.4rem', flexShrink:0 },
  motivationText: { color:'var(--blue)', fontSize:'.95rem', fontStyle:'italic' },
  section:  { marginBottom:'2rem' },
  h2:       { fontSize:'1.1rem', fontWeight:'700', color:'var(--text)',
              marginBottom:'1rem' },
  courseGrid: { display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:'.75rem' },
  courseCard: { background:'var(--bg-alt)', border:'1px solid var(--border)',
    borderRadius:'10px', padding:'1rem', transition:'border .2s' },
  courseNum:  { fontSize:'.75rem', color:'var(--blue)', fontFamily:'var(--font-mono)',
                fontWeight:'600', marginBottom:'.25rem' },
  courseTitle:{ fontSize:'.9rem', fontWeight:'600', color:'var(--text)' },
  coursePhase:{ fontSize:'.75rem', color:'var(--text-muted)', marginTop:'.25rem' },
};
