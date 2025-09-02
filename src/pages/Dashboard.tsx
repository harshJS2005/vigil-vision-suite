import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/enhanced-button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { FaceRecognition } from '@/components/FaceRecognition';
import { NumberPlateRecognition } from '@/components/NumberPlateRecognition';
import { CriminalDatabase } from '@/components/CriminalDatabase';
import { CaseTracking } from '@/components/CaseTracking';
import { IPBlocking } from '@/components/IPBlocking';
import { Shield, Eye, Camera, FileText, Ban, BarChart3, Users, Activity } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { mockCases, mockCriminals, mockBlockedIPs } from '@/data/mockData';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [liveOpen, setLiveOpen] = useState(false);
  const [events, setEvents] = useState<{ id: number; type: string; message: string; ts: string }[]>([]);

  useEffect(() => {
    if (!liveOpen) return;
    let id = 0;
    const types = ['success', 'warning', 'primary'];
    const pool = [
      'Camera #2 detected plate',
      'Face match confidence 92% for CR002',
      'New case filed via public portal',
      'Firewall blocked suspicious IP',
      'Patrol car 7 check-in',
    ];
    const t = setInterval(() => {
      const msg = pool[Math.floor(Math.random() * pool.length)];
      const type = types[Math.floor(Math.random() * types.length)];
      setEvents((prev) => [{ id: ++id, type, message: msg, ts: new Date().toLocaleTimeString() }, ...prev].slice(0, 50));
    }, 2000);
    return () => clearInterval(t);
  }, [liveOpen]);

  const stats = {
    totalCriminals: mockCriminals.length,
    activeCases: mockCases.filter(c => c.status !== 'closed').length,
    blockedIPs: mockBlockedIPs.filter(ip => ip.status === 'active').length,
    recognitionMatches: 47
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="w-8 h-8 text-primary" />
              <div>
                <h1 className="text-2xl font-bold text-foreground">Security Dashboard</h1>
                <p className="text-sm text-muted-foreground">AI-Powered Security Management</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                System Online
              </Badge>
              <Button variant="outline" size="sm" onClick={() => setLiveOpen(true)}>
                <Activity className="w-4 h-4" />
                Live Monitor
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6 bg-card/50">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="face-recognition" className="flex items-center gap-2">
              <Eye className="w-4 h-4" />
              Face Recognition
            </TabsTrigger>
            <TabsTrigger value="plate-recognition" className="flex items-center gap-2">
              <Camera className="w-4 h-4" />
              Number Plates
            </TabsTrigger>
            <TabsTrigger value="criminal-db" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Criminal DB
            </TabsTrigger>
            <TabsTrigger value="case-tracking" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Case Tracking
            </TabsTrigger>
            <TabsTrigger value="ip-blocking" className="flex items-center gap-2">
              <Ban className="w-4 h-4" />
              IP Blocking
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-gradient-card border-border shadow-card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Criminals</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-primary">{stats.totalCriminals}</div>
                  <p className="text-xs text-muted-foreground">In database</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-card border-border shadow-card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Cases</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-warning">{stats.activeCases}</div>
                  <p className="text-xs text-muted-foreground">Under investigation</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-card border-border shadow-card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Blocked IPs</CardTitle>
                  <Ban className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-destructive">{stats.blockedIPs}</div>
                  <p className="text-xs text-muted-foreground">Security threats</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-card border-border shadow-card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Recognition Matches</CardTitle>
                  <Eye className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-success">{stats.recognitionMatches}</div>
                  <p className="text-xs text-muted-foreground">This month</p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card className="bg-gradient-card border-border shadow-card">
              <CardHeader>
                <CardTitle>Recent Security Activity</CardTitle>
                <CardDescription>Latest system events and recognitions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-success/10 border border-success/20">
                    <div className="flex items-center gap-3">
                      <Eye className="w-5 h-5 text-success" />
                      <div>
                        <p className="font-medium text-success">Face Recognition Match</p>
                        <p className="text-sm text-muted-foreground">Criminal ID: CR002 detected at Main Street</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-success border-success/50">
                      2 min ago
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg bg-warning/10 border border-warning/20">
                    <div className="flex items-center gap-3">
                      <Camera className="w-5 h-5 text-warning" />
                      <div>
                        <p className="font-medium text-warning">License Plate Detected</p>
                        <p className="text-sm text-muted-foreground">Plate ABC-123 flagged for investigation</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-warning border-warning/50">
                      5 min ago
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg bg-primary/10 border border-primary/20">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-primary" />
                      <div>
                        <p className="font-medium text-primary">New Case Filed</p>
                        <p className="text-sm text-muted-foreground">Case CASE004 added to tracking system</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-primary border-primary/50">
                      10 min ago
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="face-recognition">
            <FaceRecognition />
          </TabsContent>

          <TabsContent value="plate-recognition">
            <NumberPlateRecognition />
          </TabsContent>

          <TabsContent value="criminal-db">
            <CriminalDatabase />
          </TabsContent>

          <TabsContent value="case-tracking">
            <CaseTracking />
          </TabsContent>

          <TabsContent value="ip-blocking">
            <IPBlocking />
          </TabsContent>
        </Tabs>
      </div>

      <Sheet open={liveOpen} onOpenChange={setLiveOpen}>
        <SheetContent side="right" className="w-full sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Live Monitor</SheetTitle>
          </SheetHeader>
          <div className="mt-4 space-y-2 max-h-[80vh] overflow-y-auto">
            {events.length === 0 ? (
              <p className="text-sm text-muted-foreground">Waiting for live events…</p>
            ) : (
              events.map((e) => (
                <div key={e.id} className={`flex items-center justify-between rounded border p-2 ${e.type === 'success' ? 'bg-success/10 border-success/20' : e.type === 'warning' ? 'bg-warning/10 border-warning/20' : 'bg-primary/10 border-primary/20'}`}>
                  <span className="text-sm">{e.message}</span>
                  <span className="text-xs text-muted-foreground">{e.ts}</span>
                </div>
              ))
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default Dashboard;
