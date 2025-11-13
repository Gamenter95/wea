
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { ArrowLeft, Download, QrCode } from "lucide-react";
import QRCode from "qrcode";

export default function MyQRCode() {
  const [, setLocation] = useLocation();
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");

  const { data: user } = useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/auth/me");
      return await res.json();
    },
  });

  useEffect(() => {
    if (user?.phone) {
      generateQRCode(user.phone);
    }
  }, [user]);

  const generateQRCode = async (phone: string) => {
    try {
      const qrData = JSON.stringify({
        type: "weoo_payment",
        phone: phone,
      });

      const canvas = document.createElement("canvas");
      await QRCode.toCanvas(canvas, qrData, {
        width: 400,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
      });

      const ctx = canvas.getContext("2d");
      if (ctx) {
        const logoSize = 80;
        const x = (canvas.width - logoSize) / 2;
        const y = (canvas.height - logoSize) / 2;

        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(x - 5, y - 5, logoSize + 10, logoSize + 10);

        const logo = new Image();
        logo.crossOrigin = "anonymous";
        logo.onload = () => {
          ctx.drawImage(logo, x, y, logoSize, logoSize);
          setQrCodeUrl(canvas.toDataURL());
        };
        logo.onerror = () => {
          setQrCodeUrl(canvas.toDataURL());
        };
        logo.src = "/attached_assets/generated_images/WeooWallet_logo_icon_7f926dfd.png";
      } else {
        setQrCodeUrl(canvas.toDataURL());
      }
    } catch (error) {
      console.error("Error generating QR code:", error);
    }
  };

  const downloadQR = () => {
    if (!qrCodeUrl) return;
    const link = document.createElement("a");
    link.href = qrCodeUrl;
    link.download = `WeooWallet_${user?.wwid || "QR"}.png`;
    link.click();
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-md mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLocation("/dashboard")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">My Payment QR</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="h-5 w-5" />
              Your Payment QR Code
            </CardTitle>
            <CardDescription>
              Share this QR code to receive payments
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {user && (
              <div className="bg-muted/50 p-4 rounded-lg text-sm">
                <div className="text-center">
                  <p className="text-muted-foreground">Receiving as</p>
                  <p className="font-bold text-lg">{user.username}</p>
                  <p className="text-primary font-mono">{user.wwid}</p>
                  <p className="text-sm text-muted-foreground">{user.phone}</p>
                </div>
              </div>
            )}

            {qrCodeUrl && (
              <div className="text-center space-y-4">
                <div className="inline-block p-4 bg-white rounded-lg border-2 border-primary/20">
                  <img
                    src={qrCodeUrl}
                    alt="Payment QR Code"
                    className="mx-auto"
                    style={{ width: "300px", height: "300px" }}
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  Scan this QR code with WeooWallet to send money
                </p>
                <Button
                  onClick={downloadQR}
                  className="w-full"
                  size="lg"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download QR Code
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
