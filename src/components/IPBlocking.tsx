import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/enhanced-button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Search, Ban, Plus, Trash2, Shield, AlertTriangle, CheckCircle } from 'lucide-react';
import { mockBlockedIPs } from '@/data/mockData';
import { BlockedIP } from '@/types';

export const IPBlocking = () => {
  const [blockedIPs, setBlockedIPs] = useState<BlockedIP[]>(mockBlockedIPs);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const { toast } = useToast();

  const [newBlock, setNewBlock] = useState({
    ipAddress: '',
    reason: '',
    blockedBy: 'Admin'
  });

  const filteredIPs = blockedIPs.filter(ip => {
    const matchesSearch = ip.ipAddress.includes(searchQuery) ||
                         ip.reason.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || ip.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const validateIP = (ip: string) => {
    const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    return ipRegex.test(ip);
  };

  const handleBlockIP = () => {
    if (!newBlock.ipAddress || !newBlock.reason) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    if (!validateIP(newBlock.ipAddress)) {
      toast({
        title: "Invalid IP Address",
        description: "Please enter a valid IPv4 address.",
        variant: "destructive",
      });
      return;
    }

    // Check if IP is already blocked
    if (blockedIPs.some(ip => ip.ipAddress === newBlock.ipAddress && ip.status === 'active')) {
      toast({
        title: "IP Already Blocked",
        description: "This IP address is already in the blocked list.",
        variant: "destructive",
      });
      return;
    }

    const blockedIP: BlockedIP = {
      id: (blockedIPs.length + 1).toString(),
      ipAddress: newBlock.ipAddress,
      reason: newBlock.reason,
      blockedDate: new Date().toISOString().split('T')[0],
      blockedBy: newBlock.blockedBy,
      status: 'active'
    };

    setBlockedIPs([blockedIP, ...blockedIPs]);
    setIsAddDialogOpen(false);
    setNewBlock({
      ipAddress: '',
      reason: '',
      blockedBy: 'Admin'
    });

    toast({
      title: "IP Blocked Successfully",
      description: `${blockedIP.ipAddress} has been added to the block list.`,
      variant: "default",
    });
  };

  const handleUnblockIP = (id: string) => {
    setBlockedIPs(blockedIPs.map(ip => 
      ip.id === id 
        ? { ...ip, status: 'expired' as const }
        : ip
    ));

    toast({
      title: "IP Unblocked",
      description: "IP address has been removed from active blocks.",
      variant: "default",
    });
  };

  const handleDeleteIP = (id: string) => {
    setBlockedIPs(blockedIPs.filter(ip => ip.id !== id));
    toast({
      title: "Entry Deleted",
      description: "IP block record has been permanently removed.",
      variant: "default",
    });
  };

  const getStatusColor = (status: string) => {
    return status === 'active' ? 'destructive' : 'secondary';
  };

  const getStatusIcon = (status: string) => {
    return status === 'active' ? <Ban className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />;
  };

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <Card className="bg-gradient-card border-border shadow-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                IP Blocking System
              </CardTitle>
              <CardDescription>
                Monitor and manage blocked IP addresses and security threats
              </CardDescription>
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="hero">
                  <Plus className="w-4 h-4 mr-2" />
                  Block IP
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Block New IP Address</DialogTitle>
                  <DialogDescription>
                    Add an IP address to the security block list
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="ipAddress">IP Address *</Label>
                    <Input
                      id="ipAddress"
                      value={newBlock.ipAddress}
                      onChange={(e) => setNewBlock({...newBlock, ipAddress: e.target.value})}
                      placeholder="192.168.1.100"
                    />
                  </div>
                  <div>
                    <Label htmlFor="reason">Reason for Blocking *</Label>
                    <Input
                      id="reason"
                      value={newBlock.reason}
                      onChange={(e) => setNewBlock({...newBlock, reason: e.target.value})}
                      placeholder="e.g., Suspicious activity, DDoS attack"
                    />
                  </div>
                  <div>
                    <Label htmlFor="blockedBy">Blocked By</Label>
                    <Input
                      id="blockedBy"
                      value={newBlock.blockedBy}
                      onChange={(e) => setNewBlock({...newBlock, blockedBy: e.target.value})}
                      placeholder="Administrator name"
                    />
                  </div>
                  <Button variant="hero" onClick={handleBlockIP} className="w-full">
                    <Ban className="w-4 h-4 mr-2" />
                    Block IP Address
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search IP addresses or reasons..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="all">All Status</option>
              <option value="active">Active Blocks</option>
              <option value="expired">Expired Blocks</option>
            </select>
            
            <Badge variant="outline">
              {filteredIPs.length} entries
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-card border-border shadow-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Blocked</p>
                <p className="text-2xl font-bold text-primary">{blockedIPs.length}</p>
              </div>
              <Ban className="w-8 h-8 text-primary/60" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-card border-border shadow-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Blocks</p>
                <p className="text-2xl font-bold text-destructive">
                  {blockedIPs.filter(ip => ip.status === 'active').length}
                </p>
              </div>
              <AlertTriangle className="w-8 h-8 text-destructive/60" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-card border-border shadow-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Expired Blocks</p>
                <p className="text-2xl font-bold text-muted-foreground">
                  {blockedIPs.filter(ip => ip.status === 'expired').length}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-muted-foreground/60" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Blocked IPs List */}
      <Card className="bg-gradient-card border-border shadow-card">
        <CardHeader>
          <CardTitle>Blocked IP Addresses</CardTitle>
          <CardDescription>
            List of all blocked IP addresses and their details
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="space-y-1">
            {filteredIPs.map((ip, index) => (
              <div key={ip.id} className={`p-4 border-b border-border last:border-b-0 ${
                index % 2 === 0 ? 'bg-muted/30' : 'bg-transparent'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(ip.status)}
                      <span className="font-mono text-lg font-semibold">
                        {ip.ipAddress}
                      </span>
                    </div>
                    <Badge variant={getStatusColor(ip.status)}>
                      {ip.status}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {ip.status === 'active' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleUnblockIP(ip.id)}
                      >
                        Unblock
                      </Button>
                    )}
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteIP(ip.id)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
                
                <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Reason</p>
                    <p className="font-medium">{ip.reason}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Blocked Date</p>
                    <p className="font-medium">{ip.blockedDate}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Blocked By</p>
                    <p className="font-medium">{ip.blockedBy}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {filteredIPs.length === 0 && (
        <Card className="bg-gradient-card border-border shadow-card">
          <CardContent className="py-12 text-center">
            <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Blocked IPs</h3>
            <p className="text-muted-foreground">
              {searchQuery || statusFilter !== 'all' 
                ? 'No IP addresses match your current filters.' 
                : 'No IP addresses have been blocked yet.'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};