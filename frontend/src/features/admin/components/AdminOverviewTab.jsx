import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { Shield, Sparkles, Code, Layers, HelpCircle } from 'lucide-react';

const METRONIC_BAR_DATA = [
  { name: 'Jan', val: 30 },
  { name: 'Feb', val: 55 },
  { name: 'Mar', val: 40 },
  { name: 'Apr', val: 65 },
  { name: 'May', val: 50 },
  { name: 'Jun', val: 80 },
  { name: 'Jul', val: 70 }
];

const METRONIC_LINE_DATA = [
  { name: 'Apr 04', sales: 15000 },
  { name: 'Apr 07', sales: 18000 },
  { name: 'Apr 10', sales: 14000 },
  { name: 'Apr 13', sales: 21000 },
  { name: 'Apr 16', sales: 17000 },
  { name: 'Apr 19', sales: 19000 },
  { name: 'Apr 22', sales: 22000 }
];

const METRONIC_DONUT_DATA1 = [
  { name: 'Tạm Giữ', value: 7660, color: '#f1416c' },
  { name: 'Đã Trả', value: 2820, color: '#009ef7' },
  { name: 'Lợi Nhuận', value: 45257, color: '#e4e6ef' }
];

const METRONIC_DONUT_DATA2 = [
  { name: 'Leaf CRM', value: 7660, color: '#50cd89' },
  { name: 'Mivy App', value: 2820, color: '#009ef7' },
  { name: 'Others', value: 45257, color: '#e4e6ef' }
];

