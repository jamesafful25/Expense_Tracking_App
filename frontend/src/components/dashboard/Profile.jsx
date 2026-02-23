import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { userApi } from '../../api';
import { getInitials } from '../../utils';
import Toast from '../ui/Toast';
import { useToast } from '../../hooks';

const CURRENCIES = ['USD', 'EUR', 'GBP', 'GHS', 'NGN', 'KES', 'ZAR', 'JPY', 'CAD', 'AUD'];

const Profile = () => {
  const { user, updateUser } = useAuth();
  const { toasts, success, error: toastError } = useToast();
  const [profileForm, setProfileForm] = useState({ name: user?.name || '', currency: user?.currency || 'USD' });
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [avatarFile, setAvatarFile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);

  const handleProfile = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    try {
      const fd = new FormData();
      fd.append('name', profileForm.name);
      fd.append('currency', profileForm.currency);
      if (avatarFile) fd.append('avatar', avatarFile);
      const data = await userApi.updateProfile(fd);
      updateUser(data.user || data);
      success('Profile updated');
    } catch (err) {
      toastError(err.message || 'Failed to update profile');
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePassword = async (e) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      toastError('Passwords do not match');
      return;
    }
    setPwLoading(true);
    try {
      await userApi.changePassword({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
      success('Password changed successfully');
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toastError(err.message || 'Failed to change password');
    } finally {
      setPwLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-slide-up max-w-2xl">
      <Toast toasts={toasts} />

      <div>
        <h1 className="text-2xl font-display font-bold text-primary-950">Profile</h1>
        <p className="text-gray-500 text-sm mt-0.5">Manage your account settings</p>
      </div>

      {/* Profile Card */}
      <div className="card">
        <form onSubmit={handleProfile} className="space-y-5">
          {/* Avatar */}
          <div className="flex items-center gap-5">
            <label className="cursor-pointer group relative">
              <div className="w-20 h-20 rounded-2xl overflow-hidden bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center shadow-lg">
                {user?.avatar ? (
                  <img src={user.avatar} alt="avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-white text-2xl font-bold">{getInitials(user?.name || 'U')}</span>
                )}
              </div>
              <div className="absolute inset-0 rounded-2xl bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-white text-xs font-medium">Change</span>
              </div>
              <input type="file" accept="image/*" className="hidden" onChange={(e) => setAvatarFile(e.target.files[0])} />
            </label>
            <div>
              <p className="font-semibold text-gray-800 text-lg">{user?.name}</p>
              <p className="text-gray-500 text-sm">{user?.email}</p>
              <span className="badge bg-primary-100 text-primary-700 capitalize mt-1">{user?.role}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Full Name</label>
              <input className="input" value={profileForm.name} onChange={(e) => setProfileForm((f) => ({ ...f, name: e.target.value }))} required />
            </div>
            <div>
              <label className="label">Default Currency</label>
              <select className="input" value={profileForm.currency} onChange={(e) => setProfileForm((f) => ({ ...f, currency: e.target.value }))}>
                {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <button type="submit" disabled={profileLoading} className="btn-primary">
            {profileLoading ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>

      {/* Change Password */}
      {!user?.googleId && (
        <div className="card">
          <h3 className="font-display font-semibold text-primary-950 mb-4">Change Password</h3>
          <form onSubmit={handlePassword} className="space-y-4">
            <div>
              <label className="label">Current Password</label>
              <input className="input" type="password" value={pwForm.currentPassword} onChange={(e) => setPwForm((f) => ({ ...f, currentPassword: e.target.value }))} required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">New Password</label>
                <input className="input" type="password" value={pwForm.newPassword} onChange={(e) => setPwForm((f) => ({ ...f, newPassword: e.target.value }))} required minLength={6} />
              </div>
              <div>
                <label className="label">Confirm New Password</label>
                <input className="input" type="password" value={pwForm.confirmPassword} onChange={(e) => setPwForm((f) => ({ ...f, confirmPassword: e.target.value }))} required />
              </div>
            </div>
            <button type="submit" disabled={pwLoading} className="btn-primary">
              {pwLoading ? 'Changing...' : 'Change Password'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default Profile;