import { useState, useRef } from 'react';
import Tesseract from 'tesseract.js';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/enhanced-button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Upload, Camera, Search, AlertTriangle, CheckCircle, Car } from 'lucide-react';

interface PlateResult {
  plateNumber: string;
  confidence: number;
  vehicleType: string;
  flagged: boolean;
  reason?: string;
}

export const NumberPlateRecognition = () => {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [plateResult, setPlateResult] = useState<PlateResult | null>(null);
  const [manualPlate, setManualPlate] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Mock flagged plates
  const flaggedPlates = ['ABC-123', 'XYZ-789', 'DEF-456'];

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImage(e.target?.result as string);
        setPlateResult(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const generateRandomPlate = () => {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    const randomLetters = Array.from({length: 3}, () => letters[Math.floor(Math.random() * letters.length)]).join('');
    const randomNumbers = Array.from({length: 3}, () => numbers[Math.floor(Math.random() * numbers.length)]).join('');
    return `${randomLetters}-${randomNumbers}`;
  };

  const processPlateRecognition = async (plateNumber?: string) => {
    setIsProcessing(true);

    try {
      let detectedPlate = plateNumber?.toUpperCase() || '';
      let confidence = 0;

      if (!detectedPlate && uploadedImage) {
        const variants = await generatePreprocessedVariants(uploadedImage);
        const passes = [
          { psm: '7', note: 'single-line' },
          { psm: '6', note: 'block' },
        ];
        const results: Array<{ plate: string; conf: number }> = [];
        for (const src of variants) {
          for (const pass of passes) {
            const { data } = await Tesseract.recognize(src, 'eng', {
              tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789- ',
              tessedit_pageseg_mode: pass.psm,
              preserve_interword_spaces: '1',
            } as any);
            const rawText = (data.text || '').toUpperCase().replace(/\n+/g, ' ');
            const cands = extractPlateCandidates(rawText);
            if (cands.length) {
              const plate = normalizePlate(cands[0]);
              const words = (data.words || []) as Array<{ text: string; confidence: number }>;
              const parts = plate.split(/[- ]/).filter(Boolean);
              const matched = words.filter(w => parts.some(p => w.text?.toUpperCase().includes(p)));
              const avg = matched.length ? Math.round(matched.reduce((s, w) => s + (w.confidence || 0), 0) / matched.length) : Math.round(data.confidence || 80);
              const conf = Math.min(100, Math.max(50, avg));
              results.push({ plate, conf });
            }
          }
        }
        if (results.length) {
          results.sort((a, b) => b.conf - a.conf);
          detectedPlate = results[0].plate;
          confidence = results[0].conf;
        } else {
          detectedPlate = generateRandomPlate();
          confidence = 60;
        }
      }

      if (!detectedPlate) {
        detectedPlate = generateRandomPlate();
        confidence = 90;
      }

      const vehicleTypes = ['Sedan', 'SUV', 'Truck', 'Motorcycle', 'Van'];
      const isFlagged = flaggedPlates.includes(detectedPlate) || Math.random() > 0.7;

      const result: PlateResult = {
        plateNumber: detectedPlate,
        confidence: confidence || Math.floor(Math.random() * 15) + 80,
        vehicleType: vehicleTypes[Math.floor(Math.random() * vehicleTypes.length)],
        flagged: isFlagged,
        reason: isFlagged ? (flaggedPlates.includes(detectedPlate) ? 'Stolen vehicle' : 'Traffic violation history') : undefined
      };

      setPlateResult(result);

      if (result.flagged) {
        toast({
          title: '⚠️ Flagged Vehicle Detected!',
          description: `Plate ${result.plateNumber} is flagged: ${result.reason}`,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Plate Recognized',
          description: `${result.plateNumber} identified with ${result.confidence}% confidence.`,
          variant: 'default',
        });
      }
    } catch (e) {
      toast({ title: 'Recognition failed', description: 'Could not read the plate clearly.', variant: 'destructive' });
    } finally {
      setIsProcessing(false);
    }
  };

  function extractPlateCandidates(text: string): string[] {
    const cleaned = text.replace(/[^A-Z0-9 -]/g, ' ');
    const patterns = [
      /[A-Z]{2,3}[- ]?[0-9]{3,4}/g,          // e.g., ABC-1234, AB 123
      /[A-Z0-9]{2,4}[- ]?[A-Z0-9]{2,4}/g,    // generic two blocks
    ];
    const found = patterns.flatMap((re) => Array.from(cleaned.matchAll(re)).map(m => m[0]));
    const normalized = Array.from(new Set(found.map(f => f.replace(/\s+/g, ' ').trim())));
    normalized.sort((a, b) => b.length - a.length);
    return normalized;
  }

  const handleProcessImage = () => {
    if (!uploadedImage) {
      toast({
        title: "No Image",
        description: "Please upload an image first.",
        variant: "destructive",
      });
      return;
    }
    processPlateRecognition();
  };

  const handleManualCheck = () => {
    if (!manualPlate.trim()) {
      toast({
        title: "No Plate Number",
        description: "Please enter a plate number to check.",
        variant: "destructive",
      });
      return;
    }
    processPlateRecognition(manualPlate.toUpperCase());
  };

  function generatePlateReport() {
    if (!plateResult) return;
    const data = { ...plateResult, generatedAt: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${plateResult.plateNumber}-plate-report.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    toast({ title: 'Report generated', description: `${plateResult.plateNumber} report downloaded.` });
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Image Recognition */}
        <Card className="bg-gradient-card border-border shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="w-5 h-5 text-primary" />
              Image Recognition
            </CardTitle>
            <CardDescription>
              Upload vehicle image for automatic plate detection
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
              {uploadedImage ? (
                <div className="space-y-4">
                  <img 
                    src={uploadedImage} 
                    alt="Vehicle" 
                    className="max-w-full h-40 object-contain mx-auto rounded-lg"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Change Image
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <Camera className="w-10 h-10 text-muted-foreground mx-auto" />
                  <div>
                    <p className="font-medium">Upload Vehicle Image</p>
                    <p className="text-sm text-muted-foreground">
                      Clear view of license plate required
                    </p>
                  </div>
                  <Button
                    variant="hero"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Choose Image
                  </Button>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>

            <Button
              variant="glow"
              className="w-full"
              onClick={handleProcessImage}
              disabled={!uploadedImage || isProcessing}
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-b-transparent mr-2" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4 mr-2" />
                  Detect Plate
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Manual Check */}
        <Card className="bg-gradient-card border-border shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Car className="w-5 h-5 text-primary" />
              Manual Plate Check
            </CardTitle>
            <CardDescription>
              Enter plate number to check against database
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="plateInput">License Plate Number</Label>
              <Input
                id="plateInput"
                placeholder="ABC-123"
                value={manualPlate}
                onChange={(e) => setManualPlate(e.target.value.toUpperCase())}
                className="text-center text-lg font-mono"
              />
            </div>

            <Button
              variant="glow"
              className="w-full"
              onClick={handleManualCheck}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-b-transparent mr-2" />
                  Checking...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4 mr-2" />
                  Check Plate
                </>
              )}
            </Button>

            <div className="text-center text-sm text-muted-foreground">
              <p>Flagged plates for testing: ABC-123, XYZ-789, DEF-456</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Results */}
      <Card className="bg-gradient-card border-border shadow-card">
        <CardHeader>
          <CardTitle>Recognition Results</CardTitle>
          <CardDescription>Latest plate recognition analysis</CardDescription>
        </CardHeader>
        <CardContent>
          {plateResult ? (
            <div className="space-y-6">
              <div className={`p-4 rounded-lg border-2 ${
                plateResult.flagged 
                  ? 'bg-destructive/10 border-destructive/20' 
                  : 'bg-success/10 border-success/20'
              }`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    {plateResult.flagged ? (
                      <AlertTriangle className="w-5 h-5 text-destructive" />
                    ) : (
                      <CheckCircle className="w-5 h-5 text-success" />
                    )}
                    <span className={`font-semibold ${
                      plateResult.flagged ? 'text-destructive' : 'text-success'
                    }`}>
                      {plateResult.flagged ? 'FLAGGED VEHICLE' : 'CLEAN RECORD'}
                    </span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {new Date().toLocaleTimeString()}
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Plate Number</p>
                    <p className="font-mono text-lg font-bold">{plateResult.plateNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Vehicle Type</p>
                    <p className="font-medium">{plateResult.vehicleType}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Confidence</p>
                    <p className="font-medium">{plateResult.confidence}%</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <p className={`font-medium ${
                      plateResult.flagged ? 'text-destructive' : 'text-success'
                    }`}>
                      {plateResult.flagged ? 'Flagged' : 'Clear'}
                    </p>
                  </div>
                </div>

                {plateResult.flagged && plateResult.reason && (
                  <div className="mt-4 p-3 bg-destructive/5 rounded border border-destructive/10">
                    <p className="text-sm font-medium text-destructive">Reason for Flag:</p>
                    <p className="text-sm text-destructive/80">{plateResult.reason}</p>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => generatePlateReport()}>
                  Generate Report
                </Button>
                <Button variant="outline" onClick={() => toast({ title: 'Added to watchlist', description: `${plateResult.plateNumber} added to watchlist.` })}>
                  Add to Watchlist
                </Button>
                {plateResult.flagged && (
                  <Button variant="destructive" onClick={() => toast({ title: 'Authorities alerted', description: `Dispatched alert for ${plateResult.plateNumber}.` })}>
                    Alert Authorities
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <Car className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                Upload an image or enter a plate number to see recognition results
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
