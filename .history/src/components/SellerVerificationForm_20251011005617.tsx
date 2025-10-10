import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Upload, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface VerificationData {
  business_name: string;
  passport_number: string;
  passport_image_url: string;
}

export const SellerVerificationForm = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [verificationData, setVerificationData] = useState<VerificationData>({
    business_name: '',
    passport_number: '',
    passport_image_url: ''
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Please upload a valid image (JPEG, PNG) or PDF file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    setSelectedFile(file);
    
    // Create preview URL for images
    if (file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }
  };

  const uploadDocument = async (file: File): Promise<string> => {
    if (!user) throw new Error('User not authenticated');

    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/${Date.now()}.${fileExt}`;
    const filePath = `verification/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('seller-ids')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      throw new Error(`Upload failed: ${uploadError.message}`);
    }

    return filePath;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('Please log in to submit verification');
      return;
    }

    if (!selectedFile) {
      toast.error('Please select a passport document to upload');
      return;
    }

    if (!verificationData.passport_number.trim()) {
      toast.error('Please enter your passport number');
      return;
    }

    setLoading(true);
    setUploading(true);

    try {
      // Upload document
      const documentPath = await uploadDocument(selectedFile);
      
      // Get public URL for storage
      const { data: urlData } = supabase.storage
        .from('seller-ids')
        .getPublicUrl(documentPath);

      // Check if seller verification already exists
      const { data: existingVerification } = await supabase
        .from('sellers')
        .select('id, verification_status')
        .eq('user_id', user.id)
        .single();

      if (existingVerification) {
        if (existingVerification.verification_status === 'approved') {
          toast.error('You are already verified as a seller');
          return;
        }
        
        if (existingVerification.verification_status === 'pending') {
          toast.error('Your verification is already pending review');
          return;
        }
      }

      // Insert or update verification data
      const verificationPayload = {
        user_id: user.id,
        business_name: verificationData.business_name.trim() || null,
        passport_number: verificationData.passport_number.trim(),
        passport_image_url: urlData.publicUrl,
        verification_status: 'pending',
        verified: false
      };

      if (existingVerification) {
        // Update existing verification
        const { error: updateError } = await supabase
          .from('sellers')
          .update(verificationPayload)
          .eq('user_id', user.id);

        if (updateError) throw updateError;
      } else {
        // Insert new verification
        const { error: insertError } = await supabase
          .from('sellers')
          .insert(verificationPayload);

        if (insertError) throw insertError;
      }

      toast.success('Verification submitted successfully! We will review your documents and notify you of the status.');
      
      // Reset form
      setVerificationData({
        business_name: '',
        passport_number: '',
        passport_image_url: ''
      });
      setSelectedFile(null);
      setPreviewUrl(null);
      
      // Reset file input
      const fileInput = document.getElementById('passport-document') as HTMLInputElement;
      if (fileInput) fileInput.value = '';

    } catch (error: any) {
      toast.error(`Failed to submit verification: ${error.message}`);
    } finally {
      setLoading(false);
      setUploading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5" />
          Seller Verification
        </CardTitle>
        <CardDescription>
          Verify your identity to become a trusted seller on our marketplace
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <Alert className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Important:</strong> Your verification documents are securely stored and will only be used for identity verification. 
            We will review your submission within 1-2 business days.
          </AlertDescription>
        </Alert>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="business-name">Business Name (Optional)</Label>
            <Input
              id="business-name"
              placeholder="Enter your business name"
              value={verificationData.business_name}
              onChange={(e) => setVerificationData(prev => ({
                ...prev,
                business_name: e.target.value
              }))}
            />
            <p className="text-xs text-muted-foreground">
              Leave blank if you're selling as an individual
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="passport-number">Passport Number *</Label>
            <Input
              id="passport-number"
              placeholder="Enter your passport number"
              value={verificationData.passport_number}
              onChange={(e) => setVerificationData(prev => ({
                ...prev,
                passport_number: e.target.value
              }))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="passport-document">Passport Document *</Label>
            <div className="space-y-4">
              <Input
                id="passport-document"
                type="file"
                accept="image/jpeg,image/jpg,image/png,application/pdf"
                onChange={handleFileSelect}
                required
                className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/80"
              />
              
              {previewUrl && (
                <div className="mt-4">
                  <p className="text-sm font-medium mb-2">Document Preview:</p>
                  <img
                    src={previewUrl}
                    alt="Document preview"
                    className="max-w-full h-48 object-contain border rounded-lg"
                  />
                </div>
              )}
              
              {selectedFile && !previewUrl && (
                <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                  <FileText className="h-4 w-4" />
                  <span className="text-sm">{selectedFile.name}</span>
                </div>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Upload a clear photo of your passport or a PDF scan. Max file size: 5MB
            </p>
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={loading || uploading}
          >
            {uploading ? (
              <>
                <Upload className="h-4 w-4 mr-2 animate-spin" />
                Uploading Document...
              </>
            ) : loading ? (
              'Submitting Verification...'
            ) : (
              'Submit Verification'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
