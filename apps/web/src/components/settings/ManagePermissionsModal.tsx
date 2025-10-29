'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Users, Trash2, Plus, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ManagePermissionsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ManagePermissionsModal({ isOpen, onClose }: ManagePermissionsModalProps) {
  const [mounted, setMounted] = useState(false);
  const [showAddUser, setShowAddUser] = useState(false);
  const [newUserFirstName, setNewUserFirstName] = useState('');
  const [newUserLastName, setNewUserLastName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState('viewer');
  const [members, setMembers] = useState([
    { id: '1', name: 'Sarah Johnson', email: 'sarah@example.com', role: 'admin' },
    { id: '2', name: 'Mike Chen', email: 'mike@example.com', role: 'editor' },
    { id: '3', name: 'Emily Davis', email: 'emily@example.com', role: 'viewer' },
  ]);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted) return null;

  const handleAddUser = () => {
    setShowAddUser(true);
  };

  const handleSubmitAddUser = async () => {
    if (!newUserFirstName || !newUserLastName || !newUserEmail) {
      alert('Please enter first name, last name, and email address');
      return;
    }
    const newMember = {
      id: String(members.length + 1),
      name: `${newUserFirstName} ${newUserLastName}`,
      email: newUserEmail,
      role: newUserRole,
    };
    setMembers([...members, newMember]);
    setShowAddUser(false);
    setNewUserFirstName('');
    setNewUserLastName('');
    setNewUserEmail('');
    setNewUserRole('viewer');
    alert('User added successfully!');
  };

  const handleDeleteUser = (id: string) => {
    setMembers(members.filter(m => m.id !== id));
    alert('User removed successfully!');
  };

  const handleRoleChange = (id: string, role: string) => {
    setMembers(members.map(m => m.id === id ? { ...m, role } : m));
    alert(`Role updated to ${role}!`);
  };

  const modalContent = (
    <div 
      className="fixed inset-0 flex items-center justify-center p-4"
      style={{ zIndex: 99999 }}
    >
      {/* Backdrop */}
      <div 
        className="fixed inset-0 modal-backdrop"
      />
      
      {/* Modal */}
      <div
        className="relative w-full max-w-2xl max-h-[90vh] rounded-lg border shadow-2xl overflow-hidden modal-bg flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            <h2 className="text-xl font-bold">Manage Permissions</h2>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm text-muted-foreground">{members.length} team members</p>
            <Button onClick={handleAddUser} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add User
            </Button>
          </div>

          {showAddUser && (
            <div className="mb-6 p-4 bg-muted rounded-lg border-2 border-primary">
              <h4 className="font-semibold mb-3">Add New User</h4>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm text-muted-foreground mb-1">First Name</label>
                    <input
                      type="text"
                      value={newUserFirstName}
                      onChange={(e) => setNewUserFirstName(e.target.value)}
                      placeholder="John"
                      className="w-full px-4 py-2 rounded-lg border border-input bg-background"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-muted-foreground mb-1">Last Name</label>
                    <input
                      type="text"
                      value={newUserLastName}
                      onChange={(e) => setNewUserLastName(e.target.value)}
                      placeholder="Doe"
                      className="w-full px-4 py-2 rounded-lg border border-input bg-background"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-muted-foreground mb-1">Email</label>
                  <input
                    type="email"
                    value={newUserEmail}
                    onChange={(e) => setNewUserEmail(e.target.value)}
                    placeholder="user@example.com"
                    className="w-full px-4 py-2 rounded-lg border border-input bg-background"
                  />
                </div>
                <div>
                  <label className="block text-sm text-muted-foreground mb-1">Role</label>
                  <select
                    value={newUserRole}
                    onChange={(e) => setNewUserRole(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-input bg-background"
                  >
                    <option value="viewer">Viewer</option>
                    <option value="editor">Editor</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleSubmitAddUser} size="sm">Add</Button>
                  <Button onClick={() => setShowAddUser(false)} variant="outline" size="sm">Cancel</Button>
                </div>
              </div>
            </div>
          )}

          {/* Team Members */}
          <div className="space-y-3 mb-6">
            {members.map((member) => (
              <div key={member.id} className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div>
                  <p className="font-medium">{member.name}</p>
                  <p className="text-sm text-muted-foreground">{member.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={member.role}
                    onChange={(e) => handleRoleChange(member.id, e.target.value)}
                    className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm bg-background"
                  >
                    <option value="admin">Admin</option>
                    <option value="editor">Editor</option>
                    <option value="viewer">Viewer</option>
                  </select>
                  <button
                    onClick={() => handleDeleteUser(member.id)}
                    className="p-2 text-danger hover:bg-danger/10 rounded-lg transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Role Permissions */}
          <div className="bg-blue-50 rounded-lg p-4">
            <p className="font-semibold text-blue-900 mb-2">Role Permissions</p>
            <div className="text-sm text-blue-900 space-y-1">
              <p><span className="font-medium">Admin:</span> Full access to all features</p>
              <p><span className="font-medium">Editor:</span> Can create and edit content</p>
              <p><span className="font-medium">Contributor:</span> Can create content for review</p>
              <p><span className="font-medium">Viewer:</span> Read-only access</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t bg-muted">
          <Button onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}

