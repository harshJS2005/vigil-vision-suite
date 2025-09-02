import { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/enhanced-button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Upload, Camera, Search, AlertTriangle, CheckCircle, UserPlus } from 'lucide-react';
import { useSecurityStore } from '@/store/securityStore';
import { computeAHash, loadImage, hammingDistance, aHashFromImageData } from '@/lib/imageUtils';

export const FaceRecognition = () => {
  const criminals = useSecurityStore((s) => s.criminals);
  const addCriminal = useSecurityStore((s) => s.addCriminal);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<{ match: number | null; confidence: number; hash: string | null } | null>(null);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [newCriminal, setNewCriminal] = useState({
    name: '',
    age: '',
    charges: '',
    description: '',
    status: 'active' as const,
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImage(e.target?.result as string);
        setResult(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProcessImage = async () => {
    if (!uploadedImage) {
      toast({ title: 'No Image', description: 'Please upload an image first.', variant: 'destructive' });
      return;
    }

    try {
      setIsProcessing(true);
      // Compute aHash for uploaded image
      const uploadedImgEl = await loadImage(uploadedImage);
      const uploadedHash = aHashFromImageData(uploadedImgEl);

      // Compute hashes for each criminal image and compare
      let bestIndex: number | null = null;
      let bestDistance = Infinity;
      for (let i = 0; i < criminals.length; i++) {
        try {
          const h = await computeAHash(criminals[i].image);
          const d = hammingDistance(uploadedHash, h);
          if (d < bestDistance) {
            bestDistance = d;
            bestIndex = i;
          }
        } catch (e) {
          // Ignore images that fail to load
        }
      }

      // Convert distance to confidence (0-100)
      const confidence = Math.max(0, Math.min(100, Math.round(100 - bestDistance * 2.5)));
      const isMatch = bestIndex !== null && bestDistance <= 10 && confidence >= 70;

      setResult({ match: isMatch ? bestIndex : null, confidence, hash: uploadedHash });

      if (isMatch) {
        toast({ title: 'Match Found', description: `Identified with ${confidence}% confidence.`, variant: 'default' });
      } else {
        toast({ title: 'No Match', description: 'No matching criminal found in database.', variant: 'destructive' });
      }
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to process image.', variant: 'destructive' });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAddToDatabase = () => {
    if (!uploadedImage) return;
    if (!newCriminal.name || !newCriminal.age) {
      toast({ title: 'Missing Fields', description: 'Name and age are required.', variant: 'destructive' });
      return;
    }
    const record = addCriminal({
      name: newCriminal.name,
      age: parseInt(newCriminal.age),
      charges: newCriminal.charges ? newCriminal.charges.split(',').map(c => c.trim()).filter(Boolean) : [],
      description: newCriminal.description,
      image: uploadedImage,
      status: newCriminal.status,
    });
    setAddDialogOpen(false);
    setNewCriminal({ name: '', age: '', charges: '', description: '', status: 'active' });
    toast({ title: 'Added to Database', description: `${record.name} has been added.`, variant: 'default' });
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-card border-border shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-primary" />
            Face Recognition System
          </CardTitle>
          <CardDescription>Upload an image to identify individuals using AI similarity matching</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Upload */}
            <div className="space-y-4">
              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                {uploadedImage ? (
                  <div className="space-y-4">
                    <img src={uploadedImage} alt="Uploaded" className="max-w-full h-48 object-contain mx-auto rounded-lg" />
                    <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Different Image
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Upload className="w-12 h-12 text-muted-foreground mx-auto" />
                    <div>
                      <p className="text-lg font-medium">Upload Image for Recognition</p>
                      <p className="text-sm text-muted-foreground">Supports JPG, PNG files up to 10MB</p>
                    </div>
                    <Button variant="hero" onClick={() => fileInputRef.current?.click()}>
                      <Upload className="w-4 h-4 mr-2" />
                      Choose Image
                    </Button>
                  </div>
                )}
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
              </div>

              <Button
                variant="glow"
                size="lg"
                className="w-full"
                onClick={handleProcessImage}
                disabled={!uploadedImage || isProcessing}
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-b-transparent mr-2" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4 mr-2" />
                    Run Face Recognition
                  </>
                )}
              </Button>
            </div>

            {/* Results */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Recognition Results</h3>

              {result ? (
                <Card className="bg-background border-border">
                  <CardContent className="p-4">
                    {result.match !== null ? (
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 text-success">
                          <CheckCircle className="w-5 h-5" />
                          <span className="font-medium">Match Found</span>
                        </div>
                        <div className="flex gap-4">
                          <img src={criminals[result.match].image} alt={criminals[result.match].name} className="w-16 h-16 rounded-lg object-cover" />
                          <div className="flex-1">
                            <h4 className="font-semibold">{criminals[result.match].name}</h4>
                            <p className="text-sm text-muted-foreground">ID: {criminals[result.match].identificationNumber}</p>
                            <p className="text-sm text-muted-foreground">Status: {criminals[result.match].status}</p>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span>Confidence Level</span>
                            <span className="font-medium">{result.confidence}%</span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2">
                            <div className="bg-success h-2 rounded-full transition-all duration-300" style={{ width: `${result.confidence}%` }} />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4 text-center">
                        <div className="flex items-center justify-center gap-2 text-muted-foreground">
                          <AlertTriangle className="w-5 h-5" />
                          <span className="font-medium">No Match Found</span>
                        </div>
                        <p className="text-sm text-muted-foreground">Confidence: {result.confidence}% - Below recognition threshold</p>
                        <Button variant="outline" className="w-full" onClick={() => setAddDialogOpen(true)}>
                          <UserPlus className="w-4 h-4 mr-2" />
                          Add to Criminal Database
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <Card className="bg-background border-border">
                  <CardContent className="p-8 text-center">
                    <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Upload an image and click "Run Face Recognition" to see results</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add to Database Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Criminal Record</DialogTitle>
            <DialogDescription>Fill out the details to add the person to the database</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Name *</Label>
              <Input id="name" value={newCriminal.name} onChange={(e) => setNewCriminal({ ...newCriminal, name: e.target.value })} placeholder="Full name" />
            </div>
            <div>
              <Label htmlFor="age">Age *</Label>
              <Input id="age" type="number" value={newCriminal.age} onChange={(e) => setNewCriminal({ ...newCriminal, age: e.target.value })} placeholder="Age" />
            </div>
            <div>
              <Label htmlFor="charges">Charges</Label>
              <Input id="charges" value={newCriminal.charges} onChange={(e) => setNewCriminal({ ...newCriminal, charges: e.target.value })} placeholder="e.g., Robbery, Assault (comma separated)" />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Input id="description" value={newCriminal.description} onChange={(e) => setNewCriminal({ ...newCriminal, description: e.target.value })} placeholder="Description and notes" />
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <select id="status" value={newCriminal.status} onChange={(e) => setNewCriminal({ ...newCriminal, status: e.target.value as any })} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                <option value="active">Active</option>
                <option value="captured">Captured</option>
                <option value="deceased">Deceased</option>
              </select>
            </div>
            <Button variant="hero" className="w-full" onClick={handleAddToDatabase}>Confirm Add</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
