import React, { useState } from 'react';
import { Users, UserPlus, KeyRound, Trash2, X, AlertCircle, CheckCircle2, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Role } from '../../types/auth';

export const UserManagementModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const { currentUser, users, addUser, deleteUser, adminResetPassword } = useAuth();

  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState<Role>('staff');
  const [feedback, setFeedback] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

  // Password reset targeting
  const [resetTargetUser, setResetTargetUser] = useState<{ id: string; name: string } | null>(null);
  const [resetNewPass, setResetNewPass] = useState('');

  if (!isOpen) return null;

  // Access Guard
  if (currentUser?.role !== 'admin') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
        <div className="w-full max-w-md bg-[#121217] border border-rose-500/40 rounded-3xl p-6 shadow-2xl text-center space-y-4">
          <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
          <h3 className="text-base font-bold text-white">Access Denied</h3>
          <p className="text-xs text-slate-400">
            Non-admin staff users cannot view or edit user accounts and password settings.
          </p>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#1a1a24] text-white text-xs font-semibold rounded-xl"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    const res = addUser(newName, newEmail, newPassword, newRole);
    if (res.success) {
      setFeedback({ type: 'success', text: `Account for ${newName} created successfully!` });
      setShowAddForm(false);
      setNewName('');
      setNewEmail('');
      setNewPassword('');
      setNewRole('staff');
    } else {
      setFeedback({ type: 'error', text: res.error || 'Failed to create user.' });
    }
  };

  const handleResetPassSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetTargetUser) return;
    setFeedback(null);

    const res = adminResetPassword(resetTargetUser.id, resetNewPass);
    if (res.success) {
      setFeedback({ type: 'success', text: `Password for ${resetTargetUser.name} updated instantly without old password!` });
      setResetTargetUser(null);
      setResetNewPass('');
    } else {
      setFeedback({ type: 'error', text: res.error || 'Failed to update password.' });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="w-full max-w-2xl bg-[#121217] border border-[#2a2a36] rounded-3xl p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#23232c]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#FFC700]/15 text-[#FFC700] flex items-center justify-center font-bold">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                User Management & Staff Roles
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#FFC700]/20 text-[#FFC700] border border-[#FFC700]/30 font-semibold">
                  Admin Only
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Create new accounts, manage roles, and reset staff passwords directly without old passwords.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-[#1a1a24] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Feedback Alert */}
        {feedback && (
          <div
            className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
              feedback.type === 'success'
                ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400'
                : 'bg-rose-500/15 border border-rose-500/30 text-rose-400'
            }`}
          >
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
            )}
            <span>{feedback.text}</span>
          </div>
        )}

        {/* Add User Bar */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-300">
            Active Accounts ({users.length})
          </span>
          {!showAddForm && (
            <button
              onClick={() => setShowAddForm(true)}
              className="px-3.5 py-1.5 bg-[#FFC700] hover:bg-[#ffcf1a] text-black font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-md shadow-[#FFC700]/20 cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              Add New User
            </button>
          )}
        </div>

        {/* Add New User Form Drawer */}
        {showAddForm && (
          <form onSubmit={handleAddSubmit} className="bg-[#181820] border border-[#2a2a36] rounded-2xl p-4 space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Create New Staff / Admin Account
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-300">Full Name *</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  placeholder="e.g. Bilal Khan"
                  className="w-full mt-1 bg-[#121217] border border-[#2a2a36] focus:border-[#FFC700] rounded-xl px-3 py-2 text-xs text-white outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300">Work Email *</label>
                <input
                  type="email"
                  required
                  value={newEmail}
                  onChange={e => setNewEmail(e.target.value)}
                  placeholder="bilal@digicorepak.com"
                  className="w-full mt-1 bg-[#121217] border border-[#2a2a36] focus:border-[#FFC700] rounded-xl px-3 py-2 text-xs text-white outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300">Initial Password *</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="Min 6 chars"
                  className="w-full mt-1 bg-[#121217] border border-[#2a2a36] focus:border-[#FFC700] rounded-xl px-3 py-2 text-xs text-white outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300">Account Role *</label>
                <select
                  value={newRole}
                  onChange={e => setNewRole(e.target.value as Role)}
                  className="w-full mt-1 bg-[#121217] border border-[#2a2a36] focus:border-[#FFC700] rounded-xl px-3 py-2 text-xs text-white outline-none"
                >
                  <option value="staff" className="bg-[#121217] text-white">Staff (Outreach / Sales)</option>
                  <option value="admin" className="bg-[#121217] text-white">Admin (Full Control)</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#2a2a36]">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-3.5 py-1.5 text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 text-xs font-bold bg-[#FFC700] hover:bg-[#ffcf1a] text-black rounded-xl cursor-pointer"
              >
                Save Account
              </button>
            </div>
          </form>
        )}

        {/* Users Table */}
        <div className="border border-[#23232c] rounded-2xl overflow-hidden">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#181820] text-slate-400 uppercase tracking-wider font-semibold border-b border-[#23232c]">
                <th className="p-3">User</th>
                <th className="p-3">Email</th>
                <th className="p-3">Role</th>
                <th className="p-3">Admin Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#23232c]">
              {users.map(u => (
                <tr key={u.id} className="hover:bg-[#181820]/60 transition-colors">
                  <td className="p-3 font-semibold text-white">
                    {u.name}
                    {u.id === currentUser?.id && (
                      <span className="ml-2 text-[10px] text-[#FFC700] bg-[#FFC700]/10 px-1.5 py-0.5 rounded font-mono">
                        You
                      </span>
                    )}
                  </td>
                  <td className="p-3 font-mono text-slate-300">{u.email}</td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[11px] font-semibold uppercase ${
                        u.role === 'admin'
                          ? 'bg-[#FFC700]/20 text-[#FFC700] border border-[#FFC700]/30'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setResetTargetUser({ id: u.id, name: u.name })}
                        className="px-2.5 py-1 rounded-lg bg-[#181820] hover:bg-[#22222d] text-[#FFC700] border border-[#2a2a36] font-medium flex items-center gap-1 cursor-pointer"
                        title="Change password without old password"
                      >
                        <KeyRound className="w-3 h-3" />
                        Reset Pass
                      </button>

                      {u.email !== 'digicorepak@gmail.com' && u.id !== currentUser?.id && (
                        <button
                          onClick={() => deleteUser(u.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg cursor-pointer"
                          title="Delete user"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Inline Reset Password Modal for Admin */}
        {resetTargetUser && (
          <div className="bg-[#181820] border border-[#FFC700]/40 rounded-2xl p-4 space-y-3 animate-in fade-in">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                <KeyRound className="w-4 h-4 text-[#FFC700]" />
                Direct Password Override: <span className="text-[#FFC700]">{resetTargetUser.name}</span>
              </h4>
              <button
                onClick={() => setResetTargetUser(null)}
                className="text-xs text-slate-400 hover:text-white cursor-pointer"
              >
                Cancel
              </button>
            </div>
            <p className="text-[11px] text-slate-400">
              As an Administrator, you do not need the user's old password to set a new password.
            </p>
            <form onSubmit={handleResetPassSubmit} className="flex gap-2">
              <input
                type="password"
                required
                value={resetNewPass}
                onChange={e => setResetNewPass(e.target.value)}
                placeholder="Enter new password (min 6 chars)"
                className="flex-1 bg-[#121217] border border-[#2a2a36] focus:border-[#FFC700] rounded-xl px-3 py-2 text-xs text-white outline-none"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-[#FFC700] hover:bg-[#ffcf1a] text-black font-bold text-xs rounded-xl cursor-pointer"
              >
                Apply New Password
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
