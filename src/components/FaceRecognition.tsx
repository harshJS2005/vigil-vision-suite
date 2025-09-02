import { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/enhanced-button';
import { useToast } from '@/hooks/use-toast';
import { Upload, Camera, Search, AlertTriangle, CheckCircle } from 'lucide-react';
import { mockCriminals } from '@/data/mockData';
import { Criminal } from '@/types';

export const FaceRecognition = () => {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recognitionResult, setRecognitionResult] = useState<{
    match: Criminal | null;
    confidence: number;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImage(e.target?.result as string);
        setRecognitionResult(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProcessImage = async () => {
    if (!uploadedImage) {
      toast({
        title: "No Image",
        description: "Please upload an image first.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    
    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mock recognition result
    const randomMatch = Math.random() > 0.5;
    const result = randomMatch 
      ? {
          match: mockCriminals[Math.floor(Math.random() * mockCriminals.length)],
          confidence: Math.floor(Math.random() * 30) + 70 // 70-100%
        }
      : {
          match: null,
          confidence: Math.floor(Math.random() * 40) + 10 // 10-50%
        };

    setRecognitionResult(result);
    setIsProcessing(false);

    if (result.match) {
      toast({
        title: "Match Found!",
        description: `Criminal identified with ${result.confidence}% confidence.`,
        variant: "default",
      });
    } else {
      toast({
        title: "No Match",
        description: "No matching criminal found in database.",
        variant: "destructive",
      });
    }
  };

  const handleAddToDatabase = () => {
    toast({
      title: "Add to Database",
      description: "Feature to add new criminal record would be implemented here.",
      variant: "default",
    });
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-card border-border shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-primary" />
            Face Recognition System
          </CardTitle>
          <CardDescription>
            Upload an image to identify individuals using our AI-powered facial recognition
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Upload Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                {uploadedImage ? (
                  <div className="space-y-4">
                    <img 
                      src={uploadedImage} 
                      alt="Uploaded" 
                      className="max-w-full h-48 object-contain mx-auto rounded-lg"
                    />
                    <Button
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Different Image
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Upload className="w-12 h-12 text-muted-foreground mx-auto" />
                    <div>
                      <p className="text-lg font-medium">Upload Image for Recognition</p>
                      <p className="text-sm text-muted-foreground">
                        Supports JPG, PNG files up to 10MB
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

            {/* Results Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Recognition Results</h3>
              
              {recognitionResult ? (
                <Card className="bg-background border-border">
                  <CardContent className="p-4">
                    {recognitionResult.match ? (
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 text-success">
                          <CheckCircle className="w-5 h-5" />
                          <span className="font-medium">Match Found</span>
                        </div>
                        
                        <div className="flex gap-4">
                          <img 
                            src={recognitionResult.match.image} 
                            alt={recognitionResult.match.name}
                            className="w-16 h-16 rounded-lg object-cover"
                          />
                          <div className="flex-1">
                            <h4 className="font-semibold">{recognitionResult.match.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              ID: {recognitionResult.match.identificationNumber}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Status: {recognitionResult.match.status}
                            </p>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span>Confidence Level</span>
                            <span className="font-medium">{recognitionResult.confidence}%</span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2">
                            <div 
                              className="bg-success h-2 rounded-full transition-all duration-300"
                              style={{ width: `${recognitionResult.confidence}%` }}
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <p className="text-sm font-medium">Charges:</p>
                          <div className="flex flex-wrap gap-1">
                            {recognitionResult.match.charges.map((charge, index) => (
                              <span
                                key={index}
                                className="px-2 py-1 bg-destructive/10 text-destructive text-xs rounded"
                              >
                                {charge}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4 text-center">
                        <div className="flex items-center justify-center gap-2 text-muted-foreground">
                          <AlertTriangle className="w-5 h-5" />
                          <span className="font-medium">No Match Found</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Confidence: {recognitionResult.confidence}% - Below recognition threshold
                        </p>
                        <Button 
                          variant="outline" 
                          className="w-full"
                          onClick={handleAddToDatabase}
                        >
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
                    <p className="text-muted-foreground">
                      Upload an image and click "Run Face Recognition" to see results
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};