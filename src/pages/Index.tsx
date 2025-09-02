import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/enhanced-button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Shield, Eye, Camera, FileText, Lock, Zap } from 'lucide-react';
import heroImage from '@/assets/hero-security.jpg';

const Index = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [password, setPassword] = useState('');
  const [caseForm, setCaseForm] = useState({
    title: '',
    description: '',
    reportedBy: '',
    priority: 'medium'
  });

  const handleDashboardAccess = () => {
    if (password === 'admin123') {
      navigate('/dashboard');
    } else {
      toast({
        title: "Access Denied",
        description: "Invalid password. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCaseSubmission = () => {
    if (!caseForm.title || !caseForm.description || !caseForm.reportedBy) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Case Filed Successfully",
      description: "Your case has been submitted to the tracking system.",
      variant: "default",
    });

    setCaseForm({
      title: '',
      description: '',
      reportedBy: '',
      priority: 'medium'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-hero">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="w-8 h-8 text-primary" />
              <h1 className="text-2xl font-bold text-foreground">SecureAI System</h1>
            </div>
            <div className="flex items-center gap-4">
              <Input
                type="password"
                placeholder="Dashboard Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-40"
              />
              <Button variant="hero" onClick={handleDashboardAccess}>
                <Lock className="w-4 h-4" />
                Access Dashboard
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src={heroImage} 
            alt="AI Security System" 
            className="w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-hero/80"></div>
        </div>
        
        <div className="relative container mx-auto px-4 text-center">
          <h2 className="text-5xl font-bold text-foreground mb-6">
            Advanced AI Security
            <span className="block mt-2 bg-gradient-primary bg-clip-text text-transparent">
              Recognition System
            </span>
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Powered by cutting-edge AI technology for face recognition, number plate detection, 
            and comprehensive security management.
          </p>
          <div className="flex justify-center gap-4">
            <Button variant="hero" size="xl">
              <Zap className="w-5 h-5" />
              Get Started
            </Button>
            <Button variant="outline" size="xl">
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <h3 className="text-3xl font-bold text-center text-foreground mb-12">
            Powerful Security Features
          </h3>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="bg-gradient-card border-border shadow-card hover:shadow-glow transition-all duration-300">
              <CardHeader>
                <Eye className="w-12 h-12 text-primary mb-4" />
                <CardTitle>Face Recognition</CardTitle>
                <CardDescription>
                  Advanced AI-powered facial recognition with real-time criminal database matching
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-gradient-card border-border shadow-card hover:shadow-glow transition-all duration-300">
              <CardHeader>
                <Camera className="w-12 h-12 text-primary mb-4" />
                <CardTitle>Number Plate Detection</CardTitle>
                <CardDescription>
                  Automatic license plate recognition for vehicle tracking and identification
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-gradient-card border-border shadow-card hover:shadow-glow transition-all duration-300">
              <CardHeader>
                <FileText className="w-12 h-12 text-primary mb-4" />
                <CardTitle>Case Management</CardTitle>
                <CardDescription>
                  Comprehensive case tracking system with evidence management and reporting
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Case Filing Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <Card className="bg-gradient-card border-border shadow-card">
              <CardHeader>
                <CardTitle className="text-2xl text-center">File a New Case</CardTitle>
                <CardDescription className="text-center">
                  Submit a case directly to our tracking system
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="caseTitle">Case Title *</Label>
                  <Input
                    id="caseTitle"
                    value={caseForm.title}
                    onChange={(e) => setCaseForm({...caseForm, title: e.target.value})}
                    placeholder="Enter case title"
                  />
                </div>
                <div>
                  <Label htmlFor="caseDescription">Description *</Label>
                  <Textarea
                    id="caseDescription"
                    value={caseForm.description}
                    onChange={(e) => setCaseForm({...caseForm, description: e.target.value})}
                    placeholder="Describe the incident in detail"
                    rows={4}
                  />
                </div>
                <div>
                  <Label htmlFor="reportedBy">Reported By *</Label>
                  <Input
                    id="reportedBy"
                    value={caseForm.reportedBy}
                    onChange={(e) => setCaseForm({...caseForm, reportedBy: e.target.value})}
                    placeholder="Your name or organization"
                  />
                </div>
                <div>
                  <Label htmlFor="priority">Priority Level</Label>
                  <select
                    id="priority"
                    value={caseForm.priority}
                    onChange={(e) => setCaseForm({...caseForm, priority: e.target.value})}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
                <Button 
                  variant="hero" 
                  size="lg" 
                  className="w-full" 
                  onClick={handleCaseSubmission}
                >
                  <FileText className="w-4 h-4" />
                  Submit Case
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-muted-foreground">
            © 2024 SecureAI System. Advanced security solutions powered by AI.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;