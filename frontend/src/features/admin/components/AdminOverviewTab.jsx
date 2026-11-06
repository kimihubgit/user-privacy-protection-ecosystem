import { useState, useEffect } from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { Shield, Globe, Phone, CreditCard, Clock, CheckCircle, AlertTriangle, ShieldCheck } from 'lucide-react';
import { api } from '../../../lib/api';

const WEEKLY_THREATS_DATA = [
  { name: 'Thứ 2', reports: 12 },
  { name: 'Thứ 3', reports: 18 },
  { name: 'Thứ 4', reports: 15 },
  { name: 'Thứ 5', reports: 24 },
  { name: 'Thứ 6', reports: 20 },
  { name: 'Thứ Bảy', reports: 32 },
  { name: 'Chủ Nhật', reports: 28 }
];

const THREAT_CATEGORIES_DATA = [
  { name: 'Giả mạo (Phishing)', val: 45 },
  { name: 'Mã độc (Malware)', val: 15 },
  { name: 'Đa cấp / Tài chính', val: 25 },
  { name: 'Tình cảm / MXH', val: 10 },
  { name: 'Khác', val: 5 }
];

const METRONIC_COLORS = ['#009ef7', '#50cd89', '#f1416c', '#ffc700', '#7239ea'];

export default function AdminOverviewTab({ token, reportsStats, dashboardStats }) {
  const [modStatsData, setModStatsData] = useState(null);

  useEffect(() => {
    const fetchModeratorStats = async () => {
      if (!token) return;
      try {
        const res = await api.getAdminModeratorStats(token);
        if (res && res.success && res.data) {
          setModStatsData(res.data);
        }
      } catch (err) {
        console.warn("Failed to fetch live moderator stats from API:", err);
      }
    };

    fetchModeratorStats();
  }, [token]);

  const totalReports = dashboardStats?.checks?.total ?? (reportsStats?.total || 0);
  const pendingReports = reportsStats?.pending || 0;
  const approvedReports = dashboardStats?.scam_urls ?? (reportsStats?.approved || 0);
  const rejectedReports = reportsStats?.rejected || 0;
  const usersCount = dashboardStats?.users?.total ?? 0;

  // Calculate approval rate
  const resolvedCount = approvedReports + rejectedReports;
  const approvalRate = resolvedCount > 0 ? Math.round((approvedReports / resolvedCount) * 100) : 0;

  // Threat types breakdown data
  const threatTypesData = [
    { name: 'Giả mạo (Phishing)', value: dashboardStats?.categories?.phishing || 0, color: '#009ef7' },
    { name: 'Lừa đảo (Scam)', value: dashboardStats?.categories?.scam || 0, color: '#ffc700' },
    { name: 'Khác', value: dashboardStats?.categories?.none || 0, color: '#f1416c' }
  ];

  const threatCategoriesData = [
    { name: 'Phishing', val: dashboardStats?.categories?.phishing || 0 },
    { name: 'Scam', val: dashboardStats?.categories?.scam || 0 },
    { name: 'None', val: dashboardStats?.categories?.none || 0 }
  ];

  return (
    <div className="admin-tab-view animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', color: '#181c32', padding: '1.75rem' }}>
      
      {/* SECTION 1: METRONIC 3-COLUMN MAIN CARDS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>

        {/* COLUMN 1 CARD (Approved Blacklist Distribution) */}
        <div className="db-panel-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', padding: '1.5rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '1.8rem', fontWeight: 800 }}>{approvedReports}</span>
              <span className="status-badge approved" style={{ background: '#e8fff3', color: '#50cd89', fontSize: '0.72rem', fontWeight: 700, padding: '0.15rem 0.4rem', borderRadius: '4px' }}>
                Đang bảo vệ
              </span>
            </div>
            <span style={{ fontSize: '0.78rem', color: '#a1a5b7', fontWeight: 500 }}>Đối tượng đã chặn (Blacklist)</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', height: '110px' }}>
            <div style={{ width: '100px', height: '100px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={threatTypesData}
                    cx="50%"
                    cy="50%"
                    innerRadius={30}
                    outerRadius={45}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {threatTypesData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.78rem', flex: 1 }}>
              {threatTypesData.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: item.color }}></span>
                    <span style={{ color: '#5e6278', fontWeight: 500 }}>{item.name}</span>
                  </div>
                  <span style={{ fontWeight: 700, color: '#181c32' }}>{item.value} mục</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* COLUMN 2 CARD (Weekly Reports Trend) */}
        <div className="db-panel-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', padding: '1.5rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '1.8rem', fontWeight: 800 }}>+{WEEKLY_THREATS_DATA.reduce((acc, curr) => acc + curr.reports, 0)}</span>
              <span className="status-badge pending" style={{ background: '#fff8dd', color: '#ffc700', fontSize: '0.72rem', fontWeight: 700, padding: '0.15rem 0.4rem', borderRadius: '4px' }}>
                Tuần này
              </span>
            </div>
            <span style={{ fontSize: '0.78rem', color: '#a1a5b7', fontWeight: 500 }}>Lượt tố cáo mới tuần qua</span>
          </div>

          <div style={{ flexGrow: 1, height: '110px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={WEEKLY_THREATS_DATA}>
                <Bar dataKey="reports" fill="#009ef7" radius={[3, 3, 0, 0]} barSize={14} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* COLUMN 3 CARD (Threat Types Breakdown) */}
        <div className="db-panel-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h4 style={{ margin: 0, fontSize: '0.92rem', fontWeight: 700, color: '#181c32' }}>Hình thức lừa đảo</h4>
              <span style={{ fontSize: '0.72rem', color: '#a1a5b7' }}>Thống kê phân loại vi phạm chính</span>
            </div>
          </div>

          <div style={{ margin: '0.5rem 0 0 0' }}>
            <span style={{ fontSize: '1.6rem', fontWeight: 800, color: '#181c32' }}>{totalReports} vụ</span>
            <span style={{ fontSize: '0.72rem', color: '#a1a5b7', marginLeft: '0.4rem' }}>Tổng số phản ánh đã thu nhận</span>
          </div>

          <div style={{ flexGrow: 1, height: '100px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={threatCategoriesData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                <CartesianGrid stroke="#f1f3f9" vertical={false} />
                <XAxis dataKey="name" hide />
                <YAxis hide />
                <Area type="monotone" dataKey="val" stroke="#50cd89" strokeWidth={2.5} fill="rgba(80, 205, 137, 0.05)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* SECTION 2: METRONIC SECOND ROW CARDS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>

        {/* COLUMN 1 CARD (Threat Distribution in Databases) */}
        <div className="db-panel-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', padding: '1.5rem' }}>
          <div>
            <span style={{ fontSize: '1.8rem', fontWeight: 800 }}>{totalReports}</span>
            <span style={{ fontSize: '0.78rem', color: '#a1a5b7', fontWeight: 500, display: 'block', marginTop: '0.15rem' }}>Phản ánh đã xử lý kiểm duyệt</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginTop: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #eff2f5', paddingBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.8rem', color: '#5e6278' }}>Chờ phê duyệt</span>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#ffc700' }}>{pendingReports}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #eff2f5', paddingBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.8rem', color: '#5e6278' }}>Đã phê duyệt chặn</span>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#50cd89' }}>{approvedReports}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.8rem', color: '#5e6278' }}>Từ chối báo cáo</span>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#f1416c' }}>{rejectedReports}</span>
            </div>
          </div>
        </div>

        {/* COLUMN 2 CARD (Reporters Avatar Stack) */}
        <div className="db-panel-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', padding: '1.5rem' }}>
          <div>
            <span style={{ fontSize: '2.2rem', fontWeight: 800 }}>{usersCount}</span>
            <div style={{ fontSize: '0.78rem', color: '#a1a5b7', fontWeight: 500, marginTop: '0.15rem' }}>Thành viên cộng đồng CLD</div>
          </div>

          <div style={{ marginTop: 'auto' }}>
            <span style={{ fontSize: '0.7rem', color: '#a1a5b7', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700, display: 'block', marginBottom: '0.5rem' }}>
              Người đóng góp tố cáo mới
            </span>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              {['K', 'M', 'N', 'T', 'H'].map((char, index) => (
                <div
                  key={index}
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: index % 2 === 0 ? '#3e97ff' : '#50cd89',
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
                +18
              </div>
            </div>
          </div>
        </div>

        {/* COLUMN 3 CARD (System Status / API Health) */}
        <div className="db-panel-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', padding: '1.5rem' }}>
          <h4 style={{ margin: 0, fontSize: '0.92rem', fontWeight: 700, color: '#181c32' }}>Hiệu năng giám sát</h4>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #eff2f5', paddingBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.8rem', color: '#5e6278' }}>Tỷ lệ duyệt chặn chính xác</span>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#50cd89' }}>{approvalRate}%</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #eff2f5', paddingBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.8rem', color: '#5e6278' }}>Độ trễ đồng bộ tiện ích</span>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#7239ea' }}>Thực tế (&lt;5s)</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.8rem', color: '#5e6278' }}>Bảo vệ tiện ích mở rộng</span>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#009ef7' }}>Online</span>
            </div>
          </div>
        </div>

      </div>

      {/* SECTION 3: QUICK SECURITY METRICS (4 Columns Grid) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>

        {/* Metric 1: Blocked URLs */}
        <div className="db-panel-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem' }}>
          <div>
            <span style={{ fontSize: '0.72rem', color: '#a1a5b7', fontWeight: 600, display: 'block' }}>Tên miền đã chặn</span>
            <span style={{ fontSize: '1.4rem', fontWeight: 800, color: '#181c32' }}>{threatTypesData[0].value}</span>
            <span style={{ fontSize: '0.68rem', color: '#009ef7', display: 'block', marginTop: '0.2rem' }}>Trang web giả mạo/độc hại</span>
          </div>
          <div style={{ color: '#009ef7' }}><Globe size={24} /></div>
        </div>

        {/* Metric 2: Blocked Phones */}
        <div className="db-panel-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem' }}>
          <div>
            <span style={{ fontSize: '0.72rem', color: '#a1a5b7', fontWeight: 600, display: 'block' }}>SĐT lừa đảo đã chặn</span>
            <span style={{ fontSize: '1.4rem', fontWeight: 800, color: '#181c32' }}>{threatTypesData[1].value}</span>
            <span style={{ fontSize: '0.68rem', color: '#ffc700', display: 'block', marginTop: '0.2rem' }}>Cuộc gọi/SMS scam</span>
          </div>
          <div style={{ color: '#ffc700' }}><Phone size={24} /></div>
        </div>

        {/* Metric 3: Blocked Banks */}
        <div className="db-panel-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem' }}>
          <div>
            <span style={{ fontSize: '0.72rem', color: '#a1a5b7', fontWeight: 600, display: 'block' }}>Tài khoản ngân hàng</span>
            <span style={{ fontSize: '1.4rem', fontWeight: 800, color: '#181c32' }}>{threatTypesData[2].value}</span>
            <span style={{ fontSize: '0.68rem', color: '#f1416c', display: 'block', marginTop: '0.2rem' }}>Tài khoản nhận tiền lừa đảo</span>
          </div>
          <div style={{ color: '#f1416c' }}><CreditCard size={24} /></div>
        </div>

        {/* Metric 4: Shield Status */}
        <div className="db-panel-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem' }}>
          <div>
            <span style={{ fontSize: '0.72rem', color: '#a1a5b7', fontWeight: 600, display: 'block' }}>Tỷ lệ duyệt chính xác</span>
            <span style={{ fontSize: '1.4rem', fontWeight: 800, color: '#181c32' }}>{approvalRate}%</span>
            <span style={{ fontSize: '0.68rem', color: '#50cd89', display: 'block', marginTop: '0.2rem' }}>Đã đối soát kiểm duyệt</span>
          </div>
          <div style={{ color: '#50cd89' }}><ShieldCheck size={24} /></div>
        </div>

      </div>

      {/* SECTION 4: MODERATOR PERFORMANCE STATISTICS */}
      <div className="card">
        <div className="card-header border-0 pt-5" style={{ paddingBottom: '0.5rem' }}>
          <h3 className="card-title align-items-start flex-column" style={{ flexDirection: 'column', alignItems: 'flex-start', margin: 0 }}>
            <span className="card-label fw-bold fs-3 mb-1" style={{ color: '#181c32', fontSize: '1.15rem' }}>
              Hiệu suất Kiểm duyệt viên (Moderator Performance)
            </span>
            <span style={{ fontSize: '0.78rem', color: '#a1a5b7' }}>
              Thống kê số lượng báo cáo phản ánh đã xử lý bởi các điều phối viên
            </span>
          </h3>
        </div>

        <div className="card-body py-3">
          <div className="table-responsive">
            <table className="table align-middle table-row-dashed fs-6 gy-5">
              <thead>
                <tr className="text-start text-muted fw-bold fs-7 text-uppercase gs-0" style={{ borderBottom: '1px solid #eff2f5' }}>
                  <th>Kiểm duyệt viên</th>
                  <th>Địa chỉ Email</th>
                  <th className="text-center" style={{ textAlign: 'center' }}>Đã duyệt (Approve)</th>
                  <th className="text-center" style={{ textAlign: 'center' }}>Từ chối (Reject)</th>
                  <th className="text-center" style={{ textAlign: 'center' }}>Tổng số xử lý</th>
                  <th>Tỷ lệ đóng góp</th>
                  <th className="text-end" style={{ textAlign: 'right' }}>Trạng thái</th>
                </tr>
              </thead>
              <tbody className="text-gray-600 fw-semibold">
                {(!modStatsData || !Array.isArray(modStatsData.moderators) || modStatsData.moderators.length === 0) ? (
                  <tr>
                    <td colSpan="7" className="text-center" style={{ padding: '3rem', textAlign: 'center', color: '#a1a5b7' }}>
                      Chưa có dữ liệu thống kê kiểm duyệt viên từ máy chủ.
                    </td>
                  </tr>
                ) : (
                  modStatsData.moderators.map((m, idx) => {
                    const approved = m.approved || 0;
                    const rejected = m.rejected || 0;
                    const modTotal = m.total_processed !== undefined ? m.total_processed : (approved + rejected);
                    const percentage = typeof m.contribution_percentage === 'number' ? Math.round(m.contribution_percentage) : (m.contribution_percentage || 0);
                    const avatarBg = METRONIC_COLORS[idx % METRONIC_COLORS.length];
                    const initials = (m.name || m.email || 'M').split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

                    return (
                      <tr key={idx} style={{ borderBottom: '1px solid #eff2f5' }}>
                        {/* Name & Avatar */}
                        <td style={{ display: 'flex', alignItems: 'center', borderBottom: 'none', padding: '1rem 0' }}>
                          <div
                            className="symbol symbol-circle symbol-35px me-3"
                            style={{
                              width: '35px',
                              height: '35px',
                              borderRadius: '50%',
                              backgroundColor: avatarBg,
                              color: '#fff',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 700,
                              fontSize: '0.82rem',
                              marginRight: '0.75rem'
                            }}
                          >
                            {initials}
                          </div>
                          <span className="text-gray-800 text-hover-primary" style={{ fontWeight: 700, fontSize: '0.9rem', color: '#181c32' }}>
                            {m.name || m.email?.split('@')[0] || 'Kiểm duyệt viên'}
                          </span>
                        </td>

                        {/* Email */}
                        <td>
                          <span style={{ fontSize: '0.85rem', color: '#5e6278' }}>{m.email}</span>
                        </td>

                        {/* Approved */}
                        <td className="text-center" style={{ textAlign: 'center' }}>
                          <span className="badge badge-light-success" style={{ padding: '0.25rem 0.6rem', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 600 }}>
                            {approved}
                          </span>
                        </td>

                        {/* Rejected */}
                        <td className="text-center" style={{ textAlign: 'center' }}>
                          <span className="badge badge-light-danger" style={{ padding: '0.25rem 0.6rem', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 600 }}>
                            {rejected}
                          </span>
                        </td>

                        {/* Total */}
                        <td className="text-center" style={{ textAlign: 'center', fontWeight: 700, color: '#181c32' }}>
                          {modTotal}
                        </td>

                        {/* Progress Bar / Ratio */}
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '130px' }}>
                            <span style={{ fontSize: '0.78rem', color: '#5e6278', fontWeight: 700, width: '30px' }}>{percentage}%</span>
                            <div style={{ flex: 1, background: '#eff2f5', height: '5px', borderRadius: '3px', overflow: 'hidden' }}>
                              <div style={{ background: avatarBg, height: '100%', width: `${Math.min(100, percentage)}%` }} />
                            </div>
                          </div>
                        </td>

                        {/* Status */}
                        <td className="text-end" style={{ textAlign: 'right' }}>
                          <span
                            className="badge badge-light-success"
                            style={{
                              fontSize: '0.72rem',
                              fontWeight: 'bold',
                              textTransform: 'uppercase'
                            }}
                          >
                            Hoạt động
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

    </div>
  );
}
