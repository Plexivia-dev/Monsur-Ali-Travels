import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UserPlus, UserX, Users, Plus, Shield, Search, Mail } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/toast';
import { Spinner } from '@/components/ui/spinner';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { apiClient } from '@/lib/api-client';

const SUB_ROLES = ["Frontdesk", "Lawyer", "Visa_Processor", "Accountant", "Representative", "ClientManager"];

export default function SettingsPage() {
  const [coreTeam, setCoreTeam] = useState({});
  const [loading, setLoading] = useState(true);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [activeSubRole, setActiveSubRole] = useState(null);

  // Fetch core team data
  const fetchCoreTeam = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/api/v1/admin/settings/core-team');
      setCoreTeam(res.data.data || {});
    } catch (error) {
      toast.error('Failed to load core team');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoreTeam();
  }, []);

  const handleOpenAssign = (subRole) => {
    setActiveSubRole(subRole);
    setIsAssignModalOpen(true);
  };

  const handleRemove = async (did, subRole) => {
    if (!window.confirm(`Are you sure you want to remove this user from ${subRole}?`)) return;
    try {
      await apiClient.post('/api/v1/admin/settings/core-team/remove', { did });
      toast.success('Role removed successfully');
      fetchCoreTeam();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to remove role');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 font-display">
            System Settings
          </h1>
          <p className="text-gray-500 mt-1 text-sm md:text-base">
            Manage your organization's settings and core team.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN - CORE TEAM */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="shadow-md border-gray-200 bg-white">
            <CardHeader className="border-b border-gray-100 bg-gray-50/50 pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Shield className="w-5 h-5 text-primary" />
                  Core Team
                </CardTitle>
                <Button variant="outline" size="sm" className="text-xs h-8">
                  <Plus className="w-4 h-4 mr-1" /> Add New Role
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="p-8 flex justify-center"><Spinner className="w-6 h-6 text-primary" /></div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {SUB_ROLES.map((role) => {
                    const user = coreTeam[role];
                    return (
                      <div key={role} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-gray-50 transition-colors">
                        <div>
                          <h3 className="font-semibold text-gray-900">{role.replace('_', ' ')}</h3>
                          <p className="text-xs text-gray-500 mt-0.5">Assigned to this role</p>
                        </div>

                        {user ? (
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-full pl-1 pr-4 py-1 shadow-xs">
                              <Avatar className="w-8 h-8">
                                <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                                  {user.name?.charAt(0).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex flex-col">
                                <span className="text-sm font-medium text-gray-900 leading-tight">{user.name}</span>
                              </div>
                            </div>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              className="text-red-500 hover:bg-red-50 hover:text-red-600 rounded-full"
                              onClick={() => handleRemove(user.did, role)}
                              title="Remove from role"
                            >
                              <UserX className="w-4 h-4" />
                            </Button>
                          </div>
                        ) : (
                          <Button 
                            variant="default" 
                            size="sm"
                            className="bg-primary hover:bg-primary/90 rounded-full px-5 text-white"
                            onClick={() => handleOpenAssign(role)}
                          >
                            <UserPlus className="w-4 h-4 mr-2" /> Assign
                          </Button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* RIGHT COLUMN - FUTURE SETTINGS */}
        <div className="lg:col-span-7 space-y-6">
          <Card className="shadow-md border-gray-200 bg-white">
            <CardHeader className="border-b border-gray-100 bg-gray-50/50">
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="w-5 h-5 text-gray-500" />
                Other Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 text-center">
              <p className="text-gray-500">More organization settings will appear here.</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ASSIGN MODAL */}
      <AssignStaffModal 
        isOpen={isAssignModalOpen} 
        onClose={() => setIsAssignModalOpen(false)}
        subRole={activeSubRole}
        onSuccess={() => {
          setIsAssignModalOpen(false);
          fetchCoreTeam();
        }}
      />
    </div>
  );
}

function AssignStaffModal({ isOpen, onClose, subRole, onSuccess }) {
  const [activeTab, setActiveTab] = useState("list");
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteName, setInviteName] = useState("");
  const [inviteLoading, setInviteLoading] = useState(false);

  useEffect(() => {
    if (isOpen && activeTab === "list") {
      fetchStaffList();
    }
  }, [isOpen, activeTab]);

  const fetchStaffList = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/api/v1/admin/settings/staff-candidates');
      setStaffList(res.data.data || []);
    } catch (error) {
      toast.error('Failed to load staff list');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignExisting = async (did) => {
    try {
      await apiClient.post('/api/v1/admin/settings/core-team/assign', { 
        did, 
        subRole 
      });
      toast.success(`${subRole} assigned successfully!`);
      onSuccess();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to assign role');
    }
  };

  const handleInvite = async (e) => {
    e.preventDefault();
    if (!inviteName || !inviteEmail) return toast.error("Name and Email are required");
    
    try {
      setInviteLoading(true);
      await apiClient.post('/api/v1/admin/settings/core-team/invite', {
        name: inviteName,
        email: inviteEmail,
        subRole
      });
      toast.success(`Invite sent for ${subRole}!`);
      onSuccess();
      setInviteName("");
      setInviteEmail("");
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to send invite');
    } finally {
      setInviteLoading(false);
    }
  };

  const filteredStaff = staffList.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase()) || 
    s.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Assign ${subRole?.replace('_', ' ')}`}
      maxWidth="max-w-xl"
    >
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mt-2">
        <TabsList className="grid w-full grid-cols-2 mb-6 bg-gray-100 p-1 rounded-lg">
          <TabsTrigger value="list" className="rounded-md">Employee List</TabsTrigger>
          <TabsTrigger value="invite" className="rounded-md">Invite New</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input 
              placeholder="Search by name or email..." 
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="bg-gray-50 border border-gray-100 rounded-lg p-2 max-h-[300px] overflow-y-auto">
            {loading ? (
              <div className="flex justify-center p-8"><Spinner className="w-6 h-6 text-primary" /></div>
            ) : filteredStaff.length === 0 ? (
              <p className="text-center text-gray-500 py-8 text-sm">No available staff found. Try inviting someone!</p>
            ) : (
              <div className="space-y-2">
                {filteredStaff.map((staff) => (
                  <div key={staff.did} className="flex items-center justify-between bg-white p-3 rounded-md shadow-xs border border-gray-100">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{staff.name}</p>
                      <p className="text-xs text-gray-500">{staff.email}</p>
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="text-primary border-primary/20 hover:bg-primary/5"
                      onClick={() => handleAssignExisting(staff.did)}
                    >
                      Select
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="invite">
          <form onSubmit={handleInvite} className="space-y-4">
            <div className="space-y-2">
              <Label>Full Name</Label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input 
                  required
                  placeholder="e.g. John Doe" 
                  className="pl-9"
                  value={inviteName}
                  onChange={e => setInviteName(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input 
                  required
                  type="email"
                  placeholder="john@example.com" 
                  className="pl-9"
                  value={inviteEmail}
                  onChange={e => setInviteEmail(e.target.value)}
                />
              </div>
            </div>
            <div className="pt-2">
              <Button type="submit" className="w-full text-white bg-primary" disabled={inviteLoading}>
                {inviteLoading ? <Spinner className="w-4 h-4 mr-2" /> : <UserPlus className="w-4 h-4 mr-2" />}
                Send Invite
              </Button>
            </div>
          </form>
        </TabsContent>
      </Tabs>
    </Modal>
  );
}