export default function AdminOverviewTab({ reportsStats }) {
  return (
    <div className="admin-tab-view animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', color: '#181c32' }}>

      {/* SECTION 1: METRONIC 3-COLUMN MAIN CARDS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>

        {/* COLUMN 1 CARD (Earnings + Donut) */}
        <div className="db-panel-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', padding: '1.5rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '1.8rem', fontWeight: 800 }}>$69,700</span>
              <span className="status-badge approved" style={{ background: '#e8fff3', color: '#50cd89', fontSize: '0.72rem', fontWeight: 700, padding: '0.15rem 0.4rem', borderRadius: '4px' }}>
                ▲ 2.2%
              </span>
            </div>
            <span style={{ fontSize: '0.78rem', color: '#a1a5b7', fontWeight: 500 }}>Tổng Tiền Kiếm Được</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', height: '110px' }}>
            <div style={{ width: '100px', height: '100px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={METRONIC_DONUT_DATA1}
                    cx="50%"
                    cy="50%"
                    innerRadius={32}
                    outerRadius={45}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {METRONIC_DONUT_DATA1.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.78rem', flex: 1 }}>
              {METRONIC_DONUT_DATA1.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: item.color }}></span>
                    <span style={{ color: '#5e6278', fontWeight: 500 }}>{item.name}</span>
                  </div>
                  <span style={{ fontWeight: 700, color: '#181c32' }}>${item.value.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* COLUMN 2 CARD (Today + Bars) */}
        <div className="db-panel-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', padding: '1.5rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '1.8rem', fontWeight: 800 }}>$2,420</span>
              <span className="status-badge approved" style={{ background: '#e8fff3', color: '#50cd89', fontSize: '0.72rem', fontWeight: 700, padding: '0.15rem 0.4rem', borderRadius: '4px' }}>
                ▲ 2.6%
              </span>
            </div>
            <span style={{ fontSize: '0.78rem', color: '#a1a5b7', fontWeight: 500 }}>Hôm Nay Kiếm Được</span>
          </div>

          <div style={{ flexGrow: 1, height: '110px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={METRONIC_BAR_DATA}>
                <Bar dataKey="val" fill="#009ef7" radius={[3, 3, 0, 0]} barSize={12} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* COLUMN 3 CARD (Sales Wave Curve) */}
        <div className="db-panel-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', padding: '1.5rem' }} id="sales-month-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h4 style={{ margin: 0, fontSize: '0.92rem', fontWeight: 700, color: '#181c32' }}>Sales This Months</h4>
              <span style={{ fontSize: '0.72rem', color: '#a1a5b7' }}>Users from all channels</span>
            </div>
            <button style={{ background: '#f5f8fa', border: 'none', borderRadius: '4px', width: '24px', height: '24px', fontSize: '0.8rem', cursor: 'pointer', color: '#a1a5b7' }}>•••</button>
          </div>

          <div style={{ margin: '0.5rem 0 0 0' }}>
            <span style={{ fontSize: '1.6rem', fontWeight: 800, color: '#181c32' }}>$14,094</span>
            <span style={{ fontSize: '0.72rem', color: '#a1a5b7', marginLeft: '0.4rem' }}>Another $48,346 to Goal</span>
          </div>

          <div style={{ flexGrow: 1, height: '100px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={METRONIC_LINE_DATA} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                <CartesianGrid stroke="#f1f3f9" vertical={false} />
                <XAxis dataKey="name" hide />
                <YAxis hide />
                <Area type="monotone" dataKey="sales" stroke="#50cd89" strokeWidth={2.5} fill="rgba(80, 205, 137, 0.05)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* SECTION 2: METRONIC SECOND ROW CARDS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>

        {/* COLUMN 1 CARD (Earnings 2 + Donut) */}
        <div className="db-panel-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', padding: '1.5rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '1.8rem', fontWeight: 800 }}>$69,700</span>
              <span className="status-badge approved" style={{ background: '#e8fff3', color: '#50cd89', fontSize: '0.72rem', fontWeight: 700, padding: '0.15rem 0.4rem', borderRadius: '4px' }}>
                ▲ 2.2%
              </span>
            </div>
            <span style={{ fontSize: '0.78rem', color: '#a1a5b7', fontWeight: 500 }}>Projects Earnings in April</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', height: '110px' }}>
            <div style={{ width: '100px', height: '100px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={METRONIC_DONUT_DATA2}
                    cx="50%"
                    cy="50%"
                    innerRadius={32}
                    outerRadius={45}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {METRONIC_DONUT_DATA2.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.78rem', flex: 1 }}>
              {METRONIC_DONUT_DATA2.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: item.color }}></span>
                    <span style={{ color: '#5e6278', fontWeight: 500 }}>{item.name}</span>
                  </div>
                  <span style={{ fontWeight: 700, color: '#181c32' }}>${item.value.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* COLUMN 2 CARD (Total Members + Avatar Stack) */}
        <div className="db-panel-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', padding: '1.5rem' }}>
          <div>
            <span style={{ fontSize: '2.2rem', fontWeight: 800, fontFamily: 'Space Grotesk, sans-serif' }}>6.3k</span>
            <div style={{ fontSize: '0.78rem', color: '#a1a5b7', fontWeight: 500, marginTop: '0.15rem' }}>Tổng Số thành viên</div>
          </div>

          <div style={{ marginTop: 'auto' }}>
            <span style={{ fontSize: '0.7rem', color: '#a1a5b7', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700, display: 'block', marginBottom: '0.5rem' }}>
              Hôm nay Tham gia
            </span>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              {['A', 'S', 'P', 'M', 'T'].map((char, index) => (
                <div
                  key={index}
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: index % 2 === 0 ? '#ffc700' : '#009ef7',
                    border: '2px solid #fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold',
                    fontSize: '0.75rem',
                    color: '#fff',
                    marginLeft: index === 0 ? '0' : '-8px',
                    boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
                  }}
                >
                  {char}
                </div>
              ))}
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: '#f5f8fa',
                  border: '2px solid #fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold',
                  fontSize: '0.68rem',
                  color: '#7e8299',
                  marginLeft: '-8px'
                }}
              >
                +42
              </div>
            </div>
          </div>
        </div>

        {/* COLUMN 3 CARD (System Status Metrics Info) */}
        <div className="db-panel-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', padding: '1.5rem' }}>
          <h4 style={{ margin: 0, fontSize: '0.92rem', fontWeight: 700, color: '#181c32' }}>Thông Tin An Ninh CLD</h4>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #eff2f5', paddingBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.8rem', color: '#5e6278' }}>Báo cáo đang chờ duyệt</span>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#ffc700' }}>{reportsStats.pending}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #eff2f5', paddingBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.8rem', color: '#5e6278' }}>Đối tượng đã chặn (Blacklist)</span>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#50cd89' }}>{reportsStats.approved}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.8rem', color: '#5e6278' }}>Báo cáo đã từ chối</span>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#f1416c' }}>{reportsStats.rejected}</span>
            </div>
          </div>
        </div>

      </div>

      {/* SECTION 3: QUICK BALANCE BADGES (4 Columns Grid) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>

        {/* Metric 1 */}
        <div className="db-panel-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem' }}>
          <div>
            <span style={{ fontSize: '0.72rem', color: '#a1a5b7', fontWeight: 600, display: 'block' }}>Số Dư Khả Dụng</span>
            <span style={{ fontSize: '1.4rem', fontWeight: 800, color: '#181c32' }}>0<sup>đ</sup></span>
            <span style={{ fontSize: '0.68rem', color: '#3e97ff', display: 'block', marginTop: '0.2rem', cursor: 'pointer' }}>Số Dư Khả Dụng</span>
          </div>
          <div style={{ fontSize: '1.5rem' }}>🐰</div>
        </div>

        {/* Metric 2 */}
        <div className="db-panel-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem' }}>
          <div>
            <span style={{ fontSize: '0.72rem', color: '#a1a5b7', fontWeight: 600, display: 'block' }}>Tiền đã tiêu</span>
            <span style={{ fontSize: '1.4rem', fontWeight: 800, color: '#181c32' }}>0<sup>đ</sup></span>
            <span style={{ fontSize: '0.68rem', color: '#f1416c', display: 'block', marginTop: '0.2rem' }}>Tổng Tiền Đã Tiêu</span>
          </div>
          <div style={{ fontSize: '1.5rem' }}>🐷</div>
        </div>

        {/* Metric 3 */}
        <div className="db-panel-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem' }}>
          <div>
            <span style={{ fontSize: '0.72rem', color: '#a1a5b7', fontWeight: 600, display: 'block' }}>Mã Nguồn Đã Mua</span>
            <span style={{ fontSize: '1.4rem', fontWeight: 800, color: '#181c32' }}>0</span>
            <span style={{ fontSize: '0.68rem', color: '#50cd89', display: 'block', marginTop: '0.2rem' }}>
              <Code size={11} style={{ marginRight: '0.15rem', display: 'inline' }} /> Mã Nguồn Đã Mua
            </span>
          </div>
          <div style={{ color: '#3e97ff' }}><Code size={24} /></div>
        </div>

        {/* Metric 4 */}
        <div className="db-panel-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem' }}>
          <div>
            <span style={{ fontSize: '0.72rem', color: '#a1a5b7', fontWeight: 600, display: 'block' }}>Dịch Vụ Đang Sử Dụng</span>
            <span style={{ fontSize: '1.4rem', fontWeight: 800, color: '#181c32' }}>0</span>
            <span style={{ fontSize: '0.68rem', color: '#7239ea', display: 'block', marginTop: '0.2rem' }}>Tổng Dịch Vụ Đang Sử Dụng</span>
          </div>
          <div style={{ color: '#7239ea' }}><Layers size={24} /></div>
        </div>

      </div>



    </div>
  );
}
