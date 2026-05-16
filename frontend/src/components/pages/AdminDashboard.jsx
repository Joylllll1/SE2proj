import React, { useState, useEffect } from 'react';
import Icon from '../common/Icon';
import EmptyState from '../common/EmptyState';
import AdminSidebar from '../layout/AdminSidebar';
import useAdminStore from '../../store/adminStore';
import useUiStore from '../../store/uiStore';

// Ban duration options
const BAN_DURATIONS = [
  { days: 1, label: '1 天' },
  { days: 3, label: '3 天' },
  { days: 7, label: '7 天' },
  { days: 30, label: '30 天' },
];

// ─── Modal Components ───

function TraceModal({ post, onClose, onConfirm }) {
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    if (!reason.trim()) return;
    setLoading(true);
    try {
      await onConfirm(reason);
      onClose();
    } catch (err) {
      // Error handled by store
    }
    setLoading(false);
  };

  return (
    <div className="modal-overlay fixed inset-0 z-[150] grid place-items-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="modal-content w-[min(500px,90vw)] rounded-2xl bg-white p-6 shadow-lg" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-xl font-bold mb-4">追溯发帖人身份</h2>
        <p className="text-gray-600 text-sm mb-4">请输入追溯原因（必填，将记录审计日志）</p>
        <textarea
          className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm min-h-[100px] resize-y focus:outline-none focus:border-blue-500"
          placeholder="例如：用户举报涉嫌人身攻击，需核实身份"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
        <div className="flex justify-end gap-3 mt-6">
          <button className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-full" onClick={onClose}>取消</button>
          <button
            className="px-6 py-2 text-sm font-bold text-white bg-blue-600 rounded-full hover:bg-blue-700 disabled:opacity-50"
            onClick={handleConfirm}
            disabled={!reason.trim() || loading}
          >
            {loading ? '追溯中...' : '确认追溯'}
          </button>
        </div>
      </div>
    </div>
  );
}

