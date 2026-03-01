import React, { useState, useEffect } from 'react';
import { Users, Search, Shield, Ban, CheckCircle, UserCircle } from 'lucide-react';
import { API_URL as API } from '../../lib/api';

export default function UsersManagement() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const token = localStorage.getItem('dtached_token');

  const loadUsers = () => {
    let url = `${API}/admin/users`;
    const params: string[] = [];
    if (roleFilter) params.push(`role=${roleFilter}`);
    if (searchQuery.trim()) params.push(`search=${encodeURIComponent(searchQuery.trim())}`);
    if (params.length) url += '?' + params.join('&');

    fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : [])
      .then(setUsers)
      .catch(() => setUsers([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadUsers(); }, [token]);

  const toggleActive = async (userId: number, isActive: boolean) => {
    await fetch(`${API}/admin/users/${userId}/${isActive ? 'deactivate' : 'activate'}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    });
    loadUsers();
  };

  const roleColor = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'text-red-400 bg-red-500/10';
      case 'STAFF': return 'text-blue-400 bg-blue-500/10';
      case 'COACH': return 'text-yellow-500 bg-yellow-500/10';
      case 'TEAM_MANAGER': return 'text-orange-400 bg-orange-500/10';
      case 'PLAYER': return 'text-green-400 bg-green-500/10';
      default: return 'text-zinc-400 bg-zinc-500/10';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="w-6 h-6 border-2 border-yellow-500/20 border-t-yellow-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h3 className="text-lg font-bold text-white italic uppercase tracking-tighter flex items-center gap-2">
          <Users className="w-4 h-4 text-yellow-500" /> User Management
        </h3>
        <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">{users.length} Users</span>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-sm text-white placeholder:text-zinc-600"
          />
        </div>
        <select
          value={roleFilter}
          onChange={e => setRoleFilter(e.target.value)}
          className="bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2 text-sm text-white"
        >
          <option value="">All Roles</option>
          <option value="ADMIN">Admin</option>
          <option value="STAFF">Staff</option>
          <option value="COACH">Coach</option>
          <option value="TEAM_MANAGER">Team Manager</option>
          <option value="PLAYER">Player</option>
        </select>
        <button
          onClick={loadUsers}
          className="flex items-center gap-1 px-4 py-2 bg-yellow-500 text-black font-bold text-xs uppercase rounded-xl hover:bg-yellow-400 transition-all"
        >
          <Search className="w-3 h-3" /> Search
        </button>
      </div>

      {/* Users Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-zinc-800">
              <th className="text-left py-3 px-4 text-[10px] text-zinc-500 uppercase font-bold tracking-widest">User</th>
              <th className="text-left py-3 px-4 text-[10px] text-zinc-500 uppercase font-bold tracking-widest">Role</th>
              <th className="text-left py-3 px-4 text-[10px] text-zinc-500 uppercase font-bold tracking-widest">Email</th>
              <th className="text-left py-3 px-4 text-[10px] text-zinc-500 uppercase font-bold tracking-widest">Status</th>
              <th className="text-right py-3 px-4 text-[10px] text-zinc-500 uppercase font-bold tracking-widest">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u: any) => (
              <tr key={u.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center">
                      <UserCircle className="w-4 h-4 text-zinc-500" />
                    </div>
                    <span className="text-sm font-bold text-white">
                      {u.first_name || u.firstName} {u.last_name || u.lastName}
                    </span>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${roleColor(u.role)}`}>
                    {u.role || 'UNSET'}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <span className="text-xs text-zinc-400">{u.email}</span>
                  {(u.email_confirmed || u.emailConfirmed) && (
                    <CheckCircle className="w-3 h-3 text-green-400 inline ml-1" />
                  )}
                </td>
                <td className="py-3 px-4">
                  <span className={`text-[10px] font-bold uppercase ${
                    (u.is_active !== false && u.isActive !== false)
                      ? 'text-green-400'
                      : 'text-red-400'
                  }`}>
                    {(u.is_active !== false && u.isActive !== false) ? 'Active' : 'Suspended'}
                  </span>
                </td>
                <td className="py-3 px-4 text-right">
                  <button
                    onClick={() => toggleActive(u.id, u.is_active !== false && u.isActive !== false)}
                    className={`px-3 py-1 text-[9px] font-bold uppercase rounded-lg transition-all ${
                      (u.is_active !== false && u.isActive !== false)
                        ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20'
                        : 'bg-green-500/10 text-green-400 hover:bg-green-500/20'
                    }`}
                  >
                    {(u.is_active !== false && u.isActive !== false) ? (
                      <><Ban className="w-3 h-3 inline mr-1" />Suspend</>
                    ) : (
                      <><CheckCircle className="w-3 h-3 inline mr-1" />Activate</>
                    )}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {users.length === 0 && (
        <div className="p-12 text-center bg-zinc-900/30 rounded-3xl border border-zinc-800 border-dashed">
          <Users className="w-10 h-10 text-zinc-800 mx-auto mb-3" />
          <p className="text-zinc-500 font-medium">No users found.</p>
        </div>
      )}
    </div>
  );
}
