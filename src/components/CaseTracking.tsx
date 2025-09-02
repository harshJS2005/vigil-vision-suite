import { useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/enhanced-button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Search, FileText, Clock, User, AlertCircle, CheckCircle, Eye } from 'lucide-react';
import { useSecurityStore } from '@/store/securityStore';
import { Case } from '@/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export const CaseTracking = () => {
  const cases = useSecurityStore((s) => s.cases);
  const updateCaseStatus = useSecurityStore((s) => s.updateCaseStatus);
  const addEvidenceToCase = useSecurityStore((s) => s.addEvidenceToCase);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [detailsCase, setDetailsCase] = useState<Case | null>(null);
  const [evidenceCase, setEvidenceCase] = useState<Case | null>(null);
  const [evidenceInput, setEvidenceInput] = useState('');
  const { toast } = useToast();

  const filteredCases = useMemo(() => cases.filter(case_ => {
    const matchesSearch = case_.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         case_.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         case_.reportedBy.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || case_.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || case_.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  }), [cases, searchQuery, statusFilter, priorityFilter]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'destructive';
      case 'investigating': return 'secondary';
      case 'closed': return 'default';
      default: return 'outline';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'outline';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open': return <AlertCircle className="w-4 h-4" />;
      case 'investigating': return <Clock className="w-4 h-4" />;
      case 'closed': return <CheckCircle className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const handleStatusChange = (caseId: string, newStatus: string) => {
    updateCaseStatus(caseId, newStatus as Case['status']);

    toast({
      title: "Case Updated",
      description: `Case ${caseId} status changed to ${newStatus}.`,
      variant: "default",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header and Filters */}
      <Card className="bg-gradient-card border-border shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Case Tracking System
          </CardTitle>
          <CardDescription>
            Monitor and manage all active cases and investigations
          </CardDescription>
          
          <div className="flex flex-col sm:flex-row gap-4 mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search cases..."
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
              <option value="open">Open</option>
              <option value="investigating">Investigating</option>
              <option value="closed">Closed</option>
            </select>
            
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="all">All Priority</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
            
            <Badge variant="outline">
              {filteredCases.length} cases
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-card border-border shadow-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Cases</p>
                <p className="text-2xl font-bold text-primary">{cases.length}</p>
              </div>
              <FileText className="w-8 h-8 text-primary/60" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-card border-border shadow-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Open Cases</p>
                <p className="text-2xl font-bold text-destructive">
                  {cases.filter(c => c.status === 'open').length}
                </p>
              </div>
              <AlertCircle className="w-8 h-8 text-destructive/60" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-card border-border shadow-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Investigating</p>
                <p className="text-2xl font-bold text-warning">
                  {cases.filter(c => c.status === 'investigating').length}
                </p>
              </div>
              <Clock className="w-8 h-8 text-warning/60" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-card border-border shadow-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Closed</p>
                <p className="text-2xl font-bold text-success">
                  {cases.filter(c => c.status === 'closed').length}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-success/60" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cases List */}
      <div className="space-y-4">
        {filteredCases.map((case_) => (
          <Card key={case_.id} className="bg-gradient-card border-border shadow-card hover:shadow-glow transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold">{case_.title}</h3>
                    <Badge variant={getStatusColor(case_.status)} className="flex items-center gap-1">
                      {getStatusIcon(case_.status)}
                      {case_.status}
                    </Badge>
                    <Badge variant={getPriorityColor(case_.priority)}>
                      {case_.priority} priority
                    </Badge>
                  </div>
                  <p className="text-muted-foreground mb-3">{case_.description}</p>
                </div>
                <Button variant="outline" size="sm" onClick={() => setDetailsCase(case_)}>
                  <Eye className="w-4 h-4 mr-2" />
                  View Details
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Case ID</p>
                  <p className="font-mono font-medium">{case_.id}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Reported By</p>
                  <p className="font-medium flex items-center gap-1">
                    <User className="w-3 h-3" />
                    {case_.reportedBy}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Date Reported</p>
                  <p className="font-medium">{case_.reportedDate}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Assigned Officer</p>
                  <p className="font-medium">{case_.assignedOfficer || 'Unassigned'}</p>
                </div>
              </div>

              {case_.evidence.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm text-muted-foreground mb-2">Evidence:</p>
                  <div className="flex flex-wrap gap-2">
                    {case_.evidence.map((evidence, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {evidence}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-2 mt-4 pt-4 border-t border-border">
                <select
                  value={case_.status}
                  onChange={(e) => handleStatusChange(case_.id, e.target.value)}
                  className="flex h-8 rounded border border-input bg-background px-2 text-xs"
                >
                  <option value="open">Open</option>
                  <option value="investigating">Investigating</option>
                  <option value="closed">Closed</option>
                </select>
                <Button variant="outline" size="sm" onClick={() => { setEvidenceCase(case_); setEvidenceInput(''); }}>
                  Add Evidence
                </Button>
                <Button variant="outline" size="sm" onClick={() => generateReport(case_)}>
                  Generate Report
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredCases.length === 0 && (
        <Card className="bg-gradient-card border-border shadow-card">
          <CardContent className="py-12 text-center">
            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Cases Found</h3>
            <p className="text-muted-foreground">
              {searchQuery || statusFilter !== 'all' || priorityFilter !== 'all' 
                ? 'No cases match your current filters.' 
                : 'No cases have been filed yet.'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