function BanModal({ userId, postId, onConfirm, onClose }) {
  const [days, setDays] = useState(7);
  const [customDays, setCustomDays] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  const finalDays = customDays ? parseInt(customDays, 10) : days;

  const handleConfirm = async () => {
    if (!reason.trim() || !finalDays || finalDays < 1) return;
    setLoading(true);
    try {
      await onConfirm({ days: finalDays, reason, relatedPostId: postId });
      onClose();
    } catch (err) {
      // Error handled by store
    }
    setLoading(false);
  };

  return (
    <div className="modal-overlay fixed inset-0 z-[150] grid place-items-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="modal-content w-[min(500px,90vw)] rounded-2xl bg-white p-6 shadow-lg" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-xl font-bold mb-4">封禁用户</h2>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">封禁时长</label>
          <div className="flex flex-wrap gap-2">
            {BAN_DURATIONS.map((d) => (
              <button
                key={d.days}
                className={`px-4 py-2 text-sm rounded-full border ${days === d.days && !customDays ? 'bg-blue-100 border-blue-500 text-blue-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                onClick={() => { setDays(d.days); setCustomDays(''); }}
                type="button"
              >
                {d.label}
              </button>
            ))}
            <input
              type="number"
              className="w-20 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
              placeholder="自定义"
              value={customDays}
              onChange={(e) => setCustomDays(e.target.value)}
              min="1"
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">封禁原因</label>
          <textarea
            className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm min-h-[80px] resize-y focus:outline-none focus:border-blue-500"
            placeholder="请输入封禁原因（将发送邮件通知用户）"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-full" onClick={onClose}>取消</button>
          <button
            className="px-6 py-2 text-sm font-bold text-white bg-red-600 rounded-full hover:bg-red-700 disabled:opacity-50"
            onClick={handleConfirm}
            disabled={!reason.trim() || !finalDays || finalDays < 1 || loading}
          >
            {loading ? '处理中...' : '确认封禁'}
          </button>
        </div>
      </div>
    </div>
  );
}

function UnbanModal({ ban, onConfirm, onClose }) {
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    if (!reason.trim()) return;
    setLoading(true);
    try {
      await onConfirm(reason);
      onClose();
    } catch (err) {
      // Error handled by store
    }
    setLoading(false);
  };

  return (
    <div className="modal-overlay fixed inset-0 z-[150] grid place-items-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="modal-content w-[min(500px,90vw)] rounded-2xl bg-white p-6 shadow-lg" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-xl font-bold mb-4">提前解禁</h2>
        <p className="text-gray-600 text-sm mb-4">用户：{ban.userId?.email || '未知'}</p>
        <textarea
          className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm min-h-[80px] resize-y focus:outline-none focus:border-blue-500"
          placeholder="请输入解禁原因（如：申诉通过、误封等）"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
        <div className="flex justify-end gap-3 mt-6">
          <button className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-full" onClick={onClose}>取消</button>
          <button
            className="px-6 py-2 text-sm font-bold text-white bg-blue-600 rounded-full hover:bg-blue-700 disabled:opacity-50"
            onClick={handleConfirm}
            disabled={!reason.trim() || loading}
          >
            {loading ? '处理中...' : '确认解禁'}
          </button>
        </div>
      </div>
    </div>
  );
}

function PostDetailModal({ post, onClose }) {
  if (!post) return null;

  // 评论/回复详情
  if (post.targetType === 'comment' || post.targetType === 'reply') {
    return (
      <div className="modal-overlay fixed inset-0 z-[150] grid place-items-center bg-black/30 backdrop-blur-sm" onClick={onClose}>
        <div className="modal-content w-[min(640px,90vw)] max-h-[85vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-lg" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex-1">
              <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-700 mb-2">
                {post.targetType === 'comment' ? '评论内容' : '回复内容'}
              </span>
              <div className="flex items-center gap-3 text-gray-500 text-sm">
                <span>{new Date(post.targetCreatedAt).toLocaleString('zh-CN')}</span>
              </div>
            </div>
          </div>
          <div className="p-4 bg-gray-50 rounded-xl mb-4">
            <p className="text-gray-700 leading-relaxed">{post.content || '[内容已删除]'}</p>
          </div>
          {post.postId && (
            <div className="p-3 bg-gray-100 rounded-lg text-sm">
              <span className="text-gray-500">所属帖子：</span>
              <span className="text-gray-700">{post.postId.title || '[已删除]'}</span>
            </div>
          )}
          <div className="flex justify-end">
            <button className="px-6 py-2 text-sm font-medium text-white bg-gray-800 rounded-full hover:bg-gray-900" onClick={onClose}>关闭</button>
          </div>
        </div>
      </div>
    );
  }

  // 帖子详情
  return (
    <div className="modal-overlay fixed inset-0 z-[150] grid place-items-center bg-black/30 backdrop-blur-sm" onClick={onClose}>
      <div className="modal-content w-[min(640px,90vw)] max-h-[85vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-lg" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex-1">
            {post.mood && <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-700 mb-2">{post.mood}</span>}
            <h2 className="text-xl font-bold">{post.title}</h2>
            <div className="flex items-center gap-3 mt-2 text-gray-500 text-sm">
              <span>{new Date(post.createdAt).toLocaleString('zh-CN')}</span>
              {post.isDeleted && <span className="text-red-500 font-medium">[已删除]</span>}
            </div>
          </div>
        </div>
        <div className="p-4 bg-gray-50 rounded-xl mb-4">
          <p className="text-gray-700 leading-relaxed">{post.content}</p>
        </div>
        {post.images?.[0] && (
          <img className="w-full max-h-80 rounded-xl object-cover mb-4" alt={post.title} src={post.images[0]} />
        )}
        <div className="flex justify-end">
          <button className="px-6 py-2 text-sm font-medium text-white bg-gray-800 rounded-full hover:bg-gray-900" onClick={onClose}>关闭</button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Dashboard ───

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('reports');
  const [selectedPost, setSelectedPost] = useState(null);
  const [traceModalPost, setTraceModalPost] = useState(null);
  const [banModalData, setBanModalData] = useState(null);
  const [unbanModalBan, setUnbanModalBan] = useState(null);

  const showToast = useUiStore((s) => s.showToast);

  const {
    reports, reportsLoading, fetchReports, dismissReport, deletePost, deleteComment,
    bans, bansLoading, fetchBans, banUser, unbanUser,
    traceResult, traceLoading, tracePost, clearTraceResult,
    auditLogs, auditLogsLoading, fetchAuditLogs,
  } = useAdminStore();

  // Fetch data on mount and tab change
  useEffect(() => {
    if (activeTab === 'reports') fetchReports();
    if (activeTab === 'bans') fetchBans(true);
    if (activeTab === 'audit') fetchAuditLogs();
  }, [activeTab, fetchReports, fetchBans, fetchAuditLogs]);

  // Handle trace
  const handleTrace = async (reason) => {
    if (!traceModalPost) return;
    try {
      await tracePost(traceModalPost._id, traceModalPost.targetType || 'post', reason);
      showToast('追溯成功');
    } catch (err) {
      showToast(err.message || '追溯失败');
      throw err;
    }
  };

  // Handle ban
  const handleBan = async ({ days, reason, relatedPostId }) => {
    if (!banModalData) return;
    try {
      await banUser(banModalData.userId, { days, reason, relatedPostId });
      showToast('封禁成功');
    } catch (err) {
      showToast(err.message || '封禁失败');
      throw err;
    }
  };

  // Handle unban
  const handleUnban = async (reason) => {
    if (!unbanModalBan) return;
    try {
      await unbanUser(unbanModalBan._id, reason);
      showToast('解禁成功');
    } catch (err) {
      showToast(err.message || '解禁失败');
      throw err;
    }
  };

  // Handle delete post
  const handleDeletePost = async (postId) => {
    if (!window.confirm('确定要删除这篇帖子吗？此操作不可逆。')) return;
    try {
      await deletePost(postId, '管理员删除违规内容');
      showToast('帖子已删除');
    } catch (err) {
      showToast(err.message || '删除失败');
    }
  };

  // Handle delete comment
  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('确定要删除这条评论吗？此操作不可逆。')) return;
    try {
      await deleteComment(commentId, '管理员删除违规内容');
      showToast('评论已删除');
    } catch (err) {
      showToast(err.message || '删除失败');
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="flex-1 p-6">
        {/* Reports Tab */}
        {activeTab === 'reports' && (
          <div>
            <h1 className="text-2xl font-bold mb-6">举报管理</h1>
            {reportsLoading ? (
              <div className="text-center py-12 text-gray-500">加载中...</div>
            ) : reports.length === 0 ? (
              <EmptyState title="暂无待处理举报" description="举报队列已清空" />
            ) : (
              <div className="space-y-4">
                {reports.map((report) => (
                  <div key={report._id} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          report.targetType === 'post' ? 'bg-orange-100 text-orange-700' :
                          report.targetType === 'comment' ? 'bg-blue-100 text-blue-700' :
                          'bg-purple-100 text-purple-700'
                        }`}>
                          {report.targetType === 'post' ? '帖子举报' :
                           report.targetType === 'comment' ? '评论举报' : '回复举报'}
                        </span>
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-600">
                          {report.reasons?.[0]?.reason || '举报'}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-gray-500">
                          举报 {report.reportCount || report.reasons?.length || 1} 次
                        </span>
                        <span className="text-xs text-gray-400">
                          {new Date(report.createdAt).toLocaleString('zh-CN')}
                        </span>
                      </div>
                    </div>

                    {/* 帖子举报显示帖子内容 */}
                    {report.targetType === 'post' && report.postId && (
                      <div className="p-3 bg-gray-50 rounded-lg mb-4">
                        <h3 className="font-semibold text-gray-800 mb-1">{report.postId.title}</h3>
                        <p className="text-sm text-gray-600 line-clamp-2">{report.postId.content}</p>
                      </div>
                    )}

                    {/* 评论/回复举报只显示内容本身 */}
                    {(report.targetType === 'comment' || report.targetType === 'reply') && (
                      <div className="p-3 bg-gray-50 rounded-lg mb-4">
                        <p className="text-sm text-gray-600">{report.targetContent || '[内容已删除]'}</p>
                        {report.postId && (
                          <p className="text-xs text-gray-400 mt-2">
                            所属帖子：{report.postId.title || '[已删除]'}
                          </p>
                        )}
                      </div>
                    )}

                    <div className="flex flex-wrap gap-2">
                      <button
                        className="px-3 py-1.5 text-xs font-semibold border border-gray-200 rounded-full text-gray-600 hover:bg-gray-50"
                        onClick={() => setSelectedPost(report.targetType === 'post' ? report.postId : { content: report.targetContent, postId: report.postId, targetType: report.targetType })}
                        type="button"
                      >
                        查看详情
                      </button>
                      <button
                        className="px-3 py-1.5 text-xs font-semibold border border-blue-200 rounded-full text-blue-600 hover:bg-blue-50"
                        onClick={() => setTraceModalPost({ _id: report.targetId, targetType: report.targetType })}
                        type="button"
                      >
                        追溯身份
                      </button>
                      {report.targetType === 'post' && (
                        <button
                          className="px-3 py-1.5 text-xs font-semibold border border-red-200 rounded-full text-red-600 hover:bg-red-50"
                          onClick={() => handleDeletePost(report.postId?._id || report.targetId)}
                          type="button"
                        >
                          删除帖子
                        </button>
                      )}
                      {(report.targetType === 'comment' || report.targetType === 'reply') && (
                        <button
                          className="px-3 py-1.5 text-xs font-semibold border border-red-200 rounded-full text-red-600 hover:bg-red-50"
                          onClick={() => handleDeleteComment(report.targetId)}
                          type="button"
                        >
                          删除评论
                        </button>
                      )}
                      <button
                        className="px-3 py-1.5 text-xs font-semibold border border-gray-200 rounded-full text-gray-500 hover:bg-gray-50"
                        onClick={() => dismissReport(report._id)}
                        type="button"
                      >
                        驳回举报
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Bans Tab */}
        {activeTab === 'bans' && (
          <div>
            <h1 className="text-2xl font-bold mb-6">封禁记录</h1>
            {bansLoading ? (
              <div className="text-center py-12 text-gray-500">加载中...</div>
            ) : bans.length === 0 ? (
              <EmptyState title="暂无封禁记录" description="封禁列表为空" />
            ) : (
              <div className="space-y-4">
                {bans.map((ban) => (
                  <div key={ban._id} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-semibold text-gray-800">{ban.userId?.email || '未知用户'}</p>
                        <p className="text-sm text-gray-500 mt-1">原因：{ban.reason}</p>
                      </div>
                      <div className="text-right">
                        {ban.isActive && !ban.isExpired ? (
                          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-700">
                            剩余 {ban.remainingDays} 天
                          </span>
                        ) : (
                          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-600">
                            已过期
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                      <span>封禁 {ban.days} 天</span>
                      <span>•</span>
                      <span>{new Date(ban.createdAt).toLocaleString('zh-CN')}</span>
                    </div>
                    {ban.relatedPostId && (
                      <div className="p-2 bg-gray-50 rounded text-xs text-gray-600 mb-4">
                        关联帖子：{ban.relatedPostId.title || '[已删除]'}
                        <button
                          className="ml-2 text-blue-600 hover:underline"
                          onClick={() => setSelectedPost(ban.relatedPostId)}
                          type="button"
                        >
                          查看
                        </button>
                      </div>
                    )}
                    {ban.isActive && !ban.isExpired && (
                      <button
                        className="px-3 py-1.5 text-xs font-semibold border border-blue-200 rounded-full text-blue-600 hover:bg-blue-50"
                        onClick={() => setUnbanModalBan(ban)}
                        type="button"
                      >
                        提前解禁
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Audit Tab */}
        {activeTab === 'audit' && (
          <div>
            <h1 className="text-2xl font-bold mb-6">审计日志</h1>
            {auditLogsLoading ? (
              <div className="text-center py-12 text-gray-500">加载中...</div>
            ) : auditLogs.length === 0 ? (
              <EmptyState title="暂无审计日志" description="操作记录为空" />
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold text-gray-600">操作</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-600">对象</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-600">原因</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-600">时间</th>
                    </tr>
                  </thead>
                  <tbody>
                    {auditLogs.map((log) => (
                      <tr key={log._id} className="border-t border-gray-100">
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            log.action === 'trace' ? 'bg-purple-100 text-purple-700' :
                            log.action === 'ban' ? 'bg-red-100 text-red-700' :
                            log.action === 'unban' ? 'bg-green-100 text-green-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {log.action === 'trace' ? '追溯' :
                             log.action === 'ban' ? '封禁' :
                             log.action === 'unban' ? '解禁' : '删帖'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-600">
                          {log.targetUserId?.email || log.targetPostId?.title?.slice(0, 20) || '-'}
                        </td>
                        <td className="px-4 py-3 text-gray-500 max-w-[200px] truncate">
                          {log.reason || '-'}
                        </td>
                        <td className="px-4 py-3 text-gray-400">
                          {new Date(log.createdAt).toLocaleString('zh-CN')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Trace Result Panel */}
      {traceResult && (
        <div className="fixed bottom-4 right-4 w-80 bg-white rounded-xl shadow-lg p-4 z-50">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">追溯结果</h3>
            <button className="text-gray-400 hover:text-gray-600" onClick={clearTraceResult}>✕</button>
          </div>
          <div className="space-y-2 text-sm">
            <p><span className="text-gray-500">邮箱：</span>{traceResult.email}</p>
            <p><span className="text-gray-500">发帖：</span>{traceResult.postCount} 篇</p>
            <p><span className="text-gray-500">评论：</span>{traceResult.commentCount} 条</p>
            <p><span className="text-gray-500">被举报：</span>{traceResult.reportCount} 次</p>
            {traceResult.isBanned && (
              <p className="text-red-600">当前封禁中，剩余 {Math.ceil((new Date(traceResult.banExpiresAt) - new Date()) / 86400000)} 天</p>
            )}
          </div>
          <button
            className="w-full mt-4 py-2 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700"
            onClick={() => {
              setBanModalData({ userId: traceResult.userId || traceResult._id, postId: traceModalPost?._id });
              clearTraceResult();
            }}
            type="button"
          >
            封禁该用户
          </button>
        </div>
      )}

      {/* Modals */}
      {selectedPost && <PostDetailModal post={selectedPost} onClose={() => setSelectedPost(null)} />}
      {traceModalPost && <TraceModal post={traceModalPost} onClose={() => setTraceModalPost(null)} onConfirm={handleTrace} />}
      {banModalData && <BanModal {...banModalData} onClose={() => setBanModalData(null)} onConfirm={handleBan} />}
      {unbanModalBan && <UnbanModal ban={unbanModalBan} onClose={() => setUnbanModalBan(null)} onConfirm={handleUnban} />}
    </div>
  );
}

export default AdminDashboard;
