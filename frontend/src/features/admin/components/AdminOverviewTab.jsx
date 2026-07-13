import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend as RechartsLegend, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { Activity, Clock, ShieldCheck, ShieldX, Database, Sliders } from 'lucide-react';

// Static chart data — defined outside component to avoid re-creation on each render
const ACTIVITY_CHART_DATA = [
  { day: '02/07', scans: 420, threats: 12 },
  { day: '03/07', scans: 510, threats: 18 },
  { day: '04/07', scans: 480, threats: 15 },
  { day: '05/07', scans: 620, threats: 24 },
  { day: '06/07', scans: 780, threats: 35 },
  { day: '07/07', scans: 950, threats: 42 },
  { day: 'Hôm nay', scans: 1120, threats: 56 }
];

const BANK_CHART_DATA = [
  { name: 'TCB', count: 120 },
  { name: 'VCB', count: 95 },
  { name: 'MB', count: 75 },
  { name: 'Agri', count: 45 },
  { name: 'CTG', count: 30 }
];

const THREAT_PIE_DATA = [
  { name: 'Website', value: 54, color: '#23b56c' },
  { name: 'Tài khoản', value: 26, color: '#3b82f6' },
  { name: 'Hotline', value: 20, color: '#ef4444' }
];

export default function AdminOverviewTab({ reportsStats }) {
  return (
    <div className="admin-tab-view animate-fade-in">
      <div className="db-metrics-grid" style={{ marginBottom: '1.75rem' }}>
        <div className="metric-card" style={{ background: 'rgba(59, 130, 246, 0.03)', borderColor: 'rgba(59, 130, 246, 0.12)' }}>
          <div className="metric-info">
            <span className="metric-label" style={{ color: '#3b82f6' }}>Tổng số báo cáo</span>
            <span className="metric-value">{reportsStats.total}</span>
          </div>
          <div className="metric-icon-wrap" style={{ background: 'rgba(59, 130, 246, 0.08)', color: '#3b82f6' }}>
            <Activity size={20} />
          </div>
        </div>

        <div className="metric-card" style={{ background: 'rgba(245, 158, 11, 0.03)', borderColor: 'rgba(245, 158, 11, 0.12)' }}>
          <div className="metric-info">
            <span className="metric-label" style={{ color: '#d97706' }}>Tố cáo chờ duyệt</span>
            <span className="metric-value">{reportsStats.pending}</span>
          </div>
          <div className="metric-icon-wrap" style={{ background: 'rgba(245, 158, 11, 0.08)', color: '#d97706' }}>
            <Clock size={20} />
          </div>
        </div>

        <div className="metric-card" style={{ background: 'rgba(35, 181, 108, 0.03)', borderColor: 'rgba(35, 181, 108, 0.12)' }}>
          <div className="metric-info">
            <span className="metric-label" style={{ color: '#23b56c' }}>Đã duyệt chặn (Đen)</span>
            <span className="metric-value">{reportsStats.approved}</span>
          </div>
          <div className="metric-icon-wrap" style={{ background: 'rgba(35, 181, 108, 0.08)', color: '#23b56c' }}>
            <ShieldCheck size={20} />
          </div>
        </div>

        <div className="metric-card" style={{ background: 'rgba(239, 68, 68, 0.03)', borderColor: 'rgba(239, 68, 68, 0.12)' }}>
          <div className="metric-info">
            <span className="metric-label" style={{ color: 'var(--danger)' }}>Báo cáo bị từ chối</span>
            <span className="metric-value">{reportsStats.rejected}</span>
          </div>
          <div className="metric-icon-wrap" style={{ background: 'rgba(239, 68, 68, 0.08)', color: 'var(--danger)' }}>
            <ShieldX size={20} />
          </div>
        </div>
      </div>

      {/* Statistics Chart Section */}
      <div className="db-panel-card" style={{ position: 'relative', marginBottom: '1.75rem' }}>
        <div className="db-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 className="db-card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Activity size={16} /> Thống kê hoạt động rà quét & Mối đe dọa (7 ngày qua)
          </h3>
          <div style={{ display: 'flex', gap: '1rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#23b56c', display: 'inline-block' }}></span>
              <span>Lượt rà quét (Scans)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#ef4444', display: 'inline-block' }}></span>
              <span>Mối đe dọa chặn (Threats)</span>
            </div>
          </div>
        </div>

        <div style={{ width: '100%', height: '220px', position: 'relative' }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={ACTIVITY_CHART_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="scansGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#23b56c" stopOpacity={0.22} />
                      <stop offset="95%" stopColor="#23b56c" stopOpacity={0.00} />
                    </linearGradient>
                    <linearGradient id="threatsGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.18} />
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0.00} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
                  <XAxis 
                    dataKey="day" 
                    stroke="var(--text-muted)" 
                    fontSize={9} 
                    tickLine={false} 
                    axisLine={false}
                  />
                  <YAxis 
                    stroke="var(--text-muted)" 
                    fontSize={9} 
                    tickLine={false} 
                    axisLine={false}
                  />
                  <RechartsTooltip 
                    contentStyle={{ 
                      backgroundColor: 'var(--bg-card-main)', 
                      border: '1px solid var(--border-color)', 
                      borderRadius: '8px',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
                      fontSize: '11px',
                      color: 'var(--text-primary)'
                    }}
                    itemStyle={{ color: 'var(--text-secondary)' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="scans" 
                    stroke="#23b56c" 
                    strokeWidth={2.5} 
                    fillOpacity={1} 
                    fill="url(#scansGradient)" 
                    name="Lượt rà quét" 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="threats" 
                    stroke="#ef4444" 
                    strokeWidth={2.0} 
                    fillOpacity={1} 
                    fill="url(#threatsGradient)" 
                    name="Mối đe dọa" 
                  />
                </AreaChart>
              </ResponsiveContainer>
        </div>
      </div>

      {/* Row 3: Database Analytics (Bar + Donut Charts) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem', marginBottom: '1.75rem' }}>
        
        {/* Left Card: Bar Chart (Top banks) */}
        <div className="db-panel-card" style={{ display: 'flex', flexDirection: 'column', height: '220px' }}>
          <div className="db-card-header">
            <h3 className="db-card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Database size={16} /> Top ngân hàng bị lạm dụng nhiều nhất
            </h3>
          </div>
          <div style={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: 'calc(100% - 40px)' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={BANK_CHART_DATA} layout="vertical" margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border-color)" />
                    <XAxis type="number" stroke="var(--text-muted)" fontSize={9} tickLine={false} axisLine={false} />
                    <YAxis dataKey="name" type="category" stroke="var(--text-secondary)" fontSize={9} tickLine={false} axisLine={false} width={40} />
                    <RechartsTooltip 
                      contentStyle={{ backgroundColor: 'var(--bg-card-main)', border: '1px solid var(--border-color)', borderRadius: '6px', fontSize: '10px', color: 'var(--text-primary)' }}
                      itemStyle={{ color: 'var(--text-secondary)' }}
                    />
                    <Bar dataKey="count" fill="#23b56c" radius={[0, 4, 4, 0]} name="Số vụ" barSize={10} />
                  </BarChart>
                </ResponsiveContainer>
          </div>
        </div>

        {/* Right Card: Donut Chart (Threat breakdown) */}
        <div className="db-panel-card" style={{ display: 'flex', flexDirection: 'column', height: '220px' }}>
          <div className="db-card-header">
            <h3 className="db-card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Sliders size={16} /> Phân bộ tỷ lệ mối đe dọa
            </h3>
          </div>
          <div style={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: 'calc(100% - 40px)' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={THREAT_PIE_DATA}
                      cx="35%"
                      cy="50%"
                      innerRadius={30}
                      outerRadius={45}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {THREAT_PIE_DATA.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip 
                      contentStyle={{ backgroundColor: 'var(--bg-card-main)', border: '1px solid var(--border-color)', borderRadius: '6px', fontSize: '10px', color: 'var(--text-primary)' }}
                      itemStyle={{ color: 'var(--text-secondary)' }}
                    />
                    <RechartsLegend 
                      layout="vertical" 
                      verticalAlign="middle" 
                      align="right" 
                      wrapperStyle={{ fontSize: '10px', color: 'var(--text-secondary)', paddingRight: '15px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
}
