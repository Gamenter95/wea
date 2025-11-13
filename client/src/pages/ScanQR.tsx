
import { useState, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { ArrowLeft, Camera, Upload } from "lucide-react";
import jsQR from "jsqr";

export default function ScanQR() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [scannedPhone, setScannedPhone] = useState("");
  const [amount, setAmount] = useState("");
  const [spin, setSpin] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationRef = useRef<number | null>(null);

  const { data: user } = useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/auth/me");
      return await res.json();
    },
  });

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setIsScanning(true);
        scanQRCode();
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Camera Error",
        description: "Unable to access camera. Please check permissions.",
      });
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    setIsScanning(false);
  };

  const scanQRCode = () => {
    if (!videoRef.current || !canvasRef.current || !isScanning) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    if (!ctx) return;

    if (video.readyState === video.HAVE_ENOUGH_DATA) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height);

      if (code) {
        try {
          const data = JSON.parse(code.data);
          if (data.type === "weoo_payment" && data.phone) {
            setScannedPhone(data.phone);
            stopCamera();
            toast({
              title: "QR Code Scanned",
              description: "Phone number detected. Enter amount to proceed.",
            });
            return;
          }
        } catch (e) {
          // Invalid QR code format
        }
      }
    }

    animationRef.current = requestAnimationFrame(scanQRCode);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const img = new Image();
    const reader = new FileReader();

    reader.onload = (event) => {
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height);

        if (code) {
          try {
            const data = JSON.parse(code.data);
            if (data.type === "weoo_payment" && data.phone) {
              setScannedPhone(data.phone);
              toast({
                title: "QR Code Scanned",
                description: "Phone number detected. Enter amount to proceed.",
              });
            } else {
              toast({
                variant: "destructive",
                title: "Invalid QR Code",
                description: "This is not a valid WeooWallet payment QR code.",
              });
            }
          } catch (e) {
            toast({
              variant: "destructive",
              title: "Invalid QR Code",
              description: "Unable to read QR code data.",
            });
          }
        } else {
          toast({
            variant: "destructive",
            title: "No QR Code Found",
            description: "Could not find a QR code in the image.",
          });
        }
      };
      img.src = event.target?.result as string;
    };

    reader.readAsDataURL(file);
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const payMutation = useMutation({
    mutationFn: async (data: { recipientPhone: string; amount: number; spin: string }) => {
      const res = await apiRequest("POST", "/api/transactions/pay-to-user", data);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Payment Successful",
        description: "Money sent successfully!",
      });
      setLocation("/dashboard");
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Payment Failed",
        description: error.message || "Failed to send payment",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scannedPhone) {
      toast({
        variant: "destructive",
        title: "No Recipient",
        description: "Please scan a QR code first.",
      });
      return;
    }
    payMutation.mutate({
      recipientPhone: scannedPhone,
      amount: parseFloat(amount),
      spin,
    });
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-md mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              stopCamera();
              setLocation("/dashboard");
            }}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Scan QR to Pay</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5" />
              Scan Payment QR Code
            </CardTitle>
            <CardDescription>
              Scan a WeooWallet QR code to make payment
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!scannedPhone && !isScanning && (
              <div className="space-y-3">
                <Button
                  onClick={startCamera}
                  className="w-full"
                  size="lg"
                >
                  <Camera className="h-4 w-4 mr-2" />
                  Open Camera
                </Button>
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      Or
                    </span>
                  </div>
                </div>
                <label htmlFor="qr-upload">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    size="lg"
                    onClick={() => document.getElementById("qr-upload")?.click()}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload QR Image
                  </Button>
                  <input
                    id="qr-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
            )}

            {isScanning && (
              <div className="space-y-3">
                <div className="relative">
                  <video
                    ref={videoRef}
                    className="w-full rounded-lg border-2 border-primary/20"
                    playsInline
                  />
                  <canvas ref={canvasRef} className="hidden" />
                </div>
                <Button
                  onClick={stopCamera}
                  variant="outline"
                  className="w-full"
                >
                  Cancel Scanning
                </Button>
              </div>
            )}

            {scannedPhone && (
              <form onSubmit={handleSubmit} className="space-y-4">
                {user && (
                  <div className="bg-muted/50 p-4 rounded-lg text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Available Balance:</span>
                      <span className="font-bold text-lg">₹{user.balance}</span>
                    </div>
                  </div>
                )}

                <div className="bg-green-500/10 p-4 rounded-lg border border-green-500/20">
                  <p className="text-sm text-muted-foreground">Paying to:</p>
                  <p className="font-mono font-bold">{scannedPhone}</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amount">Amount (₹)</Label>
                  <Input
                    id="amount"
                    type="number"
                    min="1"
                    step="0.01"
                    placeholder="Enter amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                    className="h-12 text-lg"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="spin">S-PIN (4 digits)</Label>
                  <Input
                    id="spin"
                    type="password"
                    inputMode="numeric"
                    maxLength={4}
                    placeholder="Enter your S-PIN"
                    value={spin}
                    onChange={(e) => setSpin(e.target.value.replace(/\D/g, ""))}
                    required
                    className="h-12"
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setScannedPhone("")}
                    className="flex-1"
                  >
                    Scan Again
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1"
                    size="lg"
                    disabled={payMutation.isPending}
                  >
                    {payMutation.isPending ? "Processing..." : "Send Payment"}
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
