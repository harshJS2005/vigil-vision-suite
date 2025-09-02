import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/enhanced-button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Search, Plus, Edit, Trash2, User, AlertTriangle } from 'lucide-react';
import { mockCriminals } from '@/data/mockData';
import { Criminal } from '@/types';

export const CriminalDatabase = () => {
  const [criminals, setCriminals] = useState<Criminal[]>(mockCriminals);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCriminal, setSelectedCriminal] = useState<Criminal | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const { toast } = useToast();

  const [newCriminal, setNewCriminal] = useState({
    name: '',
    age: '',
    charges: '',
    description: '',
    image: '',
    status: 'active' as const
  });

  const filteredCriminals = criminals.filter(criminal =>
    criminal.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    criminal.identificationNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    criminal.charges.some(charge => charge.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleAddCriminal = () => {
    if (!newCriminal.name || !newCriminal.age) {
      toast({
        title: "Missing Information",
        description: "Please fill in required fields.",
        variant: "destructive",
      });
      return;
    }

    const criminal: Criminal = {
      id: (criminals.length + 1).toString(),
      name: newCriminal.name,
      age: parseInt(newCriminal.age),
      charges: newCriminal.charges.split(',').map(c => c.trim()).filter(Boolean),
      lastSeen: new Date().toISOString().split('T')[0],
      status: newCriminal.status,
      image: newCriminal.image || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face',
      description: newCriminal.description,
      identificationNumber: `CR${String(criminals.length + 1).padStart(3, '0')}`
    };

    setCriminals([...criminals, criminal]);
    setIsAddDialogOpen(false);
    setNewCriminal({
      name: '',
      age: '',
      charges: '',
      description: '',
      image: '',
      status: 'active'
    });

    toast({
      title: "Criminal Added",
      description: `${criminal.name} has been added to the database.`,
      variant: "default",
    });
  };

  const handleDeleteCriminal = (id: string) => {
    setCriminals(criminals.filter(c => c.id !== id));
    toast({
      title: "Criminal Removed",
      description: "Record has been deleted from the database.",
      variant: "default",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'destructive';
      case 'captured': return 'default';
      case 'deceased': return 'secondary';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <Card className="bg-gradient-card border-border shadow-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5 text-primary" />
                Criminal Database
              </CardTitle>
              <CardDescription>
                Manage criminal records and suspect information
              </CardDescription>
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="hero">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Criminal
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Add New Criminal Record</DialogTitle>
                  <DialogDescription>
                    Enter the criminal's information to add to database
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Name *</Label>
                    <Input
                      id="name"
                      value={newCriminal.name}
                      onChange={(e) => setNewCriminal({...newCriminal, name: e.target.value})}
                      placeholder="Full name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="age">Age *</Label>
                    <Input
                      id="age"
                      type="number"
                      value={newCriminal.age}
                      onChange={(e) => setNewCriminal({...newCriminal, age: e.target.value})}
                      placeholder="Age"
                    />
                  </div>
                  <div>
                    <Label htmlFor="charges">Charges</Label>
                    <Input
                      id="charges"
                      value={newCriminal.charges}
                      onChange={(e) => setNewCriminal({...newCriminal, charges: e.target.value})}
                      placeholder="Robbery, Assault (comma separated)"
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={newCriminal.description}
                      onChange={(e) => setNewCriminal({...newCriminal, description: e.target.value})}
                      placeholder="Physical description and notes"
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label htmlFor="status">Status</Label>
                    <select
                      id="status"
                      value={newCriminal.status}
                      onChange={(e) => setNewCriminal({...newCriminal, status: e.target.value as any})}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option value="active">Active</option>
                      <option value="captured">Captured</option>
                      <option value="deceased">Deceased</option>
                    </select>
                  </div>
                  <Button variant="hero" onClick={handleAddCriminal} className="w-full">
                    Add to Database
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          
          <div className="flex items-center gap-4 mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search by name, ID, or charges..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Badge variant="outline">
              {filteredCriminals.length} records
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Criminal Records Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCriminals.map((criminal) => (
          <Card key={criminal.id} className="bg-gradient-card border-border shadow-card hover:shadow-glow transition-all duration-300">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={criminal.image}
                    alt={criminal.name}
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                  <div>
                    <h3 className="font-semibold">{criminal.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      ID: {criminal.identificationNumber}
                    </p>
                  </div>
                </div>
                <Badge variant={getStatusColor(criminal.status)}>
                  {criminal.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-muted-foreground">Age</p>
                  <p className="font-medium">{criminal.age}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Last Seen</p>
                  <p className="font-medium">{criminal.lastSeen}</p>
                </div>
              </div>

              {criminal.charges.length > 0 && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Charges</p>
                  <div className="flex flex-wrap gap-1">
                    {criminal.charges.slice(0, 2).map((charge, index) => (
                      <Badge key={index} variant="destructive" className="text-xs">
                        {charge}
                      </Badge>
                    ))}
                    {criminal.charges.length > 2 && (
                      <Badge variant="outline" className="text-xs">
                        +{criminal.charges.length - 2}
                      </Badge>
                    )}
                  </div>
                </div>
              )}

              {criminal.description && (
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {criminal.description}
                </p>
              )}

              <div className="flex gap-2 pt-2">
                <Button variant="outline" size="sm" className="flex-1">
                  <Edit className="w-3 h-3 mr-1" />
                  Edit
                </Button>
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={() => handleDeleteCriminal(criminal.id)}
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredCriminals.length === 0 && (
        <Card className="bg-gradient-card border-border shadow-card">
          <CardContent className="py-12 text-center">
            <User className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Records Found</h3>
            <p className="text-muted-foreground">
              {searchQuery ? 'No criminals match your search criteria.' : 'No criminal records in database.'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};